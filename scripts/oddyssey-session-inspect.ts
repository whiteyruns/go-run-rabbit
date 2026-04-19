/**
 * Inspection helper: dump the full DOM of a Ticketure session Summary
 * Report so we can figure out how per-group data is rendered (table,
 * divs, aria-grid, or a separate tab).
 *
 * Usage:
 *   tsx scripts/oddyssey-session-inspect.ts --venue=noir --date=2026-04-17
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
  const emailField = page.locator('input[type="email"]').first();
  const pwField = page.locator('input[type="password"]').first();
  await emailField.fill(email);
  await pwField.fill(password);
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
  const date = args.date ?? new Date().toISOString().slice(0, 10);

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
    // Go to Sessions tab, log in, find the session for the target date.
    const url = `${BASE}/${ACCOUNT}/event/${EVENT_ID}/sessions`;
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
    await loginIfNeeded(page, EMAIL, PASSWORD);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const [, , d] = date.split("-").map(Number);
    const dayCell = page.frameLocator("iframe").first()
      .locator(`td:has-text("${d}"), button:has-text("${d}")`).first();
    await dayCell.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(800);

    const iframeEl = await page.locator("iframe").first().elementHandle();
    const frame = iframeEl ? await iframeEl.contentFrame() : null;
    if (!frame) throw new Error("no iframe");

    const sessionId = await frame.evaluate(() => {
      const a = document.querySelector("a[href*='session/'], [data-href*='session/']");
      const href = a?.getAttribute("href") || a?.getAttribute("data-href") || "";
      return (href.match(/session\/([a-f0-9-]{32,})/i) || [])[1] ?? "";
    });
    console.log(`session = ${sessionId}`);
    if (!sessionId) throw new Error("no session id");

    const sessionUrl = `${BASE}/${ACCOUNT}/session/${sessionId}`;
    await page.goto(sessionUrl, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(2000);

    const iframe2 = await page.locator("iframe").first().elementHandle();
    const inner = iframe2 ? await iframe2.contentFrame() : null;
    if (!inner) throw new Error("no inner frame");

    // Dump all tab/nav elements so we can see if there's a separate
    // tickets breakdown tab.
    const nav = await inner.evaluate(() => {
      const out: string[] = [];
      const navLikely = Array.from(
        document.querySelectorAll("a, button, [role='tab'], .tab, .nav-link"),
      );
      for (const n of navLikely) {
        const text = (n.textContent || "").trim().slice(0, 60);
        const href = n.getAttribute("href") || "";
        if (text) out.push(`${text}${href ? "  →  " + href : ""}`);
      }
      return out;
    });
    await fs.writeFile(path.join(outDir, "nav.txt"), nav.join("\n"));

    // Dump table count + headers
    const tableInfo = await inner.evaluate(() => {
      const ts = Array.from(document.querySelectorAll("table"));
      return ts.map((t, i) => {
        const thead = t.querySelector("thead");
        const header = (thead
          ? Array.from(thead.querySelectorAll("th, td"))
          : Array.from(t.querySelectorAll("tr")).slice(0, 1).flatMap((r) =>
              Array.from(r.querySelectorAll("th, td")),
            )
        ).map((c) => ((c as HTMLElement).textContent || "").trim());
        const tbody = t.querySelector("tbody");
        const bodyRowCount = tbody
          ? tbody.querySelectorAll("tr").length
          : t.querySelectorAll("tr").length - 1;
        return { idx: i, headerCells: header, bodyRowCount };
      });
    });
    await fs.writeFile(path.join(outDir, "tables.json"), JSON.stringify(tableInfo, null, 2));

    // Dump the full inner HTML for manual inspection.
    const html = await inner.content();
    await fs.writeFile(path.join(outDir, "session-summary.html"), html);

    // Take screenshot
    await page.screenshot({
      path: path.join(outDir, "session-summary.png"),
      fullPage: true,
    });

    console.log(`wrote ${outDir}/nav.txt, tables.json, session-summary.html, session-summary.png`);
    console.log(`tables found: ${tableInfo.length}`);
    for (const t of tableInfo) {
      console.log(`  #${t.idx}: header=[${t.headerCells.join(" | ")}]  bodyRows=${t.bodyRowCount}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
