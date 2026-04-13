"use client";

import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";

/* ── Data ─────────────────────────────────────────────────────────── */

const marketMetrics = [
  { label: "Experiential Market", value: "$55.5B", sub: "2026 global valuation", accent: true },
  { label: "Immersive Entertainment", value: "$144B", sub: "2025, CAGR 23.4%", accent: false },
  { label: "Marketers Increasing Spend", value: "84%", sub: "2026 event budgets", accent: true },
  { label: "Experiential Share", value: "38%", sub: "Surpassed digital (35%)", accent: false },
];

interface Competitor {
  name: string;
  type: string;
  capacity: string;
  privateBuyout: string;
  multiVenue: boolean;
  experiential: "Very High" | "High" | "Moderate" | "Low";
  threat: "HIGH" | "MOD-HIGH" | "MODERATE" | "LOW-MOD" | "LOW";
  pricing?: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string[];
}

const vegasCompetitors: Competitor[] = [
  {
    name: "Area15",
    type: "Entertainment District",
    capacity: "15,000",
    privateBuyout: "Full campus",
    multiVenue: true,
    experiential: "Very High",
    threat: "HIGH",
    pricing: "$8K–$25K+ (full buyout custom)",
    description:
      "40-acre immersive entertainment campus near the Strip. 15M+ cumulative visitors. 69% of visitors aged 18-34. The closest direct competitor to EFD's district model.",
    strengths: [
      "Full campus buyout for 15K guests",
      "Meow Wolf Omega Mart anchor tenant",
      "Zone 2 expansion adding 18+ tenants in 2026",
      "Strong brand as immersive destination",
    ],
    weaknesses: [
      "Art/immersive focus — lacks hospitality & nightlife DNA",
      "Indoor-only — no street-level authenticity",
      "Constructed theme-park feel vs. organic district",
      "Off-Strip location",
    ],
    recentMoves: [
      "Boeing 747 Altair Lounge (800-1,200 cap event venue)",
      "Museum of Ice Cream 30K sq ft flagship",
      "18+ new tenants in Zone 2 expansion",
    ],
  },
  {
    name: "Resorts World LV",
    type: "Integrated Resort",
    capacity: "5,000",
    privateBuyout: "Individual venues",
    multiVenue: false,
    experiential: "Moderate",
    threat: "MOD-HIGH",
    pricing: "Custom (premium resort rates)",
    description:
      "$4.3B integrated resort with 3,506 rooms. The Complex (70K sq ft), Rose Ballroom, Zouk nightclub, and outdoor plazas. Competes on scale and luxury.",
    strengths: [
      "70K sq ft blank-canvas Complex venue",
      "Strip-tier luxury positioning",
      "Zouk nightclub convertible for events",
      "4,703-seat theatre",
    ],
    weaknesses: [
      "Resort/convention positioning, not experiential district",
      "No street-level or walkable district feel",
      "Premium pricing limits mid-market activations",
    ],
    recentMoves: [
      "Enhanced Games announced May 2026",
      "Resorts World Classic basketball tournament",
    ],
  },
  {
    name: "The LINQ Promenade",
    type: "Retail/Dining Corridor",
    capacity: "~5,000 est.",
    privateBuyout: "Individual venues only",
    multiVenue: false,
    experiential: "Moderate",
    threat: "MODERATE",
    pricing: "Venue-specific",
    description:
      "200K sq ft open-air Strip corridor with 30+ venues and the High Roller. Sold for $275M in Dec 2024 to TPG/Acadia. Brand activations during major events (F1, etc.).",
    strengths: [
      "Highest foot traffic on the Strip",
      "Proven activation host (F1 week, brand sampling)",
      "High Roller as iconic anchor",
    ],
    weaknesses: [
      "New ownership (TPG/Acadia) = real estate focus, not experiential",
      "Not purpose-built for private district takeovers",
      "Retail corridor, not event district",
    ],
    recentMoves: [
      "$275M sale to TPG/Acadia (Dec 2024)",
      "The Magicians Room VIP venue (Oct 2025)",
      "$100M new attraction announced",
    ],
  },
  {
    name: "Meow Wolf (Omega Mart)",
    type: "Single Attraction",
    capacity: "750",
    privateBuyout: "Full venue",
    multiVenue: false,
    experiential: "Very High",
    threat: "LOW-MOD",
    pricing: "$5K–$15K+ per event",
    description:
      "52K sq ft immersive art installation inside Area15. Strong brand for creative corporate events but capped at 750 guests.",
    strengths: [
      "Iconic immersive brand",
      "Unique photo-worthy backdrop for activations",
      "Strong appeal to tech/creative industries",
    ],
    weaknesses: [
      "750 cap — not scalable for large events",
      "Single attraction, not a district",
      "Operates within Area15, not independent",
    ],
    recentMoves: [
      "5th location opened (Grapevine/DFW)",
      "Expanding private event programming across locations",
    ],
  },
  {
    name: "LV Festival Grounds",
    type: "Open-Air Festival Site",
    capacity: "85,000",
    privateBuyout: "Full site",
    multiVenue: false,
    experiential: "Low",
    threat: "LOW",
    description:
      "37-acre open-air site at the north end of the Strip. Raw festival land — no permanent structures. Hosts When We Were Young, Sick New World. Ruffin eyeing $5B+ sale.",
    strengths: ["85K capacity for massive events", "Proven festival hosting"],
    weaknesses: [
      "Raw land — zero built infrastructure",
      "No multi-venue or walkable format",
      "Completely different use case",
    ],
    recentMoves: ["Ruffin entertaining sale discussions for Circus Circus complex"],
  },
  {
    name: "Venetian Expo",
    type: "Convention Center",
    capacity: "50,000+",
    privateBuyout: "Full venue",
    multiVenue: false,
    experiential: "Low",
    threat: "LOW",
    description:
      "2.25M sq ft convention center. Second-largest in LV. $188M renovation underway. New Lusso Lounge signals pivot toward curated executive experiences.",
    strengths: ["Massive scale", "$188M renovation", "Lusso Lounge exec venue"],
    weaknesses: [
      "Pure convention infrastructure",
      "Zero overlap with experiential district model",
    ],
    recentMoves: [
      "Lusso Lounge (10K sq ft luxury meeting venue, Q4 2026)",
      "$188M multi-phase renovation",
    ],
  },
  {
    name: "Life is Beautiful",
    type: "Annual Festival",
    capacity: "~50,000",
    privateBuyout: "No",
    multiVenue: false,
    experiential: "High",
    threat: "LOW",
    description:
      "Annual music/art/culinary festival across 18 blocks of DTLV. Scaling down to smaller \"block party\" format. Not a bookable venue — public streets requiring city permits.",
    strengths: [
      "Proved DTLV blocks can be activated at scale",
      "Strong brand recognition",
    ],
    weaknesses: [
      "Not a bookable venue",
      "Once per year only",
      "Scaling down suggests financial challenges",
    ],
    recentMoves: ["Format shift to smaller \"Big Beautiful Block Party\""],
  },
];

