import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

const EFD_BASE_URL = process.env.EFD_BASE_URL || "https://eastfremontdistrict.com";

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("campaign_id");
  const supabase = getSupabase();

  let query = supabase
    .from("efd_outbound_targets")
    .select("*")
    .order("created_at", { ascending: false });

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Create single target
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = getSupabase();

  // Handle CSV batch import
  if (Array.isArray(body.targets)) {
    const targets = body.targets.map((t: Record<string, string>) => {
      const token = generateToken();
      return {
        campaign_id: body.campaign_id,
        company_name: t.company_name || t.company || t.Company || "",
        contact_name: t.contact_name || t.contact || t.Contact || null,
        email: t.email || t.Email || null,
        phone: t.phone || t.Phone || null,
        magic_link_token: token,
        magic_link_url: `${EFD_BASE_URL}/outreach/${token}`,
        status: "pending",
        personalization: {
          event_type: t.event_type || null,
          guest_count: t.guest_count || null,
          notes: t.notes || null,
        },
      };
    });

    const { data, error } = await supabase
      .from("efd_outbound_targets")
      .insert(targets)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: data?.length || 0, targets: data }, { status: 201 });
  }

  // Single target
  const token = generateToken();
  const { data, error } = await supabase
    .from("efd_outbound_targets")
    .insert({
      campaign_id: body.campaign_id,
      company_name: body.company_name,
      contact_name: body.contact_name || null,
      email: body.email || null,
      phone: body.phone || null,
      magic_link_token: token,
      magic_link_url: `${EFD_BASE_URL}/outreach/${token}`,
      status: "pending",
      personalization: body.personalization || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("efd_outbound_targets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
