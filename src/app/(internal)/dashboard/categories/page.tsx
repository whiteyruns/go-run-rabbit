"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { sponsorshipCategories } from "@/data/categories";
import { fmt, STATUS_COLORS } from "@/lib/utils";

interface CategoryCardProps {
  cat: (typeof sponsorshipCategories)[number];
  onClick: (id: string) => void;
  isSelected: boolean;
}

function CategoryCard({ cat, onClick, isSelected }: CategoryCardProps) {
  return (
    <div
      className={`bg-surface-container-high rounded-xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-surface-bright ${
        isSelected
          ? "ring-1 ring-neon-violet/40"
          : ""
      }`}
      onClick={() => onClick(cat.id)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-neon-violet/10 transition-all" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.icon}</span>
          <h4 className="text-on-surface font-bold text-sm">{cat.name}</h4>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.15em]"
          style={{
            background: STATUS_COLORS[cat.status] + "20",
            color: STATUS_COLORS[cat.status],
          }}
        >
          {cat.status.replace("-", " ")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
            Current
          </p>
          <p className="text-neon-cyan font-mono font-bold text-sm">
            {fmt(cat.currentRevenue)}
          </p>
        </div>
        <div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
            Projected
          </p>
          <p className="text-neon-violet font-mono font-bold text-sm">
            {fmt(cat.projectedRevenue)}
          </p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-1">
          <span>Opportunity Score</span>
          <span className="text-on-surface font-mono">
            {cat.opportunityScore}/100
          </span>
        </div>
        <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-neon-violet shadow-[0_0_12px_rgba(174,162,255,0.4)]"
            style={{ width: `${cat.opportunityScore}%` }}
          />
        </div>
      </div>
      <p className="text-on-surface-variant text-xs">
        {cat.venuesActive}/{cat.totalVenues} venues active
      </p>
    </div>
  );
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedCatData = sponsorshipCategories.find(
    (c) => c.id === selectedCategory
  );

  const chartData = sponsorshipCategories.map((c) => ({
    name: c.name.split(" /")[0].split(" (")[0],
    score: c.opportunityScore,
    fill: STATUS_COLORS[c.status],
  }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        Sponsorship Categories
      </h1>
      <p className="text-on-surface-variant mb-10">
        Analyzing active market gaps and opportunity scores across the CBM
        portfolio. Updated from POS depletions and engagement metrics.
      </p>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsorshipCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              onClick={setSelectedCategory}
              isSelected={selectedCategory === cat.id}
            />
          ))}
        </div>

        {selectedCatData && (
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCatData.icon}</span>
                <div>
                  <h3 className="text-on-surface font-bold text-xl">
                    {selectedCatData.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.15em]"
                    style={{
                      background:
                        STATUS_COLORS[selectedCatData.status] + "20",
                      color: STATUS_COLORS[selectedCatData.status],
                    }}
                  >
                    {selectedCatData.status.replace("-", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-on-surface-variant hover:text-on-surface text-xl"
              >
                &times;
              </button>
            </div>
            <p className="text-on-surface-variant mb-6">
              {selectedCatData.notes}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface-container rounded-lg p-4">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                  Current Revenue
                </p>
                <p className="text-neon-cyan font-mono font-bold text-lg">
                  {fmt(selectedCatData.currentRevenue)}
                </p>
              </div>
              <div className="bg-surface-container rounded-lg p-4">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                  Projected Revenue
                </p>
                <p className="text-neon-violet font-mono font-bold text-lg">
                  {fmt(selectedCatData.projectedRevenue)}
                </p>
              </div>
              <div className="bg-surface-container rounded-lg p-4">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                  Growth Potential
                </p>
                <p className="text-on-surface font-mono font-bold text-lg">
                  {selectedCatData.currentRevenue > 0
                    ? `${(
                        (selectedCatData.projectedRevenue /
                          selectedCatData.currentRevenue -
                          1) *
                        100
                      ).toFixed(0)}%`
                    : "New"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold mb-3">
                Top Opportunities
              </p>
              <div className="space-y-2">
                {selectedCatData.topOpportunities.map((opp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-neon-violet">&#9679;</span>
                    <span className="text-on-surface-variant">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface-container-low rounded-xl p-8">
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-2">
            Opportunity Score by Category
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Comparative analysis of category potential
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#acaaae", fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "#acaaae", fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f1f23",
                  border: "none",
                  borderRadius: "8px",
                }}
                formatter={(v) => fmt(Number(v))}
              />
              <Bar
                dataKey="score"
                name="Opportunity Score"
                radius={[4, 4, 0, 0]}
              >
                {sponsorshipCategories.map((c, i) => (
                  <Cell key={i} fill={STATUS_COLORS[c.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
