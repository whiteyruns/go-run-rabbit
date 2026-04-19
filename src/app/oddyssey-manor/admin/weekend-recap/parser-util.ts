/**
 * Weekend Recap parsers — shared helpers.
 *
 * Both parsers build VenueNight + YTDMonthRow values from raw xlsx cells,
 * so the value-coercion logic lives here.
 *
 * We use SheetJS (`xlsx` npm package) for sheet reading; it converts dates to
 * JS Dates when `cellDates: true` is set on the workbook read.
 */

import type { YTDMonthRow } from './lib';

/** Coerce a cell to a finite number, returning null for anything else. */
export function num(cell: unknown): number | null {
  if (typeof cell === 'number' && Number.isFinite(cell)) return cell;
  if (typeof cell === 'string') {
    // Strip $, commas, parentheses-as-negative.
    const trimmed = cell.trim();
    if (!trimmed) return null;
    const negParen = /^\((.*)\)$/.exec(trimmed);
    const body = negParen ? negParen[1] : trimmed;
    const cleaned = body.replace(/[$,\s]/g, '');
    if (!cleaned) return null;
    const n = Number(cleaned);
    if (Number.isFinite(n)) return negParen ? -n : n;
  }
  return null;
}

/** Format a JS Date as YYYY-MM-DD in UTC. */
export function isoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Coerce a cell to a YYYY-MM-DD string. Handles:
 *   - JS Date (from SheetJS with cellDates:true)
 *   - already-ISO strings
 *   - ad-hoc strings like "Friday Feb 6th" (best-effort, year guessed from context)
 */
export function dateCell(cell: unknown, fallbackYear?: number): string | null {
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
    return isoDate(cell);
  }
  if (typeof cell === 'string') {
    const trimmed = cell.trim();
    if (!trimmed) return null;
    // Already ISO
    const iso = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (iso) return iso[1];
    // "Friday Feb 6th" / "Saturday Feb 7th"
    const m = /^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\w*\s+([A-Z][a-z]+)\s+(\d{1,2})/i.exec(trimmed);
    if (m && fallbackYear) {
      const monthIdx = MONTH_NAMES.indexOf(m[1].toLowerCase().slice(0, 3));
      if (monthIdx >= 0) {
        const day = parseInt(m[2], 10);
        if (day >= 1 && day <= 31) {
          return `${fallbackYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
  }
  return null;
}

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Day-of-week 'fri' | 'sat' | 'other' for a YYYY-MM-DD date. */
export function dowOf(iso: string): 'fri' | 'sat' | 'other' {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  if (dow === 5) return 'fri';
  if (dow === 6) return 'sat';
  return 'other';
}

/** Build an empty 12-month skeleton for a given year. */
export function emptyMonthRows(year: number): YTDMonthRow[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, '0')}`,
    actualRev: null,
    actualNet: null,
    budgetRev: null,
    budgetNet: null,
  }));
}

/**
 * Map a sheet name like "FEBRUARY P&L", "Egan NOVEMBER P&L", or "Egan Dec P&L"
 * → 0-based month index, or null if the name doesn't match.
 *
 * Matches both full month names ("JANUARY") and 3-letter abbreviations ("JAN")
 * delimited by word boundaries — Egan's tab naming has been inconsistent.
 */
export function monthFromSheetName(name: string): number | null {
  const upper = name.toUpperCase();
  // Try full names first (more specific), then fall back to abbreviations.
  for (let i = 0; i < MONTH_LONG.length; i++) {
    if (upper.includes(MONTH_LONG[i])) return i;
  }
  for (let i = 0; i < MONTH_SHORT.length; i++) {
    const re = new RegExp(`\\b${MONTH_SHORT[i]}\\b`);
    if (re.test(upper)) return i;
  }
  return null;
}

const MONTH_LONG = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * Find the row index whose first column matches `label` (case-insensitive
 * substring). 1-based row numbers. Returns null if not found.
 *
 * Useful for both Manor (header rows) and Noir (key:value rows).
 */
export function findRow(
  rows: unknown[][],
  label: string,
  opts: { col?: number; from?: number } = {},
): number | null {
  const col = opts.col ?? 0;
  const from = opts.from ?? 0;
  const needle = label.toLowerCase();
  for (let i = from; i < rows.length; i++) {
    const v = rows[i]?.[col];
    if (typeof v === 'string' && v.toLowerCase().includes(needle)) return i;
  }
  return null;
}
