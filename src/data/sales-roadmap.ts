/**
 * Sales roadmap with phased action items for sponsorship development.
 * Source: cbm/index.html
 */

export interface RoadmapItem {
  action: string;
  owner: string;
  priority: string;
  notes: string;
}

export interface RoadmapPhase {
  name: string;
  color: string;
  items: RoadmapItem[];
}

export interface SalesRoadmap {
  phase1: RoadmapPhase;
  phase2: RoadmapPhase;
  phase3: RoadmapPhase;
  phase4: RoadmapPhase;
}

export const salesRoadmap: SalesRoadmap = {
  phase1: {
    name: "Immediate (Next 2 Weeks)",
    color: "#ef4444",
    items: [
      { action: "Request actual depletion reports from Corner Bar (all venues, last 12 months)", owner: "Keith / CBM Contact", priority: "Critical", notes: "Real data replaces estimates and 10x credibility" },
      { action: "Confirm all current brand deals and their terms (pour rights, signage, exclusivity)", owner: "CBM Contact", priority: "Critical", notes: "Map what's locked vs. open" },
      { action: "Lock Block Party Presenting Sponsor before April 2 Marshmello kickoff", owner: "Keith + CBM Sales", priority: "Critical", notes: "$500K opportunity \u2014 urgency is real, event is imminent" },
      { action: "Pull social media metrics across all venue accounts (followers, engagement, tagged posts)", owner: "CBM Marketing", priority: "High", notes: "Feeds into CPM analysis and brand pitch decks" },
    ],
  },
  phase2: {
    name: "Short-Term (30-60 Days)",
    color: "#eab308",
    items: [
      { action: "Build brand-specific pitch decks for top 5 target sponsors", owner: "Keith / Run Rabbit", priority: "High", notes: "Customize depletion + CPM data per brand" },
      { action: "Approach beer distributors for portfolio-wide draft line deal", owner: "CBM + Keith", priority: "High", notes: "Heineken, Constellation (Modelo), AB InBev \u2014 $85-150K opportunity" },
      { action: "Pitch energy drink partnership to Red Bull / Monster / Celsius", owner: "Keith", priority: "High", notes: "EDM venues + Block Party = natural fit, zero current presence" },
      { action: "Engage Diageo, Bacardi, Beam Suntory regional reps for portfolio conversations", owner: "Keith + CBM", priority: "High", notes: "Position the portfolio story, not individual venue deals" },
      { action: "Create a Cross-Venue Tequila Trail activation concept for agave brands", owner: "Keith / Run Rabbit", priority: "Medium", notes: "Lucky Day \u2192 La Mona Rosa \u2192 Commonwealth \u2014 branded journey" },
    ],
  },
  phase3: {
    name: "Medium-Term (60-120 Days)",
    color: "#3b82f6",
    items: [
      { action: "Close 2-3 category-exclusive house pour deals", owner: "CBM + Keith", priority: "High", notes: "Target: tequila, vodka, and beer categories first" },
      { action: "Negotiate POS/tech partnership (Toast, Square, or similar)", owner: "CBM Operations", priority: "Medium", notes: "9-venue deal = leverage for premium terms + sponsorship revenue" },
      { action: "Launch non-alc / lifestyle brand program at select venues", owner: "Keith", priority: "Medium", notes: "Athletic Brewing, Liquid Death, Celsius \u2014 growing category" },
      { action: "Develop Q3/Q4 tentpole-specific sponsorship packages", owner: "Keith / Run Rabbit", priority: "Medium", notes: "F1 week, Halloween, NYE \u2014 premium pricing windows" },
      { action: "Install measurement infrastructure (branded POS tracking, QR attribution)", owner: "CBM Tech", priority: "Medium", notes: "Proves ROI to sponsors \u2192 easier renewals \u2192 higher rates" },
    ],
  },
  phase4: {
    name: "Ongoing / Year 1 Goals",
    color: "#22c55e",
    items: [
      { action: "Achieve 50%+ sponsorship inventory fill rate across portfolio", owner: "All", priority: "Target", notes: "From current ~12% \u2192 $1.8M+ annual run rate" },
      { action: "Establish CBM as a unified sponsorship platform brand (not individual venues)", owner: "Keith / CBM Leadership", priority: "Strategic", notes: "The story is the portfolio, not Commonwealth or Lucky Day alone" },
      { action: "Build case study from first 2-3 sponsor partnerships with real depletion data", owner: "Keith", priority: "Strategic", notes: "Proven results = 2x-3x sponsor pipeline for Year 2" },
      { action: "Negotiate Year 2 renewals at 15-25% rate increases based on proven performance", owner: "Keith + CBM", priority: "Target", notes: "Retention + upsell is cheaper than new sales" },
    ],
  },
};
