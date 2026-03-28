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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Current Sponsor Revenue" value={fmt(totalCurrentRevenue)} sub="Annual across portfolio" />
          <MetricCard label="Projected Potential" value={fmt(totalProjectedRevenue)} sub="Fully sold inventory" accent />
          <MetricCard label="Revenue Gap" value={fmt(gapRevenue)} sub="Unsold sponsorship value" />
          <MetricCard label="Capture Rate" value={`${((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%`} sub="Of total potential" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Venues" value={venues.length.toString()} sub="Fremont East + Arts District" />
          <MetricCard label="Annual Foot Traffic" value={`${(annualFootTraffic / 1000000).toFixed(1)}M+`} sub="Venue traffic only" />
          <MetricCard label="Block Party 2026" value="100K+" sub="Projected across 10 events" accent />
          <MetricCard label="Combined Reach" value={`${((annualFootTraffic + blockPartyProjected) / 1000000).toFixed(1)}M+`} sub="Venues + Events annually" />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-1">Revenue by Category: Current vs. Projected</h3>
          <p className="text-gray-500 text-sm mb-6">Red bars show the gap between current revenue and full potential</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={revenueByCategory} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
                formatter={(v) => fmt(Number(v))}
              />
              <Legend />
              <Bar dataKey="current" stackId="a" fill="#22c55e" name="Current Revenue" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gap" stackId="a" fill="#ef4444" name="Unsold Gap" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
          <h3 className="text-amber-400 font-bold text-lg mb-3">The Opportunity</h3>
          <p className="text-gray-300 leading-relaxed">
            Corner Bar Management controls 9 venues with a combined capacity of {fmtNum(totalCapacity)}+ across {fmtNum(totalSqFt)} sq ft, generating an estimated {(annualFootTraffic / 1000000).toFixed(1)}M+ annual foot traffic.
            Add in Feed the Block{"'"}s projected 100K+ attendees across 10 events in 2026, and the combined audience reach exceeds {((annualFootTraffic + blockPartyProjected) / 1000000).toFixed(1)}M annually.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            Feed the Block has already secured <span className="text-green-400 font-bold">$400K</span> in confirmed sponsorships from LVCVA and the City of Las Vegas — proving institutional buy-in.
            The entire beverage/liquor portfolio sponsorship picture is currently unknown and needs to be obtained from Corner Bar{"'"}s team.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            Based on estimates, CBM captures just <span className="text-red-400 font-bold">{fmt(totalCurrentRevenue)}</span> in annual sponsorship revenue — only <span className="text-red-400 font-bold">{((totalCurrentRevenue / totalProjectedRevenue) * 100).toFixed(1)}%</span> of
            the estimated <span className="text-amber-400 font-bold">{fmt(totalProjectedRevenue)}</span> addressable opportunity. Categories like rum, energy drinks, non-alcoholic beverages, and tech/POS have
            <span className="text-red-400 font-bold"> zero</span> sponsor presence. This dashboard maps the full inventory so CBM can sell it systematically.
          </p>
        </div>
      </div>
    </div>
  );
}
