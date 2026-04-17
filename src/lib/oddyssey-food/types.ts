// Raw row from a Ticketure "Inclusions" CSV export.
// Each row = one redeemable food item per ticket.
export interface InclusionRow {
  event_name: string;
  session_time: string; // "2026-04-11 19:30:00"
  identity_name: string;
  identity_email: string;
  ticket_group_name: string; // "Inclusions"
  ticket_type_name: string; // The food item label
  admit_name: string;
  admit_email: string;
  scan_code: string;
  ticket_state: string; // "redeemed", etc.
  // identity_* metadata fields ignored — pass through if needed later
}

// Catalog entry (mocked SharePoint).
export interface MenuItem {
  id: string;
  label: string;
  aliases: string[]; // lowercased ticket_type_name variants that map to this item
  menu_groups: string[];
}

// Ticket package rule (mocked SharePoint).
export interface TicketType {
  ticket_sku: string;
  package_type: string;
  package_label: string;
  included_items: number;
  menu_group: string | null;
}

// Normalized food allocation — one per CSV row, joined to menu catalog.
export interface FoodAllocation {
  scan_code: string;
  guest_name: string;
  guest_email: string;
  buyer_name: string;
  buyer_email: string;
  session_iso: string; // "2026-04-11T19:30:00"
  session_date: string; // "2026-04-11"
  session_time_label: string; // "7:30 PM"
  raw_item_name: string;
  menu_item_id: string | null; // null = unknown item (validation error)
  menu_item_label: string;
  ticket_state: string;
}

// Order/group view — same buyer email + session = one party.
// We can't infer per-guest counts from this CSV alone (no per-guest ID),
// so we group by buyer+session and surface item counts at the group level.
export interface OrderGroup {
  buyer_email: string;
  buyer_name: string;
  session_iso: string;
  session_label: string; // "Sat Apr 11 · 7:30 PM"
  total_items: number;
  items_by_id: Record<string, number>;
  allocations: FoodAllocation[];

  // Populated when a ticket-purchase source is also loaded (v2 hook):
  package_type?: string;
  package_label?: string;
  expected_items_per_guest?: number;
  guest_count?: number;
}

// Aggregations
export type MenuTotals = Record<string, number>; // menu_item_id -> count

export interface SessionAggregate {
  session_iso: string;
  session_date: string;
  session_label: string; // "Saturday, April 11 · 7:30 PM"
  totals: MenuTotals;
  total_items: number;
  group_count: number; // distinct buyer_email
}

export interface DateAggregate {
  session_date: string;
  date_label: string; // "Saturday, April 11"
  totals: MenuTotals;
  total_items: number;
  sessions: SessionAggregate[];
}

// Validation
export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationFinding {
  id: string;
  severity: ValidationSeverity;
  type:
    | "unknown_item"
    | "unredeemed"
    | "low_count"
    | "high_count"
    | "package_mismatch"
    | "info";
  buyer_email?: string;
  buyer_name?: string;
  session_label?: string;
  message: string;
  details?: string;
}

// Top-level dashboard state — what gets persisted to localStorage.
export interface DashboardState {
  source: {
    filename: string;
    uploaded_at: string; // ISO
    row_count: number;
  };
  raw_rows: InclusionRow[];
  allocations: FoodAllocation[];
  groups: OrderGroup[];
  totals: MenuTotals;
  by_session: SessionAggregate[];
  by_date: DateAggregate[];
  findings: ValidationFinding[];
  // Hook: when a ticket-purchase source is added, this gets populated
  // and the validator runs strict per-package checks.
  ticket_purchase_source?: TicketPurchaseSource;
}

// Hook for the eventual second source.
// Shape is intentionally simple — a map from buyer_email+session to
// (package_type, guest_count). Build the loader in v2.
export interface TicketPurchaseSource {
  filename?: string;
  loaded_at?: string;
  rows: TicketPurchaseRow[];
}

export interface TicketPurchaseRow {
  buyer_email: string;
  session_iso: string;
  package_type: string; // matches TicketType.package_type
  quantity: number; // number of guests on this package
}
