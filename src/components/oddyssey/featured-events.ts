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

// Las Vegas Pride at Oddyssey Noir — four confirmed Liquid Gold
// Friday takeovers in June 2026. Posters + verbatim taglines pulled
// from the official flyers (oddyssey.noir IG, May 2026 drop).
export const FEATURED_EVENTS: FeaturedEvent[] = [
  {
    slug: "pride-jun-05",
    date: "Fri Jun 5",
    dateISO: "2026-06-05",
    venue: "Noir",
    eyebrow: "Las Vegas Pride · Liquid Gold",
    title: "Werq the Night",
    tagline: "Own the spotlight. Celebrate with Pride at Liquid Gold.",
    blurb:
      "Pride Month kickoff. Pink, gold, and full Liquid Gold programming all night. The opening salvo on four Pride Fridays at Oddyssey Noir.",
    accent: "#f06292",
    poster: "/oddyssey/pride-jun05.jpg",
    ticketsHref: "#",
  },
  {
    slug: "pride-jun-12",
    date: "Fri Jun 12",
    dateISO: "2026-06-12",
    venue: "Noir",
    eyebrow: "Las Vegas Pride · Liquid Gold",
    title: "Tempt the Night",
    tagline: "Indulge your desires. Enter the dark with Pride.",
    blurb:
      "Pride Month kicks off at Liquid Gold. Gold fangs, rainbow drip, after-dark maze energy. Doors at 10 PM, Pride x Oddyssey through close.",
    accent: "#d4a574",
    poster: "/oddyssey/pride-jun12.jpg",
    ticketsHref: "#",
  },
  {
    slug: "pride-jun-19",
    date: "Fri Jun 19",
    dateISO: "2026-06-19",
    venue: "Noir",
    eyebrow: "Las Vegas Pride · Liquid Gold",
    title: "Feel Your Power",
    tagline: "Live the legacy. Celebrate with Pride at Liquid Gold.",
    blurb:
      "Mid-Pride Friday. Rainbow gold, full Liquid Gold programming, and a room that pulls you in. The legacy continues — louder.",
    accent: "#c9a84c",
    poster: "/oddyssey/pride-jun19.jpg",
    ticketsHref: "#",
  },
  {
    slug: "pride-jun-26",
    date: "Fri Jun 26",
    dateISO: "2026-06-26",
    venue: "Noir",
    eyebrow: "Las Vegas Pride · Liquid Gold",
    title: "Velvet Vibes",
    tagline: "Electric chemistry. Celebrate with Pride at Liquid Gold.",
    blurb:
      "Pride Month finale. Velvet and electric all night — the room dialed up one last time before July. Hosted by Las Vegas Pride x AREA15.",
    accent: "#e91e63",
    poster: "/oddyssey/pride-jun26.jpg",
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
