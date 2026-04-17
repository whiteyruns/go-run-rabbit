import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildNoirState, buildNoirSummary } from "@/lib/oddyssey-noir/pipeline";
import { buildNoirWeekOverWeek } from "@/lib/oddyssey-noir/history";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;
  let csv: string;
  try { csv = fs.readFileSync(LATEST_CSV, "utf-8"); }
  catch { return NextResponse.json({ status: "error", message: "No CSV yet — run a Noir pull first." }, { status: 400 }); }
  const { state } = buildNoirState("latest.csv", csv);
  const summary = buildNoirSummary(state, date);
  if (!summary) return NextResponse.json({ status: "error", message: "No data for that date." }, { status: 400 });
  const wow = buildNoirWeekOverWeek(summary);
  return NextResponse.json({ status: "ok", wow, summary });
}
