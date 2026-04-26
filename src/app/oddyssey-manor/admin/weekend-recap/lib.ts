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
  // Top 5 items from Square's Item Sales report for this night. Name
  // pattern like "…Yankee Repo" / "…Rep" flags a brand-rep activation.
  squareTopItems?: { name: string; gross: number; units_sold?: number }[];
  // Open-bar window (10 PM-12 AM) slice — Square's "WM Open Hours"
  // pre-set timeframe. Set when the second scrape pass succeeded.
  squareOpenBarWindow?: {
    net_sales: number | null;
    gross_sales: number | null;
    items: { name: string; gross: number; units_sold: number }[];
  } | null;
  // Per-channel × package-type ticket breakdown derived from the
  // Ticketure attendees CSV. Surfaces direct vs 3rd party vs comp by
  // package (GA / Explorer / Dinner / Ultimate) for the night.
  channelBreakdown?: ChannelBreakdown | null;
  // Per-cost-key source. `xlsx` = parsed from the GM's weekly upload.
  // `projected` = carried forward from the most recent filed weekend
  // because the current weekend's xlsx hasn't been uploaded yet.
  costSources?: Record<string, 'xlsx' | 'projected'>;
}

// ─── Channel × package breakdown ─────────────────────────────────────────

// Stable package keys we report on. Match TicketType.package_type IDs.
export type PackageKey =
  | 'general_admission'
  | 'explorer'
  | 'dinner_guest'
  | 'ultimate'
  | 'unknown';

export const CHANNEL_PACKAGE_KEYS: PackageKey[] = [
  'general_admission',
  'explorer',
  'dinner_guest',
  'ultimate',
];

export const PACKAGE_LABEL: Record<PackageKey, string> = {
  general_admission: 'GA',
  explorer: 'Explorer',
  dinner_guest: 'Dinner',
  ultimate: 'Ultimate',
  unknown: 'Other',
};

export type ChannelKey = 'direct' | 'third_party' | 'comp';

export interface ChannelBreakdownRow {
  channel: ChannelKey;
  channel_label: string;
  packages: Record<PackageKey, number>;
  total: number;
}

