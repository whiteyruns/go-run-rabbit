/**
 * Vegas tentpole event calendar with traffic and depletion multipliers.
 * Source: cbm/index.html
 */

export type TentpoleTier = "mega" | "major" | "seasonal";

export interface VegasTentpole {
  month: string;
  event: string;
  dates: string;
  attendees: number;
  trafficMultiplier: number;
  depletionMultiplier: number;
  tier: TentpoleTier;
}

export const vegasTentpoles: VegasTentpole[] = [
  { month: "Jan", event: "CES", dates: "Jan 6\u20139, 2027", attendees: 130000, trafficMultiplier: 3.5, depletionMultiplier: 3.2, tier: "mega" },
  { month: "Feb", event: "Super Bowl Week", dates: "Feb 2029", attendees: 150000, trafficMultiplier: 4.0, depletionMultiplier: 3.8, tier: "mega" },
  { month: "Mar", event: "March Madness / St. Patrick's", dates: "Mar 2027", attendees: 80000, trafficMultiplier: 2.5, depletionMultiplier: 2.8, tier: "major" },
  { month: "Apr", event: "NFL Draft / Block Party Kickoff", dates: "Apr 2\u20135, 2026", attendees: 200000, trafficMultiplier: 3.0, depletionMultiplier: 2.8, tier: "mega" },
  { month: "May", event: "EDC Weekend", dates: "May 16\u201318, 2026", attendees: 170000, trafficMultiplier: 3.8, depletionMultiplier: 4.0, tier: "mega" },
  { month: "Jun", event: "Summer Peak Begins", dates: "Jun\u2013Aug (annual)", attendees: 0, trafficMultiplier: 1.8, depletionMultiplier: 1.9, tier: "seasonal" },
  { month: "Jul", event: "4th of July / UFC Int'l Fight Week", dates: "Jul 1\u20136, 2026", attendees: 100000, trafficMultiplier: 2.8, depletionMultiplier: 3.0, tier: "major" },
  { month: "Aug", event: "Summer Wind-Down", dates: "Aug (annual)", attendees: 0, trafficMultiplier: 1.5, depletionMultiplier: 1.5, tier: "seasonal" },
  { month: "Sep", event: "iHeartRadio / Life is Beautiful", dates: "Sep 19\u201321, 2026", attendees: 75000, trafficMultiplier: 2.5, depletionMultiplier: 2.6, tier: "major" },
  { month: "Oct", event: "Halloween / F1 Las Vegas Leadup", dates: "Oct 2026", attendees: 90000, trafficMultiplier: 2.2, depletionMultiplier: 2.3, tier: "major" },
  { month: "Nov", event: "F1 Las Vegas Grand Prix / SEMA", dates: "Nov 4\u201322, 2026", attendees: 300000, trafficMultiplier: 4.5, depletionMultiplier: 4.2, tier: "mega" },
  { month: "Dec", event: "NYE / Holiday Season", dates: "Dec 20, 2026\u2013Jan 1, 2027", attendees: 400000, trafficMultiplier: 5.0, depletionMultiplier: 4.5, tier: "mega" },
];
