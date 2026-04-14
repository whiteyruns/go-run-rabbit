import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token || !action) {
      return NextResponse.json({ error: "token and action required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Look up target by token
    const { data: target } = await supabase
      .from("efd_outbound_targets")
      .select("id, company_name, contact_name, email, category, personalization, status")
      .eq("magic_link_token", token)
      .single();

    if (!target) {
      return NextResponse.json({ error: "not found", target: null }, { status: 404 });
    }

    // Update status (only advance, never go backwards)
    const statusOrder = ["pending", "sent", "viewed", "clicked", "inquired", "converted"];
    const currentIdx = statusOrder.indexOf(target.status);

    const updates: Record<string, string> = {};
    if (action === "viewed") {
      updates.status = "viewed";
      updates.viewed_at = new Date().toISOString();
    } else if (action === "clicked") {
      updates.status = "clicked";
      updates.clicked_at = new Date().toISOString();
    }

    const newIdx = statusOrder.indexOf(updates.status);
    if (newIdx > currentIdx) {
      await supabase
        .from("efd_outbound_targets")
        .update(updates)
        .eq("id", target.id);
    }

    return NextResponse.json({ success: true, target });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Failed to track", target: null }, { status: 500 });
  }
}
