// Inspect the full Item Sales page after applying date + location
// filters, so we can see the table structure beyond the Top 5 chart.
import { chromium } from "playwright";
import fs from "fs/promises";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: "data/.square-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  try {
    // Hit Sales Summary first to set the date+location, then jump to items.
    await page.goto("https://app.squareup.com/dashboard/sales/reports/sales-summary", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3000);

    // Navigate target date: today is Apr 25; we want Apr 17 (8 days back).
    // Click date trigger → Today preset → 8x prev arrows.
    await page.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}/ }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /^today$/i }).first().click().catch(() => {});
    await page.waitForTimeout(800);
    await page.keyboard.press("Escape");
    const prev = page.getByRole("button", { name: /previous date interval/i }).first();
    for (let i = 0; i < 8; i++) {
      await prev.click().catch(() => {});
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(800);

    // Set location = Oddyssey Noir
    await page.getByRole("button", { name: /locations/i }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    const allCb = page.getByRole("checkbox", { name: /^all locations$/i });
    if (!(await allCb.isChecked().catch(() => false))) await allCb.click();
    await page.waitForTimeout(200);
    await allCb.click();
    await page.waitForTimeout(300);
    await page.getByRole("checkbox", { name: /^Oddyssey Noir$/i }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");

    // Now go to item-sales
    await page.goto("https://app.squareup.com/dashboard/sales/reports/item-sales", {
      waitUntil: "domcontentloaded",
    });
    await page.getByText(/Top\s*\d*\s*Items?/i).first().waitFor({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);

    // Scroll to load any lazy table rows
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    await fs.mkdir("data/oddyssey-square/inspect", { recursive: true });
    await page.screenshot({
      path: "data/oddyssey-square/inspect/item-sales-full.png",
      fullPage: true,
    });

    // Dump structured table data (rows + cells)
    const tables = await page.evaluate(() => {
      const out: { headers: string[]; rows: string[][] }[] = [];
      const ts = Array.from(document.querySelectorAll("table"));
      for (const t of ts) {
        const headerCells = Array.from(
          t.querySelectorAll("thead th, thead td"),
        ).map((c) => ((c as HTMLElement).textContent || "").trim());
        const bodyRows = Array.from(t.querySelectorAll("tbody tr")).map((r) =>
          Array.from(r.querySelectorAll("th, td")).map(
            (c) => ((c as HTMLElement).textContent || "").trim(),
          ),
        );
        if (bodyRows.length > 0) out.push({ headers: headerCells, rows: bodyRows });
      }
      return out;
    });
    console.log("tables found:", tables.length);
    for (const tbl of tables.slice(0, 3)) {
      console.log("\nheaders:", tbl.headers);
      console.log("first 20 rows:");
      for (const r of tbl.rows.slice(0, 20)) console.log(" ", r.join(" | "));
    }
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
