export interface EventSponsor {
  name: string;
  role: string;
  category: string;
  note?: string;
}

// Sponsors/partners that activated each specific event. Per-event, not
// series-level (see feed-the-block.ts for season-wide confirmed sponsors).
const SPONSORS_BY_EVENT: Record<string, EventSponsor[]> = {
  "marshmello-apr2-2026": [
    {
      name: "LVCVA",
      role: "Founding Municipal Partner",
      category: "Municipal / Tourism",
      note: "Las Vegas Convention and Visitors Authority",
    },
    {
      name: "City of Las Vegas",
      role: "Founding Municipal Partner",
      category: "Municipal / Government",
    },
    {
      name: "Diageo",
      role: "Spirits & Beverage Partner",
      category: "Beverage",
      note: "Category-exclusive beverage activation",
    },
  ],
  "diplo-oct27-2025": [
    { name: "LVCVA", role: "Founding Municipal Partner", category: "Municipal / Tourism" },
    { name: "City of Las Vegas", role: "Founding Municipal Partner", category: "Municipal / Government" },
  ],
  "major-lazer-sep12-2025": [
    { name: "LVCVA", role: "Founding Municipal Partner", category: "Municipal / Tourism" },
    { name: "City of Las Vegas", role: "Founding Municipal Partner", category: "Municipal / Government" },
  ],
};

export const getSponsorsForEvent = (eventId: string): EventSponsor[] =>
  SPONSORS_BY_EVENT[eventId] ?? [];
