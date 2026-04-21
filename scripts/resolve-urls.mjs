/**
 * Resolve Google Maps URLs to real websites using Playwright + Google search
 * Usage: echo '[{"id":"...","company_name":"Firm Name"}]' | node scripts/resolve-urls.mjs
 */

import { chromium } from "playwright";

const BLOCKED = new Set([
  "google.com", "bing.com", "duckduckgo.com", "yahoo.com",
  "yelp.com", "yellowpages.com", "facebook.com", "linkedin.com",
  "twitter.com", "instagram.com", "avvo.com", "justia.com",
  "findlaw.com", "martindale.com", "wikipedia.org", "reddit.com",
  "bbb.org", "mapquest.com", "youtube.com", "tiktok.com",
  "apple.com", "nolo.com", "lawyers.com", "superlawyers.com",
  "thumbtack.com", "angieslist.com", "nextdoor.com",
]);

function isValidWebsite(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (BLOCKED.has(host)) return false;
    if (host.split(".").length < 2) return false;
    return true;
  } catch {
    return false;
  }
}

let input = "";
process.stdin.setEncoding("utf-8");
for await (const chunk of process.stdin) {
  input += chunk;
}

const firms = JSON.parse(input);
const browser = await chromium.launch({ headless: true });
const results = [];

for (let i = 0; i < firms.length; i++) {
  const firm = firms[i];
  process.stderr.write(`[${i + 1}/${firms.length}] ${firm.company_name}...`);

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  });
  const page = await context.newPage();

  let foundUrl = null;

  try {
    // Google search for the firm
    const query = encodeURIComponent(`${firm.company_name} Las Vegas law firm website`);
    await page.goto(`https://www.google.com/search?q=${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    await page.waitForTimeout(1500);

    // Extract URLs from search results
    const urls = await page.evaluate((blockedList) => {
      const links = [];
      // Google search result links
      const anchors = document.querySelectorAll("a[href]");
      anchors.forEach((a) => {
        const href = a.href;
        if (href && href.startsWith("http") && !href.includes("google.com")) {
          links.push(href);
        }
      });
      return links;
    }, [...BLOCKED]);

    // Find first valid website
    for (const url of urls) {
      if (isValidWebsite(url)) {
        // Clean up URL — remove tracking params
        try {
          const parsed = new URL(url);
          foundUrl = `${parsed.protocol}//${parsed.hostname}`;
        } catch {
          foundUrl = url;
        }
        break;
      }
    }
  } catch (e) {
    process.stderr.write(` error: ${e.message}\n`);
  }

  await context.close();

  results.push({ id: firm.id, company_name: firm.company_name, website: foundUrl });
  process.stderr.write(` ${foundUrl || "not found"}\n`);

  // Small delay between searches
  await new Promise((r) => setTimeout(r, 500));
}

await browser.close();
process.stdout.write(JSON.stringify(results, null, 2));
