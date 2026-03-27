// ============================================================================
// PMIX (Product Mix) data analyzer
// ============================================================================

import type { CSVRow } from "./csv-parser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ItemTotal {
  name: string;
  qty: number;
  gross: number;
  cost: number;
  group: string;
  spiritCat: string;
  venue: Record<string, number>;
  pourCost: number;
}

export interface CategoryTotal {
  name: string;
  qty: number;
  gross: number;
  cost: number;
  pourCost: number;
}

export interface VenueTotal {
  name: string;
  qty: number;
  gross: number;
  cost: number;
  pourCost: number;
}

export interface DailySale {
  qty: number;
  gross: number;
}

export interface DayOfWeekSale {
  qty: number;
  gross: number;
  days: number;
}

export interface SpiritCategoryCase {
  qty: number;
  gross: number;
}

export interface VenueByCategoryEntry {
  qty: number;
  gross: number;
}

export interface PMIXAnalysis {
  totalQty: number;
  totalGross: number;
  totalCost: number;
  totalNet: number;
  totalVoids: number;
  totalComps: number;
  totalDays: number;
  avgDailyRevenue: number;
  avgDailyDrinks: number;
  overallPourCost: number;
  topSellers: ItemTotal[];
  categoryBreakdown: CategoryTotal[];
  venueBreakdown: VenueTotal[];
  venueByCategory: Record<string, Record<string, VenueByCategoryEntry>>;
  spiritCategoryCases: Record<string, SpiritCategoryCase>;
  dailySales: Record<string, DailySale>;
  dayOfWeekSales: Record<string, DayOfWeekSale>;
  monthSales: Record<string, DailySale>;
}

// ---------------------------------------------------------------------------
// Analyzer
// ---------------------------------------------------------------------------

/**
 * Analyze raw PMIX CSV rows into aggregated metrics: top sellers, category
 * breakdowns, venue breakdowns, time-series, and spirit category cases.
 */
