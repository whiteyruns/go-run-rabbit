"use client";

import { salesRoadmap } from "@/data/sales-roadmap";

export default function RoadmapPage() {
  const phases = [
    salesRoadmap.phase1,
    salesRoadmap.phase2,
    salesRoadmap.phase3,
    salesRoadmap.phase4,
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Go-to-Market Header */}
        <div className="bg-gradient-to-br from-green-950/40 to-gray-900 border border-green-800/40 rounded-xl p-8">
          <p className="text-green-400 text-xs font-bold tracking-widest uppercase mb-2">
            Go-to-Market
          </p>
          <h2 className="text-3xl font-bold text-white mb-3">
            Sales Roadmap &amp; Action Plan
          </h2>
          <p className="text-gray-400 max-w-2xl">
            The playbook for turning this analysis into closed deals. Organized
            by urgency — what needs to happen this week, this month, and this
            quarter.
          </p>
        </div>

        {/* Phased Roadmap Sections */}
        {phases.map((phase, phaseIdx) => (
          <div
            key={phaseIdx}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: phase.color }}
              />
              <h3 className="text-white font-bold text-lg">{phase.name}</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {phase.items.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5 ${
                      item.priority === "Critical"
                        ? "bg-red-900/40 text-red-400"
                        : item.priority === "High"
                          ? "bg-amber-900/40 text-amber-400"
                          : item.priority === "Medium"
                            ? "bg-blue-900/40 text-blue-400"
                            : item.priority === "Target"
                              ? "bg-green-900/40 text-green-400"
                              : "bg-purple-900/40 text-purple-400"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {item.action}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{item.notes}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-gray-400 text-xs">{item.owner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* The Ask to Corner Bar */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
          <h3 className="text-amber-400 font-bold text-lg mb-3">
            The Ask to Corner Bar Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-red-400 font-bold text-sm mb-2">
                1. Data We Need
              </p>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>
                  &#8226; Actual depletion reports (all venues, 12 months)
                </li>
                <li>&#8226; Current brand deals and terms</li>
                <li>&#8226; Social media metrics across all accounts</li>
                <li>&#8226; Block Party actual attendance data (2025)</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-amber-400 font-bold text-sm mb-2">
                2. Decisions Needed
              </p>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>
                  &#8226; Are they open to portfolio-wide exclusive deals?
                </li>
                <li>&#8226; Who owns sponsor relationships today?</li>
                <li>
                  &#8226; What&apos;s their appetite for a dedicated sponsor
                  sales effort?
                </li>
                <li>&#8226; Revenue share vs flat fee preference?</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-green-400 font-bold text-sm mb-2">
                3. What We Deliver
              </p>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>&#8226; This dashboard with real data plugged in</li>
                <li>&#8226; Brand-specific pitch decks</li>
                <li>&#8226; Sponsor outreach and closing</li>
                <li>&#8226; Ongoing measurement and optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
