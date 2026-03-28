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
      className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all ${
        isSelected
          ? "border-amber-500 ring-1 ring-amber-500/30"
          : "border-gray-800 hover:border-gray-700"
      }`}
      onClick={() => onClick(cat.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.icon}</span>
          <h4 className="text-white font-semibold text-sm">{cat.name}</h4>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: STATUS_COLORS[cat.status] + "20",
            color: STATUS_COLORS[cat.status],
          }}
        >
          {cat.status.replace("-", " ")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-gray-500 text-xs">Current</p>
          <p className="text-green-400 font-mono font-bold text-sm">
            {fmt(cat.currentRevenue)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Projected</p>
          <p className="text-amber-400 font-mono font-bold text-sm">
            {fmt(cat.projectedRevenue)}
          </p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Opportunity Score</span>
          <span className="text-white font-mono">
            {cat.opportunityScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
            style={{ width: `${cat.opportunityScore}%` }}
          />
        </div>
      </div>
      <p className="text-gray-500 text-xs">
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="bg-gray-900 border border-amber-800/40 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCatData.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {selectedCatData.name}
                  </h3>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
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
                className="text-gray-500 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>
            <p className="text-gray-400 mb-4">{selectedCatData.notes}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Current Revenue</p>
                <p className="text-green-400 font-mono font-bold text-lg">
                  {fmt(selectedCatData.currentRevenue)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Projected Revenue</p>
                <p className="text-amber-400 font-mono font-bold text-lg">
                  {fmt(selectedCatData.projectedRevenue)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Growth Potential</p>
                <p className="text-white font-mono font-bold text-lg">
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
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                Top Opportunities
              </p>
              <div className="space-y-2">
                {selectedCatData.topOpportunities.map((opp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-amber-500">&#9679;</span>
                    <span className="text-gray-300">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">
            Opportunity Score by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
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
