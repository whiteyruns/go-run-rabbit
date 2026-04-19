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
  // The Sessions tab shows a Bootstrap datepicker (.datepicker). The
  // header button `.datepicker-switch` shows the current month like
  // "Apr 2026"; `.prev` and `.next` step months. We must navigate to the
  // target month BEFORE clicking the day number — otherwise we click
  // the target day in whatever month the calendar happens to be showing
  // (usually the current month), which is why historical dates silently
  // returned 0 sessions prior to this fix.
  const [targetY, targetM, targetD] = date.split("-").map(Number);
  const targetMonthIdx = targetM - 1; // 0=Jan..11=Dec

  // Read the calendar's current month label + step prev/next until we
  // land on the target. Guard with a hop limit to avoid infinite loops
  // if the datepicker hits its min/max range (Noir's range starts
  // Apr 2025).
  const iframeEl = await page.locator("iframe").first().elementHandle();
  const frame: Frame | null = iframeEl ? await iframeEl.contentFrame() : null;
  if (!frame) {
    console.log("[sessions] could not access iframe content");
    return [];
  }

  const readCurrentMonth = async (): Promise<{ year: number; month: number } | null> => {
    const text = await frame.$eval(".datepicker-switch", (el) => (el.textContent || "").trim()).catch(() => "");
    // Expected formats: "Apr 2026" or "April 2026"
    const m = text.match(/^(\w+)\s+(\d{4})$/);
    if (!m) return null;
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];
    const monthKey = m[1].toLowerCase().slice(0, 3);
    const monthIdx = months.findIndex((n) => n.startsWith(monthKey));
    if (monthIdx < 0) return null;
    return { year: parseInt(m[2], 10), month: monthIdx };
  };

  let cur = await readCurrentMonth();
  console.log(`[sessions] initial calendar month: ${cur ? `${cur.year}-${String(cur.month + 1).padStart(2, "0")}` : "(unreadable)"}`);
  if (cur) {
    const targetIdx = targetY * 12 + targetMonthIdx;
    let curIdx = cur.year * 12 + cur.month;
    let hops = 0;
    while (curIdx !== targetIdx && hops < 48) {
      const selector = curIdx > targetIdx ? "th.prev" : "th.next";
      const arrow = await frame.$(selector);
      if (!arrow) {
        console.log(`[sessions] nav arrow ${selector} missing at hop ${hops}`);
        break;
      }
      await arrow.click();
      await page.waitForTimeout(200);
      const next = await readCurrentMonth();
      if (!next) {
        console.log(`[sessions] lost calendar header at hop ${hops}`);
        break;
      }
      if (next.year === cur.year && next.month === cur.month) {
        console.log(`[sessions] calendar stuck at ${cur.year}-${String(cur.month + 1).padStart(2, "0")} (range min/max?)`);
        break;
      }
      cur = next;
      curIdx = cur.year * 12 + cur.month;
      hops += 1;
    }
    console.log(`[sessions] landed on ${cur.year}-${String(cur.month + 1).padStart(2, "0")} after ${hops} hop(s)`);
    if (curIdx !== targetIdx) return [];
  }

  // Click the target day within the current (now correct) month. Only
  // match cells in the .day class — "old" and "new" classes are used
  // for prev/next month spillover cells which have the same day number.
  const dayCell = flocator.locator(`td.day:not(.old):not(.new):has-text("${targetD}")`).first();
  await dayCell.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);

  const sessions = await frame.evaluate(() => {
    const out: { session_id: string; time_label: string }[] = [];
    const seen: Record<string, boolean> = {};
    const anchors = Array.from(document.querySelectorAll("a, [data-href]"));
    for (const a of anchors) {
      const href = (a.getAttribute("href") || a.getAttribute("data-href") || "");
      const m = href.match(/session\/([a-f0-9-]{32,})/i);
      if (!m) continue;
      const id = m[1].toLowerCase();
      if (seen[id]) continue;
      seen[id] = true;
      const text = (a.textContent || "").trim();
      const timeMatch = text.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/);
      out.push({ session_id: id, time_label: timeMatch ? timeMatch[0] : text.slice(0, 40) });
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

  // Evaluate with a single arrow function body — no nested helpers
  // (tsx/TypeScript downleveling injects __name refs that break in
  // the browser context otherwise).
  const labels = [
    "Tickets Reserved",
    "Tickets Redeemed",
    "Gross Revenue",
    "Total Orders",
    "Tickets (Free)",
    "Tickets (Paid)",
    "Tickets (Held)",
    "Tickets Refunded",
    "Net Revenue to Bank",
    "Revenue Sold",
    "Revenue Refunded",
  ];

  const rawValues = await inner.evaluate((labelsList: string[]) => {
    const result: Record<string, string | null> = {};
    const all = Array.from(document.querySelectorAll("*")) as HTMLElement[];
    for (const label of labelsList) {
      let found: string | null = null;
      for (const el of all) {
        const direct = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.nodeValue || "")
          .join("")
          .trim();
        if (direct.toLowerCase() !== label.toLowerCase()) continue;
        let sib: Element | null = el.nextElementSibling;
        for (let i = 0; i < 3 && sib; i++) {
          const t = (sib.textContent || "").trim();
          if (t) { found = t; break; }
          sib = sib.nextElementSibling;
        }
        if (!found) {
          const parentText = (el.parentElement?.textContent || "").trim();
          if (parentText && parentText !== direct) {
            found = parentText.replace(direct, "").trim();
          }
        }
        if (found) break;
      }
      result[label] = found;
    }
    result["__title"] = document.querySelector("h1, h2")?.textContent?.trim() ?? "";
    return result;
  }, labels);

  function parseMoney(s: string | null): number | null {
    if (!s) return null;
    // Grab the first dollar-looking number (handles "$348.80" prefix variants)
    const m = s.match(/-?\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(/,/g, ""));
    return isNaN(n) ? null : n;
  }
  function parseInt1(s: string | null): number | null {
    if (!s) return null;
    // First integer in the text, not a concat of all digits
    const m = s.match(/-?\d+/);
    if (!m) return null;
    const n = parseInt(m[0], 10);
    return isNaN(n) ? null : n;
  }
  // For "X / Y  Z%" text blocks, extract all three numbers
  function parseRatioPct(s: string | null): { a: number | null; b: number | null; pct: number | null } {
    if (!s) return { a: null, b: null, pct: null };
    const nums = s.match(/-?\d+(?:\.\d+)?/g) ?? [];
    return {
      a: nums[0] !== undefined ? parseFloat(nums[0]) : null,
      b: nums[1] !== undefined ? parseFloat(nums[1]) : null,
      pct: nums[2] !== undefined ? parseFloat(nums[2]) : null,
    };
  }

  const reserved = parseRatioPct(rawValues["Tickets Reserved"]);
  const redeemed = parseRatioPct(rawValues["Tickets Redeemed"]);

  const data = {
    title: rawValues.__title,
    reserved: reserved.a,
    capacity: reserved.b,
    capacity_percent: reserved.pct != null ? reserved.pct / 100 : null,
    redeemed: redeemed.a,
    redeemed_of: redeemed.b,
    redeemed_percent: redeemed.pct != null ? redeemed.pct / 100 : null,
    gross_revenue: parseMoney(rawValues["Gross Revenue"]),
    total_orders: parseInt1(rawValues["Total Orders"]),
    tickets_free: parseInt1(rawValues["Tickets (Free)"]),
    tickets_paid: parseInt1(rawValues["Tickets (Paid)"]),
    tickets_held: parseInt1(rawValues["Tickets (Held)"]),
    tickets_refunded: parseInt1(rawValues["Tickets Refunded"]),
    net_to_bank: parseMoney(rawValues["Net Revenue to Bank"]),
    revenue_sold: parseMoney(rawValues["Revenue Sold"]),
    revenue_refunded: parseMoney(rawValues["Revenue Refunded"]),
    ticket_groups: await scrapeTicketGroups(inner),
  };

  return data;
}

