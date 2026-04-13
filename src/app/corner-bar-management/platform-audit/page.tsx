"use client";

import Link from "next/link";

/* ── Platform Data ────────────────────────────────────────────────── */

interface Platform {
  name: string;
  type: string;
  pricing: string;
  fit: "STRONG" | "MODERATE" | "WEAK" | "NOT SUITABLE";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  covers: string[];
  misses: string[];
  users?: string;
}

const platforms: Platform[] = [
  {
    name: "UrVenue (PXMS)",
    type: "Booking & Inventory Platform",
    pricing: "Enterprise custom (~$2-5K+/mo for 8 venues)",
    fit: "STRONG",
    summary: "The industry's first Property Experience Management System — purpose-built for managing and monetizing non-room inventory across multi-venue entertainment operations. Powers Hakkasan, Tao, Zouk, Drai's, XS, LIV, Caesars, MGM, Wynn. 250+ clients in 15 countries.",
    users: "Hakkasan, Tao Group, Zouk, Drai's, Caesars, MGM, Wynn, Resorts World",
    strengths: [
      "Purpose-built for entertainment district operations",
      "Cross-venue booking with single-cart checkout",
      "3D interactive floor maps for self-service seat/table selection",
      "Dynamic pricing and real-time yield management",
      "Real-time shared inventory prevents conflicts across 8 venues",
      "Proven at scale with Vegas mega-operators",
      "AI-powered MCP integration coming Q4 2026",
    ],
    weaknesses: [
      "NOT a CRM — no lead pipeline, qualification, or follow-up automation",
      "No proposal/quote generation workflow",
      "Focused on consumer booking, not B2B event planner inquiries",
      "Enterprise pricing — likely expensive",
      "No public API documentation",
    ],
    covers: ["Consumer booking", "Dynamic pricing", "3D maps", "Cross-venue cart", "Inventory management", "Availability"],
    misses: ["CRM pipeline", "Lead nurturing", "Proposal generation", "Automated follow-ups", "B2B sales tools"],
  },
  {
    name: "Tripleseat",
    type: "Venue Event CRM",
    pricing: "$100-300/mo per venue (volume discounts likely)",
    fit: "STRONG",
    summary: "Leading event sales and catering CRM for restaurants, hotels, and venues. Focused on private events, group dining, and venue buyouts. #2 Event Management Software in 2026 HotelTechAwards.",
    strengths: [
      "Strong lead-to-close pipeline (inquiry → proposal → contract)",
      "Multi-location dashboard proven at scale",
      "Proposal and contract generation with e-signatures",
      "Calendar management with real-time availability",
      "Online payments via Stripe/Square",
      "Guest portal for collaboration",
      "30%+ increase in booking sales reported by users",
    ],
    weaknesses: [
      "Weak third-party CRM/accounting integrations",
      "No dynamic pricing engine",
      "No 3D visualization",
      "No self-service consumer booking (sales tool, not booking engine)",
      "More restaurant/hotel DNA than nightlife/entertainment",
    ],
    covers: ["CRM pipeline", "Proposals", "Contracts", "Payments", "Multi-location", "Availability calendar"],
    misses: ["Dynamic pricing", "Consumer booking", "3D visualization", "Lead scoring"],
  },
  {
    name: "Event Temple",
    type: "Venue CRM & Sales",
    pricing: "Custom (competitive with Tripleseat)",
    fit: "STRONG",
    summary: "Venue CRM and sales platform with drag-and-drop pipeline, digital proposals, and chain management for multi-property operators. Open API for custom integration.",
    strengths: [
      "Drag-and-drop pipeline matching inquiry → qualified → proposal → contract",
      "Strong proposal automation (eProposals)",
      "Chain management built for multi-property operators",
      "Open API for Next.js integration",
      "Email + SMS outreach built in",
      "Salesforce integration available",
    ],
    weaknesses: [
      "No client portal (requested, still on wishlist)",
      "No dynamic pricing",
      "No consumer-facing booking engine",
      "Smaller market presence than Tripleseat",
    ],
    covers: ["CRM pipeline", "Proposals", "Multi-venue management", "API integration", "Email/SMS automation"],
    misses: ["Client portal", "Dynamic pricing", "Consumer booking", "3D visualization"],
  },
  {
    name: "HubSpot Sales Hub",
    type: "General CRM (customizable)",
    pricing: "$100/seat/mo Professional + $1,500 onboarding",
    fit: "STRONG",
    summary: "The most flexible pipeline CRM with best-in-class marketing automation. Custom Objects can model venues, spaces, packages, and pricing. Excellent API for Next.js integration. 1,500+ marketplace integrations.",
    strengths: [
      "Most flexible pipeline customization available",
      "Best-in-class marketing automation and lead nurturing",
      "Excellent API and webhook ecosystem for Next.js",
      "Custom Objects for venues, spaces, packages, pricing",
      "Lead scoring and qualification automation",
      "Sequence tools for automated follow-ups",
      "Scales from startup to enterprise",
    ],
    weaknesses: [
      "No venue-specific features out of the box",
      "No availability calendar or floor plans",
      "No dynamic pricing engine",
      "Requires significant setup and customization",
      "Per-seat pricing adds up with larger teams",
    ],
    covers: ["CRM pipeline", "Lead nurturing", "Automation", "Lead scoring", "API", "Proposals", "Sequences"],
    misses: ["Venue booking", "Dynamic pricing", "Availability", "3D visualization", "F&B management"],
  },
  {
    name: "Cvent",
    type: "Event Management Platform",
    pricing: "~$19,500/year median contract",
    fit: "WEAK",
    summary: "Largest event management platform globally. 340K+ venues in Supplier Network. Primarily serves the planner side — useful as a channel to get listed where corporate planners search, not as an operating platform.",
    strengths: [
      "Massive distribution network — planners find you",
      "Prismm 3D integration",
      "Enterprise-grade",
    ],
    weaknesses: [
      "Designed for planners, not venue operators",
      "Venue tools are about responding to RFPs, not managing your pipeline",
      "Expensive for what you get as a venue",
      "Corporate events DNA, not nightlife/entertainment",
    ],
    covers: ["Distribution/discovery", "RFP responses", "3D visualization (via Prismm)"],
    misses: ["CRM pipeline", "Venue management", "Dynamic pricing", "Consumer booking", "Lead nurturing"],
  },
  {
    name: "Momentus (formerly Ungerboeck)",
    type: "Enterprise Venue Management",
    pricing: "Enterprise custom ($1,000+/mo)",
    fit: "WEAK",
    summary: "Enterprise-grade platform used by 85%+ of the world's largest convention centers. SoFi Stadium, Google, Harvard. Full CRM to accounting, but convention center DNA — over-engineered for entertainment districts.",
    strengths: [
      "Built for managing 50+ bookable spaces",
      "End-to-end from CRM to accounting",
      "Event portal for client-facing interaction",
    ],
    weaknesses: [
      "Convention center DNA, not nightlife/entertainment",
      "Expensive and steep implementation curve",
      "No dynamic pricing for nightlife-style yielding",
      "Overkill for this use case",
    ],
    covers: ["Space management", "CRM", "Accounting", "Event portal"],
    misses: ["Dynamic pricing", "Entertainment-specific features", "Reasonable pricing"],
  },
  {
    name: "Planning Pod",
    type: "Event Management Platform",
    pricing: "Starting at $99/mo",
    fit: "MODERATE",
    summary: "All-in-one event management with 40+ integrated tools. CRM pipeline, proposals, contracts, floor plans, payments, and catering management. 70K+ event professionals.",
    strengths: [
      "Comprehensive feature set at affordable price",
      "Good CRM pipeline for inquiry-to-close",
      "Proposal and contract generation",
      "Floor plan tools built in",
    ],
    weaknesses: [
      "Designed for small-to-mid venues",
      "No dynamic pricing or 3D visualization",
      "Limited multi-venue management at scale",
    ],
    covers: ["CRM pipeline", "Proposals", "Contracts", "Floor plans", "Payments"],
    misses: ["Dynamic pricing", "Enterprise multi-venue", "3D visualization"],
  },
  {
    name: "Perfect Venue",
    type: "Venue CRM",
    pricing: "$79-199/mo (unlimited users and locations)",
    fit: "MODERATE",
    summary: "Good value venue CRM with unlimited users and locations. AI email replies. Multi-venue management at a fraction of Tripleseat pricing.",
    strengths: [
      "Unlimited users and locations at flat rate",
      "AI-powered email replies",
      "Multi-venue management built in",
      "Strong value proposition",
    ],
    weaknesses: [
      "Smaller platform with less ecosystem",
      "No dynamic pricing or consumer booking",
      "Limited integration options",
    ],
    covers: ["CRM pipeline", "Multi-venue", "AI replies", "Proposals"],
    misses: ["Dynamic pricing", "Consumer booking", "API ecosystem"],
  },
];

