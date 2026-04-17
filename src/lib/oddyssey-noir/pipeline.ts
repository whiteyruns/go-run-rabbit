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

// Noir shows run Fri + Sat as a single 10 PM session with 450 capacity
// (confirmed against Ticketure's session-level Summary Report).
export const NOIR_SESSIONS_PER_NIGHT = 1;
export const NOIR_SESSION_CAPACITY = 450;

const GROUP_TO_TYPE = new Map<string, NoirTicketType>(
  NOIR_TICKET_TYPES.map((t) => [t.ticket_group_name.toLowerCase(), t])
);

export interface NoirAdmission {
  type: NoirTicketType | null; // null = group not in seed (unknown price)
  raw_group_name: string; // exactly as it appears in the CSV
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
    const rawGroup = r.ticket_group_name?.trim();
    if (!rawGroup) continue;
    if (!r.scan_code) continue;
    const tt = GROUP_TO_TYPE.get(rawGroup.toLowerCase()) ?? null;
    const session = parseSession(r.session_time);
    const note = [r.identity_customer_note, r.identity_customer_note_two]
      .map((s) => (s ?? "").trim())
      .filter(Boolean)
      .join(" · ");
    admissions.push({
      type: tt,
      raw_group_name: rawGroup,
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
  ticket_groups: NoirTicketGroupRow[];
  sessions: NoirSessionOccupancy[];
  available_dates: string[];
  source: { filename: string; pulled_at: string };
  notes: { guest: string; session: string; note: string }[];
}

// Mirrors the per-group rows in Ticketure's Summary Report.
// Built from the attendees CSV alone, so it can't distinguish free vs
// paid — revenue shown is a list-price estimate and flagged as such.
export interface NoirTicketGroupRow {
  ticket_group_name: string;
  short_label: string;
  reserved: number;
  redeemed: number;
  redemption_rate: number;
  price_known: boolean;
  price: number;
  revenue_estimate: number;
}

export function buildNoirSummary(state: NoirState, date?: string): NoirSummary | null {
  const dates = Array.from(new Set(state.admissions.map((a) => a.session_date))).sort();
  const target = date ?? dates[dates.length - 1];
  if (!target) return null;

  const dayAdms = state.admissions.filter((a) => a.session_date === target);

  // Packages (only seeded types)
  const pkgCounts: Record<string, number> = {};
  for (const a of dayAdms) {
    if (!a.type) continue;
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

  // Ticket group breakdown — mirrors Ticketure's Summary Report rows.
  // Groups discovered dynamically from the CSV; price taken from seed if
  // the group is configured, otherwise 0 with price_known=false (so the
  // UI can flag it).
  const groupStats = new Map<string, { reserved: number; redeemed: number }>();
  for (const a of dayAdms) {
    const key = a.raw_group_name;
    let g = groupStats.get(key);
    if (!g) { g = { reserved: 0, redeemed: 0 }; groupStats.set(key, g); }
    g.reserved += 1;
    if (a.ticket_state === "redeemed") g.redeemed += 1;
  }
  const ticket_groups: NoirTicketGroupRow[] = Array.from(groupStats.entries())
    .map(([name, s]) => {
      const seed = GROUP_TO_TYPE.get(name.toLowerCase()) ?? null;
      const price = seed?.price ?? 0;
      return {
        ticket_group_name: name,
        short_label: seed?.short_label ?? name.toUpperCase(),
        reserved: s.reserved,
        redeemed: s.redeemed,
        redemption_rate: s.reserved > 0 ? s.redeemed / s.reserved : 0,
        price_known: Boolean(seed),
        price,
        revenue_estimate: s.reserved * price,
      };
    })
    .sort((a, b) => b.reserved - a.reserved);

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
      for (const a of s.adms) {
        if (!a.type) continue;
        mixMap[a.type.package_type] = (mixMap[a.type.package_type] ?? 0) + 1;
      }
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
    ticket_groups,
    sessions,
    available_dates: dates,
    source: { filename: state.source.filename, pulled_at: state.source.uploaded_at },
    notes: Array.from(noteMap.values()),
  };
}

export function formatNoirCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
