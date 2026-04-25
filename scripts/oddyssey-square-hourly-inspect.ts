// Inspect what's on the Sales Summary page for hourly breakdown.
// We want to isolate the open-bar window (10 PM - 12 AM).
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: "data/.square-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  try {
    await page.goto(
      "https://app.squareup.com/dashboard/sales/reports/sales-summary",
      { waitUntil: "domcontentloaded" },
    );
    await page.waitForTimeout(3000);

    // Date → today, 8 days back, location = Noir
    await page.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}/ }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /^today$/i }).first().click().catch(() => {});
    await page.waitForTimeout(800);
    await page.keyboard.press("Escape");
    const prev = page.getByRole("button", { name: /previous date interval/i }).first();
    for (let i = 0; i < 8; i++) { await prev.click().catch(() => {}); await page.waitForTimeout(220); }
    await page.waitForTimeout(800);
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
    await page.waitForTimeout(2000);

    // Look for "Time of Day" or hour-related headings + chart structure
    const hits = await page.evaluate(() => {
      const out: { tag: string; text: string }[] = [];
      const all = Array.from(document.querySelectorAll("h1, h2, h3, h4, p, span, div"));
      for (const el of all) {
        const t = (el.textContent || "").trim();
        if (!t || t.length > 80) continue;
        if (/time of day|hour|am|pm/i.test(t) && !/AM-/.test(t)) {
          out.push({ tag: el.tagName, text: t });
        }
      }
      return Array.from(new Set(out.map((x) => `${x.tag}: ${x.text}`))).slice(0, 30);
    });
    console.log("Time-of-day / hour-related text:");
    for (const h of hits) console.log("  " + h);
    console.log();

    // Try to extract chart data — look for SVG elements with hour labels
    const chartData = await page.evaluate(() => {
      const out: { hour: string; nearby: string[] }[] = [];
      // Hour labels usually rendered as SVG <text> like "6pm", "7pm" etc.
      const texts = Array.from(document.querySelectorAll("text, tspan, .axis-label"));
      for (const t of texts) {
        const v = (t.textContent || "").trim();
        if (/^\d{1,2}\s*(am|pm)$/i.test(v)) {
          // Find rect siblings + their values
          const parent = t.parentElement;
          out.push({
            hour: v,
            nearby: Array.from(parent?.querySelectorAll("rect, title") || [])
              .slice(0, 5)
              .map((el) => (el.textContent || el.getAttribute("title") || "").trim())
              .filter(Boolean),
          });
        }
      }
      return out.slice(0, 30);
    });
    console.log("Hour labels found:");
    for (const h of chartData) console.log("  " + JSON.stringify(h));
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
