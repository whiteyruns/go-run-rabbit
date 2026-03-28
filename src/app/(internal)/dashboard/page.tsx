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
import { MetricCard } from "@/components/ui/metric-card";
import { venues } from "@/data/venues";
import { sponsorshipCategories } from "@/data/categories";
import { feedTheBlock } from "@/data/feed-the-block";
import { fmt, fmtNum } from "@/lib/utils";

export default function DashboardPage() {
  const totalCapacity = venues.reduce((sum, v) => sum + v.capacity, 0);
  const totalSqFt = venues.reduce((sum, v) => sum + v.sqft, 0);
  const totalCurrentRevenue = sponsorshipCategories.reduce((sum, c) => sum + c.currentRevenue, 0);
  const totalProjectedRevenue = sponsorshipCategories.reduce((sum, c) => sum + c.projectedRevenue, 0);
  const totalWeeklyTraffic = venues.reduce((sum, v) => sum + v.avgWeeklyFootTraffic, 0);
  const annualFootTraffic = totalWeeklyTraffic * 52;
  const blockPartyProjected = feedTheBlock.year2026.projectedTotalAttendance;
  const gapRevenue = totalProjectedRevenue - totalCurrentRevenue;

  const revenueByCategory = sponsorshipCategories.map((c) => ({
    name: c.name.split(" /")[0].split(" (")[0],
    current: c.currentRevenue,
    projected: c.projectedRevenue,
    gap: c.projectedRevenue - c.currentRevenue,
  }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">EXECUTIVE SUMMARY</h1>
      <p className="text-on-surface-variant mb-10">Live portfolio metrics across the CBM venue network</p>

      <div className="space-y-10">
        {/* Primary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Current Sponsor Revenue" value={fmt(totalCurrentRevenue)} sub="Annual across portfolio" />
          <MetricCard label="Projected Potential" value={fmt(totalProjectedRevenue)} sub="Fully sold inventory" accent />
          <MetricCard label="Revenue Gap" value={fmt(gapRevenue)} sub="Unsold sponsorship value" />
          <MetricCard label="Capture Rate" value={`${((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%`} sub="Of total potential" />
        </div>

        {/* Secondary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Venues" value={venues.length.toString()} sub="Fremont East + Arts District" />
          <MetricCard label="Annual Foot Traffic" value={`${(annualFootTraffic / 1000000).toFixed(1)}M+`} sub="Venue traffic only" />
          <MetricCard label="Block Party 2026" value="100K+" sub="Projected across 10 events" accent />
          <MetricCard label="Combined Reach" value={`${((annualFootTraffic + blockPartyProjected) / 1000000).toFixed(1)}M+`} sub="Venues + Events annually" />
        </div>

        {/* Revenue by Category chart */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-on-surface uppercase mb-1">Revenue by Category</h3>
              <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">Current revenue vs. unsold gap by vertical</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00eefc]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Current Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff6b98]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Unsold Gap</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={revenueByCategory} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
              <XAxis dataKey="name" tick={{ fill: "#acaaae", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }}
                labelStyle={{ color: "#f3f0f4" }}
                formatter={(v) => fmt(Number(v))}
              />
              <Legend />
              <Bar dataKey="current" stackId="a" fill="#00eefc" name="Current Revenue" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gap" stackId="a" fill="#ff6b98" name="Unsold Gap" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* The Opportunity callout */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-neon-cyan font-extrabold text-lg mb-3">The Opportunity</h3>
          <p className="text-on-surface leading-relaxed">
            Corner Bar Management controls 9 venues with a combined capacity of {fmtNum(totalCapacity)}+ across {fmtNum(totalSqFt)} sq ft, generating an estimated {(annualFootTraffic / 1000000).toFixed(1)}M+ annual foot traffic.
            Add in Feed the Block{"'"}s projected 100K+ attendees across 10 events in 2026, and the combined audience reach exceeds {((annualFootTraffic + blockPartyProjected) / 1000000).toFixed(1)}M annually.
          </p>
          <p className="text-on-surface leading-relaxed mt-3">
            Feed the Block has already secured <span className="text-neon-cyan font-bold">$400K</span> in confirmed sponsorships from LVCVA and the City of Las Vegas — proving institutional buy-in.
            The entire beverage/liquor portfolio sponsorship picture is currently unknown and needs to be obtained from Corner Bar{"'"}s team.
          </p>
          <p className="text-on-surface leading-relaxed mt-3">
            Based on estimates, CBM captures just <span className="text-neon-pink font-bold">{fmt(totalCurrentRevenue)}</span> in annual sponsorship revenue — only <span className="text-neon-pink font-bold">{((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%</span> of
            the estimated <span className="text-neon-cyan font-bold">{fmt(totalProjectedRevenue)}</span> addressable opportunity. Categories like rum, energy drinks, non-alcoholic beverages, and tech/POS have
            <span className="text-neon-pink font-bold"> zero</span> sponsor presence. This dashboard maps the full inventory so CBM can sell it systematically.
          </p>
        </div>
      </div>
    </div>
  );
}
