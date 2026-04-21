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

// Union of both build phases — used for landing-page headline ranges and
// crew-commitment copy.
export const BUILD_DATES = [
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
] as const satisfies readonly DeployDate[];

export const EVENT_DATES = [
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
  "2026-05-18",
] as const satisfies readonly DeployDate[];

export const STRIKE_DATES = [
  "2026-05-19",
  "2026-05-20",
] as const satisfies readonly DeployDate[];

export const ROLE_TARGETS: Record<Role, number> = {
  lighting: 2,
  driver: 3,
  build: 6,
  strike: 4,
  support: 4,
  safety: 2,
};

export const DAY_TARGET = 8;

export const EDC_PARADE_DATE = "2026-05-14" satisfies DeployDate;

export const EDC_FESTIVAL_DATES = [
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
] as const satisfies readonly DeployDate[];

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

export type DateBucket = "build-plaza" | "build-site" | "event" | "strike";

export const DATE_BUCKET: Record<DeployDate, DateBucket> = (() => {
  const out = {} as Record<DeployDate, DateBucket>;
  for (const d of PLAZA_BUILD_DATES) out[d] = "build-plaza";
  for (const d of SITE_BUILD_DATES) out[d] = "build-site";
  for (const d of EVENT_DATES) out[d] = "event";
  for (const d of STRIKE_DATES) out[d] = "strike";
  return out;
})();

export const BUCKET_LABELS: Record<DateBucket, string> = {
  "build-plaza": "Plaza Build",
  "build-site": "Site Build",
  event: "Event",
  strike: "Strike",
};

export const BUCKET_ORDER: readonly DateBucket[] = [
  "build-plaza",
  "build-site",
  "event",
  "strike",
];
