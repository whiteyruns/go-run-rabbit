import { buildWeekOverWeek, loadManorReportOverlay, type ManorReportOverlay, type WeekOverWeek } from "./history";
import { getMenuCatalog } from "./normalizer";
import { buildSummary, type PackageBreakdown } from "./summary";
import type { DashboardState } from "./types";

export interface RecapData {
  date: string; // "2026-04-17"
  date_label: string; // "Friday, April 17"
  source_filename: string;
  source_pulled_at: string;
  stats: {
    admission_tickets: number;
    parties: number;
    food_items: number;
    sessions: number;
    walkups: number;
    vip_parties: number;
    note_parties: number;
    redeemed: number;
    redemption_rate: number; // 0-1
    revenue: number; // total revenue at list price
    capacity_total: number;
    capacity_percent: number; // 0-1
  };
  packages: PackageBreakdown[];
  report: ManorReportOverlay;
  wow: WeekOverWeek;
  item_totals: { id: string; label: string; count: number }[];
  sessions: {
    time: string; // "7:30 PM"
    label: string; // "Friday, April 17 · 7:30 PM"
    guests: number;
    items: number;
    admissions: number;
    capacity: number;
    percent: number; // 0-1 capacity
    package_mix: { short_label: string; count: number }[];
    breakdown: { label: string; count: number }[];
  }[];
  notes: { guest: string; session: string; note: string }[];
  vips: { guest: string; session: string; party_size: number }[];
}

// Builds recap data for a specific date from the dashboard state.
// If no date is provided, uses the latest date present in the state.
export function buildRecap(state: DashboardState, date?: string): RecapData | null {
  const catalog = getMenuCatalog();

  // Pick the target date — prefer dates with any activity (groups OR allocations)
  const datesInState = Array.from(
    new Set([
      ...state.allocations.map((a) => a.session_date),
      ...state.groups.map((g) => g.session_iso.slice(0, 10)),
    ])
  ).sort();
  const target = date ?? datesInState[datesInState.length - 1];
  if (!target) return null;

  // Pull ticket/revenue side from the summary builder
  const summary = buildSummary(state, target);
  if (!summary) return null;

  // Filter allocations + groups to that date
  const dayAllocs = state.allocations.filter((a) => a.session_date === target);
  const dayGroups = state.groups.filter((g) => g.session_iso.startsWith(target));

  // Admission tickets count = distinct parent_scan_codes (or party_size sum)
  const admissionTickets = dayGroups.reduce(
    (s, g) => s + (g.derived_party_size ?? 0),
    0
  );

  // Item totals
  const counts: Record<string, number> = {};
  for (const a of dayAllocs) {
    const id = a.menu_item_id ?? "__unknown__";
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const item_totals = catalog
    .map((c) => ({ id: c.id, label: c.label, count: counts[c.id] ?? 0 }))
    .filter((t) => t.count > 0);
  if ((counts["__unknown__"] ?? 0) > 0) {
    item_totals.push({ id: "__unknown__", label: "Unknown / Unmapped", count: counts["__unknown__"] });
  }

  // Per-session food breakdown (item -> count)
  const foodBySession = new Map<string, Record<string, number>>();
  const guestsBySession = new Map<string, Set<string>>();
  for (const a of dayAllocs) {
    if (!foodBySession.has(a.session_iso)) foodBySession.set(a.session_iso, {});
    if (!guestsBySession.has(a.session_iso)) guestsBySession.set(a.session_iso, new Set());
    const bd = foodBySession.get(a.session_iso)!;
    bd[a.menu_item_label] = (bd[a.menu_item_label] ?? 0) + 1;
    guestsBySession.get(a.session_iso)!.add(a.buyer_email);
  }

  // Sessions come from summary (covers all sessions with admissions),
  // enriched with food breakdown for those that have food.
  const sessions = summary.sessions.map((occ) => {
    const bd = foodBySession.get(occ.iso) ?? {};
    const fullLabel = new Date(occ.iso).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    return {
      time: occ.time_label,
      label: `${fullLabel} · ${occ.time_label}`,
      guests: guestsBySession.get(occ.iso)?.size ?? 0,
      items: occ.food_items,
      admissions: occ.admissions,
      capacity: occ.capacity,
      percent: occ.percent,
      package_mix: occ.package_mix.map((m) => ({ short_label: m.short_label, count: m.count })),
      breakdown: Object.entries(bd)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count),
    };
  });

  // Redemption (based on ticket_state)
  const redeemed = dayAllocs.filter((a) => a.ticket_state === "redeemed").length;
  const redemptionRate = dayAllocs.length > 0 ? redeemed / dayAllocs.length : 0;

  // Walk-ups
  const walkups = dayAllocs.filter((a) => a.ticket_state === "walkup").length;

  // VIP + notes
  const vips = dayGroups
    .filter((g) => (g.derived_package_types ?? []).includes("ultimate"))
    .map((g) => ({
      guest: g.buyer_name || g.buyer_email,
      session: new Date(g.session_iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      party_size: g.derived_party_size ?? 0,
    }));
  const notes = dayGroups
    .filter((g) => (g.customer_note ?? "").length > 0)
    .map((g) => ({
      guest: g.buyer_name || g.buyer_email,
      session: new Date(g.session_iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      note: g.customer_note ?? "",
    }));

  const d = new Date(target + "T00:00:00");
  const date_label = !isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : target;

  return {
    date: target,
    date_label,
    source_filename: state.source.filename,
    source_pulled_at: state.source.uploaded_at,
    stats: {
      admission_tickets: admissionTickets,
      parties: dayGroups.length,
      food_items: dayAllocs.length,
      sessions: sessions.length,
      walkups,
      vip_parties: vips.length,
      note_parties: notes.length,
      redeemed,
      redemption_rate: redemptionRate,
      revenue: summary.revenue,
      capacity_total: summary.capacity_total,
      capacity_percent: summary.capacity_percent,
    },
    packages: summary.packages,
    report: loadManorReportOverlay(target),
    wow: buildWeekOverWeek(summary),
    item_totals,
    sessions,
    notes,
    vips,
  };
}
