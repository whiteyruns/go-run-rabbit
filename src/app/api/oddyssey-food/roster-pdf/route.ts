import { NextResponse } from "next/server";
import { renderRosterPdf } from "@/lib/oddyssey-food/render-roster-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEST_RECIPIENT = "keith@gorunrabbit.com";
// Production list once we flip the cron on. Wire in scheduler.ts after
// the test send confirms the pipeline end-to-end.
// const DEFAULT_RECIPIENTS = ["kwhite@consultant.area15.com", "bpereyda@area15.com"];

function todayInPT(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SendBody {
  date?: string;
  all?: boolean;
  recipients?: string[];
  test?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SendBody;
  const date = body.date ?? todayInPT();
  const all = body.all ?? false;
  const recipients = body.recipients ?? [TEST_RECIPIENT];

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { status: "error", message: "RESEND_API_KEY not configured" },
      { status: 500 },
    );
  }

  // Playwright runs in the same Node process as this handler, so always
  // navigate via plain HTTP loopback. Deriving from request.url breaks
  // when Cloudflare/Nginx forwards X-Forwarded-Proto=https — the URL
  // ends up as https://localhost:3102 and SSL fails on the loopback.
  const port = process.env.PORT ?? "3102";
  const origin = process.env.ROSTER_PDF_BASE_URL ?? `http://127.0.0.1:${port}`;

  let pdf: Buffer;
  let renderedFrom: string;
  try {
    const result = await renderRosterPdf({ baseUrl: origin, date, all });
    pdf = result.buffer;
    renderedFrom = result.url;
  } catch (e) {
    return NextResponse.json(
      { status: "error", phase: "render", message: String(e) },
      { status: 500 },
    );
  }

  const dateLabel = all ? "All dates" : prettyDate(date);
  const subject = body.test
    ? `[TEST] Manor Food Roster — ${dateLabel}`
    : `Manor Food Roster — ${dateLabel}`;
  const filename = `manor-roster-${all ? "all" : date}.pdf`;

  const html = `
    <p>Attached: auto-generated food allocation roster for <strong>${dateLabel}</strong>.</p>
    <p style="color:#666;font-size:13px">Snapshot from <code>latest.csv</code>.
    Manual UI overrides (location, package type, walk-ups) are not yet included —
    those still live in browser localStorage. Server-side persistence is a
    follow-up if needed.</p>
    <p style="color:#999;font-size:12px">Rendered from ${renderedFrom}</p>
  `;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error, data } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: recipients,
      subject,
      html,
      attachments: [
        {
          filename,
          content: pdf.toString("base64"),
        },
      ],
    });
    if (error) {
      return NextResponse.json(
        { status: "error", phase: "send", message: error.message, recipients },
        { status: 500 },
      );
    }
    return NextResponse.json({
      status: "ok",
      resend_id: data?.id,
      subject,
      recipients,
      bytes: pdf.length,
      rendered_from: renderedFrom,
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", phase: "send", message: String(e) },
      { status: 500 },
    );
  }
}

// Quick browser check: GET returns metadata about what would be sent.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? todayInPT();
  const all = url.searchParams.get("all") === "1";
  return NextResponse.json({
    status: "ready",
    target_date: all ? "all" : date,
    test_recipient: TEST_RECIPIENT,
    how_to_send: `curl -XPOST ${url.origin}/api/oddyssey-food/roster-pdf -H 'content-type: application/json' -d '{"test":true}'`,
  });
}
