// Probe: does Square's Sales Summary accept date in URL params? If so
// we can skip the flaky date picker click-through entirely.
import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: "data/.square-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  const tries = [
    "https://app.squareup.com/dashboard/sales/reports/sales-summary?start_date=2026-04-18&end_date=2026-04-18",
    "https://app.squareup.com/dashboard/sales/reports/sales-summary?date=2026-04-18",
    "https://app.squareup.com/dashboard/sales/reports/sales-summary?dateRange=2026-04-18_2026-04-18",
    "https://app.squareup.com/dashboard/sales/reports/sales-summary?from=2026-04-18&to=2026-04-18",
    "https://app.squareup.com/dashboard/sales/reports/sales-summary?period=day&start=2026-04-18",
  ];
  for (const url of tries) {
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(3500);
    } catch { /* continue */ }
    const landed = page.url();
    const dateBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const m = btns.find((b) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test((b.textContent || "").trim()));
      return m ? (m.textContent || "").trim() : null;
    });
    const net = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        if ((n.nodeValue || "").trim() === "Net Sales") {
          let el = n.parentElement;
          let i = 0;
          while (el && i < 8) {
            const t = (el.textContent || "").replace("Net Sales", "");
            const m = t.match(/-?\$?\s*[0-9][0-9,]*(?:\.[0-9]{2})?/);
            if (m) return m[0];
            el = el.parentElement;
            i += 1;
          }
        }
        n = walker.nextNode();
      }
      return null;
    });
    console.log("TRY", url);
    console.log("  landed:", landed);
    console.log("  date button shows:", dateBtn);
    console.log("  net sales:", net);
    console.log("");
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
