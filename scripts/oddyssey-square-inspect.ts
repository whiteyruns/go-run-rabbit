/**
 * One-off: saves the Sales Summary page HTML + screenshot so we can
 * see Square's actual DOM structure and fix the scraper's selectors.
 */
import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

async function main() {
  const AUTH = path.resolve("data/.square-auth.json");
  const OUT = path.resolve("data/oddyssey-square/inspect");
  await fs.mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  try {
    await page.goto("https://app.squareup.com/dashboard/sales/reports/sales-summary", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    if (/\/login|signin/i.test(page.url())) {
      console.error("session expired — re-run bootstrap");
      process.exit(1);
    }

    await page.screenshot({ path: path.join(OUT, "page.png"), fullPage: true });
    await fs.writeFile(path.join(OUT, "page.html"), await page.content());

    // Also print the text surrounding "Net Sales" + "Gross Sales" for structure hints
    const hits = await page.evaluate(() => {
      const targets = ["Gross Sales", "Returns", "Discounts & Comps", "Net Sales", "Taxes"];
      const out: { label: string; tag: string; parentTag: string; siblingTexts: string[] }[] = [];
      for (const label of targets) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const t = (node.nodeValue || "").trim();
          if (t === label) {
            const el = node.parentElement;
            if (!el) continue;
            const parent = el.parentElement;
            const siblingTexts = parent
              ? Array.from(parent.children).map((c) => (c.textContent || "").trim().slice(0, 60))
              : [];
            out.push({
              label,
              tag: el.tagName,
              parentTag: parent?.tagName ?? "",
              siblingTexts,
            });
            break;
          }
        }
      }
      return out;
    });

    await fs.writeFile(path.join(OUT, "label-hits.json"), JSON.stringify(hits, null, 2));
    console.log("wrote:", path.join(OUT, "page.png"));
    console.log("wrote:", path.join(OUT, "page.html"));
    console.log("wrote:", path.join(OUT, "label-hits.json"));
    for (const h of hits) {
      console.log(`  ${h.label} — tag=${h.tag} parent=${h.parentTag} siblings=${h.siblingTexts.length}`);
      for (const s of h.siblingTexts) console.log(`    • "${s}"`);
    }
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
