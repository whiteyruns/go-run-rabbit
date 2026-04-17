import ticketTypesRaw from "@/data/oddyssey-food/ticket_types.json";
import type {
  FoodAllocation,
  OrderGroup,
  TicketPurchaseSource,
  TicketType,
  ValidationFinding,
} from "./types";

const TICKET_TYPES = ticketTypesRaw as TicketType[];

// v1 validator: works against just the inclusions CSV.
// Surfaces unknowns + per-group sanity checks. Strict per-package validation
// fires only when a ticket-purchase source is provided (v2 hook).
export function validate(
  allocations: FoodAllocation[],
  groups: OrderGroup[],
  ticketPurchaseSource?: TicketPurchaseSource
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // 1. Unknown items (couldn't match to catalog)
  const unknownByItem = new Map<string, FoodAllocation[]>();
  for (const a of allocations) {
    if (a.menu_item_id === null) {
      const arr = unknownByItem.get(a.raw_item_name) ?? [];
      arr.push(a);
      unknownByItem.set(a.raw_item_name, arr);
    }
  }
  unknownByItem.forEach((arr, name) => {
    findings.push({
      id: `unknown:${name}`,
      severity: "error",
      type: "unknown_item",
      message: `${arr.length} row${arr.length === 1 ? "" : "s"} reference an unrecognized item: "${name}"`,
      details:
        "Add this label to /src/data/oddyssey-food/menu_items.json (as the item label or an alias).",
    });
  });

  // 2. Unredeemed tickets (info — useful for kitchen prep planning)
  const unredeemed = allocations.filter(
    (a) => a.ticket_state && a.ticket_state.toLowerCase() !== "redeemed"
  );
  if (unredeemed.length > 0) {
    findings.push({
      id: "unredeemed-summary",
      severity: "info",
      type: "info",
      message: `${unredeemed.length} ticket${unredeemed.length === 1 ? " is" : "s are"} not in "redeemed" state`,
      details: "Counts include all tickets regardless of state. Filter on Kitchen page if you only want redeemed.",
    });
  }

  // 3. Per-group sanity check (v1 — without package data we can only flag extremes)
  for (const g of groups) {
    if (g.total_items === 0) {
      findings.push({
        id: `empty:${g.buyer_email}:${g.session_iso}`,
        severity: "warning",
        type: "low_count",
        buyer_email: g.buyer_email,
        buyer_name: g.buyer_name,
        session_label: g.session_label,
        message: `${g.buyer_name || g.buyer_email} has 0 items for ${g.session_label}`,
      });
    }
  }

  // 4. STRICT validation — only when ticket-purchase source is loaded.
  // This is the hook to add the second data source: it should populate
  // each OrderGroup's package_type / expected_items_per_guest / guest_count
  // (do that in a separate step that merges the two sources, then call this).
  if (ticketPurchaseSource) {
    for (const g of groups) {
      if (!g.package_type || g.expected_items_per_guest == null || !g.guest_count) {
        findings.push({
          id: `unmatched:${g.buyer_email}:${g.session_iso}`,
          severity: "warning",
          type: "package_mismatch",
          buyer_email: g.buyer_email,
          buyer_name: g.buyer_name,
          session_label: g.session_label,
          message: `${g.buyer_name || g.buyer_email}: no matching ticket purchase found for ${g.session_label}`,
        });
        continue;
      }
      const expected = g.expected_items_per_guest * g.guest_count;
      if (g.total_items !== expected) {
        const sev: "warning" | "error" =
          g.total_items < expected ? "error" : "warning";
        findings.push({
          id: `mismatch:${g.buyer_email}:${g.session_iso}`,
          severity: sev,
          type: g.total_items < expected ? "low_count" : "high_count",
          buyer_email: g.buyer_email,
          buyer_name: g.buyer_name,
          session_label: g.session_label,
          message: `${g.buyer_name || g.buyer_email} (${g.package_label ?? g.package_type}, ${g.guest_count} guest${g.guest_count === 1 ? "" : "s"}): expected ${expected} items, got ${g.total_items}`,
        });
      }
    }
  } else {
    findings.push({
      id: "no-purchase-source",
      severity: "info",
      type: "info",
      message: "Strict per-package validation is disabled.",
      details:
        "Upload a ticket-purchase source to enable checks like 'Dinner Guest must select 3 items'. Until then, only structural checks (unknown items, empty groups) run.",
    });
  }

  return findings;
}

export function getTicketTypes(): TicketType[] {
  return TICKET_TYPES;
}
