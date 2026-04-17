// Reads historical pulls from disk. The Playwright scraper archives every
// pull as `attendees-<date>-<timestamp>.csv` in data/oddyssey-food/pulls/.
// For any given show date, we treat the LATEST pull as the snapshot.

import fs from "fs";
import path from "path";
import { loadSessionReport, sumSessionReport, type SessionReport, type SessionReportTotals } from "@/lib/oddyssey-sessions/loader";
import { buildStateFromCsv } from "./build-state";
import { buildSummary, type NightSummary } from "./summary";

export interface ManorReportOverlay {
  available: boolean;
  pulled_at?: string;
  totals?: SessionReportTotals;
  sessions?: SessionReport[];
}

export function loadManorReportOverlay(date: string): ManorReportOverlay {
  const report = loadSessionReport("manor", date);
  if (!report) return { available: false };
  return {
    available: true,
    pulled_at: report.pulled_at,
    totals: sumSessionReport(report),
    sessions: report.sessions,
  };
}

const PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-food/pulls");

// Filename pattern: attendees-YYYY-MM-DD-<iso-ts>.csv
const FILE_RE = /^attendees-(\d{4}-\d{2}-\d{2})-.*\.csv$/;

export function findLatestPullForDate(date: string): string | null {
  try {
    const entries = fs.readdirSync(PULLS_DIR);
    const matches = entries
      .map((name) => {
        const m = FILE_RE.exec(name);
        return m && m[1] === date ? name : null;
      })
      .filter((x): x is string => Boolean(x))
      .sort(); // lexical sort = chronological by ISO timestamp in filename
    if (matches.length === 0) return null;
    return path.join(PULLS_DIR, matches[matches.length - 1]);
  } catch {
    return null;
  }
}

export function buildSummaryForDate(date: string): NightSummary | null {
  const file = findLatestPullForDate(date);
  if (!file) return null;
  try {
    const csv = fs.readFileSync(file, "utf-8");
    const { state } = buildStateFromCsv(path.basename(file), csv);
    return buildSummary(state, date);
  } catch {
    return null;
  }
}

export function priorSameWeekday(date: string): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export interface WeekOverWeek {
  prior_date: string;
  prior_date_label: string;
  available: boolean;
  deltas: {
    tickets: number;
    revenue: number;
    capacity_percent: number; // absolute delta (e.g. 0.05 = +5 pts)
    food_items: number;
  };
  prior: {
    tickets: number;
    revenue: number;
    capacity_percent: number;
    food_items: number;
  } | null;
  packages: {
    type: string;
    short_label: string;
    current: number;
    prior: number;
    delta: number;
  }[];
}

export function buildWeekOverWeek(current: NightSummary): WeekOverWeek {
  const priorDate = priorSameWeekday(current.date);
  const d = new Date(priorDate + "T00:00:00");
  const priorDateLabel = !isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : priorDate;

  const prior = buildSummaryForDate(priorDate);

  if (!prior) {
    return {
      prior_date: priorDate,
      prior_date_label: priorDateLabel,
      available: false,
      deltas: { tickets: 0, revenue: 0, capacity_percent: 0, food_items: 0 },
      prior: null,
      packages: current.packages.map((p) => ({
        type: p.type,
        short_label: p.short_label,
        current: p.count,
        prior: 0,
        delta: p.count,
      })),
    };
  }

  const packages = current.packages.map((p) => {
    const priorPkg = prior.packages.find((x) => x.type === p.type);
    const priorCount = priorPkg?.count ?? 0;
    return {
      type: p.type,
      short_label: p.short_label,
      current: p.count,
      prior: priorCount,
      delta: p.count - priorCount,
    };
  });

  return {
    prior_date: priorDate,
    prior_date_label: priorDateLabel,
    available: true,
    deltas: {
      tickets: current.tickets_sold - prior.tickets_sold,
      revenue: current.revenue - prior.revenue,
      capacity_percent: current.capacity_percent - prior.capacity_percent,
      food_items: current.food_items - prior.food_items,
    },
    prior: {
      tickets: prior.tickets_sold,
      revenue: prior.revenue,
      capacity_percent: prior.capacity_percent,
      food_items: prior.food_items,
    },
    packages,
  };
}
