import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { extractDomain, parseName, generatePermutations, verifyEmailMx } from "@/lib/email-finder";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const CONTACT_PATHS = ["", "/contact", "/contact-us", "/about"];

const GENERIC_PREFIXES = new Set([
  "info", "contact", "hello", "office", "admin", "support", "help",
  "reception", "frontdesk", "front.desk", "general", "mail", "email",
  "enquiries", "inquiries", "inquiry", "sales", "marketing", "team",
  "hr", "careers", "jobs", "billing", "accounts", "noreply", "no-reply",
  "no.reply", "donotreply", "do-not-reply", "unsubscribe", "newsletter",
  "mailer", "notifications", "alerts", "webmaster", "postmaster",
  "abuse", "spam", "security", "legal", "compliance", "press", "media",
  "pr", "feedback", "service", "customerservice", "customer.service",
  "error-lite", "error", "privacy", "terms", "copyright", "dmca",
]);

function isGenericEmail(email: string): boolean {
  return GENERIC_PREFIXES.has(email.split("@")[0].toLowerCase());
}

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (isGenericEmail(lower)) return true;
  const junkDomains = ["example.com", "sentry.io", "wixpress.com", "schema.org", "w3.org",
    "googleusercontent.com", "cloudflare.com", "googleapis.com", "gstatic.com",
    "gravatar.com", "wordpress.org", "wp.com", "squarespace.com",
    "duckduckgo.com", "google.com", "bing.com", "yahoo.com", "yandex.com",
    "baidu.com", "facebook.com", "twitter.com", "instagram.com", "linkedin.com",
    "youtube.com", "tiktok.com", "pinterest.com", "reddit.com",
    "yelp.com", "yellowpages.com", "bbb.org", "avvo.com", "justia.com",
    "findlaw.com", "martindale.com", "lawyers.com", "nolo.com",
    "vercel.app", "netlify.app", "herokuapp.com", "github.com"];
  for (const d of junkDomains) { if (lower.includes(d)) return true; }
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) return true;
  if (lower.length > 50) return true;
  return false;
}

function scoreEmail(email: string, domain: string | null, contactName: string | null): number {
  const localPart = email.split("@")[0].toLowerCase();
  const emailDomain = email.split("@")[1]?.toLowerCase();
  let score = 0;

  if (domain && emailDomain === domain) score += 20;
  else if (domain) return -100;
  if (isGenericEmail(email)) return -100;

  if (contactName) {
    const name = parseName(contactName);
    if (name) {
      const f = name.firstName.toLowerCase();
      const l = name.lastName.toLowerCase();
      if (localPart === `${f}.${l}` || localPart === `${f}${l}`) score += 50;
      if (localPart === `${f[0]}${l}`) score += 40;
      if (localPart.includes(f) && localPart.includes(l)) score += 30;
      if (localPart.includes(l)) score += 15;
      if (localPart.includes(f)) score += 10;
    }
  }

  if (/^[a-z]+\.[a-z]+$/.test(localPart)) score += 5;
  return score;
}

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function extractEmails(html: string): string[] {
  const found: string[] = [];

  // Standard regex extraction
  const standard = html.match(EMAIL_REGEX);
  if (standard) found.push(...standard);

  // Also decode mailto: links
  const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi);
  if (mailtoMatches) {
    for (const m of mailtoMatches) {
      found.push(m.replace(/^mailto:/i, ""));
    }
  }

  // Decode HTML entities: &#64; = @, &#46; = .
  const decoded = html.replace(/&#64;/g, "@").replace(/&#46;/g, ".").replace(/&#x40;/g, "@").replace(/&#x2e;/g, ".");
  const decodedEmails = decoded.match(EMAIL_REGEX);
  if (decodedEmails) found.push(...decodedEmails);

  // Check for [at] and [dot] obfuscation
  const deobf = html.replace(/\s*\[at\]\s*/gi, "@").replace(/\s*\(at\)\s*/gi, "@")
    .replace(/\s*\[dot\]\s*/gi, ".").replace(/\s*\(dot\)\s*/gi, ".");
  const deobfEmails = deobf.match(EMAIL_REGEX);
  if (deobfEmails) found.push(...deobfEmails);

  return found
    .map((e) => e.toLowerCase().trim())
    .filter((e) => !isJunkEmail(e))
    .filter((v, i, a) => a.indexOf(v) === i);
}

