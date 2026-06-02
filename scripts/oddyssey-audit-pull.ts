/**
 * Oddyssey Noir — Ticketure Redemption Report Auto-Pull
 *
 * Logs into the AREA15 Ticketure admin, navigates to the Redemption
 * Report at /area15/reports/redemption, sets the date range (Thu→Mon by
 * default), ensures the Oddyssey Noir event is selected, and downloads
 * the redemption xlsx. The parser at
 * src/lib/oddyssey-noir/promo-report-parser.ts consumes the file.
 *
 * Usage:
 *   tsx scripts/oddyssey-audit-pull.ts                          # auto: latest weekend Thu→Mon
 *   tsx scripts/oddyssey-audit-pull.ts --from=2026-05-28 --until=2026-06-01
 *   tsx scripts/oddyssey-audit-pull.ts --headless=false         # see the browser
 *
 * Required env vars (same as food pull):
 *   TICKETURE_BASE_URL     e.g. "https://area15.ticketure.com"
 *   TICKETURE_ACCOUNT      e.g. "area15"
 *   TICKETURE_EMAIL
 *   TICKETURE_PASSWORD
 *   (Event filter is hard-coded to "Oddyssey Noir" — no event UUID required.)
 *
 * Output:
 *   ./data/oddyssey-noir/audit/audit-<from>-to-<until>-<ts>.xlsx
 *   ./data/oddyssey-noir/audit/latest.xlsx       (copy of most recent)
 *   ./data/oddyssey-noir/audit/latest-meta.json  (pull metadata)
 */

import { chromium, type Download } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

interface Args {
  from?: string;
  until?: string;
  out?: string;
  headless?: boolean;
}

const OUT_DIR = 'data/oddyssey-noir/audit';
const EVENT_NAME = 'Oddyssey Noir';

function parseArgs(): Args {
  const out: Args = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (key === 'from') out.from = val;
    else if (key === 'until') out.until = val;
    else if (key === 'out') out.out = val;
    else if (key === 'headless') out.headless = val !== 'false';
  }
  return out;
}

/**
 * Auto-pick Thursday→Monday around the most recent Sat.
 *   - Run on Sunday → returns Thu 4d ago → Mon 1d from now
 *   - Run on Monday → returns Thu 4d ago → today
 *   - Run on Tuesday → returns last Thu → last Mon
 */
