import type {
  DateAggregate,
  FoodAllocation,
  MenuTotals,
  SessionAggregate,
} from "./types";

export function totalsByItem(allocations: FoodAllocation[]): MenuTotals {
  const t: MenuTotals = {};
  for (const a of allocations) {
    const id = a.menu_item_id ?? "__unknown__";
    t[id] = (t[id] ?? 0) + 1;
  }
  return t;
}

export function aggregateBySession(
  allocations: FoodAllocation[]
): SessionAggregate[] {
  const map = new Map<string, SessionAggregate>();
  for (const a of allocations) {
    let agg = map.get(a.session_iso);
    if (!agg) {
      const d = new Date(a.session_iso);
      const dateLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        : a.session_date;
      agg = {
        session_iso: a.session_iso,
        session_date: a.session_date,
        session_label: `${dateLabel} · ${a.session_time_label}`,
        totals: {},
        total_items: 0,
        group_count: 0,
      };
      map.set(a.session_iso, agg);
    }
    const id = a.menu_item_id ?? "__unknown__";
    agg.totals[id] = (agg.totals[id] ?? 0) + 1;
    agg.total_items += 1;
  }
  // Distinct buyer_email per session for group_count
  const groupKeys = new Map<string, Set<string>>();
  for (const a of allocations) {
    if (!groupKeys.has(a.session_iso)) groupKeys.set(a.session_iso, new Set());
    groupKeys.get(a.session_iso)!.add(a.buyer_email);
  }
  groupKeys.forEach((set, iso) => {
    const agg = map.get(iso);
    if (agg) agg.group_count = set.size;
  });
  return Array.from(map.values()).sort((a, b) =>
    a.session_iso.localeCompare(b.session_iso)
  );
}

export function aggregateByDate(
  sessions: SessionAggregate[]
): DateAggregate[] {
  const map = new Map<string, DateAggregate>();
  for (const s of sessions) {
    let d = map.get(s.session_date);
    if (!d) {
      const date = new Date(s.session_iso);
      const label = !isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        : s.session_date;
      d = {
        session_date: s.session_date,
        date_label: label,
        totals: {},
        total_items: 0,
        sessions: [],
      };
      map.set(s.session_date, d);
    }
    d.sessions.push(s);
    d.total_items += s.total_items;
    for (const [k, v] of Object.entries(s.totals)) {
      d.totals[k] = (d.totals[k] ?? 0) + v;
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.session_date.localeCompare(b.session_date)
  );
}
