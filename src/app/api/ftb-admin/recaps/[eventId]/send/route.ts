import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

interface Recipient {
  email: string;
  name?: string;
  group?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
  });
  if (!recap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (recap.status !== "published") {
    return NextResponse.json(
      { error: "Publish the recap before sending." },
      { status: 400 },
    );
  }

  const { recipients }: { recipients: Recipient[] } = await req.json();
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json(
      { error: "recipients[] is required" },
      { status: 400 },
    );
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured on the server" },
      { status: 500 },
    );
  }

  const base = process.env.NEXT_PUBLIC_URL || "https://www.gorunrabbit.com";
  const recapUrl = `${base}/recap/ftb-editorial/${recap.eventId}`;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const sent: { email: string; ok: boolean; error?: string; id?: string }[] = [];

  for (const r of recipients) {
    const email = r.email.trim();
    if (!email) continue;
    try {
      const result = await resend.emails.send({
        from: "Feed The Block <partnerships@feedtheblock.com>",
        replyTo: "partnerships@feedtheblock.com",
        to: email,
        subject: `${recap.headliner} at Feed The Block — Post-Event Recap`,
        html: buildEmailHtml({
          headliner: recap.headliner,
          eventDate: recap.eventDate,
          recipientName: r.name,
          recapUrl,
        }),
      });

      const id = result.data?.id ?? null;

      await prisma.ftbRecapRecipient.create({
        data: {
          recapId: recap.id,
          email,
          name: r.name ?? null,
          group: r.group ?? null,
          sentAt: new Date(),
          resendId: id,
        },
      });

      sent.push({ email, ok: true, id: id ?? undefined });
    } catch (e) {
      const err = e as Error;
      await prisma.ftbRecapRecipient.create({
        data: {
          recapId: recap.id,
          email,
          name: r.name ?? null,
          group: r.group ?? null,
        },
      });
      sent.push({ email, ok: false, error: err.message });
    }
  }

  return NextResponse.json({ sent });
}

function buildEmailHtml(opts: {
  headliner: string;
  eventDate: string;
  recipientName?: string;
  recapUrl: string;
}) {
  const greeting = opts.recipientName ? `Hi ${opts.recipientName},` : "Hello,";
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#fdf9f3;font-family:Georgia,'Times New Roman',serif;color:#1c1c18;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9f3;">
      <tr>
        <td align="center" style="padding:48px 24px;">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding-bottom:32px;border-bottom:0.5px solid #c9912b;">
                <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#7f5700;">
                  Feed The Block · Post-Event Recap
                </div>
                <div style="font-size:36px;font-weight:bold;letter-spacing:-0.02em;line-height:1.05;margin-top:12px;">
                  ${escape(opts.headliner)}
                </div>
                <div style="font-size:13px;color:#1c1c18;opacity:0.6;margin-top:6px;font-style:italic;">
                  ${escape(opts.eventDate)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;font-size:16px;line-height:1.7;">
                <p style="margin:0 0 16px 0;">${escape(greeting)}</p>
                <p style="margin:0 0 16px 0;">
                  The post-event recap is ready — Placer.ai measured attendance, dwell time,
                  casino crossover, and direct economic impact. A shareable magazine-style report
                  with full photography is linked below.
                </p>
                <p style="margin:32px 0;text-align:center;">
                  <a href="${opts.recapUrl}"
                     style="display:inline-block;background:#7f5700;color:#ffffff;padding:16px 40px;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
                    View the Recap
                  </a>
                </p>
                <p style="margin:24px 0 0 0;font-size:14px;opacity:0.7;">
                  Questions or interested in the next activation? Reply to this email — I&rsquo;m happy to schedule a call.
                </p>
                <p style="margin:24px 0 0 0;">
                  <strong>Mauricio Morales</strong><br/>
                  <span style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#1c1c18;opacity:0.6;">
                    VP of Marketing and Events · Corner Bar Management × Wynn Nightlife
                  </span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:40px;border-top:0.5px solid #c9912b;margin-top:32px;">
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#7f5700;padding-top:24px;">
                  Corner Bar Management × Wynn Nightlife
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