export function analyzePMIXData(rows: CSVRow[]): PMIXAnalysis | null {
  if (!rows.length) return null;

  const itemTotals: Record<string, { qty: number; gross: number; cost: number; group: string; spiritCat: string; venue: Record<string, number> }> = {};
  const categoryTotals: Record<string, { qty: number; gross: number; cost: number }> = {};
  const venueTotals: Record<string, { qty: number; gross: number; cost: number }> = {};
  const venueByCategory: Record<string, Record<string, VenueByCategoryEntry>> = {};
  const dailySales: Record<string, DailySale> = {};
  const dayOfWeekSales: Record<string, DayOfWeekSale> = {};
  const monthSales: Record<string, DailySale> = {};
  const spiritCategoryCases: Record<string, SpiritCategoryCase> = {};

  let totalQty = 0;
  let totalGross = 0;
  let totalCost = 0;
  let totalNet = 0;
  let totalVoids = 0;
  let totalComps = 0;

  for (const row of rows) {
    const qty = parseInt(row["Qty Sold"]) || 0;
    const gross = parseFloat(row["Gross Sales"]) || 0;
    const cost = parseFloat(row["Item Cost"]) || 0;
    const net = parseFloat(row["Net Sales"]) || 0;
    const voidQty = parseInt(row["Void Qty"]) || 0;
    const compQty = parseInt(row["Comp Qty"]) || 0;
    const item = row["Menu Item"];
    const group = row["Menu Group"];
    const venue = row["Location"];
    const date = row["Business Date"];
    const spiritCat = row["Spirit Category"];

    totalQty += qty;
    totalGross += gross;
    totalCost += cost;
    totalNet += net;
    totalVoids += voidQty;
    totalComps += compQty;

    // Item totals
    if (!itemTotals[item]) itemTotals[item] = { qty: 0, gross: 0, cost: 0, group, spiritCat, venue: {} };
    itemTotals[item].qty += qty;
    itemTotals[item].gross += gross;
    itemTotals[item].cost += cost;
    if (!itemTotals[item].venue[venue]) itemTotals[item].venue[venue] = 0;
    itemTotals[item].venue[venue] += qty;

    // Category totals
    if (!categoryTotals[group]) categoryTotals[group] = { qty: 0, gross: 0, cost: 0 };
    categoryTotals[group].qty += qty;
    categoryTotals[group].gross += gross;
    categoryTotals[group].cost += cost;

    // Spirit category cases (for comparison with estimates)
    if (
      spiritCat &&
      spiritCat !== "Beer" &&
      spiritCat !== "Wine" &&
      spiritCat !== "Champagne" &&
      spiritCat !== "Non-Alcoholic" &&
      spiritCat !== "Other"
    ) {
      if (!spiritCategoryCases[spiritCat]) spiritCategoryCases[spiritCat] = { qty: 0, gross: 0 };
      spiritCategoryCases[spiritCat].qty += qty;
      spiritCategoryCases[spiritCat].gross += gross;
    }

    // Venue totals
    if (!venueTotals[venue]) venueTotals[venue] = { qty: 0, gross: 0, cost: 0 };
    venueTotals[venue].qty += qty;
    venueTotals[venue].gross += gross;
    venueTotals[venue].cost += cost;

    // Venue by spirit category
    if (!venueByCategory[venue]) venueByCategory[venue] = {};
    if (!venueByCategory[venue][spiritCat]) venueByCategory[venue][spiritCat] = { qty: 0, gross: 0 };
    venueByCategory[venue][spiritCat].qty += qty;
    venueByCategory[venue][spiritCat].gross += gross;

    // Daily sales
    if (date) {
      if (!dailySales[date]) dailySales[date] = { qty: 0, gross: 0 };
      dailySales[date].qty += qty;
      dailySales[date].gross += gross;

      // Day of week
      const d = new Date(date + "T12:00:00");
      const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      if (!dayOfWeekSales[dow]) dayOfWeekSales[dow] = { qty: 0, gross: 0, days: 0 };
      dayOfWeekSales[dow].qty += qty;
      dayOfWeekSales[dow].gross += gross;

      // Month
      const month = date.slice(0, 7);
      if (!monthSales[month]) monthSales[month] = { qty: 0, gross: 0 };
      monthSales[month].qty += qty;
      monthSales[month].gross += gross;
    }
  }

  // Count unique days per DOW
  const dateSet = new Set(rows.map((r) => r["Business Date"]).filter(Boolean));
  for (const date of Array.from(dateSet)) {
    const d = new Date(date + "T12:00:00");
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    if (dayOfWeekSales[dow]) dayOfWeekSales[dow].days++;
  }

  const topSellers: ItemTotal[] = Object.entries(itemTotals)
    .map(([name, d]) => ({ name, ...d, pourCost: d.cost / d.gross }))
    .sort((a, b) => b.qty - a.qty);

  const categoryBreakdown: CategoryTotal[] = Object.entries(categoryTotals)
    .map(([name, d]) => ({ name, ...d, pourCost: d.cost / d.gross }))
    .sort((a, b) => b.gross - a.gross);

  const venueBreakdown: VenueTotal[] = Object.entries(venueTotals)
    .map(([name, d]) => ({ name, ...d, pourCost: d.cost / d.gross }))
    .sort((a, b) => b.gross - a.gross);

  const totalDays = dateSet.size || 1;

  return {
    totalQty,
    totalGross,
    totalCost,
    totalNet,
    totalVoids,
    totalComps,
    totalDays,
    avgDailyRevenue: totalGross / totalDays,
    avgDailyDrinks: totalQty / totalDays,
    overallPourCost: totalCost / totalGross,
    topSellers,
    categoryBreakdown,
    venueBreakdown,
    venueByCategory,
    spiritCategoryCases,
    dailySales,
    dayOfWeekSales,
    monthSales,
  };
}
