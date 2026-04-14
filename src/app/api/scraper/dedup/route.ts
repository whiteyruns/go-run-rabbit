import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { job_id } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: results, error } = await supabase
    .from("cbm_scrape_results")
    .select("id, company_name, contact_name, email, phone")
    .eq("job_id", job_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No results", removed: 0 });
  }

  // Find duplicates — match on normalized company_name + contact_name, or email
  const seen = new Map<string, string>(); // key -> first id
  const dupeIds: string[] = [];

  for (const r of results) {
    // Build dedup keys
    const keys: string[] = [];

    // Key 1: company + contact name
    if (r.company_name && r.contact_name) {
      keys.push(`name:${r.company_name.toLowerCase().trim()}|${r.contact_name.toLowerCase().trim()}`);
    }

    // Key 2: email
    if (r.email) {
      keys.push(`email:${r.email.toLowerCase().trim()}`);
    }

    // Key 3: company + phone (if no contact name)
    if (r.company_name && r.phone && !r.contact_name) {
      keys.push(`phone:${r.company_name.toLowerCase().trim()}|${r.phone.replace(/\D/g, "")}`);
    }

    let isDupe = false;
    for (const key of keys) {
      if (seen.has(key)) {
        isDupe = true;
        break;
      }
    }

    if (isDupe) {
      dupeIds.push(r.id);
    } else {
      for (const key of keys) {
        seen.set(key, r.id);
      }
    }
  }

  // Delete duplicates
  if (dupeIds.length > 0) {
    // Delete in batches
    for (let i = 0; i < dupeIds.length; i += 50) {
      const batch = dupeIds.slice(i, i + 50);
      await supabase.from("cbm_scrape_results").delete().in("id", batch);
    }

    // Update job result count
    const newCount = results.length - dupeIds.length;
    await supabase
      .from("cbm_scrape_jobs")
      .update({ result_count: newCount })
      .eq("id", job_id);
  }

  return NextResponse.json({
    original: results.length,
    duplicates: dupeIds.length,
    remaining: results.length - dupeIds.length,
  });
}
