import ticketTypesRaw from "@/data/oddyssey-food/ticket_types.json";
import menuItemsRaw from "@/data/oddyssey-food/menu_items.json";
import type { AssignmentsMap, GuestAssignment } from "./assignments";
import { assignmentKey } from "./assignments";
import type { DashboardState, FoodAllocation, MenuItem, OrderGroup, TicketType } from "./types";

const TICKET_TYPES = ticketTypesRaw as TicketType[];
const TICKET_BY_TYPE: Record<string, TicketType> = Object.fromEntries(
  TICKET_TYPES.map((t) => [t.package_type, t])
);

const MENU_ITEMS = menuItemsRaw as MenuItem[];
const DELIVERY_ORDER_BY_ID: Record<string, number> = Object.fromEntries(
  MENU_ITEMS.map((m) => [m.id, m.delivery_order ?? 99])
);

// Stable sort allocations by course/delivery order. Unknown items sink
// to the end. Ties preserve original CSV order so we don't reshuffle
// duplicates needlessly.
function sortByDelivery(allocations: FoodAllocation[]): FoodAllocation[] {
  return allocations
    .map((a, i) => ({ a, i, ord: DELIVERY_ORDER_BY_ID[a.menu_item_id ?? ""] ?? 99 }))
    .sort((x, y) => x.ord - y.ord || x.i - y.i)
    .map((x) => x.a);
}

// One physical row on the roster sheet.
export interface RosterRow {
  // Core display
  location: string; // "" if unassigned
  ticket_number: number | null; // null for continuation rows (multi-item ticket)
  type_label: string; // "EXPLORER", "DINNER", or "—"
  package_type: string | null;
  time_label: string; // "6:30 PM"
  name: string;
  food: string;
  email: string;

  // Guest-level flags (populated on every row of a guest for easy access)
  customer_note: string; // allergy / dietary / request text, empty if none
  is_vip: boolean; // Ultimate Party Guest tier
  is_walkup: boolean; // manually added (not from Ticketure CSV)

  // Row styling hints for the renderer
  banding: "a" | "b"; // alternating per ticket
  is_guest_first: boolean; // first row of a new guest (email change)
  is_guest_last: boolean; // last row of a guest
  is_ticket_first: boolean; // first row of a new ticket

  // Identity (for editing)
  buyer_email: string;
  session_iso: string;
  // Ticket index within this guest (0-based). Lets the drag-and-drop
  // editor key its persisted item-order override.
  ticket_index_in_guest: number;
  // Ordered scan_codes of every allocation in this row's ticket — used
  // by the drop handler to compute the new order without re-scanning
  // the section.
  ticket_scan_codes: string[];
  scan_code: string;
}

export interface RosterSection {
  session_date: string; // "2026-04-12"
  date_header: string; // "MANOR SUNDAY APRIL 12TH"
  totals: { id: string; label: string; count: number }[];
  rows: RosterRow[];
  total_items: number;
}

