import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildNoirState, buildNoirSummary } from "@/lib/oddyssey-noir/pipeline";
import { buildNoirWeekOverWeek, loadNoirReportOverlay } from "@/lib/oddyssey-noir/history";
import { renderNoirRecapHtml, noirRecapSubject } from "@/lib/oddyssey-noir/recap-html";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");
const DEFAULT_RECIPIENTS = ["kwhite@consultant.area15.com", "bpereyda@area15.com"];

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
  const report = loadNoirReportOverlay(summary.date);
  const html = renderNoirRecapHtml(summary, wow, report);
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { date?: string; test?: boolean; recipients?: string[] };
  let csv: string;
  try { csv = fs.readFileSync(LATEST_CSV, "utf-8"); }
  catch { return NextResponse.json({ status: "error", message: "No CSV yet — run a Noir pull first." }, { status: 400 }); }

  const { state } = buildNoirState("latest.csv", csv);
  const summary = buildNoirSummary(state, body.date);
  if (!summary) return NextResponse.json({ status: "error", message: "No data for that date." }, { status: 400 });
  const wow = buildNoirWeekOverWeek(summary);
  const report = loadNoirReportOverlay(summary.date);
  const html = renderNoirRecapHtml(summary, wow, report);
  const subject = body.test ? `[TEST] ${noirRecapSubject(summary, report)}` : noirRecapSubject(summary, report);
  const recipients = body.recipients ?? (body.test ? ["kwhite@consultant.area15.com"] : DEFAULT_RECIPIENTS);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ status: "error", message: "RESEND_API_KEY missing", subject, recipients }, { status: 500 });
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error, data } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: recipients, subject, html,
    });
    if (error) return NextResponse.json({ status: "error", message: error.message, recipients }, { status: 500 });
    return NextResponse.json({ status: "ok", resend_id: data?.id, subject, recipients, date: summary.date, stats: { tickets: summary.tickets_sold, revenue: summary.revenue, capacity: summary.capacity_percent } });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
