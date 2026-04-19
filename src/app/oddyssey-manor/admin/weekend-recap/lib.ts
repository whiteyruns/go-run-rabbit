/**
 * Weekend Recap — data layer.
 *
 * Responsibilities:
 *   1. Define the shape of a "weekend" (Fri + Sat per venue) and a YTD month row.
 *   2. Locate the most recent Fri+Sat relative to a given "now" (Mon scrum use).
 *   3. Read per-weekend JSON written by the xlsx upload server action.
 *   4. Read per-venue YTD rollup JSON (Actual vs Budget) written by the same
 *      upload action from the monthly P&L tab (Manor) and YTD Report (Noir).
 *
 * Why the shape is split (weekend JSON vs YTD JSON):
 *   - Weekend JSON is updated every Monday when the GM uploads the xlsx.
 *     Small, high-churn.
 *   - YTD rollup is effectively append-only (new month cells, stable history).
 *     Reading them separately keeps snapshot rendering cheap and lets the
 *     Monday email skip the YTD read entirely.
 *
 * Server-only. Do NOT import from a client component.
 */
import { promises as fs } from 'fs';
import path from 'path';

// ─── Types ─────────────────────────────────────────────────────────────────

export type Venue = 'manor' | 'noir';
export type Weeknight = 'fri' | 'sat';

/**
 * Per-night data shared between venues. Venue-specific cost lines live in
 * `costs` so we can read/write them generically without a union-per-venue.
 *
 * Manor `costs` keys:   cast, rehearsals, rigger
 * Noir  `costs` keys:   marketing, staciaTalent, dj, promo, hostBox,
 *                        fbLabor, publicAreaServices, security, production,
 *                        assistant, houseTab, incentives
 *
 * `null` = we don't have the number yet (most common: Noir Sat sheet absent
 * when the GM only uploads the Manor workbook). UI must render "—" for null.
 */
export interface VenueNight {
  date: string;                        // YYYY-MM-DD
  venue: Venue;
  weeknight: Weeknight;                // convenience: 'fri' | 'sat'
  ticketsIssued: number | null;        // Manor: T-Issued.   Noir: Tickets Reserved.
  ticketsRedeemed: number | null;      // Manor: T-Redeemed. Noir: Tickets Redeemed.
  netTicketRev: number | null;         // Manor: NET.        Noir: Net Ticket Rev.
  barNet: number | null;               // Manor: SQUARE NET. Noir: Net POS Beverage.
  costs: Record<string, number | null>;// venue-specific, see comment above
  totalNet?: number | null;            // Noir only: "Total Rev with Incentive". Manor omits.
  notes?: string;
}

/**
 * What the weekend-recap page renders at the top of the view.
 * `fri` and `sat` nullable because upload might only include one of the two.
 */
export interface WeekendRecap {
  weekendOf: string;                   // Friday ISO date (anchor of the weekend)
  manor: { fri: VenueNight | null; sat: VenueNight | null };
  noir:  { fri: VenueNight | null; sat: VenueNight | null };
  lastUploadedAt: string | null;       // ISO8601, updated on any weekend-file write
}

/**
 * One row in the YTD strip — one calendar month, per venue.
 * `actual*` pulled from P&L tab (Manor) or YTD Report sheet (Noir).
 * `budget*` pulled from the 2026 Budget workbook (Oddyssey_Monthly roll-up).
 */
export interface YTDMonthRow {
  month: string;                       // YYYY-MM
  actualRev: number | null;
  actualNet: number | null;
  budgetRev: number | null;
  budgetNet: number | null;
}

export interface YTDRollup {
  venue: Venue;
  year: number;                        // 2026
  rows: YTDMonthRow[];                 // chronological Jan..Dec
  lastUploadedAt: string | null;
}

// ─── Storage paths ─────────────────────────────────────────────────────────

// Matches the Pour Log + Sponsor Recap convention: data/oddyssey/... under cwd.
const DATA_ROOT = path.resolve(process.cwd(), 'data', 'oddyssey');
const WEEKEND_DIR = path.join(DATA_ROOT, 'weekend-recap');
const YTD_DIR = path.join(WEEKEND_DIR, 'ytd');

/** Per-weekend file: one JSON blob per Friday anchor date. */
export function weekendPath(fridayISO: string): string {
  return path.join(WEEKEND_DIR, `${fridayISO}.json`);
}

/** Per-venue YTD file: one JSON blob per venue per year. */
export function ytdPath(venue: Venue, year: number): string {
  return path.join(YTD_DIR, `${venue}-${year}.json`);
}

// ─── Date helpers ──────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(s: string): boolean {
  return DATE_RE.test(s);
}

