import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.recapLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId, type, recipientEmail } = await request.json();

  if (!dealId || !type) {
    return NextResponse.json({ error: "dealId and type required" }, { status: 400 });
  }

  const deal = await prisma.pipelineDeal.findUnique({ where: { id: dealId } });
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  // Log the recap
  const log = await prisma.recapLog.create({
    data: {
      type,
      sentTo: recipientEmail || "link-only",
      data: JSON.stringify({
        dealId: deal.id,
        brandName: deal.brandName,
        category: deal.category,
        generatedAt: new Date().toISOString(),
      }),
    },
  });

  // If Resend key is configured and email provided, send it
  if (process.env.RESEND_API_KEY && recipientEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const recapUrl = `${process.env.NEXT_PUBLIC_URL || "https://cbm.claymoreandcolt.com"}/recap/brand/${dealId}/${type}`;

      await resend.emails.send({
        from: "CBM Dashboards <recaps@gorunrabbit.com>",
        to: recipientEmail,
        subject: `${deal.brandName} — ${type === "post-event" ? "Post-Event Recap" : type === "quarterly" ? "Quarterly Review" : type === "annual" ? "Annual Partnership Report" : "Recap"}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <p style="color: #00eefc; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase;">Corner Bar Management</p>
            <h1 style="color: #f3f0f4; font-size: 24px; margin: 8px 0;">${deal.brandName} — ${type === "post-event" ? "Post-Event Recap" : type === "quarterly" ? "Quarterly Review" : "Annual Report"}</h1>
            <p style="color: #acaaae; margin: 16px 0;">Your partnership recap is ready. Click below to view the full report.</p>
            <a href="${recapUrl}" style="display: inline-block; background: #aea2ff; color: #1f0078; padding: 12px 32px; border-radius: 6px; font-weight: bold; text-decoration: none; margin: 16px 0;">View Recap</a>
            <p style="color: #48474b; font-size: 12px; margin-top: 32px;">Go Run Rabbit LLC — Prepared for ${deal.brandName}</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  return NextResponse.json({
    log,
    recapUrl: `/recap/brand/${dealId}/${type}`,
  }, { status: 201 });
}
