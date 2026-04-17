import { getMenuCatalog } from "./normalizer";
import { getTicketTypes } from "./roster";
import type { DashboardState } from "./types";

// Oddyssey Manor session capacity from Ticketure.
export const SESSION_CAPACITY = 40;
// Oddyssey Manor typically runs 9 sessions per show night.
export const SESSIONS_PER_NIGHT = 9;

export interface NightSummary {
  date: string;
  date_label: string;
  tickets_sold: number;
  revenue: number;
  capacity_total: number; // sessions_count * SESSION_CAPACITY
  capacity_percent: number; // 0-1
  food_items: number;
  packages: PackageBreakdown[];
  sessions: SessionOccupancy[];
  food: {
    total_items: number;
    by_item: { id: string; label: string; count: number }[];
    vip_parties: number;
    note_parties: number;
    walkups: number;
    redeemed: number;
    redemption_rate: number;
  };
  source: {
    filename: string;
    pulled_at: string;
  };
  available_dates: string[];
}

export interface PackageBreakdown {
  type: string;
  label: string;
  short_label: string;
  count: number;
  price: number;
  revenue: number;
  percent: number; // 0-1 of total tickets
}

export interface SessionOccupancy {
  iso: string;
  time_label: string;
  admissions: number;
  capacity: number;
  percent: number; // 0-1
  package_mix: { type: string; short_label: string; count: number }[];
  food_items: number;
}

export function buildSummary(state: DashboardState, date?: string): NightSummary | null {
  const catalog = getMenuCatalog();
  const ticketTypes = getTicketTypes();

  const datesInState = Array.from(
    new Set(state.groups.map((g) => g.session_iso.slice(0, 10)))
  ).sort();
  const target = date ?? datesInState[datesInState.length - 1];
  if (!target) return null;

  const dayGroups = state.groups.filter((g) => g.session_iso.startsWith(target));
  const dayAllocs = state.allocations.filter((a) => a.session_date === target);

  // --- Packages ---
  // For each group we count admission tickets per package_type using the
  // admissions index (derived_package_types + derived_party_size). When a
  // group has multiple types (mixed order), we attribute proportionally.
  const pkgCounts: Record<string, number> = {};
  for (const g of dayGroups) {
    if (!g.derived_package_types || !g.derived_party_size) continue;
    const types = g.derived_package_types;
    if (types.length === 1) {
      pkgCounts[types[0]] = (pkgCounts[types[0]] ?? 0) + (g.derived_party_size ?? 0);
    } else {
      // Mixed — split evenly across types in the group (approximation).
      const share = (g.derived_party_size ?? 0) / types.length;
      for (const t of types) pkgCounts[t] = (pkgCounts[t] ?? 0) + share;
    }
  }

  const totalTickets = Object.values(pkgCounts).reduce((s, n) => s + n, 0);
  const packages: PackageBreakdown[] = ticketTypes.map((t) => {
    const count = Math.round(pkgCounts[t.package_type] ?? 0);
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

  // --- Sessions ---
  const sessionMap = new Map<
    string,
    {
      iso: string;
      time_label: string;
      admissions: number;
      food_items: number;
      mix: Record<string, number>;
    }
  >();
  for (const g of dayGroups) {
    const iso = g.session_iso;
    let s = sessionMap.get(iso);
    if (!s) {
      const d = new Date(iso);
      const timeLabel = !isNaN(d.getTime())
        ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        : iso.slice(11, 16);
      s = { iso, time_label: timeLabel, admissions: 0, food_items: 0, mix: {} };
      sessionMap.set(iso, s);
    }
    s.admissions += g.derived_party_size ?? 0;
    s.food_items += g.total_items;
    for (const t of g.derived_package_types ?? []) {
      const share = g.derived_package_types?.length === 1
        ? (g.derived_party_size ?? 0)
        : (g.derived_party_size ?? 0) / (g.derived_package_types?.length || 1);
      s.mix[t] = (s.mix[t] ?? 0) + share;
    }
  }
  const sessions: SessionOccupancy[] = Array.from(sessionMap.values())
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map((s) => ({
      iso: s.iso,
      time_label: s.time_label,
      admissions: s.admissions,
      capacity: SESSION_CAPACITY,
      percent: s.admissions / SESSION_CAPACITY,
      package_mix: Object.entries(s.mix)
        .map(([t, count]) => {
          const tt = ticketTypes.find((x) => x.package_type === t);
          return { type: t, short_label: tt?.short_label ?? t.toUpperCase(), count: Math.round(count) };
        })
        .sort((a, b) => b.count - a.count),
      food_items: s.food_items,
    }));

  // --- Food ---
  const foodCounts: Record<string, number> = {};
  for (const a of dayAllocs) {
    const id = a.menu_item_id ?? "__unknown__";
    foodCounts[id] = (foodCounts[id] ?? 0) + 1;
  }
  const byItem = catalog
    .map((c) => ({ id: c.id, label: c.label, count: foodCounts[c.id] ?? 0 }))
    .filter((t) => t.count > 0);
  if ((foodCounts["__unknown__"] ?? 0) > 0) {
    byItem.push({ id: "__unknown__", label: "Unknown", count: foodCounts["__unknown__"] });
  }
  const redeemed = dayAllocs.filter((a) => a.ticket_state === "redeemed").length;

  const d = new Date(target + "T00:00:00");
  const dateLabel = !isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : target;

  // Always report against the full-night capacity so percent is
  // comparable across dates regardless of which sessions have tickets.
  const capacityTotal = SESSIONS_PER_NIGHT * SESSION_CAPACITY;

  return {
    date: target,
    date_label: dateLabel,
    tickets_sold: totalTickets,
    revenue,
    capacity_total: capacityTotal,
    capacity_percent: totalTickets / capacityTotal,
    food_items: dayAllocs.length,
    packages,
    sessions,
    food: {
      total_items: dayAllocs.length,
      by_item: byItem,
      vip_parties: dayGroups.filter((g) => (g.derived_package_types ?? []).includes("ultimate")).length,
      note_parties: dayGroups.filter((g) => (g.customer_note ?? "").length > 0).length,
      walkups: dayAllocs.filter((a) => a.ticket_state === "walkup").length,
      redeemed,
      redemption_rate: dayAllocs.length > 0 ? redeemed / dayAllocs.length : 0,
    },
    source: {
      filename: state.source.filename,
      pulled_at: state.source.uploaded_at,
    },
    available_dates: datesInState,
  };
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
