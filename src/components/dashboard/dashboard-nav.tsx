"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
    label: "EFD",
    items: [
      { href: "/dashboard/efd-pipeline", label: "Lead Pipeline", icon: "&#9670;" },
      { href: "/dashboard/efd-outbound", label: "Outbound", icon: "&#9654;" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/pipeline", label: "Pipeline", icon: "&#9679;" },
      { href: "/dashboard/inventory", label: "Inventory", icon: "&#9638;" },
      { href: "/dashboard/recaps", label: "Recaps", icon: "&#9993;" },
      { href: "/dashboard/pitch-links", label: "Pitch Links", icon: "&#9741;" },
    ],
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentPage = navGroups.flatMap(g => g.items).find(i => i.href === pathname)?.label || "Dashboard";

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl h-12 flex items-center justify-between px-4">
        <button onClick={() => setOpen(!open)} className="text-on-surface p-1">
          <div className="space-y-1.5">
            <div className={`w-5 h-0.5 bg-on-surface transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`w-5 h-0.5 bg-on-surface transition-all ${open ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-on-surface transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">{currentPage}</span>
        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
      </div>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-56 bg-surface-container-lowest z-50 flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
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
                      onClick={() => setOpen(false)}
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

        <div className="px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/30">
            Go Run Rabbit
          </p>
        </div>
      </aside>

      {/* Desktop top bar */}
      <header className="hidden lg:flex fixed top-0 left-56 right-0 z-30 bg-surface/80 backdrop-blur-xl h-12 items-center px-8">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          <span>Corner Bar Management</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface">{currentPage}</span>
        </div>
      </header>
    </>
  );
}
