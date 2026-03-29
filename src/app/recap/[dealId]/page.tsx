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
  nextAction: string | null;
  nextActionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect", contacted: "Contacted", meeting: "Meeting Scheduled",
  proposal: "Proposal Sent", negotiation: "In Negotiation", closed: "Closed / Active", lost: "Lost",
};

const DEAL_POINT_STATUS_LABELS: Record<string, string> = {
  offered: "Offered", negotiating: "Negotiating", confirmed: "Confirmed", active: "Active", expired: "Expired",
};

export default function RecapPage() {
  const { dealId } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pipeline/${dealId}`)
      .then(r => {
        if (!r.ok) throw new Error("Deal not found");
        return r.json();
      })
      .then(d => setDeal(d.deal))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
      <p className="text-[#acaaae]">Loading...</p>
    </div>
  );

  if (error || !deal) return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
      <p className="text-[#ff6b98] text-lg font-bold">{error || "Deal not found"}</p>
    </div>
  );

  let dealPoints: DealPoint[] = [];
  try { dealPoints = deal.dealPoints ? JSON.parse(deal.dealPoints) : []; } catch { /* ignore */ }

  let venueIds: string[] = [];
  try { venueIds = deal.venues ? JSON.parse(deal.venues) : []; } catch { /* ignore */ }

  // Get all venues involved (from deal points + venue field)
  const allVenueIds = new Set<string>([...venueIds]);
  dealPoints.forEach(dp => dp.venues.forEach(v => allVenueIds.add(v)));
  const involvedVenues = allVenues.filter(v => allVenueIds.has(v.id));

  const activeDealPoints = dealPoints.filter(dp => dp.status === "active" || dp.status === "confirmed");
  const pendingDealPoints = dealPoints.filter(dp => dp.status === "offered" || dp.status === "negotiating");

  const totalCapacity = involvedVenues.reduce((s, v) => s + v.capacity, 0);
  const totalWeeklyTraffic = involvedVenues.reduce((s, v) => s + v.avgWeeklyFootTraffic, 0);

  const isClosed = deal.status === "closed";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f3f0f4]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-[#000]/60 backdrop-blur-xl py-4 px-8 print:bg-white print:text-black">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00eefc]">
              {isClosed ? "Partnership Recap" : "Deal Summary"}
            </p>
            <h1 className="text-xl font-extrabold tracking-tight">{deal.brandName}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#acaaae]">Prepared by Go Run Rabbit</p>
            <p className="text-[#acaaae] text-xs">{today}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">

        {/* Deal overview */}
        <div className="bg-[#19191d] rounded-xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">{deal.brandName}</h2>
              <p className="text-[#acaaae]">{deal.category} &middot; {deal.tier.charAt(0).toUpperCase() + deal.tier.slice(1)} Tier</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full ${
                isClosed ? "bg-[#00eefc]/15 text-[#00eefc]" : "bg-[#aea2ff]/15 text-[#aea2ff]"
              }`}>
                {STATUS_LABELS[deal.status] || deal.status}
              </span>
              {deal.value && (
                <p className="text-[#00eefc] font-mono text-2xl font-extrabold mt-2">
                  ${fmtNum(deal.value)}
                </p>
              )}
            </div>
          </div>

          {deal.contactName && (
            <div className="bg-[#1f1f23] rounded-lg p-4 mb-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Contact</p>
              <p className="text-[#f3f0f4]">{deal.contactName}{deal.contactEmail ? ` — ${deal.contactEmail}` : ""}</p>
            </div>
          )}

          {deal.notes && (
            <div className="bg-[#1f1f23] rounded-lg p-4">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#acaaae] mb-1">Notes</p>
              <p className="text-[#acaaae] text-sm leading-relaxed">{deal.notes}</p>
            </div>
          )}
        </div>

        {/* Deal Points */}
        {dealPoints.length > 0 && (
          <div className="bg-[#1f1f23] rounded-xl p-8">
            <h3 className="text-xl font-extrabold tracking-tight mb-6">
              {isClosed ? "Active Placement & Activation" : "Deal Points"}
            </h3>

            {activeDealPoints.length > 0 && (
              <div className="mb-6">
                {!isClosed && <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#00eefc] mb-3">Confirmed / Active</p>}
                <div className="space-y-3">
                  {activeDealPoints.map((dp, i) => (
                    <div key={i} className="bg-[#19191d] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[#f3f0f4] font-bold">{dp.type}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full bg-[#00eefc]/15 text-[#00eefc]">
                          {DEAL_POINT_STATUS_LABELS[dp.status] || dp.status}
                        </span>
                      </div>
                      {dp.venues.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {dp.venues.map(vid => {
                            const venue = allVenues.find(v => v.id === vid);
                            return venue ? (
                              <span key={vid} className="text-xs text-[#f3f0f4] bg-[#25252a] px-2.5 py-1 rounded-full">{venue.name}</span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingDealPoints.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#aea2ff] mb-3">
                  {isClosed ? "Additional Opportunities" : "Under Discussion"}
                </p>
                <div className="space-y-3">
                  {pendingDealPoints.map((dp, i) => (
                    <div key={i} className="bg-[#19191d] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[#f3f0f4] font-bold">{dp.type}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full bg-[#aea2ff]/10 text-[#aea2ff]">
                          {DEAL_POINT_STATUS_LABELS[dp.status] || dp.status}
                        </span>
                      </div>
                      {dp.venues.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {dp.venues.map(vid => {
                            const venue = allVenues.find(v => v.id === vid);
                            return venue ? (
                              <span key={vid} className="text-xs text-[#acaaae] bg-[#25252a] px-2.5 py-1 rounded-full">{venue.name}</span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Venue Reach */}
        {involvedVenues.length > 0 && (
          <div className="bg-[#1f1f23] rounded-xl p-8">
            <h3 className="text-xl font-extrabold tracking-tight mb-2">Venue Reach</h3>
            <p className="text-[#acaaae] text-sm mb-6">
              {deal.brandName} {isClosed ? "is activated" : "would be activated"} across {involvedVenues.length} venue{involvedVenues.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#19191d] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono text-[#00eefc]">{involvedVenues.length}</p>
                <p className="text-[#acaaae] text-xs">Venues</p>
              </div>
              <div className="bg-[#19191d] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono">{fmtNum(totalCapacity)}</p>
                <p className="text-[#acaaae] text-xs">Combined Capacity</p>
              </div>
              <div className="bg-[#19191d] rounded-lg p-4 text-center">
                <p className="text-2xl font-extrabold font-mono text-[#aea2ff]">{fmtNum(totalWeeklyTraffic * 52)}</p>
                <p className="text-[#acaaae] text-xs">Annual Foot Traffic</p>
              </div>
            </div>

            <div className="space-y-3">
              {involvedVenues.map(v => {
                const venuePoints = dealPoints.filter(dp => dp.venues.includes(v.id));
                return (
                  <div key={v.id} className="bg-[#19191d] rounded-xl p-4 flex items-center gap-5">
                    <img src={`/venues/${v.id}.jpg`} alt={v.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-[#f3f0f4] font-bold">{v.name}</h4>
                      <p className="text-[#acaaae] text-xs">{v.type} &middot; Cap {fmtNum(v.capacity)} &middot; {fmtNum(v.avgWeeklyFootTraffic)}/wk</p>
                      {venuePoints.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {venuePoints.map((dp, i) => (
                            <span key={i} className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${
                              dp.status === "active" || dp.status === "confirmed" ? "bg-[#00eefc]/10 text-[#00eefc]" : "bg-[#aea2ff]/10 text-[#aea2ff]"
                            }`}>
                              {dp.type.split(" / ")[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feed the Block exposure — only show if deal has event activation points */}
        {dealPoints.some(dp => dp.type.includes("Event Activation") || dp.type.includes("Social Media")) && (
        <div className="bg-[#19191d] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-4">Feed the Block — Event Exposure</h3>
          <p className="text-[#acaaae] text-sm mb-4">
            {deal.brandName} {isClosed ? "benefits from" : "would benefit from"} exposure at the Feed the Block concert series —
            10 events in 2026 with 100K+ projected attendance.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-xl font-extrabold font-mono text-[#00eefc]">{fmtNum(feedTheBlock.year2025.totalAttendance)}+</p>
              <p className="text-[#acaaae] text-xs">2025 Proven</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-xl font-extrabold font-mono">100K+</p>
              <p className="text-[#acaaae] text-xs">2026 Projected</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-xl font-extrabold font-mono text-[#aea2ff]">{(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M</p>
              <p className="text-[#acaaae] text-xs">Social Impressions</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg p-4 text-center">
              <p className="text-xl font-extrabold font-mono">{feedTheBlock.audienceProfile.medianAge}</p>
              <p className="text-[#acaaae] text-xs">Median Age</p>
            </div>
          </div>
        </div>
        )}

        {/* Next steps */}
        {deal.nextAction && (
          <div className="bg-[#25252a] rounded-xl p-8">
            <h3 className="text-xl font-extrabold tracking-tight mb-3">Next Steps</h3>
            <p className="text-[#f3f0f4] text-lg">{deal.nextAction}</p>
            {deal.nextActionDate && (
              <p className="text-[#acaaae] text-sm mt-2">Target: {new Date(deal.nextActionDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#25252a] rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(174,162,255,0.06),transparent)]" />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-2">
              {isClosed ? "Thank you for the partnership" : "Let's finalize this"}
            </h3>
            <p className="text-[#acaaae] mb-4">
              {isClosed
                ? `We're excited to have ${deal.brandName} as part of the CBM portfolio.`
                : `Ready to move forward? Let's schedule a call.`}
            </p>
            <a href="mailto:keith@gorunrabbit.com" className="bg-[#aea2ff] text-[#1f0078] px-8 py-3 rounded-md font-bold hover:bg-[#a092ff] transition-all inline-block">
              keith@gorunrabbit.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[9px] text-[#48474b] uppercase tracking-[0.15em] font-bold">
            Go Run Rabbit LLC &middot; Corner Bar Management &middot; Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
