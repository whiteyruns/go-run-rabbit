import { getMenuCatalog } from "./normalizer";
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
  };
  item_totals: { id: string; label: string; count: number }[];
  sessions: {
    time: string; // "7:30 PM"
    label: string; // "Friday, April 17 · 7:30 PM"
    guests: number;
    items: number;
    breakdown: { label: string; count: number }[];
  }[];
  notes: { guest: string; session: string; note: string }[];
  vips: { guest: string; session: string; party_size: number }[];
}

// Builds recap data for a specific date from the dashboard state.
// If no date is provided, uses the latest date present in the state.
export function buildRecap(state: DashboardState, date?: string): RecapData | null {
  const catalog = getMenuCatalog();

  // Pick the target date
  const datesInState = Array.from(
    new Set(state.allocations.map((a) => a.session_date))
  ).sort();
  const target = date ?? datesInState[datesInState.length - 1];
  if (!target) return null;

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

  // Session breakdown
  const sessionMap = new Map<
    string,
    { time: string; label: string; guests: Set<string>; items: number; breakdown: Record<string, number> }
  >();
  for (const a of dayAllocs) {
    let s = sessionMap.get(a.session_iso);
    if (!s) {
      const d = new Date(a.session_iso);
      const fullLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
        : a.session_date;
      s = {
        time: a.session_time_label,
        label: `${fullLabel} · ${a.session_time_label}`,
        guests: new Set(),
        items: 0,
        breakdown: {},
      };
      sessionMap.set(a.session_iso, s);
    }
    s.guests.add(a.buyer_email);
    s.items += 1;
    const label = a.menu_item_label;
    s.breakdown[label] = (s.breakdown[label] ?? 0) + 1;
  }
  const sessions = Array.from(sessionMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, s]) => ({
      time: s.time,
      label: s.label,
      guests: s.guests.size,
      items: s.items,
      breakdown: Object.entries(s.breakdown)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count),
    }));

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
    },
    item_totals,
    sessions,
    notes,
    vips,
  };
}
