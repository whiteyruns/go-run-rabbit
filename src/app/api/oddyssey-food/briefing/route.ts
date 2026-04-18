import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildStateFromCsv } from "@/lib/oddyssey-food/build-state";
import { buildWeekOverWeek, loadManorReportOverlay } from "@/lib/oddyssey-food/history";
import { buildSummary } from "@/lib/oddyssey-food/summary";
import { buildBriefing } from "@/lib/oddyssey-sessions/briefing";
import { briefingSubject, renderBriefingHtml } from "@/lib/oddyssey-sessions/briefing-html";
import { loadNotes } from "@/lib/oddyssey-sessions/notes-store";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-food/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");
const DEFAULT_RECIPIENTS = ["kwhite@consultant.area15.com", "bpereyda@area15.com"];

function buildInputForDate(date?: string) {
  let csv: string;
  try {
    csv = fs.readFileSync(LATEST_CSV, "utf-8");
  } catch {
    return null;
  }
  const { state } = buildStateFromCsv("latest.csv", csv);
  const summary = buildSummary(state, date);
  if (!summary) return null;
  const wow = buildWeekOverWeek(summary);
  const report = loadManorReportOverlay(summary.date);
  const notes = loadNotes("manor", summary.date);

  const bullets = buildBriefing({
    venue: "manor",
    date_label: summary.date_label,
    totals: report.available ? report.totals : undefined,
    sessions: report.available ? report.sessions : undefined,
    admissions: summary.tickets_sold,
    fallback_tickets: summary.tickets_sold,
    fallback_revenue: summary.revenue,
    fallback_capacity_percent: summary.capacity_percent,
    food_by_item: summary.food.by_item,
    vip_parties: summary.food.vip_parties,
    note_parties: summary.food.note_parties,
    walkups: summary.food.walkups,
    wow: {
      available: wow.available,
      prior_date_label: wow.prior_date_label,
      tickets: wow.deltas.tickets,
      revenue: wow.deltas.revenue,
      tickets_prior: wow.prior?.tickets,
    },
  });

  return {
    venue: "manor" as const,
    date_label: summary.date_label,
    bullets,
    notes: notes.notes,
    notes_updated_at: notes.updated_at,
    totals: report.available ? report.totals : undefined,
    admissions: summary.tickets_sold,
    fallback_tickets: summary.tickets_sold,
    fallback_revenue: summary.revenue,
    dashboard_url: "https://gorunrabbit.com/oddyssey-manor/admin/food/summary",
    pulled_at: summary.source.pulled_at,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;
  const input = buildInputForDate(date);
  if (!input) return NextResponse.json({ status: "error", message: "No data" }, { status: 400 });
  // ?format=json returns the bullet list so the Summary page can show them
  if (url.searchParams.get("format") === "json") {
    return NextResponse.json({
      status: "ok",
      date_label: input.date_label,
      bullets: input.bullets,
      notes: input.notes,
      notes_updated_at: input.notes_updated_at,
    });
  }
  return new NextResponse(renderBriefingHtml(input), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { date?: string; test?: boolean; recipients?: string[] };
  const input = buildInputForDate(body.date);
  if (!input) return NextResponse.json({ status: "error", message: "No data" }, { status: 400 });

  const subject = body.test ? `[TEST] ${briefingSubject(input)}` : briefingSubject(input);
  const recipients = body.recipients ?? (body.test ? ["kwhite@consultant.area15.com"] : DEFAULT_RECIPIENTS);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ status: "error", message: "No Resend key", subject, recipients }, { status: 500 });
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error, data } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: recipients,
      subject,
      html: renderBriefingHtml(input),
    });
    if (error) return NextResponse.json({ status: "error", message: error.message, recipients }, { status: 500 });
    return NextResponse.json({ status: "ok", resend_id: data?.id, subject, recipients, bullets: input.bullets });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
