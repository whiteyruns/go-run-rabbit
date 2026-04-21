// Shared data for the Forest House run-of-show documents.
// Vehicle specs, power requirements, audio/lighting rig, and the core
// team roster are the same across every event — only dates, location,
// schedule, and client responsibilities change per event.

import { z } from "zod";

export const ScheduleItemSchema = z.object({
  item: z.string().min(1).max(120),
  date: z.string().min(1).max(40),
  time: z.string().max(20).optional(),
  duration: z.string().max(20).optional(),
  notes: z.string().max(200).optional(),
  lead: z.string().max(60).optional(),
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

export const EventDateSchema = z.object({
  label: z.string().min(1).max(40),
  value: z.string().min(1).max(80),
});
export type EventDate = z.infer<typeof EventDateSchema>;

export const PowerConfigSchema = z.object({
  summary: z.string().min(1).max(200),
  details: z.array(z.string().min(1).max(160)).max(10).optional(),
});
export type PowerConfig = z.infer<typeof PowerConfigSchema>;

export const RunOfShowDataSchema = z.object({
  eventName: z.string().min(1).max(80),
  eventSubtitle: z.string().max(160).optional(),
  location: z.string().min(1).max(160),
  dates: z.array(EventDateSchema).max(10),
  schedule: z.array(ScheduleItemSchema).max(50),
  clientResponsibilities: z.array(z.string().min(1).max(240)).max(20),
  heavyEquipment: z.array(z.string().min(1).max(120)).max(20),
  // Optional extras with pricing — confetti cannons, cold sparks, etc.
  addOns: z.array(z.string().min(1).max(200)).max(20).optional(),
  // Per-event power override. If unset, the shared Shore Power + CamLock
  // guide is rendered. If set, the custom summary/details replace it
  // entirely — the CamLock swatches are hidden.
  power: PowerConfigSchema.optional(),
  lastUpdated: z.string().max(80),
});
export type RunOfShowData = z.infer<typeof RunOfShowDataSchema>;

export type TeamMember = {
  name: string;
  company?: string;
  role: string;
  phone: string;
  email: string;
  responsibilities: string;
};

// Core leads — always appear on every run-of-show, regardless of whether
// they registered through the crew form. Everyone else on a given event's
// roster is pulled from the crew registrations that match the event.
export const CORE_TEAM_EMAILS: ReadonlySet<string> = new Set([
  "michael@auraluxsystems.com",
  "charlie@auraluxsystems.com",
  "keith@gorunrabbit.com",
]);

// ── Team ──────────────────────────────────────────────────────────────
export const FOREST_HOUSE_TEAM: TeamMember[] = [
  {
    name: "Michael Saporita",
    company: "Auralux",
    role: "Sound & Lighting Lead",
    phone: "267.679.6047",
    email: "michael@auraluxsystems.com",
    responsibilities:
      "Oversees all sound and lighting setup, calibration, and operation. Ensures seamless integration with the venue's production team.",
  },
  {
    name: "Charlie Keiper",
    company: "Auralux",
    role: "Sound & Lighting Lead",
    phone: "215.432.0775",
    email: "charlie@auraluxsystems.com",
    responsibilities:
      "Works alongside Michael to manage all audio and lighting components. Responsible for troubleshooting and system optimization.",
  },
  {
    name: "Mark Anthony",
    role: "Assistant Sound & Lighting",
    phone: "702.285.6723",
    email: "mark.auralux@gmail.com",
    responsibilities:
      "Supports sound and lighting setup, assists with troubleshooting, and ensures smooth operation.",
  },
  {
    name: "Keith White",
    company: "Go Run Rabbit",
    role: "Event Production",
    phone: "978.590.8654",
    email: "keith@gorunrabbit.com",
    responsibilities:
      "Manages overall logistics, scheduling, and coordination. Ensures all aspects of the art car's build, operation, and breakdown align with event requirements.",
  },
  {
    name: "Stefano Kajatt",
    role: "Strike Team Lead",
    phone: "702.575.1624",
    email: "stefanokaj@gmail.com",
    responsibilities:
      "Leads the three-person strike team for setup and breakdown. Ensures efficient deployment of heavy equipment and staging components.",
  },
  {
    name: "Rigo Cardenas",
    role: "Strike Team",
    phone: "702.408.7979",
    email: "r@8m.ai",
    responsibilities:
      "Assists in the buildout and breakdown process, ensuring efficiency in setup and teardown.",
  },
  {
    name: "Aldo Ramon",
    role: "Strike Team",
    phone: "305.213.4047",
    email: "aldoramon@me.com",
    responsibilities:
      "Assists in the buildout and breakdown process, ensuring efficiency in setup and teardown.",
  },
  {
    name: "Ryan Doherty",
    role: "Co-Owner",
    phone: "702.301.7328",
    email: "ryan@cornerbarmgmt.com",
    responsibilities:
      "Provides oversight on production and logistical planning. Coordinates with event organizers and vendors.",
  },
  {
    name: "Matt Welebir",
    role: "Co-Owner",
    phone: "702.580.0648",
    email: "welebirm@gmail.com",
    responsibilities:
      "Manages vendor relations and operational execution. Ensures compliance with safety and insurance requirements.",
  },
  {
    name: "Chris Bouton",
    role: "Founder & Co-Owner",
    phone: "978.270.0624",
    email: "cbouton@gmail.com",
    responsibilities:
      "Oversees brand presence and artistic direction. Ensures the experience aligns with ForestHouse Art Car's vision.",
  },
];

// ── Vehicle specs ────────────────────────────────────────────────────
export const VEHICLE_SPECS = {
  chassis: "2000 Bluebird School Bus",
  engine: "Cummins 6BT 5.9L",
  height: "25 ft (7.6 m)",
  width: "15 ft (4.5 m)",
  length: "36 ft (10.9 m)",
  weight: "20,010 lbs",
  stabilizers: "BigFoot Hydraulic Leveling System",
} as const;

export const POWER_REQUIREMENTS = {
  shorePower: "300 Amps · CamLock",
  camLock: [
    { color: "Green", label: "Ground", swatch: "#2ec48a" },
    { color: "White", label: "Neutral", swatch: "#e6e6e6" },
    { color: "Black", label: "L1", swatch: "#1a1a1a" },
    { color: "Red", label: "L2", swatch: "#e63946" },
  ],
} as const;

export const AUDIO_GEAR = [
  "(2) Bias Q5",
  "(4) Bias Q3",
  "(1) Rack",
  "(1) DJ Booth",
] as const;

export const LASER_GEAR = ["(4) 10W Lasers"] as const;

export const DEFAULT_HEAVY_EQUIPMENT = [
  "(1) 40' Variable Reach Forklift",
  "(1) 40' Boom Lift",
  "(2) Light Towers",
] as const;

export const DEFAULT_ADD_ONS = [
  "Large confetti cannon · $400 + $200 per shot",
  "Small confetti cannons (2 available) · $250 ea + $50 per shot ea",
  "Cold Sparks (4 pairs available) · $135 per pair",
] as const;
