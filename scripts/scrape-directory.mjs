/**
 * Directory Scraper — extracts structured business listings via Playwright
 * Usage: node scripts/scrape-directory.mjs <category> <zip> [pages]
 * Output: JSON array to stdout
 */

import { chromium } from "playwright";

const category = process.argv[2] || "doctors";
const zip = process.argv[3] || "89101";
const maxPages = parseInt(process.argv[4] || "3");

async function scrapeYelp(browser, category, zip, pages) {
  const results = [];
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  for (let p = 0; p < pages; p++) {
    const page = await context.newPage();
    const start = p * 10;
    const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(zip + " Las Vegas NV")}&start=${start}`;

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(2000);

      const listings = await page.evaluate(() => {
        const items = [];
        // Yelp search result cards
        const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
        if (cards.length === 0) {
          // Fallback: try other selectors
          const links = document.querySelectorAll('a[href*="/biz/"]');
          const seen = new Set();
          links.forEach(link => {
            const name = link.textContent?.trim();
            if (name && name.length > 2 && name.length < 80 && !seen.has(name)) {
              seen.add(name);
              items.push({ name, phone: null, address: null, url: link.href });
            }
          });
        } else {
          cards.forEach(card => {
            const nameEl = card.querySelector('a[href*="/biz/"] span');
            const phoneEl = card.querySelector('[class*="phone"]');
            const name = nameEl?.textContent?.trim();
            if (name) {
              items.push({
                name,
                phone: phoneEl?.textContent?.trim() || null,
                address: null,
                url: nameEl?.closest('a')?.href || null,
              });
            }
          });
        }
        return items;
      });

      results.push(...listings);
    } catch (e) {
      process.stderr.write(`Yelp page ${p} error: ${e.message}\n`);
    }
    await page.close();
  }

  await context.close();
  return results;
}

async function scrapeYellowPages(browser, category, zip, pages) {
  const results = [];
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  for (let p = 1; p <= pages; p++) {
    const page = await context.newPage();
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    const url = `https://www.yellowpages.com/las-vegas-nv-${zip}/${slug}?page=${p}`;

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(2000);

      const listings = await page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('.result');
        cards.forEach(card => {
          const nameEl = card.querySelector('.business-name span, .business-name a');
          const phoneEl = card.querySelector('.phones.phone.primary');
          const addrEl = card.querySelector('.adr');
          const name = nameEl?.textContent?.trim();
          if (name) {
            items.push({
              name,
              phone: phoneEl?.textContent?.trim() || null,
              address: addrEl?.textContent?.trim() || null,
              url: null,
            });
          }
        });
        return items;
      });

      results.push(...listings);
    } catch (e) {
      process.stderr.write(`YP page ${p} error: ${e.message}\n`);
    }
    await page.close();
  }

  await context.close();
  return results;
}

async function scrapeGoogleMaps(browser, category, zip) {
  const results = [];
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  });
  const page = await context.newPage();

  try {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(category + " " + zip + " Las Vegas NV")}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Scroll the results panel to load more
    const feed = page.locator('[role="feed"]');
    for (let i = 0; i < 3; i++) {
      await feed.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(1500);
    }

    const listings = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('[role="feed"] > div > div > a');
      cards.forEach(card => {
        const label = card.getAttribute('aria-label');
        if (label && label.length > 2) {
          items.push({ name: label, phone: null, address: null, url: card.href });
        }
      });
      return items;
    });

    results.push(...listings);
  } catch (e) {
    process.stderr.write(`Google Maps error: ${e.message}\n`);
  }

  await page.close();
  await context.close();
  return results;
}

// Main
const browser = await chromium.launch({ headless: true });

process.stderr.write(`Scraping "${category}" in ${zip}...\n`);

const [yelpResults, ypResults, gmapsResults] = await Promise.all([
  scrapeYelp(browser, category, zip, maxPages),
  scrapeYellowPages(browser, category, zip, maxPages),
  scrapeGoogleMaps(browser, category, zip),
]);

process.stderr.write(`Yelp: ${yelpResults.length}, YP: ${ypResults.length}, GMaps: ${gmapsResults.length}\n`);

// Deduplicate by name
const seen = new Set();
const all = [];

for (const r of [...ypResults, ...yelpResults, ...gmapsResults]) {
  const key = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!seen.has(key) && r.name.length > 2) {
    seen.add(key);
    all.push({
      company_name: r.name,
      contact_name: null,
      phone: r.phone || null,
      address: r.address || null,
      website: r.url || null,
      category: category,
      source_url: "yelp/yp/gmaps",
    });
  }
}

process.stderr.write(`Total unique: ${all.length}\n`);
process.stdout.write(JSON.stringify(all, null, 2));

await browser.close();
