// Noir pipeline — tickets-only (no food inclusions, no roster).
// Parses the Ticketure attendees CSV, groups admissions by session +
// buyer, computes revenue + capacity + package mix.

import ticketTypesRaw from "@/data/oddyssey-noir/ticket_types.json";
import { parseCSV } from "@/lib/oddyssey-food/csv-parser";
import type { InclusionRow } from "@/lib/oddyssey-food/types";

export interface NoirTicketType {
  ticket_sku: string;
  ticket_group_name: string;
  package_type: string;
  package_label: string;
  short_label: string;
  price: number;
}

export const NOIR_TICKET_TYPES = ticketTypesRaw as NoirTicketType[];

// Noir shows run Fri + Sat, 10 PM – late. Capacity is TBD — using
// Manor's 40/session × 9 as a placeholder until we know Noir's real
// session grid.
export const NOIR_SESSIONS_PER_NIGHT = 9;
export const NOIR_SESSION_CAPACITY = 40;

const GROUP_TO_TYPE = new Map<string, NoirTicketType>(
  NOIR_TICKET_TYPES.map((t) => [t.ticket_group_name.toLowerCase(), t])
);

export interface NoirAdmission {
  type: NoirTicketType;
  scan_code: string;
  buyer_name: string;
  buyer_email: string;
  session_iso: string;
  session_date: string;
  session_time_label: string;
  ticket_state: string;
  customer_note?: string;
}

export interface NoirState {
  source: { filename: string; uploaded_at: string; row_count: number };
  admissions: NoirAdmission[];
}

