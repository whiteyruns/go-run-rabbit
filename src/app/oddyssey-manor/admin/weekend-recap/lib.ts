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
import { promises as fs } from 'node:fs';
import path from 'node:path';

// ─── Types ─────────────────────────────────────────────────────────────────

export type Venue = 'manor' | 'noir';
// Manor runs Thu–Sun; Noir runs Fri–Sat. The union covers both — the
// weekend recap structure narrows which slots exist per venue.
export type Weeknight = 'thu' | 'fri' | 'sat' | 'sun';

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
  // Set by enrichWeekend() when the Ticketure session Summary Report
  // scraper has data for this date. The scraped number overrides whatever
  // was parsed from the xlsx — same field, fresher source.
  netTicketRevSource?: 'live' | 'xlsx';
  xlsxNetTicketRev?: number | null;    // preserved original for reference
}

/**
 * What the weekend-recap page renders at the top of the view.
 * Manor runs Thu–Sun (four slots); Noir runs Fri–Sat. Slots are
 * nullable because the xlsx may only cover some nights (and Thu/Sun
 * for Manor are Ticketure-only, filled by enrichWeekend).
 */
export interface ManorWeekend {
  thu: VenueNight | null;
  fri: VenueNight | null;
  sat: VenueNight | null;
  sun: VenueNight | null;
}
export interface NoirWeekend {
  fri: VenueNight | null;
  sat: VenueNight | null;
}
export interface WeekendRecap {
  weekendOf: string;                   // Friday ISO date (anchor of the weekend)
  manor: ManorWeekend;
  noir: NoirWeekend;
  lastUploadedAt: string | null;       // ISO8601, updated on any weekend-file write
}

/** Weeknights each venue operates — drives display + enrichment. */
export const VENUE_NIGHTS: Record<Venue, Weeknight[]> = {
  manor: ['thu', 'fri', 'sat', 'sun'],
  noir: ['fri', 'sat'],
};

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
 * Derive the weekend anchor (Friday ISO) for any show-night date.
 * Manor runs Thu–Sun, so the anchor-for mapping is:
 *   Thu → next day Fri
 *   Fri → same day
 *   Sat → previous day
 *   Sun → two days back
 * Any other DOW falls back to "most recent Friday on/before".
 */
export function weekendAnchorFor(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  if (dow === 5) return dateISO;             // Friday
  const shift = dow === 4 ? 1 : dow === 6 ? -1 : dow === 0 ? -2 : -((dow + 7 - 5) % 7);
  const fri = new Date(dt);
  fri.setUTCDate(dt.getUTCDate() + shift);
  return isoDate(fri);
}

/** Map a weeknight identifier to its date, given the Friday anchor. */
export function dateForNight(friAnchor: string, night: Weeknight): string {
  const [y, m, d] = friAnchor.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const offset = night === 'thu' ? -1 : night === 'fri' ? 0 : night === 'sat' ? 1 : 2;
  dt.setUTCDate(dt.getUTCDate() + offset);
  return isoDate(dt);
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
  if (night.venue === 'manor') {
    const slot = existing.manor;
    slot[night.weeknight] = night;
  } else {
    // Noir only operates Fri/Sat — any Thu/Sun night hitting this branch
    // is a data error upstream; drop it rather than crash.
    if (night.weeknight === 'fri' || night.weeknight === 'sat') {
      existing.noir[night.weeknight] = night;
    }
  }
  await writeWeekendJSON({ ...existing, weekendOf: anchor });
  return anchor;
}

/**
 * Merge a Budget-workbook rollup into the existing YTD file for a venue.
 *
 * The Budget workbook is the authoritative 2026 budget source for Manor
 * (Manor P&L doesn't carry a budget column), but for Noir the NOIR
 * Budgets & Reports file already populates budget columns from its YTD
 * REPORT sheet — and the numbers come from a different lens (venue
 * operating target vs rolled-up monthly forecast). So we only overlay
 * budget cells that are currently null; actuals are never touched.
 *
 * This keeps the two uploads independent: whichever workbook touched a
 * given (month, field) first wins, unless that field is still null.
 */
export async function mergeYTDBudget(
  venue: Venue,
  year: number,
  budgetRows: YTDMonthRow[],
): Promise<{ updatedFields: number }> {
  const existing = await readYTDRollup(venue, year);
  const byMonth = new Map(existing.rows.map((r) => [r.month, r]));
  let updatedFields = 0;
  for (const incoming of budgetRows) {
    const current = byMonth.get(incoming.month);
    if (!current) continue;
    if (current.budgetRev == null && incoming.budgetRev != null) {
      current.budgetRev = incoming.budgetRev;
      updatedFields += 1;
    }
    if (current.budgetNet == null && incoming.budgetNet != null) {
      current.budgetNet = incoming.budgetNet;
      updatedFields += 1;
    }
  }
  await writeYTDRollup({
    venue,
    year,
    rows: Array.from(byMonth.values()),
    lastUploadedAt: existing.lastUploadedAt,
  });
  return { updatedFields };
}

// ─── Live data overlay (Ticketure session Summary Report) ─────────────────

const SESSION_SUMMARY_DIR: Record<Venue, string> = {
  manor: path.resolve(process.cwd(), 'data', 'oddyssey-food', 'summaries'),
  noir: path.resolve(process.cwd(), 'data', 'oddyssey-noir', 'summaries'),
};

