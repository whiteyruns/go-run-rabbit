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
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        Revenue Projections
      </h1>
      <p className="text-on-surface-variant mb-10">
        Growth progression, revenue scenarios, and tactical deployment priorities
        across the sponsorship portfolio.
      </p>

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
        <div className="bg-surface-container-low rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight">
                12-Month Revenue Ramp
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">
                Conservative ramp assuming staged category rollout and sales
                cycle
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_8px_#00eefc]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Monthly
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neon-violet shadow-[0_0_8px_#aea2ff]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Cumulative
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={monthlyProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#acaaae", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "#acaaae", fontSize: 11 }}
                tickFormatter={(v) => fmt(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f1f23",
                  border: "none",
                  borderRadius: "8px",
                }}
                formatter={(v) => fmt(Number(v))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00eefc"
                strokeWidth={2}
                name="Monthly Revenue"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#aea2ff"
                strokeWidth={2}
                name="Cumulative Revenue"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Scenarios Table */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-2">
              Revenue Scenarios
            </h3>
            <p className="text-on-surface-variant text-sm">
              Sensitivity analysis based on variable sponsorship uptake
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50 border-b border-outline-variant/15">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    Scenario
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    Venue Sponsorship
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    Block Party
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    Total Annual
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-outline-variant/5 hover:bg-surface-container transition-colors">
                  <td className="px-8 py-5 text-on-surface-variant">
                    Conservative (30% fill)
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono">
                    {fmt(totalProjectedRevenue * 0.3)}
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono">
                    $438K
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono font-bold">
                    {fmt(totalProjectedRevenue * 0.3 + 438000)}
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/5 hover:bg-surface-container transition-colors bg-neon-violet-dim/5">
                  <td className="px-8 py-5 text-neon-violet font-bold">
                    Moderate (50% fill)
                  </td>
                  <td className="px-8 py-5 text-neon-violet font-mono">
                    {fmt(totalProjectedRevenue * 0.5)}
                  </td>
                  <td className="px-8 py-5 text-neon-violet font-mono">
                    $730K
                  </td>
                  <td className="px-8 py-5 text-neon-violet font-mono font-bold">
                    {fmt(totalProjectedRevenue * 0.5 + 730000)}
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/5 hover:bg-surface-container transition-colors">
                  <td className="px-8 py-5 text-on-surface-variant">
                    Aggressive (75% fill)
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono">
                    {fmt(totalProjectedRevenue * 0.75)}
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono">
                    $1.1M
                  </td>
                  <td className="px-8 py-5 text-on-surface font-mono font-bold">
                    {fmt(totalProjectedRevenue * 0.75 + 1100000)}
                  </td>
                </tr>
                <tr className="hover:bg-surface-container transition-colors">
                  <td className="px-8 py-5 text-neon-cyan font-bold">
                    Full Potential (100%)
                  </td>
                  <td className="px-8 py-5 text-neon-cyan font-mono">
                    {fmt(totalProjectedRevenue)}
                  </td>
                  <td className="px-8 py-5 text-neon-cyan font-mono">
                    $1.46M
                  </td>
                  <td className="px-8 py-5 text-neon-cyan font-mono font-bold">
                    {fmt(totalProjectedRevenue + 1460000)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Priority Actions */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-6">
            Recommended Priority Actions
          </h3>
          <div className="space-y-3">
            {priorityActions.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-surface-container rounded-xl p-5 hover:bg-surface-container-low transition-colors"
              >
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-[0.15em] ${
                    item.priority === "P0"
                      ? "bg-neon-pink/20 text-neon-pink"
                      : item.priority === "P1"
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-neon-violet/20 text-neon-violet"
                  }`}
                >
                  {item.priority}
                </span>
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-bold">
                    {item.action}
                  </p>
                  <p className="text-on-surface-variant text-xs">
                    {item.category} &middot; {item.timeline}
                  </p>
                </div>
                <p className="text-neon-cyan font-mono font-bold text-sm">
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
