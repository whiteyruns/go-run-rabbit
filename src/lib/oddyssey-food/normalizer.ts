import menuItemsRaw from "@/data/oddyssey-food/menu_items.json";
import ticketTypesRaw from "@/data/oddyssey-food/ticket_types.json";
import type {
  FoodAllocation,
  InclusionRow,
  MenuItem,
  OrderGroup,
  TicketType,
} from "./types";

const MENU_ITEMS = menuItemsRaw as MenuItem[];
const TICKET_TYPES = ticketTypesRaw as TicketType[];

// Group-name lookup from Ticketure's `ticket_group_name` → our internal type
const GROUP_TO_TYPE: Map<string, TicketType> = (() => {
  const m = new Map<string, TicketType>();
  for (const t of TICKET_TYPES) {
    m.set(t.ticket_group_name.toLowerCase(), t);
  }
  return m;
})();

// Build a lookup from any alias (lowercased) -> menu item.
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

export interface AdmissionEntry {
  type: TicketType;
  scan_code: string;
  buyer_email: string;
  buyer_name: string;
  session_iso: string;
}

export interface AdmissionIndex {
  // scan_code -> package_type
  byScanCode: Map<string, TicketType>;
  // buyer_email::session_iso -> admission entries (for counting party size)
  byGroup: Map<string, AdmissionEntry[]>;
}

/**
 * Build an index of admission rows (non-Inclusions). Each admission row
 * represents one purchased ticket. The scan_code is what Inclusion rows
 * reference in their admit_name column.
 */
function indexAdmissions(rows: InclusionRow[]): AdmissionIndex {
  const byScanCode = new Map<string, TicketType>();
  const byGroup = new Map<string, AdmissionEntry[]>();

  for (const r of rows) {
    const gn = r.ticket_group_name?.trim().toLowerCase();
    if (!gn || gn === "inclusions") continue;
    const tt = GROUP_TO_TYPE.get(gn);
    if (!tt) continue; // Unknown group (e.g. VIP Admission, Employee) — skip
    if (!r.scan_code) continue;
    byScanCode.set(r.scan_code, tt);

    const session = parseSession(r.session_time);
    const key = `${r.identity_email}::${session.iso}`;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push({
      type: tt,
      scan_code: r.scan_code,
      buyer_email: r.identity_email,
      buyer_name: r.identity_name,
      session_iso: session.iso,
    });
  }

  return { byScanCode, byGroup };
}

/**
 * Convert raw Inclusions rows into FoodAllocation records, enriching with
 * the parent admission's package_type when the CSV also contains admission
 * rows (the "All Ticket Groups" export). Falls back to no enrichment if
 * the CSV is Inclusions-only.
 */
export function normalizeAllocations(rows: InclusionRow[]): FoodAllocation[] {
  const admissions = indexAdmissions(rows);
  return rows
    .filter((r) => r.ticket_group_name?.toLowerCase() === "inclusions")
    .map((r) => {
      const session = parseSession(r.session_time);
      const matched = matchMenuItem(r.ticket_type_name);
      const parentScan = r.admit_name || undefined;
      const parentType = parentScan
        ? admissions.byScanCode.get(parentScan)
        : undefined;
      return {
        scan_code: r.scan_code,
        guest_name: r.admit_name || r.identity_name, // admit_name is actually a scan code, but preserve raw
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
        parent_scan_code: parentScan,
        derived_package_type: parentType?.package_type,
        derived_package_label: parentType?.short_label,
      };
    });
}

// Group allocations into order/party groups: same buyer_email + session.
export function groupOrders(
  allocations: FoodAllocation[],
  admissionsByGroup?: Map<string, AdmissionEntry[]>
): OrderGroup[] {
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

  // If we have admission data, enrich groups with party size + package types
  if (admissionsByGroup) {
    admissionsByGroup.forEach((admissions, key) => {
      const g = map.get(key);
      if (!g) return;
      const types = new Set<string>();
      for (const a of admissions) types.add(a.type.package_type);
      g.derived_package_types = Array.from(types);
      g.derived_party_size = admissions.length;
    });

    // Also include admission-only groups (e.g. General Admission parties with no food)
    // so Location assignment can see them.
    admissionsByGroup.forEach((admissions, key) => {
      if (map.has(key)) return;
      const first = admissions[0];
      const session = parseSession(first.session_iso.replace("T", " "));
      const types = new Set(admissions.map((a) => a.type.package_type));
      map.set(key, {
        buyer_email: first.buyer_email,
        buyer_name: first.buyer_name,
        session_iso: first.session_iso,
        session_label: session.fullLabel,
        total_items: 0,
        items_by_id: {},
        allocations: [],
        derived_package_types: Array.from(types),
        derived_party_size: admissions.length,
      });
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.session_iso.localeCompare(b.session_iso) ||
    a.buyer_email.localeCompare(b.buyer_email)
  );
}

// Exposes admissionsByGroup for build-state to enrich groups + auto-assign.
export function normalizeFull(rows: InclusionRow[]): {
  allocations: FoodAllocation[];
  admissions: AdmissionIndex;
} {
  const admissions = indexAdmissions(rows);
  const allocations = normalizeAllocations(rows);
  return { allocations, admissions };
}

export function getMenuCatalog(): MenuItem[] {
  return MENU_ITEMS;
}
