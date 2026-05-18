"use client";

/**
 * Dynamic event-detail page. Resolves the slug against FEATURED_EVENTS
 * — every Pride / Halloween / takeover lives here without a per-event
 * file. Reuses the FollowBand + OddysseyTopNav so the chrome is
 * consistent with Manor / Noir / Private.
 *
 * If the slug doesn't resolve we show a polite "event not found"
 * card instead of throwing, so a stale link from the rail or a
 * social share never lands a 404.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { OddysseyTopNav } from "@/components/oddyssey/OddysseyTopNav";
import { FollowBand } from "@/components/oddyssey/FollowBand";
import { getFeaturedEvent } from "@/components/oddyssey/featured-events";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const event = getFeaturedEvent(slug);

  if (!event) {
    return (
      <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh" }}>
        <OddysseyTopNav active="noir" />
        <div
          style={{
            maxWidth: 720, margin: "0 auto",
            padding: "200px 24px 120px", textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10, letterSpacing: "0.3em",
              textTransform: "uppercase", color: "#c9a84c", marginBottom: 18,
            }}
          >
            Event Not Found
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 44, fontWeight: 300, letterSpacing: 1,
              margin: 0,
            }}
          >
            That show is over &mdash; or hasn&rsquo;t been announced.
          </h1>
          <p
            style={{
              color: "#9a958d", fontSize: 15, lineHeight: 1.7,
              maxWidth: 480, margin: "20px auto 32px",
            }}
          >
            Catch the next one — full Liquid Gold + Oddyssey Noir calendar lives on the flagship pages.
          </p>
          <Link
            href="/oddyssey-manor/noir"
            style={{
              display: "inline-block", padding: "14px 28px",
              background: "#b46ec8", color: "#060606", textDecoration: "none",
              fontFamily: "'Inter', sans-serif", fontSize: 11,
              fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase",
            }}
          >
            See Noir Events &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh" }}>
      <OddysseyTopNav active={event.venue === "Manor" ? "manor" : "noir"} />
      <style>{eventDetailStyles}</style>

      {/* Hero — side-by-side layout so the portrait flyer keeps its
          composition (date / tagline burned into the artwork stays
          visible) instead of being cover-cropped behind the copy. */}
      <section className="ed-hero">
        <div
          className="ed-hero-glow"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${event.accent}24 0%, transparent 60%)`,
          }}
        />
        <div className="ed-hero-grid">
          <div className="ed-hero-text">
            <div className="ed-hero-eyebrow" style={{ color: event.accent }}>
              {event.eyebrow}
            </div>
            <h1 className="ed-hero-title">{event.title}</h1>
            <div className="ed-hero-tagline">{event.tagline}</div>
            <div className="ed-hero-meta">
              <span>{event.date}</span>
              <span className="ed-sep">·</span>
              <span>Oddyssey {event.venue}</span>
              <span className="ed-sep">·</span>
              <span>10 PM &mdash; Late</span>
            </div>
            <div className="ed-hero-actions">
              {event.ticketsHref && event.ticketsHref !== "#" ? (
                <a
                  href={event.ticketsHref}
                  className="ed-btn-primary"
                  style={{ background: event.accent }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Reserve Tickets
                </a>
              ) : (
                <span
                  className="ed-btn-primary ed-btn-disabled"
                  style={{ background: event.accent }}
                  aria-disabled="true"
                >
                  Tickets Drop Soon
                </span>
              )}
              <Link href="/oddyssey-manor/noir" className="ed-btn-outline">
                All Noir Events
              </Link>
            </div>
          </div>
          {event.poster && (
            <div className="ed-hero-poster">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.poster} alt={`${event.title} flyer`} />
              <div
                className="ed-hero-poster-border"
                style={{ borderColor: `${event.accent}55` }}
              />
            </div>
          )}
        </div>
      </section>

      {/* About the night */}
      <section className="ed-section">
        <div className="ed-section-inner">
          <div className="ed-label" style={{ color: event.accent }}>About the Night</div>
          <h2 className="ed-section-title">{event.tagline}</h2>
          <p className="ed-section-body">{event.blurb}</p>
          <p className="ed-section-body">
            Programmed inside the after-dark party of a sensual, living-room maze
            centered by a pulsing dance floor. Doors at 10 PM. 21+ only. Valid ID
            required. Inside AREA15.
          </p>
        </div>
      </section>

      {/* Plan your night — practical info someone landing from a
          social share actually needs before deciding to show up.
          Generic Noir defaults; can promote to per-event data
          (doorTime, dressCode, etc.) if a future flyer warrants it. */}
      <section className="ed-section ed-section-alt">
        <div className="ed-section-inner">
          <div className="ed-label" style={{ color: event.accent }}>Plan Your Night</div>
          <h2 className="ed-section-title">Before You Come</h2>
          <div className="ed-info-grid">
            <div className="ed-info-card">
              <div className="ed-info-label" style={{ color: event.accent }}>Doors</div>
              <div className="ed-info-value">10 PM</div>
              <div className="ed-info-sub">{event.date}</div>
            </div>
            <div className="ed-info-card">
              <div className="ed-info-label" style={{ color: event.accent }}>Dress</div>
              <div className="ed-info-value">To Be Seen</div>
              <div className="ed-info-sub">No athletic wear</div>
            </div>
            <div className="ed-info-card">
              <div className="ed-info-label" style={{ color: event.accent }}>Age</div>
              <div className="ed-info-value">21+ Only</div>
              <div className="ed-info-sub">Valid ID required</div>
            </div>
            <div className="ed-info-card">
              <div className="ed-info-label" style={{ color: event.accent }}>Find Us</div>
              <div className="ed-info-value">AREA15</div>
              <div className="ed-info-sub">3215 S Rancho Dr</div>
            </div>
          </div>
          <p className="ed-note">
            Free AREA15 lot + overflow parking next door. Night-of lineup drops first on Instagram &mdash; follow @oddyssey.noir.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="ed-section">
        <div className="ed-section-inner">
          <div className="ed-label" style={{ color: event.accent }}>What to Expect</div>
          <h2 className="ed-section-title">The Night in Brief</h2>
          <ul className="ed-expect-list">
            <li><strong>10 PM</strong> — Doors open. Golden Hour begins.</li>
            <li><strong>10 PM – 12 AM</strong> — Open bar with featured pours, while supplies last.</li>
            <li><strong>12 AM</strong> — Lineup takes over. Full programming through close.</li>
            <li><strong>21+</strong> — Valid ID required at the door. Dress to be seen.</li>
          </ul>
        </div>
      </section>

      <FollowBand
        instagram="oddyssey.noir"
        instagramSecondary="oddysseylv"
        tiktok="oddysseylv"
        accent={event.accent}
        blurb={`Lineup, posters, and the night-of recap — first on Instagram for ${event.title}.`}
      />

      <footer className="ed-foot">
        <div>Oddyssey {event.venue} &middot; {event.date} &middot; AREA15 Las Vegas</div>
        <Link href="/oddyssey" className="ed-foot-link">&larr; Back to Oddyssey</Link>
      </footer>
    </div>
  );
}

const eventDetailStyles = `
.ed-hero {
  position: relative; padding: 140px clamp(20px, 6vw, 80px) 100px;
  overflow: hidden;
}
.ed-hero-glow {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
}
.ed-hero-grid {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(32px, 6vw, 72px); align-items: center;
}
.ed-hero-text { min-width: 0; }
.ed-hero-poster {
  position: relative;
  max-width: 460px; margin-left: auto; width: 100%;
}
.ed-hero-poster img {
  display: block; width: 100%; height: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6);
}
.ed-hero-poster-border {
  position: absolute; inset: -8px; border: 1px solid;
  pointer-events: none;
}
@media (max-width: 900px) {
  .ed-hero-grid { grid-template-columns: 1fr; }
  .ed-hero-poster { max-width: 360px; margin: 0 auto; }
}
.ed-hero-eyebrow {
  font-family: 'Inter', sans-serif; font-size: 10px;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  margin-bottom: 16px;
}
.ed-hero-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(40px, 7vw, 72px); font-weight: 300;
  letter-spacing: 0.04em; line-height: 1.02; margin: 0;
  color: #e8e4dd;
}
.ed-hero-tagline {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-size: clamp(18px, 2vw, 22px);
  color: rgba(232,228,221,0.82); margin: 14px 0 0;
}
.ed-hero-meta {
  margin-top: 22px;
  font-family: 'Consolas', monospace; font-size: 11px;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: #c9c4bd; display: flex; flex-wrap: wrap; gap: 10px;
}
.ed-sep { opacity: 0.55; }
.ed-hero-actions {
  display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap;
}
.ed-btn-primary {
  padding: 14px 28px;
  font-family: 'Inter', sans-serif; font-size: 11px;
  font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase;
  color: #060606; text-decoration: none;
  transition: filter 0.3s, transform 0.3s;
}
.ed-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
.ed-btn-disabled {
  display: inline-block; opacity: 0.7; cursor: default;
  filter: saturate(0.85);
}
.ed-btn-disabled:hover { transform: none; filter: saturate(0.85); }
.ed-btn-outline {
  padding: 14px 28px;
  background: transparent; border: 1px solid rgba(232,228,221,0.3);
  color: #e8e4dd; text-decoration: none;
  font-family: 'Inter', sans-serif; font-size: 11px;
  font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase;
  transition: border-color 0.3s, color 0.3s;
}
.ed-btn-outline:hover { border-color: #e8e4dd; }

.ed-section {
  padding: clamp(64px, 9vw, 120px) clamp(20px, 6vw, 80px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ed-section-alt { background: #0a0a0a; }
.ed-section-inner { max-width: 880px; margin: 0 auto; }
.ed-label {
  font-family: 'Inter', sans-serif; font-size: 10px;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  margin-bottom: 12px; text-align: center;
}
.ed-section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 3.6vw, 40px); font-weight: 300;
  letter-spacing: 0.04em; text-align: center;
  color: #e8e4dd; margin: 0 0 28px;
}
.ed-section-body {
  font-size: 15px; line-height: 1.8; color: #c9c4bd;
  text-align: center; max-width: 680px; margin: 0 auto 18px;
}
.ed-info-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: rgba(255,255,255,0.08);
}
.ed-info-card {
  background: #060606; padding: 28px 20px; text-align: center;
  display: flex; flex-direction: column; gap: 8px;
}
.ed-info-label {
  font-family: 'Inter', sans-serif; font-size: 9px;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
}
.ed-info-value {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 26px; font-weight: 300; letter-spacing: 0.04em;
  color: #e8e4dd; line-height: 1.1;
}
.ed-info-sub {
  font-size: 11px; color: #9a958d;
  letter-spacing: 0.18em; text-transform: uppercase;
}
.ed-note {
  text-align: center; margin-top: 24px;
  font-size: 12px; font-style: italic; letter-spacing: 0.3px;
  color: #9a958d;
}
.ed-expect-list {
  list-style: none; padding: 0; margin: 0; max-width: 540px; margin: 0 auto;
}
.ed-expect-list li {
  padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 14px; color: #c9c4bd; letter-spacing: 0.3px;
}
.ed-expect-list li:last-child { border-bottom: none; }
.ed-expect-list strong {
  display: inline-block; min-width: 130px;
  font-family: 'Consolas', monospace; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: #c9a84c;
}

.ed-foot {
  padding: 32px clamp(20px, 6vw, 80px); border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: #5a5650;
}
.ed-foot-link { color: #5a5650; text-decoration: none; }
.ed-foot-link:hover { color: #c9a84c; }

@media (max-width: 700px) {
  .ed-info-grid { grid-template-columns: 1fr 1fr; }
}
`;