interface NationalPlayer {
  name: string;
  type: string;
  revenue: string;
  threat: "HIGH" | "MOD-HIGH" | "MODERATE" | "LOW-MOD" | "LOW";
  description: string;
  keyClients: string[];
  relevance: string;
}

const nationalPlayers: NationalPlayer[] = [
  {
    name: "Freeman Company",
    type: "Event Production",
    revenue: "$1.4B",
    threat: "LOW-MOD",
    description: "Largest pure-play event company. Owns 9 brands including Sparks (ADWEEK Experiential Agency of the Year 2024). KKR-backed.",
    keyClients: ["Amazon", "Google", "Meta", "Salesforce", "Pfizer"],
    relevance: "Potential production partner, not venue competitor. Could drive corporate bookings as preferred vendor.",
  },
  {
    name: "George P. Johnson (GPJ)",
    type: "Experiential Agency",
    revenue: "$750M",
    threat: "LOW",
    description: "110+ year history. Forbes Best Midsize Employer 2025. Launched GPJ Sports Marketing in 2024. Deep enterprise relationships.",
    keyClients: ["IBM", "Salesforce", "Google", "Nissan"],
    relevance: "Agency model — sells time, not venues. Channel partner opportunity for corporate activations.",
  },
  {
    name: "Fever",
    type: "Entertainment Platform",
    revenue: "$724M",
    threat: "LOW-MOD",
    description: "Consumer entertainment platform in 100+ cities. $1.8B valuation, $527M raised. EBITDA-profitable. 20x revenue growth from pre-pandemic.",
    keyClients: ["Candlelight Concerts", "Immersive experiences", "B2C consumers"],
    relevance: "Asset-light (no venues). Could be a demand-generation partner rather than competitor.",
  },
  {
    name: "Insomniac Events",
    type: "Festival Producer",
    revenue: "~$544M",
    threat: "MODERATE",
    description: "Live Nation subsidiary. Owns EDC, Beyond Wonderland, LV club residencies. Massive Las Vegas presence.",
    keyClients: ["EDC attendees", "Festival/nightlife consumers"],
    relevance: "Could offer festival-style private buyouts but DNA is mass-market ticketed events, not intimate multi-venue corporate.",
  },
  {
    name: "AEG Presents",
    type: "Entertainment/Venues",
    revenue: "~$5B (AEG Live)",
    threat: "MOD-HIGH",
    description: "50+ venues available for private events. Building The Pinnacle (Nashville). Entertainment-first, not district-concept.",
    keyClients: ["Corporate meetings", "Product launches", "Galas"],
    relevance: "Has venue scale and production expertise but operates entertainment properties, not bookable districts.",
  },
  {
    name: "Jack Morton / Impact XM",
    type: "Experiential Agency",
    revenue: "Undisclosed (IPG)",
    threat: "LOW",
    description: "Merging to create global experiential powerhouse (close Q1 2026). ADWEEK Experiential Agency of the Year 2023.",
    keyClients: ["Google", "Meta", "Sephora", "Netflix", "Disney"],
    relevance: "Agency partner opportunity. They need differentiated venues to program.",
  },
  {
    name: "NVE Experience Agency",
    type: "Experiential Agency",
    revenue: "$75M",
    threat: "LOW",
    description: "Doubled revenue in key verticals. B2B growth surged 175%. Known for cultural strategy and embedding experiential earlier in brand planning.",
    keyClients: ["Netflix", "Google", "Apple"],
    relevance: "Boutique agency — channel partner, not competitor. Needs venues like EFD.",
  },
  {
    name: "UrVenue",
    type: "Booking Platform",
    revenue: "N/A (SaaS)",
    threat: "LOW",
    description: "LV-based hospitality booking platform powering Hakkasan, Tao, Omnia, Zouk. Cross-venue booking, dynamic pricing, 3D maps.",
    keyClients: ["Hakkasan", "Tao Group", "Zouk Group"],
    relevance: "Technology benchmark — not a competitor but sets the standard for multi-venue booking sophistication EFD should match.",
  },
];

