import { aggregateByDate, aggregateBySession, totalsByItem } from "./aggregator";
import { parseCSV } from "./csv-parser";
import { groupOrders, normalizeAllocations } from "./normalizer";
import type { DashboardState } from "./types";
import { validate } from "./validator";

// Single entry point: raw CSV text -> fully populated DashboardState.
export function buildStateFromCsv(
  filename: string,
  csvText: string
): { state: DashboardState; warnings: string[] } {
  const { rows, warnings } = parseCSV(csvText);
  const allocations = normalizeAllocations(rows);
  const groups = groupOrders(allocations);
  const totals = totalsByItem(allocations);
  const by_session = aggregateBySession(allocations);
  const by_date = aggregateByDate(by_session);
  const findings = validate(allocations, groups);

  return {
    state: {
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
    },
    warnings,
  };
}
