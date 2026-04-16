import { chromium } from "playwright";
const BASE = "https://www.gorunrabbit.com";
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.request.post(`${BASE}/api/auth/login`, { data: { password: "cbm2026" } });
  await page.goto(`${BASE}/recap/ftb-editorial/marshmello-apr2-2026`, { waitUntil: "networkidle" });
  const inp = await page.$('input[type="password"]');
  if (inp) { await inp.fill("feed2026"); await page.keyboard.press("Enter"); await page.waitForTimeout(1500); }
  await page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll("h2")).find(h => h.textContent?.trim() === "Marshmello");
    h2?.scrollIntoView({block: "start"});
    window.scrollBy(0, -80);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/m-spot.png" });
  await browser.close();
})();
