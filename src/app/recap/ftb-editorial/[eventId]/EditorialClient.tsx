"use client";

import { useState, useEffect } from "react";
import { feedTheBlock } from "@/data/feed-the-block";
import { isCbmAnchor } from "@/data/feed-the-block/marshmello-apr2";
import { estimatedImpact } from "@/data/feed-the-block/series";
import { FTB_EXECUTIVE_SUMMARY } from "@/data/feed-the-block/recap/exec-summary";
import { photoUrl, type RecapBundle } from "@/data/feed-the-block/recap/bundle";
import { fmt, fmtNum } from "@/lib/utils";

const ACCESS_CODE = "feed2026";

export function EditorialClient({
  bundle,
  previewAuthed = false,
}: {
  bundle: RecapBundle;
  previewAuthed?: boolean;
}) {
  // Admins viewing drafts bypass the public code gate.
  if (previewAuthed) return <RecapBody bundle={bundle} />;
  return (
    <AuthGate>
      <RecapBody bundle={bundle} />
    </AuthGate>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

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
    <div
      className="min-h-screen flex items-center justify-center recap-no-print px-8"
      style={{ background: "#fdf9f3" }}
    >
      <form onSubmit={submit} className="flex flex-col items-center gap-8 max-w-sm w-full">
        <p className="serif text-4xl font-bold tracking-tighter text-[#1c1c18]">
          FEED THE BLOCK
        </p>
        <p className="uppercase tracking-[0.3em] text-[10px] text-[#7f5700]">
          Event Recap · Access Required
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter access code"
          autoFocus
          className="w-full bg-transparent border-b border-[#c9912b] py-3 text-center text-base tracking-widest outline-none text-[#1c1c18] placeholder:text-[#504536]/50"
          style={{ borderColor: error ? "#ba1a1a" : "#c9912b" }}
        />
        <button
          type="submit"
          className="px-12 py-3 text-[10px] uppercase tracking-widest font-medium transition-opacity hover:opacity-85 bg-[#7f5700] text-white"
        >
          View Recap
        </button>
        {error && (
          <p className="text-xs uppercase tracking-widest text-[#ba1a1a]">
            Invalid access code
          </p>
        )}
      </form>
    </div>
  );
}

