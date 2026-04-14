import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const CONTACT_PATHS = [
  "", "/contact", "/contact-us", "/about", "/about-us", "/team",
  "/our-team", "/attorneys", "/our-attorneys", "/staff", "/people",
  "/leadership", "/partners", "/firm", "/our-firm",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

// Common junk emails to filter out
const JUNK_EMAILS = new Set([
  "example@example.com", "info@example.com", "test@test.com",
  "name@example.com", "email@example.com", "your@email.com",
  "user@example.com", "someone@example.com",
]);

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_EMAILS.has(lower)) return true;
  if (lower.includes("example.com")) return true;
  if (lower.includes("sentry.io")) return true;
  if (lower.includes("wixpress.com")) return true;
  if (lower.includes("wordpress.com") && !lower.includes("@")) return true;
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) return true;
  if (lower.includes("schema.org")) return true;
  if (lower.includes("w3.org")) return true;
  if (lower.includes("googleusercontent")) return true;
  if (lower.includes("cloudflare")) return true;
  if (lower.length > 50) return true;
  return false;
}

function scoreEmail(email: string, companyDomain: string | null): number {
  let score = 0;
  const lower = email.toLowerCase();

  // Matches company domain = high value
  if (companyDomain && lower.endsWith(`@${companyDomain}`)) score += 10;

  // Personal-looking (has first/last name pattern)
  const localPart = lower.split("@")[0];
  if (localPart.includes(".")) score += 3; // first.last pattern
  if (/^[a-z]+\.[a-z]+$/.test(localPart)) score += 5; // clean first.last
  if (/^[a-z][a-z]+$/.test(localPart)) score += 1; // single name

  // Generic prefixes are lower value but still useful
  if (localPart === "info" || localPart === "contact" || localPart === "office") score += 2;
  if (localPart === "admin" || localPart === "hello" || localPart === "support") score += 1;

  // Penalty for noreply
  if (localPart.includes("noreply") || localPart.includes("no-reply")) score -= 10;
  if (localPart.includes("unsubscribe")) score -= 10;
  if (localPart.includes("mailer") || localPart.includes("newsletter")) score -= 5;

  return score;
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

async function scrapePageForEmails(url: string): Promise<{ emails: string[]; phones: string[] }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!res.ok) return { emails: [], phones: [] };

    const html = await res.text();

    // Extract emails
    const rawEmails = html.match(EMAIL_REGEX) || [];
    const emails = rawEmails
      .map((e) => e.toLowerCase().trim())
      .filter((e) => !isJunkEmail(e))
      .filter((v, i, a) => a.indexOf(v) === i);

    // Extract additional phones
    const rawPhones = html.match(PHONE_REGEX) || [];
    const phones = rawPhones
      .filter((v, i, a) => a.indexOf(v) === i);

    return { emails, phones };
  } catch {
    return { emails: [], phones: [] };
  }
}

interface EnrichResult {
  id: string;
  emails_found: string[];
  best_email: string | null;
  phones_found: string[];
  pages_checked: number;
}

async function enrichSingleResult(result: {
  id: string;
  website: string | null;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
}): Promise<EnrichResult> {
  const enrichResult: EnrichResult = {
    id: result.id,
    emails_found: [],
    best_email: null,
    phones_found: [],
    pages_checked: 0,
  };

  if (!result.website) return enrichResult;

  const domain = extractDomain(result.website);
  const baseUrl = result.website.replace(/\/$/, "");

  // Scrape multiple pages on the site
  const allEmails: string[] = [];
  const allPhones: string[] = [];

  for (const path of CONTACT_PATHS) {
    const url = path ? `${baseUrl}${path}` : baseUrl;
    const { emails, phones } = await scrapePageForEmails(url);
    allEmails.push(...emails);
    allPhones.push(...phones);
    enrichResult.pages_checked++;

    // If we found emails from the company domain, we can stop early
    if (domain && emails.some((e) => e.endsWith(`@${domain}`))) {
      break;
    }

    // Small delay between pages
    await new Promise((r) => setTimeout(r, 500));
  }

  // Deduplicate
  enrichResult.emails_found = allEmails.filter((v, i, a) => a.indexOf(v) === i);
  enrichResult.phones_found = allPhones.filter((v, i, a) => a.indexOf(v) === i);

  // Score and pick best email
  if (enrichResult.emails_found.length > 0) {
    const scored = enrichResult.emails_found
      .map((e) => ({ email: e, score: scoreEmail(e, domain) }))
      .sort((a, b) => b.score - a.score);

    enrichResult.best_email = scored[0].score > 0 ? scored[0].email : scored[0].email;
  }

  return enrichResult;
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
    .eq("job_id", job_id)
    .not("website", "is", null);

  if (result_ids?.length) {
    query = query.in("id", result_ids);
  } else {
    // Only enrich those without email
    query = query.is("email", null);
  }

  const { data: results, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No results to enrich (all have emails or no websites)", enriched: 0 });
  }

  let enriched = 0;
  let emailsFound = 0;
  const enrichResults: EnrichResult[] = [];

  // Process sequentially to avoid overwhelming targets
  for (const result of results) {
    const er = await enrichSingleResult(result);
    enrichResults.push(er);

    // Update the record if we found an email
    if (er.best_email) {
      const updates: Record<string, string | null> = { email: er.best_email };

      // If we found a better phone and didn't have one
      if (!result.phone && er.phones_found.length > 0) {
        updates.phone = er.phones_found[0];
      }

      await supabase
        .from("cbm_scrape_results")
        .update(updates)
        .eq("id", result.id);

      enriched++;
      emailsFound++;
    } else if (!result.phone && er.phones_found.length > 0) {
      // At least update phone if we found one
      await supabase
        .from("cbm_scrape_results")
        .update({ phone: er.phones_found[0] })
        .eq("id", result.id);

      enriched++;
    }
  }

  return NextResponse.json({
    processed: results.length,
    enriched,
    emails_found: emailsFound,
    details: enrichResults.map((r) => ({
      id: r.id,
      emails: r.emails_found,
      best_email: r.best_email,
      phones: r.phones_found,
      pages_checked: r.pages_checked,
    })),
  });
}
