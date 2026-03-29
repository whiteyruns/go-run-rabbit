"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Summary", icon: "&#9632;" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/pos-data", label: "POS Data", icon: "&#9638;" },
      { href: "/dashboard/depletions", label: "Depletions", icon: "&#9660;" },
      { href: "/dashboard/calendar", label: "Vegas Calendar", icon: "&#9733;" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/dashboard/venues", label: "Venues", icon: "&#9635;" },
      { href: "/dashboard/categories", label: "Categories", icon: "&#9637;" },
      { href: "/dashboard/journey", label: "Guest Journey", icon: "&#10132;" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/dashboard/block-party", label: "Feed the Block", icon: "&#9835;" },
      { href: "/dashboard/projections", label: "Projections", icon: "&#9650;" },
      { href: "/dashboard/roadmap", label: "Action Plan", icon: "&#9654;" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/pipeline", label: "Pipeline", icon: "&#9679;" },
      { href: "/dashboard/inventory", label: "Inventory", icon: "&#9638;" },
      { href: "/dashboard/pitch-links", label: "Pitch Links", icon: "&#9741;" },
    ],
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-surface-container-lowest z-40 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5">
          <Link href="/" className="text-sm font-black tracking-tighter text-on-surface hover:opacity-80 transition-opacity">
            CBM Dashboards
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Live</span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 px-2 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? "bg-neon-violet/10 text-neon-violet"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span
                        className={`text-xs ${active ? "text-neon-violet" : "text-on-surface-variant/40"}`}
                        dangerouslySetInnerHTML={{ __html: item.icon }}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/30">
            Go Run Rabbit
          </p>
        </div>
      </aside>

      {/* Top bar (minimal — just page context) */}
      <header className="fixed top-0 left-56 right-0 z-30 bg-surface/80 backdrop-blur-xl h-12 flex items-center px-8">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          <span>Corner Bar Management</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface">
            {navGroups.flatMap(g => g.items).find(i => i.href === pathname)?.label || "Dashboard"}
          </span>
        </div>
      </header>
    </>
  );
}
