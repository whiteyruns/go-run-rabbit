"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmt, fmtNum } from "@/lib/utils";

export default function BlockPartyPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Event Overview */}
        <div className="bg-gradient-to-br from-amber-950/40 to-gray-900 border border-amber-800/40 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
                Event Series
              </p>
              <h2 className="text-3xl font-bold text-white mb-2">
                Feed the Block 2026
              </h2>
              <p className="text-gray-400 max-w-xl">
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
                sub="Monthly Apr–Jan"
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
        <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-400 font-bold text-lg">
              Confirmed 2026 Sponsorship Revenue
            </h3>
            <span className="text-green-400 font-mono text-2xl font-bold">
              {fmt(feedTheBlock.confirmedTotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {feedTheBlock.confirmedSponsors.map((s) => (
              <div
                key={s.name}
                className="bg-gray-900 border border-green-800/30 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">{s.name}</p>
                  <p className="text-gray-500 text-xs">{s.type}</p>
                </div>
                <p className="text-green-400 font-mono font-bold">
                  {fmt(s.amount)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Municipal sponsors secured. Beverage, energy, lifestyle, and tech
            categories remain wide open.
          </p>
        </div>

        {/* 2025 Proof of Concept */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">
            2025 Season — Proof of Concept
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {feedTheBlock.year2025.headliners.map((h, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-amber-400 font-bold text-lg">{h}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {i === 0
                    ? "April 2025"
                    : i === 1
                      ? "September 2025"
                      : "October 2025"}
                </p>
                <p className="text-white font-mono mt-2">
                  ~{fmtNum(Math.round(40000 / 3))} attendees
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-900/20 border border-green-800/30 rounded-lg p-4">
            <p className="text-green-400 font-bold">
              40,000+ total fans across 3 events — all free admission.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              2026 expands to 10 events with Marshmello kicking off April 2nd
              atop the Forest House Art Car from EDC / Burning Man.
            </p>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">
            Block Party Sponsorship Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {feedTheBlock.sponsorshipTiers.map((tier, i) => (
              <div
                key={tier.tier}
                className={`bg-gray-900 border rounded-xl p-5 ${
                  i === 0
                    ? "border-amber-500 ring-1 ring-amber-500/20"
                    : "border-gray-800"
                }`}
              >
                {i === 0 && (
                  <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">
                    Flagship
                  </p>
                )}
                <h4 className="text-white font-bold text-lg mb-1">
                  {tier.tier}
                </h4>
                <p className="text-amber-400 font-mono text-2xl font-bold mb-4">
                  {tier.price}
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <span className="text-amber-500 mt-0.5">&#10003;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Potential Grid */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">
            Block Party Sponsorship Revenue Potential
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            If fully sold: Presenting + 2 Headline + 3 Supporting + 4 Activation
            ={" "}
            <span className="text-amber-400 font-bold">$1.46M</span> from
            events alone
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-xs">1x Presenting</p>
              <p className="text-amber-400 font-mono font-bold text-xl">
                $500K
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-xs">2x Headline</p>
              <p className="text-amber-400 font-mono font-bold text-xl">
                $500K
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-xs">3x Supporting</p>
              <p className="text-amber-400 font-mono font-bold text-xl">
                $300K
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-xs">4x Activation</p>
              <p className="text-amber-400 font-mono font-bold text-xl">
                $160K
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