// ORDINAL suffix for date header ("12TH", "1ST", "2ND", etc.)
function ordinal(n: number): string {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDateHeader(sessionDate: string): string {
  const d = new Date(sessionDate + "T00:00:00");
  if (isNaN(d.getTime())) return `MANOR · ${sessionDate}`;
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  return `MANOR ${weekday} ${month} ${ordinal(d.getDate())}`;
}

// One ticket on the roster — its allocations and the package type those
// allocations belong to (so the row builder can label TYPE per ticket
// instead of per guest).
interface BuiltTicket {
  packageType: string | undefined;
  allocations: FoodAllocation[];
}

function sliceByPerTicket(
  allocations: FoodAllocation[],
  packageType: string | undefined,
): BuiltTicket[] {
  const tt = packageType ? TICKET_BY_TYPE[packageType] : undefined;
  const perTicket = tt?.included_items ?? 1;
  if (perTicket <= 1) {
    return allocations.map((a) => ({ packageType, allocations: [a] }));
  }
  const out: BuiltTicket[] = [];
  for (let i = 0; i < allocations.length; i += perTicket) {
    out.push({ packageType, allocations: allocations.slice(i, i + perTicket) });
  }
  return out;
}

/**
 * Group a guest's food allocations into tickets. Resolution priority:
 *   1. Manual `assignment.package_types` — explicit list of {type, count}.
 *      Slice allocations sequentially: type X for first count×included
 *      items, then type Y, etc. This handles the multi-experience case
 *      (Amanda books 1 Dinner Guest + 5 Explorers).
 *   2. Per-allocation `derived_package_type` (set during normalization
 *      from the parent admission rows). Bucket allocations by their own
 *      derived type, then slice each bucket by `included_items`.
 *   3. Legacy whole-guest `assignment.package_type` — single type for
 *      every allocation.
 *   4. None — each allocation becomes its own one-item ticket.
 */
// Apply a saved per-ticket scan_code order. Items listed in `order` come
// out in that order; any allocation whose scan_code isn't in the list
// (e.g., if the ticket changed shape after the override was saved) gets
// appended in its original (delivery) order so nothing disappears.
function applyItemOrder(
  allocs: FoodAllocation[],
  order: string[] | undefined,
): FoodAllocation[] {
  if (!order || order.length === 0) return allocs;
  const byScan = new Map(allocs.map((a) => [a.scan_code, a]));
  const seen = new Set<string>();
  const out: FoodAllocation[] = [];
  for (const sc of order) {
    const a = byScan.get(sc);
    if (a && !seen.has(sc)) {
      out.push(a);
      seen.add(sc);
    }
  }
  for (const a of allocs) {
    if (!seen.has(a.scan_code)) out.push(a);
  }
  return out;
}

function groupIntoTickets(
  rawAllocations: FoodAllocation[],
  assignment: GuestAssignment,
): BuiltTicket[] {
  // CRITICAL: do NOT pre-sort across all allocations — that breaks
  // ticket pairings for guests with multiple tickets of the same type
  // (e.g., 3 Dinners produce [Char,Char,Char], [Shrimp,Shrimp,Shrimp]
  // when sliced after a global sort). Keep CSV order until we've
  // grouped into tickets, then sort within each ticket below.

  let tickets: BuiltTicket[];
  // Priority 1: explicit manual override
  const manual = (assignment.package_types ?? []).filter((p) => p && p.count > 0);
  // Priority 2 (preferred when available): bucket by parent_scan_code,
  // which Ticketure's full attendees CSV populates per inclusion.
  // Each parent_scan_code = one admission ticket, so each bucket is
  // exactly one ticket's items.
  const hasParents = !manual.length && rawAllocations.some((a) => a.parent_scan_code);

  if (manual.length > 0) {
    tickets = [];
    let cursor = 0;
    for (const p of manual) {
      const tt = TICKET_BY_TYPE[p.type];
      const perTicket = tt?.included_items ?? 1;
      const totalItems = perTicket * p.count;
      const slice = rawAllocations.slice(cursor, cursor + totalItems);
      cursor += totalItems;
      for (let i = 0; i < p.count; i++) {
        const ticketAllocs = slice.slice(i * perTicket, (i + 1) * perTicket);
        if (ticketAllocs.length === 0) break;
        tickets.push({ packageType: p.type, allocations: ticketAllocs });
      }
    }
    if (cursor < rawAllocations.length) {
      for (const a of rawAllocations.slice(cursor)) {
        tickets.push({ packageType: undefined, allocations: [a] });
      }
    }
  } else if (hasParents) {
    // Group by parent_scan_code in first-seen order (preserves a
    // predictable ticket sequence). Items without a parent_scan_code
    // fall to the end as their own one-item tickets.
    const parentOrder: string[] = [];
    const buckets = new Map<string, FoodAllocation[]>();
    const orphans: FoodAllocation[] = [];
    for (const a of rawAllocations) {
      const p = a.parent_scan_code;
      if (!p) { orphans.push(a); continue; }
      if (!buckets.has(p)) { buckets.set(p, []); parentOrder.push(p); }
      buckets.get(p)!.push(a);
    }
    tickets = [];
    for (const p of parentOrder) {
      const allocs = buckets.get(p)!;
      const pkgType = allocs[0]?.derived_package_type;
      tickets.push({ packageType: pkgType, allocations: allocs });
    }
    for (const o of orphans) {
      tickets.push({ packageType: o.derived_package_type, allocations: [o] });
    }
  } else if (rawAllocations.some((a) => a.derived_package_type)) {
    // Fallback: bucket by derived type and slice by included_items.
    // Used when derived_package_type is set but parent_scan_code isn't
    // (rare — older CSV exports).
    const order: string[] = [];
    const buckets = new Map<string, FoodAllocation[]>();
    for (const a of rawAllocations) {
      const key = a.derived_package_type ?? "__none__";
      if (!buckets.has(key)) { buckets.set(key, []); order.push(key); }
      buckets.get(key)!.push(a);
    }
    tickets = [];
    for (const key of order) {
      const t = key === "__none__" ? undefined : key;
      tickets.push(...sliceByPerTicket(buckets.get(key)!, t));
    }
  } else {
    // Priority 4: whole-guest single type or none — slice CSV order.
    tickets = sliceByPerTicket(rawAllocations, assignment.package_type);
  }

  // Sort items WITHIN each ticket by course delivery order (Charcuterie
  // → Shrimp → Short Ribs → Ube). Done after slicing so ticket pairings
  // are preserved.
  tickets = tickets.map((t) => ({ ...t, allocations: sortByDelivery(t.allocations) }));

  // Apply per-ticket item-order overrides last so a saved drag-and-drop
  // arrangement survives across renders. Keyed by 0-based ticket index
  // within this guest's tickets list.
  const overrides = assignment.itemOrder;
  if (overrides) {
    for (let i = 0; i < tickets.length; i++) {
      const o = overrides[String(i)];
      if (o && o.length > 0) {
        tickets[i] = { ...tickets[i], allocations: applyItemOrder(tickets[i].allocations, o) };
      }
    }
  }
  return tickets;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Build per-date roster sections. Orders within a date are sorted by
 * session time, then by buyer name.
 */
export function buildRoster(
  state: DashboardState,
  assignments: AssignmentsMap
): RosterSection[] {
  // Group order-groups by date
  const byDate = new Map<string, OrderGroup[]>();
  for (const g of state.groups) {
    const date = g.session_iso.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(g);
  }

  const sections: RosterSection[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const date of sortedDates) {
    const groups = byDate.get(date)!;
    // Sort by session time, then buyer name
    groups.sort((a, b) => {
      const t = a.session_iso.localeCompare(b.session_iso);
      if (t !== 0) return t;
      return (a.buyer_name || a.buyer_email).localeCompare(b.buyer_name || b.buyer_email);
    });

    // Per-date totals
    const dateTotals: Record<string, number> = {};
    for (const g of groups) {
      for (const a of g.allocations) {
        const id = a.menu_item_id ?? "__unknown__";
        dateTotals[id] = (dateTotals[id] ?? 0) + 1;
      }
    }
    // Use catalog order via normalizer in the component; here we pass id+count
    const totals = Object.entries(dateTotals).map(([id, count]) => ({
      id,
      label: id, // will be replaced by component that has menu catalog
      count,
    }));

    const rows: RosterRow[] = [];
    let ticketSeq = 0;
    let currentBanding: "a" | "b" = "b"; // first ticket will flip to 'a'

    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      const key = assignmentKey(g.buyer_email, g.session_iso);
      const a = assignments[key] ?? {};

      const customerNote = g.customer_note ?? "";
      // VIP = Ultimate tier from any source: manual whole-guest, manual
      // multi-type list, or derived from CSV.
      const manualTypes = (a.package_types ?? []).map((p) => p.type);
      const isVip =
        a.package_type === "ultimate" ||
        manualTypes.includes("ultimate") ||
        (g.derived_package_types ?? []).includes("ultimate");
      // Walk-up = any allocation has ticket_state === "walkup"
      const isWalkup = g.allocations.some((al) => al.ticket_state === "walkup");

      // Sort within a guest: by raw ticket item order in CSV (stable already)
      const tickets = groupIntoTickets(g.allocations, a);
      const guestRowStart = rows.length;

      for (let ti = 0; ti < tickets.length; ti++) {
        const ticket = tickets[ti];
        ticketSeq += 1;
        currentBanding = currentBanding === "a" ? "b" : "a";

        const ticketTT = ticket.packageType ? TICKET_BY_TYPE[ticket.packageType] : undefined;
        const ticketTypeLabel =
          ticketTT?.short_label ??
          (ticket.packageType ? ticket.packageType.toUpperCase() : "—");

        const ticketScanCodes = ticket.allocations.map((al) => al.scan_code);
        for (let ii = 0; ii < ticket.allocations.length; ii++) {
          const alloc = ticket.allocations[ii];
          rows.push({
            location: a.location ?? "",
            ticket_number: ii === 0 ? ticketSeq : null,
            type_label: ticketTypeLabel,
            package_type: ticket.packageType ?? null,
            time_label: timeLabel(alloc.session_iso),
            name: alloc.buyer_name,
            food: alloc.menu_item_label,
            email: alloc.buyer_email,
            customer_note: customerNote,
            is_vip: isVip,
            is_walkup: isWalkup,
            banding: currentBanding,
            is_guest_first: rows.length === guestRowStart && ii === 0 && ti === 0,
            is_guest_last: false, // fixed up below
            is_ticket_first: ii === 0,
            buyer_email: g.buyer_email,
            session_iso: g.session_iso,
            scan_code: alloc.scan_code,
            ticket_index_in_guest: ti,
            ticket_scan_codes: ticketScanCodes,
          });
        }
      }

      if (rows.length > 0) rows[rows.length - 1].is_guest_last = true;
    }

    sections.push({
      session_date: date,
      date_header: formatDateHeader(date),
      totals,
      rows,
      total_items: rows.length,
    });
  }

  return sections;
}

export function getTicketTypes(): TicketType[] {
  return TICKET_TYPES;
}
