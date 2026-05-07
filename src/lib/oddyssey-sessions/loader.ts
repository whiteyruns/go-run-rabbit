// Shared loader for session-level Summary Report JSONs produced by
// scripts/oddyssey-sessions-pull.ts. Returns null if nothing is on disk
// yet so callers can fall back to CSV-derived estimates.

import fs from "fs";
import path from "path";

// Types + pure compute live in ./channel-mix so client components can
// import without bringing fs into the browser bundle. Re-exported here
// so server-side callers can keep a single import path.
export {
  computeChannelMix,
  type TicketGroupReport,
  type ChannelMix,
} from "./channel-mix";
import type { TicketGroupReport } from "./channel-mix";

export interface SessionReport {
  session_id: string;
  time_label: string;
  data: SessionReportData;
}

export interface SessionReportData {
  title: string;
  reserved: number | null;
  capacity: number | null;
  capacity_percent: number | null; // 0-1
  redeemed: number | null;
  redeemed_of: number | null;
  redeemed_percent: number | null; // 0-1
  gross_revenue: number | null;
  total_orders: number | null;
  tickets_free: number | null;
  tickets_paid: number | null;
  tickets_held: number | null;
  tickets_refunded: number | null;
  net_to_bank: number | null;
  revenue_sold: number | null;
  revenue_refunded: number | null;
  // Added 2026-04-19: per-ticket-group breakdown from Ticketure. Empty
  // array on older summaries pulled before the scraper was extended.
  ticket_groups?: TicketGroupReport[];
}

export interface DateSessionReport {
  venue: "manor" | "noir";
  date: string;
  pulled_at: string;
  event_id: string;
  sessions: SessionReport[];
}

export interface SessionReportTotals {
  reserved: number;
  capacity: number;
  capacity_percent: number;
  redeemed: number;
  gross_revenue: number;
  net_to_bank: number;
  revenue_sold: number;
  revenue_refunded: number;
  total_orders: number;
  tickets_free: number;
  tickets_paid: number;
  tickets_held: number;
  tickets_refunded: number;
  // ─── Admissions-only counts (deflated) ────────────────────────────────
  // Ticketure counts each food inclusion (Charcuterie, Shrimp, Short Ribs,
  // Ube Cheesecake) as its own "ticket" in the Session Summary Report.
  // For a Dinner Guest who paid once, Ticketure reports 1 paid + 3 free
  // (the 3 inclusion rows). For COMP reporting we want admissions, not
  // line items — these fields strip the Inclusions group.
  //
  // When the source JSON predates per-group capture (no ticket_groups
  // array), these mirror the raw fields above so callers fail open.
  inclusion_rows: number;
  reserved_admissions: number;
  redeemed_admissions: number;
  tickets_free_admissions: number;
}

function venueDir(venue: "manor" | "noir"): string {
  return path.resolve(
    process.cwd(),
    venue === "manor" ? "data/oddyssey-food/summaries" : "data/oddyssey-noir/summaries"
  );
}

export function loadSessionReport(
  venue: "manor" | "noir",
  date: string
): DateSessionReport | null {
  try {
    const file = path.join(venueDir(venue), `${date}.json`);
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as DateSessionReport;
  } catch {
    return null;
  }
}

// Match a ticket_group_name like "Inclusions" / "inclusion".
const INCLUSION_GROUP_RE = /^inclusions?$/i;

export function sumSessionReport(r: DateSessionReport): SessionReportTotals {
  const totals: SessionReportTotals = {
    reserved: 0, capacity: 0, capacity_percent: 0, redeemed: 0,
    gross_revenue: 0, net_to_bank: 0, revenue_sold: 0, revenue_refunded: 0,
    total_orders: 0, tickets_free: 0, tickets_paid: 0, tickets_held: 0, tickets_refunded: 0,
    inclusion_rows: 0, reserved_admissions: 0, redeemed_admissions: 0,
    tickets_free_admissions: 0,
  };
  for (const s of r.sessions) {
    const d = s.data;
    totals.reserved += d.reserved ?? 0;
    totals.capacity += d.capacity ?? 0;
    totals.redeemed += d.redeemed ?? 0;
    totals.gross_revenue += d.gross_revenue ?? 0;
    totals.net_to_bank += d.net_to_bank ?? 0;
    totals.revenue_sold += d.revenue_sold ?? 0;
    totals.revenue_refunded += d.revenue_refunded ?? 0;
    totals.total_orders += d.total_orders ?? 0;
    totals.tickets_free += d.tickets_free ?? 0;
    totals.tickets_paid += d.tickets_paid ?? 0;
    totals.tickets_held += d.tickets_held ?? 0;
    totals.tickets_refunded += d.tickets_refunded ?? 0;

    // Per-session inclusion-row counts. We use `reserved` (which is the
    // line-item count Ticketure assigns to the group) since each
    // inclusion row maps 1:1 to a food voucher. The group's own
    // tickets_free / tickets_paid fields are typically null in the
    // scraper output, so we don't trust them here.
    const inclGroup = (d.ticket_groups ?? []).find((g) =>
      INCLUSION_GROUP_RE.test((g.ticket_group_name ?? "").trim()),
    );
    const inclReserved = inclGroup?.reserved ?? 0;
    const inclRedeemed = inclGroup?.redeemed ?? 0;
    totals.inclusion_rows += inclReserved;
    totals.reserved_admissions += (d.reserved ?? 0) - inclReserved;
    totals.redeemed_admissions += (d.redeemed ?? 0) - inclRedeemed;
    // Inclusions are always $0, so every inclusion row counts as a
    // "free ticket" at the session level. Subtract them to recover
    // real comp admissions.
    totals.tickets_free_admissions += Math.max(0, (d.tickets_free ?? 0) - inclReserved);
  }
  totals.capacity_percent = totals.capacity > 0 ? totals.reserved / totals.capacity : 0;
  return totals;
}

/**
 * Aggregate per-ticket-group rows across all sessions for a date. Manor
 * (9 sessions) and Noir (1 session) both flatten cleanly — sums the same
 * ticket_group_name across sessions. Returns null if no session has
 * per-group data yet (pulls from before the scraper was extended).
 */
export function aggregateTicketGroups(
  r: DateSessionReport,
): TicketGroupReport[] | null {
  const anyHasGroups = r.sessions.some((s) => (s.data.ticket_groups?.length ?? 0) > 0);
  if (!anyHasGroups) return null;

  const merged = new Map<string, TicketGroupReport>();
  for (const s of r.sessions) {
    const groups = s.data.ticket_groups ?? [];
    for (const g of groups) {
      const key = g.ticket_group_name.trim();
      if (!key) continue;
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, { ...g, ticket_group_name: key });
        continue;
      }
      const addN = (a: number | null, b: number | null) =>
        a == null && b == null ? null : (a ?? 0) + (b ?? 0);
      merged.set(key, {
        ticket_group_name: key,
        reserved: addN(existing.reserved, g.reserved),
        redeemed: addN(existing.redeemed, g.redeemed),
        gross_revenue: addN(existing.gross_revenue, g.gross_revenue),
        net_to_bank: addN(existing.net_to_bank, g.net_to_bank),
        tickets_paid: addN(existing.tickets_paid, g.tickets_paid),
        tickets_free: addN(existing.tickets_free, g.tickets_free),
        tickets_refunded: addN(existing.tickets_refunded, g.tickets_refunded),
        revenue_refunded: addN(existing.revenue_refunded, g.revenue_refunded),
      });
    }
  }
  return Array.from(merged.values()).sort(
    (a, b) => (b.reserved ?? 0) - (a.reserved ?? 0),
  );
}
