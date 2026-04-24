/**
 * Weekend Recap — MANOR P&L workbook parser.
 *
 * Workbook shape (from MANOR P&L.xlsx, Apr 2026):
 *   Tabs:
 *     - "Pro Forma 10/20 Performas" (templates, ignored)
 *     - "MANOR Per Show Cost"       (template, ignored)
 *     - "OCTOBER P&L"               (full QB chart of accounts template, mostly empty)
 *     - "Egan NOVEMBER P&L"         (Egan format)
 *     - "Egan Dec P&L"              (Egan format)
 *     - "JANUARY P&L"               (Egan format)
 *     - "FEBRUARY P&L"              (Egan format) ← canonical example below
 *     - "MARCH P&L"                 (Egan format)
 *     - "APRIL P&L"                 (Egan format, currently mostly empty)
 *     - "Nov Rev"…"ARPIL Rev"       (per-night revenue + cost cols)
 *
 * Egan monthly P&L tab structure (8-column-equivalent, col B = $):
 *   R2:  "<Month> 2026"
 *   R4:  "PAYROLL/HR"   header
 *   R5..R14:  line items
 *   R15: "TOTAL"        payroll total
 *   R17: "INSURANCE"
 *   R25: "TOTAL"        insurance total
 *   R27: "MAINTENANCE / SUPPLIES"
 *   R35: "TOTAL"
 *   R37: "MANAGERS FEE"
 *   R40: "TOTAL"        managers fee total
 *   R43: "TOTAL"        all-expenses total (negative)
 *   R45: "<Month> Ticket Rev"
 *   R46: "<Month> Bar Rev"
 *   R48: "MANOR NET"
 *
 * Rev tab structure — TWO formats:
 *   New (March/April 2026+):
 *     R10: [DATE, T-NET Issued, T-Redeemed, CAST, REHEARSALS, RIGGER,
 *           T-NET, SQUARE NET, TICKETS PAID, AVERAGE $/TICKET]
 *     R11+: data rows, blank rows separate weeks
 *     Date col is JS Date.
 *   Old (Nov-Feb 2026):
 *     R9:  [DATE, T-NET Issued, T-Redeemed, Discounts, Refunds, T-NET, SQUARE NET]
 *     R10+: data rows; date col is text like "Friday Feb 6th"
 *     No nightly cost columns — Cast/Rigger/Rehearsal not tracked nightly here.
 *
 * Returns:
 *   - manorNights: per-night data (only for dates we can resolve)
 *   - manorYTD:    one YTDMonthRow per month with actualRev / actualNet populated
 */

import * as XLSX from 'xlsx';
import { dateCell, dowOf, emptyMonthRows, findRow, isoDate, monthFromSheetName, num } from './parser-util';
import type { VenueNight, YTDMonthRow } from './lib';

export interface ManorParseResult {
  nights: VenueNight[];
  ytd: YTDMonthRow[];
  warnings: string[];
}

const REV_TAB_RE = /\bRev\b|\bRevenue\b/i;
const PNL_TAB_RE = /P\s*&\s*L/i;

/**
 * Parse a MANOR P&L workbook from an xlsx buffer.
 * `year` is used to anchor old-format Rev sheets where dates are text strings.
 */
