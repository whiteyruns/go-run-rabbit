import raw from "./placer-marshmello-apr2-2026.json";

export interface PlacerMetric {
  id: string;
  metricName: string;
  metricValue: string;
  category: string;
}

export interface HourlyVisit {
  id: string;
  hour: string;
  hourIndex: number;
  visits: number;
}

export interface DurationBucket {
  id: string;
  durationRange: string;
  visits: number;
  sortOrder: number;
}

export interface DemographicBin {
  id: string;
  groupName: "Age" | "Ethnicity" | "Income" | "Household" | string;
  binLabel: string;
  eventValue: number;
  stateValue: number;
  sortOrder: number;
}

export interface DestinationVisit {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  address: string;
  city: string;
  distance: number | null;
  visitors: number;
  percentage: string;
  sortOrder: number;
}

export interface HotelStay {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  address: string;
  city: string;
  distance: number;
  visitors: number;
  percentage: string;
  sortOrder: number;
}

export interface OriginState {
  id: string;
  stateName: string;
  visitors: number;
  percentage: number;
  yoyChange: number;
  yoyChangePct: number;
  sortOrder: number;
}

export interface OriginDMA {
  id: string;
  dmaName: string;
  dmaCode: string;
  state: string;
  visitors: number;
  percentage: number;
  yoyChange: number;
  yoyChangePct: number;
  sortOrder: number;
}

export interface PlacerEventDataset {
  metrics: PlacerMetric[];
  hourly: HourlyVisit[];
  duration: DurationBucket[];
  demographics: DemographicBin[];
  destinations: DestinationVisit[];
  hotels: HotelStay[];
  originStates: OriginState[];
  originDMAs: OriginDMA[];
}

export const marshmelloApr2 = raw as PlacerEventDataset;

const metricByName = new Map(
  marshmelloApr2.metrics.map((m) => [m.metricName, m.metricValue])
);

export const getMetric = (name: string): string | undefined =>
  metricByName.get(name);

export const metric = (name: string): string => metricByName.get(name) ?? "—";

export const demographicsByGroup = (group: string): DemographicBin[] =>
  marshmelloApr2.demographics
    .filter((d) => d.groupName === group)
    .sort((a, b) => a.sortOrder - b.sortOrder);
