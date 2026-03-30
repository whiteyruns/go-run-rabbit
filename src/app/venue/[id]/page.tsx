"use client";

import { useParams } from "next/navigation";
import { venues } from "@/data/venues";
import { fmtNum } from "@/lib/utils";

export default function VenuePage() {
  const { id } = useParams();
  const venue = venues.find(v => v.id === id);

  if (!venue) return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
      <p className="text-[#ff6b98]">Venue not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f3f0f4]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img src={`/venues/${venue.id}.jpg`} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/40 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 max-w-4xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00eefc] mb-2">{venue.zone}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{venue.name}</h1>
          <p className="text-[#acaaae] mt-2">{venue.address} &middot; {venue.type}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1f1f23] rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold font-mono text-[#00eefc]">{fmtNum(venue.capacity)}</p>
            <p className="text-[#acaaae] text-xs mt-1">Capacity</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold font-mono">{fmtNum(venue.sqft)}</p>
            <p className="text-[#acaaae] text-xs mt-1">Sq Ft</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold font-mono text-[#aea2ff]">{fmtNum(venue.avgWeeklyFootTraffic)}</p>
            <p className="text-[#acaaae] text-xs mt-1">Weekly Traffic</p>
          </div>
          <div className="bg-[#1f1f23] rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold font-mono">{venue.daysOpen}</p>
            <p className="text-[#acaaae] text-xs mt-1">Days / Week</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-[#1f1f23] rounded-xl p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-4">Features</h3>
          <div className="flex flex-wrap gap-2">
            {venue.features.map((f: string) => (
              <span key={f} className="text-xs bg-[#25252a] text-[#f3f0f4] px-3 py-1.5 rounded-full">{f}</span>
            ))}
            {venue.hasStage && <span className="text-xs bg-[#aea2ff]/15 text-[#aea2ff] px-3 py-1.5 rounded-full">Stage</span>}
            {venue.hasRooftop && <span className="text-xs bg-[#aea2ff]/15 text-[#aea2ff] px-3 py-1.5 rounded-full">Rooftop</span>}
            {venue.hasKitchen && <span className="text-xs bg-[#00eefc]/15 text-[#00eefc] px-3 py-1.5 rounded-full">Full Kitchen</span>}
          </div>
        </div>

        {/* Notes */}
        {venue.notes && (
          <div className="bg-[#19191d] rounded-xl p-8">
            <p className="text-[#acaaae] leading-relaxed">{venue.notes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-6">
          <a href="mailto:keith@gorunrabbit.com" className="bg-[#aea2ff] text-[#1f0078] px-8 py-3 rounded-md font-bold hover:bg-[#a092ff] transition-all inline-block">
            Inquire About This Venue
          </a>
          <p className="text-[9px] text-[#48474b] uppercase tracking-[0.15em] font-bold mt-6">
            Corner Bar Management &middot; Go Run Rabbit LLC
          </p>
        </div>
      </div>
    </div>
  );
}
