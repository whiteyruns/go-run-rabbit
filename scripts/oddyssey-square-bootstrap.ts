/**
 * One-time Square login bootstrap.
 *
 * Square's Developer Console is owner-only (403 for Team Members), so
 * we can't get a Personal Access Token — we scrape the dashboard while
 * logged in, same pattern as our Ticketure pulls.
 *
 * This script opens a real (non-headless) Chromium window so you can
 * complete Square's email + password + 2FA flow manually. When you're
 * signed in and looking at the dashboard, press ENTER in the terminal.
 * The authenticated browser context is saved to data/.square-auth.json.
 * Subsequent scraper runs load that file and skip login entirely.
 *
 * Run locally (your Mac, not the server — 2FA doesn't work headless):
 *   npx tsx scripts/oddyssey-square-bootstrap.ts
 *
 * Then scp the resulting file up to the Mac Mini:
 *   scp data/.square-auth.json white@100.97.115.18:~/apps/go-rabbit-web/data/
 *
 * Square cookies last 30–90 days with "Trust this device" checked.
 * When the scraper hits a login screen we'll surface an alert and you
 * re-run this bootstrap.
 */

import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import readline from "readline";

const AUTH_PATH = path.resolve("data/.square-auth.json");
const LOGIN_URL = "https://app.squareup.com/dashboard/sales/reports/sales-summary";

async function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

async function main() {
  await fs.mkdir(path.dirname(AUTH_PATH), { recursive: true });

  console.log("[square-bootstrap] launching Chromium…");
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(LOGIN_URL);

  console.log("");
  console.log("  ─────────────────────────────────────────────");
  console.log("   1. Log in with your Square credentials");
  console.log("   2. Complete 2FA");
  console.log("   3. Check \"Trust this device\" if offered");
  console.log("   4. Wait until you see the Sales Summary page");
  console.log("   5. Come back here and press ENTER");
  console.log("  ─────────────────────────────────────────────");
  console.log("");

  await waitForEnter("Press ENTER when you're signed in and looking at the dashboard > ");

  // Sanity-check: we should be past /login and on /dashboard/...
  const url = page.url();
  if (!url.includes("/dashboard")) {
    console.error(`[square-bootstrap] current URL is ${url} — expected /dashboard/...`);
    console.error("[square-bootstrap] did you complete login? aborting without saving.");
    await browser.close();
    process.exit(1);
  }

  await ctx.storageState({ path: AUTH_PATH });
  console.log(`[square-bootstrap] saved auth state to ${AUTH_PATH}`);
  console.log("[square-bootstrap] next: scp it to the Mac Mini:");
  console.log(`    scp ${AUTH_PATH} white@100.97.115.18:~/apps/go-rabbit-web/data/`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
