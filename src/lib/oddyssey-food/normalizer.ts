import menuItemsRaw from "@/data/oddyssey-food/menu_items.json";
import type { FoodAllocation, InclusionRow, MenuItem, OrderGroup } from "./types";

const MENU_ITEMS = menuItemsRaw as MenuItem[];

// Build a lookup from any alias (lowercased) -> menu item id.
const ALIAS_INDEX: Map<string, MenuItem> = (() => {
  const m = new Map<string, MenuItem>();
  for (const item of MENU_ITEMS) {
    m.set(item.label.toLowerCase(), item);
    for (const alias of item.aliases) m.set(alias.toLowerCase(), item);
  }
  return m;
})();

function matchMenuItem(rawName: string): MenuItem | null {
  const key = rawName.trim().toLowerCase();
  if (!key) return null;
  if (ALIAS_INDEX.has(key)) return ALIAS_INDEX.get(key)!;
  // Loose contains match as fallback
  let found: MenuItem | null = null;
  ALIAS_INDEX.forEach((item, alias) => {
    if (!found && (key.includes(alias) || alias.includes(key))) found = item;
  });
  return found;
}

function parseSession(sessionTime: string): {
  iso: string;
  date: string;
  timeLabel: string;
  fullLabel: string;
} {
  // Input: "2026-04-11 19:30:00" — treat as local time.
  const iso = sessionTime.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return {
      iso: sessionTime,
      date: sessionTime.slice(0, 10),
      timeLabel: sessionTime.slice(11, 16),
      fullLabel: sessionTime,
    };
  }
  const date = sessionTime.slice(0, 10);
  const timeLabel = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const fullLabel = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return { iso, date, timeLabel, fullLabel: `${fullLabel} · ${timeLabel}` };
}

export function normalizeAllocations(rows: InclusionRow[]): FoodAllocation[] {
  return rows
    .filter((r) => r.ticket_group_name?.toLowerCase() === "inclusions")
    .map((r) => {
      const session = parseSession(r.session_time);
      const matched = matchMenuItem(r.ticket_type_name);
      return {
        scan_code: r.scan_code,
        guest_name: r.admit_name || r.identity_name,
        guest_email: r.admit_email || r.identity_email,
        buyer_name: r.identity_name,
        buyer_email: r.identity_email,
        session_iso: session.iso,
        session_date: session.date,
        session_time_label: session.timeLabel,
        raw_item_name: r.ticket_type_name,
        menu_item_id: matched?.id ?? null,
        menu_item_label: matched?.label ?? r.ticket_type_name,
        ticket_state: r.ticket_state,
      };
    });
}

// Group allocations into order/party groups: same buyer_email + same session.
export function groupOrders(allocations: FoodAllocation[]): OrderGroup[] {
  const map = new Map<string, OrderGroup>();
  for (const a of allocations) {
    const key = `${a.buyer_email}::${a.session_iso}`;
    let g = map.get(key);
    if (!g) {
      const session = parseSession(a.session_iso.replace("T", " "));
      g = {
        buyer_email: a.buyer_email,
        buyer_name: a.buyer_name,
        session_iso: a.session_iso,
        session_label: session.fullLabel,
        total_items: 0,
        items_by_id: {},
        allocations: [],
      };
      map.set(key, g);
    }
    g.allocations.push(a);
    g.total_items += 1;
    const id = a.menu_item_id ?? "__unknown__";
    g.items_by_id[id] = (g.items_by_id[id] ?? 0) + 1;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.session_iso.localeCompare(b.session_iso) ||
    a.buyer_email.localeCompare(b.buyer_email)
  );
}

export function getMenuCatalog(): MenuItem[] {
  return MENU_ITEMS;
}