const indirectThreats = [
  {
    category: "Hotel Takeovers",
    threat: "HIGH for corporate meetings, MODERATE for activations",
    description: "MGM Grand (850K sq ft), Wynn/Encore (Forbes 5-star), Caesars Palace. Single contract, turnkey F&B — but lack multi-venue street-level district feel.",
  },
  {
    category: "Convention Center Pivots",
    threat: "MODERATE",
    description: "LVCC completed $600M renovation. 4.6M sq ft campus, 48+ trade shows in 2026. Pivoting to experiential programming in lobbies/plazas.",
  },
  {
    category: "Experiential REITs",
    threat: "HIGH as capital partners, LOW as competitors",
    description: "VICI Properties (owns Caesars Palace, MGM Grand, Venetian) and EPR Properties ($200-300M annual investment budget). Could finance or acquire a district concept.",
  },
  {
    category: "DMCs (Destination Mgmt Companies)",
    threat: "LOW as competitors, HIGH as channel partners",
    description: "Hosts LV, Destination Fabulous, aVenue Event Group. Orchestrators, not venue owners — a bookable district is their dream product to sell into corporate clients.",
  },
];

const whiteSpaceItems = [
  {
    gap: "Bookable Entertainment District",
    detail: "No one owns this category. Area15 is closest but is art/immersive, not hospitality/nightlife. Hotel takeovers are single-property. DMCs assemble but don't own.",
  },
  {
    gap: "Street-Level Authenticity",
    detail: "Every competitor is either constructed (Area15), resort-based, or temporary (festivals). Only Fremont East offers a genuine, walkable urban nightlife district.",
  },
  {
    gap: "Nightlife + Brand Activation Hybrid",
    detail: "Strip clubs do nightlife. Convention centers do events. No one combines both into a programmable district format for brand sponsors.",
  },
  {
    gap: "Mid-Market Experiential Events",
    detail: "Resort takeovers price out mid-market brands. Festival grounds are too large. EFD sits in the sweet spot: premium but accessible, scalable from 500 to 20K.",
  },
  {
    gap: "Channel Partnerships",
    detail: "Experiential agencies (Freeman, Sparks, GPJ, Jack Morton, NVE) are all looking for differentiated venues. A district becomes inventory they can program and sell.",
  },
];