/* ── Recommendation Options ───────────────────────────────────────── */

const recommendations = [
  {
    option: "A",
    title: "UrVenue + HubSpot",
    tag: "Best-in-class",
    tagColor: "#00eefc",
    cost: "$2,500-5,500+/mo",
    summary: "UrVenue handles consumer booking, dynamic pricing, 3D maps, and cross-venue inventory. HubSpot handles the B2B sales pipeline — lead capture, qualification, proposals, automated follow-ups, and lead scoring. Your Next.js site becomes the client-facing portal pulling from both APIs.",
    layers: [
      { layer: "Booking & Inventory", platform: "UrVenue", covers: "Consumer booking, dynamic pricing, 3D maps, cross-venue cart, availability" },
      { layer: "CRM & Pipeline", platform: "HubSpot", covers: "Lead capture, qualification, pipeline stages, proposals, follow-ups, lead scoring" },
      { layer: "Client Portal", platform: "Custom (Next.js)", covers: "Event planners see availability, pricing, build packages via API integration" },
    ],
    pros: ["Only combo proven at Vegas entertainment scale", "UrVenue literally runs LV nightlife", "HubSpot's automation prevents leads from going cold", "API-first architecture integrates with your existing stack"],
    cons: ["Highest cost option", "Two vendor relationships to manage", "UrVenue enterprise sales process may be slow"],
  },
  {
    option: "B",
    title: "Tripleseat + Custom Booking",
    tag: "Proven & practical",
    tagColor: "#aea2ff",
    cost: "$3,200-4,800/mo (volume discounts likely)",
    summary: "Tripleseat is the most proven venue CRM for the inquiry-to-close pipeline. You already have Supabase. Build availability, dynamic pricing, and the package builder as custom features on your existing Next.js site.",
    layers: [
      { layer: "CRM + Pipeline + Proposals", platform: "Tripleseat", covers: "Lead management, proposals, contracts, payments, multi-location dashboard" },
      { layer: "Booking & Pricing", platform: "Custom (Next.js + Supabase)", covers: "Availability calendar, dynamic pricing, package builder" },
      { layer: "Client Portal", platform: "Tripleseat guest portal + custom", covers: "Collaboration, status tracking, proposal review" },
    ],
    pros: ["Most proven venue CRM in hospitality", "Multi-location dashboard built in", "Guest portal covers client-facing needs", "30%+ booking increase reported by users"],
    cons: ["Per-venue pricing adds up at 8 venues", "Restaurant/hotel DNA may not fit nightlife perfectly", "Custom booking layer still needs engineering"],
  },
  {
    option: "C",
    title: "HubSpot + Custom Everything",
    tag: "Maximum control",
    tagColor: "#ff6b98",
    cost: "$300-500/mo + engineering investment",
    summary: "HubSpot handles the hard parts (CRM, automation, sequences, lead scoring) while you build all venue-specific features on your existing Next.js + Supabase stack. No vendor lock-in on booking, pricing, or availability.",
    layers: [
      { layer: "CRM & Pipeline", platform: "HubSpot", covers: "Full pipeline, automation, lead scoring, follow-ups, sequences" },
      { layer: "Booking & Availability", platform: "Custom (Next.js + Supabase)", covers: "Availability, pricing, package builder, proposals" },
      { layer: "Client Portal", platform: "Custom (Next.js)", covers: "Self-service event planning, status tracking, proposal review" },
    ],
    pros: ["Lowest monthly cost", "Maximum flexibility and control", "Builds on your existing stack", "No venue-platform vendor lock-in", "HubSpot API is excellent for Next.js"],
    cons: ["Significant engineering investment upfront", "Must build and maintain venue-specific features", "No pre-built entertainment district templates"],
  },
];

