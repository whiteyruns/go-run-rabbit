// Server-side mirror of the browser's localStorage assignment map.
// Written by the admin UI via POST /api/oddyssey-food/assignments and
// read by the nightly roster-pdf cron + print-view server component.
// Single JSON file because there's one shared "kitchen view" — no
// multi-tenant concerns.

import fs from "fs";
import path from "path";
import type { AssignmentsMap } from "./assignments";

const STORE = path.resolve(
  process.cwd(),
  "data/oddyssey-food/assignments.json",
);

export interface StoredAssignments {
  map: AssignmentsMap;
  updated_at: string | null;
}

export function loadStoredAssignments(): StoredAssignments {
  try {
    const raw = fs.readFileSync(STORE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoredAssignments>;
    return {
      map: parsed.map ?? {},
      updated_at: parsed.updated_at ?? null,
    };
  } catch {
    return { map: {}, updated_at: null };
  }
}

export function saveStoredAssignments(map: AssignmentsMap): StoredAssignments {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const next: StoredAssignments = {
    map,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(STORE, JSON.stringify(next, null, 2));
  return next;
}
