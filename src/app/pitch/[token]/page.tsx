"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { venues as allVenues } from "@/data/venues";
import { feedTheBlock } from "@/data/feed-the-block";
import { computeDepletions, aggregatePortfolio, HOUSE_POUR_MULTIPLIER } from "@/lib/depletion-engine";
import { fmt, fmtNum } from "@/lib/utils";

interface PitchLink {
  id: string;
  token: string;
  title: string;
  brandName: string | null;
  category: string | null;
  venueIds: string | null;
  expiresAt: string;
  viewCount: number;
}

export default function PitchPage() {
  const { token } = useParams();
  const [link, setLink] = useState<PitchLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pitch?token=${token}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 410 ? "This pitch link has expired." : "Pitch link not found.");
        return r.json();
      })
      .then(d => setLink(d.link))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
      <p className="text-[#acaaae]">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#ff6b98] text-lg font-bold mb-2">{error}</p>
        <p className="text-[#acaaae] text-sm">Contact keith@gorunrabbit.com for access.</p>
      </div>
    </div>
  );

  if (!link) return null;

  // Filter data based on pitch link settings
  const venueFilter: string[] = link.venueIds ? JSON.parse(link.venueIds) : [];
  const filteredVenues = venueFilter.length > 0
    ? allVenues.filter(v => venueFilter.includes(v.id))
    : allVenues;

  const depletions = filteredVenues.map(computeDepletions).filter(Boolean) as NonNullable<ReturnType<typeof computeDepletions>>[];
  const portfolio = aggregatePortfolio(depletions);

  const totalCapacity = filteredVenues.reduce((s, v) => s + v.capacity, 0);
  const totalSqFt = filteredVenues.reduce((s, v) => s + v.sqft, 0);
  const totalWeeklyTraffic = filteredVenues.reduce((s, v) => s + v.avgWeeklyFootTraffic, 0);
  const annualTraffic = totalWeeklyTraffic * 52;

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f3f0f4]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-[#000]/60 backdrop-blur-xl py-4 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00eefc]">Sponsorship Opportunity</p>
            <h1 className="text-xl font-extrabold tracking-tight">{link.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#acaaae]">Prepared by</p>
            <p className="text-sm font-bold">Go Run Rabbit</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

        {/* Brand header if specified */}
        {link.brandName && (
          <div className="bg-[#19191d] rounded-xl p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aea2ff] mb-2">Prepared For</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">{link.brandName}</h2>
            {link.category && <p className="text-[#acaaae]">{link.category} category opportunity across the CBM venue portfolio</p>}
          </div>
        )}

        {/* Portfolio overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1f1f23] rounded-xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-2">Venues</p>
            <p className="text-2xl font-extrabold font-mono">{filteredVenues.length}</p>
            <p className="text-[#acaaae] text-xs">Fremont East + Arts District</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-2">Combined Capacity</p>
            <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{fmtNum(totalCapacity)}</p>
            <p className="text-[#acaaae] text-xs">{fmtNum(totalSqFt)} sq ft</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-2">Annual Foot Traffic</p>
            <p className="text-2xl font-extrabold font-mono">{(annualTraffic / 1000000).toFixed(1)}M+</p>
            <p className="text-[#acaaae] text-xs">Venue traffic only</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-2">Feed the Block 2026</p>
            <p className="text-2xl font-extrabold font-mono text-[#00eefc]">100K+</p>
            <p className="text-[#acaaae] text-xs">10 events, $400K sponsors confirmed</p>
          </div>
        </div>

        {/* Venue portfolio */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-6">Venue Portfolio</h3>
          <div className="space-y-4">
            {filteredVenues.map(v => (
              <div key={v.id} className="bg-[#19191d] rounded-xl p-5 flex items-center gap-6 group hover:bg-[#1f1f23] transition-colors">
                <img src={`/venues/${v.id}.jpg`} alt={v.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <a href={`/venue/${v.id}`} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-[#aea2ff] hover:text-[#00eefc] transition-colors">{v.name}</a>
                    <span className="text-[#acaaae] text-xs">{v.type}</span>
                  </div>
                  <p className="text-[#acaaae] text-xs mb-2">{v.address} &middot; {v.zone}</p>
                  <div className="flex gap-6 text-sm text-[#acaaae]">
                    <span>Cap: {fmtNum(v.capacity)}</span>
                    <span>{fmtNum(v.sqft)} sqft</span>
                    <span>{fmtNum(v.avgWeeklyFootTraffic)}/wk traffic</span>
                    {v.hasStage && <span className="text-[#aea2ff]">Stage</span>}
                    {v.hasRooftop && <span className="text-[#aea2ff]">Rooftop</span>}
                    {v.hasKitchen && <span className="text-[#00eefc]">Kitchen</span>}
                  </div>
                  {v.features && v.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {v.features.map((f: string) => (
                        <span key={f} className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#25252a] text-[#acaaae]">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case depletions — if category specified, show that category */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-2">Case Depletion Opportunity</h3>
          <p className="text-[#acaaae] text-sm mb-6">Estimated annual volume with house pour sponsorship lift (2.2x)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#19191d] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Total Spirit Cases</p>
              <p className="font-mono font-bold text-xl text-[#00eefc]">{fmtNum(portfolio.totalSpiritCases)}</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">With House Pour</p>
              <p className="font-mono font-bold text-xl text-[#aea2ff]">{fmtNum(Math.round(portfolio.totalSpiritCases * HOUSE_POUR_MULTIPLIER))}</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Beer Cases</p>
              <p className="font-mono font-bold text-xl">{fmtNum(portfolio.beerCases)}</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Total Cases</p>
              <p className="font-mono font-bold text-xl text-[#00eefc]">{fmtNum(portfolio.totalCases)}</p>
            </div>
          </div>
        </div>

        {/* Available Activation Points */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-2">Activation Opportunities</h3>
          <p className="text-[#acaaae] text-sm mb-6">Available placement and activation options across the portfolio</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { point: "House / Well Pour", desc: "Default spirit when customer doesn't specify — highest volume driver", venues: filteredVenues.length },
              { point: "Back Bar Placement", desc: "Premium bottle display behind the bar — visible to every guest", venues: filteredVenues.length },
              { point: "Featured Cocktail", desc: "Branded signature drink on the menu — drives trial and upsell", venues: filteredVenues.length },
              { point: "Tap Handle / Draft Line", desc: "Dedicated draft position — consistent volume for beer brands", venues: filteredVenues.filter(v => v.type.includes("Bar") || v.type.includes("Restaurant")).length },
              { point: "LED / Digital Signage", desc: "Stage, bar, and rooftop LED integration at high-visibility venues", venues: filteredVenues.filter(v => v.hasStage || v.hasRooftop).length },
              { point: "Event Activation", desc: "On-site sampling, branded booths, and experiential moments at Feed the Block + venues", venues: filteredVenues.length },
              { point: "Social Media / Content", desc: "Co-branded posts, creator content, and event recaps — 8M+ annual impressions", venues: 0 },
              { point: "VIP Area Branding", desc: "Exclusive brand presence in premium sections — Commonwealth rooftop, Laundry Room", venues: filteredVenues.filter(v => v.hasRooftop || v.type.includes("Speakeasy")).length },
              { point: "Category Exclusivity", desc: "Sole brand in your category across all venues — the ultimate portfolio play", venues: filteredVenues.length },
            ].map(({ point, desc, venues }) => (
              <div key={point} className="bg-[#19191d] rounded-xl p-5">
                <h4 className="text-[#f3f0f4] font-bold text-sm mb-1">{point}</h4>
                <p className="text-[#acaaae] text-xs leading-relaxed mb-2">{desc}</p>
                {venues > 0 && <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#aea2ff]">{venues} venue{venues !== 1 ? "s" : ""}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Audience Profile */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-6">Audience Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#19191d] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#f3f0f4]">{feedTheBlock.audienceProfile.medianAge}</p>
              <p className="text-[#acaaae] text-xs">Median Age</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{feedTheBlock.audienceProfile.stayOver45MinPct}%</p>
              <p className="text-[#acaaae] text-xs">Stay 45+ Minutes</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#aea2ff]">{feedTheBlock.audienceProfile.hispanicLatinoPct}%</p>
              <p className="text-[#acaaae] text-xs">Hispanic/Latino</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#f3f0f4]">{(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M</p>
              <p className="text-[#acaaae] text-xs">Social Impressions</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mr-2">Top Markets:</p>
            {feedTheBlock.audienceProfile.topMarkets.map(m => (
              <span key={m} className="text-xs text-[#f3f0f4] bg-[#19191d] px-2.5 py-1 rounded-full">{m}</span>
            ))}
          </div>
        </div>

        {/* Feed the Block proof */}
        <div className="bg-[#19191d] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-4">Feed the Block — Event Series</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{fmtNum(feedTheBlock.year2025.totalAttendance)}+</p>
              <p className="text-[#acaaae] text-xs">2025 attendance (3 events)</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono">100K+</p>
              <p className="text-[#acaaae] text-xs">2026 projected (10 events)</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{fmt(feedTheBlock.confirmedTotal)}</p>
              <p className="text-[#acaaae] text-xs">Confirmed sponsors (closed)</p>
            </div>
          </div>
          <p className="text-[#acaaae] text-sm">
            Marshmello, Gryffin, Diplo &mdash; headliners on the Forest House Art Car stage. {feedTheBlock.socialMetrics.impressions > 0 ? `${(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M social impressions.` : ""}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[#25252a] rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,162,255,0.08),transparent)]" />
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold mb-3">Interested?</h3>
            <p className="text-[#acaaae] mb-6 max-w-lg mx-auto">
              {link.brandName
                ? `Let's discuss how ${link.brandName} can activate across the CBM portfolio.`
                : "Let's discuss sponsorship opportunities across the CBM venue portfolio."}
            </p>
            <a href="mailto:keith@gorunrabbit.com" className="bg-[#aea2ff] text-[#1f0078] px-8 py-3 rounded-md font-bold hover:bg-[#a092ff] transition-all inline-block">
              keith@gorunrabbit.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[9px] text-[#48474b] uppercase tracking-[0.15em] font-bold">
            Go Run Rabbit LLC &middot; Confidential &middot; Prepared for {link.brandName || "prospective partners"}
          </p>
        </div>
      </div>
    </div>
  );
}
