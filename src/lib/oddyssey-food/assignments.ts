// Per-guest assignments: location + package type.
// Keyed on `${buyer_email}::${session_iso}` so the same buyer at a different
// session is a separate assignment.

const KEY = "oddyssey-food-assignments-v1";

// Location options, ordered per user's rule set:
// - HI BOY 1–9 (groups of 1–2, 9 available)
// - BOUDOIR (groups of 3–6, 1 available)
// - FELIX APARTMENT (groups of 6+)
// - DINNER TABLE (large groups 9+)
export const LOCATIONS: string[] = [
  ...Array.from({ length: 9 }, (_, i) => `HI BOY ${i + 1}`),
  "BOUDOIR",
  "FELIX APARTMENT",
  "DINNER TABLE",
];

export interface PackageAssignment {
  type: string; // matches TicketType.package_type
  count: number; // number of tickets of this type
}

export interface GuestAssignment {
  location?: string;
  // Legacy single type — still respected when package_types is empty.
  // New code paths should prefer package_types.
  package_type?: string;
  // Multi-type override: e.g., [{type: "dinner_guest", count: 1}, {type: "explorer", count: 5}].
  // Used when one buyer purchased multiple ticket types in one session.
  package_types?: PackageAssignment[];
}

export type AssignmentsMap = Record<string, GuestAssignment>;

export function assignmentKey(buyerEmail: string, sessionIso: string): string {
  return `${buyerEmail}::${sessionIso}`;
}

export function loadAssignments(): AssignmentsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AssignmentsMap) : {};
  } catch {
    return {};
  }
}

export function saveAssignments(map: AssignmentsMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function updateAssignment(
  buyerEmail: string,
  sessionIso: string,
  patch: Partial<GuestAssignment>
): AssignmentsMap {
  const map = loadAssignments();
  const k = assignmentKey(buyerEmail, sessionIso);
  map[k] = { ...map[k], ...patch };
  saveAssignments(map);
  return map;
}

// Suggest a location based on party size if we ever learn group size
// (currently manual). Kept here so callers don't have to inline the rule.
export function suggestLocation(partySize: number, taken: Set<string>): string | null {
  if (partySize <= 2) {
    for (let i = 1; i <= 9; i++) {
      const loc = `HI BOY ${i}`;
      if (!taken.has(loc)) return loc;
    }
    return null;
  }
  if (partySize <= 6 && !taken.has("BOUDOIR")) return "BOUDOIR";
  if (partySize <= 9) return "FELIX APARTMENT";
  return "DINNER TABLE";
}
