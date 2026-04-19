/**
 * Inspection helper: find all seller UUIDs Ticketure exposes for an
 * event. Dumps the Sessions page HTML so we can see seller dropdowns,
 * reseller partner links, and third-party outlet references.
 *
 * Usage: tsx scripts/oddyssey-sellers-inspect.ts --venue=noir
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
  const args: Record<string, string> = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  const venue = (args.venue ?? "noir") as "manor" | "noir";

  const BASE = process.env.TICKETURE_BASE_URL!;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT!;
  const EMAIL = process.env.TICKETURE_EMAIL!;
  const PASSWORD = process.env.TICKETURE_PASSWORD!;
  const EVENT_ID = process.env[
    venue === "manor" ? "TICKETURE_EVENT_ID" : "TICKETURE_EVENT_ID_NOIR"
  ]!;

  const outDir = path.resolve(`data/oddyssey-${venue === "manor" ? "food" : "noir"}/inspect`);
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    const url = `${BASE}/${ACCOUNT}/event/${EVENT_ID}/sessions`;
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
    await loginIfNeeded(page, EMAIL, PASSWORD);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const iframeEl = await page.locator("iframe").first().elementHandle();
    const frame = iframeEl ? await iframeEl.contentFrame() : null;
    if (!frame) throw new Error("no iframe");

    // Look for seller selectors / dropdowns / links on the event page.
    const info = await frame.evaluate(() => {
      const sellerLinks = Array.from(
        document.querySelectorAll("a[href*='seller='], [data-href*='seller=']"),
      ).map((el) => {
        const href = el.getAttribute("href") || el.getAttribute("data-href") || "";
        const m = href.match(/seller=([a-f0-9-]+)/i);
        return {
          seller_id: m ? m[1] : null,
          text: (el.textContent || "").trim().slice(0, 100),
          href,
        };
      });
      const selects = Array.from(document.querySelectorAll("select")).map((s) => ({
        name: s.getAttribute("name") || s.getAttribute("id") || "",
        options: Array.from(s.querySelectorAll("option")).map((o) => ({
          value: o.value,
          text: (o.textContent || "").trim(),
        })),
      }));
      const tabsOrNav = Array.from(document.querySelectorAll("a, button")).slice(0, 40).map((el) => ({
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 80),
        href: el.getAttribute("href") || "",
      })).filter((x) => x.text);
      return { sellerLinks, selects, tabsOrNav };
    });

    await fs.writeFile(
      path.join(outDir, "sellers.json"),
      JSON.stringify(info, null, 2),
    );

    const sellerIds = Array.from(
      new Set(info.sellerLinks.map((l) => l.seller_id).filter(Boolean) as string[]),
    );
    console.log(`seller UUIDs referenced on sessions page: ${sellerIds.length}`);
    for (const s of sellerIds) console.log(`  ${s}`);
    console.log(`\nselects on page: ${info.selects.length}`);
    for (const s of info.selects) {
      console.log(`  name=${s.name}  options=${s.options.length}`);
      for (const o of s.options.slice(0, 8)) console.log(`    ${o.value}  ->  ${o.text}`);
    }

    // Also try to hit the event "outlets" or "resellers" page if it exists.
    const tries = [
      `${BASE}/${ACCOUNT}/event/${EVENT_ID}/outlets`,
      `${BASE}/${ACCOUNT}/event/${EVENT_ID}/resellers`,
      `${BASE}/${ACCOUNT}/event/${EVENT_ID}/sellers`,
      `${BASE}/${ACCOUNT}/outlets`,
      `${BASE}/${ACCOUNT}/sellers`,
    ];
    for (const t of tries) {
      await page.goto(t, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
      const status = page.url();
      const title = await page.title().catch(() => "");
      console.log(`probe ${t} → landed on ${status}  title=${title.slice(0, 80)}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
