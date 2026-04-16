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
  yoyChange: number | null;
  yoyChangePct: number | null;
  sortOrder: number;
}

export interface OriginDMA {
  id: string;
  dmaName: string;
  dmaCode: string;
  state: string;
  visitors: number;
  percentage: number;
  yoyChange: number | null;
  yoyChangePct: number | null;
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

/**
 * Flags marking which sections this event's dataset can populate.
 * Drives "data not available for this event" notes when Placer export
 * is partial (e.g., PDF-only exports lack hourly curves).
 */
export interface DataCoverage {
  hourly: boolean;
  duration: boolean;
  demographics: boolean;
  destinations: boolean;
  hotels: boolean;
  originStates: boolean;
  originDMAs: boolean;
}

export interface EventDataset {
  id: string;
  label: string;
  headliner: string;
  eventDate: string;
  eventDay: string;
  source: "abacus-scrape" | "placer-pdf" | "placer-xlsx" | "email-copy";
  data: PlacerEventDataset;
  coverage: DataCoverage;
}
