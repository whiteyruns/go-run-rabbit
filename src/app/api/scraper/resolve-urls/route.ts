import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_KEY || "AIzaSyDNMFOhzg3qCfnL1waidxyKBHrWUDtSWHA";

async function findWebsiteViaPlaces(companyName: string): Promise<string | null> {
  try {
    // Step 1: Find the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(companyName + " Las Vegas")}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_KEY}`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    const searchData = await searchRes.json();

    if (!searchData.candidates || searchData.candidates.length === 0) return null;

    const placeId = searchData.candidates[0].place_id;

    // Step 2: Get place details including website
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website,formatted_phone_number&key=${GOOGLE_PLACES_KEY}`;
    const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(5000) });
    const detailsData = await detailsRes.json();

    return detailsData.result?.website || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { job_id, batch_size } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const limit = batch_size || 10;

  // Get results with Google Maps URLs or no website
  const { data: results, error } = await supabase
    .from("cbm_scrape_results")
    .select("id, company_name, website")
    .eq("job_id", job_id)
    .or("website.like.%google.com/maps%,website.is.null")
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No URLs to resolve", resolved: 0, remaining: 0 });
  }

  let resolved = 0;
  const details: { id: string; company: string; website: string | null }[] = [];

  for (const result of results) {
    const website = await findWebsiteViaPlaces(result.company_name || "");

    if (website) {
      await supabase
        .from("cbm_scrape_results")
        .update({ website })
        .eq("id", result.id);
      resolved++;
    }

    details.push({ id: result.id, company: result.company_name || "", website });
    await new Promise((r) => setTimeout(r, 100));
  }

  // Count remaining
  const { count } = await supabase
    .from("cbm_scrape_results")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id)
    .or("website.like.%google.com/maps%,website.is.null");

  return NextResponse.json({ resolved, remaining: (count || 0) - results.length + (results.length - resolved), details });
}
