import { EVENTS } from "./events";
import { sumVisitors } from "./marshmello-apr2";
import type { EventDataset } from "./types";

// Tyler Williams' conservative revenue model (City of Las Vegas).
export const DRINK_PRICE = 12;
export const DRINK_RATE = 0.5;
export const GAMING_PER_PERSON = 50;
export const GAMING_RATE = 0.1;

export const estimatedImpact = (hotelVisitors: number): number =>
  hotelVisitors * DRINK_RATE * DRINK_PRICE + hotelVisitors * GAMING_RATE * GAMING_PER_PERSON;

export interface EventCardStats {
  event: EventDataset;
  visits: number;
  dwellMinutes: number;
  yoy: string;
  hotelCrossover: number;
  estimatedImpact: number;
  elCortezPct: string;
  mostCommonEthnicity: string;
}

export interface SeriesStats {
  totalEvents: number;
  totalVisits: number;
  totalHotelCrossover: number;
  totalEstimatedImpact: number;
  avgDwellMinutes: number;
  peakYoYEvent: EventDataset;
  peakYoYPct: string;
  cards: EventCardStats[];
}

const parseIntSafe = (s: string | undefined): number => {
  if (!s) return 0;
  const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const parseYoYPct = (s: string | undefined): number => {
  if (!s) return 0;
  const m = s.match(/[+-]?[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

const metricValue = (ev: EventDataset, name: string): string =>
  ev.data.metrics.find((m) => m.metricName === name)?.metricValue ?? "";

export const computeEventCard = (ev: EventDataset): EventCardStats => {
  const visits = parseIntSafe(metricValue(ev, "Total Visits"));
  const dwell = parseIntSafe(metricValue(ev, "Avg Dwell Time Min"));
  const yoy = metricValue(ev, "Visits YoY") || "—";
  const hotelCrossover = sumVisitors(ev.data.hotels);
  const elCortez = ev.data.hotels.find((h) => h.name.toLowerCase().includes("el cortez"));
  const mostCommon = metricValue(ev, "Most Common Ethnicity");
  return {
    event: ev,
    visits,
    dwellMinutes: dwell,
    yoy,
    hotelCrossover,
    estimatedImpact: estimatedImpact(hotelCrossover),
    elCortezPct: elCortez?.percentage ?? metricValue(ev, "El Cortez Origin Pct"),
    mostCommonEthnicity: mostCommon,
  };
};

export const computeSeriesStats = (): SeriesStats => {
  const cards = EVENTS.map(computeEventCard);
  const totalVisits = cards.reduce((s, c) => s + c.visits, 0);
  const totalHotelCrossover = cards.reduce((s, c) => s + c.hotelCrossover, 0);
  const totalEstimatedImpact = cards.reduce((s, c) => s + c.estimatedImpact, 0);
  const dwellEvents = cards.filter((c) => c.dwellMinutes > 0);
  const avgDwell =
    dwellEvents.length > 0
      ? Math.round(
          dwellEvents.reduce((s, c) => s + c.dwellMinutes, 0) / dwellEvents.length
        )
      : 0;
  // Peak YoY
  const peakCard = cards.reduce((max, c) =>
    parseYoYPct(c.yoy) > parseYoYPct(max.yoy) ? c : max
  );
  return {
    totalEvents: cards.length,
    totalVisits,
    totalHotelCrossover,
    totalEstimatedImpact,
    avgDwellMinutes: avgDwell,
    peakYoYEvent: peakCard.event,
    peakYoYPct: peakCard.yoy,
    cards,
  };
};
