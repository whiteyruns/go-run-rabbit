import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { extractDomain, parseName, generatePermutations } from "@/lib/email-finder";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const CONTACT_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us", "/team", "/attorneys", "/our-team", "/staff", "/people"];

// Generic emails to ALWAYS skip — these won't get answered
const GENERIC_PREFIXES = new Set([
  "info", "contact", "hello", "office", "admin", "support", "help",
  "reception", "frontdesk", "front.desk", "general", "mail", "email",
  "enquiries", "inquiries", "inquiry", "sales", "marketing", "team",
  "hr", "careers", "jobs", "billing", "accounts", "noreply", "no-reply",
  "no.reply", "donotreply", "do-not-reply", "unsubscribe", "newsletter",
  "mailer", "notifications", "alerts", "webmaster", "postmaster",
  "abuse", "spam", "security", "legal", "compliance", "press", "media",
  "pr", "feedback", "service", "customerservice", "customer.service",
]);

function isGenericEmail(email: string): boolean {
  const localPart = email.split("@")[0].toLowerCase();
  return GENERIC_PREFIXES.has(localPart);
}

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (isGenericEmail(lower)) return true;
  if (lower.includes("example.com")) return true;
  if (lower.includes("sentry.io")) return true;
  if (lower.includes("wixpress.com")) return true;
  if (lower.includes("schema.org")) return true;
  if (lower.includes("w3.org")) return true;
  if (lower.includes("googleusercontent")) return true;
  if (lower.includes("cloudflare")) return true;
  if (lower.includes("googleapis.com")) return true;
  if (lower.includes("gstatic.com")) return true;
  if (lower.includes("facebook.com") && !lower.includes("@facebook.com")) return true;
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) return true;
  if (lower.length > 50) return true;
  return false;
}

function scoreEmail(email: string, domain: string | null, contactName: string | null): number {
  const localPart = email.split("@")[0].toLowerCase();
  const emailDomain = email.split("@")[1]?.toLowerCase();
  let score = 0;

  // Must match company domain
  if (domain && emailDomain === domain) score += 20;
  else if (domain) return -100; // wrong domain = useless

  // Generic = skip entirely
  if (isGenericEmail(email)) return -100;

  // Match against contact name
  if (contactName) {
    const name = parseName(contactName);
    if (name) {
      const f = name.firstName.toLowerCase();
      const l = name.lastName.toLowerCase();
      // Exact first.last match
      if (localPart === `${f}.${l}` || localPart === `${f}${l}`) score += 50;
      // First initial + last
      if (localPart === `${f[0]}${l}`) score += 40;
      // Contains first or last name
      if (localPart.includes(f) && localPart.includes(l)) score += 30;
      if (localPart.includes(l)) score += 15;
      if (localPart.includes(f)) score += 10;
    }
  }

  // Personal-looking patterns
  if (/^[a-z]+\.[a-z]+$/.test(localPart)) score += 5;
  if (/^[a-z][a-z]+$/.test(localPart) && localPart.length > 3) score += 3;

  return score;
}

async function scrapePageEmails(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    if (!res.ok) return [];
    const html = await res.text();
    const found = html.match(EMAIL_REGEX) || [];
    return found
      .map((e) => e.toLowerCase().trim())
      .filter((e) => !isJunkEmail(e))
      .filter((v, i, a) => a.indexOf(v) === i);
  } catch {
    return [];
  }
}

