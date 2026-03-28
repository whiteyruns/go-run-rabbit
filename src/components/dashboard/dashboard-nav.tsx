"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Summary" },
  { href: "/dashboard/pos-data", label: "POS Data" },
  { href: "/dashboard/depletions", label: "Depletions" },
  { href: "/dashboard/journey", label: "Guest" },
  { href: "/dashboard/calendar", label: "Vegas" },
  { href: "/dashboard/venues", label: "Portfolio" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/block-party", label: "Feed the Block" },
  { href: "/dashboard/projections", label: "Projections" },
  { href: "/dashboard/roadmap", label: "Action Plan" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface-container-lowest/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-black tracking-tighter text-on-surface hover:opacity-80 transition-opacity">
            CBM Dashboards
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-bold rounded-md transition-all ${
                  pathname === tab.href
                    ? "text-neon-violet border-b-2 border-neon-violet"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
