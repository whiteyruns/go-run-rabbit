"use client";

/**
 * FeaturedEventRail
 *
 * Renders the upcoming special-event card(s) directly above an Events
 * Calendar. Pulls data from src/components/oddyssey/featured-events.ts
 * — one entry per upcoming special, rendered as a big horizontal card
 * with poster, theme name, date, and Reserve CTA.
 *
 * Auto-hides when the FEATURED_EVENTS list is empty / nothing upcoming.
 *
 * Mounted on /oddyssey (wireframe home, gold accent context) and on
 * /oddyssey-manor/noir (purple accent context). The `align` prop is
 * presentational only — the rail itself is structurally identical
 * across pages so the brand reads consistent.
 */

import Link from "next/link";
import Image from "next/image";
import { upcomingFeaturedEvents, type FeaturedEvent } from "./featured-events";

export interface FeaturedEventRailProps {
  // Page-level accent (gold #c9a84c on home, purple #b46ec8 on Noir).
  // The card's own `accent` from data overrides for its stripe color.
  pageAccent?: string;
  // Header eyebrow + h2 — pages can customize the framing.
  eyebrow?: string;
  heading?: string;
  // Cap how many events show (default all upcoming).
  limit?: number;
}

export function FeaturedEventRail({
  pageAccent = "#c9a84c",
  eyebrow = "Featured",
  heading = "Special Events",
  limit,
}: FeaturedEventRailProps) {
  const events = upcomingFeaturedEvents();
  const visible = limit != null ? events.slice(0, limit) : events;
  if (visible.length === 0) return null;

  return (
    <section className="fer-section">
      <style>{railStyles}</style>
      <div className="fer-head">
        <div className="fer-eyebrow" style={{ color: pageAccent }}>
          {eyebrow}
        </div>
        <h2 className="fer-heading">{heading}</h2>
      </div>
      <div className="fer-cards">
        {visible.map((e) => (
          <FeaturedEventCard key={e.slug} event={e} />
        ))}
      </div>
    </section>
  );
}

function FeaturedEventCard({ event }: { event: FeaturedEvent }) {
  const accent = event.accent;
  return (
    <Link href={`/oddyssey-manor/events/${event.slug}`} className="fer-card">
      <div className="fer-card-stripe" style={{ background: accent }} />
      {event.poster && (
        <div className="fer-card-poster">
          <Image
            src={event.poster}
            alt={`${event.title} flyer`}
            fill
            sizes="180px"
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
          />
        </div>
      )}
      <div className="fer-card-body">
        <div className="fer-card-eyebrow" style={{ color: accent }}>
          {event.eyebrow}
        </div>
        <h3 className="fer-card-title">{event.title}</h3>
        <div className="fer-card-tagline">{event.tagline}</div>
        <p className="fer-card-blurb">{event.blurb}</p>
        <div className="fer-card-meta">
          <span className="fer-card-date">{event.date}</span>
          <span className="fer-card-sep">·</span>
          <span className="fer-card-venue">Oddyssey {event.venue}</span>
        </div>
      </div>
      <div className="fer-card-cta" style={{ background: accent }}>
        <span>Open Event &rarr;</span>
      </div>
    </Link>
  );
}

const railStyles = `
.fer-section {
  padding: clamp(56px, 9vw, 96px) clamp(20px, 6vw, 80px);
  background: var(--bg, #060606);
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fer-head { text-align: center; margin-bottom: 36px; }
.fer-eyebrow {
  font-family: 'Inter', sans-serif; font-size: 10px;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  margin-bottom: 14px;
}
.fer-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 4vw, 44px); font-weight: 300;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #e8e4dd; margin: 0;
}
.fer-cards {
  display: grid; gap: 24px;
  max-width: 1100px; margin: 0 auto;
}
.fer-card {
  position: relative; display: grid;
  grid-template-columns: 180px 1fr auto;
  align-items: stretch;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.08);
  text-decoration: none; color: inherit;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s;
}
.fer-card:hover {
  transform: translateY(-2px);
  border-color: rgba(232,228,221,0.18);
}
.fer-card-stripe {
  position: absolute; top: 0; left: 0; bottom: 0; width: 3px; z-index: 2;
}
.fer-card-poster {
  position: relative;
  background: #060606;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.fer-card-poster img {
  display: block; width: 100%; height: 100%;
  object-fit: cover; object-position: center 35%;
}
.fer-card-body {
  position: relative; z-index: 1;
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 10px;
  justify-content: center;
}
.fer-card-eyebrow {
  font-size: 10px; font-weight: 500; letter-spacing: 0.32em;
  text-transform: uppercase;
}
.fer-card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 3.4vw, 40px); font-weight: 300;
  letter-spacing: 0.04em; line-height: 1.05;
  color: #e8e4dd; margin: 4px 0 0;
}
.fer-card-tagline {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-size: 16px;
  color: rgba(232,228,221,0.78); margin-bottom: 6px;
}
.fer-card-blurb {
  font-size: 13px; line-height: 1.65; color: #9a958d;
  max-width: 560px; margin: 0;
}
.fer-card-meta {
  font-family: 'Consolas', monospace; font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: #9a958d; margin-top: 8px; display: flex; gap: 10px;
}
.fer-card-sep { opacity: 0.5; }
.fer-card-cta {
  position: relative; z-index: 1;
  display: flex; align-items: center; padding: 0 28px;
  font-family: 'Inter', sans-serif; font-size: 10px;
  font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase;
  color: #060606; white-space: nowrap;
  transition: filter 0.3s;
}
.fer-card:hover .fer-card-cta { filter: brightness(1.08); }

@media (max-width: 720px) {
  .fer-card { grid-template-columns: 1fr; }
  .fer-card-poster { height: 160px; }
  .fer-card-poster img { object-position: center 30%; }
  .fer-card-body { padding: 28px 24px; }
  .fer-card-cta { padding: 14px 24px; justify-content: center; }
}
`;