export function parseManorWorkbook(buf: ArrayBuffer | Buffer, year = 2026): ManorParseResult {
  const wb = XLSX.read(buf, { cellDates: true });
  const warnings: string[] = [];
  const nights: VenueNight[] = [];
  const ytd = emptyMonthRows(year);

  // Skip future-month sheets when processing the current calendar year.
  // Nov/Dec tabs in this workbook are legacy 2025 data left over from the
  // prior-year template; stamping them as 2026 produced phantom actuals
  // in the YTD strip. If Finance keeps the workbook updated past month N,
  // we only process sheets ≤ the current real-world month.
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0=Jan..11=Dec
  const isLegacyFutureMonth = (monthIdx: number) =>
    year === currentYear && monthIdx > currentMonth;

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      blankrows: true,
    });

    if (REV_TAB_RE.test(sheetName)) {
      let monthIdx = monthFromSheetName(sheetName);
      if (monthIdx != null && isLegacyFutureMonth(monthIdx)) {
        warnings.push(`Skipped "${sheetName}" — legacy/future month for ${year}.`);
        continue;
      }
      try {
        const parsedNights = parseManorRevSheet(rows, sheetName, year);
        nights.push(...parsedNights);
        // Fallback: if the sheet name is too garbled for
        // monthFromSheetName (Egan typos "ARPIL Rev" for April, etc.),
        // infer the month from a parsed night's date.
        if (monthIdx == null && parsedNights.length > 0) {
          const inferred = Number(parsedNights[0].date.split('-')[1]) - 1;
          if (Number.isInteger(inferred) && inferred >= 0 && inferred <= 11) {
            monthIdx = inferred;
            warnings.push(
              `Sheet "${sheetName}" → month inferred from dates as month ${inferred + 1}.`,
            );
          }
        }
        // Rev sheets carry the authoritative running month totals in
        // rows 2–7 (Ticket NET, Square NET, TOTAL NET). Read them here
        // because Egan's P&L tabs are sometimes mislabeled (e.g., April
        // P&L tab has "March Ticket Rev" as a copy-paste leftover).
        if (monthIdx != null && !isLegacyFutureMonth(monthIdx)) {
          const totals = parseManorRevSheetTotals(rows);
          if (totals.actualRev != null) {
            ytd[monthIdx].actualRev = totals.actualRev;
          }
        }
      } catch (err) {
        warnings.push(`Rev sheet "${sheetName}": ${(err as Error).message}`);
      }
      continue;
    }

    if (PNL_TAB_RE.test(sheetName)) {
      try {
        const monthIdx = monthFromSheetName(sheetName);
        if (monthIdx == null) continue; // OCTOBER P&L template etc.
        if (isLegacyFutureMonth(monthIdx)) {
          warnings.push(`Skipped "${sheetName}" — legacy/future month for ${year}.`);
          continue;
        }
        const r = parseManorPnlSheet(rows);
        if (r) {
          // P&L tab is the source of truth for NET (rev - overhead).
          // Only overlay actualRev when the P&L tab has a non-zero
          // value and Rev sheet didn't already populate it — because
          // the P&L tab's rev rows sometimes have stale / wrong labels.
          if (ytd[monthIdx].actualRev == null && r.actualRev != null && r.actualRev > 0) {
            ytd[monthIdx].actualRev = r.actualRev;
          }
          ytd[monthIdx].actualNet = r.actualNet;
        }
      } catch (err) {
        warnings.push(`P&L sheet "${sheetName}": ${(err as Error).message}`);
      }
    }
  }

  return { nights, ytd, warnings };
}

// ─── Rev sheet ─────────────────────────────────────────────────────────────

function parseManorRevSheet(
  rows: unknown[][],
  sheetName: string,
  fallbackYear: number,
): VenueNight[] {
  // Find the header row (case-insensitive 'DATE' in col A).
  const headerIdx = findRow(rows, 'date', { col: 0 });
  if (headerIdx == null) return [];

  const header = (rows[headerIdx] ?? []).map((v) => (typeof v === 'string' ? v.trim() : v));
  // Map column positions by header label.
  const colIdx = (label: string): number =>
    header.findIndex((h) => typeof h === 'string' && h.toLowerCase() === label.toLowerCase());

  const C_DATE = 0;
  const C_TISSUED = colIdx('T - NET Issued');
  const C_TREDEEMED = colIdx('T - Redeemed');
  const C_CAST = colIdx('CAST');
  const C_REHEARSALS = colIdx('REHEARSALS');
  const C_RIGGER = colIdx('RIGGER');
  const C_TNET = colIdx('T - NET');
  const C_SQUARE = colIdx('SQUARE NET');

  const out: VenueNight[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const date = dateCell(row[C_DATE], fallbackYear);
    if (!date) continue;

    const dow = dowOf(date);
    // Phase 3 only surfaces Fri+Sat in the weekend recap.
    if (dow === 'other') continue;

    const night: VenueNight = {
      date,
      venue: 'manor',
      weeknight: dow,
      ticketsIssued: C_TISSUED >= 0 ? num(row[C_TISSUED]) : null,
      ticketsRedeemed: C_TREDEEMED >= 0 ? num(row[C_TREDEEMED]) : null,
      netTicketRev: C_TNET >= 0 ? num(row[C_TNET]) : null,
      barNet: C_SQUARE >= 0 ? num(row[C_SQUARE]) : null,
      costs: {
        cast: C_CAST >= 0 ? num(row[C_CAST]) : null,
        rehearsals: C_REHEARSALS >= 0 ? num(row[C_REHEARSALS]) : null,
        rigger: C_RIGGER >= 0 ? num(row[C_RIGGER]) : null,
      },
    };
    out.push(night);
  }
  // De-dupe by date (older format has ranges; keep the LAST entry which is
  // the most-recently-edited row).
  const dedup = new Map<string, VenueNight>();
  for (const n of out) dedup.set(n.date, n);
  return Array.from(dedup.values());
}

