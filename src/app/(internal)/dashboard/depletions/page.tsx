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
import {
  computeDepletions,
  blockPartyDepletions,
  HOUSE_POUR_MULTIPLIER,
  aggregatePortfolio,
} from "@/lib/depletion-engine";
import { fmt, fmtNum } from "@/lib/utils";

export default function DepletionsPage() {
  const allDepletions = venues.map(computeDepletions).filter(Boolean) as NonNullable<ReturnType<typeof computeDepletions>>[];

  const portfolioDepletions = aggregatePortfolio(allDepletions);

  const grandTotalCases =
    portfolioDepletions.totalCases +
    blockPartyDepletions.annual.spiritCases +
    blockPartyDepletions.annual.beerCases +
    blockPartyDepletions.annual.otherCases;

  const spiritCategories = [
    { label: "Tequila / Mezcal", cases: portfolioDepletions.tequila, color: "#22c55e", projected: Math.round(portfolioDepletions.tequila * HOUSE_POUR_MULTIPLIER) },
    { label: "Vodka", cases: portfolioDepletions.vodka, color: "#3b82f6", projected: Math.round(portfolioDepletions.vodka * HOUSE_POUR_MULTIPLIER) },
    { label: "Whiskey / Bourbon", cases: portfolioDepletions.whiskey, color: "#eab308", projected: Math.round(portfolioDepletions.whiskey * HOUSE_POUR_MULTIPLIER) },
    { label: "Rum", cases: portfolioDepletions.rum, color: "#ef4444", projected: Math.round(portfolioDepletions.rum * HOUSE_POUR_MULTIPLIER) },
    { label: "Other Spirits", cases: portfolioDepletions.otherSpirits, color: "#8b5cf6", projected: Math.round(portfolioDepletions.otherSpirits * HOUSE_POUR_MULTIPLIER) },
  ];

  const spiritChartData = [
    { name: "Tequila", current: portfolioDepletions.tequila, projected: Math.round(portfolioDepletions.tequila * HOUSE_POUR_MULTIPLIER) - portfolioDepletions.tequila },
    { name: "Vodka", current: portfolioDepletions.vodka, projected: Math.round(portfolioDepletions.vodka * HOUSE_POUR_MULTIPLIER) - portfolioDepletions.vodka },
    { name: "Whiskey", current: portfolioDepletions.whiskey, projected: Math.round(portfolioDepletions.whiskey * HOUSE_POUR_MULTIPLIER) - portfolioDepletions.whiskey },
    { name: "Rum", current: portfolioDepletions.rum, projected: Math.round(portfolioDepletions.rum * HOUSE_POUR_MULTIPLIER) - portfolioDepletions.rum },
    { name: "Other", current: portfolioDepletions.otherSpirits, projected: Math.round(portfolioDepletions.otherSpirits * HOUSE_POUR_MULTIPLIER) - portfolioDepletions.otherSpirits },
  ];

  const brandPitches = [
    { brand: "Tequila Brand (e.g., Casamigos, Clase Azul, Don Julio)", current: portfolioDepletions.tequila, withDeal: Math.round(portfolioDepletions.tequila * HOUSE_POUR_MULTIPLIER), blockParty: Math.round(blockPartyDepletions.annual.spiritCases * 0.25), avgCaseValue: 180, color: "#22c55e" },
    { brand: "Vodka Brand (e.g., Tito's, Absolut, Grey Goose)", current: portfolioDepletions.vodka, withDeal: Math.round(portfolioDepletions.vodka * HOUSE_POUR_MULTIPLIER), blockParty: Math.round(blockPartyDepletions.annual.spiritCases * 0.30), avgCaseValue: 150, color: "#3b82f6" },
    { brand: "Whiskey Brand (e.g., Macallan, Jack Daniel's, Maker's Mark)", current: portfolioDepletions.whiskey, withDeal: Math.round(portfolioDepletions.whiskey * HOUSE_POUR_MULTIPLIER), blockParty: Math.round(blockPartyDepletions.annual.spiritCases * 0.15), avgCaseValue: 200, color: "#eab308" },
    { brand: "Beer Brand (e.g., Modelo, Heineken, Pacifico)", current: portfolioDepletions.beerCases, withDeal: Math.round(portfolioDepletions.beerCases * 1.6), blockParty: blockPartyDepletions.annual.beerCases, avgCaseValue: 28, color: "#C49A6C" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Methodology info box */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-lg">&#9432;</span>
            <div>
              <h4 className="text-blue-400 font-bold text-sm mb-1">Estimation Methodology</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Case depletions estimated from weekly foot traffic &times; avg drinks per guest &times; category mix by venue type.
                Standard assumptions: 750ml bottle = 17 pours (1.5oz), spirit case = 12 bottles (204 pours), beer case = 24 servings.
                Projected depletions assume a <span className="text-amber-400 font-bold">2.2x house pour multiplier</span> — the typical lift when a brand secures house/featured pour status via sponsorship.
                <span className="text-amber-400"> These are estimates pending actual depletion data from Corner Bar.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Depletion metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Total Cases (Venues)" value={fmtNum(portfolioDepletions.totalCases)} sub="Annual est. across 9 venues" accent />
          <MetricCard label="Spirit Cases" value={fmtNum(portfolioDepletions.totalSpiritCases)} sub="All spirit categories" />
          <MetricCard label="Beer Cases" value={fmtNum(portfolioDepletions.beerCases)} sub="Draft + packaged" />
          <MetricCard label="Block Party Cases" value={fmtNum(blockPartyDepletions.annual.spiritCases + blockPartyDepletions.annual.beerCases + blockPartyDepletions.annual.otherCases)} sub="10 events combined" />
          <MetricCard label="Grand Total" value={fmtNum(grandTotalCases)} sub="Venues + Block Party" accent />
        </div>

        {/* Spirit category breakdown with house pour multiplier */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">Annual Spirit Case Depletions by Category</h3>
          <p className="text-gray-500 text-sm mb-6">Venue portfolio only (Block Party adds {fmtNum(blockPartyDepletions.annual.spiritCases)} additional spirit cases)</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {spiritCategories.map((cat) => (
              <div key={cat.label} className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">{cat.label}</p>
                <p className="font-mono font-bold text-xl" style={{ color: cat.color }}>{fmtNum(cat.cases)}</p>
                <p className="text-gray-600 text-xs">cases/yr</p>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-gray-500 text-xs">w/ House Pour</p>
                  <p className="text-amber-400 font-mono font-bold text-sm">{fmtNum(cat.projected)}</p>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={spiritChartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="current" stackId="a" fill="#22c55e" name="Est. Current Cases" />
              <Bar dataKey="projected" stackId="a" fill="#C49A6C" name="House Pour Lift (+2.2x)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Venue depletion table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-white font-bold text-lg">Venue Case Depletion Breakdown</h3>
            <p className="text-gray-500 text-sm">Annual estimated cases by venue and spirit category</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Venue</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider text-right">Drinks/Wk</th>
                  <th className="py-3 px-4 text-xs text-green-400 font-semibold uppercase tracking-wider text-right">Tequila</th>
                  <th className="py-3 px-4 text-xs text-blue-400 font-semibold uppercase tracking-wider text-right">Vodka</th>
                  <th className="py-3 px-4 text-xs text-yellow-400 font-semibold uppercase tracking-wider text-right">Whiskey</th>
                  <th className="py-3 px-4 text-xs text-red-400 font-semibold uppercase tracking-wider text-right">Rum</th>
                  <th className="py-3 px-4 text-xs text-amber-400 font-semibold uppercase tracking-wider text-right">Beer</th>
                  <th className="py-3 px-4 text-xs text-white font-semibold uppercase tracking-wider text-right">Total Cases</th>
                </tr>
              </thead>
              <tbody>
                {allDepletions.map((d) => (
                  <tr key={d.venueId} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4"><p className="text-white font-medium text-sm">{d.venueName}</p></td>
                    <td className="py-3 px-4 text-gray-300 text-sm font-mono text-right">{fmtNum(d.weeklyDrinks)}</td>
                    <td className="py-3 px-4 text-green-400 text-sm font-mono text-right">{fmtNum(d.spiritCases.tequila || 0)}</td>
                    <td className="py-3 px-4 text-blue-400 text-sm font-mono text-right">{fmtNum(d.spiritCases.vodka || 0)}</td>
                    <td className="py-3 px-4 text-yellow-400 text-sm font-mono text-right">{fmtNum(d.spiritCases.whiskey || 0)}</td>
                    <td className="py-3 px-4 text-red-400 text-sm font-mono text-right">{fmtNum(d.spiritCases.rum || 0)}</td>
                    <td className="py-3 px-4 text-amber-400 text-sm font-mono text-right">{fmtNum(d.beerCases)}</td>
                    <td className="py-3 px-4 text-white text-sm font-mono font-bold text-right">{fmtNum(d.totalCases)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-800/40 bg-gray-800/30">
                  <td className="py-3 px-4 text-amber-400 font-bold text-sm">VENUE TOTAL</td>
                  <td className="py-3 px-4 text-white font-mono font-bold text-sm text-right">{fmtNum(allDepletions.reduce((s, d) => s + d.weeklyDrinks, 0))}</td>
                  <td className="py-3 px-4 text-green-400 font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.tequila)}</td>
                  <td className="py-3 px-4 text-blue-400 font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.vodka)}</td>
                  <td className="py-3 px-4 text-yellow-400 font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.whiskey)}</td>
                  <td className="py-3 px-4 text-red-400 font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.rum)}</td>
                  <td className="py-3 px-4 text-amber-400 font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.beerCases)}</td>
                  <td className="py-3 px-4 text-white font-mono font-bold text-sm text-right">{fmtNum(portfolioDepletions.totalCases)}</td>
                </tr>
                <tr className="bg-amber-950/20">
                  <td className="py-3 px-4 text-amber-300 font-bold text-sm">+ BLOCK PARTY (10 events)</td>
                  <td className="py-3 px-4 text-amber-300 font-mono text-sm text-right">{fmtNum(Math.round(blockPartyDepletions.annual.totalDrinks / 52))}/event avg</td>
                  <td colSpan={4} className="py-3 px-4 text-amber-300 font-mono text-sm text-center">{fmtNum(blockPartyDepletions.annual.spiritCases)} spirit cases</td>
                  <td className="py-3 px-4 text-amber-300 font-mono text-sm text-right">{fmtNum(blockPartyDepletions.annual.beerCases)}</td>
                  <td className="py-3 px-4 text-amber-300 font-mono font-bold text-sm text-right">{fmtNum(blockPartyDepletions.annual.spiritCases + blockPartyDepletions.annual.beerCases + blockPartyDepletions.annual.otherCases)}</td>
                </tr>
                <tr className="bg-amber-950/40">
                  <td className="py-3 px-4 text-white font-bold">GRAND TOTAL</td>
                  <td className="py-3 px-4"></td>
                  <td colSpan={5} className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-amber-400 font-mono font-bold text-lg text-right">{fmtNum(grandTotalCases)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Brand pitch translation cards */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">What This Means for a Brand</h3>
          <p className="text-gray-500 text-sm mb-6">How to translate depletions into a sponsorship pitch by category</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brandPitches.map((pitch) => {
              const totalWithDeal = pitch.withDeal + pitch.blockParty;
              const grossRevToDistributor = totalWithDeal * pitch.avgCaseValue;
              return (
                <div key={pitch.brand} className="bg-gray-800 rounded-lg p-5">
                  <h4 className="font-bold text-sm mb-3" style={{ color: pitch.color }}>{pitch.brand}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Est. current depletions</span><span className="text-white font-mono">{fmtNum(pitch.current)} cases/yr</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">With house pour deal</span><span className="text-amber-400 font-mono font-bold">{fmtNum(pitch.withDeal)} cases/yr</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">+ Block Party events</span><span className="text-amber-300 font-mono">+{fmtNum(pitch.blockParty)} cases</span></div>
                    <div className="flex justify-between border-t border-gray-700 pt-2 mt-2"><span className="text-white font-bold">Total w/ sponsorship</span><span className="font-mono font-bold" style={{ color: pitch.color }}>{fmtNum(totalWithDeal)} cases</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 text-xs">Gross rev to distributor (@ {fmt(pitch.avgCaseValue)}/case)</span><span className="text-green-400 font-mono text-xs font-bold">{fmt(grossRevToDistributor)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why depletions matter */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
          <h3 className="text-amber-400 font-bold text-lg mb-3">Why Depletions Sell Sponsorships</h3>
          <p className="text-gray-300 leading-relaxed">
            Brands don{"'"}t buy signage — they buy <span className="text-amber-400 font-bold">case movement</span>. When a Diageo or Bacardi regional manager evaluates a sponsorship, the first question is always
            {" \""}how many cases will this move?{"\""} CBM{"'"}s portfolio of 9 venues + Block Party creates an estimated <span className="text-amber-400 font-bold">{fmtNum(grandTotalCases)} total cases annually</span>.
            With house pour agreements in place, spirit depletions alone could exceed <span className="text-amber-400 font-bold">{fmtNum(Math.round(portfolioDepletions.totalSpiritCases * HOUSE_POUR_MULTIPLIER))} cases</span> —
            that{"'"}s a number that gets a brand{"'"}s national accounts team on a plane to Las Vegas.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            For context: a single-venue house pour deal in Vegas typically moves 200-500 spirit cases/yr. CBM can offer a <span className="text-white font-bold">portfolio-wide house pour</span> that
            delivers multiples of that — a unique value prop no individual venue can match.
          </p>
        </div>
      </div>
    </div>
  );
}
