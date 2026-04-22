// Per-event social performance data. Currently hardcoded from Sprout Social
// "Tag Performance" reports. Admin upload form is deferred — when ready, add a
// `social String?` field to FtbRecap and prefer DB-sourced data over this map.

export interface SocialPostHighlight {
  account: string;
  platform: "instagram" | "tiktok" | "facebook" | "twitter" | "youtube";
  date: string;
  caption: string;
  engagements: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
}

export interface SocialPhase {
  posts: number;
  impressions: number;
  engagements: number;
  videoViews: number;
  avgReachPerPost: number;
}

export interface SocialAggregate {
  reportWindow: { start: string; end: string };
  accountsTagged: number;
  platforms: number;
  totals: {
    posts: number;
    impressions: number;
    engagements: number;
    engagementRate: number; // as percentage, e.g. 3.1
    videoViews: number;
    avgReachPerPost: number;
    linkClicks: number;
  };
  phases: {
    pre: SocialPhase;
    during: SocialPhase;
    post: SocialPhase;
  };
  topPosts: SocialPostHighlight[];
  source: "sprout-social" | "manual";
}

const MARSHMELLO_APR2_SOCIAL: SocialAggregate = {
  reportWindow: { start: "March 25, 2026", end: "April 17, 2026" },
  accountsTagged: 44,
  platforms: 5,
  totals: {
    posts: 507,
    impressions: 829_459,
    engagements: 25_314,
    engagementRate: 3.1,
    videoViews: 138_052,
    avgReachPerPost: 1_069,
    linkClicks: 52,
  },
  phases: {
    pre: {
      posts: 176,
      impressions: 452_836,
      engagements: 20_913,
      videoViews: 83_288,
      avgReachPerPost: 1_413,
    },
    during: {
      posts: 286,
      impressions: 293_599,
      engagements: 770,
      videoViews: 0,
      avgReachPerPost: 826,
    },
    post: {
      posts: 45,
      impressions: 83_024,
      engagements: 3_631,
      videoViews: 54_764,
      avgReachPerPost: 1_387,
    },
  },
  topPosts: [
    {
      account: "@dtlv",
      platform: "instagram",
      date: "March 25, 2026",
      caption: "FEED THE BLOCK: 1 YEAR ANNIVERSARY W/ MARSHMELLO",
      engagements: 9_343,
      likes: 2_455,
      comments: 431,
      shares: 6_218,
      saves: 239,
    },
    {
      account: "@blockpartyvegas",
      platform: "instagram",
      date: "March 26, 2026",
      caption: "FREE BLOCK PARTY w/ @marshmello",
      engagements: 2_417,
      likes: 810,
      comments: 140,
      shares: 1_385,
      saves: 82,
    },
    {
      account: "@blockpartyvegas",
      platform: "instagram",
      date: "March 30, 2026",
      caption: "FREE BLOCK PARTY w/ @marshmello this Thursday",
      engagements: 2_407,
      likes: 824,
      comments: 107,
      shares: 1_389,
      saves: 87,
    },
    {
      account: "@commonwealthdtlv",
      platform: "instagram",
      date: "March 25, 2026",
      caption: "FEED THE BLOCK: 1 YEAR ANNIVERSARY W/ MARSHMELLO",
      engagements: 2_305,
      likes: 643,
      comments: 133,
      shares: 1_462,
      saves: 67,
    },
    {
      account: "@feedtheblocklv",
      platform: "instagram",
      date: "April 6, 2026",
      caption:
        "One year of @feedtheblocklv — and we celebrated with 20,000 of our closest friends",
      engagements: 1_654,
      likes: 1_178,
      comments: 37,
      shares: 363,
      saves: 76,
    },
    {
      account: "@feedtheblocklv",
      platform: "instagram",
      date: "April 1, 2026",
      caption: "@feedtheblocklv & @marshmello take over the streets of @dtlv TOMORROW",
      engagements: 1_322,
      likes: 465,
      comments: 19,
      shares: 766,
      saves: 72,
    },
  ],
  source: "sprout-social",
};

const SOCIAL_BY_EVENT: Record<string, SocialAggregate> = {
  "marshmello-apr2-2026": MARSHMELLO_APR2_SOCIAL,
};

export function getSocialForEvent(eventId: string): SocialAggregate | null {
  return SOCIAL_BY_EVENT[eventId] ?? null;
}
