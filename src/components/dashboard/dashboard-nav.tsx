"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Executive Summary" },
  { href: "/dashboard/pos-data", label: "POS Data" },
  { href: "/dashboard/depletions", label: "Case Depletions" },
  { href: "/dashboard/journey", label: "Guest Journey" },
  { href: "/dashboard/calendar", label: "Vegas Calendar" },
  { href: "/dashboard/venues", label: "Venue Portfolio" },
  { href: "/dashboard/categories", label: "Sponsorship Categories" },
  { href: "/dashboard/block-party", label: "Feed the Block" },
  { href: "/dashboard/projections", label: "Revenue Projections" },
  { href: "/dashboard/roadmap", label: "Action Plan" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-1">Corner Bar Management</p>
            <h1 className="text-3xl font-bold text-white">Sponsorship Opportunity Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">9 Venues &middot; 2,532 Combined Capacity &middot; 40,900 Sq Ft &middot; Feed the Block 2026 Series</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Go Run Rabbit" style={{ height: "36px" }} />
            </Link>
            <p className="text-gray-500 text-xs">Prepared by <span className="text-white font-semibold">Go Run Rabbit</span></p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === tab.href
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
