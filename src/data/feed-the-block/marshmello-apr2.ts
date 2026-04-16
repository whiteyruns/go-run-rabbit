import raw from "./placer-marshmello-apr2-2026.json";
import type {
  DemographicBin,
  DestinationVisit,
  EventDataset,
  HotelStay,
  PlacerEventDataset,
} from "./types";

export * from "./types";

const data = raw as PlacerEventDataset;

export const marshmelloApr2: EventDataset = {
  id: "marshmello-apr2-2026",
  label: "Marshmello · Apr 2, 2026",
  headliner: "Marshmello",
  eventDate: "April 2, 2026",
  eventDay: "Thursday",
  source: "abacus-scrape",
  data,
  coverage: {
    hourly: true,
    duration: true,
    demographics: true,
    destinations: true,
    hotels: true,
    originStates: true,
    originDMAs: true,
  },
};

// Geographic bucketing — thresholds from actual distance clusters
// (0-1mi = DTLV district, 2-5mi = Strip corridor).
export const DTLV_MAX_MI = 1.0;
export const STRIP_MIN_MI = 2.0;
export const DOWNTOWN_DINING_MAX_MI = 1.0;

export const getMetric = (ds: PlacerEventDataset, name: string): string | undefined =>
  ds.metrics.find((m) => m.metricName === name)?.metricValue;

export const metric = (ds: PlacerEventDataset, name: string): string =>
  getMetric(ds, name) ?? "—";

export const demographicsByGroup = (
  ds: PlacerEventDataset,
  group: string
): DemographicBin[] =>
  ds.demographics
    .filter((d) => d.groupName === group)
    .sort((a, b) => a.sortOrder - b.sortOrder);

export const dtlvHotels = (ds: PlacerEventDataset): HotelStay[] =>
  ds.hotels.filter((h) => h.distance <= DTLV_MAX_MI);

export const stripHotels = (ds: PlacerEventDataset): HotelStay[] =>
  ds.hotels.filter((h) => h.distance >= STRIP_MIN_MI);

export const downtownDining = (ds: PlacerEventDataset): DestinationVisit[] =>
  ds.destinations.filter((d) => (d.distance ?? 0) <= DOWNTOWN_DINING_MAX_MI);

export const sumVisitors = <T extends { visitors: number }>(arr: T[]): number =>
  arr.reduce((s, x) => s + x.visitors, 0);

export const isCbmAnchor = (h: HotelStay): boolean =>
  h.name.toLowerCase().includes("el cortez");
