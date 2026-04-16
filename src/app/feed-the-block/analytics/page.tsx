"use client";

import AuthGate from "../auth-gate";
import { computeSeriesStats } from "@/data/feed-the-block/series";
import { fmt, fmtNum } from "@/lib/utils";

export default function FeedTheBlockAnalyticsPage() {
  return (
    <AuthGate>
      <SponsorView />
    </AuthGate>
  );
}

function SponsorView() {
  const series = computeSeriesStats();

  return (
    <div className="min-h-screen" style={{ background: "#0e0e0e", color: "#ffffff" }}>
      {/* Top nav */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <a href="/feed-the-block" className="flex items-center gap-3">
          <img src="/feed-the-block/img/logo-nav.png" alt="Feed The Block" className="h-10" />
        </a>
        <a
          href="mailto:events@cornerbarmgmt.com?subject=Feed%20The%20Block%20Sponsorship%20Inquiry"
          className="px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all hover:brightness-110 rounded-full"
          style={{
            fontFamily: "'Epilogue', sans-serif",
            background: "linear-gradient(to right, #ffd709, #fc0d90)",
            color: "#0e0e0e",
          }}
        >
          Request Deck
        </a>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <p
          className="text-xs uppercase tracking-[0.3em] mb-6"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
        >
          Sponsorship Brief · Placer.ai measured
        </p>
        <h1 className="ftb-headline text-5xl md:text-7xl leading-[0.95] mb-6">
          <span className="ftb-gradient">{fmtNum(series.totalVisits)}</span>
          <br />
          measured visitors
          <br />
          across {series.totalEvents} events.
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10">
          Independently verified Placer.ai foot-traffic data from the Feed The Block series —
          Downtown Las Vegas&rsquo; fastest-growing street activation, produced by Wynn Nightlife
          and Corner Bar Management.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HeroStat label="Peak YoY growth" value={series.peakYoYPct} sub={series.peakYoYEvent.headliner} />
          <HeroStat label="Avg dwell time" value={`${series.avgDwellMinutes} min`} sub="per attendee, all events" />
          <HeroStat label="NV ranking" value="#2" sub="attraction in Nevada · all 3 events" />
        </div>
      </section>

      {/* Why sponsor — 5 claims */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-12">
          Why <span className="ftb-gradient">sponsor</span> Feed The Block
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClaimCard
            num="01"
            title="Proven, growing reach"
            metric={`+${Math.round(parseFloat(series.peakYoYPct.replace(/[^\d.]/g, "")))}% YoY at peak`}
            body={`${fmtNum(series.totalVisits)} measured visitors across 3 events. Every event has ranked #2 in Nevada. Trajectory is accelerating, not tapering.`}
          />
          <ClaimCard
            num="02"
            title="The right audience"
            metric="34% Hispanic or Latino"
            body="Consistent across all 3 events (vs. 29% Nevada baseline). Median age 36, median HHI ~$69K — peak discretionary-spend window, underserved by traditional Strip activations."
          />
          <ClaimCard
            num="03"
            title="Real engagement, not a drive-by"
            metric={`${series.avgDwellMinutes} min average dwell`}
            body="Attendees stay 1h 50min on average. ~25% remain 2.5+ hours. That's a genuine brand-exposure window — not a walk-past."
          />
          <ClaimCard
            num="04"
            title="Direct spillover to sponsor products"
            metric={`${fmtNum(series.totalHotelCrossover)} casino crossovers`}
            body="50–80% of attendees parked at, passed through, or returned to a downtown casino during the event. Le Thai alone captured 27% of one event's audience. Beverage, gaming, and F&B sponsors see immediate conversion."
          />
          <ClaimCard
            num="05"
            title="Municipal-grade credibility"
            metric="$400K already closed"
            body="LVCVA and City of Las Vegas are founding sponsors. Wynn Nightlife is the operating partner. Corner Bar Management activates eight downtown venues. You're joining a validated lineup, not taking a first-mover risk."
            full
          />
        </div>
      </section>

      {/* Series performance */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
          The <span className="ftb-gradient">series</span> at a glance
        </h2>
        <p className="text-white/60 mb-10 max-w-2xl">
          Three independently measured events across three different nights of the week. The
          pattern holds regardless of day or headliner.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {series.cards.map((c) => (
            <EventCard key={c.event.id} card={c} />
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-10">
          <span className="ftb-gradient">Audience</span> profile
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AudienceStat value="36" label="Median age" sub="Peak discretionary spend" />
          <AudienceStat value="34%" label="Hispanic / Latino" sub="+5pts above NV baseline" />
          <AudienceStat value="$69K" label="Median HHI" sub="Strong middle-market power" />
          <AudienceStat value={`${series.avgDwellMinutes}m`} label="Avg dwell" sub="2-hour exposure window" />
        </div>
        <div className="ftb-glass rounded-2xl p-6 mt-8">
          <p className="text-sm text-white/70">
            Audience composition is <span className="text-white font-semibold">consistent across all three events</span>,
            regardless of headliner or night of week. That means a sponsorship isn&rsquo;t a bet
            on one artist — it&rsquo;s a repeatable reach pattern Downtown Vegas cannot get from
            the Strip.
          </p>
        </div>
      </section>

      {/* Economic impact */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
          <span className="ftb-gradient">Economic</span> impact
        </h2>
        <p className="text-white/60 mb-10 max-w-2xl">
          Conservative model from City of Las Vegas: 50% of casino-crossover attendees buy 1 drink
          @ $12, 10% drop $50 in gaming. Excludes dining, retail, rideshare, and ancillary spend.
        </p>
        <div className="ftb-glass rounded-2xl p-8 mb-6">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4 text-white/60"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            Total across 3 measured events
          </p>
          <p className="ftb-headline text-6xl md:text-8xl">
            <span className="ftb-gradient">{fmt(series.totalEstimatedImpact)}</span>
          </p>
          <p className="text-white/50 text-sm mt-4">
            From {fmtNum(series.totalHotelCrossover)} hotel-casino visit attributions alone. True
            impact — including dining, rideshare, late-night retail — is materially higher.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {series.cards.map((c) => (
            <div key={c.event.id} className="ftb-glass rounded-xl p-5">
              <p
                className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1"
                style={{ fontFamily: "'Epilogue', sans-serif" }}
              >
                {c.event.headliner} · {c.event.eventDay}
              </p>
              <p className="ftb-headline text-3xl">
                <span className="ftb-gradient">{fmt(c.estimatedImpact)}</span>
              </p>
              <p className="text-white/50 text-xs mt-1">
                {fmtNum(c.hotelCrossover)} casino crossovers
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* District spillover */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
          <span className="ftb-gradient">District</span> spillover proof
        </h2>
        <p className="text-white/60 mb-10 max-w-2xl">
          Placer tracked where attendees went before and after the event. The same places fill up,
          every time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BigStat
            huge="27%"
            title="Le Thai capture"
            body="Le Thai alone captured 27% of Major Lazer attendees — 4,000+ same-night dining visits from a single event."
          />
          <BigStat
            huge="2/3"
            title="Downtown casino crossover"
            body="Roughly two-thirds of every event's audience appears inside a downtown casino property during the event window."
          />
          <BigStat
            huge="20%+"
            title="El Cortez anchor"
            body="El Cortez is the #1 hotel origin at 15–27% across events — repeated, predictable hospitality-sector lift."
          />
        </div>
      </section>

      {/* Partners */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-10">
          <span className="ftb-gradient">Partners</span> already in
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PartnerCard
            status="Closed"
            name="LVCVA"
            role="Municipal / Tourism"
            amount="$200K"
          />
          <PartnerCard
            status="Closed"
            name="City of Las Vegas"
            role="Municipal / Government"
            amount="$200K"
          />
          <PartnerCard status="Operating" name="Wynn Nightlife" role="Presenting partner" />
          <PartnerCard status="Operating" name="Corner Bar Management" role="8 downtown venues" />
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="ftb-headline text-3xl md:text-5xl mb-4">
          <span className="ftb-gradient">Sponsorship</span> tiers
        </h2>
        <p className="text-white/60 mb-10 max-w-2xl">
          Beverage, energy, lifestyle, and tech categories are all open. First-mover in any
          category locks exclusivity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TierCard
            tier="Presenting"
            price="$500K"
            tagline="Name-in-title · full series"
            featured
          />
          <TierCard tier="Headline" price="$250K" tagline="Category exclusivity" />
          <TierCard tier="Supporting" price="$100K" tagline="Bar menu + 3 events" />
          <TierCard tier="Activation" price="$40K" tagline="Pop-up booth · per event" />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center">
          <h2 className="ftb-headline text-4xl md:text-6xl mb-6">
            Request the <span className="ftb-gradient">full deck</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-10">
            Full sponsorship deck, custom proposal, and call scheduling — reach out directly.
          </p>
          <a
            href="mailto:events@cornerbarmgmt.com?subject=Feed%20The%20Block%20Sponsorship%20Inquiry&body=I'd%20like%20to%20receive%20the%20Feed%20The%20Block%20sponsorship%20deck%20and%20discuss%20partnership%20options."
            className="inline-block px-10 py-4 text-sm uppercase tracking-widest font-bold transition-all hover:brightness-110 active:scale-95 rounded-full"
            style={{
              fontFamily: "'Epilogue', sans-serif",
              background: "linear-gradient(to right, #ffd709, #fc0d90)",
              color: "#0e0e0e",
            }}
          >
            events@cornerbarmgmt.com
          </a>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-white/10 text-center text-xs text-white/40">
        Data source · Placer.ai location intelligence · {series.totalEvents}-event series
        ({series.cards[series.cards.length - 1].event.eventDate}
        {" → "}
        {series.cards[0].event.eventDate}). Numbers update as additional events are added.
      </footer>
    </div>
  );
}

// ============================================================================
// UI pieces
// ============================================================================

function HeroStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="ftb-glass rounded-xl p-5">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
      <p className="ftb-headline text-3xl md:text-4xl">
        <span className="ftb-gradient">{value}</span>
      </p>
      <p className="text-white/50 text-xs mt-1">{sub}</p>
    </div>
  );
}

function ClaimCard({
  num,
  title,
  metric,
  body,
  full,
}: {
  num: string;
  title: string;
  metric: string;
  body: string;
  full?: boolean;
}) {
  return (
    <div className={`ftb-glass rounded-2xl p-8 ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-baseline gap-4 mb-4">
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
        >
          {num}
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
      </div>
      <p className="ftb-headline text-3xl md:text-4xl mb-4">
        <span className="ftb-gradient">{metric}</span>
      </p>
      <p className="text-white/70 leading-relaxed">{body}</p>
    </div>
  );
}

function EventCard({
  card,
}: {
  card: ReturnType<typeof computeSeriesStats>["cards"][number];
}) {
  const { event, visits, dwellMinutes, yoy, hotelCrossover } = card;
  return (
    <div className="ftb-glass rounded-2xl p-6 ftb-glow transition-shadow">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {event.eventDay} · {event.eventDate}
      </p>
      <h3 className="ftb-headline text-3xl mb-4">
        <span className="ftb-gradient">{event.headliner}</span>
      </h3>
      <div className="space-y-3 text-sm">
        <Row k="Measured visits" v={fmtNum(visits)} />
        <Row k="Avg dwell" v={dwellMinutes > 0 ? `${dwellMinutes} min` : "—"} />
        <Row k="YoY growth" v={yoy} />
        <Row k="Casino crossover" v={fmtNum(hotelCrossover)} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
      <span className="text-white/50 text-xs uppercase tracking-wider">{k}</span>
      <span className="text-white font-mono font-bold">{v}</span>
    </div>
  );
}

function AudienceStat({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="ftb-glass rounded-xl p-5 text-center">
      <p className="ftb-headline text-4xl md:text-5xl mb-2">
        <span className="ftb-gradient">{value}</span>
      </p>
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-white mb-1"
        style={{ fontFamily: "'Epilogue', sans-serif" }}
      >
        {label}
      </p>
      <p className="text-white/40 text-xs">{sub}</p>
    </div>
  );
}

function BigStat({
  huge,
  title,
  body,
}: {
  huge: string;
  title: string;
  body: string;
}) {
  return (
    <div className="ftb-glass rounded-2xl p-8">
      <p className="ftb-headline text-5xl md:text-6xl mb-4">
        <span className="ftb-gradient">{huge}</span>
      </p>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function PartnerCard({
  status,
  name,
  role,
  amount,
}: {
  status: string;
  name: string;
  role: string;
  amount?: string;
}) {
  return (
    <div className="ftb-glass rounded-2xl p-6 flex justify-between items-center">
      <div>
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-2"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ffd709" }}
        >
          {status}
        </p>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-white/60 text-sm mt-1">{role}</p>
      </div>
      {amount && (
        <p className="ftb-headline text-3xl">
          <span className="ftb-gradient">{amount}</span>
        </p>
      )}
    </div>
  );
}

function TierCard({
  tier,
  price,
  tagline,
  featured,
}: {
  tier: string;
  price: string;
  tagline: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`ftb-glass rounded-2xl p-6 transition-shadow ftb-glow ${
        featured ? "ring-1 ring-[#fc0d90]/40" : ""
      }`}
    >
      {featured && (
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-3"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
        >
          Flagship
        </p>
      )}
      <h3 className="text-lg font-bold text-white mb-2">{tier}</h3>
      <p className="ftb-headline text-3xl mb-3">
        <span className="ftb-gradient">{price}</span>
      </p>
      <p className="text-white/50 text-xs leading-relaxed">{tagline}</p>
    </div>
  );
}
