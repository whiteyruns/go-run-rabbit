/**
 * Oddyssey session-level Summary Report scraper.
 *
 * For a given venue + date, enumerates the sessions on the event's
 * Sessions tab, then scrapes each session's Summary Report page for
 * the authoritative numbers (free vs paid, net-to-bank, per-group
 * revenue) that the Attendees CSV can't provide.
 *
 * Output:
 *   data/oddyssey-<venue>/summaries/<date>.json
 *
 * Usage:
 *   tsx scripts/oddyssey-sessions-pull.ts --venue=manor
 *   tsx scripts/oddyssey-sessions-pull.ts --venue=noir --date=2026-04-17
 *   tsx scripts/oddyssey-sessions-pull.ts --venue=manor --date=2026-04-17 --headless=false
 */
import { chromium, type Frame, type FrameLocator, type Page } from "playwright";
import path from "path";
import fs from "fs/promises";

interface Args {
  venue?: "manor" | "noir";
  date?: string;
  headless?: boolean;
}

const VENUE_ENV: Record<"manor" | "noir", string> = {
  manor: "TICKETURE_EVENT_ID",
  noir: "TICKETURE_EVENT_ID_NOIR",
};
const VENUE_DIR: Record<"manor" | "noir", string> = {
  manor: "data/oddyssey-food/summaries",
  noir: "data/oddyssey-noir/summaries",
};

function parseArgs(): Args {
  const out: Args = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (key === "date") out.date = val;
    else if (key === "venue" && (val === "manor" || val === "noir")) out.venue = val;
    else if (key === "headless") out.headless = val !== "false";
  }
  return out;
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Common Ticketure login flow — reused from oddyssey-food-pull.ts logic. */
async function loginIfNeeded(page: Page, email: string, password: string) {
  const onLogin = await page
    .getByRole("heading", { name: /sign in/i })
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  if (!onLogin) return;

  console.log("[sessions] login page detected");
  const staffBtn = page.getByRole("button", { name: /new staff account login/i });
  if (await staffBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await Promise.all([
      page.waitForLoadState("networkidle").catch(() => {}),
      staffBtn.click(),
    ]);
    await page.waitForTimeout(1500);
  }
  const emailField =
    (await page.locator('input[type="email"]').count()) > 0
      ? page.locator('input[type="email"]').first()
      : page.getByLabel(/email/i).first();
  const pwField =
    (await page.locator('input[type="password"]').count()) > 0
      ? page.locator('input[type="password"]').first()
      : page.getByLabel(/password/i).first();
  await emailField.fill(email);
  await pwField.fill(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => null),
    page.getByRole("button", { name: /^sign in$|^log in$|^login$/i }).click(),
  ]);
}

/**
 * Enumerate sessions for a given date from the event Sessions tab.
 * Returns an array of { session_id, time_iso, time_label } objects.
 *
 * Ticketure renders sessions as clickable cards inside the iframe. We
 * inspect `<a>`/`<div>` elements with hrefs or onclicks matching the
 * session URL pattern and extract the UUIDs.
 */
async function enumerateSessions(page: Page, flocator: FrameLocator, date: string) {
  // The Sessions tab shows a calendar. Click the target date first.
  const [, , d] = date.split("-").map(Number);
  const targetDay = d;
  const dayCell = flocator
    .locator(`td:has-text("${targetDay}"), button:has-text("${targetDay}")`)
    .first();
  await dayCell.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);

  // Get the actual Frame object so we can call evaluate()
  const iframeEl = await page.locator("iframe").first().elementHandle();
  const frame: Frame | null = iframeEl ? await iframeEl.contentFrame() : null;
  if (!frame) {
    console.log("[sessions] could not access iframe content");
    return [];
  }

  const sessions = await frame.evaluate(() => {
    const out: { session_id: string; time_label: string }[] = [];
    const seen = new Set<string>();
    const anchors = Array.from(document.querySelectorAll("a, [data-href]")) as HTMLElement[];
    for (const a of anchors) {
      const href = (a.getAttribute("href") ?? a.getAttribute("data-href") ?? "") as string;
      const m = href.match(/session\/([a-f0-9-]{32,})/i);
      if (!m) continue;
      const id = m[1].toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      // Find a nearby time label (the session cell usually contains a time like "6:30 PM")
      const text = (a.textContent ?? "").trim();
      const timeMatch = text.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/);
      out.push({ session_id: id, time_label: timeMatch?.[0] ?? text.slice(0, 40) });
    }
    return out;
  });

  console.log(`[sessions] enumerated ${sessions.length} session UUIDs for ${date}`);
  return sessions;
}

