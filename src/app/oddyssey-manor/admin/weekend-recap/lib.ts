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
  // Ticket-count fields are only overlaid from live data when the xlsx
  // row has them blank — the xlsx + Ticketure agree on these values
  // when both are present, so we don't bother replacing filled cells.
  ticketCountSource?: 'live' | 'xlsx';
  // Square POS scrape for bar net — when present, overrides xlsx SQUARE
  // NET column (fresher + reconciled to Square's reporting-day totals).
  barNetSource?: 'live' | 'xlsx';
  xlsxBarNet?: number | null;
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
  // Freeform qualitative notes for the Monday scrum — photo/video shoots,
  // media visits, VIP bookings, celebrity drop-ins, anything the numbers
  // won't tell us. Edited inline on the scrum page, persisted here.
  highlights?: string | null;
  highlightsUpdatedAt?: string | null; // ISO8601
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
/**
 * Patch only the `highlights` field on a weekend JSON, preserving all
 * venue rows + budget data. Creates the file if it doesn't exist yet.
 */
export async function saveWeekendHighlights(
  fridayISO: string,
  highlights: string,
): Promise<void> {
  const existing = await readWeekendJSON(fridayISO);
  await writeWeekendJSON({
    ...existing,
    weekendOf: fridayISO,
    highlights: highlights.trim() || null,
    highlightsUpdatedAt: new Date().toISOString(),
  });
}

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
 * `Oddyssey_Monthly` (P&L Assumptions) is the authoritative 2026 budget
 * source for both venues — Finance's master forecast. This helper
 * OVERWRITES budget columns (even if they'd been populated by an earlier
 * venue-file upload) so we have one consistent definition of "budget"
 * across all months and venues. Actuals (actualRev/actualNet) are never
 * touched.
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
    if (current.budgetRev !== incoming.budgetRev) {
      current.budgetRev = incoming.budgetRev;
      updatedFields += 1;
    }
    if (current.budgetNet !== incoming.budgetNet) {
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
 * Read Square Net Sales for a given venue + reporting day from the
 * oddyssey-square scraper's JSON. Returns null when the file doesn't
 * exist yet or the scrape didn't land a number (still-Null-at-scrape
 * stays null).
 */
const SQUARE_DIR = path.resolve(process.cwd(), 'data', 'oddyssey-square');