/**
 * Scrape the per-ticket-group breakdown from the session Summary Report.
 *
 * Ticketure renders each group as a `<div class="SessionSummaryTicketGroup">`
 * containing an `<h3 class="SessionSummaryItem__Heading__Major">` with the
 * group name, then a row of `__Overview__Item` blocks, each with a label
 * (`Heading__Minor`) and a main value (`Info__Main`).
 *
 * Only three metrics are exposed per group: Tickets Reserved, Tickets
 * Redeemed, Gross Revenue. Paid/Free/Net breakdowns only exist at the
 * session level, not per-group, so we store just these three.
 *
 * We filter to groups that have activity (reserved > 0 OR revenue > 0)
 * because Ticketure lists every configured group regardless of sales,
 * and showing 17 zero-rows on a 3-active-group night is just noise.
 */
async function scrapeTicketGroups(
  inner: Frame,
): Promise<Array<{
  ticket_group_name: string;
  reserved: number | null;
  redeemed: number | null;
  gross_revenue: number | null;
  // Kept for backwards-compat with the loader type; Ticketure does not
  // expose these per-group so they stay null.
  net_to_bank: number | null;
  tickets_paid: number | null;
  tickets_free: number | null;
  tickets_refunded: number | null;
  revenue_refunded: number | null;
}>> {
  try {
    const scraped = await inner.evaluate(() => {
      const out: { name: string; items: { label: string; value: string }[] }[] = [];
      const blocks = document.querySelectorAll("div.SessionSummaryTicketGroup");
      for (const block of Array.from(blocks)) {
        const h3 = block.querySelector("h3.SessionSummaryItem__Heading__Major");
        const name = (h3?.textContent || "").trim();
        if (!name) continue;
        const items: { label: string; value: string }[] = [];
        const itemEls = block.querySelectorAll(".SessionSummaryTicketGroup__Overview__Item");
        for (const it of Array.from(itemEls)) {
          const lbl = (it.querySelector(".SessionSummaryItem__Heading__Minor")?.textContent || "").trim();
          const val = (it.querySelector(".SessionSummaryItem__Info__Main")?.textContent || "").trim();
          if (lbl) items.push({ label: lbl, value: val });
        }
        out.push({ name, items });
      }
      return out;
    });

    const parseMoneyT = (s: string | undefined): number | null => {
      if (!s) return null;
      const m = s.match(/-?\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
      if (!m) return null;
      const n = parseFloat(m[1].replace(/,/g, ""));
      return isNaN(n) ? null : n;
    };
    const parseIntT = (s: string | undefined): number | null => {
      if (!s) return null;
      const m = s.match(/-?\d+/);
      if (!m) return null;
      const n = parseInt(m[0], 10);
      return isNaN(n) ? null : n;
    };

    const results = [];
    for (const g of scraped) {
      const byLabel = new Map(g.items.map((i) => [i.label.toLowerCase(), i.value]));
      const reserved = parseIntT(byLabel.get("tickets reserved"));
      const redeemed = parseIntT(byLabel.get("tickets redeemed"));
      const gross = parseMoneyT(byLabel.get("gross revenue"));
      // Skip inactive groups (ticketure lists every configured group)
      if ((reserved ?? 0) === 0 && (gross ?? 0) === 0) continue;
      results.push({
        ticket_group_name: g.name,
        reserved,
        redeemed,
        gross_revenue: gross,
        net_to_bank: null,
        tickets_paid: null,
        tickets_free: null,
        tickets_refunded: null,
        revenue_refunded: null,
      });
    }

    console.log(`[sessions] scraped ${results.length} active ticket group rows (of ${scraped.length} configured)`);
    return results;
  } catch (err) {
    console.warn("[sessions] ticket-group scrape failed:", err);
    return [];
  }
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
