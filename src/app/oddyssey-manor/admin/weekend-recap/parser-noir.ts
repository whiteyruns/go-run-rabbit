/**
 * Weekend Recap — NOIR Budgets & Reports workbook parser.
 *
 * Workbook shape (from NOIR Budgets & Reports.xlsx, Apr 2026):
 *   YTD REPORT sheet:
 *     4-column-per-month stacked layout. Jan=cols A-B (budget col C), blank col D,
 *     Feb=cols E-F (budget G), blank H, Mar=I-J (budget K), blank L, Apr=M-N (budget O), …
 *     R5 row has month headers: JANUARY in A1, FEBRUARY in E5, MARCH in I5, APRIL in M5.
 *     Each monthly column block has the same label rows R6..R25 (see below).
 *
 *   Per-night Report sheets:
 *     Named "LG <m>.<d>" (Friday Liber Gigante) or "NOIR <m>.<d>.26" (Saturday).
 *     Budget sheet pairs (e.g. "LG 4.17 Budget" / "LG 4.17 Report") — we only
 *     parse Report sheets.
 *     25 rows, key:value in columns B (label) + C (value). Canonical layout:
 *       R3  Event Date:             <Date>
 *       R4  Start/End:              "10:00pm - 3:00am"
 *       R5  Tickets Redeemed:       <n>
 *       R6  Tickets Reserved:       <n>
 *       R9  F & B PPA:              <$>
 *       R10 Net Ticket Rev:         <$>
 *       R11 Net POS Beverage (Sq):  <$>
 *       R12 Marketing               <$ negative>
 *       R13 Stacia Talent Cost:     <$ negative>
 *       R14 DJ:                     <$ negative>
 *       R15 Promo:                  <$ negative>
 *       R16 Host/Box Office:        <$ negative>
 *       R17 F&B Labor Cost:         <$ negative>
 *       R18 Public Area Services:   <$ negative>
 *       R19 Security Cost:          <$ negative>
 *       R20 Production:             <$ negative>
 *       R21 Assistant:              <$ negative>
 *       R22 Total Staffing Cost:    <$ negative, sum>
 *       R23 House Tab:              <$ negative>
 *       R24 Incentives:             <$ negative>
 *       R25 Total Rev. w/Incentive: <$ signed>
 */

import * as XLSX from 'xlsx';
import { dateCell, dowOf, emptyMonthRows, findRow, num } from './parser-util';
import type { VenueNight, YTDMonthRow } from './lib';

export interface NoirParseResult {
  nights: VenueNight[];
  ytd: YTDMonthRow[];
  warnings: string[];
}

const REPORT_SHEET_RE = /\bReport\b/i;
const YTD_SHEET_RE = /^YTD\s*REPORT$/i;

export function parseNoirWorkbook(buf: ArrayBuffer | Buffer, year = 2026): NoirParseResult {
  const wb = XLSX.read(buf, { cellDates: true });
  const warnings: string[] = [];
  const nights: VenueNight[] = [];
  let ytd = emptyMonthRows(year);

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      blankrows: true,
    });

    if (YTD_SHEET_RE.test(sheetName)) {
      try {
        ytd = parseNoirYTDSheet(rows, year);
      } catch (err) {
        warnings.push(`YTD sheet: ${(err as Error).message}`);
      }
      continue;
    }

    if (REPORT_SHEET_RE.test(sheetName)) {
      try {
        const night = parseNoirReportSheet(rows, sheetName, year);
        if (night) nights.push(night);
      } catch (err) {
        warnings.push(`Report sheet "${sheetName}": ${(err as Error).message}`);
      }
    }
  }

  return { nights, ytd, warnings };
}

// ─── Per-night Report sheet ────────────────────────────────────────────────

function parseNoirReportSheet(
  rows: unknown[][],
  sheetName: string,
  fallbackYear: number,
): VenueNight | null {
  // Detect label column: SheetJS trims leading empty columns, so labels
  // can live in col 0 (index 0) OR col 1 (index 1) depending on how Stacia
  // saved the file. Try both.
  const labelCol = detectLabelColumn(rows);
  const valueCol = labelCol + 1;
  const findByLabel = (label: string): number | null =>
    findRow(rows, label, { col: labelCol });

  const eventDateRow = findByLabel('Event Date');
  const date =
    eventDateRow != null
      ? dateCell(rows[eventDateRow]?.[valueCol], fallbackYear) ?? deriveDateFromName(sheetName, fallbackYear)
      : deriveDateFromName(sheetName, fallbackYear);

  if (!date) return null;

  const dow = dowOf(date);
  if (dow === 'other') {
    // Allow ambiguous dates — default to Fri for LG, Sat for NOIR.
    const forced: 'fri' | 'sat' = /^NOIR/i.test(sheetName) ? 'sat' : 'fri';
    return buildNoirNight(rows, date, forced, findByLabel, valueCol);
  }
  return buildNoirNight(rows, date, dow, findByLabel, valueCol);
}

