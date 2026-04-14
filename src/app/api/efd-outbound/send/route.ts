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
    subject: (t) => `${t.contact_name ? t.contact_name.split(" ")[0] + ", " : ""}you've been selected`,
    html: (t) => `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #0a0f1a; color: #e8e4dd; border-radius: 8px; overflow: hidden;">

        <!-- Hero image -->
        <div style="position: relative;">
          <img src="https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/e497b3b6-e823-4884-b54d-7db48c17e79a/Doberman+5+-+Anthony+Mair.jpg" alt="Doberman Drawing Room" style="width: 100%; height: 220px; object-fit: cover; display: block;" />
        </div>

        <div style="padding: 32px;">
          <!-- Logo -->
          <img src="https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/e49dad38-b8a7-4807-981b-2bc70e91654a/Doberman.png" alt="Doberman" style="width: 100px; margin-bottom: 24px;" />

          <p style="color: #c9a84c; font-size: 10px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; font-family: -apple-system, sans-serif;">A Private Invitation</p>

          <h1 style="font-size: 26px; font-weight: 400; margin-bottom: 16px; line-height: 1.3; letter-spacing: 0.01em;">
            ${t.contact_name ? `${t.contact_name.split(" ")[0]}, we'd like` : "We'd like"} to invite you<br />
            into <span style="color: #c9a84c;">the room</span>.
          </h1>

          <p style="color: #9a958d; font-size: 14px; line-height: 1.7; margin-bottom: 24px; font-style: italic;">
            Doberman Drawing Room is a social club in the Las Vegas Arts District for people
            who prefer conversation over commotion, and craft over convenience. We're
            selectively extending membership to a small number of professionals in the area.
          </p>

          <!-- What's inside -->
          <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #e8e4dd; font-size: 13px; font-family: -apple-system, sans-serif;">Rare spirits & allocated wines</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #c9a84c; font-size: 12px; text-align: right; font-family: -apple-system, sans-serif;">Members only</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #e8e4dd; font-size: 13px; font-family: -apple-system, sans-serif;">Private events & curated programming</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #c9a84c; font-size: 12px; text-align: right; font-family: -apple-system, sans-serif;">Members only</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #e8e4dd; font-size: 13px; font-family: -apple-system, sans-serif;">Guaranteed VIP seating — no waitlist</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #c9a84c; font-size: 12px; text-align: right; font-family: -apple-system, sans-serif;">Members only</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #e8e4dd; font-size: 13px; font-family: -apple-system, sans-serif;">Complimentary valet, every visit</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a2035; color: #c9a84c; font-size: 12px; text-align: right; font-family: -apple-system, sans-serif;">Members only</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #e8e4dd; font-size: 13px; font-family: -apple-system, sans-serif;">Curated monthly gift delivered to you</td>
              <td style="padding: 12px 0; color: #c9a84c; font-size: 12px; text-align: right; font-family: -apple-system, sans-serif;">Members only</td>
            </tr>
          </table>

          <!-- Press quote -->
          <div style="border-left: 2px solid #c9a84c40; padding-left: 16px; margin-bottom: 28px;">
            <p style="color: #9a958d; font-size: 13px; font-style: italic; line-height: 1.6; margin-bottom: 6px;">
              "A moody cocktail bar and members club with drinks that taste like dinner and dessert."
            </p>
            <p style="color: #c9a84c; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-family: -apple-system, sans-serif;">— Forbes</p>
          </div>

          <!-- Cocktail images -->
          <table style="width: 100%; margin-bottom: 28px; border-collapse: collapse;">
            <tr>
              <td style="width: 33%; padding-right: 4px;">
                <img src="https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/65c7f78e-4fdc-4663-b7cb-005e8cb90d67/The+Sahara.jpg" alt="The Sahara" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px; display: block;" />
              </td>
              <td style="width: 33%; padding: 0 2px;">
                <img src="https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/d3f2ccad-401a-4625-b9c4-0e812add0b4b/Doberman+6+-+Anthony+Mair.jpg" alt="Interior" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px; display: block;" />
              </td>
              <td style="width: 33%; padding-left: 4px;">
                <img src="https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/8150ea7f-d3b0-40a6-b518-6b78c133404c/Peter+Pepper.jpg" alt="Peter Pepper" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px; display: block;" />
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${t.magic_link_url}" style="display: inline-block; background: #c9a84c; color: #0a0f1a; font-weight: 700; font-size: 13px; padding: 16px 40px; text-decoration: none; border-radius: 4px; letter-spacing: 2px; text-transform: uppercase; font-family: -apple-system, sans-serif;">
              View Your Invitation
            </a>
            <p style="color: #5a5650; font-size: 11px; margin-top: 12px; font-family: -apple-system, sans-serif;">
              Membership is by application only
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #1a2035; padding-top: 20px;">
            <p style="color: #5a5650; font-size: 10px; line-height: 1.6; font-family: -apple-system, sans-serif; text-align: center;">
              Doberman Drawing Room<br />
              1025 South 1st Street — Las Vegas Arts District<br />
              Monday–Sunday, 5 PM – 2 AM<br /><br />
              No photography. No laptops. Be present.
            </p>
          </div>
        </div>
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