export async function loadLiveBarNet(
  venue: Venue,
  dateISO: string,
): Promise<number | null> {
  try {
    const file = path.join(SQUARE_DIR, venue, `${dateISO}.json`);
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as { net_sales?: number | null };
    return typeof parsed.net_sales === 'number' && Number.isFinite(parsed.net_sales)
      ? parsed.net_sales
      : null;
  } catch {
    return null;
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
  const [netRev, counts, barNet] = await Promise.all([
    loadLiveNetTicketRev(venue, dateISO),
    loadLiveTicketCounts(venue, dateISO),
    loadLiveBarNet(venue, dateISO),
  ]);
  // Nothing to show for this date yet — no scrape on disk.
  if (netRev == null && counts.issued == null && barNet == null) return null;
  return {
    date: dateISO,
    venue,
    weeknight,
    ticketsIssued: counts.issued,
    ticketsRedeemed: counts.redeemed,
    netTicketRev: netRev,
    barNet,
    costs: {},
    netTicketRevSource: 'live',
    ticketCountSource: 'live',
    barNetSource: barNet != null ? 'live' : 'xlsx',
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
    const [liveRev, liveCounts, liveBar] = await Promise.all([
      loadLiveNetTicketRev(n.venue, n.date),
      loadLiveTicketCounts(n.venue, n.date),
      loadLiveBarNet(n.venue, n.date),
    ]);
    const ticketsIssued = n.ticketsIssued ?? liveCounts.issued;
    const ticketsRedeemed = n.ticketsRedeemed ?? liveCounts.redeemed;
    const ticketCountSource: 'live' | 'xlsx' =
      n.ticketsIssued == null && liveCounts.issued != null ? 'live' : 'xlsx';

    // Bar NET: Square scrape always wins when present — reporting-day
    // math is cleaner than the GM's manual entry, and Square numbers
    // move as the night rolls while xlsx is captured once a week.
    // Preserve the xlsx value so the UI can surface any delta.
    const barNet = liveBar != null ? liveBar : n.barNet;
    const barNetSource: 'live' | 'xlsx' = liveBar != null ? 'live' : 'xlsx';

    const base = {
      ...n,
      ticketsIssued,
      ticketsRedeemed,
      ticketCountSource,
      barNet,
      barNetSource,
      xlsxBarNet: n.barNet,
    };
    if (liveRev == null) {
      return { ...base, netTicketRevSource: 'xlsx' };
    }
    return {
      ...base,
      xlsxNetTicketRev: n.netTicketRev,
      netTicketRev: liveRev,
      netTicketRevSource: 'live',
    };
  };

  const anchor = recap.weekendOf;
  // For every venue-night slot: if the xlsx carried a row, overlay the
  // live Ticketure net-ticket-rev; if it didn't, synthesize entirely
  // from Ticketure (reserved/redeemed/net_to_bank). Cost lines + bar
  // NET only come from xlsx, so synthesized nights leave those blank.
  // This is what makes historical weekends render even when the GM
  // never uploaded an xlsx for them.
  const slot = async (
    existing: VenueNight | null,
    venue: Venue,
    night: Weeknight,
  ) =>
    existing
      ? enrichNight(existing)
      : synthesizeNightFromLive(venue, night, dateForNight(anchor, night));

  const [manorThu, manorFri, manorSat, manorSun, noirFri, noirSat] = await Promise.all([
    slot(recap.manor.thu, 'manor', 'thu'),
    slot(recap.manor.fri, 'manor', 'fri'),
    slot(recap.manor.sat, 'manor', 'sat'),
    slot(recap.manor.sun, 'manor', 'sun'),
    slot(recap.noir.fri, 'noir', 'fri'),
    slot(recap.noir.sat, 'noir', 'sat'),
  ]);

  return {
    ...recap,
    manor: { thu: manorThu, fri: manorFri, sat: manorSat, sun: manorSun },
    noir: { fri: noirFri, sat: noirSat },
  };
}

// ─── Display helpers ───────────────────────────────────────────────────────

export function formatWeekendLabel(fridayISO: string): string {
  // "Thu–Sun, Apr 16–19, 2026" — spans the widest venue schedule (Manor
  // runs Thu–Sun; Noir's Fri–Sat sits inside it).
  const [y, m, d] = fridayISO.split('-').map(Number);
  const fri = new Date(Date.UTC(y, m - 1, d));
  const thu = new Date(fri);
  thu.setUTCDate(fri.getUTCDate() - 1);
  const sun = new Date(fri);
  sun.setUTCDate(fri.getUTCDate() + 2);
  const mShort = (dt: Date) =>
    dt.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' });
  const sameMonth = thu.getUTCMonth() === sun.getUTCMonth();
  if (sameMonth) {
    return `Thu–Sun, ${mShort(thu)} ${thu.getUTCDate()}–${sun.getUTCDate()}, ${sun.getUTCFullYear()}`;
  }
  return `Thu–Sun, ${mShort(thu)} ${thu.getUTCDate()} – ${mShort(sun)} ${sun.getUTCDate()}, ${sun.getUTCFullYear()}`;
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

// ─── Pour Log (Golden Hour open bar) ───────────────────────────────────────

// Slim local type — mirror of pour-log/lib.ts PourLogEntry. Redefining
// here instead of importing to keep weekend-recap independent of the
// pour-log module's file layout.
export interface PourLogEntryShape {
  date: string;
  nightTheme: 'LG' | 'AIM';
  featuredTequila: string;
  champagne: string;
  tequila: { opened: number; leftAtClose: number; consumed: number };
  champagneBottles: { opened: number; leftAtClose: number; consumed: number };
  notes?: string;
  filedBy?: string;
}

export interface PourLogWeekend {
  fri: PourLogEntryShape | null;
  sat: PourLogEntryShape | null;
}

const POUR_LOG_DIR = path.resolve(process.cwd(), 'data', 'oddyssey', 'pour-log');

export async function loadPourLogForWeekend(fridayISO: string): Promise<PourLogWeekend> {
  const read = async (date: string): Promise<PourLogEntryShape | null> => {
    try {
      const raw = await fs.readFile(path.join(POUR_LOG_DIR, `${date}.json`), 'utf-8');
      return JSON.parse(raw) as PourLogEntryShape;
    } catch {
      return null;
    }
  };
  const [fri, sat] = await Promise.all([
    read(fridayISO),
    read(dateForNight(fridayISO, 'sat')),
  ]);
  return { fri, sat };
}

// Pour math helpers (duplicated from pour-log/lib.ts for module isolation)
export function tequilaPoursFromBottles(bottles: number): number {
  // 750ml bottle / 1.5oz (~44.4ml) serve = ~16.9 pours
  return Math.round(bottles * 16.9);
}
export function champagnePoursFromBottles(bottles: number): number {
  // 750ml bottle / 2oz (~59ml) serve = ~12.7 flutes
  return Math.round(bottles * 12.7);
}

// ─── Week-over-week series (for sparklines) ────────────────────────────────

export interface WoWPoint {
  fridayAnchor: string;     // "2026-04-10"
  label: string;            // "Apr 10"
  netRev: number | null;    // sum across venue's show nights (null if no data)
  redeemed: number | null;  // sum across venue's show nights
}

/**
 * Build a series of the last `count` weekends (ending at `currentFri`)
 * aggregating net ticket rev + redeemed per venue. Uses the same
 * enrichWeekend pipeline as the scrum view so live overlays apply.
 */
export async function buildWoWSeries(
  venue: Venue,
  currentFri: string,
  count = 8,
): Promise<WoWPoint[]> {
  const anchors: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const [y, m, d] = currentFri.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - i * 7);
    const y2 = dt.getUTCFullYear();
    const m2 = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d2 = String(dt.getUTCDate()).padStart(2, '0');
    anchors.push(`${y2}-${m2}-${d2}`);
  }
  const points = await Promise.all(
    anchors.map(async (fri): Promise<WoWPoint> => {
      const raw = await readWeekendJSON(fri);
      const enriched = await enrichWeekend(raw);
      const slots: (VenueNight | null)[] =
        venue === 'manor'
          ? [enriched.manor.thu, enriched.manor.fri, enriched.manor.sat, enriched.manor.sun]
          : [enriched.noir.fri, enriched.noir.sat];
      let netRev = 0;
      let redeemed = 0;
      let anyRev = false;
      let anyRed = false;
      for (const n of slots) {
        if (!n) continue;
        if (n.netTicketRev != null) { netRev += n.netTicketRev; anyRev = true; }
        if (n.ticketsRedeemed != null) { redeemed += n.ticketsRedeemed; anyRed = true; }
      }
      const [yy, mm, dd] = fri.split('-').map(Number);
      const lbl = new Date(Date.UTC(yy, mm - 1, dd)).toLocaleString('en-US', {
        timeZone: 'UTC', month: 'short', day: 'numeric',
      });
      return {
        fridayAnchor: fri,
        label: lbl,
        netRev: anyRev ? netRev : null,
        redeemed: anyRed ? redeemed : null,
      };
    }),
  );
  return points;
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
