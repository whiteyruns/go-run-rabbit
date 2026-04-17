import ticketTypesRaw from "@/data/oddyssey-food/ticket_types.json";
import type { AssignmentsMap } from "./assignments";
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

/**
 * Group a guest's food allocations into tickets based on their assigned
 * package_type. Each ticket gets N items (1 for Explorer, 3 for Dinner, etc.).
 * If no package_type is set, every food item becomes its own "ticket" (#).
 */
function groupIntoTickets(
  allocations: FoodAllocation[],
  packageType?: string
): FoodAllocation[][] {
  if (!packageType) {
    return allocations.map((a) => [a]);
  }
  const tt = TICKET_BY_TYPE[packageType];
  const perTicket = tt?.included_items ?? 1;
  if (perTicket <= 1) return allocations.map((a) => [a]);

  // Split sequentially: first N items = ticket 1, next N = ticket 2, etc.
  const tickets: FoodAllocation[][] = [];
  for (let i = 0; i < allocations.length; i += perTicket) {
    tickets.push(allocations.slice(i, i + perTicket));
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
      const tt = a.package_type ? TICKET_BY_TYPE[a.package_type] : undefined;

      const customerNote = g.customer_note ?? "";
      // VIP = Ultimate tier either from manual assignment or derived
      const isVip =
        a.package_type === "ultimate" ||
        (g.derived_package_types ?? []).includes("ultimate");
      // Walk-up = any allocation has ticket_state === "walkup"
      const isWalkup = g.allocations.some((al) => al.ticket_state === "walkup");

      // Sort within a guest: by raw ticket item order in CSV (stable already)
      const tickets = groupIntoTickets(g.allocations, a.package_type);
      const guestRowStart = rows.length;

      for (let ti = 0; ti < tickets.length; ti++) {
        const ticket = tickets[ti];
        ticketSeq += 1;
        currentBanding = currentBanding === "a" ? "b" : "a";

        for (let ii = 0; ii < ticket.length; ii++) {
          const alloc = ticket[ii];
          rows.push({
            location: a.location ?? "",
            ticket_number: ii === 0 ? ticketSeq : null,
            type_label: tt?.short_label ?? (a.package_type ? a.package_type.toUpperCase() : "—"),
            package_type: a.package_type ?? null,
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
