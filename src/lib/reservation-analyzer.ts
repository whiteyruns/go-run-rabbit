// ============================================================================
// Reservation data analyzer
// ============================================================================

import type { CSVRow } from "./csv-parser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VenueReservation {
  name: string;
  res: number;
  covers: number;
  noShows: number;
  avgSpend: number;
  totalSpend: number;
}

export interface SourceCount {
  name: string;
  count: number;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface DailyReservation {
  res: number;
  covers: number;
}

export interface RepeatVisitors {
  first: number;
  returning: number;
  regular: number;
}

export interface ReservationAnalysis {
  totalRes: number;
  totalCovers: number;
  totalNoShows: number;
  totalDays: number;
  noShowRate: number;
  avgPartySize: number;
  avgDailyRes: number;
  avgDailyCovers: number;
  avgLifetimeSpend: number;
  repeatVisitors: RepeatVisitors;
  venueTotals: VenueReservation[];
  sourceTotals: SourceCount[];
  tagCounts: TagCount[];
  dailyRes: Record<string, DailyReservation>;
}

// ---------------------------------------------------------------------------
// Analyzer
// ---------------------------------------------------------------------------

/**
 * Analyze raw reservation CSV rows into aggregated metrics: venue totals,
 * booking sources, tag frequency, repeat-visitor segmentation, and daily trends.
 */
export function analyzeReservationData(rows: CSVRow[]): ReservationAnalysis | null {
  if (!rows.length) return null;

  const venueTotals: Record<string, { res: number; covers: number; noShows: number; avgSpend: number; totalSpend: number }> = {};
  const sourceTotals: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  let totalCovers = 0;
  let totalNoShows = 0;
  let totalRes = 0;
  let totalLifetimeSpend = 0;
  const partySizes: number[] = [];
  const repeatVisitors: RepeatVisitors = { first: 0, returning: 0, regular: 0 };
  const dailyRes: Record<string, DailyReservation> = {};

  for (const row of rows) {
    const venue = row["Venue"];
    const partySize = parseInt(row["Party Size"]) || 0;
    const source = row["Source"];
    const visits = parseInt(row["Visit Count"]) || 0;
    const spend = parseInt(row["Lifetime Spend"]) || 0;
    const noShow = row["No Show"] === "Yes";
    const date = row["Date"];
    const tags = row["Tags"] || "";

    totalRes++;
    totalCovers += partySize;
    if (noShow) totalNoShows++;
    totalLifetimeSpend += spend;
    partySizes.push(partySize);

    if (visits <= 1) repeatVisitors.first++;
    else if (visits <= 5) repeatVisitors.returning++;
    else repeatVisitors.regular++;

    if (!venueTotals[venue])
      venueTotals[venue] = { res: 0, covers: 0, noShows: 0, avgSpend: 0, totalSpend: 0 };
    venueTotals[venue].res++;
    venueTotals[venue].covers += partySize;
    if (noShow) venueTotals[venue].noShows++;
    venueTotals[venue].totalSpend += spend;

    if (!sourceTotals[source]) sourceTotals[source] = 0;
    sourceTotals[source]++;

    if (tags) {
      for (const tag of tags
        .split(";")
        .map((t) => t.trim())
        .filter(Boolean)) {
        if (!tagCounts[tag]) tagCounts[tag] = 0;
        tagCounts[tag]++;
      }
    }

    if (date) {
      if (!dailyRes[date]) dailyRes[date] = { res: 0, covers: 0 };
      dailyRes[date].res++;
      dailyRes[date].covers += partySize;
    }
  }

  // Compute avg spend per venue
  for (const v of Object.values(venueTotals)) {
    v.avgSpend = v.res > 0 ? Math.round(v.totalSpend / v.res) : 0;
  }

  const dateSet = new Set(rows.map((r) => r["Date"]).filter(Boolean));
  const totalDays = dateSet.size || 1;

  return {
    totalRes,
    totalCovers,
    totalNoShows,
    totalDays,
    noShowRate: totalNoShows / totalRes,
    avgPartySize: totalCovers / totalRes,
    avgDailyRes: totalRes / totalDays,
    avgDailyCovers: totalCovers / totalDays,
    avgLifetimeSpend: totalLifetimeSpend / totalRes,
    repeatVisitors,
    venueTotals: Object.entries(venueTotals)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.covers - a.covers),
    sourceTotals: Object.entries(sourceTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    tagCounts: Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    dailyRes,
  };
}
