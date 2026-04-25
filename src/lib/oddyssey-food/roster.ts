import ticketTypesRaw from "@/data/oddyssey-food/ticket_types.json";
import type { AssignmentsMap, GuestAssignment } from "./assignments";
import { assignmentKey } from "./assignments";
import type { DashboardState, FoodAllocation, OrderGroup, TicketType } from "./types";

const TICKET_TYPES = ticketTypesRaw as TicketType[];
const TICKET_BY_TYPE: Record<string, TicketType> = Object.fromEntries(
  TICKET_TYPES.map((t) => [t.package_type, t])
);

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
function groupIntoTickets(
  allocations: FoodAllocation[],
  assignment: GuestAssignment,
): BuiltTicket[] {
  // Priority 1: manual multi-type
  const manual = (assignment.package_types ?? []).filter((p) => p && p.count > 0);
  if (manual.length > 0) {
    const out: BuiltTicket[] = [];
    let cursor = 0;
    for (const p of manual) {
      const tt = TICKET_BY_TYPE[p.type];
      const perTicket = tt?.included_items ?? 1;
      const totalItems = perTicket * p.count;
      const slice = allocations.slice(cursor, cursor + totalItems);
      cursor += totalItems;
      // Generate `count` tickets of `perTicket` items each (last one may
      // be short if the slice ran out — preserves visibility of the gap).
      for (let i = 0; i < p.count; i++) {
        const ticketAllocs = slice.slice(i * perTicket, (i + 1) * perTicket);
        if (ticketAllocs.length === 0) break;
        out.push({ packageType: p.type, allocations: ticketAllocs });
      }
    }
    // Trailing allocations that didn't fit into the manual breakdown go
    // into single-item tickets so they're still visible on the sheet.
    if (cursor < allocations.length) {
      for (const a of allocations.slice(cursor)) {
        out.push({ packageType: undefined, allocations: [a] });
      }
    }
    return out;
  }

  // Priority 2: per-allocation derived
  const hasDerived = allocations.some((a) => a.derived_package_type);
  if (hasDerived) {
    // Preserve the order in which derived types first appear so tickets
    // come out in a predictable sequence.
    const order: string[] = [];
    const buckets = new Map<string, FoodAllocation[]>();
    for (const a of allocations) {
      const key = a.derived_package_type ?? "__none__";
      if (!buckets.has(key)) {
        buckets.set(key, []);
        order.push(key);
      }
      buckets.get(key)!.push(a);
    }
    const out: BuiltTicket[] = [];
    for (const key of order) {
      const allocs = buckets.get(key)!;
      const t = key === "__none__" ? undefined : key;
      out.push(...sliceByPerTicket(allocs, t));
    }
    return out;
  }

  // Priority 3 + 4: whole-guest type or none
  return sliceByPerTicket(allocations, assignment.package_type);
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