function isoDate(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Given a "now" timestamp (use the server's local clock on Monday morning),
 * return the Fri+Sat that just passed.
 *
 * Rules:
 *   - If `now` is Fri/Sat/Sun, rewind to the CURRENT Friday (show folks just
 *     ran, not the one a week ago).
 *   - If `now` is Mon/Tue/Wed/Thu, anchor on the most recent past Friday.
 *
 * Expressed as: go back until day-of-week == Friday, using Sun=0..Sat=6.
 */
export function mostRecentWeekend(now: Date = new Date()): {
  friday: string;
  saturday: string;
} {
  const dt = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const dow = dt.getUTCDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat

  // Days to subtract to reach Friday (inclusive today if today IS Friday).
  // Fri=0, Sat=1, Sun=2, Mon=3, Tue=4, Wed=5, Thu=6
  const daysBackToFri = (dow + 7 - 5) % 7;
  const friday = new Date(dt);
  friday.setUTCDate(dt.getUTCDate() - daysBackToFri);
  const saturday = new Date(friday);
  saturday.setUTCDate(friday.getUTCDate() + 1);

  return { friday: isoDate(friday), saturday: isoDate(saturday) };
}

/**
 * Derive the weekend anchor (Friday ISO) for any Fri or Sat date.
 * Used by the upload action when the GM uploads a workbook whose sheets
 * are keyed by individual Sat dates and we need the pair key.
 */
export function weekendAnchorFor(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  if (dow === 5) return dateISO;            // Friday
  if (dow === 6) {                          // Saturday → previous Friday
    const fri = new Date(dt);
    fri.setUTCDate(dt.getUTCDate() - 1);
    return isoDate(fri);
  }
  // For any other DOW, fall back to "most recent Friday on/before this date".
  const back = (dow + 7 - 5) % 7;
  const fri = new Date(dt);
  fri.setUTCDate(dt.getUTCDate() - back);
  return isoDate(fri);
}

// ─── Read helpers ──────────────────────────────────────────────────────────

/** Read a weekend recap blob. Returns an empty skeleton if the file is absent. */
export async function readWeekendJSON(fridayISO: string): Promise<WeekendRecap> {
  try {
    const raw = await fs.readFile(weekendPath(fridayISO), 'utf8');
    const parsed = JSON.parse(raw) as WeekendRecap;
    return parsed;
  } catch (err: unknown) {
    if (isENOENT(err)) {
      return emptyWeekend(fridayISO);
    }
    throw err;
  }
}

/** Read the per-venue YTD rollup. Returns empty 12-month skeleton if absent. */
export async function readYTDRollup(venue: Venue, year: number): Promise<YTDRollup> {
  try {
    const raw = await fs.readFile(ytdPath(venue, year), 'utf8');
    return JSON.parse(raw) as YTDRollup;
  } catch (err: unknown) {
    if (isENOENT(err)) {
      return {
        venue,
        year,
        rows: Array.from({ length: 12 }, (_, i) => ({
          month: `${year}-${String(i + 1).padStart(2, '0')}`,
          actualRev: null,
          actualNet: null,
          budgetRev: null,
          budgetNet: null,
        })),
        lastUploadedAt: null,
      };
    }
    throw err;
  }
}

/** List the most recent N weekend files on disk, newest first. */
export async function listRecentWeekends(limit = 12): Promise<string[]> {
  try {
    const files = await fs.readdir(WEEKEND_DIR);
    return files
      .filter((f) => f.endsWith('.json') && DATE_RE.test(f.slice(0, 10)))
      .map((f) => f.slice(0, 10))
      .sort()
      .reverse()
      .slice(0, limit);
  } catch (err: unknown) {
    if (isENOENT(err)) return [];
    throw err;
  }
}

/**
 * Has anyone uploaded anything for this weekend yet?
 * Drives the Monday reminder job (skip if already uploaded).
 */
export async function weekendHasUpload(fridayISO: string): Promise<boolean> {
  try {
    await fs.access(weekendPath(fridayISO));
    return true;
  } catch {
    return false;
  }
}

// ─── Write helpers (used by the upload server action) ──────────────────────

export async function writeWeekendJSON(recap: WeekendRecap): Promise<void> {
  await fs.mkdir(WEEKEND_DIR, { recursive: true });
  const payload = { ...recap, lastUploadedAt: new Date().toISOString() };
  await fs.writeFile(
    weekendPath(recap.weekendOf),
    JSON.stringify(payload, null, 2),
    'utf8',
  );
}

export async function writeYTDRollup(rollup: YTDRollup): Promise<void> {
  await fs.mkdir(YTD_DIR, { recursive: true });
  const payload = { ...rollup, lastUploadedAt: new Date().toISOString() };
  await fs.writeFile(
    ytdPath(rollup.venue, rollup.year),
    JSON.stringify(payload, null, 2),
    'utf8',
  );
}

/**
 * Merge a partial VenueNight into an existing weekend file, preserving the
 * other venue + the other night. The xlsx parsers call this once per sheet
 * they extract, so one upload of MANOR P&L updates Manor without clobbering
 * any prior Noir upload for the same weekend.
 */
export async function upsertVenueNight(night: VenueNight): Promise<string> {
  const anchor = weekendAnchorFor(night.date);
  const existing = await readWeekendJSON(anchor);
  const slot = existing[night.venue];
  if (night.weeknight === 'fri') slot.fri = night;
  else slot.sat = night;
  await writeWeekendJSON({ ...existing, weekendOf: anchor });
  return anchor;
}

// ─── Display helpers ───────────────────────────────────────────────────────

export function formatWeekendLabel(fridayISO: string): string {
  // "Fri–Sat, Apr 17–18, 2026"
  const [y, m, d] = fridayISO.split('-').map(Number);
  const fri = new Date(Date.UTC(y, m - 1, d));
  const sat = new Date(fri);
  sat.setUTCDate(fri.getUTCDate() + 1);
  const mShort = (dt: Date) =>
    dt.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' });
  const sameMonth = fri.getUTCMonth() === sat.getUTCMonth();
  if (sameMonth) {
    return `Fri–Sat, ${mShort(fri)} ${fri.getUTCDate()}–${sat.getUTCDate()}, ${fri.getUTCFullYear()}`;
  }
  return `Fri–Sat, ${mShort(fri)} ${fri.getUTCDate()} – ${mShort(sat)} ${sat.getUTCDate()}, ${fri.getUTCFullYear()}`;
}

export function formatMoney(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

// ─── Internals ─────────────────────────────────────────────────────────────

function emptyWeekend(fridayISO: string): WeekendRecap {
  return {
    weekendOf: fridayISO,
    manor: { fri: null, sat: null },
    noir:  { fri: null, sat: null },
    lastUploadedAt: null,
  };
}

function isENOENT(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'ENOENT'
  );
}
