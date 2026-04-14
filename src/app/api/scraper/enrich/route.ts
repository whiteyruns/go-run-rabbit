import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { findEmail, extractDomain, parseName } from "@/lib/email-finder";

// Also try scraping the website for emails as a fallback
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const CONTACT_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us", "/team", "/attorneys"];

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (lower.includes("example.com")) return true;
  if (lower.includes("sentry.io")) return true;
  if (lower.includes("wixpress.com")) return true;
  if (lower.includes("schema.org")) return true;
  if (lower.includes("w3.org")) return true;
  if (lower.includes("googleusercontent")) return true;
  if (lower.includes("cloudflare")) return true;
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) return true;
  if (lower.includes("noreply") || lower.includes("no-reply")) return true;
  if (lower.includes("unsubscribe") || lower.includes("mailer")) return true;
  if (lower.length > 50) return true;
  return false;
}

async function scrapeWebsiteForEmails(baseUrl: string): Promise<string[]> {
  const allEmails: string[] = [];

  for (const path of CONTACT_PATHS) {
    try {
      const url = path ? `${baseUrl.replace(/\/$/, "")}${path}` : baseUrl;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();
      const found = html.match(EMAIL_REGEX) || [];
      allEmails.push(...found.map((e) => e.toLowerCase()).filter((e) => !isJunkEmail(e)));

      // If we found emails, no need to check more pages
      if (allEmails.length > 0) break;

      await new Promise((r) => setTimeout(r, 300));
    } catch {
      continue;
    }
  }

  return allEmails.filter((v, i, a) => a.indexOf(v) === i);
}

export async function POST(request: NextRequest) {
  const { job_id, result_ids } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Get results to enrich
  let query = supabase
    .from("cbm_scrape_results")
    .select("id, website, company_name, contact_name, phone, email")
    .eq("job_id", job_id);

  if (result_ids?.length) {
    query = query.in("id", result_ids);
  } else {
    query = query.is("email", null);
  }

  const { data: results, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No results to enrich", enriched: 0 });
  }

  let enriched = 0;
  let emailsFound = 0;
  const details: { id: string; email: string | null; method: string; tested: number }[] = [];

  for (const result of results) {
    let foundEmail: string | null = null;
    let method = "none";
    let tested = 0;

    // Method 1: SMTP permutation verification (if we have name + website)
    if (result.contact_name && result.website) {
      const name = parseName(result.contact_name);
      const domain = extractDomain(result.website);

      if (name && domain) {
        try {
          const found = await findEmail(name.firstName, name.lastName, domain);
          tested = found.allTested.length;

          if (found.email) {
            foundEmail = found.email;
            method = found.catchAll ? "catch-all-guess" : "smtp-verified";
          }
        } catch (err) {
          console.error(`SMTP check failed for ${result.contact_name}:`, err);
        }
      }
    }

    // Method 2: Website scraping fallback (if SMTP didn't find anything)
    if (!foundEmail && result.website) {
      const scraped = await scrapeWebsiteForEmails(result.website);
      if (scraped.length > 0) {
        // Prefer emails matching the domain
        const domain = extractDomain(result.website);
        const domainMatch = domain ? scraped.find((e) => e.endsWith(`@${domain}`)) : null;
        foundEmail = domainMatch || scraped[0];
        method = "website-scrape";
      }
    }

    // Update result if we found something
    if (foundEmail) {
      await supabase
        .from("cbm_scrape_results")
        .update({ email: foundEmail })
        .eq("id", result.id);
      enriched++;
      emailsFound++;
    }

    details.push({ id: result.id, email: foundEmail, method, tested });

    // Delay between results to be respectful
    await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    processed: results.length,
    enriched,
    emails_found: emailsFound,
    details,
  });
}
