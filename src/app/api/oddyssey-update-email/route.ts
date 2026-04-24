import { NextResponse } from "next/server";
import { renderXlsxUpdateEmail } from "@/lib/oddyssey-sessions/xlsx-update-email";

export const runtime = "nodejs";

// Default recipients — Brandon (GM) + Keith (consultant). Override per
// request via POST body.recipients when running ad-hoc.
const DEFAULT_RECIPIENTS = [
  "kwhite@consultant.area15.com",
  "bpereyda@area15.com",
];

function mostRecentFriday(now: Date = new Date()): string {
  const d = new Date(now);
  // 5 = Friday. Step back until we land on a Friday (yesterday's Fri if today is Sat+).
  const dow = d.getDay();
  const shift = dow >= 5 ? dow - 5 : dow + 2; // Fri→0 Sat→1 Sun→2 Mon→3 ...
  d.setDate(d.getDate() - shift);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// GET — preview the HTML (no send). Handy for testing the template.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const anchor = url.searchParams.get("weekend") ?? mostRecentFriday();
  const email = renderXlsxUpdateEmail(anchor);
  if (url.searchParams.get("format") === "text") {
    return new NextResponse(email.text, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new NextResponse(email.html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

// POST — send via Resend. Body: { weekend?: YYYY-MM-DD, test?: bool, recipients?: string[] }
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    weekend?: string;
    test?: boolean;
    recipients?: string[];
  };
  const anchor = body.weekend ?? mostRecentFriday();
  const email = renderXlsxUpdateEmail(anchor);

  const subject = body.test ? `[TEST] ${email.subject}` : email.subject;
  const recipients =
    body.recipients ??
    (body.test ? ["kwhite@consultant.area15.com"] : DEFAULT_RECIPIENTS);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { status: "error", message: "RESEND_API_KEY not set", subject, recipients },
      { status: 500 },
    );
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error, data } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: recipients,
      subject,
      html: email.html,
      text: email.text,
    });
    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message, recipients },
        { status: 500 },
      );
    }
    return NextResponse.json({
      status: "ok",
      resend_id: data?.id,
      subject,
      recipients,
      anchor,
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: String(e) },
      { status: 500 },
    );
  }
}
