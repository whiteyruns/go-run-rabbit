import type { FoodAllocation, OrderGroup } from "./types";
import { getMenuCatalog } from "./normalizer";
import { getTicketTypes } from "./roster";

const KEY = "oddyssey-food-walkups-v1";

// A walk-up is a guest added manually after the CSV lock (e.g. at the door).
export interface Walkup {
  id: string;
  created_at: string; // ISO
  session_iso: string; // "2026-04-17T19:30:00"
  buyer_name: string;
  buyer_email: string;
  package_type: string; // matches TicketType.package_type
  location?: string;
  items: string[]; // menu_item_ids
  note?: string;
}

export function loadWalkups(): Walkup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Walkup[]) : [];
  } catch {
    return [];
  }
}

export function saveWalkups(list: Walkup[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addWalkup(w: Walkup): Walkup[] {
  const list = loadWalkups();
  list.push(w);
  saveWalkups(list);
  return list;
}

export function removeWalkup(id: string): Walkup[] {
  const list = loadWalkups().filter((w) => w.id !== id);
  saveWalkups(list);
  return list;
}

export function newWalkupId(): string {
  return `W${Date.now().toString(36).toUpperCase()}`;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function sessionLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${day} · ${timeLabel(iso)}`;
}

// Synthesize food allocations for a walk-up: one per selected item.
export function walkupToAllocations(w: Walkup): FoodAllocation[] {
  const catalog = getMenuCatalog();
  const ticketTypes = getTicketTypes();
  const tt = ticketTypes.find((t) => t.package_type === w.package_type);
  return w.items.map((menuId, i) => {
    const item = catalog.find((c) => c.id === menuId);
    return {
      scan_code: `WALKUP-${w.id}-${i}`,
      guest_name: w.buyer_name,
      guest_email: w.buyer_email,
      buyer_name: w.buyer_name,
      buyer_email: w.buyer_email,
      session_iso: w.session_iso,
      session_date: w.session_iso.slice(0, 10),
      session_time_label: timeLabel(w.session_iso),
      raw_item_name: menuId,
      menu_item_id: item?.id ?? null,
      menu_item_label: item?.label ?? menuId,
      ticket_state: "walkup",
      parent_scan_code: `WALKUP-${w.id}-TICKET`,
      derived_package_type: w.package_type,
      derived_package_label: tt?.short_label,
    };
  });
}

// Group for a walk-up — mirrors groupOrders' output shape.
export function walkupToGroup(w: Walkup): OrderGroup {
  const allocs = walkupToAllocations(w);
  const items_by_id: Record<string, number> = {};
  for (const a of allocs) {
    const id = a.menu_item_id ?? "__unknown__";
    items_by_id[id] = (items_by_id[id] ?? 0) + 1;
  }
  return {
    buyer_email: w.buyer_email,
    buyer_name: w.buyer_name,
    session_iso: w.session_iso,
    session_label: sessionLabel(w.session_iso),
    total_items: allocs.length,
    items_by_id,
    allocations: allocs,
    derived_package_types: [w.package_type],
    derived_party_size: 1, // walkups = 1 person for party-size purposes
    customer_note: w.note || undefined,
  };
}
