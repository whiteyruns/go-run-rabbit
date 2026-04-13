"use client";

import Link from "next/link";

/* ── SWOT Data ────────────────────────────────────────────────────── */

const strengths = [
  {
    title: "Only Bookable Entertainment District in LV",
    detail: "No other operator offers a multi-venue, street-level district that can be privately activated end-to-end. Area15 is closest but is indoor-only and art-focused.",
  },
  {
    title: "16 Venues Under One Operator",
    detail: "Corner Bar Management controls 16 venues on a single city block — enabling unified pricing, coordinated programming, and seamless full-district buyouts with a single contract.",
  },
  {
    title: "Wynn Nightlife Partnership",
    detail: "Access to Strip-tier DJ roster (Marshmello, Diplo, Major Lazer, Gryffin) at downtown pricing. This partnership bridges Strip prestige with Fremont authenticity.",
  },
  {
    title: "Proven Event Scale — Feed the Block",
    detail: "40K+ total attendance across 2025 season. Marshmello drew 20K to a single free event (April 2026). Demonstrates the district can operate as a large-scale event platform.",
  },
  {
    title: "Street-Level Authenticity",
    detail: "Organic, walkable urban nightlife district with independently operated venue concepts, street culture, and Burning Man-adjacent creative energy. Cannot be replicated by resorts or constructed theme parks.",
  },
  {
    title: "Full Operational Control",
    detail: "CBM controls F&B, staffing, security, production, street closures, and access control across the entire district. Single point of contact for event producers — no multi-vendor coordination required.",
  },
  {
    title: "Institutional Validation",
    detail: "$400K in confirmed sponsorships from LVCVA and City of Las Vegas for Feed the Block 2026. Government backing signals credibility to corporate sponsors.",
  },
];

const weaknesses = [
  {
    title: "No Dynamic Pricing or Self-Service Cart",
    detail: "East Fremont District site handles inquiries and showcases inventory, but lacks UrVenue-style dynamic pricing, real-time availability, or a self-service package builder that corporate planners increasingly expect.",
  },
  {
    title: "Production Capability Gap",
    detail: "Unlike Freeman/Sparks or Area15's in-house team, CBM relies on third-party production partners for large-scale AV, staging, and technical production.",
  },
  {
    title: "Brand Awareness Outside LV Nightlife",
    detail: "Strong local reputation but limited national recognition among corporate event planners and experiential agencies compared to Strip properties.",
  },
  {
    title: "Downtown Location Perception",
    detail: "Despite Fremont's renaissance, some corporate buyers still perceive downtown as secondary to the Strip. Requires education and site visits to overcome.",
  },
  {
    title: "Weather Dependency",
    detail: "Open-air street events are subject to Las Vegas heat (June–September highs of 105°F+) and occasional rain. No climate-controlled indoor fallback at district scale.",
  },
  {
    title: "Sponsorship Revenue Capture Rate",
    detail: "Currently capturing an estimated fraction of total addressable sponsorship opportunity. Beverage, energy, tech, and lifestyle categories have zero sponsor presence.",
  },
  {
    title: "Limited Consumer Data Infrastructure",
    detail: "No centralized CRM, email capture system, or first-party data platform across the 16 venues. Audience insights rely on event-specific signups rather than persistent profiles.",
  },
];

const opportunities = [
  {
    title: "Category Creation — \"Bookable District\"",
    detail: "No one owns this category nationally. First-mover advantage to define, brand, and dominate the \"bookable entertainment district\" concept before competitors replicate.",
  },
  {
    title: "Experiential Agency Channel",
    detail: "Freeman ($1.4B), Sparks (ADWEEK Agency of the Year), GPJ ($750M), Jack Morton, and NVE ($75M) all need differentiated venues. EFD becomes inventory they program and sell to Fortune 500 clients.",
  },
  {
    title: "DMC Partnership Pipeline",
    detail: "Las Vegas DMCs (Hosts Global, Destination Fabulous, aVenue) orchestrate but don't own venues. A bookable district is their dream product — channel partnership could drive steady corporate bookings.",
  },
  {
    title: "Experiential REIT Capital",
    detail: "VICI Properties (owns Caesars Palace, MGM Grand) and EPR Properties ($200-300M annual investment budget) are actively seeking experiential real estate. Potential financing or acquisition partner.",
  },
  {
    title: "LINQ Promenade Retreat",
    detail: "TPG/Acadia's $275M acquisition shifts LINQ toward real estate ROI, not experiential activation. Reduces competitive pressure in the brand activation space on the Strip.",
  },
  {
    title: "Downtown Las Vegas Renaissance",
    detail: "DTLV is experiencing a cultural and investment surge — new restaurants, art installations, and residential development are driving foot traffic and repositioning downtown as a credible alternative to the Strip for experiential events.",
  },
  {
    title: "84% of Marketers Increasing Event Spend",
    detail: "Experiential marketing now captures 38% of services spend (surpassing digital at 35%). The $55.5B market is projected to reach $71.2B by 2035. Tailwind for the entire category.",
  },
];

