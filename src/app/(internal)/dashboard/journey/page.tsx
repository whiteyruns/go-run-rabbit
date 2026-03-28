"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { guestJourneys, crossVenueStats } from "@/data/guest-journeys";
import { fmtNum } from "@/lib/utils";

export default function JourneyPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">GUEST JOURNEY</h1>
      <p className="text-on-surface-variant mb-10">Cross-venue guest flow intelligence across the CBM ecosystem</p>

      <div className="space-y-10">
        {/* Cross-venue stats hero */}
        <div className="bg-surface-container-low rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-violet mb-3">Proprietary Intelligence</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">CBM{"'"}S UNFAIR ADVANTAGE</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Most sponsors buy a single venue. CBM offers something no individual bar can: a guest who visits <span className="text-neon-violet font-bold">{crossVenueStats.avgVenuesPerGuest} venues per night</span>,
                spending <span className="text-neon-violet font-bold">${crossVenueStats.avgSpendPerJourney}</span> across a <span className="text-neon-violet font-bold">{crossVenueStats.avgDwellTime}-minute journey</span>.
                One brand sponsor gets <span className="text-neon-cyan font-bold">{crossVenueStats.brandTouchpointsPerNight} brand touchpoints per guest per night</span> — that{"'"}s not a sponsorship, it{"'"}s an immersive brand ecosystem.
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
          <h3 className="text-2xl font-extrabold tracking-tight text-on-surface uppercase mb-6">Common Guest Journeys</h3>
          <div className="space-y-4">
            {guestJourneys.map((journey, idx) => (
              <div key={idx} className="bg-surface-container-high rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-on-surface font-extrabold text-lg">{journey.name}</h4>
                    <p className="text-on-surface-variant text-sm">{journey.description}</p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Guests/Night</p><p className="text-neon-cyan font-mono font-bold">{fmtNum(journey.avgGuestsPerNight)}</p></div>
                    <div><p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Brand Exposures</p><p className="text-neon-violet font-mono font-bold">{fmtNum(journey.brandExposures)}/night</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {journey.path.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      <div className={`bg-surface-container rounded-lg p-3 min-w-[180px] ${i === 0 ? "border-b-2 border-[#00eefc]" : i === journey.path.length - 1 ? "border-b-2 border-[#ff6b98]" : "border-b-2 border-[#aea2ff]"}`}>
                        <p className="text-on-surface font-semibold text-sm">{stop.venue}</p>
                        <p className="text-on-surface-variant text-xs">{stop.time}</p>
                        <p className="text-on-surface-variant text-xs mt-1">{stop.activity}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-on-surface-variant text-xs">{stop.dwell}</span>
                          <span className="text-neon-cyan text-xs font-mono">{stop.spend}</span>
                        </div>
                      </div>
                      {i < journey.path.length - 1 && (
                        <span className="text-neon-violet text-lg flex-shrink-0">&#8594;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to tell the brand */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-neon-cyan font-extrabold text-lg mb-3">What to Tell the Brand</h3>
          <p className="text-on-surface leading-relaxed">
            {"\""} Your brand doesn{"'"}t just appear once — it follows the guest from dinner to cocktails to the dance floor.
            A Casamigos sponsorship at CBM means your bottle is on the table at La Mona Rosa, your margarita is featured at Lucky Day,
            and your branded bar is at the Block Party. That same guest sees your brand <span className="text-neon-cyan font-bold">{crossVenueStats.brandTouchpointsPerNight} times in a single night</span> across
            <span className="text-neon-cyan font-bold"> {crossVenueStats.avgVenuesPerGuest} venues</span>.
            No Strip nightclub can offer that. No billboard can offer that. This is immersive brand living.{"\""}
          </p>
        </div>
      </div>
    </div>
  );
}