export interface ChannelBreakdown {
  rows: ChannelBreakdownRow[];
  total_tickets: number;
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
 * Read items from the Square scrape file. Newer scrapes carry a full
 * `items` array (with units_sold + category); older scrapes only have
 * `top_items` (name + gross). Prefer the full list, fall back to top.
 */
export async function loadLiveTopItems(
  venue: Venue,
  dateISO: string,
): Promise<{ name: string; gross: number; units_sold?: number }[] | null> {
  try {
    const file = path.join(SQUARE_DIR, venue, `${dateISO}.json`);
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as {
      items?: { name: string; gross: number; units_sold: number; category?: string }[];
      top_items?: { name: string; gross: number }[];
    };
    if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items;
    if (Array.isArray(parsed.top_items) && parsed.top_items.length > 0) return parsed.top_items;
    return null;
  } catch {
    return null;
  }
}

/**
 * Read the 10pm-12am open-bar window slice from the Square scrape.
 * Returns null when the second-pass scrape didn't run (older files
 * or when "WM Open Hours" timeframe wasn't found in the picker).
 */
export async function loadLiveOpenBarWindow(
  venue: Venue,
  dateISO: string,
): Promise<{
  net_sales: number | null;
  gross_sales: number | null;
  items: { name: string; gross: number; units_sold: number }[];
} | null> {
  try {
    const file = path.join(SQUARE_DIR, venue, `${dateISO}.json`);
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as {
      open_bar_window?: {
        summary?: { net_sales?: number | null; gross_sales?: number | null };
        items?: { name: string; gross: number; units_sold: number }[];
      } | null;
    };
    if (!parsed.open_bar_window) return null;
    return {
      net_sales: parsed.open_bar_window.summary?.net_sales ?? null,
      gross_sales: parsed.open_bar_window.summary?.gross_sales ?? null,
      items: parsed.open_bar_window.items ?? [],
    };
  } catch {
    return null;
  }
}

// Resolve the package_type a CSV row represents. For direct sales the
// ticket_group_name is authoritative ("The Explorer", "The Dinner Guest",
// etc.). For 3rd-party rows the group name is a channel label, so the
// package shows up as a suffix on ticket_type_name (Adult (21+) [Package
// A] = Ultimate, Adult (21+) [Package B/C] = Dinner, Adult (21+) +
// food name = Explorer, plain "Adult (21+)" = GA-equivalent).
function classifyPackage(groupName: string, typeName: string): PackageKey {
  const g = (groupName || '').toLowerCase();
  if (g.startsWith('the ultimate') || g.includes('ultimate party')) return 'ultimate';
  if (g.startsWith('the dinner') || g.includes('dinner guest')) return 'dinner_guest';
  if (g.startsWith('the explorer') || g === 'explorer') return 'explorer';
  if (g === 'general admission' || g === 'guest list') return 'general_admission';
  // 3rd party / unknown groups — infer from ticket_type_name suffix.
  const t = (typeName || '').toLowerCase();
  if (/\[package a\]|\bultimate\b/.test(t)) return 'ultimate';
  if (/\[package b\]|\[package c\]|dinner/.test(t)) return 'dinner_guest';
  if (/charcuterie|short rib|shrimp|ceviche|ube|cheesecake/.test(t)) return 'explorer';
  if (/^adult/.test(t) || /general/.test(t)) return 'general_admission';
  return 'unknown';
}

function classifyChannel(groupName: string): ChannelKey | null {
  const g = (groupName || '').toLowerCase();
  if (g === 'inclusions') return null; // food spec rows, not tickets
  if (/third\s*-?\s*party|commission|goldstar|groupon|ticketmaster/.test(g)) return 'third_party';
  if (/guest\s*list|comp\b/.test(g)) return 'comp';
  return 'direct';
}

const FOOD_PULLS_DIR = path.resolve(process.cwd(), 'data', 'oddyssey-food', 'pulls');

const VENUE_EVENT_NAME: Record<Venue, RegExp> = {
  manor: /oddyssey\s+manor/i,
  noir: /oddyssey\s+noir/i,
};

/**
 * Read the most recent attendees CSV pull for (venue, dateISO) and
 * return a Channel × Package ticket count breakdown. Returns null when
 * no CSV is available for that show date.
 *
 * The cron pulls attendees-YYYY-MM-DD-<timestamp>.csv every 30 min on
 * show day. We pick the latest by mtime + verify the file's
 * `event_name` matches the requested venue.
 */
export async function loadLiveChannelBreakdown(
  venue: Venue,
  dateISO: string,
): Promise<ChannelBreakdown | null> {
  let entries: string[];
  try {
    entries = await fs.readdir(FOOD_PULLS_DIR);
  } catch {
    // No CSV directory at all — try the session JSON fallback below.
    return loadChannelBreakdownFromSessions(venue, dateISO);
  }
  const candidates = entries
    .filter((n) => n.startsWith(`attendees-${dateISO}-`) && n.endsWith('.csv'));
  if (candidates.length === 0) {
    // Manor's food-pull cron writes attendees CSVs; Noir doesn't get
    // one because the cron is Manor-only. Fall back to the session
    // Summary Report JSON which the Noir scraper already archives.
    return loadChannelBreakdownFromSessions(venue, dateISO);
  }

  // Stat each + sort newest-first so we don't need a sort by name.
  const stats = await Promise.all(
    candidates.map(async (name) => {
      const full = path.join(FOOD_PULLS_DIR, name);
      try {
        const s = await fs.stat(full);
        return { full, mtime: s.mtimeMs };
      } catch {
        return { full, mtime: 0 };
      }
    }),
  );
  stats.sort((a, b) => b.mtime - a.mtime);

  // Walk the sorted list and pick the first one whose event_name matches
  // the requested venue. Single-event CSV per pull, so first-match wins.
  let csv: string | null = null;
  for (const s of stats) {
    let text: string;
    try {
      text = await fs.readFile(s.full, 'utf8');
    } catch {
      continue;
    }
    const firstDataLine = text.split(/\r?\n/, 2)[1] ?? '';
    if (!firstDataLine) continue;
    if (VENUE_EVENT_NAME[venue].test(firstDataLine)) {
      csv = text;
      break;
    }
  }
  if (!csv) return loadChannelBreakdownFromSessions(venue, dateISO);

  // Hand-rolled split of the two columns we care about so we don't need
  // to plumb the full csv-parser through (it lives client-side bundle).
  const lines = csv.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  const headers = splitCsvLine(lines[0]);
  const groupIdx = headers.indexOf('ticket_group_name');
  const typeIdx = headers.indexOf('ticket_type_name');
  if (groupIdx < 0 || typeIdx < 0) return null;

  const buckets = new Map<ChannelKey, ChannelBreakdownRow>();
  const labels: Record<ChannelKey, string> = {
    direct: 'Direct',
    third_party: 'Third Party',
    comp: 'Comp',
  };
  function ensureRow(ch: ChannelKey, label: string): ChannelBreakdownRow {
    let row = buckets.get(ch);
    if (!row) {
      row = {
        channel: ch,
        channel_label: label,
        packages: {
          general_admission: 0,
          explorer: 0,
          dinner_guest: 0,
          ultimate: 0,
          unknown: 0,
        },
        total: 0,
      };
      buckets.set(ch, row);
    }
    return row;
  }

  let total = 0;
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.length === 0) continue;
    const groupName = cells[groupIdx] ?? '';
    const typeName = cells[typeIdx] ?? '';
    const ch = classifyChannel(groupName);
    if (!ch) continue;
    const pkg = classifyPackage(groupName, typeName);
    // Use the actual group name as the channel label for 3rd-party so
    // we can show e.g. "Third Party Sales - 20% Commission" verbatim.
    const label = ch === 'third_party' && groupName ? groupName : labels[ch];
    const row = ensureRow(ch, label);
    row.packages[pkg] = (row.packages[pkg] ?? 0) + 1;
    row.total += 1;
    total += 1;
  }

  // Stable order: Direct → Third Party → Comp.
  const order: ChannelKey[] = ['direct', 'third_party', 'comp'];
  const rows = order
    .map((k) => buckets.get(k))
    .filter((r): r is ChannelBreakdownRow => Boolean(r));
  if (rows.length === 0) return null;
  return { rows, total_tickets: total };
}

