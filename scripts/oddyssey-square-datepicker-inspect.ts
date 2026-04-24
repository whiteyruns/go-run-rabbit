// Open the date picker and dump its HTML + all inputs/buttons inside
// so we can craft a correct selector.
import { chromium } from "playwright";
import fs from "fs/promises";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: "data/.square-auth.json",
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto("https://app.squareup.com/dashboard/sales/reports/sales-summary", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(3000);

  // Click the date button
  const dateBtn = page.getByRole("button", { name: /^\d{1,2}\/\d{1,2}\/\d{4}$/ }).first();
  const visible = await dateBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log("date button visible:", visible);
  if (visible) {
    await dateBtn.click();
    await page.waitForTimeout(1500);
  }

  await fs.mkdir("data/oddyssey-square/inspect", { recursive: true });
  await page.screenshot({
    path: "data/oddyssey-square/inspect/datepicker-open.png",
    fullPage: true,
  });

  const popoverInfo = await page.evaluate(() => {
    const popover = Array.from(document.querySelectorAll("[role=dialog], [class*=popover], [class*=Popover]"));
    const inputs = Array.from(document.querySelectorAll("input")).map((i) => ({
      type: i.type,
      name: i.name,
      placeholder: i.placeholder,
      value: i.value,
      ariaLabel: i.getAttribute("aria-label"),
      visible: i.offsetParent !== null,
    }));
    const buttons = Array.from(document.querySelectorAll("button"))
      .map((b) => ({
        text: (b.textContent || "").trim().slice(0, 40),
        ariaLabel: b.getAttribute("aria-label") || "",
        visible: b.offsetParent !== null,
      }))
      .filter((b) => b.visible && (b.text || b.ariaLabel));
    return {
      popoverCount: popover.length,
      popoverClasses: popover.slice(0, 3).map((p) => p.className),
      inputs: inputs.filter((i) => i.visible),
      buttons: buttons.slice(0, 40),
    };
  });

  await fs.writeFile(
    "data/oddyssey-square/inspect/datepicker-state.json",
    JSON.stringify(popoverInfo, null, 2),
  );

  console.log(JSON.stringify(popoverInfo, null, 2));
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
