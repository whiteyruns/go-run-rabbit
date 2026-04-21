import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { job_id, batch_size } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const limit = batch_size || 5;

  // Get results with Google Maps URLs
  const { data: results, error } = await supabase
    .from("cbm_scrape_results")
    .select("id, company_name, website")
    .eq("job_id", job_id)
    .like("website", "%google.com/maps%")
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No Google Maps URLs to resolve", resolved: 0 });
  }

  let resolved = 0;
  const details: { id: string; company: string; website: string | null }[] = [];

  for (const result of results) {
    // Search for the company's actual website
    const companyName = result.company_name || "";
    let foundWebsite: string | null = null;

    try {
      // Search DuckDuckGo for the company website
      const query = encodeURIComponent(`${companyName} Las Vegas official site`);
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      });

      if (res.ok) {
        const html = await res.text();
        // Extract URLs from search results — look for href attributes
        const urlMatches = html.match(/href="(https?:\/\/[^"]+)"/g) || [];
        const urls = urlMatches
          .map((m) => m.replace('href="', "").replace('"', ""))
          .filter((u) => {
            const lower = u.toLowerCase();
            // Skip search engines, directories, social media
            const blocked = [
              "google.com", "bing.com", "duckduckgo.com", "yahoo.com",
              "yelp.com", "yellowpages.com", "facebook.com", "linkedin.com",
              "twitter.com", "instagram.com", "avvo.com", "justia.com",
              "findlaw.com", "martindale.com", "wikipedia.org", "reddit.com",
              "bbb.org", "mapquest.com",
            ];
            return !blocked.some((b) => lower.includes(b));
          })
          .filter((u) => {
            // Must look like a company website
            try {
              const parsed = new URL(u);
              return parsed.hostname.split(".").length >= 2;
            } catch {
              return false;
            }
          });

        if (urls.length > 0) {
          foundWebsite = urls[0];
        }
      }
    } catch {
      // Search failed
    }

    if (foundWebsite) {
      await supabase
        .from("cbm_scrape_results")
        .update({ website: foundWebsite })
        .eq("id", result.id);
      resolved++;
    }

    details.push({ id: result.id, company: companyName, website: foundWebsite });

    await new Promise((r) => setTimeout(r, 300));
  }

  // Count remaining
  const { count } = await supabase
    .from("cbm_scrape_results")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id)
    .like("website", "%google.com/maps%");

  return NextResponse.json({ resolved, remaining: count || 0, details });
}
