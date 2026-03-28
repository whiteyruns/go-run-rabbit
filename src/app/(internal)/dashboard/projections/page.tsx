"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MetricCard } from "@/components/ui/metric-card";
import { sponsorshipCategories } from "@/data/categories";
import { fmt } from "@/lib/utils";

export default function ProjectionsPage() {
  const totalProjectedRevenue = sponsorshipCategories.reduce(
    (sum, c) => sum + c.projectedRevenue,
    0
  );

  const monthlyProjection = [
    { month: "Apr", revenue: 22000, cumulative: 22000 },
    { month: "May", revenue: 45000, cumulative: 67000 },
    { month: "Jun", revenue: 68000, cumulative: 135000 },
    { month: "Jul", revenue: 95000, cumulative: 230000 },
    { month: "Aug", revenue: 120000, cumulative: 350000 },
    { month: "Sep", revenue: 155000, cumulative: 505000 },
    { month: "Oct", revenue: 190000, cumulative: 695000 },
    { month: "Nov", revenue: 220000, cumulative: 915000 },
    { month: "Dec", revenue: 260000, cumulative: 1175000 },
    { month: "Jan '27", revenue: 280000, cumulative: 1455000 },
    { month: "Feb", revenue: 300000, cumulative: 1755000 },
    { month: "Mar", revenue: 315000, cumulative: 2070000 },
  ];

  const priorityActions = [
    {
      priority: "P0",
      action: "Sell Block Party Presenting Sponsor",
      value: "$500K",
      timeline: "Before Apr 2 kickoff",
      category: "Events",
    },
    {
      priority: "P0",
      action: "Beer portfolio-wide draft line deal",
      value: "$85-150K",
      timeline: "Q2 2026",
      category: "Beer",
    },
    {
      priority: "P1",
      action: "Energy drink nightclub partnership (Discopussy + WAS)",
      value: "$90-130K",
      timeline: "Q2 2026",
      category: "Energy",
    },
    {
      priority: "P1",
      action: "Tequila cross-venue trail activation",
      value: "$75-100K",
      timeline: "Q2-Q3 2026",
      category: "Tequila",
    },
    {
      priority: "P1",
      action: "Whiskey exclusive at Doberman Drawing Room",
      value: "$90K",
      timeline: "Q2 2026",
      category: "Whiskey",
    },
    {
      priority: "P2",
      action: "Tech/POS portfolio-wide system deal",
      value: "$80K",
      timeline: "Q3 2026",
      category: "Tech",
    },
    {
      priority: "P2",
      action: "Non-alc program at Peyote + Block Party",
      value: "$40-70K",
      timeline: "Q3 2026",
      category: "Lifestyle",
    },
    {
      priority: "P2",
      action: "Rum activation program (patio venues)",
      value: "$50-55K",
      timeline: "Q3-Q4 2026",
      category: "Rum",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Target MetricCards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Year 1 Target"
            value="$2.1M"
            sub="Venues + Events combined"
            accent
          />
          <MetricCard
            label="Venue Sponsorships"
            value={fmt(totalProjectedRevenue)}
            sub="Fully sold portfolio"
          />
          <MetricCard
            label="Block Party Revenue"
            value="$1.46M"
            sub="Fully sold tiers"
            accent
          />
          <MetricCard
            label="Combined Potential"
            value={fmt(totalProjectedRevenue + 1460000)}
            sub="Total addressable"
          />
        </div>

        {/* 12-Month Revenue Ramp */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-1">
            12-Month Revenue Ramp (Venue Sponsorships)
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Conservative ramp assuming staged category rollout and sales cycle
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={monthlyProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => fmt(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                formatter={(v) => fmt(Number(v))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                name="Monthly Revenue"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#C49A6C"
                strokeWidth={2}
                name="Cumulative Revenue"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Scenarios Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">
            Revenue Scenarios
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">
                  Scenario
                </th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">
                  Venue Sponsorship
                </th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">
                  Block Party
                </th>
                <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase">
                  Total Annual
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">
                  Conservative (30% fill)
                </td>
                <td className="py-3 px-4 text-white font-mono">
                  {fmt(totalProjectedRevenue * 0.3)}
                </td>
                <td className="py-3 px-4 text-white font-mono">$438K</td>
                <td className="py-3 px-4 text-white font-mono font-bold">
                  {fmt(totalProjectedRevenue * 0.3 + 438000)}
                </td>
              </tr>
              <tr className="border-b border-gray-800 bg-amber-950/10">
                <td className="py-3 px-4 text-amber-400 font-semibold">
                  Moderate (50% fill)
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono">
                  {fmt(totalProjectedRevenue * 0.5)}
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono">$730K</td>
                <td className="py-3 px-4 text-amber-400 font-mono font-bold">
                  {fmt(totalProjectedRevenue * 0.5 + 730000)}
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">
                  Aggressive (75% fill)
                </td>
                <td className="py-3 px-4 text-white font-mono">
                  {fmt(totalProjectedRevenue * 0.75)}
                </td>
                <td className="py-3 px-4 text-white font-mono">$1.1M</td>
                <td className="py-3 px-4 text-white font-mono font-bold">
                  {fmt(totalProjectedRevenue * 0.75 + 1100000)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-green-400 font-semibold">
                  Full Potential (100%)
                </td>
                <td className="py-3 px-4 text-green-400 font-mono">
                  {fmt(totalProjectedRevenue)}
                </td>
                <td className="py-3 px-4 text-green-400 font-mono">$1.46M</td>
                <td className="py-3 px-4 text-green-400 font-mono font-bold">
                  {fmt(totalProjectedRevenue + 1460000)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recommended Priority Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">
            Recommended Priority Actions
          </h3>
          <div className="space-y-3">
            {priorityActions.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-4"
              >
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    item.priority === "P0"
                      ? "bg-red-900/40 text-red-400"
                      : item.priority === "P1"
                        ? "bg-amber-900/40 text-amber-400"
                        : "bg-blue-900/40 text-blue-400"
                  }`}
                >
                  {item.priority}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {item.action}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.category} &middot; {item.timeline}
                  </p>
                </div>
                <p className="text-amber-400 font-mono font-bold text-sm">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