/**
 * Rev sheets have running month totals in a header block at the top:
 *   row 2: "Ticket NET" | <value>
 *   row 3: "Square NET" | <value>
 *   row 7: "TOTAL NET"  | <value>
 * Read those because they're more reliable than the corresponding
 * P&L-tab rows which Egan sometimes mislabels (e.g., April P&L
 * contains rows labeled "March Ticket Rev" as copy-paste leftovers).
 */
function parseManorRevSheetTotals(rows: unknown[][]): { actualRev: number | null } {
  const ticketNetRow = findRow(rows, 'Ticket NET', { col: 0 });
  const squareNetRow = findRow(rows, 'Square NET', { col: 0 });
  const totalNetRow = findRow(rows, 'TOTAL NET', { col: 0 });
  const ticketNet = ticketNetRow != null ? num(rows[ticketNetRow]?.[1]) : null;
  const squareNet = squareNetRow != null ? num(rows[squareNetRow]?.[1]) : null;
  const totalNet = totalNetRow != null ? num(rows[totalNetRow]?.[1]) : null;
  // Prefer TOTAL NET when it's non-trivial; otherwise sum Ticket + Square.
  let actualRev: number | null = null;
  if (totalNet != null && totalNet > 0) actualRev = totalNet;
  else if (ticketNet != null || squareNet != null) {
    const sum = (ticketNet ?? 0) + (squareNet ?? 0);
    actualRev = sum > 0 ? sum : null;
  }
  return { actualRev };
}

// ─── P&L sheet ─────────────────────────────────────────────────────────────

interface ManorPnlExtract {
  actualRev: number | null;
  actualNet: number | null;
}

function parseManorPnlSheet(rows: unknown[][]): ManorPnlExtract | null {
  // Find the canonical anchors. Be permissive about exact row numbers in case
  // Egan adds/removes line items in a future month.
  const ticketRevRow = findRow(rows, 'Ticket Rev', { col: 0 });
  const barRevRow = findRow(rows, 'Bar Rev', { col: 0 });
  const netRow = findRow(rows, 'MANOR NET', { col: 0 });
  if (netRow == null && ticketRevRow == null && barRevRow == null) return null;

  const ticketRev = ticketRevRow != null ? num(rows[ticketRevRow]?.[1]) : null;
  const barRev = barRevRow != null ? num(rows[barRevRow]?.[1]) : null;
  const actualRev =
    ticketRev == null && barRev == null ? null : (ticketRev ?? 0) + (barRev ?? 0);

  const actualNet = netRow != null ? num(rows[netRow]?.[1]) : null;

  // Empty months (April template, October template) show zero rev + zero net.
  // Treat all-zero as "no data yet" so the YTD strip renders "—".
  if ((actualRev === 0 || actualRev == null) && (actualNet === 0 || actualNet == null)) {
    return { actualRev: null, actualNet: null };
  }
  return { actualRev, actualNet };
}

// Re-exports for tests
export { isoDate as _isoDate };