const threatColor = (t: string) => {
  if (t === "HIGH") return "bg-neon-pink/15 text-neon-pink";
  if (t.includes("MOD") || t === "MODERATE") return "bg-neon-violet/15 text-neon-violet";
  return "bg-neon-cyan/15 text-neon-cyan";
};

/* ── Component ────────────────────────────────────────────────────── */

export default function CompetitiveLandscapePage() {
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
        <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
          East Fremont District
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          COMPETITIVE LANDSCAPE
        </h1>
        <p className="text-on-surface-variant max-w-3xl">
          Competitive intelligence report for the privately bookable entertainment
          district category — Las Vegas and national experiential market.
        </p>
      </div>

      <div className="space-y-8">
        {/* Market Overview */}
        <div className="bg-surface-container p-8 rounded-xl">
          <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
            Market Overview
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-6">
            Experiential Marketing is Surging
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {marketMetrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
          <div className="bg-surface-container-high rounded-xl p-5">
            <p className="text-on-surface text-sm leading-relaxed">
              North America holds ~40% of the global experiential marketing market.
              The immersive entertainment sector is the fastest-growing adjacent market at 23.4% CAGR,
              projected to reach <span className="text-neon-cyan font-bold">$412.7B by 2030</span>.
              Experiential marketing now captures 38% of marketing services spend — surpassing digital at 35%.
            </p>
          </div>
        </div>

        {/* EFD Competitive Moat */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-on-surface font-extrabold text-xl tracking-tight">
                East Fremont District — Competitive Moat
              </h3>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mt-1">
                16 venues &middot; 1 city block &middot; 20K+ proven capacity
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Category Position</p>
              <p className="text-xl font-extrabold text-neon-cyan font-mono">Only One</p>
              <p className="text-on-surface-variant text-xs mt-1">Bookable district</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Wynn Partnership</p>
              <p className="text-xl font-extrabold text-neon-violet font-mono">Strip-Tier</p>
              <p className="text-on-surface-variant text-xs mt-1">DJ roster access</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">FTB Record</p>
              <p className="text-xl font-extrabold text-on-surface font-mono">20K</p>
              <p className="text-on-surface-variant text-xs mt-1">Marshmello (Apr 2026)</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Authenticity</p>
              <p className="text-xl font-extrabold text-neon-pink font-mono">Organic</p>
              <p className="text-on-surface-variant text-xs mt-1">Not constructed</p>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm">
            Area15 is a constructed theme park. LINQ is a shopping mall. Resorts World is a resort.
            Only Fremont East offers a genuine, walkable urban nightlife district with independently
            operated venues, street culture, and the ability to be privately activated end-to-end.
          </p>
        </div>

        {/* Las Vegas Direct Competitors */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">
            Las Vegas Direct Competitors
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Venues and districts that compete for private event and brand activation bookings
          </p>
          <div className="space-y-4">
            {vegasCompetitors.map((c) => (
              <details key={c.name} className="bg-surface-container-high rounded-xl group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h4 className="text-on-surface font-bold text-lg">{c.name}</h4>
                      <span className="text-on-surface-variant text-xs">{c.type}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${threatColor(c.threat)}`}>
                        {c.threat} threat
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-on-surface-variant">
                        Cap: <span className="text-on-surface font-mono font-bold">{c.capacity}</span>
                      </span>
                      <span className="text-on-surface-variant">
                        Buyout: <span className="text-on-surface font-mono">{c.privateBuyout}</span>
                      </span>
                      <span className="text-on-surface-variant text-lg group-open:rotate-180 transition-transform">&#9662;</span>
                    </div>
                  </div>
                </summary>
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-on-surface-variant text-sm leading-relaxed">{c.description}</p>
                  {c.pricing && (
                    <p className="text-sm">
                      <span className="text-on-surface-variant">Pricing: </span>
                      <span className="text-neon-cyan font-mono font-bold">{c.pricing}</span>
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {c.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-cyan mt-0.5">&#10003;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-pink mb-2">Weaknesses</p>
                      <ul className="space-y-1">
                        {c.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-pink mt-0.5">&#10005;</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-violet mb-2">Recent Moves</p>
                      <ul className="space-y-1">
                        {c.recentMoves.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-violet mt-0.5">&#8594;</span>
                            <span>{r}</span>
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

        {/* National Experiential Players */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">
            National Experiential Players
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Agencies, platforms, and production companies in the experiential event ecosystem
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nationalPlayers.map((p) => (
              <div key={p.name} className="bg-surface-container-high rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-on-surface font-bold">{p.name}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${threatColor(p.threat)}`}>
                      {p.threat}
                    </span>
                  </div>
                  <span className="text-neon-cyan font-mono font-bold text-sm">{p.revenue}</span>
                </div>
                <p className="text-on-surface-variant text-xs mb-1">{p.type}</p>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-3">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.keyClients.map((c) => (
                    <span key={c} className="text-[10px] text-on-surface bg-surface-container px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
                <p className="text-sm">
                  <span className="text-neon-violet font-bold text-[10px] uppercase tracking-[0.15em]">Relevance: </span>
                  <span className="text-on-surface-variant">{p.relevance}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Indirect Threats */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">
            Indirect Threats &amp; Adjacencies
          </h3>
          <div className="space-y-4">
            {indirectThreats.map((t) => (
              <div key={t.category} className="bg-surface-container rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="min-w-[200px]">
                  <h4 className="text-on-surface font-bold">{t.category}</h4>
                  <p className="text-neon-violet text-xs font-bold mt-1">{t.threat}</p>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Positioning Matrix */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">
            Positioning Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                  <th className="text-left py-3 px-4">Dimension</th>
                  <th className="text-center py-3 px-3 text-neon-cyan">EFD</th>
                  <th className="text-center py-3 px-3">Area15</th>
                  <th className="text-center py-3 px-3">Hotel Takeovers</th>
                  <th className="text-center py-3 px-3">DMCs</th>
                  <th className="text-center py-3 px-3">Freeman/Sparks</th>
                </tr>
              </thead>
              <tbody className="text-on-surface-variant">
                {[
                  ["Multi-venue diversity", "Strong", "Medium", "Low", "Assembled", "N/A"],
                  ["Private buyout capability", "Core", "Yes", "Limited", "Assembled", "N/A"],
                  ["Street-level authenticity", "Strong", "Indoor only", "No", "No", "N/A"],
                  ["F&B integration", "Strong", "Limited", "Strong", "Outsourced", "N/A"],
                  ["Production capability", "Partners", "In-house", "Via AV", "Via vendors", "Best-in-class"],
                  ["Brand activation expertise", "Partners", "Limited", "Limited", "Limited", "Best-in-class"],
                  ["Consumer data/demand", "Building", "Limited", "Strong", "Limited", "N/A"],
                ].map(([dim, ...vals]) => (
                  <tr key={dim} className="border-t border-outline-variant/20">
                    <td className="py-3 px-4 text-on-surface font-medium">{dim}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-3 px-3 text-center font-mono text-xs ${i === 0 ? "text-neon-cyan font-bold" : ""}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* White Space Analysis */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">
            White Space Analysis
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Gaps no competitor is filling — EFD&apos;s opportunity
          </p>
          <div className="space-y-3">
            {whiteSpaceItems.map((w) => (
              <div key={w.gap} className="bg-surface-container-high rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-neon-cyan text-lg mt-0.5">&#9670;</span>
                  <div>
                    <h4 className="text-on-surface font-bold mb-1">{w.gap}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{w.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Implications */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">
            Strategic Implications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Category Creation Opportunity",
                body: "No one owns the \"bookable entertainment district\" category. Area15 is art/immersive. Hotels are single-property. DMCs assemble but don't own. EFD can define and own this category.",
                accent: "neon-cyan",
              },
              {
                title: "Channel Strategy",
                body: "DMCs, experiential agencies (Freeman, Sparks, GPJ, Jack Morton), and platforms like Fever are all looking for differentiated venues. EFD becomes inventory they can program.",
                accent: "neon-violet",
              },
              {
                title: "Technology Benchmark",
                body: "UrVenue's PXMS model (cross-venue booking, dynamic pricing, 3D maps) sets the expectation. EFD needs a unified booking engine that matches this sophistication.",
                accent: "neon-pink",
              },
              {
                title: "Capital Partners Exist",
                body: "VICI Properties and EPR Properties are actively seeking experiential real estate investments. Both deploying hundreds of millions annually into proven operator models.",
                accent: "neon-cyan",
              },
            ].map((item) => (
              <div key={item.title} className={`bg-surface-container-high rounded-xl p-6 border-l-2 border-${item.accent}/40`}>
                <h4 className="text-on-surface font-bold mb-2">{item.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
