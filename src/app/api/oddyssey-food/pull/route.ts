import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-food/pulls");
const LATEST_META = path.join(PULLS_DIR, "latest.json");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");

interface PullMeta {
  filename: string;
  path: string;
  pulled_at: string;
  date: string;
  from: string;
  until: string;
  size_bytes: number;
}

async function readMeta(): Promise<PullMeta | null> {
  try {
    const raw = await fs.readFile(LATEST_META, "utf-8");
    return JSON.parse(raw) as PullMeta;
  } catch {
    return null;
  }
}

async function readLatestCsv(): Promise<string | null> {
  try {
    return await fs.readFile(LATEST_CSV, "utf-8");
  } catch {
    return null;
  }
}

// GET — return metadata about the most recent pull + optional CSV body
export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeCsv = url.searchParams.get("csv") === "1";

  const meta = await readMeta();
  if (!meta) {
    return NextResponse.json({ status: "empty", meta: null, csv: null });
  }
  const csv = includeCsv ? await readLatestCsv() : null;
  return NextResponse.json({ status: "ok", meta, csv });
}

// POST — trigger a fresh pull. Returns new metadata + CSV body.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const date: string | undefined = body?.date;

  const cmd = "npx";
  const args = ["tsx", "scripts/oddyssey-food-pull.ts"];
  if (date) args.push(`--date=${date}`);

  const result = await new Promise<{ code: number; stdout: string; stderr: string }>(
    (resolve) => {
      const proc = spawn(cmd, args, {
        cwd: process.cwd(),
        env: { ...process.env },
      });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("close", (code) =>
        resolve({ code: code ?? 0, stdout, stderr })
      );
    }
  );

  if (result.code !== 0) {
    return NextResponse.json(
      {
        status: "error",
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      },
      { status: 500 }
    );
  }

  const meta = await readMeta();
  const csv = await readLatestCsv();
  return NextResponse.json({
    status: "ok",
    meta,
    csv,
    log: result.stdout,
  });
}