/** Scrape a single session's Summary Report. Returns parsed numbers. */
async function scrapeSessionSummary(
  page: Page,
  baseUrl: string,
  account: string,
  sessionId: string
) {
  const url = `${baseUrl}/${account}/session/${sessionId}`;
  console.log(`[sessions] scraping ${url}`);
  await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});

  // Session summary also lives inside an iframe (same pattern as Attendees).
  const frame = page.frameLocator("iframe").first();

  // Wait for the summary content — look for a known label.
  await frame
    .getByText(/Tickets Reserved/i)
    .first()
    .waitFor({ timeout: 15000 })
    .catch(() => {});

  // Evaluate the iframe's DOM to extract labeled numbers.
  const iframeEl = await page.locator("iframe").first().elementHandle();
  const inner = iframeEl ? await iframeEl.contentFrame() : null;
  if (!inner) return null;

  const data = await inner.evaluate(() => {
    // Helper: find element with trimmed text equal to label, return the
    // next sibling's / nearest number-looking text.
    function labelValue(label: string): string | null {
      const all = Array.from(document.querySelectorAll("*")) as HTMLElement[];
      for (const el of all) {
        const direct = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.nodeValue ?? "")
          .join("")
          .trim();
        if (direct.toLowerCase() === label.toLowerCase()) {
          // Look in following siblings for a value
          let sib: Element | null = el.nextElementSibling;
          for (let i = 0; i < 3 && sib; i++) {
            const t = (sib.textContent ?? "").trim();
            if (t) return t;
            sib = sib.nextElementSibling;
          }
          // Otherwise, look in parent's text content after this label
          const parentText = (el.parentElement?.textContent ?? "").trim();
          if (parentText && parentText !== direct) return parentText.replace(direct, "").trim();
        }
      }
      return null;
    }

    function parseMoney(s: string | null): number | null {
      if (!s) return null;
      const m = s.replace(/[^0-9.\-]/g, "");
      const n = parseFloat(m);
      return isNaN(n) ? null : n;
    }
    function parseInt1(s: string | null): number | null {
      if (!s) return null;
      const m = s.replace(/[^0-9\-]/g, "");
      const n = parseInt(m, 10);
      return isNaN(n) ? null : n;
    }

    return {
      title: document.querySelector("h1, h2")?.textContent?.trim() ?? "",
      reserved_text: labelValue("Tickets Reserved"),
      redeemed_text: labelValue("Tickets Redeemed"),
      gross_revenue_text: labelValue("Gross Revenue"),
      total_orders_text: labelValue("Total Orders"),
      tickets_free_text: labelValue("Tickets (Free)"),
      tickets_paid_text: labelValue("Tickets (Paid)"),
      tickets_held_text: labelValue("Tickets (Held)"),
      tickets_refunded_text: labelValue("Tickets Refunded"),
      net_to_bank_text: labelValue("Net Revenue to Bank"),
      revenue_sold_text: labelValue("Revenue Sold"),
      revenue_refunded_text: labelValue("Revenue Refunded"),
      // Parsed derived values:
      reserved_num: parseInt1(labelValue("Tickets Reserved")),
      redeemed_num: parseInt1(labelValue("Tickets Redeemed")),
      gross_revenue_num: parseMoney(labelValue("Gross Revenue")),
      total_orders_num: parseInt1(labelValue("Total Orders")),
      tickets_free_num: parseInt1(labelValue("Tickets (Free)")),
      tickets_paid_num: parseInt1(labelValue("Tickets (Paid)")),
      tickets_held_num: parseInt1(labelValue("Tickets (Held)")),
      tickets_refunded_num: parseInt1(labelValue("Tickets Refunded")),
      net_to_bank_num: parseMoney(labelValue("Net Revenue to Bank")),
      revenue_sold_num: parseMoney(labelValue("Revenue Sold")),
      revenue_refunded_num: parseMoney(labelValue("Revenue Refunded")),
    };
  });

  return data;
}

async function main() {
  const args = parseArgs();
  const venue = args.venue ?? "manor";
  const date = args.date ?? todayLocal();
  const headless = args.headless !== false;

  const BASE = process.env.TICKETURE_BASE_URL;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT;
  const EMAIL = process.env.TICKETURE_EMAIL;
  const PASSWORD = process.env.TICKETURE_PASSWORD;
  const EVENT_ID = process.env[VENUE_ENV[venue]];
  if (!BASE || !ACCOUNT || !EMAIL || !PASSWORD || !EVENT_ID) {
    console.error("[sessions] Missing env vars");
    process.exit(1);
  }

  const outDir = path.resolve(VENUE_DIR[venue]);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`[sessions] venue=${venue} date=${date} headless=${headless}`);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Go to the event Sessions tab. Login if needed.
    const sessionsUrl = `${BASE}/${ACCOUNT}/event/${EVENT_ID}/sessions`;
    console.log(`[sessions] go ${sessionsUrl}`);
    await page.goto(sessionsUrl, { waitUntil: "networkidle" }).catch(() => {});
    await loginIfNeeded(page, EMAIL, PASSWORD);
    await page.goto(sessionsUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const frame = page.frameLocator("iframe").first();

    // 2. Enumerate session UUIDs for the target date.
    const sessions = await enumerateSessions(page, frame, date);
    if (sessions.length === 0) {
      await page.screenshot({ path: path.join(outDir, "last-no-sessions.png"), fullPage: true }).catch(() => {});
      throw new Error(`No sessions enumerated for ${date} — screenshot saved`);
    }

    // 3. For each session, navigate and scrape.
    const results: Array<{
      session_id: string;
      time_label: string;
      data: Awaited<ReturnType<typeof scrapeSessionSummary>>;
    }> = [];

    for (const s of sessions) {
      const data = await scrapeSessionSummary(page, BASE, ACCOUNT, s.session_id);
      results.push({ session_id: s.session_id, time_label: s.time_label, data });
    }

    // 4. Write results.
    const outPath = path.join(outDir, `${date}.json`);
    await fs.writeFile(
      outPath,
      JSON.stringify(
        {
          venue,
          date,
          pulled_at: new Date().toISOString(),
          event_id: EVENT_ID,
          sessions: results,
        },
        null,
        2
      )
    );
    console.log(`[sessions] saved ${outPath} (${results.length} sessions)`);
  } catch (err) {
    console.error("[sessions] failed:", err);
    process.exitCode = 1;
    await page.screenshot({ path: path.join(outDir, "last-error.png"), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
