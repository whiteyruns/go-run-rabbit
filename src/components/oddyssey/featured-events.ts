// Source of truth for special / featured events surfaced on the
// wireframe home (/oddyssey) and the Noir flagship.
//
// Each entry feeds two places:
//   1. The FeaturedEventRail (the big card visitors see directly
//      above the Events Calendar).
//   2. A dedicated event-detail page at /oddyssey-manor/events/<slug>
//      using the same data so the rail and the page never drift.
//
// Add a new entry → the rail shows it automatically. Remove an entry
// or set `hidden: true` to take it off the front-end without losing
// the page route.

export interface FeaturedEvent {
  slug: string;
  date: string;          // "Sat Jun 27"
  dateISO: string;       // "2026-06-27" — used for sort + "starts in N days"
  venue: "Manor" | "Noir";
  eyebrow: string;       // small label above title ("Special · One Night Only")
  title: string;         // marketing title shown big
  tagline: string;       // one-line hook
  blurb: string;         // 1–2 sentence card body
  accent: string;        // hex — drives the card stripe + CTA color
  poster?: string;       // /oddyssey/<file>.webp — falls back to gradient
  hidden?: boolean;      // pulled from rail but page route still resolves
  ticketsHref?: string;  // external link; "#" if not yet on sale
}

export const FEATURED_EVENTS: FeaturedEvent[] = [
  {
    slug: "pride-2026",
    date: "Sat Jun 27",
    dateISO: "2026-06-27",
    venue: "Noir",
    eyebrow: "Special · One Night Only",
    title: "Pride at Oddyssey",
    tagline: "All love. All night.",
    blurb:
      "Pride Month closes loud. A one-night takeover of the after-dark maze — DJs, performers, and the full Liquid Gold programming dialed up.",
    accent: "#e91e63",
    poster: "/oddyssey/oddyssey-noir-event.webp",
    ticketsHref: "#",
  },
];

export function upcomingFeaturedEvents(
  now: Date = new Date(),
): FeaturedEvent[] {
  const today = now.toISOString().slice(0, 10);
  return FEATURED_EVENTS
    .filter((e) => !e.hidden && e.dateISO >= today)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export function getFeaturedEvent(slug: string): FeaturedEvent | undefined {
  return FEATURED_EVENTS.find((e) => e.slug === slug);
}
