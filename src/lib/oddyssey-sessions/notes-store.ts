// Per-date, per-venue GM notes. Free-text field the team fills in —
// things like "Bandido open bar 10 PM-12 AM", "Press photo shoot for
// Noir", VIP guest names, etc. Surfaces on the Summary page and in
// the nightly recap.

import fs from "fs";
import path from "path";

export type Venue = "manor" | "noir";

function dir(venue: Venue): string {
  return path.resolve(
    process.cwd(),
    venue === "manor" ? "data/oddyssey-food/notes" : "data/oddyssey-noir/notes"
  );
}

function filePath(venue: Venue, date: string): string {
  return path.join(dir(venue), `${date}.json`);
}

export interface EventNotes {
  date: string;
  venue: Venue;
  notes: string;
  updated_at: string | null;
}

export function loadNotes(venue: Venue, date: string): EventNotes {
  try {
    const raw = fs.readFileSync(filePath(venue, date), "utf-8");
    const parsed = JSON.parse(raw) as Partial<EventNotes>;
    return {
      date,
      venue,
      notes: parsed.notes ?? "",
      updated_at: parsed.updated_at ?? null,
    };
  } catch {
    return { date, venue, notes: "", updated_at: null };
  }
}

export function saveNotes(venue: Venue, date: string, notes: string): EventNotes {
  fs.mkdirSync(dir(venue), { recursive: true });
  const data: EventNotes = {
    date,
    venue,
    notes,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(filePath(venue, date), JSON.stringify(data, null, 2));
  return data;
}
