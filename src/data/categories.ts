/**
 * Sponsorship categories and opportunities across the CBM portfolio.
 * Source: cbm/index.html
 */

export type SponsorshipStatus = "high-potential" | "underserved" | "untapped" | "emerging";

export interface SponsorshipCategory {
  id: string;
  name: string;
  icon: string;
  currentRevenue: number;
  projectedRevenue: number;
  venuesActive: number;
  totalVenues: number;
  opportunityScore: number;
  status: SponsorshipStatus;
  notes: string;
  topOpportunities: string[];
}

export const sponsorshipCategories: SponsorshipCategory[] = [
  {
    id: "tequila",
    name: "Tequila / Mezcal",
    icon: "\u{1F335}",
    currentRevenue: 126000,
    projectedRevenue: 480000,
    venuesActive: 3,
    totalVenues: 9,
    opportunityScore: 95,
    status: "high-potential",
    notes: "Natural fit with Lucky Day, La Mona Rosa. Category is booming \u2014 brands paying premium for placement.",
    topOpportunities: [
      "Lucky Day house pour deal ($95K)",
      "La Mona Rosa menu integration ($80K)",
      "Block Party margarita sponsor ($100K)",
      "We All Scream frozen cocktail program ($60K)",
      "Cross-venue tequila trail activation ($75K)",
    ],
  },
  {
    id: "vodka",
    name: "Vodka",
    icon: "\u{1F9CA}",
    currentRevenue: 66000,
    projectedRevenue: 380000,
    venuesActive: 2,
    totalVenues: 9,
    opportunityScore: 88,
    status: "high-potential",
    notes: "Only Tito's and Absolut placed. Massive whitespace across nightclubs and bars.",
    topOpportunities: [
      "We All Scream exclusive pour ($120K)",
      "Discopussy nightclub partnership ($90K)",
      "Commonwealth premium well ($65K)",
      "Block Party featured cocktail ($80K)",
    ],
  },
  {
    id: "whiskey",
    name: "Whiskey / Bourbon",
    icon: "\u{1F943}",
    currentRevenue: 24000,
    projectedRevenue: 290000,
    venuesActive: 1,
    totalVenues: 9,
    opportunityScore: 82,
    status: "underserved",
    notes: "Only Macallan in Laundry Room. Huge gap. Doberman Drawing Room is ideal for premium whiskey.",
    topOpportunities: [
      "Doberman Drawing Room exclusive ($90K)",
      "Commonwealth back bar feature ($60K)",
      "Cheapshot show sponsor ($40K)",
      "Cross-venue whiskey flight program ($50K)",
    ],
  },
  {
    id: "rum",
    name: "Rum",
    icon: "\u{1F3DD}\uFE0F",
    currentRevenue: 0,
    projectedRevenue: 180000,
    venuesActive: 0,
    totalVenues: 9,
    opportunityScore: 75,
    status: "untapped",
    notes: "Zero rum sponsors currently. Tropical cocktail programs at patio venues are natural entry points.",
    topOpportunities: [
      "Park On Fremont patio activation ($40K)",
      "We All Scream frozen rum cocktails ($50K)",
      "Block Party rum bar activation ($55K)",
      "Commonwealth rooftop rum cocktail program ($35K)",
    ],
  },
  {
    id: "beer",
    name: "Beer / Hard Seltzer",
    icon: "\u{1F37A}",
    currentRevenue: 24000,
    projectedRevenue: 350000,
    venuesActive: 1,
    totalVenues: 9,
    opportunityScore: 90,
    status: "high-potential",
    notes: "Only Modelo at Park. Block Party alone could command a major beer sponsor. Draft lines across 9 venues untapped.",
    topOpportunities: [
      "Block Party presenting beer sponsor ($150K)",
      "Portfolio-wide draft line deal ($85K)",
      "We All Scream can/bucket program ($45K)",
      "La Mona Rosa featured tap ($30K)",
      "Patio venue seltzer exclusivity ($40K)",
    ],
  },
  {
    id: "energy",
    name: "Energy Drinks",
    icon: "\u26A1",
    currentRevenue: 0,
    projectedRevenue: 220000,
    venuesActive: 0,
    totalVenues: 9,
    opportunityScore: 85,
    status: "untapped",
    notes: "Zero energy drink presence. EDM venues (Discopussy, We All Scream) + Block Party are perfect for Red Bull / Monster / Celsius.",
    topOpportunities: [
      "Block Party official energy sponsor ($80K)",
      "Discopussy mixer partnership ($50K)",
      "We All Scream branded coolers ($40K)",
      "Cross-venue mixer well deal ($50K)",
    ],
  },
  {
    id: "nonalc",
    name: "Non-Alcoholic / Lifestyle",
    icon: "\u{1F343}",
    currentRevenue: 0,
    projectedRevenue: 120000,
    venuesActive: 0,
    totalVenues: 9,
    opportunityScore: 65,
    status: "emerging",
    notes: "Growing category. Peyote brunch and daytime programming ideal for Athletic Brewing, Liquid Death, etc.",
    topOpportunities: [
      "Block Party hydration sponsor ($40K)",
      "Doberman premium N/A options ($30K)",
      "Park On Fremont brunch mocktail menu ($25K)",
      "Cross-venue mocktail program ($25K)",
    ],
  },
  {
    id: "tech",
    name: "Tech / POS / Payments",
    icon: "\u{1F4F1}",
    currentRevenue: 0,
    projectedRevenue: 150000,
    venuesActive: 0,
    totalVenues: 9,
    opportunityScore: 70,
    status: "untapped",
    notes: "9 venues = massive POS/payments footprint. Tab management, contactless payments, loyalty programs.",
    topOpportunities: [
      "Portfolio-wide POS system deal ($80K)",
      "Block Party cashless payment sponsor ($40K)",
      "Loyalty/rewards platform partnership ($30K)",
    ],
  },
];
