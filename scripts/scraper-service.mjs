/**
 * Playwright Scraper Service
 * Runs on Mac Mini as a lightweight HTTP server on port 3110
 * Accepts URLs, renders them in a real browser, returns emails found
 *
 * Start: node scripts/scraper-service.mjs
 */

import http from "http";
import { chromium } from "playwright";

const PORT = 3115;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const GENERIC_PREFIXES = new Set([
  "info", "contact", "hello", "office", "admin", "support", "help",
  "reception", "frontdesk", "front.desk", "general", "mail", "email",
  "enquiries", "inquiries", "sales", "marketing", "team", "hr",
  "careers", "jobs", "billing", "accounts", "noreply", "no-reply",
  "donotreply", "unsubscribe", "newsletter", "mailer", "notifications",
  "webmaster", "postmaster", "abuse", "spam", "security", "legal",
  "compliance", "press", "media", "pr", "feedback", "service",
  "error-lite", "error", "privacy", "terms", "copyright",
]);

const BLOCKED_DOMAINS = new Set([
  "duckduckgo.com", "google.com", "bing.com", "yahoo.com", "yandex.com",
  "avvo.com", "justia.com", "yelp.com", "yellowpages.com", "findlaw.com",
  "martindale.com", "lawyers.com", "facebook.com", "linkedin.com",
  "twitter.com", "instagram.com", "reddit.com", "wikipedia.org",
  "squarespace-cdn.com", "googleapis.com", "gstatic.com", "cloudflare.com",
  "sentry.io", "schema.org", "w3.org", "gravatar.com", "wordpress.org",
]);

function isJunk(email) {
  const lower = email.toLowerCase();
  const [local, domain] = lower.split("@");
  if (GENERIC_PREFIXES.has(local)) return true;
  if (BLOCKED_DOMAINS.has(domain)) return true;
  if (lower.length > 50) return true;
  return false;
}

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

async function scrapeUrl(url, targetDomain) {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  const emails = new Set();
  const phones = new Set();

  // Capture emails from all network responses too
  page.on("response", async (response) => {
    try {
      if (response.headers()["content-type"]?.includes("text")) {
        const body = await response.text();
        const found = body.match(EMAIL_REGEX) || [];
        found.forEach((e) => {
          if (!isJunk(e)) emails.add(e.toLowerCase());
        });
      }
    } catch { /* ignore */ }
  });

  const PATHS = ["", "/contact", "/contact-us", "/about"];

  for (const path of PATHS) {
    try {
      const fullUrl = path ? `${url.replace(/\/$/, "")}${path}` : url;
      await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(1500); // Let JS render

      // Get rendered HTML (after JS execution)
      const html = await page.content();

      // Extract emails
      const found = html.match(EMAIL_REGEX) || [];
      found.forEach((e) => {
        if (!isJunk(e)) emails.add(e.toLowerCase());
      });

      // Also check for obfuscated emails
      const deobf = html
        .replace(/&#64;/g, "@").replace(/&#46;/g, ".")
        .replace(/&#x40;/g, "@").replace(/&#x2e;/g, ".")
        .replace(/\s*\[at\]\s*/gi, "@").replace(/\s*\(at\)\s*/gi, "@")
        .replace(/\s*\[dot\]\s*/gi, ".").replace(/\s*\(dot\)\s*/gi, ".");
      const deobfFound = deobf.match(EMAIL_REGEX) || [];
      deobfFound.forEach((e) => {
        if (!isJunk(e)) emails.add(e.toLowerCase());
      });

      // Extract phones
      const phoneMatches = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
      phoneMatches.forEach((p) => phones.add(p));

      // If we found domain-matching emails, stop checking more pages
      if (targetDomain && [...emails].some((e) => e.endsWith(`@${targetDomain}`))) {
        break;
      }
    } catch {
      // Page load failed, try next path
    }
  }

  await context.close();

  // Filter and sort results
  const allEmails = [...emails];
  const domainEmails = targetDomain
    ? allEmails.filter((e) => e.endsWith(`@${targetDomain}`))
    : allEmails;

  return {
    emails: domainEmails.length > 0 ? domainEmails : allEmails,
    phones: [...phones],
    pagesChecked: PATHS.length,
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/scrape") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { url, domain } = JSON.parse(body);
        if (!url) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "url required" }));
          return;
        }
        const result = await scrapeUrl(url, domain);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", browser: browser?.isConnected() || false }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Playwright scraper service running on port ${PORT}`);
});

// Cleanup on exit
process.on("SIGINT", async () => {
  if (browser) await browser.close();
  process.exit();
});
