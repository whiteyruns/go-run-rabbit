/**
 * Venue drink mix profiles — average drinks per guest and category percentages per venue.
 * Used by the case depletion engine.
 * Source: cbm/index.html
 */

export interface DrinkMix {
  spirits: number;
  beer: number;
  wine: number;
  other: number;
}

export interface SpiritMix {
  tequila: number;
  vodka: number;
  whiskey: number;
  rum: number;
  other: number;
}

export interface VenueProfile {
  avgDrinksPerGuest: number;
  mix: DrinkMix;
  spiritMix: SpiritMix;
}

export const venueProfiles: Record<string, VenueProfile> = {
  "commonwealth": {
    avgDrinksPerGuest: 3.2,
    mix: { spirits: 0.50, beer: 0.30, wine: 0.08, other: 0.12 },
    spiritMix: { tequila: 0.25, vodka: 0.30, whiskey: 0.20, rum: 0.10, other: 0.15 },
  },
  "laundry-room": {
    avgDrinksPerGuest: 2.8,
    mix: { spirits: 0.82, beer: 0.03, wine: 0.10, other: 0.05 },
    spiritMix: { tequila: 0.15, vodka: 0.15, whiskey: 0.40, rum: 0.10, other: 0.20 },
  },
  "we-all-scream": {
    avgDrinksPerGuest: 3.5,
    mix: { spirits: 0.48, beer: 0.35, wine: 0.02, other: 0.15 },
    spiritMix: { tequila: 0.25, vodka: 0.35, whiskey: 0.15, rum: 0.12, other: 0.13 },
  },
  "discopussy": {
    avgDrinksPerGuest: 3.8,
    mix: { spirits: 0.55, beer: 0.28, wine: 0.02, other: 0.15 },
    spiritMix: { tequila: 0.22, vodka: 0.38, whiskey: 0.15, rum: 0.10, other: 0.15 },
  },
  "lucky-day": {
    avgDrinksPerGuest: 3.0,
    mix: { spirits: 0.80, beer: 0.12, wine: 0.03, other: 0.05 },
    spiritMix: { tequila: 0.72, vodka: 0.08, whiskey: 0.08, rum: 0.05, other: 0.07 },
  },
  "park-on-fremont": {
    avgDrinksPerGuest: 2.4,
    mix: { spirits: 0.30, beer: 0.40, wine: 0.15, other: 0.15 },
    spiritMix: { tequila: 0.25, vodka: 0.25, whiskey: 0.20, rum: 0.15, other: 0.15 },
  },
  "cheapshot": {
    avgDrinksPerGuest: 2.8,
    mix: { spirits: 0.45, beer: 0.35, wine: 0.05, other: 0.15 },
    spiritMix: { tequila: 0.20, vodka: 0.25, whiskey: 0.25, rum: 0.15, other: 0.15 },
  },
  "la-mona-rosa": {
    avgDrinksPerGuest: 2.6,
    mix: { spirits: 0.50, beer: 0.25, wine: 0.12, other: 0.13 },
    spiritMix: { tequila: 0.52, vodka: 0.12, whiskey: 0.12, rum: 0.14, other: 0.10 },
  },
  "doberman": {
    avgDrinksPerGuest: 2.5,
    mix: { spirits: 0.70, beer: 0.10, wine: 0.12, other: 0.08 },
    spiritMix: { tequila: 0.18, vodka: 0.20, whiskey: 0.35, rum: 0.10, other: 0.17 },
  },
};