function defaultDateRange(): { from: string; until: string } {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Days BACK to the most recent Saturday (0 if today is Sat).
  const daysBackToSat = (dow + 1) % 7;
  const sat = new Date(today);
  sat.setDate(today.getDate() - daysBackToSat);
  const thu = new Date(sat);
  thu.setDate(sat.getDate() - 2);
  const mon = new Date(sat);
  mon.setDate(sat.getDate() + 2);
  return { from: iso(thu), until: iso(mon) };
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

async function main() {
  const args = parseArgs();
  const def = defaultDateRange();
  const from = args.from ?? def.from;
  const until = args.until ?? def.until;

  const BASE = process.env.TICKETURE_BASE_URL;
  const ACCOUNT = process.env.TICKETURE_ACCOUNT;
  const EMAIL = process.env.TICKETURE_EMAIL;
  const PASSWORD = process.env.TICKETURE_PASSWORD;

  if (!BASE || !ACCOUNT || !EMAIL || !PASSWORD) {
    console.error(
      '[audit-pull] Missing env vars. Need TICKETURE_BASE_URL, TICKETURE_ACCOUNT, TICKETURE_EMAIL, TICKETURE_PASSWORD',
    );
    process.exit(1);
  }

  const outDir = args.out ?? path.resolve(OUT_DIR);
  await fs.mkdir(outDir, { recursive: true });

  const headless = args.headless !== false;
  console.log(`[audit-pull] from=${from} until=${until} headless=${headless} out=${outDir}`);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // Try URL-param date range first. Many Ticketure pages accept these
    // (the food/attendees pull uses ?from=&until=); if accepted here, it
    // saves us the date-picker dance. If ignored, we fall back to DOM.
    const reportUrl = `${BASE}/${ACCOUNT}/reports/redemption?from=${from}&until=${until}`;
    console.log(`[audit-pull] go ${reportUrl}`);
    await page.goto(reportUrl, { waitUntil: 'networkidle' }).catch(() => {});

    // ─── Login (same flow as food pull) ─────────────────────────────────
    const onLogin = await page
      .getByRole('heading', { name: /sign in/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (onLogin) {
      console.log('[audit-pull] login page detected');
      const staffBtn = page.getByRole('button', { name: /new staff account login/i });
      if (await staffBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('[audit-pull] clicking staff login');
        await Promise.all([
          page.waitForLoadState('networkidle').catch(() => {}),
          staffBtn.click(),
        ]);
        await page.waitForTimeout(1500);
      }

      const emailField = (await page.locator('input[type="email"]').count()) > 0
        ? page.locator('input[type="email"]').first()
        : page.getByLabel(/email/i).first();
      const pwField = (await page.locator('input[type="password"]').count()) > 0
        ? page.locator('input[type="password"]').first()
        : page.getByLabel(/password/i).first();

      await emailField.click({ timeout: 5000 });
      await emailField.fill(EMAIL);
      await pwField.click({ timeout: 5000 });
      await pwField.fill(PASSWORD);

      const submit = page.getByRole('button', { name: /^sign in$|^log in$|^login$/i });
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => null),
        submit.click(),
      ]);

      const stillOnLogin = await page
        .getByRole('heading', { name: /sign in/i })
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (stillOnLogin) {
        await page.screenshot({ path: path.join(outDir, 'last-login-failed.png') }).catch(() => {});
        throw new Error('Login appeared to fail — still on sign-in page after submit');
      }

      // Re-navigate to the report (login may redirect elsewhere)
      await page.goto(reportUrl, { waitUntil: 'networkidle' });
    }

    // ─── Resolve the iframe ────────────────────────────────────────────
    // Ticketure renders report content inside an iframe. EVERYTHING below
    // — date controls, event filter, kebab, export — lives in that frame.
    // (The food-pull script confirms this pattern for the attendees page.)
    console.log('[audit-pull] resolving iframe');
    await page.waitForTimeout(1500);
    const iframeHandle = await page.locator('iframe').first().elementHandle({ timeout: 10000 });
    const frame = iframeHandle ? await iframeHandle.contentFrame() : null;
    if (!frame) {
      await page.screenshot({ path: path.join(outDir, 'last-no-iframe.png'), fullPage: true }).catch(() => {});
      throw new Error('Could not resolve report iframe.');
    }
    await frame.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    // ─── Click the Redemption Report tab (inside iframe) ────────────────
    const redemptionTab = frame.getByRole('tab', { name: /redemption report/i }).first();
    if (await redemptionTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('[audit-pull] clicking Redemption Report tab');
      await redemptionTab.click();
      await page.waitForTimeout(800);
    } else {
      const fallback = frame.getByText(/redemption report/i).first();
      if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(800);
      }
    }

    // Probe the iframe DOM after tab-click for selector iteration.
    await page.screenshot({ path: path.join(outDir, 'last-after-nav.png'), fullPage: true }).catch(() => {});
    await dumpDom(frame, outDir);

    // ─── Set date range via DOM (URL params may have been ignored) ──────
    // The displayed text is like "Tue, Jun 2, 2026" — a custom date control,
    // not a plain text input. We try several strategies in order and log
    // which one worked so future iterations don't re-guess.
    console.log(`[audit-pull] setting date range ${from} → ${until}`);
    const fromHuman = humanDate(from);
    const untilHuman = humanDate(until);
    let dateStrategy = 'none';

    // Target the WRITABLE inputs (class="date-manual", placeholder="dd/mm/yyyy"),
    // not the readonly display inputs. Fill with dd/mm/yyyy format the
    // placeholder hints at.
    const manualInputs = await frame.locator('input.date-manual').all();
    console.log(`[audit-pull] found ${manualInputs.length} .date-manual inputs`);
    let inputsSet = 0;
    const fromDmy = ddmmyyyy(from);
    const untilDmy = ddmmyyyy(until);
    for (let i = 0; i < manualInputs.length && inputsSet < 2; i++) {
      const input = manualInputs[i];
      const target = inputsSet === 0 ? fromDmy : untilDmy;
      await input.click({ timeout: 2000 }).catch(() => {});
      await input.fill('').catch(() => {});
      await input.fill(target).catch(() => {});
      await input.press('Tab').catch(() => {}); // blur + commit
      await page.waitForTimeout(400);
      inputsSet++;
    }
    if (inputsSet >= 2) dateStrategy = 'date-manual-dmy';
    console.log(`[audit-pull] date strategy: ${dateStrategy} (${inputsSet}/2 set)`);
    if (inputsSet < 2) {
      await page.screenshot({ path: path.join(outDir, 'last-date-input-miss.png'), fullPage: true }).catch(() => {});
      console.warn('[audit-pull] could not locate both date inputs');
    }
    // Wait for the report to reload with the new date range (chart spinner).
    await frame.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);

    // ─── Event filter: check if Oddyssey Noir is already selected ────────
    // DOM dump confirms there's an <input class="search" value="Oddyssey Noir">
    // in the events filter area when the filter is set. Trust that — don't
    // re-click which can clear it.
    const eventSearchVal = await frame.locator('input.search').first().inputValue().catch(() => '');
    if (eventSearchVal === EVENT_NAME) {
      console.log('[audit-pull] event filter already set to Oddyssey Noir (via input.search)');
    } else {
      console.log(`[audit-pull] event filter not set (input.search="${eventSearchVal}"); attempting selection`);
      // Click the events field area, type, pick option. We don't know the
      // exact selector yet — use coordinates from dom-dump if needed.
      const eventsField = frame.getByText(/^Events$/).first();
      if (await eventsField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await eventsField.click().catch(() => {});
        await page.keyboard.type(EVENT_NAME);
        await page.waitForTimeout(500);
        const option = frame.getByText(new RegExp(`^${escapeRegex(EVENT_NAME)}$`)).first();
        if (await option.isVisible({ timeout: 1500 }).catch(() => false)) {
          await option.click();
        }
      }
    }
    await page.waitForTimeout(500);

    // ─── Final wait for any data reload to complete before export ─────────
    await frame.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(outDir, 'last-before-export.png'), fullPage: true }).catch(() => {});
    await dumpDom(frame, outDir);

    // ─── Click the kebab/three-dot export menu (iframe-scoped) ──────────
    let exportClicked = false;
    const exportItemPattern = /export|download|csv|xlsx|spreadsheet/i;

    const kebabCandidates: Array<{ name: string; loc: ReturnType<typeof frame.locator> }> = [
      { name: 'button[aria-label~="more" i]', loc: frame.locator('button[aria-label~="more" i]') },
      { name: 'button[aria-label~="export" i]', loc: frame.locator('button[aria-label~="export" i]') },
      { name: 'button[aria-label~="options" i]', loc: frame.locator('button[aria-label~="options" i]') },
      { name: 'button[aria-label~="actions" i]', loc: frame.locator('button[aria-label~="actions" i]') },
      { name: 'button[aria-label~="menu" i]', loc: frame.locator('button[aria-label~="menu" i]') },
      { name: 'button[aria-haspopup="true"]', loc: frame.locator('button[aria-haspopup="true"]') },
      { name: '.MuiIconButton-root', loc: frame.locator('.MuiIconButton-root') },
      { name: '[data-testid*="menu"]', loc: frame.locator('[data-testid*="menu" i]') },
      { name: 'button[title*="more" i]', loc: frame.locator('button[title*="more" i]') },
      { name: 'button:has(svg)', loc: frame.locator('button:has(svg)') },
    ];

    for (const { name, loc } of kebabCandidates) {
      if (exportClicked) break;
      const count = await loc.count().catch(() => 0);
      if (count === 0) continue;
      console.log(`[audit-pull] trying kebab selector "${name}" (${count} matches)`);
      for (let i = 0; i < count && !exportClicked; i++) {
        const el = loc.nth(i);
        if (!(await el.isVisible({ timeout: 400 }).catch(() => false))) continue;
        await el.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(700);
        // Snapshot the open menu state — crucial for iterating selectors.
        await page.screenshot({ path: path.join(outDir, 'last-menu-open.png'), fullPage: true }).catch(() => {});
        // Try most specific first: "Export to CSV" (food-pull pattern), then
        // broader "Export to XLSX", then any "Export" text.
        const exportCandidates = [
          frame.getByText(/export to csv/i).first(),
          frame.getByText(/export to xlsx/i).first(),
          frame.getByText(/export to excel/i).first(),
          frame.getByText(/download.*xlsx/i).first(),
          frame.getByText(/download.*csv/i).first(),
          frame.getByText(exportItemPattern).first(),
        ];
        for (const exportItem of exportCandidates) {
          if (!(await exportItem.isVisible({ timeout: 800 }).catch(() => false))) continue;
          const itemText = (await exportItem.textContent().catch(() => '')) ?? '';
          console.log(`[audit-pull] menu opened via "${name}" idx ${i}; clicking item "${itemText.trim().slice(0, 40)}"`);
          try {
            const [download] = await Promise.all([
              page.waitForEvent('download', { timeout: 45000 }),
              exportItem.click(),
            ]);
            await saveDownload(download, outDir, from, until);
            exportClicked = true;
          } catch (e) {
            console.warn(`[audit-pull] download did not fire after clicking "${itemText.trim().slice(0, 40)}": ${(e as Error).message}`);
          }
          break;
        }
        if (exportClicked) break;
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(200);
      }
    }

    if (!exportClicked) {
      await page.screenshot({ path: path.join(outDir, 'last-export-not-found.png'), fullPage: true }).catch(() => {});
      await dumpDom(page, outDir);
      throw new Error(
        'Could not locate the kebab/export menu on the Redemption Report page — ' +
          'check last-export-not-found.png and dom-dump.json.',
      );
    }
  } catch (err) {
    console.error('[audit-pull] failed:', err);
    process.exitCode = 1;
    const shot = path.join(outDir, 'last-error.png');
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    if (existsSync(shot)) console.error(`[audit-pull] screenshot: ${shot}`);
  } finally {
    await browser.close();
  }
}

