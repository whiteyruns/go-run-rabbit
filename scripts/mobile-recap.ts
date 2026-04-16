import { chromium } from "playwright";
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.request.post("http://localhost:3102/api/auth/login", { data: { password: "cbm2026" } });
  await page.goto("http://localhost:3102/recap/ftb-editorial/marshmello-apr2-2026", { waitUntil: "networkidle" });
  const inp = await page.$('input[type="password"]');
  if (inp) { await inp.fill("feed2026"); await page.keyboard.press("Enter"); await page.waitForTimeout(1500); }
  // Use page height in chunks
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("page height:", total);
  // Scroll to about 60% of page (where audience section likely is)
  for (let pct = 50; pct <= 80; pct += 5) {
    await page.evaluate((p) => window.scrollTo(0, document.documentElement.scrollHeight * (p / 100)), pct);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `/tmp/m-scroll-${pct}.png` });
  }
  await browser.close();
})();
