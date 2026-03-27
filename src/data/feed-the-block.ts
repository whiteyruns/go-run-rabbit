/**
 * Feed the Block event series data — free open-air block party at 6th & Fremont.
 * Source: cbm/index.html
 */

export interface ConfirmedSponsor {
  name: string;
  amount: number;
  type: string;
}

export interface SponsorshipTier {
  tier: string;
  price: string;
  value: number;
  benefits: string[];
}

export interface FeedTheBlock {
  name: string;
  description: string;
  partner: string;
  year2025: {
    totalShows: number;
    totalAttendance: number;
    headliners: string[];
  };
  year2026: {
    plannedShows: number;
    projectedAttendancePerShow: number;
    projectedTotalAttendance: number;
    confirmedHeadliners: string[];
    remainingSlots: number;
    kickoff: string;
  };
  confirmedSponsors: ConfirmedSponsor[];
  confirmedTotal: number;
  sponsorshipTiers: SponsorshipTier[];
}

export const feedTheBlock: FeedTheBlock = {
  name: "Feed the Block",
  description: "Free open-air block party series at 6th & Fremont",
  partner: "Wynn Nightlife",
  year2025: {
    totalShows: 3,
    totalAttendance: 40000,
    headliners: ["Gryffin", "Diplo / Major Lazer", "Diplo"],
  },
  year2026: {
    plannedShows: 10,
    projectedAttendancePerShow: 10000,
    projectedTotalAttendance: 100000,
    confirmedHeadliners: ["Marshmello (Apr 2)"],
    remainingSlots: 9,
    kickoff: "April 2, 2026",
  },
  confirmedSponsors: [
    { name: "LVCVA", amount: 250000, type: "Municipal / Tourism" },
    { name: "City of Las Vegas", amount: 150000, type: "Municipal / Government" },
  ],
  confirmedTotal: 400000,
  sponsorshipTiers: [
    {
      tier: "Presenting",
      price: "$500,000",
      value: 500000,
      benefits: [
        "Name-in-title (Feed the Block presented by [Brand])",
        "Exclusive pour rights across all 10 events",
        "Main stage branding & LED integration",
        "VIP area naming rights",
        "Social media co-branding (est. 50M+ impressions)",
        "On-site sampling & activation zone",
        "Artist meet & greet integration",
      ],
    },
    {
      tier: "Headline",
      price: "$250,000",
      value: 250000,
      benefits: [
        "Category exclusivity (e.g., sole tequila brand)",
        "Stage-adjacent branding",
        "VIP bar feature",
        "Social media package (est. 20M+ impressions)",
        "Sampling activations at 5 events",
        "Custom branded content",
      ],
    },
    {
      tier: "Supporting",
      price: "$100,000",
      value: 100000,
      benefits: [
        "Bar menu feature across events",
        "Signage and digital presence",
        "Social media mentions",
        "Sampling at 3 events",
        "Brand ambassador presence",
      ],
    },
    {
      tier: "Activation",
      price: "$40,000",
      value: 40000,
      benefits: [
        "Pop-up activation booth at events",
        "Branded giveaways",
        "Social media mention",
        "Event program listing",
      ],
    },
  ],
};
