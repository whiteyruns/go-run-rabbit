/**
 * Square Sales Summary scraper.
 *
 * Loads the persisted auth state from oddyssey-square-bootstrap.ts and
 * scrapes Net Sales for a given venue + reporting day off the
 * app.squareup.com/dashboard/sales/reports/sales-summary page.
 *
 * Usage:
 *   tsx scripts/oddyssey-square-pull.ts --venue=manor --date=2026-04-18
 *   tsx scripts/oddyssey-square-pull.ts --venue=noir  --date=2026-04-18
 *   tsx scripts/oddyssey-square-pull.ts --venue=manor                 (default date = yesterday)
 *
 * Square's "reporting day" is 8 AM → 8 AM next day, which already
 * captures the full show night (Manor 6:30–10 PM stays in the same
 * reporting day; Noir 10 PM–3 AM also rolls up to that reporting day).
 * We pass the show date directly — no manual cutoff math.
 *
 * Output:
 *   data/oddyssey-square/<venue>/<date>.json
 *
 * JSON schema:
 *   { venue, date, pulled_at, net_sales, gross_sales, taxes,
 *     discounts_and_comps, returns, source: { url, reporting_day_label } }
 */

import { chromium, type Page } from "playwright";
import fs from "fs/promises";
import path from "path";

interface Args {
  venue?: "manor" | "noir";
  date?: string;
  headless?: boolean;
}

function parseArgs(): Args {
  const out: Args = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "date") out.date = v;
    else if (k === "venue" && (v === "manor" || v === "noir")) out.venue = v;
    else if (k === "headless") out.headless = v !== "false";
  }
  return out;
}

function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The Square dashboard expects MM/DD/YYYY in the URL + UI.
function toSlashDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

const LOCATION_LABEL: Record<"manor" | "noir", string> = {
  manor: "Oddyssey Manor",
  noir: "Oddyssey Noir",
};

const AUTH_PATH = path.resolve("data/.square-auth.json");
const OUT_DIR = path.resolve("data/oddyssey-square");

/** Parse "$1,234.56" → 1234.56. Returns null on miss. */
function parseMoney(s: string | null | undefined): number | null {
  if (!s) return null;
  const neg = /^\(.+\)$/.test(s.trim()) || /^-/.test(s.trim());
  const m = s.match(/\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

async function dismissCookieBanner(page: Page): Promise<boolean> {
  // OneTrust renders the button as a plain <button id="onetrust-accept-btn-handler">
  // with inner text "Accept all cookies". Try a few selectors.
  const selectors = [
    "#onetrust-accept-btn-handler",
    "button:has-text('Accept all cookies')",
    "button:has-text('Accept all')",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click().catch(() => {});
      await page.waitForTimeout(500);
      return true;
    }
  }
  return false;
}

async function pickLocation(page: Page, targetLabel: string) {
  await page.getByRole("button", { name: /locations/i }).first().click({ timeout: 5000 });
  await page.waitForTimeout(500);

  // Reset strategy: click the "All locations" master twice to force a
  // known state (first click toggles state, second click ensures it
  // ends up unchecked). Then check only the target. Uses Playwright's
  // getByRole which routes clicks to the visible label wrapper so
  // React's onChange fires (an input.click() via evaluate skips that).
  const allCb = page.getByRole("checkbox", { name: /^all locations$/i });

  // Ensure everything is checked (All = on) so the next click
  // deterministically unchecks all four.
  if (!(await allCb.isChecked().catch(() => false))) {
    await allCb.click();
    await page.waitForTimeout(200);
  }
  // Now toggle All off — unchecks all venues in one click.
  await allCb.click();
  await page.waitForTimeout(300);

  // Select the target venue.
  const target = page.getByRole("checkbox", { name: new RegExp(`^${targetLabel}$`, "i") });
  await target.click();
  await page.waitForTimeout(600);

  // Close dropdown.
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
}

async function pickDate(page: Page, slashDate: string) {
  // New strategy — bypass the two-input range picker:
  //   1. Open date picker, click "Today" preset → single-day range.
  //   2. Close picker.
  //   3. Click "Select previous date interval" N times to step backwards
  //      to the target day. In Reporting-day mode each arrow = -1 day.
  const triggers = [
    page.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}/ }).first(),
    page.getByRole("button", { name: /reporting day/i }).first(),
  ];
  let opened = false;
  for (const t of triggers) {
    if (await t.isVisible({ timeout: 2000 }).catch(() => false)) {
      await t.click().catch(() => {});
      opened = true;
      break;
    }
  }
  console.log(`[square] date picker opened: ${opened}`);
  if (!opened) return;
  await page.waitForTimeout(600);

  const todayBtn = page.getByRole("button", { name: /^today$/i }).first();
  if (await todayBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await todayBtn.click();
    await page.waitForTimeout(800);
    console.log(`[square] snapped to Today (single-day)`);
  } else {
    console.log(`[square] "Today" preset not visible — aborting`);
    return;
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);

  const today = new Date();
  const [tm, td, ty] = slashDate.split("/").map(Number);
  const target = new Date(ty, tm - 1, td);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDiff = Math.round((todayMidnight.getTime() - target.getTime()) / 86400000);
  console.log(`[square] stepping back ${dayDiff} days to reach ${slashDate}`);

  const prevArrow = page.getByRole("button", { name: /previous date interval/i }).first();
  for (let i = 0; i < Math.abs(dayDiff); i++) {
    await prevArrow.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);

  const after = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"))
      .filter((b) => (b as HTMLElement).offsetParent !== null)
      .map((b) => (b.textContent || "").trim())
      .filter((t) => t.length && t.length < 40);
    return btns.find((t) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) ?? null;
  });
  console.log(`[square] date trigger after nav: ${after}`);
}

