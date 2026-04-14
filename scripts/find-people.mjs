/**
 * People Finder — scrapes firm websites for individual attorney/staff names
 * Uses Playwright to render JS and extract from /team, /attorneys, /about pages
 *
 * Usage: echo '[{"company_name":"Firm","website":"https://..."}]' | node scripts/find-people.mjs
 * Output: JSON array of people found
 */

import { chromium } from "playwright";

const NAME_REGEX = /(?:^|\s)([A-Z][a-z]{1,15}\s+(?:[A-Z]\.?\s+)?[A-Z][a-z]{2,20})(?:\s|,|$)/g;

const TEAM_PATHS = [
  "/attorneys", "/our-attorneys", "/team", "/our-team", "/people",
  "/about", "/about-us", "/staff", "/lawyers", "/our-lawyers",
  "/partners", "/professionals", "/leadership",
];

const TITLE_KEYWORDS = [
  "attorney", "lawyer", "partner", "associate", "counsel", "of counsel",
  "shareholder", "member", "principal", "director", "managing",
  "founder", "president", "ceo", "esquire", "esq",
  "doctor", "dr", "physician", "dentist", "surgeon", "dermatologist",
];

function extractDomain(url) {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

async function findPeopleAtFirm(browser, firm) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const domain = extractDomain(firm.website);
  const baseUrl = firm.website.replace(/\/$/, "");
  const people = [];
  const seenNames = new Set();

  for (const path of TEAM_PATHS) {
    const page = await context.newPage();
    try {
      const url = `${baseUrl}${path}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
      await page.waitForTimeout(1500);

      const found = await page.evaluate((titleKeywords) => {
        const results = [];

        // Strategy 1: Look for heading elements near title keywords
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, strong, b, .attorney-name, .team-name, .name, [class*='name'], [class*='attorney'], [class*='lawyer'], [class*='team-member']");
        headings.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 4 && text.length < 50) {
            // Check if it looks like a name (2-4 capitalized words)
            const words = text.split(/\s+/);
            if (words.length >= 2 && words.length <= 5) {
              const allCapped = words.every(w => /^[A-Z]/.test(w));
              if (allCapped) {
                // Check nearby text for title keywords
                const parent = el.closest("div, li, article, section");
                const context = parent?.textContent?.toLowerCase() || "";
                const hasTitle = titleKeywords.some(k => context.includes(k));
                results.push({ name: text, hasTitle, source: "heading" });
              }
            }
          }
        });

        // Strategy 2: Look for structured lists/grids of people
        const cards = document.querySelectorAll("[class*='team'], [class*='staff'], [class*='attorney'], [class*='lawyer'], [class*='member'], [class*='person'], [class*='profile']");
        cards.forEach(card => {
          const nameEl = card.querySelector("h2, h3, h4, strong, .name, [class*='name']");
          const name = nameEl?.textContent?.trim();
          if (name && name.length > 4 && name.length < 50) {
            const words = name.split(/\s+/);
            if (words.length >= 2 && words.length <= 5 && words.every(w => /^[A-Z]/.test(w))) {
              results.push({ name, hasTitle: true, source: "card" });
            }
          }
        });

        return results;
      }, TITLE_KEYWORDS);

      for (const person of found) {
        const cleanName = person.name.replace(/,.*$/, "").replace(/\s+(Esq|Jr|Sr|III|II|IV|PhD|MD|JD)\.?$/i, "").trim();
        if (cleanName.length > 4 && !seenNames.has(cleanName.toLowerCase())) {
          seenNames.add(cleanName.toLowerCase());
          people.push({
            name: cleanName,
            firm: firm.company_name,
            domain: domain,
            website: firm.website,
            source_page: path,
          });
        }
      }

      // If we found people, no need to check more paths
      if (people.length > 0) {
        await page.close();
        break;
      }
    } catch {
      // Page didn't load
    }
    await page.close();
  }

  await context.close();
  return people;
}

// Main — read firms from stdin
let input = "";
process.stdin.setEncoding("utf-8");
for await (const chunk of process.stdin) {
  input += chunk;
}

const firms = JSON.parse(input);
const browser = await chromium.launch({ headless: true });

const allPeople = [];

for (let i = 0; i < firms.length; i++) {
  const firm = firms[i];
  if (!firm.website) continue;

  process.stderr.write(`[${i + 1}/${firms.length}] ${firm.company_name}...\n`);

  try {
    const people = await findPeopleAtFirm(browser, firm);
    allPeople.push(...people);
    if (people.length > 0) {
      process.stderr.write(`  Found ${people.length}: ${people.map(p => p.name).join(", ")}\n`);
    } else {
      process.stderr.write(`  No people found\n`);
    }
  } catch (e) {
    process.stderr.write(`  Error: ${e.message}\n`);
  }
}

await browser.close();

process.stderr.write(`\nTotal: ${allPeople.length} people at ${firms.length} firms\n`);
process.stdout.write(JSON.stringify(allPeople, null, 2));
