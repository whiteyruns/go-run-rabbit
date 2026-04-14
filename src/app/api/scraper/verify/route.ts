import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyEmailMx } from "@/lib/email-finder";

export async function POST(request: NextRequest) {
  const { job_id, batch_size } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const limit = batch_size || 20;

  // Get emails that haven't been verified yet
  const { data: results, error } = await supabase
    .from("cbm_scrape_results")
    .select("id, email, email_status")
    .eq("job_id", job_id)
    .not("email", "is", null)
    .or("email_status.is.null,email_status.eq.unverified,email_status.eq.pattern-guess")
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "All emails already verified", verified: 0 });
  }

  // Count remaining for progress
  const { count } = await supabase
    .from("cbm_scrape_results")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id)
    .not("email", "is", null)
    .or("email_status.is.null,email_status.eq.unverified,email_status.eq.pattern-guess");

  let invalid = 0;
  let mxValid = 0;
  const details: { id: string; email: string; status: string; mxHost: string | null }[] = [];

  for (const result of results) {
    if (!result.email) continue;

    const mxResult = await verifyEmailMx(result.email);

    let newStatus: string;
    if (mxResult.hasMx) {
      newStatus = "mx-valid";
      mxValid++;
    } else {
      newStatus = "invalid";
      invalid++;
    }

    await supabase
      .from("cbm_scrape_results")
      .update({ email_status: newStatus })
      .eq("id", result.id);

    details.push({
      id: result.id,
      email: result.email,
      status: newStatus,
      mxHost: mxResult.mxHost,
    });

    // Small delay
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({
    processed: results.length,
    mx_valid: mxValid,
    invalid,
    remaining: (count || 0) - results.length,
    details,
  });
}
