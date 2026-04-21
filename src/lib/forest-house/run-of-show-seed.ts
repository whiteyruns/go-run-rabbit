import {
  DEFAULT_HEAVY_EQUIPMENT,
  type RunOfShowData,
} from "./run-of-show-data";

// Seeds are the "known-good" default for each event. When a run-of-show
// file doesn't exist in data/forest-house/run-of-show/, the storage
// layer returns the matching seed. As soon as an admin edits + saves,
// the runtime JSON file takes over.

export const CINCO_SEED: RunOfShowData = {
  eventName: "Cinco de Mayo",
  eventSubtitle: "East Fremont Block Party · Tuesday, May 5, 2026",
  location: "East Fremont Street, Las Vegas",
  dates: [
    { label: "Build Date", value: "Monday, May 4" },
    { label: "Event Date", value: "Tuesday, May 5" },
    { label: "Strike Date", value: "Wednesday, May 6" },
  ],
  schedule: [
    {
      item: "Build-Out (Partial)",
      date: "Mon 5/4",
      time: "10:00a",
      duration: "7:00",
      notes: "Park on Fremont · Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Show Call",
      date: "Tue 5/5",
      time: "9:00a",
      duration: "—",
      notes: "Full team on-site",
      lead: "Keith White",
    },
    {
      item: "Move to Fremont & 5th",
      date: "Tue 5/5",
      time: "10:00a",
      duration: "0:30",
      notes: "FH from Park on Fremont → Intersection of 5th",
      lead: "Keith White",
    },
    {
      item: "Block Party",
      date: "Tue 5/5",
      time: "5:00p",
      duration: "4:30",
      notes: "5:00p – 9:30p · show run",
      lead: "—",
    },
    {
      item: "Strike / Breakdown",
      date: "Wed 5/6",
      time: "8:00a",
      duration: "6:00",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
  ],
  clientResponsibilities: [
    "Ensure adequate security for the duration of the event.",
    "Ensure adequate power for the duration of the event.",
    "10×10 BOH tent.",
    "Work passes w/ access to catering tent (10).",
    "Traffic control / street closure coordination for East Fremont.",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  lastUpdated: "April 21, 2026",
};

export const RUN_OF_SHOW_SEEDS = {
  "cinco-de-mayo": CINCO_SEED,
} as const satisfies Record<string, RunOfShowData>;

export type EventSlug = keyof typeof RUN_OF_SHOW_SEEDS;

export function isKnownEventSlug(slug: string): slug is EventSlug {
  return slug in RUN_OF_SHOW_SEEDS;
}