const threats = [
  {
    title: "Area15 Expansion",
    detail: "40-acre campus expanding with 18+ new tenants, Boeing 747 event venue (Altair Lounge), and Museum of Ice Cream flagship. Aggressively positioning as the bookable experiential district.",
  },
  {
    title: "Resort Takeover Packages",
    detail: "MGM Grand (850K sq ft), Wynn/Encore (Forbes 5-star), and Resorts World (70K sq ft Complex) offer single-contract, turnkey event packages. Compete on simplicity and luxury.",
  },
  {
    title: "LVCC Experiential Pivot",
    detail: "$600M renovation complete. 4.6M sq ft campus pivoting from pure convention to experiential programming. 48+ trade shows projected in 2026 with 1.23M attendees.",
  },
  {
    title: "Wynn Partnership Dependency",
    detail: "Strip-tier talent access depends on the Wynn Nightlife relationship. Loss or renegotiation of this partnership would significantly impact Feed the Block's headliner draw.",
  },
  {
    title: "Insomniac / Live Nation Entry",
    detail: "Insomniac (~$544M revenue) has massive LV presence and could offer festival-style private buyouts. Live Nation's infrastructure could undercut on scale.",
  },
  {
    title: "Economic Downturn Impact",
    detail: "Experiential marketing budgets are among the first to be cut in recessions. A downturn would hit both corporate bookings and consumer-facing events simultaneously.",
  },
  {
    title: "City Permitting & Regulatory Risk",
    detail: "Street closures, noise ordinances, and liquor licensing for open-air district events require city cooperation. Regulatory changes could constrain operations.",
  },
];

/* ── Cross-Analysis ───────────────────────────────────────────────── */

const soStrategies = [
  {
    match: "Only Bookable District + Category Creation",
    strategy: "Launch a national PR and sales campaign positioning EFD as the inventor of the \"bookable entertainment district\" category. File trademark, create industry whitepaper, present at IMEX and experiential marketing conferences.",
  },
  {
    match: "Wynn Partnership + Agency Channel",
    strategy: "Package the Wynn talent roster as a differentiator in agency pitches. \"Book the district, get Strip-tier entertainment\" is a value prop no hotel or convention center can match.",
  },
  {
    match: "Institutional Validation + REIT Capital",
    strategy: "Use LVCVA/City sponsorship as proof of concept when approaching VICI or EPR for growth capital. Government backing de-risks the investment thesis for institutional partners.",
  },
  {
    match: "Proven Scale + DMC Pipeline",
    strategy: "Arm DMCs with Feed the Block attendance data (20K single event, 40K+ season) as sales collateral. Formalize preferred partner agreements with top 5 Las Vegas DMCs.",
  },
];

const wtRisks = [
  {
    match: "No Dynamic Pricing + Area15 Expansion",
    risk: "Area15's growing scale + potential for sophisticated self-service booking could create friction in corporate RFPs. EFD's inquiry-based flow works but may need real-time availability and package configuration to stay competitive.",
  },
  {
    match: "Production Gap + Resort Takeovers",
    risk: "Resorts offer one-stop-shop production (AV, staging, catering). Without in-house production, EFD adds complexity for event planners. Mitigate via exclusive production partner deal.",
  },
  {
    match: "Weather Dependency + Downturn",
    risk: "Summer heat already limits peak-season outdoor events. An economic downturn simultaneously shrinking budgets would compress the viable event calendar. Develop indoor/hybrid formats.",
  },
  {
    match: "Wynn Dependency + Insomniac Entry",
    risk: "If Wynn redirects its nightlife resources or Insomniac enters the district-event space with its own talent, EFD's headline draw is at risk. Diversify talent sourcing beyond a single partner.",
  },
];

