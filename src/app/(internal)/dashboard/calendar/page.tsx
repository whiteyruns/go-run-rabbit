"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { venues } from "@/data/venues";
import { vegasTentpoles } from "@/data/tentpoles";
import { crossVenueStats } from "@/data/guest-journeys";
import { feedTheBlock } from "@/data/feed-the-block";
import {
  computeDepletions,
  aggregatePortfolio,
  WEEKS_PER_YEAR,
} from "@/lib/depletion-engine";
import { fmtNum } from "@/lib/utils";

export default function CalendarPage() {
  const allDepletions = venues.map(computeDepletions).filter(Boolean) as NonNullable<ReturnType<typeof computeDepletions>>[];
  const portfolioDepletions = aggregatePortfolio(allDepletions);

  const totalWeeklyTraffic = venues.reduce((sum, v) => sum + v.avgWeeklyFootTraffic, 0);
  const annualFootTraffic = totalWeeklyTraffic * 52;
  const blockPartyProjected = feedTheBlock.year2026.projectedTotalAttendance;

  const baseWeeklyDepletions = portfolioDepletions.totalCases / WEEKS_PER_YEAR;
  const tentpoleAdjustedAnnual = Math.round(
    vegasTentpoles.reduce((sum, t) => {
      const weeks = t.tier === "mega" ? 2 : t.tier === "major" ? 1.5 : 4;
      return sum + (baseWeeklyDepletions * t.depletionMultiplier * weeks);
    }, 0) + (baseWeeklyDepletions * 30)
  );

  const impressionData = {
    venueFootTraffic: annualFootTraffic,
    blockPartyTraffic: blockPartyProjected,
    crossVenueBrandTouches: crossVenueStats.annualJourneys * crossVenueStats.brandTouchpointsPerNight,
    tentpoleBoost: Math.round(annualFootTraffic * 0.35),
    socialMediaImpressions: 25000000,
    blockPartySocialImpressions: 50000000,
    earnedMediaImpressions: 15000000,
  };

  const totalImpressions = Object.values(impressionData).reduce((s, v) => s + v, 0);

  const chartData = vegasTentpoles.map((t) => ({
    name: t.month,
    traffic: t.trafficMultiplier,
    depletions: t.depletionMultiplier,
  }));

  const cpmRows = [
    { channel: "CBM Portfolio ($250K Headline)", cpm: 250000 / (totalImpressions / 1000), diff: 0, note: "Venues + Block Party + Social + Cross-Venue", highlight: true },
    { channel: "Las Vegas Billboard (Strip)", cpm: 18.50, diff: Math.round((18.50 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "OOH industry avg", highlight: false },
    { channel: "Vegas Digital Billboard", cpm: 22.00, diff: Math.round((22.00 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "Digital OOH", highlight: false },
    { channel: "Instagram/Meta Ads", cpm: 11.50, diff: Math.round((11.50 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "Paid social avg", highlight: false },
    { channel: "Nightclub Sponsorship (Strip)", cpm: 14.00, diff: Math.round((14.00 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "Hakkasan, Tao Group benchmark", highlight: false },
    { channel: "Sports Arena Sponsorship", cpm: 25.00, diff: Math.round((25.00 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "T-Mobile Arena, Allegiant", highlight: false },
    { channel: "Podcast/Influencer", cpm: 20.00, diff: Math.round((20.00 / (250000 / (totalImpressions / 1000)) - 1) * 100), note: "Avg sponsored content CPM", highlight: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Traffic & depletion multiplier chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">Vegas Tentpole Events & Depletion Multipliers</h3>
          <p className="text-gray-500 text-sm mb-6">Sponsorship value isn{"'"}t flat — these weeks command premium pricing and spike depletions 3-5x</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} label={{ value: "Multiplier vs. Baseline", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="traffic" fill="#3b82f6" name="Foot Traffic Multiplier" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depletions" fill="#C49A6C" name="Depletion Multiplier" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tentpole event cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vegasTentpoles.filter((t) => t.tier !== "seasonal").map((t, i) => (
            <div key={i} className={`bg-gray-900 border rounded-xl p-5 ${t.tier === "mega" ? "border-amber-800/50" : "border-gray-800"}`}>
              {t.tier === "mega" && <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Mega Event</p>}
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-white font-bold">{t.event}</h4>
                <span className="text-gray-400 text-xs font-mono flex-shrink-0">{t.dates}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div><p className="text-gray-500 text-xs">Visitors</p><p className="text-white font-mono font-bold text-sm">{t.attendees > 0 ? `${(t.attendees / 1000).toFixed(0)}K` : "\u2014"}</p></div>
                <div><p className="text-gray-500 text-xs">Traffic</p><p className="text-blue-400 font-mono font-bold text-sm">{t.trafficMultiplier}x</p></div>
                <div><p className="text-gray-500 text-xs">Depletions</p><p className="text-amber-400 font-mono font-bold text-sm">{t.depletionMultiplier}x</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tentpole-adjusted depletions comparison */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Tentpole-Adjusted Annual Depletions</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-5 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Baseline (Flat)</p>
              <p className="text-white font-mono text-2xl font-bold">{fmtNum(portfolioDepletions.totalCases)}</p>
              <p className="text-gray-500 text-xs">cases/yr</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-5 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tentpole-Adjusted</p>
              <p className="text-amber-400 font-mono text-2xl font-bold">{fmtNum(tentpoleAdjustedAnnual)}</p>
              <p className="text-gray-500 text-xs">cases/yr</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-5 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tentpole Uplift</p>
              <p className="text-green-400 font-mono text-2xl font-bold">+{(((tentpoleAdjustedAnnual / portfolioDepletions.totalCases) - 1) * 100).toFixed(0)}%</p>
              <p className="text-gray-500 text-xs">vs. baseline</p>
            </div>
          </div>
        </div>

        {/* CPM Comparison */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">Cost-Per-Impression (CPM) Comparison</h3>
          <p className="text-gray-500 text-sm mb-6">CBM sponsorship CPM vs. traditional Vegas advertising — the math that closes deals</p>
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm">
              <span className="text-amber-400 font-bold">CBM Portfolio Total Impressions:</span>{" "}
              <span className="text-white font-mono font-bold">{(totalImpressions / 1000000).toFixed(0)}M+</span> annual
              (physical foot traffic + cross-venue brand touches + social/UGC + earned media + Block Party)
            </p>
            <p className="text-gray-400 text-xs mt-1">
              At a $250K headline sponsorship: CPM of <span className="text-green-400 font-bold">${(250000 / (totalImpressions / 1000)).toFixed(2)}</span> |
              At a $100K supporting sponsorship: CPM of <span className="text-green-400 font-bold">${(100000 / (totalImpressions / 1000)).toFixed(2)}</span>
            </p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">Channel</th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase text-right">CPM</th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase text-right">vs. CBM ($250K)</th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">Notes</th>
              </tr>
            </thead>
            <tbody>
              {cpmRows.map((row, i) => (
                <tr key={i} className={`border-b border-gray-800 ${row.highlight ? "bg-green-950/20" : ""}`}>
                  <td className="py-3 px-4 text-white text-sm font-medium">{row.channel}</td>
                  <td className={"py-3 px-4 font-mono text-sm text-right " + (row.highlight ? "text-green-400 font-bold" : "text-gray-300")}>${row.cpm.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm font-mono text-right">
                    {row.diff === 0 ? <span className="text-green-400">Baseline</span> : <span className="text-red-400">+{row.diff}% more expensive</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* The CPM pitch */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
          <h3 className="text-amber-400 font-bold text-lg mb-3">The CPM Pitch</h3>
          <p className="text-gray-300 leading-relaxed">
            {"\""} A Las Vegas Strip billboard costs $18-22 CPM and a guest drives past it in 3 seconds. A CBM portfolio sponsorship delivers your brand at
            <span className="text-green-400 font-bold"> ${(250000 / (totalImpressions / 1000)).toFixed(2)} CPM</span> — and that guest is
            <span className="text-amber-400 font-bold"> holding your product in their hand</span> for 3+ hours across multiple venues.
            Your brand isn{"'"}t background noise — it{"'"}s the experience. And unlike a billboard, every impression is a potential pour.{"\""}
          </p>
        </div>
      </div>
    </div>
  );
}
