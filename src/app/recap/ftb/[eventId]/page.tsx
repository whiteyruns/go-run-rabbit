"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { findEvent } from "@/data/feed-the-block/events";
import { getArtistForEvent } from "@/data/feed-the-block/artists";
import { FTB_EXECUTIVE_SUMMARY } from "@/data/feed-the-block/recap/exec-summary";
import { getSponsorsForEvent } from "@/data/feed-the-block/recap/event-sponsors";
import { computeEventCard, estimatedImpact } from "@/data/feed-the-block/series";
import { feedTheBlock } from "@/data/feed-the-block";
import { dtlvHotels, stripHotels, sumVisitors, isCbmAnchor } from "@/data/feed-the-block/marshmello-apr2";
import { fmt, fmtNum } from "@/lib/utils";

const ACCESS_CODE = "feed2026";

export default function RecapPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const event = findEvent(eventId);
  if (!event) notFound();

  return (
    <AuthGate>
      <RecapBody eventId={eventId} />
    </AuthGate>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("ftb-recap-auth") === "true") setAuthed(true);
  }, []);

  if (authed) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("ftb-recap-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center recap-no-print" style={{ background: "#0e0e0e" }}>
      <form onSubmit={submit} className="flex flex-col items-center gap-8 px-6">
        <img src="/feed-the-block/img/logo-nav.png" alt="Feed The Block" className="h-16 mb-2" />
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
        >
          Event Recap · Access Required
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter access code"
          autoFocus
          className="w-72 bg-transparent border-b-2 py-3 text-center text-lg tracking-widest outline-none transition-colors"
          style={{
            fontFamily: "'Epilogue', sans-serif",
            borderColor: error ? "#ff4444" : focused ? "#ffd709" : "#494847",
            color: "#ffffff",
          }}
        />
        <button
          type="submit"
          className="px-12 py-3 text-xs uppercase tracking-widest font-bold transition-all hover:brightness-110 active:scale-95 rounded-full"
          style={{
            fontFamily: "'Epilogue', sans-serif",
            background: "linear-gradient(to right, #ffd709, #fc0d90)",
            color: "#0e0e0e",
          }}
        >
          View Recap
        </button>
        {error && (
          <p className="text-xs uppercase tracking-widest" style={{ color: "#ff4444", fontFamily: "'Epilogue', sans-serif" }}>
            Invalid access code
          </p>
        )}
      </form>
    </div>
  );
}

