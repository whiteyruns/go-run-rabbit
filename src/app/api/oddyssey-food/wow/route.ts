import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildStateFromCsv } from "@/lib/oddyssey-food/build-state";
import { buildWeekOverWeek } from "@/lib/oddyssey-food/history";
import { buildSummary } from "@/lib/oddyssey-food/summary";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-food/pulls");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;
  const csvParam = url.searchParams.get("csv");

  // Source: either an explicit CSV body in POST, or the latest pulled file
  let csv: string | null = csvParam;
  if (!csv) {
    try {
      csv = fs.readFileSync(path.join(PULLS_DIR, "latest.csv"), "utf-8");
    } catch {
      csv = null;
    }
  }

  if (!csv) {
    return NextResponse.json({ status: "error", message: "No data available." }, { status: 400 });
  }

  const { state } = buildStateFromCsv("latest.csv", csv);
  const summary = buildSummary(state, date);
  if (!summary) {
    return NextResponse.json({ status: "error", message: "No summary for that date." }, { status: 400 });
  }
  const wow = buildWeekOverWeek(summary);
  return NextResponse.json({ status: "ok", wow, summary_date: summary.date });
}

// POST variant accepts CSV body so the client can compute WoW against
// the browser's localStorage data (which may include walk-ups / uploads
// that aren't on disk yet).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { csv?: string; date?: string };
  const csv = body.csv;
  if (!csv) {
    // Fall back to GET behavior
    const req = new Request(`${request.url}${body.date ? `?date=${body.date}` : ""}`);
    return GET(req);
  }

  const { state } = buildStateFromCsv("client-state.csv", csv);
  const summary = buildSummary(state, body.date);
  if (!summary) {
    return NextResponse.json({ status: "error", message: "No summary for that date." }, { status: 400 });
  }
  const wow = buildWeekOverWeek(summary);
  return NextResponse.json({ status: "ok", wow, summary_date: summary.date });
}
