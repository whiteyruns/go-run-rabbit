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

async function dismissCookieBanner(page: Page) {
  const btn = page.getByRole("button", { name: /accept all/i }).first();
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function pickLocation(page: Page, targetLabel: string) {
  // Open the "All locations" dropdown
  await page.getByRole("button", { name: /locations/i }).first().click({ timeout: 5000 });
  await page.waitForTimeout(400);

  // Uncheck the "All locations" master so only our target is selected
  const allCb = page.getByRole("checkbox", { name: /^all locations$/i });
  if (await allCb.isChecked().catch(() => false)) {
    await allCb.click();
    await page.waitForTimeout(200);
  }

  // Check target venue only
  const target = page.getByRole("checkbox", { name: new RegExp(`^${targetLabel}$`, "i") });
  if (!(await target.isChecked().catch(() => false))) {
    await target.click();
  }
  await page.waitForTimeout(400);

  // Dismiss the dropdown by clicking the page heading area
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

async function pickDate(page: Page, slashDate: string) {
  // Open the date picker — the button shows the current date like "04/23/2026"
  await page.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}$/ }).first().click({ timeout: 5000 });
  await page.waitForTimeout(400);

  // Square's date picker typically offers a text input. Find the first one
  // inside the open popover and set it.
  const input = page.locator("input[placeholder*='MM'], input[type='text']").first();
  if (await input.isVisible({ timeout: 1500 }).catch(() => false)) {
    await input.fill(slashDate);
    await input.press("Enter");
  } else {
    // Fallback: click the date number in the calendar grid
    const [, , day] = slashDate.split("/").map(Number);
    await page.locator(`button:has-text("${day}")`).first().click().catch(() => {});
  }
  await page.waitForTimeout(1000);
}

async function scrapeSalesSummary(page: Page) {
  // Scrape via in-page evaluate — find each label's text node and walk
  // up to the closest ancestor that also contains a $-formatted sibling.
  // Row structure in Square's UI differs between <tr> and flex/grid
  // layouts, so a generic walk-up is more resilient than an xpath.
  const labels = ["Gross Sales", "Returns", "Discounts & Comps", "Net Sales", "Taxes"];
  const raw = await page.evaluate((lbls) => {
    const out: Record<string, string | null> = {};
    const isMoney = (s: string) => /\$?-?\s*[0-9][0-9,]*(?:\.[0-9]{2})?/.test(s);

    for (const label of lbls) {
      out[label] = null;
      // Walk all text nodes; find one whose trimmed value matches the label
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = (node.nodeValue || "").trim();
        if (text !== label) continue;
        // Walk up to find a container with a $ sibling
        let el: HTMLElement | null = node.parentElement;
        for (let depth = 0; depth < 8 && el; depth++, el = el.parentElement) {
          const full = (el.textContent || "").trim();
          // Must still contain the label AND a $ amount that isn't the label
          const stripped = full.replace(label, "").trim();
          if (isMoney(stripped)) {
            // Find the $ substring nearest to the label
            const m = stripped.match(/-?\$?\s*[0-9][0-9,]*(?:\.[0-9]{2})?/);
            if (m) { out[label] = m[0]; break; }
          }
        }
        if (out[label] != null) break;
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

  try {
    const url = "https://app.squareup.com/dashboard/sales/reports/sales-summary";
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Bail early if we landed on login
    if (/\/login|signin/i.test(page.url())) {
      throw new Error("session expired — re-run oddyssey-square-bootstrap.ts");
    }

    // Dismiss OneTrust cookie banner if it's covering the page. Its
    // "Accept all" button sets consent cookies; we persist them back
    // to the auth file at the end so subsequent runs skip this step.
    await dismissCookieBanner(page);

    await pickDate(page, toSlashDate(date));
    await pickLocation(page, LOCATION_LABEL[venue]);

    // Wait for the actual Net Sales row to render (not just the page
    // shell). Generous timeout — Square's summary can take a beat.
    await page
      .getByText(/Net Sales/i)
      .first()
      .waitFor({ timeout: 30_000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    const data = await scrapeSalesSummary(page);
    console.log(`[square] scraped: net=$${data.net_sales ?? "—"} gross=$${data.gross_sales ?? "—"}`);

    const outPath = path.join(outDir, `${date}.json`);
    await fs.writeFile(
      outPath,
      JSON.stringify(
        {
          venue,
          date,
          pulled_at: new Date().toISOString(),
          ...data,
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
