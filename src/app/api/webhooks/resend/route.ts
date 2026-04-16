import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Resend webhook events: https://resend.com/docs/dashboard/webhooks/event-types
// We track: email.delivered, email.opened.
// Security: Resend signs webhooks with a secret header. For MVP we accept all events;
// configure a shared-secret header check in the Resend dashboard and add it here later.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.type || !body.data) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const resendId: string | undefined = body.data.email_id ?? body.data.id;
  if (!resendId) return NextResponse.json({ ok: true });

  const recipient = await prisma.ftbRecapRecipient.findFirst({
    where: { resendId },
  });
  if (!recipient) return NextResponse.json({ ok: true });

  const now = new Date();
  if (body.type === "email.delivered" && !recipient.deliveredAt) {
    await prisma.ftbRecapRecipient.update({
      where: { id: recipient.id },
      data: { deliveredAt: now },
    });
  } else if (body.type === "email.opened" && !recipient.openedAt) {
    await prisma.ftbRecapRecipient.update({
      where: { id: recipient.id },
      data: { openedAt: now },
    });
  }

  return NextResponse.json({ ok: true });
}
