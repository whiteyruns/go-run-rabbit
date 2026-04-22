/**
 * Capture the Marshmello recap as a PDF exactly like Cmd-P → Save as PDF
 * would produce, so we can inspect formatting without round-tripping Chrome.
 *
 * Usage: npx tsx scripts/capture-recap-pdf.ts
 */
import { chromium } from "playwright";

const URL =
  process.env.RECAP_URL ??
  "https://www.gorunrabbit.com/recap/ftb-editorial/marshmello-apr2-2026";
const ACCESS_CODE = "feed2026";
const OUT = process.env.OUT ?? "/tmp/marshmello-recap.pdf";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  const page = await ctx.newPage();

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

  // AuthGate — enter access code.
  const pwd = page.locator('input[type="password"]');
  if (await pwd.count()) {
    await pwd.fill(ACCESS_CODE);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle", { timeout: 30_000 });
  }

  // Wait for lazy images + fonts.
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((i) =>
        i.complete ? Promise.resolve() : new Promise((r) => (i.onload = i.onerror = r)),
      ),
    );
  });
  await page.waitForTimeout(1500);

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: OUT,
    format: "Letter",
    printBackground: true,
    // Let the CSS @page rule be the single source of truth for margins.
    // Setting Playwright margins to 0 prevents the double-margin issue
    // where Chromium adds Playwright's margins ON TOP of @page margins.
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });

  console.log("Saved:", OUT);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
