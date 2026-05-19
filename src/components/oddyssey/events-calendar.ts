// Shared source of truth for the recurring Noir/Liquid Gold events
// calendar. Used by both the wireframe-home Events page
// (`/oddyssey` → "View All Events") and the Noir flagship's inline
// calendar section. Cross-references FEATURED_EVENTS so any date that
// matches a flyer (Pride, future Halloween, etc) auto-promotes its
// name + eyebrow + accent color and gets a link to its detail page.

import { FEATURED_EVENTS } from "./featured-events";

export interface CalendarEventRow {
  date: string;        // "Fri May 22"
  dateISO: string;     // "2026-05-22"
  name: string;        // "Liquid Gold" | "Oddyssey Noir"
  dj?: string;         // "Tony Touch" — undefined when not yet announced
  night: "friday" | "saturday";
}

export interface AnnotatedEventRow extends CalendarEventRow {
  // Set when cross-referencing FEATURED_EVENTS by dateISO.
  displayName: string;
  eyebrow?: string;
  featuredSlug?: string;
  accent?: string;
}

// Cadence: every Friday is Liquid Gold, every Saturday is Oddyssey
// Noir. To add/remove a date, edit this list — every calendar
// surface picks it up automatically.
export const ALL_EVENTS: CalendarEventRow[] = [
  { date: "Fri May 22", dateISO: "2026-05-22", name: "Liquid Gold", dj: "DJ Brynn Taylor", night: "friday" },
  { date: "Sat May 23", dateISO: "2026-05-23", name: "Oddyssey Noir", dj: "Tony Touch", night: "saturday" },
  { date: "Fri May 29", dateISO: "2026-05-29", name: "Liquid Gold", dj: "Soni Withaneye", night: "friday" },
  { date: "Sat May 30", dateISO: "2026-05-30", name: "Oddyssey Noir", dj: "John Julius Knight", night: "saturday" },
  { date: "Fri Jun 05", dateISO: "2026-06-05", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jun 06", dateISO: "2026-06-06", name: "Oddyssey Noir", night: "saturday" },
  { date: "Fri Jun 12", dateISO: "2026-06-12", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jun 13", dateISO: "2026-06-13", name: "Oddyssey Noir", night: "saturday" },
  { date: "Fri Jun 19", dateISO: "2026-06-19", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jun 20", dateISO: "2026-06-20", name: "Oddyssey Noir", night: "saturday" },
  { date: "Fri Jun 26", dateISO: "2026-06-26", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jun 27", dateISO: "2026-06-27", name: "Oddyssey Noir", night: "saturday" },
  { date: "Fri Jul 03", dateISO: "2026-07-03", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jul 04", dateISO: "2026-07-04", name: "Oddyssey Noir", night: "saturday" },
  { date: "Fri Jul 10", dateISO: "2026-07-10", name: "Liquid Gold", night: "friday" },
  { date: "Sat Jul 11", dateISO: "2026-07-11", name: "Oddyssey Noir", night: "saturday" },
];

export function annotatedEvents(): AnnotatedEventRow[] {
  return ALL_EVENTS.map((e) => {
    const featured = FEATURED_EVENTS.find((f) => f.dateISO === e.dateISO);
    return {
      ...e,
      displayName: featured?.title ?? e.name,
      eyebrow: featured?.eyebrow,
      featuredSlug: featured?.slug,
      accent: featured?.accent,
    };
  });
}
