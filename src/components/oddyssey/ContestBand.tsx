"use client";

/**
 * ContestBand
 *
 * Sits on the wireframe home between Events preview and About. Pairs a
 * concise "Win a Night" hook with a clear social-follow entry path
 * (the contest is the social-growth lever).
 *
 * Visually echoes the FollowBand so the two read as one connected ask:
 * follow → enter → return for tickets.
 *
 * Auto-hides when prop `active={false}` so we can drop the band on
 * any page when the contest isn't running.
 */

import Link from "next/link";

export interface ContestBandProps {
  active?: boolean;
  headline?: string;
  blurb?: string;
  cta?: string;
  href?: string;
  accent?: string;
}

export function ContestBand({
  active = true,
  headline = "Win a Night at Oddyssey",
  blurb = "Follow + tag + RSVP — entries open monthly. One winner takes home Manor + Noir for them and a plus-one.",
  cta = "Enter the Contest",
  href = "/oddyssey-manor/contest-landing",
  accent = "#e67e22",
}: ContestBandProps) {
  if (!active) return null;
  return (
    <section className="cb-band">
      <style>{`
        .cb-band {
          padding: clamp(56px, 9vw, 88px) clamp(20px, 6vw, 80px);
          background: linear-gradient(180deg, #0a0a0a 0%, #060606 100%);
          border-top: 1px solid rgba(230,126,34,0.18);
          border-bottom: 1px solid rgba(230,126,34,0.18);
          text-align: center; position: relative; overflow: hidden;
        }
        .cb-band::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 20% 100%, ${accent}1a 0%, transparent 50%),
            radial-gradient(ellipse at 80% 0%, ${accent}10 0%, transparent 55%);
          pointer-events: none;
        }
        .cb-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }
        .cb-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 10px;
          font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
          color: ${accent}; margin-bottom: 14px;
        }
        .cb-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(28px, 4vw, 44px); font-weight: 300;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #e8e4dd; margin: 0 0 14px;
        }
        .cb-blurb {
          color: #9a958d; font-size: 14px; line-height: 1.7;
          letter-spacing: 0.04em; max-width: 560px;
          margin: 0 auto 28px;
        }
        .cb-steps {
          display: flex; justify-content: center; gap: 18px;
          flex-wrap: wrap; margin-bottom: 32px;
          font-family: 'Consolas', monospace;
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #c9c4bd;
        }
        .cb-step { display: inline-flex; align-items: center; gap: 8px; }
        .cb-step-num {
          width: 22px; height: 22px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid ${accent}; color: ${accent};
          font-weight: 600;
        }
        .cb-cta {
          display: inline-block; padding: 14px 32px;
          background: ${accent}; color: #060606;
          font-family: 'Inter', sans-serif; font-size: 11px;
          font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase;
          text-decoration: none;
          transition: filter 0.3s, transform 0.3s;
        }
        .cb-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .cb-fine {
          margin-top: 14px; font-size: 10px;
          letter-spacing: 0.2px; color: #5a5650; font-style: italic;
        }
      `}</style>
      <div className="cb-inner">
        <div className="cb-eyebrow">Contest &middot; Free Entry</div>
        <h2 className="cb-title">{headline}</h2>
        <p className="cb-blurb">{blurb}</p>
        <div className="cb-steps">
          <span className="cb-step">
            <span className="cb-step-num">1</span>
            Follow @oddysseylv
          </span>
          <span className="cb-step">
            <span className="cb-step-num">2</span>
            Tag a friend
          </span>
          <span className="cb-step">
            <span className="cb-step-num">3</span>
            RSVP with email
          </span>
        </div>
        <Link href={href} className="cb-cta">
          {cta} &rarr;
        </Link>
        <div className="cb-fine">21+ &middot; Open to Las Vegas residents &middot; See rules on landing page</div>
      </div>
    </section>
  );
}