async function saveDownload(download: Download, outDir: string, from: string, until: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const suggested = download.suggestedFilename();
  const ext = path.extname(suggested) || '.xlsx';
  const filename = `audit-${from}-to-${until}-${ts}${ext}`;
  const outPath = path.join(outDir, filename);
  await download.saveAs(outPath);

  // Mirror to latest.<ext>
  const latestPath = path.join(outDir, `latest${ext}`);
  await fs.copyFile(outPath, latestPath);

  // Write metadata
  const stat = await fs.stat(outPath);
  const meta = {
    filename,
    path: outPath,
    suggestedFilename: suggested,
    pulled_at: new Date().toISOString(),
    from,
    until,
    size_bytes: stat.size,
  };
  await fs.writeFile(path.join(outDir, 'latest-meta.json'), JSON.stringify(meta, null, 2));

  console.log(`[audit-pull] saved: ${outPath}`);
  console.log(`[audit-pull] latest: ${latestPath}`);
}

/**
 * Dump a JSON description of inputs, small buttons, and combobox-like
 * elements. Used to derive correct selectors when blind selector lists
 * fail. The inner code is plain JS with NO named function expressions —
 * tsx adds `__name(fn, "name")` calls for named arrows, which breaks when
 * the function is serialized into the browser context.
 */
