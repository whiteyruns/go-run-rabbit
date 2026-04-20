import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildNoirState, buildNoirSummary } from "@/lib/oddyssey-noir/pipeline";
import { buildNoirWeekOverWeek, findLatestNoirPullForDate, loadNoirReportOverlay } from "@/lib/oddyssey-noir/history";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;

  // If the caller asked for a specific historical date, find that
  // date's CSV on disk — latest.csv only holds the most recent pull,
  // which for historical weekends won't have any rows for the target.
  let csv: string;
  let csvName = "latest.csv";
  if (date) {
    const dated = findLatestNoirPullForDate(date);
    if (dated) {
      try { csv = fs.readFileSync(dated, "utf-8"); csvName = path.basename(dated); }
      catch { return NextResponse.json({ status: "error", message: `Could not read ${path.basename(dated)}` }, { status: 500 }); }
    } else {
      // No date-specific CSV — fall back to latest.csv (may still match
      // if date is today / very recent).
      try { csv = fs.readFileSync(LATEST_CSV, "utf-8"); }
      catch { return NextResponse.json({ status: "error", message: "No CSV on disk for that date." }, { status: 400 }); }
    }
  } else {
    try { csv = fs.readFileSync(LATEST_CSV, "utf-8"); }
    catch { return NextResponse.json({ status: "error", message: "No CSV yet — run a Noir pull first." }, { status: 400 }); }
  }

  const { state } = buildNoirState(csvName, csv);
  const summary = buildNoirSummary(state, date);
  if (!summary) return NextResponse.json({ status: "error", message: "No data for that date." }, { status: 400 });
  const wow = buildNoirWeekOverWeek(summary);
  const report = loadNoirReportOverlay(summary.date);
  const priorReport = loadNoirReportOverlay(wow.prior_date);
  return NextResponse.json({ status: "ok", wow, summary, report, prior_report: priorReport });
}
