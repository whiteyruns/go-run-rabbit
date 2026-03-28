"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmt, fmtNum } from "@/lib/utils";

export default function BlockPartyPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        Feed the Block 2026
      </h1>
      <p className="text-on-surface-variant mb-10">
        Marketing &amp; sponsorship lifecycle for the free open-air block party
        series at 6th &amp; Fremont.
      </p>

      <div className="space-y-8">
        {/* Event Overview */}
        <div className="bg-surface-container p-8 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
                Event Series
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
                Feed the Block 2026
              </h2>
              <p className="text-on-surface-variant max-w-xl">
                Free open-air block party series at 6th &amp; Fremont, presented
                by Wynn Nightlife &amp; Corner Bar Management. Transforms the
                intersection into a high-energy outdoor celebration with
                world-class DJs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 min-w-[280px]">
              <MetricCard
                label="2026 Events"
                value="10"
                sub="Monthly Apr-Jan"
                accent
              />
              <MetricCard
                label="Per Event"
                value="10K+"
                sub="Projected attendance"
              />
              <MetricCard
                label="Total Reach"
                value="100K+"
                sub="Annual attendees"
                accent
              />
              <MetricCard
                label="2025 Proven"
                value="40K+"
                sub="Across 3 debut shows"
              />
            </div>
          </div>
        </div>

        {/* Confirmed Sponsors */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight">
              Confirmed 2026 Sponsorship Revenue
            </h3>
            <span className="text-neon-cyan font-mono text-2xl font-bold">
              {fmt(feedTheBlock.confirmedTotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {feedTheBlock.confirmedSponsors.map((s) => (
              <div
                key={s.name}
                className="bg-surface-container-high rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="text-on-surface font-bold">{s.name}</p>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                    {s.type}
                  </p>
                </div>
                <p className="text-neon-cyan font-mono font-bold">
                  {fmt(s.amount)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-on-surface-variant text-sm">
            Municipal sponsors secured. Beverage, energy, lifestyle, and tech
            categories remain wide open.
          </p>
        </div>

        {/* 2025 Proof of Concept */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-6">
            2025 Season — Proof of Concept
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {feedTheBlock.year2025.headliners.map((h, i) => (
              <div
                key={i}
                className="bg-surface-container rounded-xl p-6 text-center"
              >
                <p className="text-neon-violet font-bold text-lg">{h}</p>
                <p className="text-on-surface-variant text-sm mt-2">
                  {i === 0
                    ? "April 2025"
                    : i === 1
                      ? "September 2025"
                      : "October 2025"}
                </p>
                <p className="text-on-surface font-mono mt-2">
                  ~{fmtNum(Math.round(40000 / 3))} attendees
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-surface-container rounded-xl p-5">
            <p className="text-neon-cyan font-bold">
              40,000+ total fans across 3 events — all free admission.
            </p>
            <p className="text-on-surface-variant text-sm mt-1">
              2026 expands to 10 events with Marshmello kicking off April 2nd
              atop the Forest House Art Car from EDC / Burning Man.
            </p>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <div>
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-6">
            Block Party Sponsorship Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {feedTheBlock.sponsorshipTiers.map((tier, i) => (
              <div
                key={tier.tier}
                className={`bg-surface-container-high rounded-xl p-6 transition-all duration-300 hover:bg-surface-bright ${
                  i === 0
                    ? "ring-1 ring-neon-violet/30"
                    : ""
                }`}
              >
                {i === 0 && (
                  <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
                    Flagship
                  </p>
                )}
                <h4 className="text-on-surface font-bold text-lg mb-1">
                  {tier.tier}
                </h4>
                <p className="text-neon-cyan font-mono text-2xl font-bold mb-4">
                  {tier.price}
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-on-surface-variant"
                    >
                      <span className="text-neon-cyan mt-0.5">&#10003;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Potential Grid */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-2">
            Block Party Sponsorship Revenue Potential
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            If fully sold: Presenting + 2 Headline + 3 Supporting + 4 Activation
            ={" "}
            <span className="text-neon-cyan font-bold">$1.46M</span> from
            events alone
          </p>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                1x Presenting
              </p>
              <p className="text-neon-violet font-mono font-bold text-xl mt-2">
                $500K
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                2x Headline
              </p>
              <p className="text-neon-violet font-mono font-bold text-xl mt-2">
                $500K
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                3x Supporting
              </p>
              <p className="text-neon-violet font-mono font-bold text-xl mt-2">
                $300K
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                4x Activation
              </p>
              <p className="text-neon-violet font-mono font-bold text-xl mt-2">
                $160K
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
