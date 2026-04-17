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
    await page.goto(attendeesUrl, { waitUntil: "networkidle" }).catch(() => {});

    // 2. Login flow. Ticketure shows a Legacy login form + a "New staff
    //    account login" button for SSO-style auth. For @consultant.area15
    //    accounts we typically need the staff path.
    const onLogin = await page
      .getByRole("heading", { name: /sign in/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (onLogin) {
      console.log("[pull] login page detected");

      // Try the explicit staff account button first, since the email is
      // @consultant.area15.com (corporate SSO). If that button isn't there
      // or SSO kicks us to something we can't fill, fall through to legacy.
      const staffBtn = page.getByRole("button", { name: /new staff account login/i });
      const useStaff = await staffBtn.isVisible({ timeout: 1500 }).catch(() => false);

      if (useStaff) {
        console.log("[pull] clicking 'New staff account login'");
        await Promise.all([
          page.waitForLoadState("networkidle").catch(() => {}),
          staffBtn.click(),
        ]);
        await page.waitForTimeout(1500);

        await page
          .screenshot({ path: path.join(outDir, "last-after-staff-click.png") })
          .catch(() => {});
      }

      // Whether we arrived via staff SSO or are still on the legacy form,
      // fill the visible email + password fields. Use multiple strategies
      // so a changed label doesn't break us silently.
      const emailField =
        (await page.locator('input[type="email"]').count()) > 0
          ? page.locator('input[type="email"]').first()
          : page.getByLabel(/email/i).first();
      const pwField =
        (await page.locator('input[type="password"]').count()) > 0
          ? page.locator('input[type="password"]').first()
          : page.getByLabel(/password/i).first();

      await emailField.click({ timeout: 5000 });
      await emailField.fill(EMAIL);
      await pwField.click({ timeout: 5000 });
      await pwField.fill(PASSWORD);

      // Verify values actually stuck before submitting — helps us detect
      // when Playwright is filling the wrong elements.
      const filledEmail = await emailField.inputValue().catch(() => "");
      const filledPw = await pwField.inputValue().catch(() => "");
      console.log(
        `[pull] filled — email length=${filledEmail.length}, pw length=${filledPw.length}`
      );
      if (filledEmail.length === 0 || filledPw.length === 0) {
        await page.screenshot({ path: path.join(outDir, "last-fill-empty.png") }).catch(() => {});
        throw new Error("Login fields did not accept input — check selectors");
      }

      await page.screenshot({ path: path.join(outDir, "last-before-submit.png") }).catch(() => {});

      // Submit
      const submit = page.getByRole("button", { name: /^sign in$|^log in$|^login$/i });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => null),
        submit.click(),
      ]);

      // Post-submit — ensure we reach the attendees URL (not stuck on login).
      const stillOnLogin = await page
        .getByRole("heading", { name: /sign in/i })
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (stillOnLogin) {
        await page.screenshot({ path: path.join(outDir, "last-login-failed.png") }).catch(() => {});
        throw new Error("Login appeared to fail — still on sign-in page after submit");
      }

      await page.goto(attendeesUrl, { waitUntil: "networkidle" });
    }

    // 3. Wait for the attendees list to render ("Showing all N attendees").
    await page
      .getByText(/showing all \d+ attendees?|no attendees/i)
      .first()
      .waitFor({ timeout: 20000 })
      .catch(() => {});

    // Save a diagnostic screenshot BEFORE the menu click so we can debug
    // selector issues without re-running the whole pull.
    await page
      .screenshot({
        path: path.join(outDir, "last-before-menu.png"),
        fullPage: false,
      })
      .catch(() => {});

    // 4. Click the ⋮ (three-dot) menu. It's a small icon-only button
    //    near the REDEEMED/UNREDEEMED chips. Try several patterns, then
    //    dump a button inventory on failure so we can tune the selector.
    let menuOpened = false;
    const kebabCandidates = [
      page.getByRole("button", { name: /more|options|menu|actions/i }),
      page.locator("button[aria-haspopup]"),
      page.locator("button[aria-label]").filter({ hasText: "" }),
      // SVG "dots" icon variants
      page.locator('button:has(svg[class*="dot" i])'),
      page.locator('button:has(svg[data-icon*="ellipsis" i])'),
      // Button with exactly 3 dots as text
      page.locator('button:text-is("⋮"), button:text-is("…"), button:text-is("...")'),
      // Fallback: icon-only button near the filter row
      page.getByRole("button", { name: /unredeemed/i })
        .locator("xpath=ancestor::*[1]/following::button[1]"),
    ];
    for (const loc of kebabCandidates) {
      try {
        if (await loc.first().isVisible({ timeout: 1500 })) {
          await loc.first().click({ timeout: 3000 });
          menuOpened = true;
          break;
        }
      } catch {
        /* try next */
      }
    }

    // If still stuck, look for the export menu item directly — sometimes
    // the menu is always mounted, just hidden. Clicking the item may work.
    if (!menuOpened) {
      const exportDirect = page.getByText(/export to csv/i).first();
      if (await exportDirect.isVisible({ timeout: 1000 }).catch(() => false)) {
        menuOpened = true; // treat as opened — fall through to click below
      }
    }

    if (!menuOpened) {
      // Dump every visible button so we can tune the selector next round.
      const buttons = await page.locator("button:visible").all();
      console.log(`[pull] kebab candidates — ${buttons.length} visible buttons:`);
      for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        const box = await b.boundingBox().catch(() => null);
        const text = ((await b.textContent()) ?? "").trim().slice(0, 30);
        const aria = (await b.getAttribute("aria-label").catch(() => "")) ?? "";
        const cls = ((await b.getAttribute("class").catch(() => "")) ?? "").slice(0, 40);
        console.log(
          `  [${i}] ${box ? `${Math.round(box.width)}x${Math.round(box.height)} @(${Math.round(box.x)},${Math.round(box.y)})` : "no box"} text="${text}" aria="${aria}" class="${cls}"`
        );
      }
      throw new Error("Could not locate the ⋮ menu button on the attendees page");
    }

    // 5. Click "Export to CSV" in the popup.
    const exportItem = page.getByText(/export to csv/i).first();
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      exportItem.click({ timeout: 5000 }),
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
