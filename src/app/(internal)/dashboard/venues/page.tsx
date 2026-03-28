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
  Legend,
} from "recharts";
import { venues } from "@/data/venues";
import { fmt, fmtNum } from "@/lib/utils";

export default function VenuesPage() {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const totalCapacity = venues.reduce((sum, v) => sum + v.capacity, 0);
  const totalSqFt = venues.reduce((sum, v) => sum + v.sqft, 0);
  const totalWeeklyTraffic = venues.reduce((sum, v) => sum + v.avgWeeklyFootTraffic, 0);
  const totalSponsorRevenue = venues.reduce((s, v) => s + v.sponsorRevenue, 0);
  const totalPotentialRevenue = venues.reduce((s, v) => s + v.potentialRevenue, 0);
  const totalGap = venues.reduce((s, v) => s + v.potentialRevenue - v.sponsorRevenue, 0);

  const selectedVenueData = venues.find((v) => v.id === selectedVenue);

  const venueRevenueData = venues
    .filter((v) => v.potentialRevenue > 0)
    .sort((a, b) => b.potentialRevenue - a.potentialRevenue)
    .map((v) => ({
      name: v.name.length > 14 ? v.name.slice(0, 12) + "..." : v.name,
      current: v.sponsorRevenue,
      potential: v.potentialRevenue,
      gap: v.potentialRevenue - v.sponsorRevenue,
    }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">VENUE PORTFOLIO</h1>
      <p className="text-on-surface-variant mb-10">Operational audit and revenue projections across the CBM network</p>

      <div className="space-y-10">
        {/* Venue table with utilization bars */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Venue</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Capacity</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Sq Ft</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Traffic</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Current Rev</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Potential</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Utilization</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Gap</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => {
                  const utilization = venue.sponsorRevenue / venue.potentialRevenue;
                  const gap = venue.potentialRevenue - venue.sponsorRevenue;
                  return (
                    <tr
                      key={venue.id}
                      className={`border-b border-outline-variant/15 cursor-pointer transition-colors ${selectedVenue === venue.id ? "bg-surface-container" : "hover:bg-surface-container"}`}
                      onClick={() => setSelectedVenue(venue.id)}
                    >
                      <td className="py-3 px-4">
                        <p className="text-neon-violet font-bold text-sm">{venue.name}</p>
                        <p className="text-on-surface-variant text-xs">{venue.zone}</p>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm font-mono">{fmtNum(venue.capacity)}</td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm font-mono">{fmtNum(venue.sqft)}</td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">{fmtNum(venue.avgWeeklyFootTraffic)}/wk</td>
                      <td className="py-3 px-4">
                        <p className="text-neon-cyan text-sm font-mono">{fmt(venue.sponsorRevenue)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-neon-violet text-sm font-mono">{fmt(venue.potentialRevenue)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${utilization > 0.5 ? "bg-[#00eefc]" : utilization > 0 ? "bg-[#aea2ff]" : "bg-[#ff6b98]"}`}
                            style={{ width: `${Math.max(utilization * 100, 3)}%` }}
                          />
                        </div>
                        <p className="text-on-surface-variant text-xs mt-1">{(utilization * 100).toFixed(0)}% filled</p>
                      </td>
                      <td className="py-3 px-4 text-neon-pink text-sm font-mono">{fmt(gap)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container">
                  <td className="py-3 px-4 text-neon-cyan font-bold text-sm">TOTAL</td>
                  <td className="py-3 px-4 text-on-surface font-mono font-bold text-sm">{fmtNum(totalCapacity)}</td>
                  <td className="py-3 px-4 text-on-surface font-mono font-bold text-sm">{fmtNum(totalSqFt)}</td>
                  <td className="py-3 px-4 text-on-surface font-mono font-bold text-sm">{fmtNum(totalWeeklyTraffic)}/wk</td>
                  <td className="py-3 px-4 text-neon-cyan font-mono font-bold text-sm">{fmt(totalSponsorRevenue)}</td>
                  <td className="py-3 px-4 text-neon-violet font-mono font-bold text-sm">{fmt(totalPotentialRevenue)}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-sm">{((totalSponsorRevenue / totalPotentialRevenue) * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-neon-pink font-mono font-bold text-sm">{fmt(totalGap)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Venue detail panel on click */}
        {selectedVenueData && (
          <div className="bg-surface-container-high rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-on-surface font-extrabold text-xl">{selectedVenueData.name}</h3>
                <p className="text-on-surface-variant text-sm">{selectedVenueData.address} &middot; {selectedVenueData.type}</p>
              </div>
              <button onClick={() => setSelectedVenue(null)} className="text-on-surface-variant hover:text-on-surface text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Capacity</p><p className="text-on-surface font-mono font-bold">{fmtNum(selectedVenueData.capacity)}</p></div>
              <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Weekly Traffic</p><p className="text-on-surface font-mono font-bold">{fmtNum(selectedVenueData.avgWeeklyFootTraffic)}</p></div>
              <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Current Rev</p><p className="text-neon-cyan font-mono font-bold">{fmt(selectedVenueData.sponsorRevenue)}</p></div>
              <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Potential Rev</p><p className="text-neon-violet font-mono font-bold">{fmt(selectedVenueData.potentialRevenue)}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedVenueData.features.map((f) => (<span key={f} className="bg-surface-container text-on-surface-variant text-xs px-2.5 py-1 rounded-full">{f}</span>))}
              {selectedVenueData.hasStage && <span className="bg-[#aea2ff]/10 text-neon-violet text-xs px-2.5 py-1 rounded-full">Stage</span>}
              {selectedVenueData.hasRooftop && <span className="bg-[#00eefc]/10 text-neon-cyan text-xs px-2.5 py-1 rounded-full">Rooftop</span>}
              {selectedVenueData.hasKitchen && <span className="bg-[#00eefc]/10 text-neon-cyan text-xs px-2.5 py-1 rounded-full">Kitchen</span>}
            </div>
            {Object.keys(selectedVenueData.currentSponsors).length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">Current Sponsors</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedVenueData.currentSponsors).filter(([, v]) => v).map(([cat, brand]) => (
                    <span key={cat} className="bg-[#00eefc]/10 text-neon-cyan text-xs px-2.5 py-1 rounded-full">{cat}: {brand}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-on-surface-variant text-sm leading-relaxed">{selectedVenueData.notes}</p>
          </div>
        )}

        {/* Venue revenue horizontal bar chart */}
        <div className="bg-surface-container-high rounded-xl p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.15em] text-on-surface mb-1">Venue Revenue Analysis</h3>
              <p className="text-xs text-on-surface-variant">Current Revenue vs. Market Potential</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#00eefc]" />
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-on-surface-variant">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ff6b98]" />
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-on-surface-variant">Gap</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={venueRevenueData} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
              <XAxis type="number" tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#acaaae", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }}
                formatter={(v) => fmt(Number(v))}
              />
              <Legend />
              <Bar dataKey="current" fill="#00eefc" name="Current" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gap" fill="#ff6b98" name="Gap" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
