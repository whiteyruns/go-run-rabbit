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
    const reportUrl = `${BASE}/${ACCOUNT}/reports/redemption`;
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

    // ─── Set date range ────────────────────────────────────────────────
    // The page has two date inputs (from / to). Targets vary across
    // Ticketure builds — try a few approaches.
    console.log(`[audit-pull] setting date range ${from} → ${until}`);
    const dateInputs = page.locator('input[type="text"]').filter({
      hasText: /,\s*\d{4}$/, // matches things like "May 28, 2026"
    });
    const inputCount = await dateInputs.count().catch(() => 0);
    console.log(`[audit-pull] found ${inputCount} date-like inputs`);

    // Fallback: locate inputs by their displayed value pattern.
    const dateLocator = page.locator('input').filter({
      has: page.locator(':scope'),
    });
    void dateLocator;

    // Most-robust path: find inputs whose value matches a date string and overwrite.
    const allInputs = await page.locator('input').all();
    let dateInputsSet = 0;
    const fromHuman = humanDate(from);
    const untilHuman = humanDate(until);
    for (const input of allInputs) {
      const value = (await input.inputValue().catch(() => '')) ?? '';
      if (/^[A-Z][a-z]{2},\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/.test(value) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
        // First match = from, second = until
        const target = dateInputsSet === 0 ? fromHuman : untilHuman;
        await input.click({ timeout: 3000 }).catch(() => {});
        await input.fill('').catch(() => {});
        await input.fill(target).catch(() => {});
        await input.press('Enter').catch(() => {});
        dateInputsSet++;
        if (dateInputsSet >= 2) break;
      }
    }
    console.log(`[audit-pull] set ${dateInputsSet} date inputs`);
    if (dateInputsSet < 2) {
      await page.screenshot({ path: path.join(outDir, 'last-date-input-miss.png'), fullPage: true }).catch(() => {});
      console.warn('[audit-pull] could not locate both date inputs — proceeding with whatever the page has');
    }
    await page.waitForTimeout(500);

    // ─── Ensure Oddyssey Noir event is selected ─────────────────────────
    // The screenshot shows a chip "Oddyssey Noir x" already selected; the
    // multi-select likely persists across sessions for the logged-in user.
    // If it's missing, click the Events combobox and pick the option.
    const eventsChip = page.getByText(new RegExp(`^${escapeRegex(EVENT_NAME)}$`));
    const hasChip = await eventsChip.first().isVisible({ timeout: 1500 }).catch(() => false);
    if (!hasChip) {
      console.log('[audit-pull] Oddyssey Noir chip missing — selecting it');
      const eventsInput = page.locator('label:has-text("Events")').locator('..').locator('input').first();
      if (await eventsInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventsInput.click();
        await eventsInput.fill(EVENT_NAME);
        await page.waitForTimeout(500);
        const option = page.getByRole('option', { name: new RegExp(EVENT_NAME, 'i') }).first();
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
        }
      }
    } else {
      console.log('[audit-pull] Oddyssey Noir already selected');
    }
    await page.waitForTimeout(500);

    // ─── Click "Select All" on ticket types (safe default) ──────────────
    const selectAll = page.getByText(/^select all$/i).first();
    if (await selectAll.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[audit-pull] clicking Select All');
      await selectAll.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(outDir, 'last-before-export.png'), fullPage: true }).catch(() => {});

    // ─── Click the kebab/three-dot export menu ──────────────────────────
    let exportClicked = false;
    const kebabCandidates = [
      page.locator('button[aria-label*="more" i]'),
      page.locator('button[aria-haspopup="true"]'),
      page.locator('[data-toggle="dropdown"]'),
      page.locator('.EditOptions__toggle'),
      page.locator('button:has(svg)'),
    ];
    for (const loc of kebabCandidates) {
      const count = await loc.count().catch(() => 0);
      for (let i = 0; i < count && !exportClicked; i++) {
        const el = loc.nth(i);
        if (!(await el.isVisible({ timeout: 500 }).catch(() => false))) continue;
        await el.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);
        const exportItem = page.getByText(/export|download.*xlsx|download.*csv/i).first();
        if (await exportItem.isVisible({ timeout: 1500 }).catch(() => false)) {
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30000 }),
            exportItem.click(),
          ]);
          await saveDownload(download, outDir, from, until);
          exportClicked = true;
          break;
        }
        // Close menu so we can try the next candidate
        await page.keyboard.press('Escape').catch(() => {});
      }
      if (exportClicked) break;
    }

    if (!exportClicked) {
      await page.screenshot({ path: path.join(outDir, 'last-export-not-found.png'), fullPage: true }).catch(() => {});
      throw new Error(
        'Could not locate the kebab/export menu on the Redemption Report page — ' +
          'check last-export-not-found.png to see the rendered DOM.',
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