/* ── The Pipeline Problem ─────────────────────────────────────────── */

const pipelineStages = [
  { stage: "Inquiry", desc: "Form submission from EFD site", current: "Email + Supabase row", needed: "Auto-qualify, assign, respond within 2 hours" },
  { stage: "Qualified", desc: "Budget, date, and scope confirmed", current: "Manual email back-and-forth", needed: "Automated questionnaire, lead scoring, routing" },
  { stage: "Proposal", desc: "Custom package with pricing sent", current: "Manual document creation", needed: "Template-driven proposals with venue configs and pricing" },
  { stage: "Site Visit", desc: "On-site walkthrough scheduled", current: "Calendar coordination via email", needed: "Self-service scheduling, 3D virtual tour fallback" },
  { stage: "Contract", desc: "Terms agreed, contract signed", current: "Manual process", needed: "E-signatures, deposit collection, automated reminders" },
  { stage: "Confirmed", desc: "Deposit paid, production planning begins", current: "Handoff to ops team", needed: "Automated handoff with BEO, timeline, vendor coordination" },
];

const fitColor = (fit: string) => {
  if (fit === "STRONG") return "bg-neon-cyan/15 text-neon-cyan";
  if (fit === "MODERATE") return "bg-neon-violet/15 text-neon-violet";
  return "bg-neon-pink/15 text-neon-pink";
};

