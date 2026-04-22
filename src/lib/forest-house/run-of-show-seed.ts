import {
  DEFAULT_ADD_ONS,
  DEFAULT_HEAVY_EQUIPMENT,
  type RunOfShowData,
} from "./run-of-show-data";
import type { CrewRecord } from "./schema";

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
  talent: ["Dillon Francis", "Flosstradamus"],
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
    "Traffic control / street closure coordination for East Fremont.",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  addOns: [...DEFAULT_ADD_ONS],
  power: {
    summary: "On-board generator — no shore power required.",
    details: ["Generac 30 kW diesel generator (ForestHouse)"],
  },
  lastUpdated: "April 21, 2026",
};

export const EDC_PARADE_SEED: RunOfShowData = {
  eventName: "EDC Parade",
  eventSubtitle:
    "World Party Parade · Prodigal Swan on the Strip · Thursday, May 14, 2026",
  location: "2880 S Las Vegas Blvd, Las Vegas, NV 89109",
  dates: [
    { label: "Load-In", value: "May 11–13" },
    { label: "Parade Date", value: "Thursday, May 14" },
    { label: "Parade", value: "6:00 PM – 8:00 PM" },
    { label: "After Party", value: "8:00 PM – 12:00 AM" },
    { label: "Strike", value: "May 15–16" },
  ],
  schedule: [
    {
      item: "Load-In · Day 1",
      date: "Mon 5/11",
      time: "TBD",
      duration: "TBD",
      notes: "Parade staging · Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Load-In · Day 2",
      date: "Tue 5/12",
      time: "TBD",
      duration: "TBD",
      notes: "Build continues · Strike Team / Auralux",
      lead: "Stefano Kajatt",
    },
    {
      item: "Load-In · Day 3 / Sound + Light Test",
      date: "Wed 5/13",
      time: "TBD",
      duration: "TBD",
      notes: "Final prep · Strike Team / Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Show Call",
      date: "Thu 5/14",
      time: "TBD",
      duration: "—",
      notes: "Full team on-site",
      lead: "Keith White",
    },
    {
      item: "World Party Parade",
      date: "Thu 5/14",
      time: "6:00p",
      duration: "2:00",
      notes: "6:00 PM – 8:00 PM · Prodigal Swan rolls the Strip",
      lead: "—",
    },
    {
      item: "After Party",
      date: "Thu 5/14",
      time: "8:00p",
      duration: "4:00",
      notes: "8:00 PM – 12:00 AM",
      lead: "—",
    },
    {
      item: "Strike · Day 1",
      date: "Fri 5/15",
      time: "TBD",
      duration: "TBD",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Strike · Day 2",
      date: "Sat 5/16",
      time: "TBD",
      duration: "TBD",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
  ],
  clientResponsibilities: [
    "Ensure adequate security for the duration of the event.",
    "Ensure adequate power for the duration of the event.",
    "10×10 BOH tent.",
    "Work passes w/ access to catering tent (10).",
    "Parade route staging + traffic control per WPP26 Global plan.",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  addOns: [...DEFAULT_ADD_ONS],
  lastUpdated: "April 22, 2026",
};

export const EDC_FESTIVAL_SEED: RunOfShowData = {
  eventName: "EDC Festival",
  eventSubtitle: "EDC Las Vegas 2026 · Las Vegas Motor Speedway",
  location: "EDC Las Vegas, Las Vegas Motor Speedway",
  dates: [
    { label: "Build Dates", value: "May 13 & 14" },
    { label: "Festival", value: "Fri–Sun, May 15–17" },
    { label: "Strike Dates", value: "May 19 & 20" },
  ],
  schedule: [
    {
      item: "Transport",
      date: "Wed 5/13",
      time: "8:00a",
      duration: "1:30",
      notes: "Knight Transportation",
      lead: "Keith White",
    },
    {
      item: "Build-Out",
      date: "Wed 5/13",
      time: "9:30a",
      duration: "8:00",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Build-Out / Sound Test",
      date: "Thu 5/14",
      time: "9:00a",
      duration: "8:00",
      notes: "Strike Team / Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Light Test",
      date: "Thu 5/14",
      time: "6:00p",
      duration: "2:00",
      notes: "Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Strike · Day 1",
      date: "Tue 5/19",
      time: "TBD",
      duration: "TBD",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Strike · Day 2",
      date: "Wed 5/20",
      time: "TBD",
      duration: "TBD",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
  ],
  clientResponsibilities: [
    "Ensure adequate security for the duration of the event.",
    "Ensure adequate power for the duration of the event.",
    "10×10 BOH tent.",
    "Work passes w/ access to catering tent (10).",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  addOns: [...DEFAULT_ADD_ONS],
  lastUpdated: "April 21, 2026",
};

export const JUNE_BLOCK_PARTY_SEED: RunOfShowData = {
  eventName: "June Block Party",
  eventSubtitle: "East Fremont Block Party · Thursday, June 11, 2026",
  location: "East Fremont Street, Las Vegas",
  dates: [
    { label: "Build Date", value: "Wednesday, June 10" },
    { label: "Event Date", value: "Thursday, June 11" },
    { label: "Strike Date", value: "Friday, June 12" },
  ],
  schedule: [
    {
      item: "Build-Out (Partial)",
      date: "Wed 6/10",
      time: "10:00a",
      duration: "7:00",
      notes: "Park on Fremont · Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Show Call",
      date: "Thu 6/11",
      time: "9:00a",
      duration: "—",
      notes: "Full team on-site",
      lead: "Keith White",
    },
    {
      item: "Block Party",
      date: "Thu 6/11",
      time: "TBD",
      duration: "TBD",
      notes: "Show run",
      lead: "—",
    },
    {
      item: "Strike / Breakdown",
      date: "Fri 6/12",
      time: "8:00a",
      duration: "6:00",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
  ],
  clientResponsibilities: [
    "Ensure adequate security for the duration of the event.",
    "Traffic control / street closure coordination for East Fremont.",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  addOns: [...DEFAULT_ADD_ONS],
  power: {
    summary: "On-board generator — no shore power required.",
    details: ["Generac 30 kW diesel generator (ForestHouse)"],
  },
  lastUpdated: "April 21, 2026",
};

export const RUN_OF_SHOW_SEEDS = {
  "cinco-de-mayo": CINCO_SEED,
  "edc-parade": EDC_PARADE_SEED,
  "edc-festival": EDC_FESTIVAL_SEED,
  "june-block-party": JUNE_BLOCK_PARTY_SEED,
} as const satisfies Record<string, RunOfShowData>;

export type EventSlug = keyof typeof RUN_OF_SHOW_SEEDS;

export function isKnownEventSlug(slug: string): slug is EventSlug {
  return slug in RUN_OF_SHOW_SEEDS;
}

// Predicate that picks crew registrations relevant to each event. Used
// by the run-of-show page to render the event-specific roster.
export const EVENT_CREW_PREDICATES: Record<
  EventSlug,
  (c: CrewRecord) => boolean
> = {
  "cinco-de-mayo": (c) => c.cincoDeMayo,
  "edc-parade": (c) => c.edcParade,
  "edc-festival": (c) => c.edcFestival,
  "june-block-party": (c) => c.juneBlockParty,
};