/* ── Porter's Five Forces ─────────────────────────────────────────── */

interface Force {
  name: string;
  score: number;
  summary: string;
  drivers: string[];
  mitigants: string[];
}

const forces: Force[] = [
  {
    name: "Supplier Power",
    score: 5,
    summary: "Moderate. Key suppliers are talent (DJs/performers), production companies, and the City of Las Vegas (permits). Talent is concentrated but the Wynn partnership provides access.",
    drivers: [
      "A-list DJ fees are high and non-negotiable ($100K-$500K+ per appearance)",
      "Production companies have leverage during peak Vegas event season (CES, F1, NYE)",
      "City permitting is a gatekeeper — street closures require municipal approval",
      "Alcohol distributors (Southern Glazer's, RNDC) have consolidation leverage",
    ],
    mitigants: [
      "Wynn partnership provides preferred talent access at better rates",
      "CBM controls its own F&B operations — not dependent on external catering",
      "Multiple production companies compete for Vegas events — not a monopoly",
      "Strong city relationship evidenced by LVCVA sponsorship",
    ],
  },
  {
    name: "Buyer Power",
    score: 6,
    summary: "Moderate-High. Corporate event buyers are sophisticated, comparison-shop heavily, and can choose from dozens of Vegas venues. However, EFD's unique format reduces direct comparability.",
    drivers: [
      "Large corporate buyers (Fortune 500) have significant budget leverage",
      "Event planners compare 5-10 venues per RFP — high switching costs are low",
      "Price transparency increasing via online venue marketplaces (Cvent, Peerspace)",
      "Brands can assemble similar experiences via DMCs without using EFD",
    ],
    mitigants: [
      "No direct substitute for a bookable entertainment district — limits true comparison",
      "Once a brand activates at EFD, switching costs increase (knowledge of layout, staff relationships)",
      "Feed the Block's audience data gives EFD quantifiable ROI that generic venues can't match",
      "Street-level authenticity cannot be replicated — it's not a commodity product",
    ],
  },
  {
    name: "Competitive Rivalry",
    score: 4,
    summary: "Low-Moderate. In the specific \"bookable district\" category, rivalry is minimal — Area15 is the only direct competitor. Broader Las Vegas event venues create more diffuse competition.",
    drivers: [
      "Area15 expanding aggressively (40 acres, 18+ new tenants, $8K-$25K events)",
      "Las Vegas has massive event venue supply overall",
      "Strip properties compete on luxury and convenience",
      "Low differentiation among traditional hotel event spaces drives price competition",
    ],
    mitigants: [
      "EFD is the ONLY street-level, multi-venue bookable district",
      "Area15 skews art/immersive — different audience and use case",
      "Hotels compete with each other more than with district concepts",
      "Feed the Block creates demand that doesn't exist at other venues",
    ],
  },
  {
    name: "Threat of Substitution",
    score: 7,
    summary: "High. Brands have many alternative ways to achieve experiential marketing goals — pop-ups, festival sponsorships, hotel takeovers, virtual events, and retail activations.",
    drivers: [
      "Pop-up activations in any city can substitute for a Vegas district event",
      "Festival sponsorships (EDC, Coachella) reach similar demographics at scale",
      "Virtual and hybrid events matured post-COVID and remain budget-friendly",
      "Retail-as-experience (Brookfield model) gives brands owned experiential spaces",
      "Hotel pool parties and rooftop events replicate outdoor nightlife energy",
    ],
    mitigants: [
      "No substitute replicates the multi-venue, walkable district format",
      "Vegas itself is a draw — 40M+ annual visitors, convention-adjacent",
      "Physical events deliver ROI that virtual cannot match (84% of marketers agree)",
      "EFD's format is complementary to festivals, not competing — brands do both",
    ],
  },
  {
    name: "Threat of New Entry",
    score: 3,
    summary: "Low. Creating a multi-venue entertainment district requires years of real estate assembly, liquor licensing, city relationships, operational expertise, and capital. Extremely high barriers.",
    drivers: [
      "Experiential REITs (VICI, EPR) have capital to invest in new district concepts",
      "Developers could replicate the model in other downtowns (Austin, Nashville, Miami)",
      "Existing entertainment operators (Insomniac, AEG) have event expertise",
    ],
    mitigants: [
      "Real estate assembly on Fremont East took 10+ years — cannot be fast-followed",
      "16 liquor licenses, city permitting relationships, and operational knowledge are deep moats",
      "Brand reputation and venue operator relationships take years to build",
      "Feed the Block audience + sponsor data creates a compounding data advantage",
      "Downtown Las Vegas has limited remaining blocks suitable for district development",
    ],
  },
];

