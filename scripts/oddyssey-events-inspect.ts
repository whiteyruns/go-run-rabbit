/**
 * Inspection helper: enumerate every event on the AREA15 Ticketure admin
 * so we can find any older Noir event IDs (pre-April 2026). The main
 * scraper uses TICKETURE_EVENT_ID_NOIR = fc98eefb... but that event
 * returns 0 sessions for Feb–Mar, suggesting earlier Noir shows lived
 * under a different event UUID.
 *
 * Dumps:
 *   - data/oddyssey-noir/inspect/events.json  (name + uuid for each)
 *   - data/oddyssey-noir/inspect/events-page.html  (raw for manual poking)
 */
import { chromium, type Page } from "playwright";
import path from "path";
import fs from "fs/promises";

async function loginIfNeeded(page: Page, email: string, password: string) {
  const onLogin = await page
    .getByRole("heading", { name: /sign in/i })
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  if (!onLogin) return;
  const staffBtn = page.getByRole("button", { name: /new staff account login/i });
  if (await staffBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await staffBtn.click();
    await page.waitForTimeout(1500);
  }
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => null),
    page.getByRole("button", { name: /^sign in$|^log in$|^login$/i }).click(),
  ]);
}

async function main() {
  const BASE = process.env.TICKETURE_BASE_URL!;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT!;
  const EMAIL = process.env.TICKETURE_EMAIL!;
  const PASSWORD = process.env.TICKETURE_PASSWORD!;

  const outDir = path.resolve("data/oddyssey-noir/inspect");
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Probe several candidate event-list URLs.
    const tries = [
      `${BASE}/${ACCOUNT}/events`,
      `${BASE}/${ACCOUNT}/event`,
      `${BASE}/${ACCOUNT}/`,
      `${BASE}/${ACCOUNT}`,
    ];

    let landingUrl: string | null = null;
    for (const url of tries) {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
      await loginIfNeeded(page, EMAIL, PASSWORD);
      // After login re-navigate because login often redirects home.
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);
      const title = await page.title();
      console.log(`${url} → landed on ${page.url()}  title=${title}`);
      if (!page.url().includes("404")) {
        landingUrl = page.url();
        break;
      }
    }

    if (!landingUrl) throw new Error("no landing URL worked");

    // Dump top-level links with event UUIDs from the iframe or main page
    // (Ticketure admin is iframe-based).
    const extractEventLinks = async () => {
      const iframeEl = await page.locator("iframe").first().elementHandle().catch(() => null);
      const frame = iframeEl ? await iframeEl.contentFrame() : null;
      const ctx = frame ?? page;
      return await ctx.evaluate(() => {
        const events: { name: string; id: string; href: string }[] = [];
        const seen = new Set<string>();
        const anchors = Array.from(document.querySelectorAll("a, [data-href]"));
        for (const a of anchors) {
          const href = a.getAttribute("href") || a.getAttribute("data-href") || "";
          const m = href.match(/\/event\/([a-f0-9-]{32,})/i);
          if (!m) continue;
          const id = m[1].toLowerCase();
          if (seen.has(id)) continue;
          seen.add(id);
          const text = (a.textContent || "").trim().slice(0, 120).replace(/\s+/g, " ");
          events.push({ name: text, id, href });
        }
        return events;
      });
    };

    let events = await extractEventLinks();
    console.log(`\nFound ${events.length} event links on landing page.`);

    // If only one or two events appear, try the "all events" or archived
    // tab that some admin UIs hide behind a filter.
    if (events.length < 5) {
      // Look for a filter/dropdown offering "All" or "Archived"
      const iframeEl = await page.locator("iframe").first().elementHandle().catch(() => null);
      const frame = iframeEl ? await iframeEl.contentFrame() : null;
      const buttons = await (frame ?? page)
        .evaluate(() =>
          Array.from(document.querySelectorAll("button, a, [role='tab']"))
            .map((el) => ({ text: (el.textContent || "").trim().slice(0, 60), tag: el.tagName }))
            .filter((x) => x.text),
        );
      await fs.writeFile(path.join(outDir, "events-nav.json"), JSON.stringify(buttons, null, 2));
      console.log(`Wrote events-nav.json (${buttons.length} candidates) — look for filter/archive toggles.`);
    }

    await fs.writeFile(path.join(outDir, "events.json"), JSON.stringify(events, null, 2));
    const html = await page.content();
    await fs.writeFile(path.join(outDir, "events-page.html"), html);

    await page.screenshot({ path: path.join(outDir, "events-page.png"), fullPage: true });

    console.log("\nEvents discovered:");
    for (const e of events) {
      console.log(`  ${e.id}  ${e.name}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
