/**
 * Sponsor Recap — data layer.
 *
 * Responsibilities:
 *   1. Read Pour Log entries for a date range (reuses Pour Log's lib).
 *   2. Group nightly data by featured tequila and champagne brand.
 *   3. Compute attach rate = bottles consumed / tickets sold that night.
 *   4. Expose a tiny API the UI + email template consume.
 *
 * Ticket counts:
 *   Keith's existing Ticketure ingestion writes nightly data somewhere under
 *   `data/oddyssey/` on the Mac Mini. I don't know the exact file shape from
 *   here, so `readTicketCount()` is implemented with a lookup pattern Console
 *   can wire in one place. See TODO-TICKETURE below.
 *
 * Server-only. Do NOT import from a client component.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  listEntries,
  type PourLogEntry,
  tequilaPoursFromBottles,
  champagnePoursFromBottles,
  NIGHT_THEME_LABEL,
} from '../pour-log/lib';
import { findLatestPullForDate } from '@/lib/oddyssey-food/history';
import { buildStateFromCsv } from '@/lib/oddyssey-food/build-state';
import { buildSummary } from '@/lib/oddyssey-food/summary';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Which column of the Pour Log entry the brand lives on. */
export type SponsorKind = 'tequila' | 'champagne';

export interface SponsorNightStat {
  date: string;                 // YYYY-MM-DD
  nightTheme: PourLogEntry['nightTheme'];
  themeLabel: string;           // "Liber Gigante" | "Anatomia Imaginaria Movil"
  bottlesConsumed: number;      // rounded to 0.1
  estimatedPours: number;       // integer, from pour math helpers
  ticketsSold: number | null;   // null when ticket data unavailable
  attachRatePct: number | null; // null when ticketsSold missing OR 0
  notes?: string;               // optional from pour log entry
}

export interface SponsorRecapData {
  brand: string;                 // "El Bandido", "Telsen", "KU"
  kind: SponsorKind;
  rangeStart: string;            // YYYY-MM-DD (inclusive)
  rangeEnd: string;              // YYYY-MM-DD (inclusive)
  nights: SponsorNightStat[];
  totals: {
    activations: number;         // nights this brand appeared
    bottles: number;             // sum of bottlesConsumed, rounded to 0.1
    pours: number;               // sum of estimatedPours
    tickets: number | null;      // sum ticketsSold; null if any night missing data
    attachRatePct: number | null; // aggregate pours / tickets * 100
  };
}

/** List of unique brand/kind pairs seen in a date range — drives the index UI. */
export interface BrandActivation {
  brand: string;
  kind: SponsorKind;
  nightCount: number;
}

// ─── Date helpers ──────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(s: string): boolean {
  return DATE_RE.test(s);
}

/**
 * Compute the Friday–Thursday "sponsor week" containing a given date.
 * Golden Hour runs Fri/Sat, so a week ending Thursday captures both and
 * gives GM time to file Saturday's pour log before Monday.
 */
export function sponsorWeekContaining(dateISO: string): { start: string; end: string } {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat

  // Days to go back to reach the most recent Friday (inclusive).
  const daysBackToFri = (dow + 7 - 5) % 7; // Fri=0, Sat=1, Sun=2, ... Thu=6
  const start = new Date(dt);
  start.setUTCDate(dt.getUTCDate() - daysBackToFri);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6); // Thu
  return { start: isoDate(start), end: isoDate(end) };
}

