"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { venues as allVenues } from "@/data/venues";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmtNum } from "@/lib/utils";

interface DealPoint {
  type: string;
  venues: string[];
  status: string;
}

interface Deal {
  id: string;
  brandName: string;
  category: string;
  tier: string;
  status: string;
  value: number | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  venues: string | null;
  dealPoints: string | null;
  createdAt: string;
  updatedAt: string;
}

const TYPE_TITLES: Record<string, string> = {
  "post-event": "Post-Event Recap",
  quarterly: "Quarterly Partnership Review",
  annual: "Annual Partnership Report",
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  "post-event": "Performance summary following the most recent Feed the Block event",
  quarterly: "Quarterly review of partnership performance across the CBM venue portfolio",
  annual: "Comprehensive annual report on partnership value, reach, and impact",
};

export default function BrandRecapPage() {
  const { dealId, type } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pipeline/${dealId}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => setDeal(d.deal))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center"><p className="text-[#acaaae]">Loading...</p></div>;
  if (error || !deal) return <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center"><p className="text-[#ff6b98]">{error || "Not found"}</p></div>;

  const recapType = type as string;
  let dealPoints: DealPoint[] = [];
  try { dealPoints = deal.dealPoints ? JSON.parse(deal.dealPoints) : []; } catch { /* */ }

  const activePoints = dealPoints.filter(dp => dp.status === "active" || dp.status === "confirmed");
  const allVenueIds = new Set<string>();
  dealPoints.forEach(dp => dp.venues.forEach(v => allVenueIds.add(v)));
  const involvedVenues = allVenues.filter(v => allVenueIds.has(v.id));

  const totalCapacity = involvedVenues.reduce((s, v) => s + v.capacity, 0);
  const totalWeeklyTraffic = involvedVenues.reduce((s, v) => s + v.avgWeeklyFootTraffic, 0);
  const annualTraffic = totalWeeklyTraffic * 52;

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const quarterLabel = `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f3f0f4]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-[#000]/60 backdrop-blur-xl py-6 px-8">
        <div className="max-w-4xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00eefc] mb-1">
              {TYPE_TITLES[recapType] || "Partnership Recap"}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">{deal.brandName}</h1>
            <p className="text-[#acaaae] text-sm mt-1">{TYPE_DESCRIPTIONS[recapType] || ""}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#acaaae]">
              {recapType === "quarterly" ? quarterLabel : recapType === "annual" ? new Date().getFullYear().toString() : today}
            </p>
            <p className="text-sm font-bold mt-1">Corner Bar Management</p>
            <p className="text-[#acaaae] text-xs">Prepared by Go Run Rabbit</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">

        {/* Partnership Overview */}
        <div className="bg-[#19191d] rounded-xl p-8">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Partnership Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1f1f23] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Brand</p>
              <p className="text-lg font-bold">{deal.brandName}</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Category</p>
              <p className="text-lg font-bold">{deal.category}</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Tier</p>
              <p className="text-lg font-bold capitalize">{deal.tier}</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Venues Active</p>
              <p className="text-lg font-bold text-[#00eefc]">{involvedVenues.length} of 9</p>
            </div>
          </div>
        </div>

        {/* Activation Delivery */}
        {activePoints.length > 0 && (
          <div className="bg-[#1f1f23] rounded-xl p-8">
            <h2 className="text-xl font-extrabold tracking-tight mb-2">Activation Delivery</h2>
            <p className="text-[#acaaae] text-sm mb-6">
              {recapType === "post-event" ? "Activations delivered at this event" : `Active placements across the CBM portfolio${recapType === "quarterly" ? ` this quarter` : ""}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePoints.map((dp, i) => (
                <div key={i} className="bg-[#19191d] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">{dp.type}</h4>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-[#00eefc]/15 text-[#00eefc]">Active</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dp.venues.map(vid => {
                      const venue = allVenues.find(v => v.id === vid);
                      return venue ? (
                        <div key={vid} className="flex items-center gap-2 bg-[#25252a] rounded-full px-3 py-1">
                          <img src={`/venues/${vid}.jpg`} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-xs">{venue.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reach & Exposure */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">
            {recapType === "post-event" ? "Event Reach" : recapType === "quarterly" ? `${quarterLabel} Reach` : "Annual Reach"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#19191d] rounded-lg p-5 text-center">
              <p className="text-3xl font-extrabold font-mono text-[#00eefc]">{involvedVenues.length}</p>
              <p className="text-[#acaaae] text-xs mt-1">Venues</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-5 text-center">
              <p className="text-3xl font-extrabold font-mono">{fmtNum(totalCapacity)}</p>
              <p className="text-[#acaaae] text-xs mt-1">Combined Capacity</p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-5 text-center">
              <p className="text-3xl font-extrabold font-mono text-[#aea2ff]">
                {recapType === "post-event"
                  ? fmtNum(Math.round(totalWeeklyTraffic / 7))
                  : recapType === "quarterly"
                    ? fmtNum(totalWeeklyTraffic * 13)
                    : fmtNum(annualTraffic)}
              </p>
              <p className="text-[#acaaae] text-xs mt-1">
                {recapType === "post-event" ? "Est. Daily Traffic" : recapType === "quarterly" ? "Quarterly Traffic" : "Annual Traffic"}
              </p>
            </div>
            <div className="bg-[#19191d] rounded-lg p-5 text-center">
              <p className="text-3xl font-extrabold font-mono">{activePoints.length}</p>
              <p className="text-[#acaaae] text-xs mt-1">Active Placements</p>
            </div>
          </div>

          {/* Venue breakdown */}
          <div className="space-y-3">
            {involvedVenues.map(v => {
              const venuePoints = activePoints.filter(dp => dp.venues.includes(v.id));
              return (
                <div key={v.id} className="bg-[#19191d] rounded-xl p-4 flex items-center gap-5">
                  <img src={`/venues/${v.id}.jpg`} alt={v.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{v.name}</h4>
                    <p className="text-[#acaaae] text-xs">{v.type} &middot; {fmtNum(v.avgWeeklyFootTraffic)}/wk</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {venuePoints.map((dp, i) => (
                      <span key={i} className="text-[8px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full bg-[#00eefc]/10 text-[#00eefc]">
                        {dp.type.split(" / ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed the Block — conditional */}
        {dealPoints.some(dp => dp.type.includes("Event Activation") || dp.type.includes("Social Media")) && (
          <div className="bg-[#19191d] rounded-xl p-8">
            <h2 className="text-xl font-extrabold tracking-tight mb-4">Feed the Block Exposure</h2>
            <p className="text-[#acaaae] text-sm mb-6">
              {deal.brandName} {recapType === "post-event" ? "was featured at" : "benefits from"} the Feed the Block concert series
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{fmtNum(feedTheBlock.year2025.totalAttendance)}+</p>
                <p className="text-[#acaaae] text-xs">2025 Attendance</p>
              </div>
              <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono">100K+</p>
                <p className="text-[#acaaae] text-xs">2026 Projected</p>
              </div>
              <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono text-[#aea2ff]">{(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M</p>
                <p className="text-[#acaaae] text-xs">Social Impressions</p>
              </div>
              <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono">{feedTheBlock.audienceProfile.medianAge}</p>
                <p className="text-[#acaaae] text-xs">Median Age</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Highlights / What's Next */}
        <div className="bg-[#25252a] rounded-xl p-8">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">
            {recapType === "annual" ? "Looking Ahead" : "Key Highlights"}
          </h2>
          <div className="space-y-4 text-[#acaaae] leading-relaxed">
            <p>
              {deal.brandName} is {deal.status === "closed" ? "actively placed" : "positioned"} across {involvedVenues.length} venue{involvedVenues.length !== 1 ? "s" : ""} in
              the CBM portfolio with {activePoints.length} active placement{activePoints.length !== 1 ? "s" : ""}, reaching an estimated {fmtNum(annualTraffic)}+ annual guests.
            </p>
            {recapType === "quarterly" && (
              <p>
                This quarter, {deal.brandName} had consistent visibility across {involvedVenues.map(v => v.name).join(", ")}.
                {deal.category.includes("Tequila") ? " Tequila remains the fastest-growing spirit category in the portfolio, with Lucky Day and La Mona Rosa driving the highest agave spirit volume." : ""}
              </p>
            )}
            {recapType === "annual" && (
              <p>
                As we look ahead to the next year, there are opportunities to expand {deal.brandName}&apos;s presence —
                {9 - involvedVenues.length > 0 ? ` ${9 - involvedVenues.length} additional venues remain available for activation.` : " the brand is present across all 9 venues."}
                {" "}Feed the Block 2026 offers additional event-level exposure with 100K+ projected attendance.
              </p>
            )}
            {recapType === "post-event" && (
              <p>
                The event delivered strong foot traffic and brand exposure. Casino crossover data indicates 8,700-10,000+ attendees
                visited nearby casino and hospitality properties during the event window.
              </p>
            )}
          </div>
        </div>

        {/* Growth Opportunities — for quarterly and annual */}
        {(recapType === "quarterly" || recapType === "annual") && 9 - involvedVenues.length > 0 && (
          <div className="bg-[#1f1f23] rounded-xl p-8">
            <h2 className="text-xl font-extrabold tracking-tight mb-4">Growth Opportunities</h2>
            <p className="text-[#acaaae] text-sm mb-4">Venues where {deal.brandName} is not yet activated</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allVenues.filter(v => !allVenueIds.has(v.id)).map(v => (
                <div key={v.id} className="bg-[#19191d] rounded-xl p-4 flex items-center gap-4">
                  <img src={`/venues/${v.id}.jpg`} alt={v.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{v.name}</p>
                    <p className="text-[#acaaae] text-xs">{fmtNum(v.avgWeeklyFootTraffic)}/wk traffic</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#25252a] rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,162,255,0.06),transparent)]" />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-2">
              {recapType === "annual" ? "Ready to renew?" : "Questions about this recap?"}
            </h3>
            <p className="text-[#acaaae] mb-4">
              {recapType === "annual"
                ? `Let's discuss ${deal.brandName}'s partnership for the coming year.`
                : "We're here to discuss performance and opportunities."}
            </p>
            <a href="mailto:keith@gorunrabbit.com" className="bg-[#aea2ff] text-[#1f0078] px-8 py-3 rounded-md font-bold hover:bg-[#a092ff] transition-all inline-block">
              keith@gorunrabbit.com
            </a>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-[9px] text-[#48474b] uppercase tracking-[0.15em] font-bold">
            Corner Bar Management &middot; Go Run Rabbit LLC &middot; Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
