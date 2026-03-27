// ============================================================================
// Depletion computation engine — estimates annual case volumes per venue
// ============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const POURS_PER_BOTTLE = 17;
export const BOTTLES_PER_SPIRIT_CASE = 12;
export const POURS_PER_SPIRIT_CASE = POURS_PER_BOTTLE * BOTTLES_PER_SPIRIT_CASE;
export const SERVINGS_PER_BEER_CASE = 24;
export const GLASSES_PER_WINE_CASE = 60;
export const WEEKS_PER_YEAR = 52;

/**
 * With a house-pour agreement in place, spirit volume is projected to
 * increase by this multiplier (2.2x).
 */
export const HOUSE_POUR_MULTIPLIER = 2.2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

/** Minimal venue shape required by computeDepletions */
export interface VenueInput {
  id: string;
  name: string;
  avgWeeklyFootTraffic: number;
}

export interface SpiritCases {
  tequila: number;
  vodka: number;
  whiskey: number;
  rum: number;
  other: number;
  [key: string]: number;
}

export interface DepletionResult {
  venueId: string;
  venueName: string;
  weeklyDrinks: number;
  annualDrinks: number;
  spiritCases: SpiritCases;
  totalSpiritCases: number;
  beerCases: number;
  wineCases: number;
  totalCases: number;
}

export interface BlockPartyEvent {
  attendance: number;
  avgDrinksPerGuest: number;
  totalDrinks: number;
  spiritCases: number;
  beerCases: number;
  otherCases: number;
}

export interface BlockPartyAnnual extends BlockPartyEvent {
  events: number;
}

export interface BlockPartyDepletions {
  perEvent: BlockPartyEvent;
  annual: BlockPartyAnnual;
}

export interface PortfolioDepletions {
  totalSpiritCases: number;
  beerCases: number;
  wineCases: number;
  totalCases: number;
  tequila: number;
  vodka: number;
  whiskey: number;
  rum: number;
  otherSpirits: number;
}

// ---------------------------------------------------------------------------
// Venue profiles — per-venue drink mix assumptions
// ---------------------------------------------------------------------------

export const venueProfiles: Record<string, VenueProfile> = {
  commonwealth: {
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
  discopussy: {
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
  cheapshot: {
    avgDrinksPerGuest: 2.8,
    mix: { spirits: 0.45, beer: 0.35, wine: 0.05, other: 0.15 },
    spiritMix: { tequila: 0.20, vodka: 0.25, whiskey: 0.25, rum: 0.15, other: 0.15 },
  },
  "la-mona-rosa": {
    avgDrinksPerGuest: 2.6,
    mix: { spirits: 0.50, beer: 0.25, wine: 0.12, other: 0.13 },
    spiritMix: { tequila: 0.52, vodka: 0.12, whiskey: 0.12, rum: 0.14, other: 0.10 },
  },
  doberman: {
    avgDrinksPerGuest: 2.5,
    mix: { spirits: 0.70, beer: 0.10, wine: 0.12, other: 0.08 },
    spiritMix: { tequila: 0.18, vodka: 0.20, whiskey: 0.35, rum: 0.10, other: 0.17 },
  },
};

// ---------------------------------------------------------------------------
// Computation
// ---------------------------------------------------------------------------

/**
 * Compute estimated annual depletions (cases) for a single venue based on
 * its foot traffic and drink-mix profile.
 */
export function computeDepletions(venue: VenueInput): DepletionResult | null {
  const profile = venueProfiles[venue.id];
  if (!profile) return null;

  const weeklyDrinks = venue.avgWeeklyFootTraffic * profile.avgDrinksPerGuest;
  const annualDrinks = weeklyDrinks * WEEKS_PER_YEAR;
  const spiritDrinks = annualDrinks * profile.mix.spirits;

  const spiritCases: SpiritCases = { tequila: 0, vodka: 0, whiskey: 0, rum: 0, other: 0 };
  let totalSpiritCases = 0;

  for (const [cat, pct] of Object.entries(profile.spiritMix)) {
    const catDrinks = spiritDrinks * pct;
    const cases = Math.round(catDrinks / POURS_PER_SPIRIT_CASE);
    spiritCases[cat] = cases;
    totalSpiritCases += cases;
  }

  const beerDrinks = annualDrinks * profile.mix.beer;
  const beerCases = Math.round(beerDrinks / SERVINGS_PER_BEER_CASE);
  const wineDrinks = annualDrinks * profile.mix.wine;
  const wineCases = Math.round(wineDrinks / GLASSES_PER_WINE_CASE);

  return {
    venueId: venue.id,
    venueName: venue.name,
    weeklyDrinks: Math.round(weeklyDrinks),
    annualDrinks: Math.round(annualDrinks),
    spiritCases,
    totalSpiritCases,
    beerCases,
    wineCases,
    totalCases: totalSpiritCases + beerCases + wineCases,
  };
}

// ---------------------------------------------------------------------------
// Block Party depletions (pre-computed constant)
// ---------------------------------------------------------------------------

export const blockPartyDepletions: BlockPartyDepletions = {
  perEvent: {
    attendance: 10000,
    avgDrinksPerGuest: 2.8,
    totalDrinks: 28000,
    spiritCases: Math.round((28000 * 0.40) / POURS_PER_SPIRIT_CASE),
    beerCases: Math.round((28000 * 0.45) / SERVINGS_PER_BEER_CASE),
    otherCases: Math.round((28000 * 0.15) / 24),
  },
  annual: {
    events: 10,
    attendance: 10000,
    avgDrinksPerGuest: 2.8,
    totalDrinks: 280000,
    spiritCases: Math.round((280000 * 0.40) / POURS_PER_SPIRIT_CASE),
    beerCases: Math.round((280000 * 0.45) / SERVINGS_PER_BEER_CASE),
    otherCases: Math.round((280000 * 0.15) / 24),
  },
};

// ---------------------------------------------------------------------------
// Portfolio aggregation helpers
// ---------------------------------------------------------------------------

const EMPTY_PORTFOLIO: PortfolioDepletions = {
  totalSpiritCases: 0,
  beerCases: 0,
  wineCases: 0,
  totalCases: 0,
  tequila: 0,
  vodka: 0,
  whiskey: 0,
  rum: 0,
  otherSpirits: 0,
};

/**
 * Aggregate an array of per-venue depletion results into a single portfolio summary.
 */
export function aggregatePortfolio(depletions: DepletionResult[]): PortfolioDepletions {
  return depletions.reduce<PortfolioDepletions>(
    (acc, d) => ({
      totalSpiritCases: acc.totalSpiritCases + d.totalSpiritCases,
      beerCases: acc.beerCases + d.beerCases,
      wineCases: acc.wineCases + d.wineCases,
      totalCases: acc.totalCases + d.totalCases,
      tequila: acc.tequila + (d.spiritCases.tequila || 0),
      vodka: acc.vodka + (d.spiritCases.vodka || 0),
      whiskey: acc.whiskey + (d.spiritCases.whiskey || 0),
      rum: acc.rum + (d.spiritCases.rum || 0),
      otherSpirits: acc.otherSpirits + (d.spiritCases.other || 0),
    }),
    { ...EMPTY_PORTFOLIO },
  );
}
