import { aggregateByDate, aggregateBySession, totalsByItem } from "./aggregator";
import {
  assignmentKey,
  loadAssignments,
  saveAssignments,
  suggestLocation,
  type AssignmentsMap,
} from "./assignments";
import { parseCSV } from "./csv-parser";
import { groupOrders, normalizeFull } from "./normalizer";
import { loadState } from "./storage";
import type { DashboardState, OrderGroup } from "./types";
import { validate } from "./validator";
import { loadWalkups, walkupToGroup } from "./walkups";

export interface AutoAssignmentSummary {
  types_assigned: number;
  locations_assigned: number;
  skipped_existing: number;
  group_total: number;
  detected_packages: Record<string, number>; // package_type -> count of groups
}

/**
 * For each order group with a single derived package_type, set the TYPE
 * assignment (if not already manually set). Suggest a LOCATION based on
 * party size and the rule set, skipping any already-assigned guest and
 * tracking which HI BOYs / BOUDOIR slots are taken per session.
 */
export function autoAssignFromGroups(
  groups: OrderGroup[]
): { map: AssignmentsMap; summary: AutoAssignmentSummary } {
  const map = loadAssignments();
  const summary: AutoAssignmentSummary = {
    types_assigned: 0,
    locations_assigned: 0,
    skipped_existing: 0,
    group_total: groups.length,
    detected_packages: {},
  };

  // Per-session: track locations already taken so we don't double-book HI BOYs
  const takenBySession = new Map<string, Set<string>>();
  for (const g of groups) {
    const k = assignmentKey(g.buyer_email, g.session_iso);
    const existing = map[k];
    if (existing?.location) {
      if (!takenBySession.has(g.session_iso)) takenBySession.set(g.session_iso, new Set());
      takenBySession.get(g.session_iso)!.add(existing.location);
    }
  }

  for (const g of groups) {
    const k = assignmentKey(g.buyer_email, g.session_iso);
    const existing = map[k] ?? {};

    // Track detected packages summary (only when unambiguous)
    if (g.derived_package_types && g.derived_package_types.length === 1) {
      const t = g.derived_package_types[0];
      summary.detected_packages[t] = (summary.detected_packages[t] ?? 0) + 1;
    }

    let patched = false;

    // TYPE: only auto-fill if not already set AND group has a single type
    if (!existing.package_type && g.derived_package_types?.length === 1) {
      existing.package_type = g.derived_package_types[0];
      summary.types_assigned += 1;
      patched = true;
    } else if (existing.package_type) {
      summary.skipped_existing += 1;
    }

    // LOCATION: only auto-fill if not already set AND we know party size
    if (!existing.location && g.derived_party_size) {
      const taken = takenBySession.get(g.session_iso) ?? new Set<string>();
      const suggestion = suggestLocation(g.derived_party_size, taken);
      if (suggestion) {
        existing.location = suggestion;
        taken.add(suggestion);
        takenBySession.set(g.session_iso, taken);
        summary.locations_assigned += 1;
        patched = true;
      }
    }

    if (patched) map[k] = existing;
  }

  saveAssignments(map);
  return { map, summary };
}

// Single entry point: raw CSV text -> fully populated DashboardState.
export function buildStateFromCsv(
  filename: string,
  csvText: string
): {
  state: DashboardState;
  warnings: string[];
  autoAssign?: AutoAssignmentSummary;
} {
  const { rows, warnings } = parseCSV(csvText);
  const { allocations, admissions, customerNotes } = normalizeFull(rows);
  const hasAdmissions = admissions.byScanCode.size > 0;

  const groups = groupOrders(
    allocations,
    hasAdmissions ? admissions.byGroup : undefined,
    customerNotes
  );
  const totals = totalsByItem(allocations);
  const by_session = aggregateBySession(allocations);
  const by_date = aggregateByDate(by_session);
  const findings = validate(allocations, groups);

  const state: DashboardState = {
    source: {
      filename,
      uploaded_at: new Date().toISOString(),
      row_count: rows.length,
    },
    raw_rows: rows,
    allocations,
    groups,
    totals,
    by_session,
    by_date,
    findings,
  };

  // If this is a full attendees export (has admission rows), auto-populate
  // TYPE + LOCATION for groups that haven't been manually assigned yet.
  let autoAssign: AutoAssignmentSummary | undefined;
  if (hasAdmissions) {
    autoAssign = autoAssignFromGroups(groups).summary;
  }

  return { state, warnings, autoAssign };
}

/**
 * Load persisted state and overlay any walk-ups on top. Walk-ups live in
 * their own localStorage key so they survive CSV re-uploads. Re-runs the
 * aggregator so totals / session breakdowns include walk-ups.
 */
export function loadStateWithWalkups(): DashboardState | null {
  const base = loadState();
  const walkups = loadWalkups();
  if (walkups.length === 0) return base;

  const walkupGroups = walkups.map((w) => walkupToGroup(w));
  const walkupAllocations = walkupGroups.flatMap((g) => g.allocations);

  if (!base) {
    // No CSV yet — synthesize a minimal state from walk-ups alone so the
    // roster still renders.
    const allocations = walkupAllocations;
    const groups = walkupGroups;
    const totals = totalsByItem(allocations);
    const by_session = aggregateBySession(allocations);
    const by_date = aggregateByDate(by_session);
    return {
      source: {
        filename: "(walk-ups only)",
        uploaded_at: new Date().toISOString(),
        row_count: 0,
      },
      raw_rows: [],
      allocations,
      groups,
      totals,
      by_session,
      by_date,
      findings: [],
    };
  }

  // Merge walk-ups into existing groups. Same buyer+session = append,
  // otherwise add a new group.
  const keyFor = (g: OrderGroup) => `${g.buyer_email}::${g.session_iso}`;
  const groupMap = new Map<string, OrderGroup>();
  for (const g of base.groups) groupMap.set(keyFor(g), { ...g });

  for (const wg of walkupGroups) {
    const k = keyFor(wg);
    const existing = groupMap.get(k);
    if (existing) {
      existing.allocations = [...existing.allocations, ...wg.allocations];
      existing.total_items += wg.total_items;
      for (const [id, count] of Object.entries(wg.items_by_id)) {
        existing.items_by_id[id] = (existing.items_by_id[id] ?? 0) + count;
      }
      // If the walk-up declares a known package type and the group didn't
      // already carry it, add it.
      if (!existing.derived_package_types) existing.derived_package_types = [];
      for (const t of wg.derived_package_types ?? []) {
        if (!existing.derived_package_types.includes(t)) existing.derived_package_types.push(t);
      }
      if (wg.customer_note && !existing.customer_note) existing.customer_note = wg.customer_note;
    } else {
      groupMap.set(k, wg);
    }
  }

  const mergedGroups = Array.from(groupMap.values()).sort((a, b) =>
    a.session_iso.localeCompare(b.session_iso) ||
    a.buyer_email.localeCompare(b.buyer_email)
  );
  const mergedAllocations = [...base.allocations, ...walkupAllocations];
  const totals = totalsByItem(mergedAllocations);
  const by_session = aggregateBySession(mergedAllocations);
  const by_date = aggregateByDate(by_session);

  return {
    ...base,
    allocations: mergedAllocations,
    groups: mergedGroups,
    totals,
    by_session,
    by_date,
  };
}