async function dumpDom(
  target: import('playwright').Page | import('playwright').Frame,
  outDir: string,
): Promise<void> {
  try {
    // Pass as STRING to avoid tsx's __name() helper injection.
    const evalSrc = `(() => {
      var result = { url: location.href, inputs: [], buttons: [], comboboxes: [], dateLikeText: [] };
      var els, el, r, text;
      // Inputs (all visible)
      els = document.querySelectorAll('input');
      for (var i = 0; i < els.length; i++) {
        el = els[i];
        r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        result.inputs.push({
          type: el.getAttribute('type') || '',
          placeholder: el.getAttribute('placeholder') || '',
          value: el.value || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          readonly: el.hasAttribute('readonly'),
          cls: String(el.className || '').slice(0, 80),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
        });
      }
      // Small buttons (likely kebabs/icon buttons)
      els = document.querySelectorAll('button, [role="button"]');
      for (var i = 0; i < els.length && result.buttons.length < 50; i++) {
        el = els[i];
        r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width > 80 || r.height > 80) continue;
        result.buttons.push({
          tag: el.tagName,
          cls: String(el.className || '').slice(0, 80),
          ariaLabel: el.getAttribute('aria-label') || '',
          title: el.getAttribute('title') || '',
          ariaHaspopup: el.getAttribute('aria-haspopup') || '',
          text: (el.textContent || '').trim().slice(0, 30),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
        });
      }
      // Comboboxes
      els = document.querySelectorAll('[role="combobox"], [role="listbox"], [aria-haspopup="listbox"]');
      for (var i = 0; i < els.length; i++) {
        el = els[i];
        r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        result.comboboxes.push({
          tag: el.tagName,
          cls: String(el.className || '').slice(0, 80),
          ariaLabel: el.getAttribute('aria-label') || '',
          text: (el.textContent || '').trim().slice(0, 50),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
        });
      }
      // Elements containing date-like text (so we can find the actual date control)
      var rx = /\\b[A-Z][a-z]{2},?\\s+[A-Z][a-z]{2}\\s+\\d{1,2},?\\s+\\d{4}\\b/;
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode()) && result.dateLikeText.length < 20) {
        text = (node.nodeValue || '').trim();
        if (!rx.test(text)) continue;
        var parent = node.parentElement;
        if (!parent) continue;
        r = parent.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        result.dateLikeText.push({
          text: text.slice(0, 60),
          parentTag: parent.tagName,
          parentCls: String(parent.className || '').slice(0, 80),
          parentRole: parent.getAttribute('role') || '',
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
        });
      }
      return result;
    })()`;
    const dump = await target.evaluate(evalSrc);
    await fs.writeFile(path.join(outDir, 'dom-dump.json'), JSON.stringify(dump, null, 2), 'utf-8');
    const d = dump as { buttons: unknown[]; inputs: unknown[]; comboboxes: unknown[]; dateLikeText: unknown[] };
    console.log(`[audit-pull] dom-dump.json: ${d.buttons.length} buttons, ${d.inputs.length} inputs, ${d.comboboxes.length} comboboxes, ${d.dateLikeText.length} date-text matches`);
  } catch (e) {
    console.warn(`[audit-pull] dumpDom failed: ${(e as Error).message}`);
  }
}

function humanDate(iso: string): string {
  // "2026-05-28" → "May 28, 2026"
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

function ddmmyyyy(iso: string): string {
  // "2026-05-28" → "28/05/2026" (matches the date-manual placeholder)
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();