/**
 * Top Items live on the Item Sales report page, not the Sales Summary
 * page. Navigates to /dashboard/sales/reports/item-sales (date + location
 * filters persist between report pages) and scrapes the "Top 5 Items:
 * Gross Sales" legend. Items named like "El Bandido Yankee Repo" are
 * the rep-activation fingerprint.
 */
async function scrapeTopItems(
  page: Page,
  locationLabel: string,
): Promise<{ name: string; gross: number }[]> {
  await page.goto("https://app.squareup.com/dashboard/sales/reports/item-sales", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2500);

  // Re-apply the location filter — navigating to a different report
  // page can reset location to "All locations" even when the date carries
  // over. Without this, Manor's top items were coming back as Noir's.
  await pickLocation(page, locationLabel).catch(() => {});
  await page.waitForTimeout(1800);

  return await page.evaluate(() => {
    const out: { name: string; gross: number }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let headerEl: HTMLElement | null = null;
    let node = walker.nextNode();
    while (node) {
      const text = (node.nodeValue || "").trim();
      if (/^top\s*\d*\s*items?:?\s*gross/i.test(text)) {
        headerEl = node.parentElement;
        break;
      }
      node = walker.nextNode();
    }
    if (!headerEl) return [];

    // Walk up until we find a container that encloses both the header
    // and the legend rows (name + money pairs).
    let container: HTMLElement | null = headerEl;
    const moneyRe = /^\$-?[0-9,]+(?:\.[0-9]{2})?$/;
    while (container) {
      const texts: string[] = [];
      const w = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let n = w.nextNode();
      while (n) {
        const t = (n.nodeValue || "").trim();
        if (t) texts.push(t);
        n = w.nextNode();
      }
      const pairs: { name: string; gross: number }[] = [];
      for (let i = 0; i < texts.length - 1; i++) {
        const name = texts[i];
        const amount = texts[i + 1];
        if (
          !moneyRe.test(name) &&
          name.length >= 2 &&
          name.length <= 60 &&
          !/top|gross|items?/i.test(name) &&
          moneyRe.test(amount)
        ) {
          const gross = parseFloat(amount.replace(/[$,]/g, ""));
          if (Number.isFinite(gross)) pairs.push({ name, gross });
        }
      }
      if (pairs.length >= 2) return pairs.slice(0, 10);
      container = container.parentElement;
    }
    return out;
  });
}

async function scrapeSalesSummary(page: Page) {
  // Scrape via in-page evaluate — find each label's text node and walk
  // up to the closest ancestor that also contains a $-formatted sibling.
  // Row structure in Square's UI differs between <tr> and flex/grid
  // layouts, so a generic walk-up is more resilient than an xpath.
  const labels = ["Gross Sales", "Returns", "Discounts & Comps", "Net Sales", "Taxes"];
  // Evaluate body kept as plain JS (no type annotations, no helper
  // functions) — tsx's TypeScript lowering injects a `__name` helper
  // into nested declarations that doesn't exist in the browser.
  const raw: Record<string, string | null> = await page.evaluate((lbls) => {
    const out: Record<string, string | null> = {};
    const moneyRe = /-?\$?\s*[0-9][0-9,]*(?:\.[0-9]{2})?/;
    for (const label of lbls) {
      out[label] = null;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const text = (node.nodeValue || "").trim();
        if (text === label) {
          let el = node.parentElement;
          let depth = 0;
          while (el && depth < 8) {
            const full = (el.textContent || "").trim();
            const stripped = full.split(label).join("").trim();
            const m = stripped.match(moneyRe);
            if (m) { out[label] = m[0]; break; }
            el = el.parentElement;
            depth += 1;
          }
          if (out[label] != null) break;
        }
        node = walker.nextNode();
      }
    }
    return out;
  }, labels);

  const reportingDayLabel = await page
    .getByText(/Reporting day/i)
    .first()
    .textContent()
    .catch(() => null);

  return {
    gross_sales: parseMoney(raw["Gross Sales"]),
    returns: parseMoney(raw["Returns"]),
    discounts_and_comps: parseMoney(raw["Discounts & Comps"]),
    net_sales: parseMoney(raw["Net Sales"]),
    taxes: parseMoney(raw["Taxes"]),
    reporting_day_label: reportingDayLabel?.trim() ?? null,
  };
}

