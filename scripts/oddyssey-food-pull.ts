/**
 * Oddyssey Manor — Ticketure Food Inclusions Auto-Pull
 *
 * Logs into the AREA15 Ticketure admin, navigates to the Oddyssey Manor
 * Attendees view filtered to a date range, triggers the "Export to CSV"
 * action, and saves the downloaded file.
 *
 * Usage:
 *   tsx scripts/oddyssey-food-pull.ts                     # today's date (local)
 *   tsx scripts/oddyssey-food-pull.ts --date=2026-04-17   # specific date
 *   tsx scripts/oddyssey-food-pull.ts --from=... --until=... --out=...
 *
 * Required env vars (set in .env.local on the Mac Mini, NOT committed):
 *   TICKETURE_BASE_URL   e.g. "https://area15.ticketure.com"
 *   TICKETURE_ACCOUNT    e.g. "area15"  (the URL slug after the domain)
 *   TICKETURE_EMAIL      your login email
 *   TICKETURE_PASSWORD   your login password
 *   TICKETURE_EVENT_ID   the Oddyssey Manor event UUID
 *                        (e.g. "aae027cd-6f4b-a4dc-7c8e-d7390487d5b1")
 *
 * Output:
 *   ./data/oddyssey-food/pulls/attendees-<date>-<timestamp>.csv
 *   ./data/oddyssey-food/pulls/latest.csv   (symlink copy of most recent)
 */
import { chromium, type Download } from "playwright";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

interface Args {
  from?: string; // ISO date (local)
  until?: string; // ISO date (local)
  date?: string; // "YYYY-MM-DD" shorthand
  out?: string;
  headless?: boolean;
}

function parseArgs(): Args {
  const out: Args = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (key === "from") out.from = val;
    else if (key === "until") out.until = val;
    else if (key === "date") out.date = val;
    else if (key === "out") out.out = val;
    else if (key === "headless") out.headless = val !== "false";
  }
  return out;
}

// Builds ISO-Z timestamps that match Ticketure's URL format
// (from=2026-04-17T07:00:00.000Z&until=2026-04-18T07:00:00.000Z — this is
// midnight Pacific presented as UTC). We use Pacific local midnight since
// AREA15 is in Las Vegas.
function pacificMidnightUtc(date: string): string {
  // date = "YYYY-MM-DD" -> treat as Pacific midnight. PT is UTC-7 (PDT) or
  // UTC-8 (PST). We use UTC-7 which matches the screenshots Keith sent
  // (07:00:00.000Z). For a more correct version, use a tz library later.
  return `${date}T07:00:00.000Z`;
}

function nextDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function main() {
  const args = parseArgs();

  const BASE = process.env.TICKETURE_BASE_URL;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT;
  const EMAIL = process.env.TICKETURE_EMAIL;
  const PASSWORD = process.env.TICKETURE_PASSWORD;
  const EVENT_ID = process.env.TICKETURE_EVENT_ID;

  if (!BASE || !ACCOUNT || !EMAIL || !PASSWORD || !EVENT_ID) {
    console.error(
      "[pull] Missing env vars. Need TICKETURE_BASE_URL, TICKETURE_ACCOUNT, TICKETURE_EMAIL, TICKETURE_PASSWORD, TICKETURE_EVENT_ID"
    );
    process.exit(1);
  }

  const date = args.date ?? todayLocal();
  const from = args.from ?? pacificMidnightUtc(date);
  const until = args.until ?? pacificMidnightUtc(nextDate(date));

  const outDir = args.out ?? path.resolve("data/oddyssey-food/pulls");
  await fs.mkdir(outDir, { recursive: true });

  const headless = args.headless !== false;
  console.log(`[pull] date=${date} from=${from} until=${until} headless=${headless}`);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    // 1. Navigate to the attendees URL. If unauthenticated, Ticketure
    //    should redirect to its login flow.
    const attendeesUrl = `${BASE}/${ACCOUNT}/event/${EVENT_ID}/attendees?from=${encodeURIComponent(from)}&until=${encodeURIComponent(until)}`;
    console.log(`[pull] go ${attendeesUrl}`);
    await page.goto(attendeesUrl, { waitUntil: "domcontentloaded" });

    // 2. Login flow: heuristic — if we see an email input, log in.
    //    Adjust selectors once we know the exact login form.
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("[pull] login page detected — submitting credentials");
      await emailInput.fill(EMAIL);
      const pwInput = page.locator('input[type="password"]').first();
      await pwInput.fill(PASSWORD);
      // Submit — try a few common patterns
      const submit = page
        .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")')
        .first();
      await Promise.all([
        page.waitForLoadState("domcontentloaded"),
        submit.click(),
      ]);

      // After login, Ticketure may redirect to a dashboard instead of the
      // attendees URL. Navigate there explicitly.
      await page.goto(attendeesUrl, { waitUntil: "domcontentloaded" });
    }

    // 3. Wait for the attendees list to render.
    await page.waitForSelector("text=attendees", { timeout: 15000 }).catch(() => {});

    // 4. Click the ⋮ (three-dot) menu. Ticketure shows it at the top-right
    //    of the list header. There's no stable role, so we look for an
    //    SVG button adjacent to the REDEEMED/UNREDEEMED chips. Fall back
    //    to any button containing an ellipsis / kebab icon.
    const kebab = page
      .locator('button:has(svg)')
      .filter({ hasNot: page.locator("text=/redeemed|unredeemed|filter/i") })
      .last();
    await kebab.click({ timeout: 10000 });

    // 5. Click "Export to CSV" in the popup menu.
    const exportItem = page.getByText(/export to csv/i).first();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      exportItem.click(),
    ]);

    // 6. Save with a timestamped name + copy to latest.csv
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `attendees-${date}-${ts}.csv`;
    const outPath = path.join(outDir, filename);
    await (download as Download).saveAs(outPath);

    const latestPath = path.join(outDir, "latest.csv");
    await fs.copyFile(outPath, latestPath);

    // Also write a metadata file for the API to surface
    const metaPath = path.join(outDir, "latest.json");
    const stat = await fs.stat(outPath);
    await fs.writeFile(
      metaPath,
      JSON.stringify(
        {
          filename,
          path: outPath,
          pulled_at: new Date().toISOString(),
          date,
          from,
          until,
          size_bytes: stat.size,
        },
        null,
        2
      )
    );

    console.log(`[pull] saved: ${outPath}`);
    console.log(`[pull] latest: ${latestPath}`);
  } catch (err) {
    console.error("[pull] failed:", err);
    process.exitCode = 1;
    // Write an error screenshot to help debug selector issues
    const shotPath = path.join(outDir, "last-error.png");
    await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
    if (existsSync(shotPath)) console.error(`[pull] screenshot: ${shotPath}`);
  } finally {
    await browser.close();
  }
}

main();