/* ── Strategy 0: Playwright headless browser (bypasses 403s) ──────── */
const PLAYWRIGHT_URL = "http://localhost:3115/scrape";

async function strategyPlaywright(website: string, domain: string, contactName: string | null): Promise<string | null> {
  try {
    const res = await fetch(PLAYWRIGHT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: website, domain }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const emails: string[] = data.emails || [];
    const domainEmails = emails.filter((e: string) => e.endsWith(`@${domain}`) && !isGenericEmail(e));

    if (domainEmails.length > 0) {
      const scored = domainEmails
        .map((e: string) => ({ email: e, score: scoreEmail(e, domain, contactName) }))
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
      if (scored[0].score > 0) return scored[0].email;
    }
  } catch {
    // Playwright service not running or timed out — fall through
  }
  return null;
}

/* ── Strategy 1: Scrape company website (plain fetch fallback) ────── */
async function strategyWebsiteScrape(website: string, domain: string, contactName: string | null): Promise<string | null> {
  const baseUrl = website.replace(/\/$/, "");

  for (const path of CONTACT_PATHS) {
    const url = path ? `${baseUrl}${path}` : baseUrl;
    const html = await fetchPage(url);
    if (!html) continue;

    const emails = extractEmails(html);
    const domainEmails = emails.filter((e) => e.endsWith(`@${domain}`) && !isGenericEmail(e));

    if (domainEmails.length > 0) {
      const scored = domainEmails
        .map((e) => ({ email: e, score: scoreEmail(e, domain, contactName) }))
        .sort((a, b) => b.score - a.score);
      if (scored[0].score > 0) return scored[0].email;
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return null;
}

/* ── Strategy 2: Google dork for email ────────────────────────────── */
async function strategyGoogleDork(contactName: string, companyName: string | null, domain: string | null): Promise<string | null> {
  // REQUIRE a domain — without one we can't filter results and get junk
  if (!domain) return null;

  const queries = [
    `"${contactName}" "@${domain}"`,
    `"${contactName}" email ${domain}`,
  ];

  for (const query of queries) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const html = await fetchPage(searchUrl);
      if (!html) continue;

      const emails = extractEmails(html);

      // ONLY accept emails matching the company domain
      const relevant = emails.filter((e) => e.endsWith(`@${domain}`) && !isGenericEmail(e));

      if (relevant.length > 0) {
        const scored = relevant
          .map((e) => ({ email: e, score: scoreEmail(e, domain, contactName) }))
          .sort((a, b) => b.score - a.score);
        if (scored[0].score > 0) return scored[0].email;
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch {
      continue;
    }
  }

  return null;
}

/* ── Strategy 3: Business listing search (requires domain) ────────── */
async function strategyBusinessListing(companyName: string, contactName: string | null, domain: string | null): Promise<string | null> {
  // Without a domain we can't filter search results reliably
  if (!domain) return null;

  const query = encodeURIComponent(`${companyName} email @${domain}`);

  try {
    const html = await fetchPage(`https://html.duckduckgo.com/html/?q=${query}`);
    if (!html) return null;

    // ONLY accept emails matching the company domain
    const emails = extractEmails(html).filter((e) => e.endsWith(`@${domain}`) && !isGenericEmail(e));
    if (emails.length > 0) {
      const scored = emails
        .map((e) => ({ email: e, score: scoreEmail(e, domain, contactName) }))
        .sort((a, b) => b.score - a.score);
      if (scored[0].score > 0) return scored[0].email;
    }
  } catch {
    // ignore
  }

  return null;
}

/* ── Strategy 4: Pattern guess (last resort) ──────────────────────── */
function strategyPatternGuess(contactName: string, domain: string): string | null {
  const name = parseName(contactName);
  if (!name) return null;
  const perms = generatePermutations(name.firstName, name.lastName, domain);
  const personal = perms.filter((e) => !isGenericEmail(e));
  return personal[0] || null;
}

/* ── Main enrichment endpoint ─────────────────────────────────────── */

interface EnrichDetail {
  id: string;
  email: string | null;
  method: string;
  email_status: string;
  strategies_tried: string[];
}

export async function POST(request: NextRequest) {
  const { job_id, result_ids, batch_size, strategy } = await request.json();

  if (!job_id) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const limit = batch_size || 5;
  const startTime = Date.now();
  const MAX_TIME = 25000; // 25 second max to stay under timeout

  // Which strategies to run
  const strategies = strategy
    ? [strategy]
    : ["playwright", "website-scrape", "google-dork", "pattern-guess"];

  let query = supabase
    .from("cbm_scrape_results")
    .select("id, website, company_name, contact_name, phone, email")
    .eq("job_id", job_id)
    .or("email.is.null,email.like.%25duckduckgo%25")
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
    return NextResponse.json({ message: "No results to enrich", enriched: 0, remaining: 0 });
  }

  const { count } = await supabase
    .from("cbm_scrape_results")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id)
    .is("email", null);

  let enriched = 0;
  let emailsFound = 0;
  const details: EnrichDetail[] = [];

  // Clean existing generic emails first
  const { data: genericResults } = await supabase
    .from("cbm_scrape_results")
    .select("id, email")
    .eq("job_id", job_id)
    .not("email", "is", null);

  let genericsCleaned = 0;
  if (genericResults) {
    for (const r of genericResults) {
      if (r.email && (isGenericEmail(r.email) || isJunkEmail(r.email))) {
        await supabase.from("cbm_scrape_results").update({ email: null, email_status: null, email_method: null }).eq("id", r.id);
        genericsCleaned++;
      }
    }
  }

  for (const result of results) {
    // Bail if we're running out of time
    if (Date.now() - startTime > MAX_TIME) break;

    let foundEmail: string | null = null;
    let method = "none";
    const triedStrategies: string[] = [];

    const domain = result.website ? extractDomain(result.website) : null;

    // Run strategies in order until one finds an email
    for (const strat of strategies) {
      if (foundEmail) break;
      triedStrategies.push(strat);

      switch (strat) {
        case "playwright":
          if (result.website && domain) {
            foundEmail = await strategyPlaywright(result.website, domain, result.contact_name);
            if (foundEmail) method = "playwright";
          }
          break;

        case "website-scrape":
          if (result.website && domain) {
            foundEmail = await strategyWebsiteScrape(result.website, domain, result.contact_name);
            if (foundEmail) method = "website-scrape";
          }
          break;

        case "google-dork":
          if (result.contact_name) {
            foundEmail = await strategyGoogleDork(result.contact_name, result.company_name, domain);
            if (foundEmail) method = "google-dork";
          }
          break;

        case "business-listing":
          if (result.company_name) {
            foundEmail = await strategyBusinessListing(result.company_name, result.contact_name, domain);
            if (foundEmail) method = "business-listing";
          }
          break;

        case "pattern-guess":
          if (result.contact_name && domain) {
            foundEmail = strategyPatternGuess(result.contact_name, domain);
            if (foundEmail) method = "pattern-guess";
          }
          break;
      }

      // Small delay between strategies
      await new Promise((r) => setTimeout(r, 200));
    }

    let emailStatus = "none";

    if (foundEmail) {
      // Verify email via MX lookup
      try {
        const mxResult = await verifyEmailMx(foundEmail);
        if (mxResult.hasMx) {
          emailStatus = method === "pattern-guess" ? "pattern-guess" : "mx-valid";
        } else {
          emailStatus = "invalid";
          foundEmail = null; // Don't save invalid emails
        }
      } catch {
        emailStatus = "unverified";
      }
    }

    if (foundEmail) {
      await supabase
        .from("cbm_scrape_results")
        .update({ email: foundEmail, email_status: emailStatus, email_method: method })
        .eq("id", result.id);
      enriched++;
      emailsFound++;
    }

    details.push({ id: result.id, email: foundEmail, method, email_status: emailStatus, strategies_tried: triedStrategies });

    // Delay between results
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({
    processed: results.length,
    enriched,
    emails_found: emailsFound,
    generics_cleaned: genericsCleaned,
    remaining: (count || 0) - results.length,
    strategies_used: strategies,
    details,
  });
}
