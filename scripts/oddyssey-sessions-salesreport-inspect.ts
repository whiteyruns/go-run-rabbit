// Probe Ticketure's "Sales Report" page to find Brandon's $8,374.42
// number for Manor Sat 4/25. Logs into Ticketure, lands on the
// dashboard, then walks the Reports menu to find any sales-related
// page. Once on it, dumps every visible label/value pair so we can
// match against the figure Brandon quoted.
import { chromium, type Page } from "playwright";
import fs from "fs/promises";
import path from "path";

async function loginIfNeeded(page: Page, email: string, password: string) {
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    await emailInput.fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")')
      .first().click().catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
  }
}

async function dumpVisibleMoney(page: Page, label: string) {
  const out: { context: string; pairs: { label: string; value: string }[] } = {
    context: label,
    pairs: [],
  };
  const frames = [page.mainFrame(), ...page.frames().filter((f) => f !== page.mainFrame())];
  for (const f of frames) {
    const pairs = await f.evaluate(() => {
      const result: { label: string; value: string }[] = [];
      const all = Array.from(document.querySelectorAll("*")) as HTMLElement[];
      const isMoney = (s: string) => /\$\s*[\d,]+(?:\.\d{1,2})?/.test(s);
      for (const el of all) {
        if (el.children.length > 4) continue;
        const t = (el.textContent || "").trim();
        if (!t || t.length > 200) continue;
        if (!isMoney(t)) continue;
        const tag = el.tagName;
        if (!["SPAN", "DIV", "P", "TD", "STRONG", "B", "DT", "DD"].includes(tag)) continue;
        let lbl = "";
        const prev = el.previousElementSibling as HTMLElement | null;
        if (prev) lbl = (prev.textContent || "").trim().slice(0, 80);
        if (!lbl && el.parentElement) {
          const sib = Array.from(el.parentElement.children) as HTMLElement[];
          for (const s of sib) {
            if (s === el) continue;
            const st = (s.textContent || "").trim();
            if (st && !/\$/.test(st) && st.length < 80) { lbl = st; break; }
          }
        }
        result.push({ label: lbl || "(no label)", value: t.slice(0, 80) });
      }
      // De-dup
      const seen = new Set<string>();
      return result.filter((r) => {
        const k = `${r.label}::${r.value}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }).catch(() => [] as { label: string; value: string }[]);
    if (pairs.length > 0) out.pairs.push(...pairs);
  }
  return out;
}

async function main() {
  const BASE = process.env.TICKETURE_BASE_URL;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT;
  const EMAIL = process.env.TICKETURE_EMAIL;
  const PASSWORD = process.env.TICKETURE_PASSWORD;
  if (!BASE || !ACCOUNT || !EMAIL || !PASSWORD) {
    console.error("Missing TICKETURE_* env vars");
    process.exit(1);
  }

  const outDir = path.resolve("data/oddyssey-food/inspect");
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Step 1: Land somewhere authenticated, then explore the URL space.
    await page.goto(`${BASE}/${ACCOUNT}/dashboard`, { waitUntil: "networkidle" }).catch(() => {});
    await loginIfNeeded(page, EMAIL, PASSWORD);
    await page.waitForTimeout(1500);

    // Step 2: Try a handful of likely Sales Report URLs.
    const candidates = [
      `${BASE}/${ACCOUNT}/reports/sales`,
      `${BASE}/${ACCOUNT}/report/sales`,
      `${BASE}/${ACCOUNT}/reports/sales-report`,
      `${BASE}/${ACCOUNT}/sales`,
      `${BASE}/${ACCOUNT}/reports`,
    ];
    const reachable: { url: string; title: string; bodySample: string }[] = [];
    for (const url of candidates) {
      console.log(`[probe] try ${url}`);
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null);
      const status = resp?.status();
      const title = await page.title();
      const body = await page.evaluate(() => document.body?.innerText?.slice(0, 800) || "").catch(() => "");
      console.log(`  status=${status} title="${title}"`);
      if (status && status < 400) {
        reachable.push({ url, title, bodySample: body });
      }
    }

    // Step 3: For each reachable page, dump money pairs.
    const dumps: Awaited<ReturnType<typeof dumpVisibleMoney>>[] = [];
    for (const r of reachable) {
      await page.goto(r.url, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(2500);
      await page.screenshot({
        path: path.join(outDir, `salesreport-${r.url.replace(/[^a-z0-9]/gi, "_").slice(-60)}.png`),
        fullPage: true,
      }).catch(() => {});
      dumps.push(await dumpVisibleMoney(page, r.url));
    }

    // Step 4: Also walk anchor tags on the dashboard for "report"/"sales".
    await page.goto(`${BASE}/${ACCOUNT}/dashboard`, { waitUntil: "networkidle" }).catch(() => {});
    const anchors = await page.evaluate(() => {
      const out: { text: string; href: string }[] = [];
      const links = Array.from(document.querySelectorAll("a")) as HTMLAnchorElement[];
      for (const a of links) {
        const t = (a.textContent || "").trim();
        if (!t || t.length > 50) continue;
        if (!/report|sales|revenue|finance/i.test(t)) continue;
        out.push({ text: t, href: a.href });
      }
      // Frames too
      return out;
    });

    const report = {
      candidates,
      reachable: reachable.map((r) => ({ url: r.url, title: r.title })),
      anchors,
      money_dumps: dumps,
    };
    const outPath = path.join(outDir, "salesreport-probe.json");
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
    console.log(`\n[probe] saved ${outPath}`);
    console.log(JSON.stringify({ reachable: report.reachable, anchors }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
