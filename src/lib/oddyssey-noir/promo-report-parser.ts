/**
 * Promo Report parser — Tixr `ticket_audit` xlsx → per-night promoter tally.
 *
 * Mirrors Brandon's manual workflow: filter rows where `audit_action ∈
 * {redeemed, force_redeemed}` and `codes` is non-empty, group by code and
 * by the show night's calendar date in America/Los_Angeles.
 *
 * Column resolution is by header NAME (audit_action, codes, session_time,
 * event_name), not Excel letter — Tixr has reordered columns before.
 */

import * as XLSX from 'xlsx';
import { lookupCode, type PromoterMapEntry } from './promoter-map';

export interface PromoReportInput {
  buf: ArrayBuffer | Buffer;
  sourceFile?: string;
  /** YYYY-MM-DD of the Friday; if omitted, auto-detect latest Fri+Sat in file. */
  weekendStart?: string;
}

export interface PromoNightCode {
  code: string;
  count: number;
  rate: number;
  owed: number;
  mapped: PromoterMapEntry | null;
}

export interface PromoNightTally {
  date: string;
  dayOfWeek: 'fri' | 'sat';
  codes: PromoNightCode[];
}

export interface PromoReportResult {
  sourceFile: string;
  weekendLabel: string;
  weekendStart: string;
  weekendEnd: string;
  promoters: PromoNightTally[];
  nonPromoter: PromoNightTally[];
  unmappedCodes: { date: string; code: string; count: number }[];
  totals: {
    promoterRedemptions: number;
    promoterOwed: number;
    nonPromoterRedemptions: number;
    unmappedRedemptions: number;
  };
  warnings: string[];
}

const REQUIRED_HEADERS = ['audit_action', 'codes', 'session_time'] as const;

