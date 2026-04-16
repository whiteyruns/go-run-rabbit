import raw from "./diplo-oct27-2025.json";
import type { EventDataset, PlacerEventDataset } from "./types";

const data = raw as PlacerEventDataset;

export const diploOct27: EventDataset = {
  id: "diplo-oct27-2025",
  label: "Diplo · Oct 27, 2025",
  headliner: "Diplo",
  eventDate: "October 27, 2025",
  eventDay: "Monday",
  source: "placer-pdf",
  data,
  coverage: {
    hourly: false,
    duration: true,
    demographics: true,
    destinations: false,
    hotels: true,
    originStates: false,
    originDMAs: false,
  },
};
