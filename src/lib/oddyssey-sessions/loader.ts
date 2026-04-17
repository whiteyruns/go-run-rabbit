// Shared loader for session-level Summary Report JSONs produced by
// scripts/oddyssey-sessions-pull.ts. Returns null if nothing is on disk
// yet so callers can fall back to CSV-derived estimates.

import fs from "fs";
import path from "path";

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

export function sumSessionReport(r: DateSessionReport): SessionReportTotals {
  const totals: SessionReportTotals = {
    reserved: 0, capacity: 0, capacity_percent: 0, redeemed: 0,
    gross_revenue: 0, net_to_bank: 0, revenue_sold: 0, revenue_refunded: 0,
    total_orders: 0, tickets_free: 0, tickets_paid: 0, tickets_held: 0, tickets_refunded: 0,
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
  }
  totals.capacity_percent = totals.capacity > 0 ? totals.reserved / totals.capacity : 0;
  return totals;
}