async function main() {
  const args = parseArgs();
  const venue = args.venue ?? "manor";
  const date = args.date ?? yesterdayLocal();
  const headless = args.headless !== false;

  try {
    await fs.access(AUTH_PATH);
  } catch {
    console.error(`[square] missing auth state at ${AUTH_PATH}`);
    console.error("[square] run scripts/oddyssey-square-bootstrap.ts locally first");
    process.exit(1);
  }

  const outDir = path.join(OUT_DIR, venue);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`[square] venue=${venue} date=${date} headless=${headless}`);

  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext({
    storageState: AUTH_PATH,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  const debugDir = path.join(OUT_DIR, "debug");
  await fs.mkdir(debugDir, { recursive: true });
  const snap = async (name: string) => {
    await page.screenshot({ path: path.join(debugDir, `${venue}-${date}-${name}.png`), fullPage: true }).catch(() => {});
  };

  try {
    const url = "https://app.squareup.com/dashboard/sales/reports/sales-summary";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await snap("1-after-goto");
    console.log(`[square] landed on ${page.url()}`);

    // Bail early if we landed on login
    if (/\/login|signin/i.test(page.url())) {
      throw new Error("session expired — re-run oddyssey-square-bootstrap.ts");
    }

    // Dismiss OneTrust cookie banner if it's covering the page.
    const dismissed = await dismissCookieBanner(page);
    console.log(`[square] cookie banner dismissed: ${dismissed}`);
    await snap("2-after-cookie");

    await pickDate(page, toSlashDate(date));
    await snap("3-after-date");
    await pickLocation(page, LOCATION_LABEL[venue]);
    await snap("4-after-location");

    // Wait for the actual Net Sales row to render (not just the page
    // shell). Generous timeout — Square's summary can take a beat.
    const appeared = await page
      .getByText(/Net Sales/i)
      .first()
      .waitFor({ timeout: 30_000 })
      .then(() => true)
      .catch(() => false);
    console.log(`[square] "Net Sales" visible: ${appeared}`);
    await page.waitForTimeout(1000);
    await snap("5-before-scrape");

    // Capture filter state for audit — lets us confirm the date + venue
    // filters actually applied when we reconcile against xlsx values.
    const filterState = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"))
        .filter((b) => (b as HTMLElement).offsetParent !== null)
        .map((b) => (b.textContent || "").trim())
        .filter((t) => t && t.length < 40);
      // Look for any button containing a date (MM/DD/YYYY anywhere in text)
      const dateBtn = btns.find((t) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(t));
      const locBtn = btns.find((t) => /location/i.test(t));
      // Also grab the h1/h2 which shows "Apr 17, 2026" on the report
      const h1 = document.querySelector("h1, h2")?.textContent?.trim() ?? null;
      return {
        date_visible: dateBtn ?? null,
        location_visible: locBtn ?? null,
        page_heading: h1,
        all_top_buttons: btns.slice(0, 12),
      };
    });
    console.log(`[square] filter state: date="${filterState.date_visible}" loc="${filterState.location_visible}" heading="${filterState.page_heading}"`);
    console.log(`[square] top buttons: ${JSON.stringify(filterState.all_top_buttons)}`);

    const data = await scrapeSalesSummary(page);
    const topItems = await scrapeTopItems(page, LOCATION_LABEL[venue]);
    console.log(`[square] scraped: net=$${data.net_sales ?? "—"} gross=$${data.gross_sales ?? "—"} top_items=${topItems.length}`);
    for (const it of topItems.slice(0, 5)) console.log(`  • ${it.name}: $${it.gross.toFixed(2)}`);

    const outPath = path.join(outDir, `${date}.json`);
    await fs.writeFile(
      outPath,
      JSON.stringify(
        {
          venue,
          date,
          pulled_at: new Date().toISOString(),
          ...data,
          top_items: topItems,
          filter_state_at_scrape: filterState,
          source: { url, reporting_day_label: data.reporting_day_label },
        },
        null,
        2,
      ),
    );
    console.log(`[square] saved ${outPath}`);

    // Persist any new cookies (e.g., OneTrust consent) back to the
    // auth file so subsequent runs skip the banner dismissal.
    await ctx.storageState({ path: AUTH_PATH });
  } catch (err) {
    console.error("[square] failed:", err);
    await page
      .screenshot({ path: path.join(OUT_DIR, "last-error.png"), fullPage: true })
      .catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
