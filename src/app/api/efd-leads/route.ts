import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("efd_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("efd_leads")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("efd_lead_activity").insert({
    lead_id: data.id,
    action: "created",
    details: { source: body.source || "website" },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Get current status for activity log
  const { data: existing } = await supabase
    .from("efd_leads")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("efd_leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log status change
  if (updates.status && existing && updates.status !== existing.status) {
    await supabase.from("efd_lead_activity").insert({
      lead_id: id,
      action: "status_changed",
      details: { from: existing.status, to: updates.status },
    });
  }

  return NextResponse.json(data);
}
