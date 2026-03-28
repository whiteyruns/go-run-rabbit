/**
 * Feed the Block event series data — free open-air block party at 6th & Fremont.
 * Updated with actual data from City of Las Vegas sponsorship deck (Feb 2026).
 */

export interface ConfirmedSponsor {
  name: string;
  amount: number;
  type: string;
  status: "closed" | "pending";
}

export interface SponsorshipTier {
  tier: string;
  price: string;
  value: number;
  benefits: string[];
}

export interface EventPerformance {
  headliner: string;
  date: string;
  attendance: string;
  signups: number;
  casinoCrossover: string;
}

export interface SocialMetrics {
  impressions: number;
  engagements: number;
  videoViews: number;
  newFollowers: number;
  followerGrowth: string;
  tiktokImpressions: number;
  tiktokEngagement: string;
  instagramImpressions: number;
  viralReelViews: number;
  viralTiktokViews: number;
}

export interface AudienceProfile {
  medianAge: number;
  dwellTimeMinutes: string;
  stayOver45MinPct: number;
  hispanicLatinoPct: number;
  topMarkets: string[];
  searchOriginZones: string[];
}

export interface FeedTheBlock {
  name: string;
  description: string;
  partner: string;
  year2025: {
    totalShows: number;
    totalAttendance: number;
    totalSignups: number;
    headliners: string[];
    events: EventPerformance[];
  };
  year2026: {
    plannedShows: number;
    projectedAttendancePerShow: number;
    projectedTotalAttendance: number;
    confirmedHeadliners: string[];
    remainingSlots: number;
    kickoff: string;
    contentSpendPerEvent: string;
  };
  confirmedSponsors: ConfirmedSponsor[];
  confirmedTotal: number;
  socialMetrics: SocialMetrics;
  audienceProfile: AudienceProfile;
  sponsorshipTiers: SponsorshipTier[];
}

export const feedTheBlock: FeedTheBlock = {
  name: "Feed the Block",
  description: "Free open-air block party series at 6th & Fremont",
  partner: "Wynn Nightlife",

  year2025: {
    totalShows: 3,
    totalAttendance: 32000,
    totalSignups: 30061,
    headliners: ["Gryffin", "Major Lazer", "Diplo"],
    events: [
      { headliner: "Gryffin", date: "April 2025", attendance: "9,700-10,000+", signups: 8769, casinoCrossover: "8,700+" },
      { headliner: "Major Lazer", date: "September 2025", attendance: "12,000-15,000+", signups: 11736, casinoCrossover: "10,000+" },
      { headliner: "Diplo", date: "October 2025", attendance: "10,000-12,000+", signups: 10356, casinoCrossover: "9,000+" },
    ],
  },

  year2026: {
    plannedShows: 10,
    projectedAttendancePerShow: 10000,
    projectedTotalAttendance: 100000,
    confirmedHeadliners: ["Marshmello (Apr 2)"],
    remainingSlots: 9,
    kickoff: "April 2, 2026",
    contentSpendPerEvent: "$25,000-$30,000",
  },

  confirmedSponsors: [
    { name: "LVCVA", amount: 200000, type: "Municipal / Tourism", status: "closed" },
    { name: "City of Las Vegas", amount: 200000, type: "Municipal / Government", status: "closed" },
  ],
  confirmedTotal: 400000,

  socialMetrics: {
    impressions: 7976920,
    engagements: 306159,
    videoViews: 2405321,
    newFollowers: 23500,
    followerGrowth: "+123.1%",
    tiktokImpressions: 609000,
    tiktokEngagement: "8%",
    instagramImpressions: 724000,
    viralReelViews: 2300000,
    viralTiktokViews: 112000,
  },

  audienceProfile: {
    medianAge: 36,
    dwellTimeMinutes: "30-44",
    stayOver45MinPct: 65,
    hispanicLatinoPct: 34,
    topMarkets: ["Las Vegas", "Los Angeles", "New York", "San Diego"],
    searchOriginZones: ["Paradise, NV (The Strip)", "Las Vegas", "Henderson"],
  },

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
