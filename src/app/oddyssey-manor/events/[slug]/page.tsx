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

      {/* Hero with accent stripe + poster */}
      <section className="ed-hero">
        <div
          className="ed-hero-bg"
          style={
            event.poster
              ? {
                  backgroundImage:
                    `linear-gradient(180deg, rgba(6,6,6,0.6) 0%, rgba(6,6,6,0.78) 50%, rgba(6,6,6,0.96) 100%), url('${event.poster}')`,
                }
              : undefined
          }
        />
        <div className="ed-hero-content">
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
            <a
              href={event.ticketsHref ?? "#"}
              className="ed-btn-primary"
              style={{ background: event.accent }}
            >
              Reserve Tickets
            </a>
            <Link href="/oddyssey-manor/noir" className="ed-btn-outline">
              All Noir Events
            </Link>
          </div>
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

      {/* Lineup placeholder */}
      <section className="ed-section ed-section-alt">
        <div className="ed-section-inner">
          <div className="ed-label" style={{ color: event.accent }}>Lineup</div>
          <h2 className="ed-section-title">Talent &amp; Performers</h2>
          <div className="ed-lineup-grid">
            {["Headline DJ", "Support", "Performers", "Hosts"].map((slot) => (
              <div key={slot} className="ed-lineup-card">
                <div className="ed-lineup-slot" style={{ color: event.accent }}>{slot}</div>
                <div className="ed-lineup-name">TBA</div>
              </div>
            ))}
          </div>
          <p className="ed-note">Lineup announcements first on Instagram &mdash; follow @oddyssey.noir.</p>
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
  position: relative; min-height: 70vh; padding: 120px clamp(20px, 6vw, 80px) 80px;
  display: flex; align-items: flex-end; overflow: hidden;
}
.ed-hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(180deg, #060606 0%, rgba(6,6,6,0.85) 50%, #060606 100%);
  background-size: cover; background-position: center;
}
.ed-hero-content { position: relative; z-index: 1; max-width: 760px; }
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
.ed-lineup-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: rgba(255,255,255,0.06);
}
.ed-lineup-card {
  background: #060606; padding: 28px 22px; text-align: center;
}
.ed-lineup-slot {
  font-family: 'Inter', sans-serif; font-size: 9px;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  margin-bottom: 10px;
}
.ed-lineup-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px; font-weight: 400; letter-spacing: 1px;
  color: #e8e4dd;
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
  .ed-lineup-grid { grid-template-columns: 1fr 1fr; }
}
`;
