// Probe what text + anchors are on the page after we navigate to a
// specific date. Helps locate where Top Items lives.
import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({
    storageState: "data/.square-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  const p = await ctx.newPage();
  const urls = [
    "https://app.squareup.com/dashboard/sales/reports/item-sales",
    "https://app.squareup.com/dashboard/sales/reports/sales-summary",
  ];
  await p.goto(urls[0], { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  console.log("URL landed:", p.url());

  // Scroll full page height to force lazy content to render
  await p.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);

  const found = await p.evaluate(() => {
    const hits: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n = walker.nextNode();
    while (n) {
      const t = (n.nodeValue || "").trim();
      if (t && /top|item|bandido|yankee/i.test(t) && t.length < 80) hits.push(t);
      n = walker.nextNode();
    }
    return Array.from(new Set(hits));
  });
  console.log("top/item/bandido hits:");
  for (const h of found.slice(0, 40)) console.log("  " + h);

  const links = await p.evaluate(() => {
    return Array.from(document.querySelectorAll("a, button"))
      .map((x) => ({
        tag: x.tagName,
        text: (x.textContent || "").trim().slice(0, 50),
        href: x.getAttribute("href"),
      }))
      .filter((x) => x.text && /item|report|sales/i.test(x.text));
  });
  console.log("\nrelated nav links/buttons:");
  for (const l of links.slice(0, 20)) console.log("  " + JSON.stringify(l));

  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
