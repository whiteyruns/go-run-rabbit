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

    // ─── Click the Redemption Report tab ────────────────────────────────
    const redemptionTab = page.getByRole('tab', { name: /redemption report/i }).first();
    if (await redemptionTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('[audit-pull] clicking Redemption Report tab');
      await redemptionTab.click();
      await page.waitForTimeout(800);
    } else {
      // Try a text-based fallback in case it's not exposed as role=tab
      const fallback = page.getByText(/redemption report/i).first();
      if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(800);
      }
    }

    // Probe the DOM immediately after page-load so we have a baseline
    // for selector iteration, regardless of what happens later.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, 'last-after-nav.png'), fullPage: true }).catch(() => {});
    await dumpDom(page, outDir);

    // ─── Set date range via DOM (URL params may have been ignored) ──────
    // The displayed text is like "Tue, Jun 2, 2026" — a custom date control,
    // not a plain text input. We try several strategies in order and log
    // which one worked so future iterations don't re-guess.
    console.log(`[audit-pull] setting date range ${from} → ${until}`);
    const fromHuman = humanDate(from);
    const untilHuman = humanDate(until);
    let dateStrategy = 'none';

    // Strategy 1: a hidden/visible input whose VALUE looks like a date.
    const inputs = await page.locator('input').all();
    let inputsSet = 0;
    for (const input of inputs) {
      const value = (await input.inputValue().catch(() => '')) ?? '';
      if (/^[A-Z][a-z]{2},?\s+[A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4}$/.test(value) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
        const target = inputsSet === 0 ? fromHuman : untilHuman;
        await input.click({ timeout: 2000 }).catch(() => {});
        await input.fill(target).catch(() => {});
        await input.press('Enter').catch(() => {});
        inputsSet++;
        if (inputsSet >= 2) break;
      }
    }
    if (inputsSet >= 2) {
      dateStrategy = 'value-matched-inputs';
    } else {
      // Strategy 2: click the visible date TEXT, fill the input that the
      // picker exposes inside its popover.
      const dateTexts = page.locator('text=/^[A-Za-z]{3},?\\s+[A-Za-z]{3}\\s+\\d{1,2},?\\s+\\d{4}$/');
      const textCount = await dateTexts.count().catch(() => 0);
      console.log(`[audit-pull] strategy-2 found ${textCount} date-text candidates`);
      for (let i = 0; i < Math.min(textCount, 4) && inputsSet < 2; i++) {
        const target = inputsSet === 0 ? fromHuman : untilHuman;
        await dateTexts.nth(i).click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);
        // The picker may now have an editable input — find the most recently
        // focused element, or any visible input near the click.
        const popoverInput = page.locator('input:visible').first();
        if (await popoverInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await popoverInput.fill(target).catch(() => {});
          await popoverInput.press('Enter').catch(() => {});
          inputsSet++;
        }
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(300);
      }
      if (inputsSet >= 2) dateStrategy = 'click-text-then-fill';
    }
    console.log(`[audit-pull] date strategy: ${dateStrategy} (${inputsSet}/2 set)`);
    if (inputsSet < 2) {
      await page.screenshot({ path: path.join(outDir, 'last-date-input-miss.png'), fullPage: true }).catch(() => {});
      console.warn('[audit-pull] could not locate both date inputs');
    }
    await page.waitForTimeout(500);

    // ─── Set Oddyssey Noir event filter (always; don't skip-if-present) ──
    // Previous "is it already selected?" check matched the word elsewhere on
    // the page and incorrectly skipped. Always perform the selection — it's
    // idempotent if the chip is already there.
    console.log('[audit-pull] setting Events filter to Oddyssey Noir');
    let eventSet = false;
    const eventComboboxSelectors = [
      'input[placeholder*="All Events" i]',
      'input[placeholder*="Events" i]',
      'label:has-text("Events") + * input',
      'label:has-text("Events") ~ * input',
      '[role="combobox"]',
    ];
    for (const sel of eventComboboxSelectors) {
      const loc = page.locator(sel).first();
      if (!(await loc.isVisible({ timeout: 600 }).catch(() => false))) continue;
      await loc.click({ timeout: 1500 }).catch(() => {});
      await loc.fill(EVENT_NAME).catch(() => {});
      await page.waitForTimeout(400);
      const option = page.getByRole('option', { name: new RegExp(EVENT_NAME, 'i') }).first();
      if (await option.isVisible({ timeout: 1500 }).catch(() => false)) {
        await option.click();
        eventSet = true;
        console.log(`[audit-pull] event filter set via "${sel}"`);
        break;
      }
      // Try plain text option fallback
      const textOption = page.getByText(new RegExp(`^${escapeRegex(EVENT_NAME)}$`)).first();
      if (await textOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await textOption.click();
        eventSet = true;
        console.log(`[audit-pull] event filter set via "${sel}" (text fallback)`);
        break;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
    if (!eventSet) {
      console.warn('[audit-pull] could not select Oddyssey Noir event filter');
    }
    await page.waitForTimeout(800);

    // ─── Click "Select All" on ticket types ─────────────────────────────
    const selectAll = page.getByText(/^select all$/i).first();
    if (await selectAll.isVisible({ timeout: 1500 }).catch(() => false)) {
      console.log('[audit-pull] clicking Select All');
      await selectAll.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(outDir, 'last-before-export.png'), fullPage: true }).catch(() => {});

    // ─── Click the kebab/three-dot export menu ──────────────────────────
    // The kebab is at the right end of the date range bar. Try many
    // selector patterns (MUI, semantic, structural). Each click opens a
    // popover; we then look for an Export-ish item.
    let exportClicked = false;
    const exportItemPattern = /export|download|csv|xlsx|spreadsheet/i;

    const kebabCandidates: Array<{ name: string; loc: ReturnType<typeof page.locator> }> = [
      { name: 'button[aria-label~="more" i]', loc: page.locator('button[aria-label~="more" i]') },
      { name: 'button[aria-label~="export" i]', loc: page.locator('button[aria-label~="export" i]') },
      { name: 'button[aria-label~="options" i]', loc: page.locator('button[aria-label~="options" i]') },
      { name: 'button[aria-label~="actions" i]', loc: page.locator('button[aria-label~="actions" i]') },
      { name: 'button[aria-label~="menu" i]', loc: page.locator('button[aria-label~="menu" i]') },
      { name: 'button[aria-haspopup="true"]', loc: page.locator('button[aria-haspopup="true"]') },
      { name: '.MuiIconButton-root', loc: page.locator('.MuiIconButton-root') },
      { name: '[data-testid*="menu"]', loc: page.locator('[data-testid*="menu" i]') },
      // Generic: any button whose tooltip text contains "more options"
      { name: 'button[title*="more" i]', loc: page.locator('button[title*="more" i]') },
      { name: 'button:has(svg)', loc: page.locator('button:has(svg)') },
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
        await page.waitForTimeout(500);
        const exportItem = page.getByText(exportItemPattern).first();
        if (await exportItem.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`[audit-pull] menu opened via "${name}" idx ${i}, found export item`);
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30000 }),
            exportItem.click(),
          ]);
          await saveDownload(download, outDir, from, until);
          exportClicked = true;
          break;
        }
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
async function dumpDom(page: import('playwright').Page, outDir: string): Promise<void> {
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
    const dump = await page.evaluate(evalSrc);
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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();
