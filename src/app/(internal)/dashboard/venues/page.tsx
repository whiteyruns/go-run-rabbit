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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-6">
        {/* Venue table with utilization bars */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Venue</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Capacity</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Sq Ft</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Traffic</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Rev</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Potential</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Utilization</th>
                  <th className="py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Gap</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => {
                  const utilization = venue.sponsorRevenue / venue.potentialRevenue;
                  const gap = venue.potentialRevenue - venue.sponsorRevenue;
                  return (
                    <tr
                      key={venue.id}
                      className={`border-b border-gray-800 cursor-pointer transition-colors ${selectedVenue === venue.id ? "bg-amber-950/30" : "hover:bg-gray-800/50"}`}
                      onClick={() => setSelectedVenue(venue.id)}
                    >
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-sm">{venue.name}</p>
                        <p className="text-gray-500 text-xs">{venue.zone}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm font-mono">{fmtNum(venue.capacity)}</td>
                      <td className="py-3 px-4 text-gray-300 text-sm font-mono">{fmtNum(venue.sqft)}</td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{fmtNum(venue.avgWeeklyFootTraffic)}/wk</td>
                      <td className="py-3 px-4">
                        <p className="text-green-400 text-sm font-mono">{fmt(venue.sponsorRevenue)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-amber-400 text-sm font-mono">{fmt(venue.potentialRevenue)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${utilization > 0.5 ? "bg-green-500" : utilization > 0 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${Math.max(utilization * 100, 3)}%` }}
                          />
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{(utilization * 100).toFixed(0)}% filled</p>
                      </td>
                      <td className="py-3 px-4 text-red-400 text-sm font-mono">{fmt(gap)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-800/40 bg-gray-800/30">
                  <td className="py-3 px-4 text-amber-400 font-bold text-sm">TOTAL</td>
                  <td className="py-3 px-4 text-white font-mono font-bold text-sm">{fmtNum(totalCapacity)}</td>
                  <td className="py-3 px-4 text-white font-mono font-bold text-sm">{fmtNum(totalSqFt)}</td>
                  <td className="py-3 px-4 text-white font-mono font-bold text-sm">{fmtNum(totalWeeklyTraffic)}/wk</td>
                  <td className="py-3 px-4 text-green-400 font-mono font-bold text-sm">{fmt(totalSponsorRevenue)}</td>
                  <td className="py-3 px-4 text-amber-400 font-mono font-bold text-sm">{fmt(totalPotentialRevenue)}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{((totalSponsorRevenue / totalPotentialRevenue) * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-red-400 font-mono font-bold text-sm">{fmt(totalGap)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Venue detail panel on click */}
        {selectedVenueData && (
          <div className="bg-gray-900 border border-amber-800/40 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold text-xl">{selectedVenueData.name}</h3>
                <p className="text-gray-400 text-sm">{selectedVenueData.address} &middot; {selectedVenueData.type}</p>
              </div>
              <button onClick={() => setSelectedVenue(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><p className="text-gray-500 text-xs">Capacity</p><p className="text-white font-mono font-bold">{fmtNum(selectedVenueData.capacity)}</p></div>
              <div><p className="text-gray-500 text-xs">Weekly Traffic</p><p className="text-white font-mono font-bold">{fmtNum(selectedVenueData.avgWeeklyFootTraffic)}</p></div>
              <div><p className="text-gray-500 text-xs">Current Rev</p><p className="text-green-400 font-mono font-bold">{fmt(selectedVenueData.sponsorRevenue)}</p></div>
              <div><p className="text-gray-500 text-xs">Potential Rev</p><p className="text-amber-400 font-mono font-bold">{fmt(selectedVenueData.potentialRevenue)}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedVenueData.features.map((f) => (<span key={f} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">{f}</span>))}
              {selectedVenueData.hasStage && <span className="bg-purple-900/40 text-purple-300 text-xs px-2.5 py-1 rounded-full">Stage</span>}
              {selectedVenueData.hasRooftop && <span className="bg-blue-900/40 text-blue-300 text-xs px-2.5 py-1 rounded-full">Rooftop</span>}
              {selectedVenueData.hasKitchen && <span className="bg-green-900/40 text-green-300 text-xs px-2.5 py-1 rounded-full">Kitchen</span>}
            </div>
            {Object.keys(selectedVenueData.currentSponsors).length > 0 && (
              <div className="mb-3">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Sponsors</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedVenueData.currentSponsors).filter(([, v]) => v).map(([cat, brand]) => (
                    <span key={cat} className="bg-green-900/30 text-green-300 text-xs px-2.5 py-1 rounded-full">{cat}: {brand}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-gray-400 text-sm leading-relaxed">{selectedVenueData.notes}</p>
          </div>
        )}

        {/* Venue revenue horizontal bar chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Venue Revenue: Current vs. Potential</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={venueRevenueData} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Bar dataKey="current" fill="#22c55e" name="Current" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gap" fill="#ef4444" name="Gap" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
