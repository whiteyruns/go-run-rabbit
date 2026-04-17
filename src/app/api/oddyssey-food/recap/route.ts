import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseCSV } from "@/lib/oddyssey-food/csv-parser";
import { buildStateFromCsv } from "@/lib/oddyssey-food/build-state";
import { buildRecap } from "@/lib/oddyssey-food/recap";
import { recapSubject, renderRecapHtml } from "@/lib/oddyssey-food/recap-html";

export const runtime = "nodejs";

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-food/pulls");
const LATEST_CSV = path.join(PULLS_DIR, "latest.csv");

const DEFAULT_RECIPIENTS = [
  "kwhite@consultant.area15.com",
  "bpereyda@area15.com",
];

interface SendBody {
  date?: string;
  recipients?: string[];
  test?: boolean; // if true, only send to Keith
  csv?: string; // optional override — use this CSV instead of latest pull
}

function loadLatestCsv(): string | null {
  try {
    return fs.readFileSync(LATEST_CSV, "utf-8");
  } catch {
    return null;
  }
}

function loadMetadata() {
  try {
    const meta = JSON.parse(
      fs.readFileSync(path.join(PULLS_DIR, "latest.json"), "utf-8")
    );
    return meta;
  } catch {
    return null;
  }
}

// GET — preview the HTML (no send). Handy for iterating on the template.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;

  const csv = loadLatestCsv();
  if (!csv) {
    return NextResponse.json({ status: "error", message: "No CSV available — run a pull first." }, { status: 400 });
  }
  const meta = loadMetadata();
  const { state } = buildStateFromCsv(meta?.filename ?? "latest.csv", csv);
  const recap = buildRecap(state, date);
  if (!recap) {
    return NextResponse.json({ status: "error", message: "No data for that date." }, { status: 400 });
  }

  const html = renderRecapHtml(recap);
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

// POST — render + send via Resend
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SendBody;

  const csv = body.csv ?? loadLatestCsv();
  if (!csv) {
    return NextResponse.json({ status: "error", message: "No CSV available — run a pull first." }, { status: 400 });
  }
  const meta = loadMetadata();
  const { state } = buildStateFromCsv(meta?.filename ?? "latest.csv", csv);
  const recap = buildRecap(state, body.date);
  if (!recap) {
    return NextResponse.json({ status: "error", message: "No data for that date." }, { status: 400 });
  }

  const html = renderRecapHtml(recap);
  const subject = body.test
    ? `[TEST] ${recapSubject(recap)}`
    : recapSubject(recap);

  const recipients =
    body.recipients ?? (body.test ? ["kwhite@consultant.area15.com"] : DEFAULT_RECIPIENTS);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      status: "error",
      message: "RESEND_API_KEY not set on the server. (Recap rendered but not sent.)",
      preview_length: html.length,
      subject,
      recipients,
    }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error, data } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: recipients,
      subject,
      html,
    });
    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message, recipients },
        { status: 500 }
      );
    }
    return NextResponse.json({
      status: "ok",
      resend_id: data?.id,
      subject,
      recipients,
      date: recap.date,
      stats: recap.stats,
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: String(e) },
      { status: 500 }
    );
  }
}

// Keeps the build aware of parseCSV import path (imported by build-state indirectly)
void parseCSV;