function RecapBody({ bundle }: { bundle: RecapBundle }) {
  const { artist, sponsors, photos, data: ds } = bundle;

  // Event card stats — inline computation from bundle.data.
  const parseIntSafe = (s: string | undefined): number => {
    if (!s) return 0;
    const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  };
  const metric = (name: string) =>
    ds.metrics.find((m) => m.metricName === name)?.metricValue ?? "";

  const visits = parseIntSafe(metric("Total Visits"));
  const dwellMinutes = parseIntSafe(metric("Avg Dwell Time Min"));
  const yoy = metric("Visits YoY") || "—";
  const hotelCrossover = ds.hotels.reduce((s, h) => s + h.visitors, 0);
  const impact = estimatedImpact(hotelCrossover);

  const elCortez = ds.hotels.find(isCbmAnchor);
  const dwellHrs = (dwellMinutes / 60).toFixed(1);
  const topHotels = [...ds.hotels].sort((a, b) => b.visitors - a.visitors).slice(0, 4);
  const maxHotel = topHotels[0]?.visitors ?? 1;

  const metricMap = new Map(ds.metrics.map((m) => [m.metricName, m.metricValue]));
  const hero = photos.hero;
  const polaroid = photos.polaroid;

  return (
    <>
      {/* Fixed nav */}
      <nav className="recap-no-print fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-5 bg-[#fdf9f3]/85 backdrop-blur-md border-b-[0.5px] border-[#c9912b]/30">
        <div className="serif text-xl md:text-2xl font-bold tracking-tighter text-[#1c1c18]">
          FEED THE BLOCK
        </div>
        <div className="flex gap-2 md:gap-3 items-center">
          {bundle.status === "draft" && (
            <span className="px-2 py-1 text-[9px] uppercase tracking-widest bg-[#c9912b] text-white">
              Draft
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 md:px-5 py-2 text-[10px] uppercase tracking-widest font-medium border border-[#7f5700] text-[#7f5700] hover:bg-[#7f5700] hover:text-white transition-colors"
          >
            Save as PDF
          </button>
          <a
            href="mailto:partnerships@feedtheblock.com?subject=Feed%20The%20Block%20—%20Schedule%20a%20Call"
            className="px-4 md:px-5 py-2 text-[10px] uppercase tracking-widest font-medium bg-[#7f5700] text-white hover:opacity-85 transition-opacity"
          >
            Schedule a Call
          </a>
        </div>
      </nav>

      <main className="pt-20 md:pt-24">
        {/* 1. Cover hero */}
        <section className="min-h-[70vh] px-8 md:px-20 py-24 md:py-0 flex flex-col justify-center border-b-[0.5px] border-[#c9912b]/30">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="serif text-6xl md:text-9xl font-bold leading-none tracking-tighter mb-10 max-w-5xl">
              {bundle.headliner} at Feed The Block
            </h1>
            <p className="serif italic text-xl md:text-3xl text-[#1c1c18]/70 max-w-2xl">
              Independently measured impact from one night on Fremont.
            </p>
          </div>
        </section>

        {/* 2. Executive summary */}
        <section className="py-24 md:py-32 px-8 md:px-20 bg-[#f7f3ed]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
              <div className="md:col-span-4">
                <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-6">
                  The Series
                </p>
                <h2 className="serif text-4xl md:text-5xl font-bold leading-tight mb-4">
                  What Feed The Block is
                </h2>
                <p className="serif italic text-base text-[#1c1c18]/60">
                  Post-event Recap · {bundle.eventDate}
                </p>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <p
                  className="drop-cap text-[17px] text-[#1c1c18]/85 leading-[1.7] mb-12"
                  dangerouslySetInnerHTML={{ __html: FTB_EXECUTIVE_SUMMARY.paragraphs[0] }}
                />
                <blockquote className="serif italic text-3xl md:text-4xl border-l-4 border-[#7f5700] pl-6 md:pl-8 py-4 text-[#7f5700] leading-tight">
                  &ldquo;{FTB_EXECUTIVE_SUMMARY.tagline}&rdquo;
                </blockquote>
                <p
                  className="text-[17px] text-[#1c1c18]/85 leading-[1.7] mt-12"
                  dangerouslySetInnerHTML={{ __html: FTB_EXECUTIVE_SUMMARY.paragraphs[1] }}
                />
              </div>
            </div>

            {/* Headline stats — moved out of the cover hero */}
            <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <StatRule value={fmtNum(visits)} label="Total Visitors" />
              <StatRule value={`${dwellHrs} Hrs`} label="Avg. Dwell Time" />
              <StatRule value={yoy} label="Visits Year-over-Year" />
              <StatRule value={fmt(impact)} label="Direct Economic Spend" />
            </div>
          </div>
        </section>

        {/* 3. The Event (full-bleed) */}
        {hero && (
          <section className="py-16 md:py-20 recap-page-break">
            <figure className="w-full h-[400px] md:h-[716px] relative overflow-hidden bg-[#1c1c18]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(bundle.photoPathKey, hero.slug, 1920)}
                alt={hero.alt}
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute bottom-0 left-0 p-6 md:p-8 bg-gradient-to-t from-black/75 to-transparent w-full">
                {hero.caption && (
                  <figcaption className="text-white serif italic text-sm md:text-base">
                    {hero.caption}
                  </figcaption>
                )}
                <p className="text-white/60 uppercase tracking-widest text-[9px] mt-2">
                  Photograph · {hero.credit}
                </p>
              </div>
            </figure>
            <div className="max-w-7xl mx-auto px-8 md:px-20 mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
              <div className="md:col-span-4">
                <div className="flex flex-col gap-6">
                  <EventFact label="Venue" value="Fremont East District" />
                  <EventFact label="Location" value="6th &amp; Fremont" />
                  <EventFact label="Format" value="Free · Open-air" />
                  <EventFact label="Day" value={bundle.eventDay} />
                  <EventFact
                    label="Producer"
                    value="Wynn Nightlife × Corner Bar Management"
                  />
                </div>
              </div>
              <div className="md:col-span-8">
                <p className="text-[17px] text-[#1c1c18]/80 leading-loose">
                  The air was electric from first note. Unlike traditional nightlife
                  activations, Feed The Block prioritizes the pedestrian experience,
                  utilizing the existing architectural bones of Fremont East to create a
                  360-degree sensory environment. The collaboration between Wynn
                  Nightlife&rsquo;s production expertise and Corner Bar Management&rsquo;s
                  local soul manifested in a night that recalibrated what Downtown
                  entertainment can achieve — and the Placer.ai data confirms what the
                  sidewalks already knew.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 4. Artist spotlight */}
        {artist && (
          <section className="py-24 md:py-32 px-8 md:px-20 border-t-[0.5px] border-[#c9912b]/30 recap-page-break">
            <div className="max-w-7xl mx-auto">
              <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-6">
                The Headliner
              </p>
              <h2 className="serif text-7xl md:text-[8rem] lg:text-[10rem] font-bold leading-[0.9] tracking-tighter mb-6 -ml-1 break-words">
                {artist.stageName}
              </h2>
              <p className="serif italic text-xl md:text-2xl text-[#1c1c18]/60 mb-12 md:mb-16">
                {artist.realName} · {artist.nationality} · {artist.yearsActive}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
                <div className="md:col-span-7">
                  <p className="text-[17px] text-[#1c1c18]/85 leading-[1.7] max-w-2xl mb-10">
                    {artist.bio}
                  </p>

                  {artist.hits.length > 0 && (
                    <div className="mb-10">
                      <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
                        Notable Hits
                      </p>
                      <div className="flex flex-wrap gap-3 items-center">
                        {artist.hits.slice(0, 5).map((h, i) => (
                          <span key={h.title} className="flex items-center gap-3">
                            <span className="serif italic text-base">
                              &ldquo;{h.title}&rdquo;
                            </span>
                            {i < Math.min(4, artist.hits.length - 1) && (
                              <span className="text-[#1c1c18]/20">/</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {artist.milestones.length > 0 && (
                    <div>
                      <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
                        Milestones
                      </p>
                      <ul className="space-y-4">
                        {artist.milestones.slice(0, 5).map((m, i) => (
                          <li key={i} className="flex items-start gap-4 max-w-2xl">
                            <div className="w-2 h-2 bg-[#7f5700] mt-2 shrink-0" />
                            <span className="text-[16px] leading-relaxed">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 md:col-start-9 flex flex-col gap-12">
                  {polaroid && (
                    <div className="bg-white p-4 shadow-[0_10px_40px_rgba(28,28,24,0.08)] -rotate-2 transform hover:rotate-0 transition-transform duration-500">
                      <div className="aspect-square bg-[#f1ede7] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl(bundle.photoPathKey, polaroid.slug, 640)}
                          alt={polaroid.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {polaroid.caption && (
                        <div className="pt-4 serif italic text-[#1c1c18]/60 text-center text-sm">
                          {polaroid.caption}
                        </div>
                      )}
                      <p className="text-[#1c1c18]/40 text-center uppercase tracking-widest text-[8px] pb-1">
                        {polaroid.credit}
                      </p>
                    </div>
                  )}

                  {artist.reach.length > 0 && (
                    <div className="grid grid-cols-2 gap-8">
                      {artist.reach.slice(0, 2).map((r, i) => (
                        <div key={i}>
                          <span className="block serif text-4xl md:text-5xl font-bold text-[#7f5700] leading-none mb-3">
                            {r.metric}
                          </span>
                          <span className="uppercase tracking-widest text-[9px] text-[#1c1c18]/60">
                            {r.platform} · {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Photo gallery — "The Night in Photographs" */}
        {photos.gallery.length > 0 && (
          <section className="py-16 md:py-20 bg-[#1c1c18] recap-page-break">
            <div className="max-w-7xl mx-auto px-8 md:px-12">
              <p className="uppercase tracking-[0.3em] text-xs text-[#c9912b] mb-6">
                The Night in Photographs
              </p>
              <h2 className="serif text-3xl md:text-5xl font-bold text-[#fdf9f3] leading-tight mb-12 max-w-3xl">
                One block. {fmtNum(visits)}. One set.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1">
              {photos.gallery.slice(0, 3).map((p) => (
                <figure
                  key={p.slug}
                  className="relative aspect-[4/3] overflow-hidden bg-[#0a0a08]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(bundle.photoPathKey, p.slug, 1280)}
                    alt={p.alt}
                    className="w-full h-full object-cover"
                  />
                  <figcaption className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white/80 uppercase tracking-widest text-[9px]">
                      {p.credit}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* 5. Placer.ai — data viz */}
        {topHotels.length > 0 && (
          <section className="py-24 md:py-32 px-8 md:px-20 bg-[#ebe8e2] recap-page-break">
            <div className="max-w-7xl mx-auto">
              <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-6">
                Independently Measured
              </p>
              <h2 className="serif text-4xl md:text-5xl font-bold mb-16">
                The numbers, verified.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-end">
                <div className="md:col-span-5">
                  <p className="text-[17px] mb-12 text-[#1c1c18]/80 leading-[1.7]">
                    Using Placer.ai&rsquo;s proprietary location intelligence, we tracked
                    the specific movement of devices within the Fremont East geofence. The
                    data reveals a deliberate and repeated cross-pollination between the
                    event and nearby hospitality partners — with the CBM anchor property,
                    El Cortez, carrying the overwhelming share of overnight stays.
                  </p>
                  <div className="space-y-0">
                    {topHotels.map((h, i) => (
                      <div
                        key={h.id}
                        className={`flex justify-between items-end py-4 ${
                          i < topHotels.length - 1 ? "border-b border-[#1c1c18]/10" : ""
                        }`}
                      >
                        <span className="text-sm">
                          <span className="serif font-bold text-[#1c1c18]">{h.name}</span>
                        </span>
                        <span className="serif font-bold text-lg">{h.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-7 relative pt-20">
                  <div className="flex items-end gap-4 md:gap-6 h-64 border-b border-[#1c1c18]/20 relative">
                    {topHotels.map((h, i) => {
                      const pct = (h.visitors / maxHotel) * 95;
                      return (
                        <div
                          key={h.id}
                          className="flex-1 relative"
                          title={`${h.name}: ${fmtNum(h.visitors)}`}
                        >
                          <div
                            className="bg-[#7f5700] absolute bottom-0 left-0 right-0"
                            style={{
                              height: `${pct}%`,
                              opacity: i === 0 ? 1 : 0.65 - i * 0.15,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 md:gap-6 mt-3">
                    {topHotels.map((h) => (
                      <div
                        key={h.id}
                        className="flex-1 uppercase tracking-widest text-[9px] text-[#1c1c18]/60 text-center"
                      >
                        {h.name.split(" ").slice(0, 2).join(" ")}
                      </div>
                    ))}
                  </div>
                  {elCortez && (
                    <div className="absolute top-2 left-4 text-[#7f5700] max-w-[240px]">
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                        className="transform -rotate-12"
                      >
                        <path
                          d="M 10 10 Q 25 5, 35 25 Q 40 35, 30 45"
                          stroke="#7f5700"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 25 40 L 30 45 L 32 37"
                          stroke="#7f5700"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="serif italic text-sm leading-snug mt-1">
                        CBM anchor — {elCortez.percentage} of overnight stays
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-20 max-w-4xl">
                <p className="serif italic text-2xl md:text-3xl text-[#1c1c18]/80 leading-snug">
                  The audience skews{" "}
                  <span className="text-[#7f5700] font-bold not-italic">
                    {metricMap.get("Median Age") ?? "—"} years old
                  </span>
                  , earns{" "}
                  <span className="text-[#7f5700] font-bold not-italic">
                    {metricMap.get("Median Household Income") ?? "—"}
                  </span>
                  , and is{" "}
                  <span className="text-[#7f5700] font-bold not-italic">
                    34% Hispanic or Latino
                  </span>{" "}
                  — five points above the Nevada baseline.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 5b. Registered Audience — only when ticket data uploaded */}
        {bundle.tickets && (
          <RegisteredAudienceSection
            tickets={bundle.tickets}
            placerVisits={visits}
          />
        )}

        {/* 6. Economic Impact */}
        <section className="py-24 md:py-32 px-8 md:px-20 text-center recap-page-break">
          <div className="max-w-4xl mx-auto">
            <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-6">
              The Lift
            </p>
            <h2 className="serif text-7xl md:text-[11rem] font-bold text-[#7f5700] leading-none mb-4">
              {fmt(impact)}
            </h2>
            <p className="uppercase tracking-widest text-xs mb-20 text-[#1c1c18]/50">
              Estimated Direct Local Economic Impact · City of Las Vegas Conservative Model
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-left">
              <ImpactBlock
                title="Casino Crossover"
                value={fmtNum(hotelCrossover)}
                caption="Attendees parked at, passed through, or returned to a Downtown casino property during the event window."
              />
              <ImpactBlock
                title="Drink Revenue"
                value={fmt(hotelCrossover * 0.5 * 12)}
                caption={`${fmtNum(Math.round(hotelCrossover * 0.5))} crossover visitors × 1 drink @ $12.`}
              />
              <ImpactBlock
                title="Gaming Revenue"
                value={fmt(hotelCrossover * 0.1 * 50)}
                caption={`${fmtNum(Math.round(hotelCrossover * 0.1))} players × $50 average gaming volume.`}
              />
            </div>
            <p className="serif italic text-sm text-[#1c1c18]/50 mt-16 max-w-xl mx-auto">
              Model excludes dining, retail, rideshare, and ancillary spend — true impact
              materially higher.
            </p>
          </div>
        </section>

        {/* 7. Social reach — inverse dark section */}
        <section className="py-24 md:py-32 px-8 md:px-20 bg-[#1c1c18] text-[#fdf9f3] recap-page-break">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.3em] text-xs text-[#c9912b] mb-6">
              The Broadcast
            </p>
            <h2 className="serif text-4xl md:text-5xl font-bold mb-16">
              Series reach &amp; engagement.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-14 md:gap-y-20 gap-x-12">
              <SocialStat
                value={`${(feedTheBlock.socialMetrics.impressions / 1000000).toFixed(1)}M`}
                label="Total Impressions"
              />
              <SocialStat
                value={fmtNum(feedTheBlock.socialMetrics.engagements)}
                label="Total Engagements"
              />
              <SocialStat
                value={`${(feedTheBlock.socialMetrics.videoViews / 1000000).toFixed(1)}M`}
                label="Video Views"
              />
              <SocialStat
                value={fmtNum(feedTheBlock.socialMetrics.newFollowers)}
                label="New Followers"
              />
              <SocialStat
                value={`${(feedTheBlock.socialMetrics.instagramImpressions / 1000).toFixed(0)}K`}
                label="Instagram Reach"
              />
              <SocialStat
                value={`${(feedTheBlock.socialMetrics.tiktokImpressions / 1000).toFixed(0)}K`}
                label="TikTok Impressions"
              />
              <SocialStat
                value={feedTheBlock.socialMetrics.tiktokEngagement}
                label="TikTok Engagement"
              />
              <SocialStat
                value={`${(feedTheBlock.socialMetrics.viralReelViews / 1000000).toFixed(1)}M`}
                label="Viral Reel Views"
              />
            </div>
          </div>
        </section>

        {/* 8. Sponsors */}
        <section className="py-24 md:py-32 px-8 md:px-20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-12 md:mb-16">
              With Gratitude
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 py-12 border-y border-[#c9912b]/40">
              {sponsors.map((s) => (
                <div
                  key={s.name}
                  className="flex flex-col items-center gap-2 min-w-[160px]"
                >
                  <span className="serif font-bold text-lg md:text-xl text-[#1c1c18]/90">
                    {s.name}
                  </span>
                  <span className="uppercase tracking-widest text-[9px] text-[#7f5700]">
                    {s.role}
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 min-w-[160px]">
                <span className="serif font-bold text-lg md:text-xl text-[#1c1c18]/90">
                  Wynn Nightlife
                </span>
                <span className="uppercase tracking-widest text-[9px] text-[#7f5700]">
                  Presenting Partner
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[160px]">
                <span className="serif font-bold text-lg md:text-xl text-[#1c1c18]/90">
                  Corner Bar Management
                </span>
                <span className="uppercase tracking-widest text-[9px] text-[#7f5700]">
                  Operating Partner
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CTA */}
        <section className="py-32 md:py-40 px-8 text-center bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="serif text-7xl md:text-9xl font-bold mb-8">Let&rsquo;s talk.</h2>
            <p className="text-[17px] text-[#1c1c18]/60 mb-12 max-w-xl mx-auto">
              Discuss the next Feed The Block activation, custom partnership options, and
              sponsorship tiers — reply directly to Mauricio.
            </p>
            <div className="mb-12">
              <p className="font-bold serif text-xl">Mauricio Morales</p>
              <p className="uppercase tracking-widest text-[10px] text-[#1c1c18]/60 mt-1">
                VP of Marketing and Events · Corner Bar Management × Wynn Nightlife
              </p>
            </div>
            <a
              className="inline-block px-10 md:px-12 py-4 md:py-5 border border-[#7f5700] text-[#7f5700] uppercase tracking-widest text-xs hover:bg-[#7f5700] hover:text-white transition-colors duration-300"
              href="mailto:partnerships@feedtheblock.com?subject=Feed%20The%20Block%20—%20Schedule%20a%20Call"
            >
              partnerships@feedtheblock.com
            </a>
          </div>
        </section>

        <footer className="w-full flex flex-col md:flex-row justify-between items-center gap-6 bg-[#fdf9f3] px-8 md:px-12 py-12 border-t border-[#c9912b]">
          <div className="serif font-bold text-[#1c1c18] text-lg">FEED THE BLOCK</div>
          <div className="serif uppercase tracking-widest text-[9px] text-[#1c1c18]/50 text-center">
            Post-event recap · {bundle.eventDay}, {bundle.eventDate} · Placer.ai verified
          </div>
          <div className="uppercase tracking-widest text-[9px] text-[#7f5700]">
            Corner Bar Management × Wynn Nightlife
          </div>
        </footer>
      </main>
    </>
  );
}

function StatRule({ value, label }: { value: string; label: string }) {
  return (
    <div className="pt-6 hairline-gold">
      <span className="block serif text-3xl md:text-4xl font-bold mb-2">{value}</span>
      <span className="uppercase tracking-widest text-[10px] text-[#1c1c18]/60">
        {label}
      </span>
    </div>
  );
}

function EventFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="pb-6 border-b border-[#c9912b]/20">
      <span className="block uppercase tracking-widest text-[10px] text-[#7f5700] mb-2">
        {label}
      </span>
      <span
        className="serif text-xl text-[#1c1c18]"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

function ImpactBlock({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="pt-6 border-t border-[#7f5700]">
      <span className="block uppercase tracking-widest text-[10px] text-[#7f5700] mb-3">
        {title}
      </span>
      <span className="block serif text-3xl md:text-4xl font-bold mb-4 text-[#1c1c18]">
        {value}
      </span>
      <p className="text-sm text-[#1c1c18]/70 leading-relaxed">{caption}</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Registered Audience — surfaced when a tickets aggregate is attached.
// ----------------------------------------------------------------------------
import type { TicketsAggregate } from "@/lib/tickets-aggregator";

function RegisteredAudienceSection({
  tickets,
  placerVisits,
}: {
  tickets: TicketsAggregate;
  placerVisits: number;
}) {
  const walkUp = placerVisits - tickets.totalOrders;
  const walkUpPct =
    tickets.totalOrders > 0 ? Math.round((walkUp / tickets.totalOrders) * 100) : 0;
  const showWalkUp = walkUp > 0 && tickets.totalOrders > 0;

  const topStates = tickets.geographic.topStates.slice(0, 8);
  const maxStateCount = topStates[0]?.count ?? 1;
  const maxAge = Math.max(...tickets.age.buckets.map((b) => b.count), 1);

  const nvPct = tickets.geographic.zipsAnalyzed
    ? (tickets.geographic.nevadaCount / tickets.geographic.zipsAnalyzed) * 100
    : 0;

  return (
    <section className="py-24 md:py-32 px-8 md:px-20 bg-[#f7f3ed] recap-page-break">
      <div className="max-w-7xl mx-auto">
        <p className="uppercase tracking-[0.3em] text-xs text-[#7f5700] mb-6">
          Registered Audience
        </p>
        <h2 className="serif text-4xl md:text-5xl font-bold mb-10 max-w-3xl">
          {fmtNum(tickets.totalOrders)} RSVPs.
          {showWalkUp && (
            <>
              {" "}
              <span className="text-[#7f5700]">+{walkUpPct}% walk-up</span>.
            </>
          )}
        </h2>
        <p className="text-[17px] text-[#1c1c18]/80 leading-[1.7] max-w-3xl mb-16">
          BLOCKPARTY.VEGAS captured {fmtNum(tickets.totalOrders)} free
          registrations in the {tickets.registrationByDay.length}-day window
          leading up to the show.{" "}
          {showWalkUp && (
            <>
              Placer.ai measured {fmtNum(placerVisits)} actual visits — a
              <span className="text-[#7f5700] font-semibold"> {walkUpPct}% walk-up beyond registered audience</span>,
              evidence that the activation pulled organic foot-traffic from the
              corridor on top of its ticketed reach.{" "}
            </>
          )}
          Demographic detail below reflects the subset of registrants who
          self-reported each field.
        </p>

        {/* Row 1: Geographic split + Top States */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start mb-20">
          {/* Geographic NV vs Other */}
          <div className="md:col-span-5">
            <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
              Origin · ZIP-code Geographic
            </p>
            <div className="serif text-7xl md:text-[8rem] font-bold text-[#1c1c18] leading-none mb-2">
              {nvPct.toFixed(0)}%
            </div>
            <p className="serif italic text-xl text-[#1c1c18]/70 mb-6">
              of registrants from Nevada
            </p>
            <div className="space-y-3">
              <Row
                label="Nevada"
                value={`${fmtNum(tickets.geographic.nevadaCount)} (${pct(
                  tickets.geographic.nevadaCount,
                  tickets.geographic.zipsAnalyzed,
                )})`}
              />
              <Row
                label="Out of state"
                value={`${fmtNum(tickets.geographic.otherCount)} (${pct(
                  tickets.geographic.otherCount,
                  tickets.geographic.zipsAnalyzed,
                )})`}
              />
              <p className="text-[11px] text-[#1c1c18]/50 italic pt-3">
                n = {fmtNum(tickets.geographic.zipsAnalyzed)} valid ZIPs of{" "}
                {fmtNum(tickets.totalOrders)} orders
              </p>
            </div>
          </div>

          {/* Top States */}
          <div className="md:col-span-6 md:col-start-7">
            <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
              Orders by State
            </p>
            <div className="space-y-3">
              {topStates.map((s) => (
                <div key={s.state}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm">
                      <span className="serif font-bold">{s.state}</span>
                    </span>
                    <span className="text-xs text-[#1c1c18]/70">
                      {fmtNum(s.count)} · {s.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#1c1c18]/10 relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#7f5700]"
                      style={{
                        width: `${(s.count / maxStateCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Gender + Age */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
          {/* Gender */}
          <div className="md:col-span-5">
            <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
              Gender · Self-reported
            </p>
            <div className="space-y-3 mb-3">
              {tickets.gender.breakdown.map((g) => (
                <div key={g.label}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm serif font-bold">{g.label}</span>
                    <span className="text-xs text-[#1c1c18]/70">
                      {fmtNum(g.count)} · {g.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#1c1c18]/10 relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#7f5700]"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#1c1c18]/50 italic">
              n = {fmtNum(tickets.gender.n)} of {fmtNum(tickets.totalOrders)}{" "}
              orders
            </p>
          </div>

          {/* Age */}
          <div className="md:col-span-6 md:col-start-7">
            <p className="uppercase tracking-[0.3em] text-[11px] text-[#7f5700] mb-4">
              Age · Self-reported · Median {tickets.age.median}
            </p>
            <div className="flex items-end gap-3 md:gap-4 h-48 border-b border-[#1c1c18]/20 mb-2">
              {tickets.age.buckets.map((b, i) => {
                const h = (b.count / maxAge) * 95;
                return (
                  <div
                    key={b.range}
                    className="flex-1 relative h-full flex flex-col justify-end"
                    title={`${b.range}: ${fmtNum(b.count)} (${b.pct.toFixed(1)}%)`}
                  >
                    <div
                      className="bg-[#7f5700] w-full"
                      style={{
                        height: `${h}%`,
                        opacity: 0.55 + (i / tickets.age.buckets.length) * 0.45,
                      }}
                    />
                    <div className="text-[9px] uppercase tracking-widest text-[#1c1c18]/60 text-center mt-2">
                      {b.range}
                    </div>
                    <div className="text-[10px] text-[#1c1c18]/80 text-center font-semibold">
                      {b.pct.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#1c1c18]/50 italic mt-6">
              n = {fmtNum(tickets.age.n)} of {fmtNum(tickets.totalOrders)} orders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-end py-3 border-b border-[#1c1c18]/10">
      <span className="text-sm serif font-bold">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function pct(num: number, denom: number): string {
  if (!denom) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
}

function SocialStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="block serif text-5xl md:text-6xl font-bold mb-4 text-[#c9912b] leading-none">
        {value}
      </span>
      <span className="uppercase tracking-widest text-[10px] text-[#fdf9f3]/60">
        {label}
      </span>
    </div>
  );
}
