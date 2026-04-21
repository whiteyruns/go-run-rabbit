import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isFhAdminFromRequest } from "@/lib/forest-house/fh-auth";
import { readRunOfShow } from "@/lib/forest-house/run-of-show-storage";
import {
  isKnownEventSlug,
  RUN_OF_SHOW_SEEDS,
} from "@/lib/forest-house/run-of-show-seed";
import { renderRunOfShowEmailHtml } from "@/lib/forest-house/run-of-show-email";

export const runtime = "nodejs";

const BodySchema = z.object({
  recipients: z
    .array(z.string().trim().toLowerCase().email())
    .min(1, "Select at least one recipient")
    .max(100, "Too many recipients"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  if (!(await isFhAdminFromRequest(request))) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (!isKnownEventSlug(params.slug)) {
    return NextResponse.json(
      { ok: false, error: "Unknown event" },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  // Dedupe recipients while preserving order
  const recipients = Array.from(new Set(parsed.data.recipients));

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY not configured on server" },
      { status: 500 },
    );
  }

  const data = await readRunOfShow(params.slug);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const html = renderRunOfShowEmailHtml({
    data,
    slug: params.slug,
    baseUrl,
  });

  const subject = `Forest House ROS · ${data.eventName}`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Send a single email with all recipients in BCC so names don't leak
    // to each other. The "to" address gets the sender too so the message
    // threads cleanly in their sent folder.
    const { data: sendResult, error } = await resend.emails.send({
      from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
      to: "keith@gorunrabbit.com",
      bcc: recipients,
      subject,
      html,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, recipients },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      sent: recipients.length,
      resendId: sendResult?.id,
      subject,
      seedName: RUN_OF_SHOW_SEEDS[params.slug].eventName,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Send failed",
      },
      { status: 500 },
    );
  }
}
