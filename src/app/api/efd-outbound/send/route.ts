import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  return new Resend(apiKey);
}

// Email templates by campaign type
const TEMPLATES: Record<string, {
  from: string;
  subject: (target: Record<string, string>) => string;
  html: (target: Record<string, string>) => string;
}> = {
  efd: {
    from: "East Fremont District <partnerships@cornerbarmgmt.com>",
    subject: (t) => `${t.contact_name ? t.contact_name + ", " : ""}your activation at East Fremont`,
    html: (t) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1115; color: #F0EDE8; padding: 32px; border-radius: 8px;">
        <p style="color: #C49A6C; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px;">East Fremont District</p>
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; line-height: 1.3;">
          ${t.contact_name ? `${t.contact_name.split(" ")[0]}, here's` : "Here's"} what ${t.company_name || "your"} activation could look like
        </h1>
        <p style="color: #9B978F; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          We put together a personalized look at how ${t.company_name || "your brand"} could activate across
          East Fremont — 8 venues, one block, 32K+ attendees proven in Year 1.
        </p>
        <a href="${t.magic_link_url}" style="display: inline-block; background: #C49A6C; color: #0F1115; font-weight: 700; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 6px;">
          See Your Activation
        </a>
        <p style="color: #6B6760; font-size: 12px; margin-top: 32px; line-height: 1.5;">
          Mauricio Morales — VP of Marketing and Events<br />
          Corner Bar Management + Wynn Las Vegas<br />
          partnerships@feedtheblock.com
        </p>
      </div>
    `,
  },
  doberman: {
    from: "Doberman Drawing Room <membership@send.dobermandtlv.com>",
    subject: (t) => `${t.contact_name ? t.contact_name.split(" ")[0] + ", " : ""}a private invitation to Doberman`,
    html: (t) => `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #0a0f1a; color: #e8e4dd; padding: 32px; border-radius: 8px;">
        <p style="color: #c9a84c; font-size: 11px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; font-family: -apple-system, sans-serif;">A Private Invitation</p>
        <h1 style="font-size: 24px; font-weight: 400; margin-bottom: 16px; line-height: 1.3;">
          ${t.contact_name ? `${t.contact_name.split(" ")[0]}, you're` : "You're"} invited to join
          <span style="color: #c9a84c;">Doberman Drawing Room</span>
        </h1>
        <p style="color: #9a958d; font-size: 14px; line-height: 1.7; margin-bottom: 8px; font-style: italic;">
          A social club for the intellectually curious — handcrafted cocktails, intimate conversation,
          and a membership designed for professionals who value substance over spectacle.
        </p>
        ${t.category ? `<p style="color: #9a958d; font-size: 13px; margin-bottom: 24px;">We're selectively inviting ${t.category.toLowerCase()} professionals in the Arts District to experience the room.</p>` : ""}
        <div style="border-left: 2px solid #c9a84c30; padding-left: 16px; margin-bottom: 24px;">
          <p style="font-size: 14px; margin-bottom: 4px;">Annual Membership: <span style="color: #c9a84c;">$3,000/year</span></p>
          <p style="color: #9a958d; font-size: 12px; font-family: -apple-system, sans-serif;">Includes concierge, exclusive events, rare spirits menu, monthly gifts, VIP seating, guest passes, and complimentary valet.</p>
        </div>
        <a href="${t.magic_link_url}" style="display: inline-block; background: #c9a84c; color: #0a0f1a; font-weight: 600; font-size: 13px; padding: 14px 28px; text-decoration: none; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; font-family: -apple-system, sans-serif;">
          View Your Invitation
        </a>
        <p style="color: #5a5650; font-size: 11px; margin-top: 32px; line-height: 1.5; font-family: -apple-system, sans-serif;">
          Doberman Drawing Room<br />
          1025 South 1st Street — Las Vegas Arts District<br />
          Monday–Sunday, 5 PM – 2 AM
        </p>
      </div>
    `,
  },
};

export async function POST(request: NextRequest) {
  const { campaign_id, target_ids } = await request.json();

  if (!campaign_id) {
    return NextResponse.json({ error: "campaign_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const resend = getResend();

  // Get campaign to determine template
  const { data: campaign } = await supabase
    .from("efd_outbound_campaigns")
    .select("outreach_template")
    .eq("id", campaign_id)
    .single();

  const templateKey = campaign?.outreach_template || "efd";
  const template = TEMPLATES[templateKey] || TEMPLATES.efd;

  // Get targets to send to
  let query = supabase
    .from("efd_outbound_targets")
    .select("*")
    .eq("campaign_id", campaign_id)
    .eq("status", "pending")
    .not("email", "is", null);

  if (target_ids?.length) {
    query = supabase
      .from("efd_outbound_targets")
      .select("*")
      .in("id", target_ids)
      .not("email", "is", null);
  }

  const { data: targets, error } = await query.limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!targets || targets.length === 0) {
    return NextResponse.json({ message: "No targets to send to (need email and pending status)", sent: 0 });
  }

  let sent = 0;
  let failed = 0;
  const details: { id: string; email: string; success: boolean; error?: string }[] = [];

  for (const target of targets) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: template.from,
        to: target.email,
        replyTo: templateKey === "doberman" ? "andrew@dobermandtlv.com" : "partnerships@feedtheblock.com",
        subject: template.subject(target),
        html: template.html(target),
      });

      if (sendError) {
        details.push({ id: target.id, email: target.email, success: false, error: sendError.message });
        failed++;
      } else {
        // Update target status to sent
        await supabase
          .from("efd_outbound_targets")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", target.id);
        details.push({ id: target.id, email: target.email, success: true });
        sent++;
      }
    } catch (err) {
      details.push({ id: target.id, email: target.email, success: false, error: err instanceof Error ? err.message : "Unknown" });
      failed++;
    }

    // Small delay between sends
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({ sent, failed, details });
}
