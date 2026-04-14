import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("job_id");

  if (!jobId) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("cbm_scrape_results")
    .select("*")
    .eq("job_id", jobId)
    .order("company_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Export results to an outbound campaign
export async function POST(request: NextRequest) {
  const { job_id, campaign_id, result_ids, template } = await request.json();

  if (!job_id || !campaign_id) {
    return NextResponse.json({ error: "job_id and campaign_id required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Get results to export
  let query = supabase
    .from("cbm_scrape_results")
    .select("*")
    .eq("job_id", job_id)
    .eq("exported", false);

  if (result_ids?.length) {
    query = query.in("id", result_ids);
  }

  const { data: results, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No results to export", exported: 0 });
  }

  // Get campaign template
  let outreachTemplate = template || "efd";
  if (!template) {
    // Look up campaign template
    const { data: campaign } = await supabase
      .from("efd_outbound_campaigns")
      .select("outreach_template")
      .eq("id", campaign_id)
      .single();
    if (campaign?.outreach_template) outreachTemplate = campaign.outreach_template;
  }

  const TEMPLATE_URLS: Record<string, string> = {
    efd: "https://eastfremontdistrict.com/outreach",
    doberman: "https://cbm.gorunrabbit.com/doberman-outreach",
  };

  // Create outbound targets from results
  const crypto = await import("crypto");
  const targets = results.map((r: Record<string, string>) => {
    const token = crypto.randomBytes(16).toString("hex");
    const baseUrl = TEMPLATE_URLS[outreachTemplate] || TEMPLATE_URLS.efd;
    return {
      campaign_id,
      company_name: r.company_name || "Unknown",
      contact_name: r.contact_name || null,
      email: r.email || null,
      phone: r.phone || null,
      magic_link_token: token,
      magic_link_url: `${baseUrl}/${token}`,
      status: "pending",
      personalization: {
        source: "scraper",
        category: r.category,
        website: r.website,
      },
    };
  });

  // Insert targets in batches
  let inserted = 0;
  for (let i = 0; i < targets.length; i += 20) {
    const batch = targets.slice(i, i + 20);
    const { data } = await supabase.from("efd_outbound_targets").insert(batch).select();
    inserted += data?.length || 0;
  }

  // Mark results as exported
  const exportedIds = results.map((r: Record<string, string>) => r.id);
  await supabase
    .from("cbm_scrape_results")
    .update({ exported: true, exported_to: campaign_id })
    .in("id", exportedIds);

  return NextResponse.json({ exported: inserted, campaign_id });
}
