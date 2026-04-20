import {
  ROLES,
  DEPLOY_DATES,
  ROLE_TARGETS,
  DAY_TARGET,
  type Role,
  type DeployDate,
} from "./constants";
import type { CrewRecord } from "./schema";

export type RoleCoverage = {
  role: Role;
  assigned: number;
  target: number;
  gap: number;
};

export type DayCoverage = {
  date: DeployDate;
  available: number;
  target: number;
  gap: number;
  roles: Role[];
};

export function computeRoleCoverage(crew: CrewRecord[]): RoleCoverage[] {
  return ROLES.map((role) => {
    const assigned = crew.filter((c) => c.preferredRole === role).length;
    const target = ROLE_TARGETS[role];
    return { role, assigned, target, gap: Math.max(0, target - assigned) };
  });
}

export function computeDayCoverage(crew: CrewRecord[]): DayCoverage[] {
  return DEPLOY_DATES.map((date) => {
    const available = crew.filter((c) => c.availability.includes(date));
    const rolesPresent = Array.from(
      new Set(available.map((c) => c.preferredRole)),
    );
    return {
      date,
      available: available.length,
      target: DAY_TARGET,
      gap: Math.max(0, DAY_TARGET - available.length),
      roles: rolesPresent.sort() as Role[],
    };
  });
}

export type CrewFilter = {
  role: Role | "all";
  day: DeployDate | "all";
};

export function filterCrew(
  crew: CrewRecord[],
  filter: CrewFilter,
): CrewRecord[] {
  return crew.filter((c) => {
    if (filter.role !== "all" && c.preferredRole !== filter.role) return false;
    if (filter.day !== "all" && !c.availability.includes(filter.day))
      return false;
    return true;
  });
}

export function totalRoleGaps(coverage: RoleCoverage[]): number {
  return coverage.reduce((sum, r) => sum + r.gap, 0);
}

export function totalDayGaps(coverage: DayCoverage[]): number {
  return coverage.reduce((sum, d) => sum + d.gap, 0);
}