async function findEmailForResult(result: {
  id: string;
  website: string | null;
  company_name: string | null;
  contact_name: string | null;
}): Promise<{ email: string | null; method: string }> {
  if (!result.website) return { email: null, method: "no-website" };

  const domain = extractDomain(result.website);
  if (!domain) return { email: null, method: "bad-domain" };

  const baseUrl = result.website.replace(/\/$/, "");
  const allEmails: string[] = [];

  // Scrape website pages for emails
  for (const path of CONTACT_PATHS) {
    const url = path ? `${baseUrl}${path}` : baseUrl;
    const emails = await scrapePageEmails(url);
    allEmails.push(...emails);

    // If we found personal emails from the company domain, stop
    const domainMatches = emails.filter((e) => e.endsWith(`@${domain}`) && !isGenericEmail(e));
    if (domainMatches.length > 0) break;

    await new Promise((r) => setTimeout(r, 200));
  }

  // Deduplicate
  const unique = allEmails.filter((v, i, a) => a.indexOf(v) === i);

  if (unique.length === 0) {
    // No emails found on website — generate best guess from name
    if (result.contact_name) {
      const name = parseName(result.contact_name);
      if (name) {
        const perms = generatePermutations(name.firstName, name.lastName, domain);
        // Return the most common pattern as a best guess (marked as unverified)
        const personalPerms = perms.filter((e) => !isGenericEmail(e));
        if (personalPerms.length > 0) {
          return { email: personalPerms[0], method: "pattern-guess" };
        }
      }
    }
    return { email: null, method: "none-found" };
  }

  // Score and pick the best personal email
  const scored = unique
    .map((e) => ({ email: e, score: scoreEmail(e, domain, result.contact_name) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return { email: scored[0].email, method: "website-personal" };
  }

  // No personal match — try any domain-matching email that's not generic
  const domainEmails = unique.filter((e) => e.endsWith(`@${domain}`) && !isGenericEmail(e));
  if (domainEmails.length > 0) {
    return { email: domainEmails[0], method: "website-domain-match" };
  }

  // Last resort — pattern guess from name
  if (result.contact_name) {
    const name = parseName(result.contact_name);
    if (name) {
      const perms = generatePermutations(name.firstName, name.lastName, domain);
      const personalPerms = perms.filter((e) => !isGenericEmail(e));
      if (personalPerms.length > 0) {
        return { email: personalPerms[0], method: "pattern-guess" };
      }
    }
  }

  return { email: null, method: "only-generic" };
}

export async function POST(request: NextRequest) {
  const { job_id, result_ids, batch_size } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const limit = batch_size || 15; // Process in small batches to avoid timeout

  let query = supabase
    .from("cbm_scrape_results")
    .select("id, website, company_name, contact_name, phone, email")
    .eq("job_id", job_id)
    .is("email", null)
    .not("website", "is", null)
    .limit(limit);

  if (result_ids?.length) {
    query = supabase
      .from("cbm_scrape_results")
      .select("id, website, company_name, contact_name, phone, email")
      .eq("job_id", job_id)
      .in("id", result_ids)
      .limit(limit);
  }

  const { data: results, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!results || results.length === 0) {
    return NextResponse.json({ message: "No results to enrich (all have emails or no websites)", enriched: 0, remaining: 0 });
  }

  // Count remaining without email for progress
  const { count } = await supabase
    .from("cbm_scrape_results")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id)
    .is("email", null)
    .not("website", "is", null);

  let enriched = 0;
  let emailsFound = 0;
  const details: { id: string; email: string | null; method: string }[] = [];

  for (const result of results) {
    const { email, method } = await findEmailForResult(result);

    if (email) {
      await supabase
        .from("cbm_scrape_results")
        .update({ email })
        .eq("id", result.id);
      enriched++;
      emailsFound++;
    }

    details.push({ id: result.id, email, method });
  }

  // Also clean up any existing generic emails
  const { data: genericResults } = await supabase
    .from("cbm_scrape_results")
    .select("id, email")
    .eq("job_id", job_id)
    .not("email", "is", null);

  let genericsCleaned = 0;
  if (genericResults) {
    for (const r of genericResults) {
      if (r.email && isGenericEmail(r.email)) {
        await supabase
          .from("cbm_scrape_results")
          .update({ email: null })
          .eq("id", r.id);
        genericsCleaned++;
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    enriched,
    emails_found: emailsFound,
    generics_cleaned: genericsCleaned,
    remaining: (count || 0) - results.length,
    details,
  });
}
