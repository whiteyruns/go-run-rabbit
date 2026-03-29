"use client";

import { useState, useEffect, useCallback } from "react";

interface DealPoint {
  type: string;
  venues: string[];
  status: string;
}

interface Deal {
  id: string;
  brandName: string;
  category: string;
  status: string;
  dealPoints: string | null;
}

const VENUES = [
  { id: "commonwealth", name: "Commonwealth", short: "CW" },
  { id: "laundry-room", name: "Laundry Room", short: "LR" },
  { id: "we-all-scream", name: "We All Scream", short: "WAS" },
  { id: "discopussy", name: "Discopussy", short: "DP" },
  { id: "lucky-day", name: "Lucky Day", short: "LD" },
  { id: "park-on-fremont", name: "Park On Fremont", short: "POF" },
  { id: "cheapshot", name: "Cheapshot", short: "CS" },
  { id: "la-mona-rosa", name: "La Mona Rosa", short: "LMR" },
  { id: "doberman", name: "Doberman", short: "DOB" },
];

const DEAL_POINT_TYPES = [
  "House / Well Pour",
  "Back Bar Placement",
  "Featured Cocktail / Menu Inclusion",
  "Tap Handle / Draft Line",
  "LED / Digital Signage",
  "Event Activation / Sampling",
  "Social Media / Content",
  "VIP Area Branding",
  "Glassware / Branded Serveware",
  "Staff Training / Brand Ambassador",
  "Category Exclusivity",
];

const SPIRIT_CATEGORIES = [
  "All", "Tequila / Mezcal", "Vodka", "Whiskey / Bourbon", "Rum",
  "Beer / Hard Seltzer", "Energy Drinks", "Non-Alcoholic / Lifestyle", "Tech / POS / Payments",
];

interface CellData {
  brand: string;
  dealId: string;
  status: string;
  dealStatus: string;
  category: string;
}

export default function InventoryPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchDeals = useCallback(async () => {
    const res = await fetch("/api/pipeline");
    const data = await res.json();
    setDeals(data.deals || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  // Build the grid: map of "dealPointType:venueId" → CellData
  const grid = new Map<string, CellData>();
  let totalActive = 0;
  let totalAvailable = 0;

  for (const deal of deals) {
    if (deal.status === "lost") continue;
    if (filterCategory !== "All" && deal.category !== filterCategory) continue;

    let points: DealPoint[] = [];
    try { points = deal.dealPoints ? JSON.parse(deal.dealPoints) : []; } catch { /* ignore */ }

    for (const dp of points) {
      for (const venueId of dp.venues) {
        const key = `${dp.type}:${venueId}`;
        // Active/confirmed deals take priority over offered/negotiating
        const existing = grid.get(key);
        if (!existing || (dp.status === "active" || dp.status === "confirmed")) {
          grid.set(key, {
            brand: deal.brandName,
            dealId: deal.id,
            status: dp.status,
            dealStatus: deal.status,
            category: deal.category,
          });
        }
      }
    }
  }

  // Count
  for (const dpType of DEAL_POINT_TYPES) {
    for (const venue of VENUES) {
      const cell = grid.get(`${dpType}:${venue.id}`);
      if (cell && (cell.status === "active" || cell.status === "confirmed")) totalActive++;
      else totalAvailable++;
    }
  }

  const totalSlots = DEAL_POINT_TYPES.length * VENUES.length;
  const fillRate = totalSlots > 0 ? ((totalActive / totalSlots) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">INVENTORY</h1>
          <p className="text-on-surface-variant">Deal point availability across the venue portfolio</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-high rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-extrabold font-mono text-neon-cyan">{totalActive}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Sold</p>
          </div>
          <div className="bg-surface-container-high rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-extrabold font-mono text-on-surface">{totalAvailable}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Available</p>
          </div>
          <div className="bg-surface-container-high rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-extrabold font-mono text-neon-violet">{fillRate}%</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Fill Rate</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {SPIRIT_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
              filterCategory === cat ? "bg-neon-violet/15 text-neon-violet" : "text-on-surface-variant hover:text-on-surface"
            }`}>
            {cat === "All" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-surface-container-high rounded-xl p-12 text-center text-on-surface-variant">Loading...</div>
      ) : (
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] sticky left-0 bg-surface-container-highest z-10 min-w-[200px]">
                    Deal Point
                  </th>
                  {VENUES.map(v => (
                    <th key={v.id} className="py-3 px-2 text-center min-w-[90px]">
                      <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.1em]">{v.short}</p>
                      <p className="text-[8px] text-on-surface-variant/50">{v.name.split(" ")[0]}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEAL_POINT_TYPES.map(dpType => (
                  <tr key={dpType} className="border-t border-outline-variant/5 hover:bg-surface-container transition-colors">
                    <td className="py-3 px-4 text-on-surface text-xs font-medium sticky left-0 bg-surface-container-low z-10">
                      {dpType}
                    </td>
                    {VENUES.map(venue => {
                      const cell = grid.get(`${dpType}:${venue.id}`);
                      if (!cell) {
                        return (
                          <td key={venue.id} className="py-3 px-2 text-center">
                            <span className="text-on-surface-variant/20 text-xs">&mdash;</span>
                          </td>
                        );
                      }
                      const isActive = cell.status === "active" || cell.status === "confirmed";
                      const isPending = cell.status === "offered" || cell.status === "negotiating";
                      return (
                        <td key={venue.id} className="py-3 px-2 text-center">
                          <a href={`/recap/${cell.dealId}`} target="_blank" rel="noopener noreferrer"
                            className={`inline-block text-[8px] font-bold uppercase tracking-[0.05em] px-2 py-1 rounded-full transition-all hover:opacity-80 max-w-[80px] truncate ${
                              isActive
                                ? "bg-neon-cyan/15 text-neon-cyan"
                                : isPending
                                  ? "bg-neon-violet/10 text-neon-violet"
                                  : "bg-surface-container text-on-surface-variant/50"
                            }`}
                            title={`${cell.brand} — ${cell.status}`}>
                            {cell.brand.length > 10 ? cell.brand.slice(0, 9) + "…" : cell.brand}
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 flex items-center gap-6 bg-surface-container">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-cyan/15 border border-neon-cyan/30" />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Active / Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-violet/10 border border-neon-violet/30" />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Offered / Negotiating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant/20 text-xs">&mdash;</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Available</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