function parseSession(sessionTime: string) {
  const iso = sessionTime.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return { iso: sessionTime, date: sessionTime.slice(0, 10), timeLabel: sessionTime.slice(11, 16) };
  }
  return {
    iso,
    date: sessionTime.slice(0, 10),
    timeLabel: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

export function buildNoirState(filename: string, csvText: string): { state: NoirState; warnings: string[] } {
  const { rows, warnings } = parseCSV(csvText);
  const admissions: NoirAdmission[] = [];
  for (const r of rows as InclusionRow[]) {
    const gn = r.ticket_group_name?.trim().toLowerCase();
    if (!gn) continue;
    const tt = GROUP_TO_TYPE.get(gn);
    if (!tt) continue; // skip unknown groups (staff-only, etc.)
    if (!r.scan_code) continue;
    const session = parseSession(r.session_time);
    const note = [r.identity_customer_note, r.identity_customer_note_two]
      .map((s) => (s ?? "").trim())
      .filter(Boolean)
      .join(" · ");
    admissions.push({
      type: tt,
      scan_code: r.scan_code,
      buyer_name: r.identity_name,
      buyer_email: r.identity_email,
      session_iso: session.iso,
      session_date: session.date,
      session_time_label: session.timeLabel,
      ticket_state: r.ticket_state,
      customer_note: note || undefined,
    });
  }
  return {
    state: {
      source: { filename, uploaded_at: new Date().toISOString(), row_count: rows.length },
      admissions,
    },
    warnings,
  };
}

// ─── SUMMARY ───────────────────────────────────────────────────────

export interface NoirPackageBreakdown {
  type: string;
  label: string;
  short_label: string;
  count: number;
  price: number;
  revenue: number;
  percent: number;
}

export interface NoirSessionOccupancy {
  iso: string;
  time_label: string;
  admissions: number;
  capacity: number;
  percent: number;
  package_mix: { type: string; short_label: string; count: number }[];
  redeemed: number;
}

export interface NoirSummary {
  date: string;
  date_label: string;
  tickets_sold: number;
  revenue: number;
  capacity_total: number;
  capacity_percent: number;
  redeemed: number;
  redemption_rate: number;
  packages: NoirPackageBreakdown[];
  sessions: NoirSessionOccupancy[];
  available_dates: string[];
  source: { filename: string; pulled_at: string };
  notes: { guest: string; session: string; note: string }[];
}

export function buildNoirSummary(state: NoirState, date?: string): NoirSummary | null {
  const dates = Array.from(new Set(state.admissions.map((a) => a.session_date))).sort();
  const target = date ?? dates[dates.length - 1];
  if (!target) return null;

  const dayAdms = state.admissions.filter((a) => a.session_date === target);

  // Packages
  const pkgCounts: Record<string, number> = {};
  for (const a of dayAdms) {
    pkgCounts[a.type.package_type] = (pkgCounts[a.type.package_type] ?? 0) + 1;
  }
  const totalTickets = dayAdms.length;
  const packages: NoirPackageBreakdown[] = NOIR_TICKET_TYPES.map((t) => {
    const count = pkgCounts[t.package_type] ?? 0;
    return {
      type: t.package_type,
      label: t.package_label,
      short_label: t.short_label,
      count,
      price: t.price,
      revenue: count * t.price,
      percent: totalTickets > 0 ? count / totalTickets : 0,
    };
  });
  const revenue = packages.reduce((s, p) => s + p.revenue, 0);

  // Sessions
  const sessionMap = new Map<string, { iso: string; time: string; adms: NoirAdmission[] }>();
  for (const a of dayAdms) {
    let s = sessionMap.get(a.session_iso);
    if (!s) s = { iso: a.session_iso, time: a.session_time_label, adms: [] };
    s.adms.push(a);
    sessionMap.set(a.session_iso, s);
  }
  const sessions: NoirSessionOccupancy[] = Array.from(sessionMap.values())
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map((s) => {
      const mixMap: Record<string, number> = {};
      for (const a of s.adms) mixMap[a.type.package_type] = (mixMap[a.type.package_type] ?? 0) + 1;
      return {
        iso: s.iso,
        time_label: s.time,
        admissions: s.adms.length,
        capacity: NOIR_SESSION_CAPACITY,
        percent: s.adms.length / NOIR_SESSION_CAPACITY,
        package_mix: Object.entries(mixMap)
          .map(([t, count]) => {
            const tt = NOIR_TICKET_TYPES.find((x) => x.package_type === t);
            return { type: t, short_label: tt?.short_label ?? t.toUpperCase(), count };
          })
          .sort((a, b) => b.count - a.count),
        redeemed: s.adms.filter((a) => a.ticket_state === "redeemed").length,
      };
    });

  const redeemed = dayAdms.filter((a) => a.ticket_state === "redeemed").length;

  // Notes
  const noteMap = new Map<string, { guest: string; session: string; note: string }>();
  for (const a of dayAdms) {
    if (!a.customer_note) continue;
    const key = `${a.buyer_email}::${a.session_iso}`;
    if (noteMap.has(key)) continue;
    noteMap.set(key, {
      guest: a.buyer_name || a.buyer_email,
      session: a.session_time_label,
      note: a.customer_note,
    });
  }

  const d = new Date(target + "T00:00:00");
  const dateLabel = !isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : target;

  return {
    date: target,
    date_label: dateLabel,
    tickets_sold: totalTickets,
    revenue,
    capacity_total: NOIR_SESSIONS_PER_NIGHT * NOIR_SESSION_CAPACITY,
    capacity_percent: totalTickets / (NOIR_SESSIONS_PER_NIGHT * NOIR_SESSION_CAPACITY),
    redeemed,
    redemption_rate: totalTickets > 0 ? redeemed / totalTickets : 0,
    packages,
    sessions,
    available_dates: dates,
    source: { filename: state.source.filename, pulled_at: state.source.uploaded_at },
    notes: Array.from(noteMap.values()),
  };
}

// ─── WEEK OVER WEEK ────────────────────────────────────────────────
// Reads historical Noir pulls from disk and compares.

import fs from "fs";
import path from "path";

const NOIR_PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const FILE_RE = /^attendees-(\d{4}-\d{2}-\d{2})-.*\.csv$/;

export function findLatestNoirPullForDate(date: string): string | null {
  try {
    const names = fs.readdirSync(NOIR_PULLS_DIR);
    const matches = names
      .filter((n) => {
        const m = FILE_RE.exec(n);
        return m && m[1] === date;
      })
      .sort();
    return matches.length > 0 ? path.join(NOIR_PULLS_DIR, matches[matches.length - 1]) : null;
  } catch {
    return null;
  }
}

export function buildNoirSummaryForDate(date: string): NoirSummary | null {
  const file = findLatestNoirPullForDate(date);
  if (!file) return null;
  try {
    const csv = fs.readFileSync(file, "utf-8");
    const { state } = buildNoirState(path.basename(file), csv);
    return buildNoirSummary(state, date);
  } catch {
    return null;
  }
}

export interface NoirWeekOverWeek {
  prior_date: string;
  prior_date_label: string;
  available: boolean;
  deltas: {
    tickets: number;
    revenue: number;
    capacity_percent: number;
    redeemed: number;
  };
  prior: {
    tickets: number;
    revenue: number;
    capacity_percent: number;
    redeemed: number;
  } | null;
  packages: {
    type: string;
    short_label: string;
    current: number;
    prior: number;
    delta: number;
  }[];
}

export function buildNoirWeekOverWeek(current: NoirSummary): NoirWeekOverWeek {
  const d = new Date(current.date + "T00:00:00");
  d.setDate(d.getDate() - 7);
  const priorDate = d.toISOString().slice(0, 10);
  const priorDateLabel = d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const prior = buildNoirSummaryForDate(priorDate);

  if (!prior) {
    return {
      prior_date: priorDate,
      prior_date_label: priorDateLabel,
      available: false,
      deltas: { tickets: 0, revenue: 0, capacity_percent: 0, redeemed: 0 },
      prior: null,
      packages: current.packages.map((p) => ({
        type: p.type, short_label: p.short_label, current: p.count, prior: 0, delta: p.count,
      })),
    };
  }

  return {
    prior_date: priorDate,
    prior_date_label: priorDateLabel,
    available: true,
    deltas: {
      tickets: current.tickets_sold - prior.tickets_sold,
      revenue: current.revenue - prior.revenue,
      capacity_percent: current.capacity_percent - prior.capacity_percent,
      redeemed: current.redeemed - prior.redeemed,
    },
    prior: {
      tickets: prior.tickets_sold,
      revenue: prior.revenue,
      capacity_percent: prior.capacity_percent,
      redeemed: prior.redeemed,
    },
    packages: current.packages.map((p) => {
      const priorPkg = prior.packages.find((x) => x.type === p.type);
      const priorCount = priorPkg?.count ?? 0;
      return { type: p.type, short_label: p.short_label, current: p.count, prior: priorCount, delta: p.count - priorCount };
    }),
  };
}

export function formatNoirCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
