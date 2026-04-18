// Node-only helpers for Noir — reading archived pulls from disk,
// computing week-over-week. Kept separate from pipeline.ts so that
// client components can import types without pulling `fs`.

import fs from "fs";
import path from "path";
import { loadSessionReport, sumSessionReport, type SessionReport, type SessionReportTotals } from "@/lib/oddyssey-sessions/loader";
import { buildNoirState, buildNoirSummary } from "./pipeline";
import type { NoirSummary } from "./pipeline";

export interface NoirReportOverlay {
  available: boolean;
  pulled_at?: string;
  totals?: SessionReportTotals;
  sessions?: SessionReport[];
}

export function loadNoirReportOverlay(date: string): NoirReportOverlay {
  const report = loadSessionReport("noir", date);
  if (!report) return { available: false };
  return {
    available: true,
    pulled_at: report.pulled_at,
    totals: sumSessionReport(report),
    sessions: report.sessions,
  };
}

const NOIR_PULLS_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/pulls");
const FILE_RE = /^attendees-(\d{4}-\d{2}-\d{2})-.*\.csv$/;

export function findLatestNoirPullForDate(date: string): string | null {
  try {
    const names = fs.readdirSync(NOIR_PULLS_DIR);
    const matches = names
      .filter((n) => {
        const m = FILE_RE.exec(n);
        return m && m[1] === date;
      })
      .sort();
    return matches.length > 0 ? path.join(NOIR_PULLS_DIR, matches[matches.length - 1]) : null;
  } catch {
    return null;
  }
}

export function buildNoirSummaryForDate(date: string): NoirSummary | null {
  const file = findLatestNoirPullForDate(date);
  if (!file) return null;
  try {
    const csv = fs.readFileSync(file, "utf-8");
    const { state } = buildNoirState(path.basename(file), csv);
    return buildNoirSummary(state, date);
  } catch {
    return null;
  }
}

export interface NoirWeekOverWeek {
  prior_date: string;
  prior_date_label: string;
  available: boolean;
  deltas: {
    tickets: number;
    revenue: number;
    capacity_percent: number;
    redeemed: number;
  };
  prior: {
    tickets: number;
    revenue: number;
    capacity_percent: number;
    redeemed: number;
  } | null;
  packages: {
    type: string;
    short_label: string;
    current: number;
    prior: number;
    delta: number;
  }[];
}

export function buildNoirWeekOverWeek(current: NoirSummary): NoirWeekOverWeek {
  const d = new Date(current.date + "T00:00:00");
  d.setDate(d.getDate() - 7);
  const priorDate = d.toISOString().slice(0, 10);
  const priorDateLabel = d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const prior = buildNoirSummaryForDate(priorDate);

  if (!prior) {
    return {
      prior_date: priorDate,
      prior_date_label: priorDateLabel,
      available: false,
      deltas: { tickets: 0, revenue: 0, capacity_percent: 0, redeemed: 0 },
      prior: null,
      packages: current.packages.map((p) => ({
        type: p.type, short_label: p.short_label, current: p.count, prior: 0, delta: p.count,
      })),
    };
  }

  // Prefer session-report actuals on both sides for apples-to-apples
  const curReport = loadNoirReportOverlay(current.date);
  const priReport = loadNoirReportOverlay(priorDate);

  const curRevenue = curReport.available && curReport.totals ? curReport.totals.gross_revenue : current.revenue;
  const priRevenue = priReport.available && priReport.totals ? priReport.totals.gross_revenue : prior.revenue;
  const curRedeemed = curReport.available && curReport.totals ? curReport.totals.redeemed : current.redeemed;
  const priRedeemed = priReport.available && priReport.totals ? priReport.totals.redeemed : prior.redeemed;

  return {
    prior_date: priorDate,
    prior_date_label: priorDateLabel,
    available: true,
    deltas: {
      tickets: current.tickets_sold - prior.tickets_sold,
      revenue: curRevenue - priRevenue,
      capacity_percent: current.capacity_percent - prior.capacity_percent,
      redeemed: curRedeemed - priRedeemed,
    },
    prior: {
      tickets: prior.tickets_sold,
      revenue: priRevenue,
      capacity_percent: prior.capacity_percent,
      redeemed: priRedeemed,
    },
    packages: current.packages.map((p) => {
      const priorPkg = prior.packages.find((x) => x.type === p.type);
      const priorCount = priorPkg?.count ?? 0;
      return { type: p.type, short_label: p.short_label, current: p.count, prior: priorCount, delta: p.count - priorCount };
    }),
  };
}
