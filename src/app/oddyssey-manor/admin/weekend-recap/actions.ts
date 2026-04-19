'use server';

/**
 * Weekend Recap — server actions.
 *
 * Drives the /admin/weekend-recap/upload page. Keith drops one or two xlsx
 * files (MANOR P&L and/or NOIR Budgets & Reports); the server detects which
 * workbook each file is by peeking at its sheet names, runs the right parser,
 * and writes:
 *   - per-weekend JSON (Fri+Sat pair) via upsertVenueNight()
 *   - per-venue YTD rollup JSON via writeYTDRollup()
 */

import { revalidatePath } from 'next/cache';
import { parseManorWorkbook } from './parser-manor';
import { parseNoirWorkbook } from './parser-noir';
import type { VenueNight, YTDMonthRow } from './lib';
import { upsertVenueNight, writeYTDRollup } from './lib';
import * as XLSX from 'xlsx';

export interface UploadOutcome {
  ok: boolean;
  error?: string;
  summary?: {
    workbookType: 'manor' | 'noir';
    filename: string;
    nightsWritten: number;
    ytdMonthsPopulated: number;
    weekendsTouched: string[];   // ISO Friday anchors
    warnings: string[];
  }[];
}

const DEFAULT_YEAR = 2026;

export async function uploadWorkbooks(formData: FormData): Promise<UploadOutcome> {
  const files = formData.getAll('files');
  if (!files.length) return { ok: false, error: 'No files uploaded.' };

  const summary: UploadOutcome['summary'] = [];

  for (const entry of files) {
    if (!(entry instanceof File)) continue;
    if (entry.size === 0) continue;

    const buf = Buffer.from(await entry.arrayBuffer());
    const workbookType = detectWorkbookType(buf);
    if (!workbookType) {
      summary.push({
        workbookType: 'manor',
        filename: entry.name,
        nightsWritten: 0,
        ytdMonthsPopulated: 0,
        weekendsTouched: [],
        warnings: [
          `Could not detect workbook type for "${entry.name}". ` +
            `Expected MANOR P&L (look for a "… Rev" sheet) or NOIR Budgets & Reports ` +
            `(look for a "YTD REPORT" sheet).`,
        ],
      });
      continue;
    }

    if (workbookType === 'manor') {
      const result = parseManorWorkbook(buf, DEFAULT_YEAR);
      const touched = await writeNightsAndYTD('manor', result.nights, result.ytd);
      summary.push({
        workbookType: 'manor',
        filename: entry.name,
        nightsWritten: result.nights.length,
        ytdMonthsPopulated: result.ytd.filter((m) => m.actualNet != null).length,
        weekendsTouched: touched,
        warnings: result.warnings,
      });
    } else {
      const result = parseNoirWorkbook(buf, DEFAULT_YEAR);
      const touched = await writeNightsAndYTD('noir', result.nights, result.ytd);
      summary.push({
        workbookType: 'noir',
        filename: entry.name,
        nightsWritten: result.nights.length,
        ytdMonthsPopulated: result.ytd.filter((m) => m.actualNet != null).length,
        weekendsTouched: touched,
        warnings: result.warnings,
      });
    }
  }

  revalidatePath('/oddyssey-manor/admin/weekend-recap');
  return { ok: true, summary };
}

async function writeNightsAndYTD(
  venue: 'manor' | 'noir',
  nights: VenueNight[],
  ytd: YTDMonthRow[],
): Promise<string[]> {
  const anchors = new Set<string>();
  for (const n of nights) {
    const anchor = await upsertVenueNight(n);
    anchors.add(anchor);
  }
  await writeYTDRollup({
    venue,
    year: DEFAULT_YEAR,
    rows: ytd,
    lastUploadedAt: null, // writeYTDRollup stamps this
  });
  return Array.from(anchors).sort();
}

/**
 * Decide which parser to run by inspecting sheet names.
 *   - Manor P&L has "<Month> P&L" sheets and "<Month> Rev" sheets.
 *   - Noir Budgets & Reports has "YTD REPORT" and "LG <date> Report" / "NOIR <date> Report".
 */
function detectWorkbookType(buf: Buffer): 'manor' | 'noir' | null {
  try {
    const wb = XLSX.read(buf, { bookSheets: true }); // fast: only sheet names
    const names = wb.SheetNames.map((n) => n.toUpperCase());
    if (names.some((n) => n === 'YTD REPORT' || /NOIR\s+\d|\bLG\s+\d/.test(n))) return 'noir';
    if (names.some((n) => /MANOR PER SHOW COST|P\s*&\s*L/.test(n) && names.some((n2) => /\bREV\b/.test(n2))))
      return 'manor';
    if (names.some((n) => /P\s*&\s*L/.test(n))) return 'manor';
    return null;
  } catch {
    return null;
  }
}