function buildNoirNight(
  rows: unknown[][],
  date: string,
  weeknight: 'fri' | 'sat',
  findByLabel: (label: string) => number | null,
  valueCol: number,
): VenueNight {
  const get = (label: string): number | null => {
    const r = findByLabel(label);
    return r != null ? num(rows[r]?.[valueCol]) : null;
  };
  // Stacia's Noir report template pre-fills a lot of rows with `0` as a
  // placeholder for "not yet entered" (Net POS Beverage, Final Click,
  // F&B PPA, etc.). A Noir show with hundreds of redemptions having
  // literally $0 in bar revenue is implausible, so we flip a literal
  // zero to null for barNet so the UI renders — instead of a misleading
  // $0.00. True-zero bar nights can set something non-zero or we revise
  // when we see a false negative.
  const barRaw = get('Net POS Beverage');
  return {
    date,
    venue: 'noir',
    weeknight,
    ticketsIssued: get('Tickets Reserved'),
    ticketsRedeemed: get('Tickets Redeemed'),
    netTicketRev: get('Net Ticket Rev'),
    barNet: barRaw === 0 ? null : barRaw,
    costs: {
      marketing: get('Marketing'),
      staciaTalent: get('Stacia Talent'),
      dj: get('DJ:'),
      promo: get('Promo'),
      hostBox: get('Host/Box Office'),
      fbLabor: get('F&B Labor'),
      publicAreaServices: get('Public Area Services'),
      security: get('Security'),
      production: get('Production'),
      assistant: get('Assistant'),
      totalStaffing: get('Total Staffing'),
      houseTab: get('House Tab'),
      incentives: get('Incentives'),
    },
    totalNet: get('Total Rev'),
  };
}

/**
 * Noir report sheets have a leading empty column in the raw xlsx, but
 * SheetJS's sheet_to_json may or may not trim it depending on the sheet's
 * stored range. Detect where the labels live by scanning for a known label.
 */
function detectLabelColumn(rows: unknown[][]): number {
  for (let col = 0; col <= 2; col++) {
    for (const row of rows) {
      const v = row?.[col];
      if (typeof v === 'string' && /event\s+date|tickets\s+redeemed/i.test(v)) return col;
    }
  }
  return 0;
}

/**
 * Recover a date from sheet names like "LG 4.17 Report" or "NOIR 4.18 Report"
 * when the in-sheet Event Date cell is missing/garbled. Month format: M.D or M.D.YY.
 */
function deriveDateFromName(sheetName: string, fallbackYear: number): string | null {
  const m = /(\d{1,2})\.(\d{1,2})(?:\.(\d{2}))?/.exec(sheetName);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const yr = m[3] ? 2000 + parseInt(m[3], 10) : fallbackYear;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${yr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── YTD REPORT sheet ──────────────────────────────────────────────────────

/**
 * YTD layout is 4 columns per month (label, actual, budgeted, blank) starting
 * in column A. Month header at row 5. We walk the row 5 cells to locate each
 * month and compute actualNet by summing cost lines under that month.
 */
function parseNoirYTDSheet(rows: unknown[][], year: number): YTDMonthRow[] {
  const out = emptyMonthRows(year);
  const headerRow = findRow(rows, 'JANUARY', { col: 0 });
  if (headerRow == null) return out;

  const labelsRow = rows[headerRow] ?? [];
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
    const labelCol = findCol(labelsRow, months[monthIdx]);
    if (labelCol == null) continue;
    const actualCol = labelCol + 1;
    const budgetCol = labelCol + 2;

    // Revenue = Net Ticket Rev + Net POS Beverage. Net = Total Rev. w/Incentive.
    const rev =
      findValueInCol(rows, 'Net Ticket Rev', labelCol, actualCol, headerRow);
    const bar =
      findValueInCol(rows, 'Net POS Beverage', labelCol, actualCol, headerRow);
    const net =
      findValueInCol(rows, 'Total Rev', labelCol, actualCol, headerRow);

    const bRev =
      findValueInCol(rows, 'Net Ticket Rev', labelCol, budgetCol, headerRow);
    const bBar =
      findValueInCol(rows, 'Net POS Beverage', labelCol, budgetCol, headerRow);
    const bNet =
      findValueInCol(rows, 'Total Rev', labelCol, budgetCol, headerRow);

    const actualRev =
      rev == null && bar == null ? null : (rev ?? 0) + (bar ?? 0);

    out[monthIdx].actualRev = actualRev === 0 ? null : actualRev;
    out[monthIdx].actualNet = net;
    // Budget columns intentionally left blank — Oddyssey_Monthly (in the
    // 2026 Budget workbook) is the canonical budget source for BOTH
    // venues. The budget column on the NOIR YTD REPORT sheet is a
    // different lens (venue-level operational target) that would
    // conflict with Manor's forecast-based budget. Voiding the write
    // here; the 2026 Budget workbook upload provides authoritative
    // budgetRev + budgetNet via mergeYTDBudget().
    // (Variables bRev/bBar/bNet still computed above for future use if
    // we ever expose the "operational target" as a separate metric.)
    void bRev; void bBar; void bNet;
  }

  return out;
}

function findCol(row: unknown[], label: string): number | null {
  const upper = label.toUpperCase();
  for (let i = 0; i < row.length; i++) {
    const v = row[i];
    if (typeof v === 'string' && v.toUpperCase().includes(upper)) return i;
  }
  return null;
}

function findValueInCol(
  rows: unknown[][],
  label: string,
  labelCol: number,
  valueCol: number,
  from: number,
): number | null {
  const needle = label.toLowerCase();
  for (let i = from; i < rows.length; i++) {
    const v = rows[i]?.[labelCol];
    if (typeof v === 'string' && v.toLowerCase().includes(needle)) {
      return num(rows[i]?.[valueCol]);
    }
  }
  return null;
}
