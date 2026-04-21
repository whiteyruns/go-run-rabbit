export const ROLES = [
  "lighting",
  "driver",
  "build",
  "strike",
  "support",
  "safety",
] as const;
export type Role = (typeof ROLES)[number];

export const SKILLS = [
  "forklift",
  "lift",
  "electrical",
  "driver",
  "EMT",
] as const;
export type Skill = (typeof SKILLS)[number];

export const DEPLOY_DATES = [
  // Cinco de Mayo — East Fremont Block Party
  "2026-05-03",
  "2026-05-04",
  "2026-05-05",
  "2026-05-06",
  // EDC Vegas
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
] as const;
export type DeployDate = (typeof DEPLOY_DATES)[number];

// ── Cinco de Mayo · East Fremont Block Party ─────────────────────────────
export const CINCO_BUILD_DATES = [
  "2026-05-03",
  "2026-05-04",
] as const satisfies readonly DeployDate[];

export const CINCO_EVENT_DATE = "2026-05-05" satisfies DeployDate;
export const CINCO_STRIKE_DATE = "2026-05-06" satisfies DeployDate;

// ── EDC Vegas ────────────────────────────────────────────────────────────
export const PLAZA_BUILD_DATES = [
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
] as const satisfies readonly DeployDate[];

export const SITE_BUILD_DATES = [
  "2026-05-12",
  "2026-05-13",
] as const satisfies readonly DeployDate[];

export const BUILD_DATES = [
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
] as const satisfies readonly DeployDate[];

// Event days (Parade + Festival combined) — used for landing-page copy
// and the "EDC Event" spec card. Finer granularity for filtering lives in
// EDC_PARADE_DATE + EDC_FESTIVAL_DATES below.
export const EVENT_DATES = [
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
] as const satisfies readonly DeployDate[];

export const STRIKE_DATES = [
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
] as const satisfies readonly DeployDate[];

export const EDC_PARADE_DATE = "2026-05-14" satisfies DeployDate;

export const EDC_FESTIVAL_DATES = [
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
] as const satisfies readonly DeployDate[];

// Grouped event-scope date sets — used to filter the registration
// form's availability grid by which events the registrant opted in to.
export const CINCO_ALL_DATES: readonly DeployDate[] = [
  ...CINCO_BUILD_DATES,
  CINCO_EVENT_DATE,
  CINCO_STRIKE_DATE,
];

export const EDC_ALL_DATES: readonly DeployDate[] = [
  ...PLAZA_BUILD_DATES,
  ...SITE_BUILD_DATES,
  ...EVENT_DATES,
  ...STRIKE_DATES,
];

// ── Roles / skills targets ───────────────────────────────────────────────
export const ROLE_TARGETS: Record<Role, number> = {
  lighting: 2,
  driver: 3,
  build: 6,
  strike: 4,
  support: 4,
  safety: 2,
};

export const DAY_TARGET = 8;

export const ROLE_LABELS: Record<Role, string> = {
  lighting: "Lighting",
  driver: "Driver",
  build: "Build",
  strike: "Strike",
  support: "Support",
  safety: "Safety",
};

export const SKILL_LABELS: Record<Skill, string> = {
  forklift: "Forklift",
  lift: "Scissor / Boom Lift",
  electrical: "Electrical",
  driver: "CDL / Driver",
  EMT: "EMT / Medic",
};

// ── Date bucketing ───────────────────────────────────────────────────────
export type DateBucket =
  | "cinco-build"
  | "cinco-event"
  | "cinco-strike"
  | "build-plaza"
  | "build-site"
  | "edc-parade"
  | "edc-festival"
  | "strike";

export const DATE_BUCKET: Record<DeployDate, DateBucket> = (() => {
  const out = {} as Record<DeployDate, DateBucket>;
  for (const d of CINCO_BUILD_DATES) out[d] = "cinco-build";
  out[CINCO_EVENT_DATE] = "cinco-event";
  out[CINCO_STRIKE_DATE] = "cinco-strike";
  for (const d of PLAZA_BUILD_DATES) out[d] = "build-plaza";
  for (const d of SITE_BUILD_DATES) out[d] = "build-site";
  out[EDC_PARADE_DATE] = "edc-parade";
  for (const d of EDC_FESTIVAL_DATES) out[d] = "edc-festival";
  for (const d of STRIKE_DATES) out[d] = "strike";
  return out;
})();

export const BUCKET_LABELS: Record<DateBucket, string> = {
  "cinco-build": "Cinco Build",
  "cinco-event": "Cinco de Mayo",
  "cinco-strike": "Cinco Strike",
  "build-plaza": "Plaza Build",
  "build-site": "Site Build",
  "edc-parade": "EDC Parade",
  "edc-festival": "EDC Festival",
  strike: "EDC Strike",
};