function isoDate(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function entryInRange(e: PourLogEntry, start: string, end: string): boolean {
  return e.date >= start && e.date <= end;
}

// ─── Ticketure ticket count reader ─────────────────────────────────────────

/**
 * Attach-rate denominator — actual butts-in-seats for the night.
 *
 * Sourced from the latest Ticketure attendees CSV pulled by the Manor
 * scheduler (data/oddyssey-food/pulls/attendees-YYYY-MM-DD-*.csv). We
 * deliberately use the admission count (not Ticketure's "reserved" total)
 * because Ticketure counts every food inclusion as a separate ticket —
 * that inflates the denominator and understates real attach.
 *
 * Returns null when no pull exists for the date yet (attach rate hidden
 * in the recap, gracefully handled downstream).
 */
export async function readTicketCount(dateISO: string): Promise<number | null> {
  const csvPath = findLatestPullForDate(dateISO);
  if (!csvPath) return null;
  try {
    const csv = fs.readFileSync(csvPath, 'utf-8');
    const { state } = buildStateFromCsv(path.basename(csvPath), csv);
    const summary = buildSummary(state, dateISO);
    return summary?.tickets_sold ?? null;
  } catch {
    return null;
  }
}

// ─── Brand index ───────────────────────────────────────────────────────────

/**
 * All brand/kind pairs that had at least one Pour Log entry in a range,
 * sorted by nightCount desc. Drives the "pick a brand" UI.
 */
export async function brandActivationsInRange(
  start: string,
  end: string,
): Promise<BrandActivation[]> {
  const entries = await listEntries(365); // generous window; filtered below
  const inRange = entries.filter((e) => entryInRange(e, start, end));
  const map = new Map<string, BrandActivation>();
  for (const e of inRange) {
    touchBrand(map, e.featuredTequila, 'tequila');
    touchBrand(map, e.champagne, 'champagne');
  }
  return Array.from(map.values()).sort((a, b) => b.nightCount - a.nightCount);
}

function touchBrand(map: Map<string, BrandActivation>, brand: string, kind: SponsorKind) {
  if (!brand) return;
  const key = `${kind}:${brand.toLowerCase()}`;
  const existing = map.get(key);
  if (existing) {
    existing.nightCount += 1;
  } else {
    map.set(key, { brand, kind, nightCount: 1 });
  }
}

// ─── Recap assembly ────────────────────────────────────────────────────────

export async function recapForBrand(params: {
  brand: string;
  kind: SponsorKind;
  rangeStart: string;
  rangeEnd: string;
}): Promise<SponsorRecapData> {
  const { brand, kind, rangeStart, rangeEnd } = params;
  const entries = await listEntries(365);
  const inRange = entries.filter(
    (e) =>
      entryInRange(e, rangeStart, rangeEnd) &&
      brandMatches(e, brand, kind),
  );

  const nights: SponsorNightStat[] = [];
  let anyTicketMissing = false;

  for (const e of inRange) {
    const ticketsSold = await readTicketCount(e.date);
    if (ticketsSold == null) anyTicketMissing = true;

    const bottles =
      kind === 'tequila' ? e.tequila.consumed : e.champagneBottles.consumed;
    const pours =
      kind === 'tequila'
        ? tequilaPoursFromBottles(bottles)
        : champagnePoursFromBottles(bottles);

    const attachRatePct =
      ticketsSold && ticketsSold > 0
        ? Math.round((pours / ticketsSold) * 1000) / 10 // one decimal
        : null;

    nights.push({
      date: e.date,
      nightTheme: e.nightTheme,
      themeLabel: NIGHT_THEME_LABEL[e.nightTheme],
      bottlesConsumed: bottles,
      estimatedPours: pours,
      ticketsSold,
      attachRatePct,
      notes: e.notes,
    });
  }

  // Nights sorted chronologically in the email (oldest → newest reads naturally).
  nights.sort((a, b) => a.date.localeCompare(b.date));

  const totalBottles = round1(nights.reduce((s, n) => s + n.bottlesConsumed, 0));
  const totalPours = nights.reduce((s, n) => s + n.estimatedPours, 0);
  const totalTickets = anyTicketMissing
    ? null
    : nights.reduce((s, n) => s + (n.ticketsSold ?? 0), 0);
  const aggregateAttachRate =
    totalTickets && totalTickets > 0
      ? Math.round((totalPours / totalTickets) * 1000) / 10
      : null;

  return {
    brand,
    kind,
    rangeStart,
    rangeEnd,
    nights,
    totals: {
      activations: nights.length,
      bottles: totalBottles,
      pours: totalPours,
      tickets: totalTickets,
      attachRatePct: aggregateAttachRate,
    },
  };
}

function brandMatches(e: PourLogEntry, brand: string, kind: SponsorKind): boolean {
  const field = kind === 'tequila' ? e.featuredTequila : e.champagne;
  return field.trim().toLowerCase() === brand.trim().toLowerCase();
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Display helpers ───────────────────────────────────────────────────────

export function formatRangeLabel(start: string, end: string): string {
  // "Apr 13 – 19, 2026" or "Apr 30 – May 6, 2026"
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const mShort = (d: Date) => d.toLocaleString('en-US', { month: 'short' });
  const sameMonth = s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear();
  if (sameMonth) {
    return `${mShort(s)} ${s.getUTCDate()} – ${e.getUTCDate()}, ${e.getUTCFullYear()}`;
  }
  return `${mShort(s)} ${s.getUTCDate()} – ${mShort(e)} ${e.getUTCDate()}, ${e.getUTCFullYear()}`;
}

export function formatNightDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
