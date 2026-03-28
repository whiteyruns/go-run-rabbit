"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmt, fmtNum } from "@/lib/utils";

export default function BlockPartyPage() {
  const ftb = feedTheBlock;

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">FEED THE BLOCK</h1>
      <p className="text-on-surface-variant mb-10">2026 event series — actual performance data from 2025 season</p>

      <div className="space-y-8">

        {/* Event Overview */}
        <div className="bg-surface-container p-8 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Event Series</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">Feed the Block 2026</h2>
              <p className="text-on-surface-variant max-w-xl">
                Free open-air block party series at 6th &amp; Fremont, presented by Wynn Nightlife &amp; Corner Bar Management.
                10-event series expanding from 3 proven debut shows in 2025.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 min-w-[280px]">
              <MetricCard label="2026 Events" value="10" sub="Every 6 weeks" accent />
              <MetricCard label="Per Event" value="10K+" sub="Projected attendance" />
              <MetricCard label="2025 Proven" value={fmtNum(ftb.year2025.totalAttendance) + "+"} sub="Across 3 shows" accent />
              <MetricCard label="Total Signups" value={fmtNum(ftb.year2025.totalSignups)} sub="Confirmed demand" />
            </div>
          </div>
        </div>

        {/* Confirmed Sponsors — CLOSED DEALS */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-on-surface font-extrabold text-xl tracking-tight">Confirmed 2026 Sponsorship Revenue</h3>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mt-1">Both deals closed</p>
            </div>
            <span className="text-neon-cyan font-mono text-3xl font-extrabold">{fmt(ftb.confirmedTotal)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {ftb.confirmedSponsors.map((s) => (
              <div key={s.name} className="bg-surface-container-high rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-on-surface font-bold">{s.name}</p>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan">Closed</span>
                  </div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold mt-1">{s.type}</p>
                </div>
                <p className="text-neon-cyan font-mono font-bold text-xl">{fmt(s.amount)}</p>
              </div>
            ))}
          </div>
          <p className="text-on-surface-variant text-sm">Municipal sponsors secured. Beverage, energy, lifestyle, and tech categories remain wide open.</p>
        </div>

        {/* 2025 Event Performance — REAL DATA */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">2025 Season — Actual Performance</h3>
          <p className="text-on-surface-variant text-sm mb-6">Real attendance, signup, and crossover data from all 3 events</p>

          <div className="space-y-4 mb-6">
            {ftb.year2025.events.map((event) => (
              <div key={event.headliner} className="bg-surface-container rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-on-surface font-bold text-lg">{event.headliner}</h4>
                    <span className="text-on-surface-variant text-xs">{event.date}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Attendance</p>
                    <p className="text-neon-cyan font-mono font-bold">{event.attendance}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Signups</p>
                    <p className="text-neon-violet font-mono font-bold">{fmtNum(event.signups)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Casino Crossover</p>
                    <p className="text-on-surface font-mono font-bold">{event.casinoCrossover}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container rounded-xl p-5">
            <p className="text-neon-cyan font-bold">{fmtNum(ftb.year2025.totalAttendance)}+ total fans across 3 events — all free admission.</p>
            <p className="text-on-surface-variant text-sm mt-1">
              2026 expands to 10 events with Marshmello kicking off April 2nd atop the Forest House Art Car.
            </p>
          </div>
        </div>

        {/* Audience Profile */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">Audience Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Median Age</p>
              <p className="text-3xl font-extrabold text-on-surface font-mono">{ftb.audienceProfile.medianAge}</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Dwell Time</p>
              <p className="text-3xl font-extrabold text-neon-cyan font-mono">{ftb.audienceProfile.dwellTimeMinutes}<span className="text-sm text-on-surface-variant"> min</span></p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Stay 45+ Min</p>
              <p className="text-3xl font-extrabold text-neon-violet font-mono">{ftb.audienceProfile.stayOver45MinPct}%</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Hispanic/Latino</p>
              <p className="text-3xl font-extrabold text-on-surface font-mono">{ftb.audienceProfile.hispanicLatinoPct}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Top Markets</p>
              <div className="flex flex-wrap gap-2">
                {ftb.audienceProfile.topMarkets.map(m => (
                  <span key={m} className="text-xs text-on-surface bg-surface-container-high px-2.5 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Search Origin Zones</p>
              <div className="flex flex-wrap gap-2">
                {ftb.audienceProfile.searchOriginZones.map(z => (
                  <span key={z} className="text-xs text-on-surface bg-surface-container-high px-2.5 py-1 rounded-full">{z}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Performance */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">Social Media Performance</h3>
          <p className="text-on-surface-variant text-sm mb-6">Jan–Nov 2025 — actual metrics</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Total Impressions" value={`${(ftb.socialMetrics.impressions / 1000000).toFixed(1)}M`} sub="Across all platforms" accent />
            <MetricCard label="Engagements" value={fmtNum(ftb.socialMetrics.engagements)} sub="+13.8% engagement rate" />
            <MetricCard label="Video Views" value={`${(ftb.socialMetrics.videoViews / 1000000).toFixed(1)}M`} sub="Organic reach" accent />
            <MetricCard label="New Followers" value={fmtNum(ftb.socialMetrics.newFollowers)} trend={ftb.socialMetrics.followerGrowth} sub="Jan-Nov 2025" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Instagram</p>
              <p className="text-neon-violet font-mono font-bold text-lg">{fmtNum(ftb.socialMetrics.instagramImpressions / 1000)}K impressions</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">TikTok</p>
              <p className="text-neon-cyan font-mono font-bold text-lg">{fmtNum(ftb.socialMetrics.tiktokImpressions / 1000)}K impressions</p>
              <p className="text-on-surface-variant text-xs">{ftb.socialMetrics.tiktokEngagement} engagement rate</p>
            </div>
            <div className="bg-surface-container rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Viral Content</p>
              <p className="text-neon-pink font-mono font-bold text-lg">{(ftb.socialMetrics.viralReelViews / 1000000).toFixed(1)}M reel views</p>
              <p className="text-on-surface-variant text-xs">{fmtNum(ftb.socialMetrics.viralTiktokViews / 1000)}K+ TikTok clip</p>
            </div>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">Sponsorship Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ftb.sponsorshipTiers.map((tier, i) => (
              <div key={tier.tier} className={`bg-surface-container-high rounded-xl p-6 hover:bg-surface-bright transition-all ${i === 0 ? "ring-1 ring-neon-violet/30" : ""}`}>
                {i === 0 && <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Flagship</p>}
                <h4 className="text-on-surface font-bold text-lg mb-1">{tier.tier}</h4>
                <p className="text-neon-cyan font-mono text-2xl font-bold mb-4">{tier.price}</p>
                <ul className="space-y-2">
                  {tier.benefits.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="text-neon-cyan mt-0.5">&#10003;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Potential */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">Revenue Potential</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Fully sold: Presenting + 2 Headline + 3 Supporting + 4 Activation = <span className="text-neon-cyan font-bold">$1.46M</span> from events alone
          </p>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "1x Presenting", value: "$500K" },
              { label: "2x Headline", value: "$500K" },
              { label: "3x Supporting", value: "$300K" },
              { label: "4x Activation", value: "$160K" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-container rounded-xl p-5 text-center">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
                <p className="text-neon-violet font-mono font-bold text-xl mt-2">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
