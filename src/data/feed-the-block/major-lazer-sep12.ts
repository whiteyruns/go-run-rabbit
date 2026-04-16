import raw from "./major-lazer-sep12-2025.json";
import type { EventDataset, PlacerEventDataset } from "./types";

const data = raw as PlacerEventDataset;

export const majorLazerSep12: EventDataset = {
  id: "major-lazer-sep12-2025",
  label: "Major Lazer · Sep 12, 2025",
  headliner: "Major Lazer",
  eventDate: "September 12, 2025",
  eventDay: "Friday",
  source: "placer-pdf",
  data,
  coverage: {
    hourly: false,
    duration: true,
    demographics: true,
    destinations: true,
    hotels: true,
    originStates: false,
    originDMAs: false,
  },
};