/* ── Component ────────────────────────────────────────────────────── */

export default function PlatformAuditPage() {
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
          PLATFORM AUDIT
        </h1>
        <p className="text-on-surface-variant max-w-3xl">
          How to turn website inquiries into a scalable pipeline — venue booking platforms,
          event CRMs, and the right stack for a 8-venue entertainment district.
        </p>
      </div>

      <div className="space-y-10">

        {/* ── The Problem ───────────────────────────────────────── */}
        <div className="bg-surface-container rounded-xl p-8">
          <p className="text-neon-pink text-[10px] font-bold tracking-[0.15em] uppercase mb-3">The Problem</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-4">
            Inquiries In, Chaos Out
          </h2>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            The EFD site generates inquiries — but what happens next? Currently: an email is sent and a
            Supabase row is created. At scale, that means lost leads, slow responses, no pipeline visibility,
            and manual email chains for every deal. The goal is a system where every inquiry automatically
            enters a pipeline, gets qualified, receives a proposal, and closes — with nothing falling through the cracks.
          </p>
          <div className="space-y-2">
            {pipelineStages.map((s) => (
              <div key={s.stage} className="bg-surface-container-high rounded-xl p-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <p className="text-on-surface font-bold text-sm">{s.stage}</p>
                  <p className="text-on-surface-variant text-[10px]">{s.desc}</p>
                </div>
                <div className="col-span-5">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-pink mb-1">Current</p>
                  <p className="text-on-surface-variant text-xs">{s.current}</p>
                </div>
                <div className="col-span-5">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mb-1">Needed</p>
                  <p className="text-on-surface-variant text-xs">{s.needed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Platform Comparison ───────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Platform Comparison</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            8 platforms evaluated for a 8-venue entertainment district
          </p>
          <div className="space-y-4">
            {platforms.map((p) => (
              <details key={p.name} className="bg-surface-container-high rounded-xl group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h4 className="text-on-surface font-bold text-lg">{p.name}</h4>
                      <span className="text-on-surface-variant text-xs">{p.type}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${fitColor(p.fit)}`}>
                        {p.fit} fit
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-on-surface-variant text-xs">{p.pricing}</span>
                      <span className="text-on-surface-variant text-lg group-open:rotate-180 transition-transform">&#9662;</span>
                    </div>
                  </div>
                </summary>
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-on-surface-variant text-sm leading-relaxed">{p.summary}</p>
                  {p.users && (
                    <p className="text-xs">
                      <span className="text-on-surface-variant">Used by: </span>
                      <span className="text-neon-cyan">{p.users}</span>
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {p.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-cyan mt-0.5 text-xs">&#10003;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-pink mb-2">Weaknesses</p>
                      <ul className="space-y-1">
                        {p.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="text-neon-pink mt-0.5 text-xs">&#10005;</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-violet mb-2">Covers</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.covers.map((c) => (
                          <span key={c} className="text-[10px] text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.misses.map((m) => (
                          <span key={m} className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Recommendations ───────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Recommended Stacks</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            No single platform covers all requirements — these are the best combinations
          </p>
          <div className="space-y-6">
            {recommendations.map((r) => (
              <div key={r.option} className="bg-surface-container-low rounded-xl p-8" style={{ borderLeft: `2px solid ${r.tagColor}40` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-extrabold font-mono" style={{ color: r.tagColor }}>Option {r.option}</span>
                  <h3 className="text-on-surface font-extrabold text-xl tracking-tight">{r.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full" style={{ background: `${r.tagColor}15`, color: r.tagColor }}>
                    {r.tag}
                  </span>
                  <span className="text-on-surface-variant text-xs ml-auto font-mono">{r.cost}</span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{r.summary}</p>

                {/* Stack layers */}
                <div className="space-y-2 mb-5">
                  {r.layers.map((l) => (
                    <div key={l.layer} className="bg-surface-container rounded-xl p-4 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <p className="text-on-surface font-bold text-xs">{l.layer}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs font-mono" style={{ color: r.tagColor }}>{l.platform}</p>
                      </div>
                      <div className="col-span-6">
                        <p className="text-on-surface-variant text-xs">{l.covers}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mb-2">Pros</p>
                    <ul className="space-y-1">
                      {r.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="text-neon-cyan mt-0.5 text-xs">&#10003;</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-pink mb-2">Cons</p>
                    <ul className="space-y-1">
                      {r.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="text-neon-pink mt-0.5 text-xs">&#10005;</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Line ───────────────────────────────────────── */}
        <div className="bg-surface-container rounded-xl p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-4">Bottom Line</h2>
          <div className="space-y-4 text-on-surface leading-relaxed">
            <p>
              <strong className="text-neon-cyan">Option A (UrVenue + HubSpot)</strong> if budget allows and you want the
              industry-standard stack. UrVenue is the only platform built for exactly this use case — it literally runs
              Las Vegas nightlife. HubSpot fills the B2B pipeline gap that UrVenue doesn&apos;t cover.
            </p>
            <p>
              <strong className="text-neon-pink">Option C (HubSpot + Custom)</strong> is the most pragmatic path given
              the existing Next.js + Supabase stack. HubSpot handles the hard parts (CRM, automation, sequences, lead
              scoring) while you build venue-specific features on what you already have. Lowest monthly cost, maximum control,
              no vendor lock-in on the booking layer.
            </p>
            <p className="text-on-surface-variant">
              <strong>Avoid:</strong> Momentus (convention center DNA), Peerspace (marketplace model), HoneyBook/Dubsado
              (solopreneur scale), and Cvent as a primary platform (it&apos;s a planner-side tool — useful as a discovery channel only).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
