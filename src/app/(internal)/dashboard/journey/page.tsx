"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { guestJourneys, crossVenueStats } from "@/data/guest-journeys";
import { fmtNum } from "@/lib/utils";

export default function JourneyPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Cross-venue stats hero */}
        <div className="bg-gradient-to-br from-purple-950/40 to-gray-900 border border-purple-800/40 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-2">CBM{"'"}s Unfair Advantage</p>
              <h2 className="text-3xl font-bold text-white mb-3">The Cross-Venue Guest Journey</h2>
              <p className="text-gray-400 leading-relaxed">
                Most sponsors buy a single venue. CBM offers something no individual bar can: a guest who visits <span className="text-purple-300 font-bold">{crossVenueStats.avgVenuesPerGuest} venues per night</span>,
                spending <span className="text-purple-300 font-bold">${crossVenueStats.avgSpendPerJourney}</span> across a <span className="text-purple-300 font-bold">{crossVenueStats.avgDwellTime}-minute journey</span>.
                One brand sponsor gets <span className="text-amber-400 font-bold">{crossVenueStats.brandTouchpointsPerNight} brand touchpoints per guest per night</span> — that{"'"}s not a sponsorship, it{"'"}s an immersive brand ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 min-w-[280px]">
              <MetricCard label="Avg Venues / Guest" value={crossVenueStats.avgVenuesPerGuest.toString()} sub="Per night" accent />
              <MetricCard label="Brand Touches" value={crossVenueStats.brandTouchpointsPerNight.toString()} sub="Per guest per night" />
              <MetricCard label="Avg Journey Spend" value={`$${crossVenueStats.avgSpendPerJourney}`} sub="Across all venues" accent />
              <MetricCard label="Annual Journeys" value={`${(crossVenueStats.annualJourneys / 1000).toFixed(0)}K`} sub="Cross-venue trips/yr" />
            </div>
          </div>
        </div>

        {/* Journey paths */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Common Guest Journeys</h3>
          <div className="space-y-4">
            {guestJourneys.map((journey, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg">{journey.name}</h4>
                    <p className="text-gray-500 text-sm">{journey.description}</p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div><p className="text-gray-500 text-xs">Guests/Night</p><p className="text-amber-400 font-mono font-bold">{fmtNum(journey.avgGuestsPerNight)}</p></div>
                    <div><p className="text-gray-500 text-xs">Brand Exposures</p><p className="text-purple-400 font-mono font-bold">{fmtNum(journey.brandExposures)}/night</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {journey.path.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      <div className={`bg-gray-800 border rounded-lg p-3 min-w-[180px] ${i === 0 ? "border-green-800/50" : i === journey.path.length - 1 ? "border-amber-800/50" : "border-gray-700"}`}>
                        <p className="text-white font-semibold text-sm">{stop.venue}</p>
                        <p className="text-gray-500 text-xs">{stop.time}</p>
                        <p className="text-gray-400 text-xs mt-1">{stop.activity}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-gray-500 text-xs">{stop.dwell}</span>
                          <span className="text-green-400 text-xs font-mono">{stop.spend}</span>
                        </div>
                      </div>
                      {i < journey.path.length - 1 && (
                        <span className="text-amber-500 text-lg flex-shrink-0">&#8594;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to tell the brand */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-6">
          <h3 className="text-amber-400 font-bold text-lg mb-3">What to Tell the Brand</h3>
          <p className="text-gray-300 leading-relaxed">
            {"\""} Your brand doesn{"'"}t just appear once — it follows the guest from dinner to cocktails to the dance floor.
            A Casamigos sponsorship at CBM means your bottle is on the table at La Mona Rosa, your margarita is featured at Lucky Day,
            and your branded bar is at the Block Party. That same guest sees your brand <span className="text-amber-400 font-bold">{crossVenueStats.brandTouchpointsPerNight} times in a single night</span> across
            <span className="text-amber-400 font-bold"> {crossVenueStats.avgVenuesPerGuest} venues</span>.
            No Strip nightclub can offer that. No billboard can offer that. This is immersive brand living.{"\""}
          </p>
        </div>
      </div>
    </div>
  );
}
