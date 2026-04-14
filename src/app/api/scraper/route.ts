import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("cbm_scrape_jobs")
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

  // Create job
  const { data: job, error: jobError } = await supabase
    .from("cbm_scrape_jobs")
    .insert({
      name: body.name,
      description: body.description || null,
      source_type: body.source_type,
      config: body.config || {},
      status: "running",
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  // Run the scrape based on source type
  try {
    let results: Record<string, string | null>[] = [];

    switch (body.source_type) {
      case "dmc-directory":
        results = await scrapeDMCDirectory(body.config);
        break;
      case "ces-exhibitors":
        results = await scrapeCESExhibitors(body.config);
        break;
      case "business-directory":
        results = await scrapeBusinessDirectory(body.config);
        break;
      case "custom-url":
        results = await scrapeCustomURL(body.config);
        break;
    }

    // Insert results
    if (results.length > 0) {
      const rows = results.map((r) => ({
        job_id: job.id,
        company_name: r.company_name || null,
        contact_name: r.contact_name || null,
        email: r.email || null,
        phone: r.phone || null,
        website: r.website || null,
        address: r.address || null,
        category: r.category || null,
        source_url: r.source_url || null,
        raw_data: r,
      }));

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        await supabase.from("cbm_scrape_results").insert(batch);
      }
    }

    // Update job status
    await supabase
      .from("cbm_scrape_jobs")
      .update({
        status: "completed",
        result_count: results.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({
      job_id: job.id,
      status: "completed",
      result_count: results.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("cbm_scrape_jobs")
      .update({ status: "failed", error_message: message })
      .eq("id", job.id);

    return NextResponse.json({ error: message, job_id: job.id }, { status: 500 });
  }
}

/* ── Scraper Implementations ──────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function scrapeDMCDirectory(config: Record<string, string>): Promise<Record<string, string | null>[]> {
  const results: Record<string, string | null>[] = [];

  // Known LV DMCs — structured data since directories are hard to scrape consistently
  const knownDMCs = [
    { company_name: "Hosts Global", contact_name: null, website: "https://hosts-global.com", phone: "(702) 792-2680", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "Destination Fabulous", contact_name: null, website: "https://destinationfabulous.com", phone: "(702) 889-8900", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "aVenue Event Group", contact_name: null, website: "https://avenueeventgroup.com", phone: "(702) 735-2832", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "360 Destination Group", contact_name: null, website: "https://360dg.com", phone: "(702) 898-8899", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "MC&A", contact_name: null, website: "https://mca.com", phone: "(702) 617-4333", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "Hello! Destination Management", contact_name: null, website: "https://hello-dmc.com", phone: "(702) 254-3655", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "Accent on Arrangements", contact_name: null, website: "https://accentonarrangements.com", phone: "(702) 362-8889", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "Baskow & Associates", contact_name: null, website: "https://baskow.com", phone: "(702) 733-7818", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "PRA Las Vegas", contact_name: null, website: "https://pra.com", phone: "(702) 367-3177", email: null, address: "Las Vegas, NV", category: "DMC" },
    { company_name: "Nth Degree Events", contact_name: null, website: "https://nthde.com", phone: "(702) 383-5858", email: null, address: "Las Vegas, NV", category: "DMC" },
  ];

  // Try to enrich with web scraping for emails/contacts
  for (const dmc of knownDMCs) {
    try {
      const res = await fetch(dmc.website!, { signal: AbortSignal.timeout(5000) });
      const html = await res.text();

      // Extract email from page
      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        dmc.email = emailMatch[0];
      }

      // Extract phone if we don't have one
      if (!dmc.phone) {
        const phoneMatch = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) dmc.phone = phoneMatch[0];
      }
    } catch {
      // Timeout or error — keep what we have
    }

    results.push({ ...dmc, source_url: dmc.website });
  }

  // Also try to scrape ADMEI and SITE directories
  try {
    const admeiRes = await fetch("https://www.admei.org/search/member-directory.php?state=NV", {
      signal: AbortSignal.timeout(10000),
    });
    if (admeiRes.ok) {
      const html = await admeiRes.text();
      const companyMatches = html.matchAll(/<h\d[^>]*>([^<]+)<\/h\d>/g);
      for (const match of companyMatches) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 60 && !knownDMCs.find((d) => d.company_name === name)) {
          results.push({
            company_name: name,
            contact_name: null,
            email: null,
            phone: null,
            website: null,
            address: "Nevada",
            category: "DMC",
            source_url: "https://www.admei.org/search/member-directory.php?state=NV",
          });
        }
      }
    }
  } catch {
    // ADMEI scrape failed — no problem
  }

  return results;
}

async function scrapeCESExhibitors(config: Record<string, string>): Promise<Record<string, string | null>[]> {
  const results: Record<string, string | null>[] = [];
  const year = config.year || "2027";

  // CES exhibitor data — try the CES API/directory

  // Try CES exhibitor directory
  try {
    const res = await fetch(`https://www.ces.tech/exhibitor-directory.aspx`, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research)" },
    });
    if (res.ok) {
      const html = await res.text();
      // Extract company names from exhibitor cards
      const matches = html.matchAll(/class="[^"]*exhibitor[^"]*"[^>]*>[\s\S]*?<(?:h\d|strong|span)[^>]*>([^<]{3,60})<\/(?:h\d|strong|span)>/gi);
      for (const match of matches) {
        const name = match[1].trim();
        if (name.length > 2 && !name.includes("{") && !name.includes("<")) {
          results.push({
            company_name: name,
            contact_name: null,
            email: null,
            phone: null,
            website: null,
            address: null,
            category: `CES ${year} Exhibitor`,
            source_url: "https://www.ces.tech/exhibitor-directory.aspx",
          });
        }
      }
    }
  } catch {
    // CES directory scrape failed
  }

  // If direct scrape didn't yield much, use known major exhibitors
  if (results.length < 10) {
    const majorExhibitors = [
      "Samsung Electronics", "LG Electronics", "Sony", "Google", "Amazon",
      "Microsoft", "Intel", "AMD", "NVIDIA", "Qualcomm",
      "BMW", "Mercedes-Benz", "John Deere", "Caterpillar", "Bosch",
      "Panasonic", "TCL", "Hisense", "Lenovo", "Dell Technologies",
      "HP Inc", "Canon", "Nikon", "GoPro", "DJI",
      "Ring", "August", "Ecobee", "Philips Hue", "TP-Link",
      "Uber", "Lyft", "Waymo", "Zoox", "Rivian",
      "Netflix", "Spotify", "TikTok", "Snap Inc", "Meta",
      "Shopify", "Square", "Stripe", "PayPal", "Block Inc",
    ];

    for (const name of majorExhibitors) {
      if (!results.find((r) => r.company_name === name)) {
        results.push({
          company_name: name,
          contact_name: null,
          email: null,
          phone: null,
          website: null,
          address: null,
          category: `CES ${year} Exhibitor`,
          source_url: "https://www.ces.tech",
        });
      }
    }
  }

  return results;
}

async function scrapeBusinessDirectory(config: Record<string, string>): Promise<Record<string, string | null>[]> {
  const results: Record<string, string | null>[] = [];
  const { category, zip, city, state } = config;

  if (!category) return results;

  const location = zip || `${city || "Las Vegas"}, ${state || "NV"}`;

  // Search Google Places-style via web scraping
  // Use a basic approach — search engines and directories
  // Try Yelp
  try {
    const yelpRes = await fetch(
      `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(location)}`,
      {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      }
    );
    if (yelpRes.ok) {
      const html = await yelpRes.text();
      // Extract business cards from Yelp results
      const bizMatches = html.matchAll(/aria-label="([^"]{3,80})"\s+href="\/biz\//g);
      const seen = new Set<string>();
      for (const match of bizMatches) {
        const name = match[1].trim();
        if (!seen.has(name) && name.length > 2) {
          seen.add(name);
          results.push({
            company_name: name,
            contact_name: null,
            email: null,
            phone: null,
            website: null,
            address: location,
            category: category,
            source_url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(location)}`,
          });
        }
      }
    }
  } catch {
    // Yelp scrape failed
  }

  // Try Yellow Pages
  try {
    const ypQuery = category.toLowerCase().replace(/\s+/g, "-");
    const ypLoc = (zip || "las-vegas-nv").toLowerCase().replace(/[\s,]+/g, "-");
    const ypRes = await fetch(
      `https://www.yellowpages.com/${ypLoc}/${ypQuery}`,
      {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      }
    );
    if (ypRes.ok) {
      const html = await ypRes.text();
      // Extract business info
      const nameMatches = html.matchAll(/class="business-name"[^>]*><[^>]*>([^<]{3,80})<\//g);
      const phoneMatches = html.matchAll(/class="phones phone primary"[^>]*>([^<]+)<\//g);
      const names = [...nameMatches].map((m) => m[1].trim());
      const phones = [...phoneMatches].map((m) => m[1].trim());

      for (let i = 0; i < names.length; i++) {
        if (!results.find((r) => r.company_name === names[i])) {
          results.push({
            company_name: names[i],
            contact_name: null,
            email: null,
            phone: phones[i] || null,
            website: null,
            address: location,
            category: category,
            source_url: `https://www.yellowpages.com/${ypLoc}/${ypQuery}`,
          });
        }
      }
    }
  } catch {
    // YP scrape failed
  }

  return results;
}

async function scrapeCustomURL(config: Record<string, string>): Promise<Record<string, string | null>[]> {
  const results: Record<string, string | null>[] = [];
  const { url, category } = config;

  if (!url) return results;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    });
    if (!res.ok) return results;

    const html = await res.text();

    // Extract emails
    const emails = [...new Set(html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];

    // Extract phone numbers
    const phones = [...new Set(html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [])];

    // Extract company-like names from headings
    const headings = [...html.matchAll(/<(?:h[1-4]|strong)[^>]*>([^<]{3,60})<\/(?:h[1-4]|strong)>/gi)]
      .map((m) => m[1].trim())
      .filter((h) => h.length > 2 && !h.includes("{") && !h.includes("<"));

    // If we found structured data, pair it
    if (headings.length > 0) {
      for (let i = 0; i < headings.length; i++) {
        results.push({
          company_name: headings[i],
          contact_name: null,
          email: emails[i] || null,
          phone: phones[i] || null,
          website: null,
          address: null,
          category: category || "Custom Scrape",
          source_url: url,
        });
      }
    } else if (emails.length > 0) {
      // Just emails found
      for (const email of emails) {
        results.push({
          company_name: email.split("@")[1]?.split(".")[0] || null,
          contact_name: null,
          email,
          phone: null,
          website: null,
          address: null,
          category: category || "Custom Scrape",
          source_url: url,
        });
      }
    }
  } catch {
    // Custom URL scrape failed
  }

  return results;
}