/**
 * Read the aggregated Net-to-Bank for a night from the session summary
 * JSON that our Playwright scraper archives. Returns null when the file
 * doesn't exist (no pull yet) or no session reports a net_to_bank.
 */
export async function loadLiveNetTicketRev(
  venue: Venue,
  dateISO: string,
): Promise<number | null> {
  try {
    const file = path.join(SESSION_SUMMARY_DIR[venue], `${dateISO}.json`);
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as {
      sessions?: { data?: { net_to_bank?: number | null } }[];
    };
    const sessions = parsed.sessions ?? [];
    let sum = 0;
    let any = false;
    for (const s of sessions) {
      const n = s.data?.net_to_bank;
      if (typeof n === 'number' && Number.isFinite(n)) {
        sum += n;
        any = true;
      }
    }
    return any ? sum : null;
  } catch {
    return null;
  }
}

/**
 * Read live ticket issued + redeemed counts from the session summary.
 * Manor's Ticketure "reserved" count includes food-inclusion line items,
 * so for Manor this is an over-count vs the xlsx `T-Issued` column.
 * Noir has no food inclusions; its numbers match cleanly.
 */
async function loadLiveTicketCounts(
  venue: Venue,
  dateISO: string,
): Promise<{ issued: number | null; redeemed: number | null }> {
  try {
    const file = path.join(SESSION_SUMMARY_DIR[venue], `${dateISO}.json`);
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as {
      sessions?: { data?: { reserved?: number | null; redeemed?: number | null } }[];
    };
    let issued = 0;
    let redeemed = 0;
    let any = false;
    for (const s of parsed.sessions ?? []) {
      const r = s.data?.reserved;
      const d = s.data?.redeemed;
      if (typeof r === 'number') { issued += r; any = true; }
      if (typeof d === 'number') { redeemed += d; any = true; }
    }
    return any ? { issued, redeemed } : { issued: null, redeemed: null };
  } catch {
    return { issued: null, redeemed: null };
  }
}

/**
 * Build an entirely Ticketure-sourced VenueNight for a date that has no
 * xlsx row (Manor Thu + Sun nights — xlsx only carries Fri+Sat).
 * Cost lines stay empty; the UI renders "—" until the GM fills them in.
 */
async function synthesizeNightFromLive(
  venue: Venue,
  weeknight: Weeknight,
  dateISO: string,
): Promise<VenueNight | null> {
  const [netRev, counts] = await Promise.all([
    loadLiveNetTicketRev(venue, dateISO),
    loadLiveTicketCounts(venue, dateISO),
  ]);
  // Nothing to show for this date yet — no scrape on disk.
  if (netRev == null && counts.issued == null) return null;
  return {
    date: dateISO,
    venue,
    weeknight,
    ticketsIssued: counts.issued,
    ticketsRedeemed: counts.redeemed,
    netTicketRev: netRev,
    barNet: null,
    costs: {},
    netTicketRevSource: 'live',
  };
}

/**
 * Overlay Ticketure-scraped data onto a weekend recap. For every xlsx
 * night, we replace netTicketRev with the live Ticketure total (fresher).
 * For nights that have no xlsx row at all (Manor Thu + Sun), we synthesize
 * a Ticketure-only VenueNight so the scrum view still shows them.
 *
 * Cost lines + bar NET stay xlsx-only — Ticketure doesn't expose those.
 */
export async function enrichWeekend(recap: WeekendRecap): Promise<WeekendRecap> {
  const enrichNight = async (n: VenueNight | null): Promise<VenueNight | null> => {
    if (!n) return null;
    const live = await loadLiveNetTicketRev(n.venue, n.date);
    if (live == null) {
      return { ...n, netTicketRevSource: 'xlsx' };
    }
    return {
      ...n,
      xlsxNetTicketRev: n.netTicketRev,
      netTicketRev: live,
      netTicketRevSource: 'live',
    };
  };

  const anchor = recap.weekendOf;
  // Manor: all four nights. Fri/Sat overlay xlsx → live; Thu/Sun are
  // fully synthesized from Ticketure because xlsx doesn't carry those rows.
  const [manorThu, manorFri, manorSat, manorSun, noirFri, noirSat] = await Promise.all([
    recap.manor.thu
      ? enrichNight(recap.manor.thu)
      : synthesizeNightFromLive('manor', 'thu', dateForNight(anchor, 'thu')),
    enrichNight(recap.manor.fri),
    enrichNight(recap.manor.sat),
    recap.manor.sun
      ? enrichNight(recap.manor.sun)
      : synthesizeNightFromLive('manor', 'sun', dateForNight(anchor, 'sun')),
    enrichNight(recap.noir.fri),
    enrichNight(recap.noir.sat),
  ]);

  return {
    ...recap,
    manor: { thu: manorThu, fri: manorFri, sat: manorSat, sun: manorSun },
    noir: { fri: noirFri, sat: noirSat },
  };
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
  // Two decimals everywhere else — matches the rest of the admin and
  // the Ticketure reconciliation spec (don't hide cents).
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

// ─── Internals ─────────────────────────────────────────────────────────────

function emptyWeekend(fridayISO: string): WeekendRecap {
  return {
    weekendOf: fridayISO,
    manor: { thu: null, fri: null, sat: null, sun: null },
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
