"use client";

import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";
import { venues } from "@/data/venues";
import { sponsorshipCategories } from "@/data/categories";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmt, fmtNum } from "@/lib/utils";

export default function CbmDashboardPreview() {
  const totalCapacity = venues.reduce((sum, v) => sum + v.capacity, 0);
  const totalCurrentRevenue = sponsorshipCategories.reduce((sum, c) => sum + c.currentRevenue, 0);
  const totalProjectedRevenue = sponsorshipCategories.reduce((sum, c) => sum + c.projectedRevenue, 0);
  const totalWeeklyTraffic = venues.reduce((sum, v) => sum + v.avgWeeklyFootTraffic, 0);
  const annualFootTraffic = totalWeeklyTraffic * 52;
  const blockPartyProjected = feedTheBlock.year2026.projectedTotalAttendance;
  const gapRevenue = totalProjectedRevenue - totalCurrentRevenue;

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-2">
        <Link
          href="/corner-bar-management"
          className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors"
        >
          &larr; Corner Bar Management
        </Link>
      </div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
            Operations
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            PORTFOLIO INTELLIGENCE
          </h1>
          <p className="text-on-surface-variant">
            Live portfolio metrics across the CBM venue network
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Revenue */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Current Sponsor Revenue" value={fmt(totalCurrentRevenue)} sub="Annual across portfolio" />
          <MetricCard label="Projected Potential" value={fmt(totalProjectedRevenue)} sub="Fully sold inventory" accent />
          <MetricCard label="Revenue Gap" value={fmt(gapRevenue)} sub="Unsold sponsorship value" />
          <MetricCard label="Capture Rate" value={`${((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%`} sub="Of total potential" />
        </div>

        {/* Portfolio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Venues" value={venues.length.toString()} sub="Fremont East + Arts District" />
          <MetricCard label="Combined Capacity" value={fmtNum(totalCapacity) + "+"} sub="Across all venues" />
          <MetricCard label="Annual Foot Traffic" value={`${(annualFootTraffic / 1000000).toFixed(1)}M+`} sub="Venue traffic only" accent />
          <MetricCard label="Block Party 2026" value="100K+" sub="Projected across 10 events" />
        </div>

        {/* The Opportunity */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-neon-cyan font-extrabold text-lg mb-3">The Opportunity</h3>
          <p className="text-on-surface leading-relaxed">
            Corner Bar Management controls {venues.length} venues with a combined capacity
            of {fmtNum(totalCapacity)}+, generating an
            estimated {(annualFootTraffic / 1000000).toFixed(1)}M+ annual foot traffic.
            Add in Feed the Block{"'"}s projected 100K+ attendees across 10 events in 2026,
            and the combined audience reach
            exceeds {((annualFootTraffic + blockPartyProjected) / 1000000).toFixed(1)}M annually.
          </p>
          <p className="text-on-surface leading-relaxed mt-3">
            Based on estimates, CBM captures
            just <span className="text-neon-pink font-bold">{fmt(totalCurrentRevenue)}</span> in
            annual sponsorship revenue —
            only <span className="text-neon-pink font-bold">{((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%</span> of
            the estimated <span className="text-neon-cyan font-bold">{fmt(totalProjectedRevenue)}</span> addressable
            opportunity.
          </p>
        </div>

        {/* Venue Portfolio */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-4">
            Venue Portfolio
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {venues.map((v) => (
              <div
                key={v.name}
                className="bg-surface-container-high rounded-xl p-5"
              >
                <p className="text-on-surface font-bold text-sm mb-1">{v.name}</p>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  <span>Cap: <span className="text-on-surface font-mono">{fmtNum(v.capacity)}</span></span>
                  <span>{fmtNum(v.sqft)} sq ft</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsorship Categories */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-4">
            Sponsorship Categories
          </h3>
          <div className="space-y-2">
            {sponsorshipCategories.map((c) => {
              const pct = c.projectedRevenue > 0 ? (c.currentRevenue / c.projectedRevenue) * 100 : 0;
              return (
                <div key={c.name} className="bg-surface-container-high rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-on-surface font-bold text-sm">{c.name}</p>
                    <p className="text-on-surface-variant text-xs mt-0.5">
                      {fmt(c.currentRevenue)} of {fmt(c.projectedRevenue)} potential
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: pct > 50 ? "#00eefc" : pct > 0 ? "#aea2ff" : "#ff6b98",
                        }}
                      />
                    </div>
                    <span className="text-on-surface-variant text-xs font-mono w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
