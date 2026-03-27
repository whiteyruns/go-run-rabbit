/**
 * Guest journey paths and cross-venue flow statistics.
 * Source: cbm/index.html
 */

export interface JourneyTouchpoint {
  venue: string;
  time: string;
  activity: string;
  dwell: string;
  spend: string;
}

export interface GuestJourney {
  name: string;
  description: string;
  avgGuestsPerNight: number;
  touchpoints: number;
  brandExposures: number;
  path: JourneyTouchpoint[];
}

export interface CrossVenueStats {
  avgVenuesPerGuest: number;
  avgDwellTime: number;
  avgSpendPerJourney: number;
  repeatVisitRate: number;
  brandTouchpointsPerNight: number;
  weeklyJourneys: number;
  annualJourneys: number;
}

export const guestJourneys: GuestJourney[] = [
  {
    name: "The Nightlife Circuit",
    description: "Peak Friday/Saturday path \u2014 dinner to late-night",
    avgGuestsPerNight: 1200,
    touchpoints: 3.4,
    brandExposures: 4080,
    path: [
      { venue: "Park On Fremont", time: "6\u20138 PM", activity: "Dinner + cocktails", dwell: "90 min", spend: "$55" },
      { venue: "Commonwealth", time: "8\u201310 PM", activity: "Rooftop drinks", dwell: "75 min", spend: "$42" },
      { venue: "Discopussy", time: "10 PM\u20131 AM", activity: "Dancing + nightlife", dwell: "120 min", spend: "$65" },
    ],
  },
  {
    name: "The Tequila Trail",
    description: "Agave-focused crawl \u2014 premium tequila sponsorship goldmine",
    avgGuestsPerNight: 600,
    touchpoints: 2.8,
    brandExposures: 1680,
    path: [
      { venue: "La Mona Rosa", time: "7\u20139 PM", activity: "Mexican dinner + margaritas", dwell: "90 min", spend: "$48" },
      { venue: "Lucky Day", time: "9\u201311 PM", activity: "Mezcal tasting + cocktails", dwell: "75 min", spend: "$38" },
      { venue: "Commonwealth", time: "11 PM+", activity: "Late-night rooftop", dwell: "60 min", spend: "$35" },
    ],
  },
  {
    name: "The VIP Experience",
    description: "Premium guest journey \u2014 ultra-high-value brand contacts",
    avgGuestsPerNight: 200,
    touchpoints: 3.2,
    brandExposures: 640,
    path: [
      { venue: "The Laundry Room", time: "7\u20139 PM", activity: "Speakeasy cocktails (reservation)", dwell: "90 min", spend: "$85" },
      { venue: "Doberman Drawing Room", time: "9\u201311 PM", activity: "Drawing room cocktails", dwell: "75 min", spend: "$70" },
      { venue: "We All Scream", time: "11 PM+", activity: "VIP section + rooftop", dwell: "90 min", spend: "$95" },
    ],
  },
  {
    name: "Block Party Spillover",
    description: "Feed the Block drives guests into venues before/after \u2014 massive amplifier",
    avgGuestsPerNight: 3500,
    touchpoints: 2.1,
    brandExposures: 7350,
    path: [
      { venue: "Block Party (6th & Fremont)", time: "6\u201310 PM", activity: "Main event + headliner", dwell: "180 min", spend: "$30" },
      { venue: "We All Scream / Discopussy", time: "10 PM\u20131 AM", activity: "After-party nightlife", dwell: "120 min", spend: "$55" },
      { venue: "La Mona Rosa / Park On Fremont", time: "Post-event", activity: "Late-night food + drinks", dwell: "60 min", spend: "$35" },
    ],
  },
];

export const crossVenueStats: CrossVenueStats = {
  avgVenuesPerGuest: 2.3,
  avgDwellTime: 195,
  avgSpendPerJourney: 142,
  repeatVisitRate: 0.68,
  brandTouchpointsPerNight: 3.1,
  weeklyJourneys: 8400,
  annualJourneys: 436800,
};
