"use client";

/**
 * Drop-in "Follow Oddyssey" band — sits above the footer on each
 * wireframe page (Content / Manor / Noir).
 *
 * Each page passes its own primary Instagram handle:
 *   - Umbrella site: @oddysseylv
 *   - Manor:          @oddyssey.manor
 *   - Noir:           @oddyssey.noir
 * TikTok is umbrella-only (@oddysseylv) — same handle everywhere.
 *
 * Accent color cycles by page (gold on umbrella + Manor, purple on
 * Noir) so the band reads as native to the page it's on while staying
 * structurally identical across the wireframe.
 */

import React from "react";

export interface FollowBandProps {
  // IG handle without the leading "@" (e.g. "oddyssey.noir").
  instagram: string;
  // Optional secondary handle to highlight (e.g. Manor + Noir both
  // mention @oddysseylv as the umbrella).
  instagramSecondary?: string;
  // TikTok handle without the leading "@".
  tiktok?: string;
  accent?: string;
  // Short, one-line caption shown above the handles.
  blurb?: string;
}

export function FollowBand({
  instagram,
  instagramSecondary,
  tiktok = "oddysseylv",
  accent = "#c9a84c",
  blurb = "DJ lineups, weekly drops, behind-the-scenes — first on social.",
}: FollowBandProps) {
  return (
    <section
      style={{
        padding: "clamp(56px, 9vw, 96px) clamp(20px, 6vw, 80px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "#0a0a0a",
        textAlign: "center",
      }}
    >
      <style>{`
        .fb-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px;
          background: transparent; border: 1px solid ${accent};
          color: #e8e4dd; text-decoration: none;
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          transition: background 0.3s, color 0.3s, transform 0.3s;
          cursor: pointer;
        }
        .fb-cta-btn:hover { background: ${accent}; color: #060606; transform: translateY(-1px); }
        .fb-cta-icon { width: 14px; height: 14px; }
        .fb-secondary {
          display: inline-flex; gap: 18px; align-items: center; flex-wrap: wrap;
          justify-content: center; margin-top: 18px;
        }
        .fb-secondary a {
          color: #9a958d; text-decoration: none;
          font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
          transition: color 0.3s;
        }
        .fb-secondary a:hover { color: ${accent}; }
        .fb-handle-strong { color: ${accent}; font-weight: 500; }
      `}</style>
      <div
        style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase",
          color: accent, marginBottom: 14,
        }}
      >
        Follow Oddyssey
      </div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: "#e8e4dd", margin: "0 0 12px",
        }}
      >
        @<span className="fb-handle-strong">{instagram}</span>
      </h2>
      <p
        style={{
          color: "#9a958d", fontSize: 14, letterSpacing: "0.04em",
          lineHeight: 1.6, maxWidth: 560, margin: "0 auto 28px",
        }}
      >
        {blurb}
      </p>
      <a
        href={`https://www.instagram.com/${instagram}/`}
        target="_blank" rel="noopener noreferrer"
        className="fb-cta-btn"
      >
        <svg
          className="fb-cta-icon" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
        Open Instagram
      </a>
      <div className="fb-secondary">
        {instagramSecondary && (
          <a
            href={`https://www.instagram.com/${instagramSecondary}/`}
            target="_blank" rel="noopener noreferrer"
          >
            @{instagramSecondary}
          </a>
        )}
        {tiktok && (
          <a
            href={`https://www.tiktok.com/@${tiktok}`}
            target="_blank" rel="noopener noreferrer"
          >
            TikTok @{tiktok}
          </a>
        )}
      </div>
    </section>
  );
}