function RecapBody({ eventId }: { eventId: string }) {
  const event = findEvent(eventId)!;
  const card = computeEventCard(event);
  const artist = getArtistForEvent(eventId);
  const sponsors = getSponsorsForEvent(eventId);
  const ds = event.data;

  const dtlv = dtlvHotels(ds);
  const dtlvVisitors = sumVisitors(dtlv);
  const dtlvPct = card.visits > 0 ? (dtlvVisitors / card.visits) * 100 : 0;
  const elCortez = ds.hotels.find(isCbmAnchor);
  const strip = stripHotels(ds);
  const stripVisitors = sumVisitors(strip);

  return (
    <div className="min-h-screen" style={{ background: "#0e0e0e", color: "#ffffff" }}>
      {/* Action bar — hidden in print */}
      <div className="recap-no-print sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/feed-the-block/img/logo-nav.png" alt="FTB" className="h-7" />
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-white/50"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              Event Recap
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white border border-white/10"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              Save as PDF
            </button>
            <a
              href="mailto:partnerships@feedtheblock.com?subject=Feed%20The%20Block%20—%20Schedule%20a%20Call"
              className="px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-full transition-all hover:brightness-110"
              style={{
                fontFamily: "'Epilogue', sans-serif",
                background: "linear-gradient(to right, #ffd709, #fc0d90)",
                color: "#0e0e0e",
              }}
            >
              Schedule a Call
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        {/* Hero */}
        <section>
          <p
            className="text-xs uppercase tracking-[0.3em] mb-6"
            style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
          >
            Post-event Recap · {event.eventDay}, {event.eventDate}
          </p>
          <h1 className="ftb-headline text-5xl md:text-7xl leading-[0.95] mb-6">
            <span className="ftb-gradient">{event.headliner}</span>
            <br />
            at Feed The Block
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mb-10">
            Independently measured performance data from one event in Downtown Las Vegas&rsquo;
            signature street festival. Placer.ai foot-traffic, audience profile, casino
            crossover, artist reach, and economic impact — in one view.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HeroStat value={fmtNum(card.visits)} label="Measured visits" />
            <HeroStat value={`${card.dwellMinutes}m`} label="Avg dwell time" />
            <HeroStat value={card.yoy} label="Visits YoY" />
            <HeroStat value={fmt(card.estimatedImpact)} label="Est. economic impact" />
          </div>
        </section>

        {/* Executive summary */}
        <section className="border-t border-white/10 pt-12">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            What is Feed The Block
          </p>
          <h2 className="ftb-headline text-3xl md:text-5xl mb-8">
            <span className="ftb-gradient">{FTB_EXECUTIVE_SUMMARY.tagline}</span>
          </h2>
          <div className="space-y-4 text-white/80 leading-relaxed max-w-3xl">
            {FTB_EXECUTIVE_SUMMARY.paragraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-8">
            {FTB_EXECUTIVE_SUMMARY.highlights.map((h) => (
              <div
                key={h}
                className="ftb-glass rounded-lg px-4 py-3 text-sm text-white/80 flex items-start gap-2"
              >
                <span style={{ color: "#ff68a7" }}>●</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The event */}
        <section className="border-t border-white/10 pt-12 recap-page-break">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            The Event
          </p>
          <h2 className="ftb-headline text-3xl md:text-5xl mb-6">
            <span className="ftb-gradient">{event.headliner}</span>
            <br />
            {event.eventDate}
          </h2>
          <div className="ftb-glass rounded-2xl overflow-hidden mb-6">
            {/* Placeholder photo strip */}
            <div
              className="h-48 md:h-64 flex items-center justify-center text-white/30 text-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,215,9,0.08), rgba(252,13,144,0.08))",
              }}
            >
              Event photography · placeholders pending social team
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Fact label="Day" value={event.eventDay} />
            <Fact label="Location" value="6th &amp; Fremont" />
            <Fact label="Format" value="Free · open air" />
            <Fact label="Producer" value="Wynn Nightlife × CBM" />
          </div>
        </section>

        {/* Artist spotlight */}
        {artist && (
          <section className="border-t border-white/10 pt-12 recap-page-break">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              Artist Spotlight
            </p>
            <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
              <span className="ftb-gradient">{artist.stageName}</span>
            </h2>
            <p
              className="text-sm text-white/50 mb-6"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              {artist.realName} · {artist.born} · {artist.yearsActive}
            </p>
            <p className="text-white/80 leading-relaxed max-w-3xl mb-8">{artist.bio}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {artist.reach.map((r, i) => (
                <div key={i} className="ftb-glass rounded-xl p-4">
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1"
                    style={{ fontFamily: "'Epilogue', sans-serif" }}
                  >
                    {r.platform}
                  </p>
                  <p className="ftb-headline text-2xl md:text-3xl">
                    <span className="ftb-gradient">{r.metric}</span>
                  </p>
                  <p className="text-white/50 text-xs">{r.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="ftb-glass rounded-2xl p-6">
                <p
                  className="text-[10px] uppercase tracking-[0.25em] mb-3"
                  style={{ fontFamily: "'Epilogue', sans-serif", color: "#ffd709" }}
                >
                  Notable Hits
                </p>
                <ul className="space-y-2 text-sm text-white/80">
                  {artist.hits.map((h, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>
                        &ldquo;{h.title}&rdquo;
                        {h.feature && (
                          <span className="text-white/50"> · {h.feature}</span>
                        )}
                      </span>
                      {(h.peak || h.released) && (
                        <span className="text-white/40 text-xs shrink-0">
                          {h.peak || h.released}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ftb-glass rounded-2xl p-6">
                <p
                  className="text-[10px] uppercase tracking-[0.25em] mb-3"
                  style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
                >
                  Milestones
                </p>
                <ul className="space-y-2 text-sm text-white/80">
                  {artist.milestones.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: "#ffd709" }}>◆</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="ftb-glass rounded-2xl p-6 mb-6">
              <p
                className="text-[10px] uppercase tracking-[0.25em] mb-3 text-white/50"
                style={{ fontFamily: "'Epilogue', sans-serif" }}
              >
                Signature
              </p>
              <p className="text-white/80">{artist.signature}</p>
            </div>

            <div>
              <p
                className="text-[10px] uppercase tracking-[0.25em] mb-3 text-white/50"
                style={{ fontFamily: "'Epilogue', sans-serif" }}
              >
                Example Social Outreach
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artist.outreachExamples.map((o, i) => (
                  <div key={i} className="ftb-glass rounded-xl p-4">
                    <p className="text-sm font-bold text-white mb-1">
                      {o.platform} · {o.handle}
                    </p>
                    <p className="text-white/60 text-xs">{o.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Performance data */}
        <section className="border-t border-white/10 pt-12 recap-page-break">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            Placer.ai · Measured Performance
          </p>
          <h2 className="ftb-headline text-3xl md:text-5xl mb-8">
            Independently <span className="ftb-gradient">verified</span> foot traffic
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Metric label="Measured visits" value={fmtNum(card.visits)} />
            <Metric label="Avg dwell" value={`${card.dwellMinutes} min`} />
            <Metric label="Casino crossover" value={fmtNum(card.hotelCrossover)} />
            <Metric label="YoY growth" value={card.yoy} />
          </div>

          {elCortez && (
            <div className="ftb-glass rounded-2xl p-6 mb-6 ring-1 ring-white/10">
              <p
                className="text-[10px] uppercase tracking-[0.25em] mb-2"
                style={{ fontFamily: "'Epilogue', sans-serif", color: "#ffd709" }}
              >
                #1 Hotel Origin · CBM Anchor
              </p>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="ftb-headline text-2xl">
                    <span className="ftb-gradient">{elCortez.name}</span>
                  </h3>
                  <p className="text-white/60 text-sm">
                    {fmtNum(elCortez.visitors)} attendees stayed here ·{" "}
                    {elCortez.distance} mi from event
                  </p>
                </div>
                <p className="ftb-headline text-4xl">
                  <span className="ftb-gradient">{elCortez.percentage}</span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <Callout
              value={fmtNum(dtlvVisitors)}
              label="DTLV hotel visitors"
              sub={`${dtlvPct.toFixed(1)}% of attendance · ${dtlv.length} properties`}
            />
            <Callout
              value={fmtNum(stripVisitors)}
              label="Strip cross-traffic"
              sub={`${strip.length} Strip properties pulled from`}
            />
            <Callout
              value={event.data.metrics.find((m) => m.metricName === "Median Age")?.metricValue ?? "—"}
              label="Median age"
              sub={`${event.data.metrics.find((m) => m.metricName === "Most Common Ethnicity")?.metricValue ?? ""}`}
            />
          </div>

          {/* Top hotel table */}
          <div className="ftb-glass rounded-2xl p-6">
            <p
              className="text-[10px] uppercase tracking-[0.25em] mb-4 text-white/50"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              Top Hotel Origins
            </p>
            <div className="space-y-2">
              {ds.hotels
                .slice()
                .sort((a, b) => b.visitors - a.visitors)
                .slice(0, 10)
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex justify-between items-center text-sm border-b border-white/5 pb-2"
                  >
                    <span className="text-white/80">{h.name}</span>
                    <span className="font-mono text-white/60">
                      {fmtNum(h.visitors)} · {h.percentage}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="border-t border-white/10 pt-12 recap-page-break">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            Social Media Performance
          </p>
          <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
            <span className="ftb-gradient">Series</span> reach &amp; engagement
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-2xl">
            Feed The Block official channel performance, Jan–Nov 2025. Event-specific
            breakdown will be added as the social team delivers assets.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Metric
              label="Total impressions"
              value={`${(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M`}
            />
            <Metric
              label="Engagements"
              value={fmtNum(feedTheBlock.socialMetrics.engagements)}
            />
            <Metric
              label="Video views"
              value={`${(feedTheBlock.socialMetrics.videoViews / 1000000).toFixed(1)}M`}
            />
            <Metric
              label="New followers"
              value={fmtNum(feedTheBlock.socialMetrics.newFollowers)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Callout
              value={`${(feedTheBlock.socialMetrics.instagramImpressions / 1000).toFixed(0)}K`}
              label="Instagram"
              sub="Impressions"
            />
            <Callout
              value={feedTheBlock.socialMetrics.tiktokEngagement}
              label="TikTok engagement"
              sub={`${(feedTheBlock.socialMetrics.tiktokImpressions / 1000).toFixed(0)}K impressions`}
            />
            <Callout
              value={`${(feedTheBlock.socialMetrics.viralReelViews / 1000000).toFixed(1)}M`}
              label="Viral reel views"
              sub={`${fmtNum(feedTheBlock.socialMetrics.viralTiktokViews / 1000)}K+ TikTok clip`}
            />
          </div>
        </section>

        {/* Economic impact */}
        <section className="border-t border-white/10 pt-12 recap-page-break">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            Economic Impact
          </p>
          <h2 className="ftb-headline text-3xl md:text-5xl mb-6">
            <span className="ftb-gradient">{fmt(card.estimatedImpact)}</span>
            <br />
            conservative estimate
          </h2>
          <p className="text-white/60 text-sm mb-6 max-w-2xl">
            Model from City of Las Vegas: 50% of casino-crossover attendees buy 1 drink @ $12,
            10% drop $50 in gaming. Excludes dining, retail, rideshare, and ancillary spend —
            true impact is materially higher.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Metric
              label="Hotel crossover"
              value={fmtNum(card.hotelCrossover)}
              sub="Parked at / returned to casino"
            />
            <Metric
              label="Drink revenue"
              value={fmt(card.hotelCrossover * 0.5 * 12)}
              sub={`${fmtNum(Math.round(card.hotelCrossover * 0.5))} drinks · $12 each`}
            />
            <Metric
              label="Gaming revenue"
              value={fmt(estimatedImpact(card.hotelCrossover) - card.hotelCrossover * 0.5 * 12)}
              sub={`${fmtNum(Math.round(card.hotelCrossover * 0.1))} players · $50 each`}
            />
          </div>
        </section>

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="border-t border-white/10 pt-12">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-4 text-white/50"
              style={{ fontFamily: "'Epilogue', sans-serif" }}
            >
              Event Sponsors &amp; Partners
            </p>
            <h2 className="ftb-headline text-3xl md:text-5xl mb-8">
              <span className="ftb-gradient">Thank you</span> to our partners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sponsors.map((s) => (
                <div key={s.name} className="ftb-glass rounded-2xl p-6">
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] mb-2"
                    style={{ fontFamily: "'Epilogue', sans-serif", color: "#ffd709" }}
                  >
                    {s.category}
                  </p>
                  <h3 className="ftb-headline text-2xl mb-1">
                    <span className="ftb-gradient">{s.name}</span>
                  </h3>
                  <p className="text-white/60 text-sm">{s.role}</p>
                  {s.note && <p className="text-white/40 text-xs mt-2">{s.note}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-white/10 pt-16 pb-10 text-center">
          <h2 className="ftb-headline text-4xl md:text-6xl mb-4">
            <span className="ftb-gradient">Schedule a call</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Discuss the next Feed The Block event, custom activation ideas, and sponsorship
            options — reply directly to Mauricio.
          </p>
          <a
            href="mailto:partnerships@feedtheblock.com?subject=Feed%20The%20Block%20—%20Schedule%20a%20Call&body=Hi%20Mauricio%2C%0A%0AI%27d%20like%20to%20schedule%20a%20call%20to%20discuss%20Feed%20The%20Block."
            className="inline-block px-10 py-4 text-sm uppercase tracking-widest font-bold rounded-full transition-all hover:brightness-110 active:scale-95"
            style={{
              fontFamily: "'Epilogue', sans-serif",
              background: "linear-gradient(to right, #ffd709, #fc0d90)",
              color: "#0e0e0e",
            }}
          >
            partnerships@feedtheblock.com
          </a>
          <p className="text-white/40 text-xs mt-6">
            Mauricio Morales · VP of Marketing and Events
            <br />
            Corner Bar Management × Wynn Nightlife
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 pb-10 text-center text-xs text-white/40">
          Data source · Placer.ai location intelligence · Event recap for{" "}
          {event.eventDay}, {event.eventDate}.
        </footer>
      </div>
    </div>
  );
}

// ============================================================================
// UI pieces
// ============================================================================

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="ftb-glass rounded-xl p-5">
      <p className="ftb-headline text-3xl md:text-4xl mb-2">
        <span className="ftb-gradient">{value}</span>
      </p>
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/60"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ftb-glass rounded-xl p-5">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
      <p className="ftb-headline text-2xl md:text-3xl">
        <span className="ftb-gradient">{value}</span>
      </p>
      {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Callout({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="ftb-glass rounded-xl p-5">
      <p className="ftb-headline text-3xl mb-1">
        <span className="ftb-gradient">{value}</span>
      </p>
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/70"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-white/40 text-xs mt-1">{sub}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="ftb-glass rounded-xl p-4">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-white font-bold" dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
}
