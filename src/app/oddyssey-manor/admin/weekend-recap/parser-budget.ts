/**
 * Budget workbook parser — reads the AREA15 2026 Budget xlsx (currently
 * "2026.02.06 - Oddyssey 2026 Budget 3-9-26.xlsx"). The authoritative
 * source of 2026 budget numbers for venues whose own weekly workbooks
 * don't carry a budget column (Manor P&L has actuals only).
 *
 * The only sheet we care about is `Oddyssey_Monthly`:
 *   - Row 3 is the month header: cols B..M = Jan..Dec, col N = annual
 *   - Row 7  = Manor revenue budget  (per-month)
 *   - Row 8  = Noir  revenue budget
 *   - Row 14 = Manor net budget (operating income)
 *   - Row 15 = Noir  net budget
 *
 * Other sheets in the workbook (Manor_Inputs, Noir_Inputs, etc.) are the
 * raw assumption tabs that feed Oddyssey_Monthly — we ignore them.
 */
import * as XLSX from 'xlsx';
import type { YTDMonthRow } from './lib';
import { num } from './parser-util';

export interface BudgetParseResult {
  manor: YTDMonthRow[];
  noir: YTDMonthRow[];
  warnings: string[];
}

const ODDYSSEY_MONTHLY_SHEET = 'Oddyssey_Monthly';

/** Row indices are 0-based here; Excel's row 7 is index 6, etc. */
const ROW = {
  manorRev: 6,
  noirRev: 7,
  manorNet: 13,
  noirNet: 14,
} as const;

/** Columns B..M → month indices 0..11. Col A is row label. */
const FIRST_MONTH_COL = 1; // Excel col B
const MONTH_COUNT = 12;

export function parseBudgetWorkbook(
  buf: Buffer,
  year: number,
): BudgetParseResult {
  const warnings: string[] = [];
  const wb = XLSX.read(buf, { cellDates: true });

  if (!wb.SheetNames.includes(ODDYSSEY_MONTHLY_SHEET)) {
    return {
      manor: emptyYTD(year),
      noir: emptyYTD(year),
      warnings: [`Budget workbook is missing the "${ODDYSSEY_MONTHLY_SHEET}" sheet.`],
    };
  }

  const ws = wb.Sheets[ODDYSSEY_MONTHLY_SHEET];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });

  const manorRevRow = rows[ROW.manorRev];
  const noirRevRow = rows[ROW.noirRev];
  const manorNetRow = rows[ROW.manorNet];
  const noirNetRow = rows[ROW.noirNet];

  if (!manorRevRow || !noirRevRow || !manorNetRow || !noirNetRow) {
    warnings.push(
      `Expected rows ${ROW.manorRev + 1}/${ROW.noirRev + 1}/${ROW.manorNet + 1}/${ROW.noirNet + 1} not present — did the Budget workbook reshape?`,
    );
    return { manor: emptyYTD(year), noir: emptyYTD(year), warnings };
  }

  // Quick sanity: row labels in column A should still say Manor / Noir.
  // We don't abort if they don't — the indices are the spec — but we flag
  // so a Finance rename doesn't silently drift.
  if (!labelLooksLike(manorRevRow[0], 'manor')) {
    warnings.push(`Row ${ROW.manorRev + 1} label is "${manorRevRow[0]}", expected "Manor" (rev).`);
  }
  if (!labelLooksLike(noirRevRow[0], 'noir')) {
    warnings.push(`Row ${ROW.noirRev + 1} label is "${noirRevRow[0]}", expected "Noir" (rev).`);
  }
  if (!labelLooksLike(manorNetRow[0], 'manor')) {
    warnings.push(`Row ${ROW.manorNet + 1} label is "${manorNetRow[0]}", expected "Manor" (net).`);
  }
  if (!labelLooksLike(noirNetRow[0], 'noir')) {
    warnings.push(`Row ${ROW.noirNet + 1} label is "${noirNetRow[0]}", expected "Noir" (net).`);
  }

  const manor: YTDMonthRow[] = [];
  const noir: YTDMonthRow[] = [];
  for (let i = 0; i < MONTH_COUNT; i++) {
    const col = FIRST_MONTH_COL + i;
    const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
    manor.push({
      month: monthKey,
      actualRev: null,
      actualNet: null,
      budgetRev: num(manorRevRow[col]),
      budgetNet: num(manorNetRow[col]),
    });
    noir.push({
      month: monthKey,
      actualRev: null,
      actualNet: null,
      budgetRev: num(noirRevRow[col]),
      budgetNet: num(noirNetRow[col]),
    });
  }
  return { manor, noir, warnings };
}

function labelLooksLike(cell: unknown, want: 'manor' | 'noir'): boolean {
  if (typeof cell !== 'string') return false;
  return cell.trim().toLowerCase().includes(want);
}

function emptyYTD(year: number): YTDMonthRow[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, '0')}`,
    actualRev: null,
    actualNet: null,
    budgetRev: null,
    budgetNet: null,
  }));
}

/**
 * Peek at sheet names to tell if a buffer is the Budget workbook. Used by
 * actions.ts to route multi-workbook uploads to the right parser.
 */
export function isBudgetWorkbook(buf: Buffer): boolean {
  try {
    const wb = XLSX.read(buf, { bookSheets: true });
    return wb.SheetNames.includes(ODDYSSEY_MONTHLY_SHEET);
  } catch {
    return false;
  }
}