const industryAttractiveness = 5.0;

const forceColor = (score: number) => {
  if (score >= 7) return "#ff6b98";
  if (score >= 5) return "#aea2ff";
  return "#00eefc";
};

/* ── Component ────────────────────────────────────────────────────── */

export default function SwotPortersPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/corner-bar-management"
          className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors"
        >
          &larr; Corner Bar Management
        </Link>
      </div>
      <div className="mb-10">
        <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
          East Fremont District
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          SWOT &amp; PORTER&apos;S FIVE FORCES
        </h1>
        <p className="text-on-surface-variant max-w-3xl">
          Combined strategic analysis — internal positioning assessment and industry
          structure evaluation for the bookable entertainment district category.
        </p>
      </div>

      <div className="space-y-10">

        {/* ── SWOT Grid ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">SWOT Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Strengths */}
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-neon-cyan text-lg">&#9650;</span>
                <h3 className="text-neon-cyan font-extrabold text-lg tracking-tight uppercase">Strengths</h3>
                <span className="text-on-surface-variant text-xs ml-auto">{strengths.length} factors</span>
              </div>
              <div className="space-y-4">
                {strengths.map((s, i) => (
                  <div key={i}>
                    <p className="text-on-surface font-bold text-sm mb-1">{s.title}</p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-neon-pink text-lg">&#9660;</span>
                <h3 className="text-neon-pink font-extrabold text-lg tracking-tight uppercase">Weaknesses</h3>
                <span className="text-on-surface-variant text-xs ml-auto">{weaknesses.length} factors</span>
              </div>
              <div className="space-y-4">
                {weaknesses.map((w, i) => (
                  <div key={i}>
                    <p className="text-on-surface font-bold text-sm mb-1">{w.title}</p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{w.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-neon-violet text-lg">&#9733;</span>
                <h3 className="text-neon-violet font-extrabold text-lg tracking-tight uppercase">Opportunities</h3>
                <span className="text-on-surface-variant text-xs ml-auto">{opportunities.length} factors</span>
              </div>
              <div className="space-y-4">
                {opportunities.map((o, i) => (
                  <div key={i}>
                    <p className="text-on-surface font-bold text-sm mb-1">{o.title}</p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{o.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-on-surface text-lg">&#9888;</span>
                <h3 className="text-on-surface font-extrabold text-lg tracking-tight uppercase">Threats</h3>
                <span className="text-on-surface-variant text-xs ml-auto">{threats.length} factors</span>
              </div>
              <div className="space-y-4">
                {threats.map((t, i) => (
                  <div key={i}>
                    <p className="text-on-surface font-bold text-sm mb-1">{t.title}</p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{t.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cross-Analysis ────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">Cross-Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SO Strategies */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-neon-cyan">&#9650;</span>
                <span className="text-neon-violet">&#9733;</span>
                <h3 className="text-on-surface font-extrabold text-lg tracking-tight">SO Strategies</h3>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">Strengths matched to opportunities — offensive plays</p>
              <div className="space-y-4">
                {soStrategies.map((s, i) => (
                  <div key={i} className="bg-surface-container rounded-xl p-4">
                    <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-2">{s.match}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{s.strategy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WT Risks */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-neon-pink">&#9660;</span>
                <span className="text-on-surface">&#9888;</span>
                <h3 className="text-on-surface font-extrabold text-lg tracking-tight">WT Risks</h3>
              </div>
              <p className="text-on-surface-variant text-xs mb-4">Weaknesses exposed by threats — defensive priorities</p>
              <div className="space-y-4">
                {wtRisks.map((r, i) => (
                  <div key={i} className="bg-surface-container rounded-xl p-4">
                    <p className="text-neon-pink text-[10px] font-bold tracking-[0.15em] uppercase mb-2">{r.match}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{r.risk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Porter's Five Forces ──────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Porter&apos;s Five Forces</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Industry structure analysis — each force rated 1-10 (higher = more pressure on EFD)
          </p>

          {/* Score Summary */}
          <div className="bg-surface-container-low rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-on-surface font-extrabold text-lg">Industry Attractiveness</h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold font-mono text-neon-cyan">{industryAttractiveness.toFixed(1)}</span>
                <span className="text-on-surface-variant text-xs">/10</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {forces.map((f) => (
                <div key={f.name} className="text-center">
                  <div
                    className="text-2xl font-extrabold font-mono mb-1"
                    style={{ color: forceColor(f.score) }}
                  >
                    {f.score}
                  </div>
                  <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    {f.name.replace("Threat of ", "")}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-on-surface-variant text-sm mt-4 leading-relaxed">
              The bookable entertainment district category is <strong className="text-on-surface">moderately attractive</strong>.
              Low barriers to entry (score 3) and low direct rivalry (score 4) create favorable conditions for the incumbent.
              High substitution threat (score 7) is the primary structural risk — brands have many alternative
              ways to achieve experiential goals. The key strategic imperative is to make the district format
              irreplaceable, not just preferable.
            </p>
          </div>

          {/* Individual Forces */}
          <div className="space-y-4">
            {forces.map((f) => (
              <details key={f.name} className="bg-surface-container-high rounded-xl group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold font-mono text-lg"
                        style={{ background: `${forceColor(f.score)}15`, color: forceColor(f.score) }}
                      >
                        {f.score}
                      </div>
                      <h4 className="text-on-surface font-bold text-lg">{f.name}</h4>
                    </div>
                    <span className="text-on-surface-variant text-lg group-open:rotate-180 transition-transform">&#9662;</span>
                  </div>
                </summary>
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.summary}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-pink mb-2">Pressure Drivers</p>
                      <ul className="space-y-1.5">
                        {f.drivers.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-pink mt-0.5 text-xs">&#9650;</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mb-2">Mitigants</p>
                      <ul className="space-y-1.5">
                        {f.mitigants.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-cyan mt-0.5 text-xs">&#9660;</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Strategic Imperatives ─────────────────────────────── */}
        <div className="bg-surface-container rounded-xl p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">Strategic Imperatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                priority: "1",
                title: "Own the Category",
                body: "No one has claimed \"bookable entertainment district\" nationally. Define it, brand it, trademark it. Present at IMEX, partner with industry publications, create the category before a competitor names it.",
                accent: "#00eefc",
              },
              {
                priority: "2",
                title: "Enhance EFD with Dynamic Pricing",
                body: "The East Fremont District site already handles inquiries and showcases inventory. Next level: add real-time availability, dynamic pricing for peak dates, and a self-service package configurator so corporate planners can scope events without a phone call.",
                accent: "#aea2ff",
              },
              {
                priority: "3",
                title: "Lock In Channel Partners",
                body: "Formalize preferred partnerships with top 3 DMCs and top 2 experiential agencies. Give them sales tools (attendance data, case studies, branded pitch decks) and commission structure. Let them sell EFD into their existing pipelines.",
                accent: "#00eefc",
              },
              {
                priority: "4",
                title: "Reduce Substitution Threat",
                body: "Make the district format irreplaceable, not just preferable. Build exclusive programming (Wynn roster), proprietary audience data, and integrated sponsor packages that can't be assembled piecemeal elsewhere.",
                accent: "#ff6b98",
              },
              {
                priority: "5",
                title: "Diversify Talent Access",
                body: "Wynn partnership is a strength but also a single point of failure. Develop direct relationships with booking agents, smaller labels, and emerging artists to ensure headliner access survives any partnership changes.",
                accent: "#aea2ff",
              },
              {
                priority: "6",
                title: "Capture First-Party Data",
                body: "Implement a unified CRM across all 16 venues. Every event signup, QR scan, and WiFi login should feed a central profile. This data becomes the moat — it compounds over time and makes sponsorship ROI provable.",
                accent: "#ff6b98",
              },
            ].map((item) => (
              <div key={item.priority} className="bg-surface-container-high rounded-xl p-6" style={{ borderLeft: `2px solid ${item.accent}40` }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-extrabold font-mono" style={{ color: item.accent }}>#{item.priority}</span>
                  <h4 className="text-on-surface font-bold">{item.title}</h4>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
