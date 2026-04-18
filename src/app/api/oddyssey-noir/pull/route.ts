import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeCsv = url.searchParams.get("csv") === "1";
  try {
    const meta = JSON.parse(await fs.readFile(path.join(PULLS_DIR, "latest.json"), "utf-8"));
    const csv = includeCsv ? await fs.readFile(LATEST_CSV, "utf-8") : null;
    return NextResponse.json({ status: "ok", meta, csv });
  } catch {
    return NextResponse.json({ status: "empty", meta: null, csv: null });
  }
}

function runScript(scriptPath: string, args: string[]) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const proc = spawn("npx", ["tsx", scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const date: string | undefined = body?.date;

  // 1. Attendees pull
  const pullArgs = ["--venue=noir"];
  if (date) pullArgs.push(`--date=${date}`);
  const pullResult = await runScript("scripts/oddyssey-food-pull.ts", pullArgs);
  if (pullResult.code !== 0) {
    return NextResponse.json({ status: "error", stage: "attendees", stdout: pullResult.stdout, stderr: pullResult.stderr }, { status: 500 });
  }

  // 2. Session Summary Report scrape for fresh revenue/paid/free numbers
  const sessionsArgs = ["--venue=noir"];
  if (date) sessionsArgs.push(`--date=${date}`);
  const sessionsResult = await runScript("scripts/oddyssey-sessions-pull.ts", sessionsArgs);

  try {
    const meta = JSON.parse(await fs.readFile(path.join(PULLS_DIR, "latest.json"), "utf-8"));
    const csv = await fs.readFile(LATEST_CSV, "utf-8");
    return NextResponse.json({
      status: "ok", meta, csv, log: pullResult.stdout,
      sessions: { ok: sessionsResult.code === 0, log: sessionsResult.stdout, stderr: sessionsResult.stderr },
    });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