/**
 * Fallback channel breakdown derived from the session Summary Report JSON
 * (already on disk for both venues from the session scraper). Used when
 * no attendees CSV exists for the (venue, date) — primarily Noir, since
 * the food-pull cron runs only against Manor.
 *
 * Counts come from `ticket_groups[].reserved` summed across sessions.
 * The classification re-uses the same channel/package logic as the
 * CSV path, with the group name as both the channel hint and the
 * package signal (Noir's session JSON has no per-row ticket_type_name).
 */
async function loadChannelBreakdownFromSessions(
  venue: Venue,
  dateISO: string,
): Promise<ChannelBreakdown | null> {
  let parsed: {
    sessions?: {
      data?: {
        ticket_groups?: { ticket_group_name?: string; reserved?: number | null }[];
      };
    }[];
  };
  try {
    const file = path.join(SESSION_SUMMARY_DIR[venue], `${dateISO}.json`);
    parsed = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
  const buckets = new Map<ChannelKey, ChannelBreakdownRow>();
  const labels: Record<ChannelKey, string> = {
    direct: 'Direct',
    third_party: 'Third Party',
    comp: 'Comp',
  };
  function ensureRow(ch: ChannelKey, label: string): ChannelBreakdownRow {
    let row = buckets.get(ch);
    if (!row) {
      row = {
        channel: ch,
        channel_label: label,
        packages: {
          general_admission: 0,
          explorer: 0,
          dinner_guest: 0,
          ultimate: 0,
          unknown: 0,
        },
        total: 0,
      };
      buckets.set(ch, row);
    }
    return row;
  }
  let total = 0;
  for (const s of parsed.sessions ?? []) {
    for (const tg of s.data?.ticket_groups ?? []) {
      const name = tg.ticket_group_name ?? '';
      const reserved = tg.reserved ?? 0;
      if (!name || reserved <= 0) continue;
      const ch = classifyChannel(name);
      if (!ch) continue;
      // Session JSON has no ticket_type_name — pass the group name in
      // both slots so classifyPackage falls through to the group-based
      // branch (e.g., "GA" → general_admission, "The Explorer" → explorer).
      const pkg = classifyPackage(name, name);
      const label = ch === 'third_party' && name ? name : labels[ch];
      const row = ensureRow(ch, label);
      row.packages[pkg] = (row.packages[pkg] ?? 0) + reserved;
      row.total += reserved;
      total += reserved;
    }
  }
  if (total === 0) return null;
  const order: ChannelKey[] = ['direct', 'third_party', 'comp'];
  const rows = order
    .map((k) => buckets.get(k))
    .filter((r): r is ChannelBreakdownRow => Boolean(r));
  return { rows, total_tickets: total };
}

// Minimal RFC 4180 line splitter — only used by the loader, kept private.
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') inQuotes = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Detect a brand-rep activation in the Top Items. Returns the matching
 * item row when ops has tagged a night with a rep-specific SKU (e.g.,
 * "El Bandido Yankee Repo"). Heuristic: name contains "rep" / "yankee"
 * / "ambassador" / "on-premise".
 */
export function detectRepItem(
  items: { name: string; gross: number }[] | null | undefined,
): { name: string; gross: number } | null {
  if (!items) return null;
  const re = /\b(rep|repo|yankee|ambassador|on.premise|promo\s+rep)\b/i;
  return items.find((i) => re.test(i.name)) ?? null;
}

/**
 * Square-derived bottle depletion. Math is now grounded in actual
 * units_sold from the Item Sales table — no price-inference:
 *   ounces  = units_sold × pour_size
 *   bottles = ounces / 25.36   (750ml = 25.36 fl oz)
 *
 * Multiple SKUs per brand are summed (e.g., if ops adds an "El Bandido
 * Day Pour" alongside "El Bandido Yankee Repo", both count toward
 * Bandido's bottle total).
 */
const BRAND_PROFILES: {
  key: string;
  brand: string;
  pattern: RegExp;
  pourSizeOz: number;
  unitLabel: string;
}[] = [
  { key: 'bandido', brand: 'El Bandido', pattern: /bandido/i,                  pourSizeOz: 1.5, unitLabel: 'cocktail' },
  { key: 'telsen',  brand: 'Telsen',     pattern: /telson|telsen/i,             pourSizeOz: 1.5, unitLabel: 'cocktail' },
  { key: 'ku',      brand: 'KU',         pattern: /devant.*ku|brut.*ku|^\s*ku\b/i, pourSizeOz: 2,   unitLabel: 'flute' },
];

const FL_OZ_PER_750ML = 25.36;

export interface SquareDepletion {
  brand: string;
  skus: { name: string; units_sold: number; gross: number }[];
  unitLabel: string;
  pourSizeOz: number;
  totalUnits: number;
  totalGross: number;
  bottles: number;
}

export function computeSquareDepletions(
  items: { name: string; gross: number; units_sold?: number }[] | null | undefined,
): SquareDepletion[] {
  if (!items) return [];
  const byBrand = new Map<string, SquareDepletion>();
  for (const item of items) {
    const profile = BRAND_PROFILES.find((p) => p.pattern.test(item.name));
    if (!profile) continue;
    const units = item.units_sold ?? 0;
    if (units <= 0 && item.gross <= 0) continue;
    let cur = byBrand.get(profile.key);
    if (!cur) {
      cur = {
        brand: profile.brand,
        skus: [],
        unitLabel: profile.unitLabel,
        pourSizeOz: profile.pourSizeOz,
        totalUnits: 0,
        totalGross: 0,
        bottles: 0,
      };
      byBrand.set(profile.key, cur);
    }
    cur.skus.push({ name: item.name, units_sold: units, gross: item.gross });
    cur.totalUnits += units;
    cur.totalGross += item.gross;
  }
  Array.from(byBrand.values()).forEach((d) => {
    d.bottles = (d.totalUnits * d.pourSizeOz) / FL_OZ_PER_750ML;
  });
  return Array.from(byBrand.values()).sort((a, b) => b.totalGross - a.totalGross);
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
  carryForward: Partial<Record<string, number>> = {},
): Promise<VenueNight | null> {
  const [netRev, counts, barNet, topItems, channel] = await Promise.all([
    loadLiveNetTicketRev(venue, dateISO),
    loadLiveTicketCounts(venue, dateISO),
    loadLiveBarNet(venue, dateISO),
    loadLiveTopItems(venue, dateISO),
    loadLiveChannelBreakdown(venue, dateISO),
  ]);
  // Nothing to show for this date yet — no scrape on disk.
  if (netRev == null && counts.issued == null && barNet == null) return null;
  const costs: Record<string, number | null> = {};
  const costSources: Record<string, 'xlsx' | 'projected'> = {};
  for (const [k, v] of Object.entries(carryForward)) {
    if (v != null) {
      costs[k] = v;
      costSources[k] = 'projected';
    }
  }
  return {
    date: dateISO,
    venue,
    weeknight,
    ticketsIssued: counts.issued,
    ticketsRedeemed: counts.redeemed,
    netTicketRev: netRev,
    barNet,
    costs,
    netTicketRevSource: 'live',
    ticketCountSource: 'live',
    barNetSource: barNet != null ? 'live' : 'xlsx',
    squareTopItems: topItems ?? undefined,
    channelBreakdown: channel,
    costSources: Object.keys(costSources).length > 0 ? costSources : undefined,
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
  const anchor = recap.weekendOf;

  // Pre-fetch the most recent Manor cost values to project onto nights
  // that haven't been xlsx'd yet (cast + rigger are fixed contractor
  // rates per Keith — carry forward until the GM uploads the actual
  // weekend xlsx). Fetch once per weekend for both synthesized and
  // existing nights with null cost lines.
  const manorCarryForward = await loadCarryForwardCosts('manor', anchor);

  const enrichNight = async (n: VenueNight | null): Promise<VenueNight | null> => {
    if (!n) return null;
    const [liveRev, liveCounts, liveBar, liveTopItems, liveOpenBar, liveChannel] = await Promise.all([
      loadLiveNetTicketRev(n.venue, n.date),
      loadLiveTicketCounts(n.venue, n.date),
      loadLiveBarNet(n.venue, n.date),
      loadLiveTopItems(n.venue, n.date),
      loadLiveOpenBarWindow(n.venue, n.date),
      loadLiveChannelBreakdown(n.venue, n.date),
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

    // Carry-forward Manor cast/rigger when the xlsx for this weekend
    // hasn't loaded those values yet. Tag every filled-in key as
    // 'projected' so the UI can show a hint.
    const costs: Record<string, number | null> = { ...n.costs };
    const costSources: Record<string, 'xlsx' | 'projected'> = { ...(n.costSources ?? {}) };
    if (n.venue === 'manor') {
      for (const [k, v] of Object.entries(manorCarryForward)) {
        if (costs[k] == null && v != null) {
          costs[k] = v;
          costSources[k] = 'projected';
        } else if (costs[k] != null && !costSources[k]) {
          costSources[k] = 'xlsx';
        }
      }
    }

    const base = {
      ...n,
      ticketsIssued,
      ticketsRedeemed,
      ticketCountSource,
      barNet,
      barNetSource,
      xlsxBarNet: n.barNet,
      costs,
      costSources: Object.keys(costSources).length > 0 ? costSources : undefined,
      squareTopItems: liveTopItems ?? undefined,
      squareOpenBarWindow: liveOpenBar,
      channelBreakdown: liveChannel,
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
      : synthesizeNightFromLive(
          venue,
          night,
          dateForNight(anchor, night),
          venue === 'manor' ? manorCarryForward : {},
        );

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

// Per-brand historical delta between Pour Log (manager-reported) and
// Square (POS-derived) bottle counts. Drives the "estimated depletion
// check" shown when a night has Square data but no Pour Log filed.
export interface BrandDeltaEstimate {
  brand: string;          // canonical brand name (e.g., "Telsen")
  avgDelta: number | null; // avg (PourLog − Square) bottles, null if no history
  sampleCount: number;    // number of nights with both sources present
  defaultShrinkagePct: number; // fallback markup when sampleCount === 0
}

// Default cushion when we have no historical data for a brand. 10% is
// an educated middle ground — bottles tend to lose a little to spills,
// staff comps, and end-of-night dump that aren't captured by POS.
const DEFAULT_SHRINKAGE_PCT = 0.10;

/**
 * Walk back `lookbackWeeks` Fridays and collect every night where both
 * a Pour Log and Square scrape exist for the given brand. Returns the
 * mean (Pour Log − Square) delta and a sample count so the UI can show
 * "based on N prior nights".
 *
 * Brand matching is loose — we map the Pour Log's `featuredTequila`
 * and `champagne` strings against the same regex profiles the
 * Square depletion uses (BRAND_PROFILES), so "Telson"/"Telsen" both
 * match and "Devant Brut KU BTG"/"KU" do too.
 */
export async function loadBrandDeltaEstimate(
  brand: string,
  asOfFridayISO: string,
  lookbackWeeks: number = 6,
): Promise<BrandDeltaEstimate> {
  const profile = BRAND_PROFILES.find((p) => p.brand.toLowerCase() === brand.toLowerCase());
  const matchesBrand = (s: string | undefined | null): boolean =>
    !!s && (profile?.pattern.test(s) ?? new RegExp(brand, 'i').test(s));

  const samples: number[] = [];
  // Step back week by week; for each weekend collect Fri+Sat samples.
  // anchor is the Friday of `asOfFridayISO`. We start at the most
  // recent prior weekend (one week back) so the current weekend's
  // partial data doesn't pollute the average.
  for (let w = 1; w <= lookbackWeeks; w++) {
    const friday = subtractWeeks(asOfFridayISO, w);
    for (const night of ['fri', 'sat'] as Weeknight[]) {
      const date = dateForNight(friday, night);
      let pourLog: PourLogEntryShape | null = null;
      try {
        const raw = await fs.readFile(path.join(POUR_LOG_DIR, `${date}.json`), 'utf-8');
        pourLog = JSON.parse(raw) as PourLogEntryShape;
      } catch {
        continue;
      }
      // Match the Pour Log entry to this brand.
      let pourLogBottles: number | null = null;
      if (matchesBrand(pourLog.featuredTequila)) pourLogBottles = pourLog.tequila.consumed;
      else if (matchesBrand(pourLog.champagne)) pourLogBottles = pourLog.champagneBottles.consumed;
      if (pourLogBottles == null) continue;

      // Pull the Square depletion for that night (Noir is the open-bar venue).
      const items = await loadLiveTopItems('noir', date);
      const deps = computeSquareDepletions(items);
      const match = deps.find((d) => d.brand.toLowerCase() === brand.toLowerCase());
      if (!match) continue;

      samples.push(pourLogBottles - match.bottles);
    }
  }
  if (samples.length === 0) {
    return { brand, avgDelta: null, sampleCount: 0, defaultShrinkagePct: DEFAULT_SHRINKAGE_PCT };
  }
  const avgDelta = samples.reduce((s, v) => s + v, 0) / samples.length;
  return { brand, avgDelta, sampleCount: samples.length, defaultShrinkagePct: DEFAULT_SHRINKAGE_PCT };
}

// Manor cost lines that are effectively contractor flat rates and stay
// fixed week-to-week until a contract changes. Carried forward from the
// most recent filed xlsx so upcoming weekends show projected costs even
// before the GM's Monday upload.
const MANOR_CARRY_FORWARD_KEYS = ['cast', 'rigger'] as const;

/**
 * Pull the most recent xlsx-filed values for the venue's carry-forward
 * cost keys. Walks `listRecentWeekends` newest-first, skipping the
 * caller's anchor week, and returns the first non-null value found per
 * key. Used to project Manor cast + rigger onto upcoming weekends.
 */
export async function loadCarryForwardCosts(
  venue: Venue,
  asOfFridayISO: string,
): Promise<Partial<Record<string, number>>> {
  if (venue !== 'manor') return {}; // only Manor has fixed cast/rigger
  const wanted = [...MANOR_CARRY_FORWARD_KEYS];
  const recent = await listRecentWeekends(8);
  const out: Partial<Record<string, number>> = {};
  for (const fri of recent) {
    if (fri >= asOfFridayISO) continue; // must be a strictly prior weekend
    if (wanted.every((k) => out[k] != null)) break;
    let weekend: WeekendRecap;
    try {
      weekend = await readWeekendJSON(fri);
    } catch {
      continue;
    }
    const nights: (VenueNight | null)[] = [
      weekend.manor.thu, weekend.manor.fri, weekend.manor.sat, weekend.manor.sun,
    ];
    for (const n of nights) {
      if (!n) continue;
      for (const k of wanted) {
        if (out[k] == null && n.costs[k] != null) {
          out[k] = n.costs[k] as number;
        }
      }
    }
  }
  return out;
}

function subtractWeeks(fridayISO: string, weeks: number): string {
  const [y, m, d] = fridayISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 7 * weeks);
  return dt.toISOString().slice(0, 10);
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