export function parsePromoReport(input: PromoReportInput): PromoReportResult {
  const warnings: string[] = [];
  const wb = XLSX.read(input.buf, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return emptyResult(input, 'Workbook has no sheets.');
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });
  if (rows.length < 2) {
    return emptyResult(input, 'Sheet has no data rows.');
  }

  const header = rows[0].map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''));
  const idx: Record<string, number> = {};
  for (const h of REQUIRED_HEADERS) {
    const i = header.indexOf(h);
    if (i < 0) {
      return emptyResult(input, `Missing required column "${h}".`);
    }
    idx[h] = i;
  }

  // Collect coded redemption rows with their PT date.
  type CodedRow = { date: string; dayOfWeek: 'fri' | 'sat' | 'other'; code: string };
  const coded: CodedRow[] = [];
  let skippedBadSession = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const action = row[idx.audit_action];
    if (typeof action !== 'string') continue;
    if (!/^(redeemed|force_redeemed)$/i.test(action)) continue;
    const session = row[idx.session_time];
    if (!(session instanceof Date)) {
      skippedBadSession++;
      continue;
    }
    const code = row[idx.codes];
    if (code == null || code === '') {
      // Non-coded redemption (regular paid ticket) — intentionally skipped.
      continue;
    }
    const dateStr = formatPT(session);
    coded.push({
      date: dateStr,
      dayOfWeek: dowOf(dateStr),
      code: String(code).trim(),
    });
  }
  if (skippedBadSession > 0) {
    warnings.push(`Skipped ${skippedBadSession} redemption rows with no parseable session_time.`);
  }

  if (coded.length === 0) {
    return emptyResult(input, 'No coded redemptions found in the file.');
  }

  // Pick the weekend.
  const targetWeekend = pickWeekend(coded, input.weekendStart, warnings);
  if (!targetWeekend) {
    return emptyResult(input, 'Could not identify a Fri+Sat weekend in the file.');
  }
  const { friday, saturday } = targetWeekend;

  // Group by (date, code).
  const grouped = new Map<string, Map<string, number>>();
  for (const row of coded) {
    if (row.date !== friday && row.date !== saturday) continue;
    let m = grouped.get(row.date);
    if (!m) {
      m = new Map();
      grouped.set(row.date, m);
    }
    m.set(row.code, (m.get(row.code) ?? 0) + 1);
  }

  // Build night tallies, split promoter / non-promoter / unmapped.
  const promoterNights: PromoNightTally[] = [];
  const nonPromoterNights: PromoNightTally[] = [];
  const unmappedCodes: { date: string; code: string; count: number }[] = [];
  let promoterRedemptions = 0;
  let promoterOwed = 0;
  let nonPromoterRedemptions = 0;
  let unmappedRedemptions = 0;

  for (const date of [friday, saturday]) {
    const dow = date === friday ? 'fri' : 'sat';
    const codeMap = grouped.get(date) ?? new Map<string, number>();
    const promoter: PromoNightCode[] = [];
    const nonPromoter: PromoNightCode[] = [];

    const sortedCodes = Array.from(codeMap.entries()).sort((a, b) => b[1] - a[1]);
    for (const [code, count] of sortedCodes) {
      const mapped = lookupCode(code);
      if (!mapped) {
        unmappedCodes.push({ date, code, count });
        unmappedRedemptions += count;
        continue;
      }
      const rate = mapped.rate;
      const owed = rate * count;
      const entry: PromoNightCode = { code, count, rate, owed, mapped };
      if (mapped.isPromoter) {
        promoter.push(entry);
        promoterRedemptions += count;
        promoterOwed += owed;
      } else {
        nonPromoter.push(entry);
        nonPromoterRedemptions += count;
      }
    }

    promoterNights.push({ date, dayOfWeek: dow, codes: promoter });
    nonPromoterNights.push({ date, dayOfWeek: dow, codes: nonPromoter });
  }

  return {
    sourceFile: input.sourceFile ?? 'audit.xlsx',
    weekendLabel: weekendLabel(friday, saturday),
    weekendStart: friday,
    weekendEnd: saturday,
    promoters: promoterNights,
    nonPromoter: nonPromoterNights,
    unmappedCodes,
    totals: {
      promoterRedemptions,
      promoterOwed,
      nonPromoterRedemptions,
      unmappedRedemptions,
    },
    warnings,
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────

function formatPT(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function dowOf(iso: string): 'fri' | 'sat' | 'other' {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  if (dow === 5) return 'fri';
  if (dow === 6) return 'sat';
  return 'other';
}

function pickWeekend(
  coded: { date: string; dayOfWeek: 'fri' | 'sat' | 'other' }[],
  override: string | undefined,
  warnings: string[],
): { friday: string; saturday: string } | null {
  if (override) {
    const sat = addDays(override, 1);
    return { friday: override, saturday: sat };
  }
  // Group by date with dow.
  const fridays = new Set<string>();
  const saturdays = new Set<string>();
  for (const row of coded) {
    if (row.dayOfWeek === 'fri') fridays.add(row.date);
    if (row.dayOfWeek === 'sat') saturdays.add(row.date);
  }
  if (saturdays.size === 0) {
    warnings.push('No Saturday redemptions found.');
    return null;
  }
  // Latest Saturday in file → pair with the Friday immediately before it.
  const latestSat = Array.from(saturdays).sort().pop()!;
  const expectedFri = addDays(latestSat, -1);
  if (!fridays.has(expectedFri)) {
    warnings.push(`No Friday redemptions found for ${expectedFri}; using Saturday only.`);
    return { friday: expectedFri, saturday: latestSat };
  }
  return { friday: expectedFri, saturday: latestSat };
}

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function weekendLabel(friday: string, saturday: string): string {
  const friShort = shortDate(friday);
  const satShort = shortDate(saturday);
  const year = friday.slice(0, 4);
  return `Fri ${friShort} + Sat ${satShort}, ${year}`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

function emptyResult(input: PromoReportInput, message: string): PromoReportResult {
  return {
    sourceFile: input.sourceFile ?? 'audit.xlsx',
    weekendLabel: '',
    weekendStart: '',
    weekendEnd: '',
    promoters: [],
    nonPromoter: [],
    unmappedCodes: [],
    totals: {
      promoterRedemptions: 0,
      promoterOwed: 0,
      nonPromoterRedemptions: 0,
      unmappedRedemptions: 0,
    },
    warnings: [message],
  };
}
