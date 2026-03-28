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
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        Sales Roadmap &amp; Action Plan
      </h1>
      <p className="text-on-surface-variant mb-10">
        Technical execution path for distribution scaling and portfolio expansion.
        Organized by urgency — what needs to happen this week, this month, and
        this quarter.
      </p>

      <div className="space-y-8">
        {/* Go-to-Market Header */}
        <div className="bg-surface-container p-8 rounded-xl">
          <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
            Go-to-Market
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
            Sales Roadmap &amp; Action Plan
          </h2>
          <p className="text-on-surface-variant max-w-2xl">
            The playbook for turning this analysis into closed deals. Organized
            by urgency — what needs to happen this week, this month, and this
            quarter.
          </p>
        </div>

        {/* Phased Roadmap Sections */}
        {phases.map((phase, phaseIdx) => (
          <div
            key={phaseIdx}
            className="bg-surface-container-high rounded-xl overflow-hidden"
          >
            <div className="px-8 py-5 flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ background: phase.color, color: phase.color }}
              />
              <h3 className="text-on-surface font-bold text-lg uppercase tracking-tight">
                {phase.name}
              </h3>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {phase.items.map((item, i) => (
                <div
                  key={i}
                  className="px-8 py-5 flex items-start gap-4 hover:bg-surface-container transition-colors"
                >
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5 uppercase tracking-[0.15em] ${
                      item.priority === "Critical"
                        ? "bg-neon-pink/20 text-neon-pink"
                        : item.priority === "High"
                          ? "bg-neon-cyan/20 text-neon-cyan"
                          : item.priority === "Medium"
                            ? "bg-neon-violet/20 text-neon-violet"
                            : item.priority === "Target"
                              ? "bg-neon-cyan/20 text-neon-cyan"
                              : "bg-neon-violet-dim/20 text-neon-violet"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface text-sm font-bold">
                      {item.action}
                    </p>
                    <p className="text-on-surface-variant text-xs mt-1">
                      {item.notes}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-on-surface-variant text-xs">
                      {item.owner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* The Ask to Corner Bar */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-on-surface font-bold text-xl uppercase tracking-tight mb-6">
            The Ask to Corner Bar Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-high rounded-xl p-6">
              <p className="text-neon-pink font-bold text-sm mb-3 uppercase tracking-[0.15em] text-[10px]">
                1. Data We Need
              </p>
              <ul className="space-y-2 text-on-surface-variant text-sm">
                <li>
                  &#8226; Actual depletion reports (all venues, 12 months)
                </li>
                <li>&#8226; Current brand deals and terms</li>
                <li>&#8226; Social media metrics across all accounts</li>
                <li>&#8226; Block Party actual attendance data (2025)</li>
              </ul>
            </div>
            <div className="bg-surface-container-high rounded-xl p-6">
              <p className="text-neon-cyan font-bold text-sm mb-3 uppercase tracking-[0.15em] text-[10px]">
                2. Decisions Needed
              </p>
              <ul className="space-y-2 text-on-surface-variant text-sm">
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
            <div className="bg-surface-container-high rounded-xl p-6">
              <p className="text-neon-violet font-bold text-sm mb-3 uppercase tracking-[0.15em] text-[10px]">
                3. What We Deliver
              </p>
              <ul className="space-y-2 text-on-surface-variant text-sm">
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
