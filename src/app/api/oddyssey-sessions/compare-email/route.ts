// Send / preview the Oddyssey at-a-glance comparison email.
// Powers the "Send" button on the control-room snapshot + summary pages.
//
//   GET  ?date=YYYY-MM-DD&compareDate=YYYY-MM-DD[&format=text]
//   POST { date, compareDate?, recipients?, test? }
import { NextResponse } from "next/server";
import { buildCompareEmail } from "@/lib/oddyssey-sessions/compare-email";

export const runtime = "nodejs";

const DEFAULT_RECIPIENTS = [
  "kwhite@consultant.area15.com",
  "bpereyda@area15.com",
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const compareDate = url.searchParams.get("compareDate") ?? undefined;
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ status: "error", message: "date=YYYY-MM-DD required" }, { status: 400 });
  }
  if (compareDate && !DATE_RE.test(compareDate)) {
    return NextResponse.json({ status: "error", message: "compareDate must be YYYY-MM-DD" }, { status: 400 });
  }
  const email = buildCompareEmail({ date, compareDate });
  if (url.searchParams.get("format") === "text") {
    return new NextResponse(email.text, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  if (url.searchParams.get("format") === "json") {
    return NextResponse.json({ status: "ok", ...email });
  }
  return new NextResponse(email.html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    date?: string;
    compareDate?: string;
    recipients?: string[];
    test?: boolean;
  };
  if (!body.date || !DATE_RE.test(body.date)) {
    return NextResponse.json({ status: "error", message: "date=YYYY-MM-DD required" }, { status: 400 });
  }
  if (body.compareDate && !DATE_RE.test(body.compareDate)) {
    return NextResponse.json({ status: "error", message: "compareDate must be YYYY-MM-DD" }, { status: 400 });
  }
  const email = buildCompareEmail({ date: body.date, compareDate: body.compareDate });
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
      return NextResponse.json({ status: "error", message: error.message, recipients }, { status: 500 });
    }
    return NextResponse.json({
      status: "ok",
      resend_id: data?.id,
      subject,
      recipients,
      date: body.date,
      compareDate: body.compareDate ?? null,
    });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
