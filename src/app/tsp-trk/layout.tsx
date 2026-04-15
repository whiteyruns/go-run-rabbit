import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TSP TRK 2026 — Team Portal",
  description: "TSP TRK 2026 — Internal team portal for The Speed Project track meet.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "TSP TRK 2026 — Team Portal",
    description: "Internal team portal. Restricted access.",
    type: "website",
  },
};

export default function TspTrkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} tsp-trk-scope`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .tsp-trk-scope {
          --bg: #0a0a0a;
          --ink: #f5f1e8;
          --rust: #c5532a;
          --dust: #a8957c;
          --line: #2a2a2a;
          --card: #131313;
          --card-alt: #1c1b1b;
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          line-height: 1.5;
          min-height: 100vh;
        }
        .tsp-trk-scope * { box-sizing: border-box; }
        .tsp-trk-scope img { max-width: 100%; display: block; }
        .tsp-trk-scope a { color: inherit; text-decoration: none; }
        .tsp-trk-scope ::selection {
          background: var(--rust);
          color: #fff;
        }

        .display {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: .02em;
          line-height: .92;
        }

        /* eyebrow */
        .eyebrow {
          font-size: 12px;
          letter-spacing: .32em;
          text-transform: uppercase;
          color: var(--dust);
          margin-bottom: 32px;
        }
        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--rust);
          border-radius: 50%;
          margin: 0 10px 2px;
          vertical-align: middle;
        }

        /* cta buttons */
        .cta {
          display: inline-block;
          padding: 14px 22px;
          border: 1px solid var(--ink);
          font-size: 12px;
          letter-spacing: .22em;
          text-transform: uppercase;
          transition: all .2s;
          cursor: pointer;
          font-family: var(--font-inter), 'Inter', sans-serif;
        }
        .cta:hover { background: var(--ink); color: var(--bg); }
        .cta.rust { background: var(--rust); border-color: var(--rust); color: #fff; }
        .cta.rust:hover { background: #fff; color: var(--bg); }

        /* gate */
        .gate {
          position: fixed;
          inset: 0;
          background: var(--bg);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }
        .gate-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 30%, #1a1410 0%, transparent 60%),
            radial-gradient(ellipse at 50% 90%, #2a1a10 0%, transparent 50%);
          pointer-events: none;
        }
        .gate-inner { position: relative; z-index: 1; max-width: 480px; width: 100%; }
        .gate-logo { height: 42px; margin: 0 auto 56px; opacity: .95; }
        .gate-title {
          font-size: clamp(48px, 9vw, 96px);
          margin-bottom: 16px;
        }
        .gate-title span { color: var(--rust); display: block; }
        .gate-desc {
          color: var(--dust);
          font-size: 14px;
          letter-spacing: .04em;
          margin-bottom: 48px;
        }
        .gate-form {
          display: flex;
          gap: 0;
          border: 1px solid var(--ink);
          max-width: 380px;
          margin: 0 auto;
        }
        .gate-input {
          flex: 1;
          background: transparent;
          border: 0;
          color: var(--ink);
          padding: 18px 20px;
          font-family: inherit;
          font-size: 14px;
          letter-spacing: .18em;
          text-transform: uppercase;
          outline: none;
        }
        .gate-input::placeholder { color: #444; letter-spacing: .18em; }
        .gate-btn {
          background: var(--ink);
          color: var(--bg);
          border: 0;
          padding: 0 24px;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: .22em;
          text-transform: uppercase;
          cursor: pointer;
          font-weight: 500;
        }
        .gate-btn:hover { background: var(--rust); color: #fff; }
        .gate-err {
          color: var(--rust);
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          margin-top: 24px;
          min-height: 14px;
          opacity: 0;
          transition: opacity .2s;
        }
        .gate-err.show { opacity: 1; }
        .gate-footnote {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          font-size: 10px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: #3a3a3a;
          text-align: center;
        }

        /* nav */
        .tsp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 64px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(180deg, rgba(10,10,10,.9) 0%, transparent 100%);
        }
        .tsp-nav .nav-brand {
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: .05em;
          color: var(--ink);
        }
        .tsp-nav ul {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .tsp-nav ul a {
          font-family: 'Anton', sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .02em;
          opacity: .7;
          transition: opacity .2s, color .2s;
          padding-bottom: 4px;
          border-bottom: 2px solid transparent;
        }
        .tsp-nav ul a:hover,
        .tsp-nav ul a.active {
          opacity: 1;
          color: var(--rust);
          border-bottom-color: var(--rust);
        }
        .tsp-nav .cta { padding: 10px 18px; font-size: 11px; }

        /* hero */
        .tsp-hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          overflow: hidden;
        }
        .hero-bg-image {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .hero-bg-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          opacity: .3;
          filter: grayscale(100%) contrast(1.2);
        }
        .hero-bg-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, transparent 50%, var(--bg) 100%);
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 960px;
          padding: 0 28px;
        }
        .hero-eyebrow {
          font-size: 13px;
          letter-spacing: .4em;
          text-transform: uppercase;
          color: var(--dust);
          margin-bottom: 40px;
        }
        .hero-title {
          font-size: clamp(64px, 12vw, 180px);
          margin-bottom: 48px;
        }
        .hero-title span { display: block; color: var(--rust); }
        .hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          padding: 24px 64px;
          border-top: 1px solid var(--line);
          font-size: 13px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--dust);
          background: rgba(10,10,10,.6);
        }
        .hero-meta b {
          display: block;
          color: var(--ink);
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 11px;
          letter-spacing: .22em;
        }

        /* container */
        .tsp-container { max-width: 1280px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }

        /* manifesto */
        .manifesto {
          padding: 192px 0;
          text-align: center;
        }
        .manifesto h2 { font-size: clamp(56px, 8rem, 128px); }
        .manifesto h2 span { color: var(--rust); }
        .manifesto p {
          max-width: 768px;
          margin: 48px auto 0;
          font-size: 20px;
          line-height: 1.8;
          color: var(--dust);
        }

        /* sections */
        .tsp-section { padding: 120px 0; }
        .section-head {
          display: flex;
          align-items: baseline;
          gap: 32px;
          margin-bottom: 72px;
        }
        .section-head .num {
          font-family: 'Anton', sans-serif;
          font-size: clamp(80px, 10rem, 160px);
          color: var(--rust);
          line-height: .8;
        }
        .section-head h2 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(40px, 5vw, 72px);
          text-transform: uppercase;
          letter-spacing: .01em;
          line-height: .95;
        }

        /* what cards (01 — The Meet) */
        .what-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
        }
        .what-card {
          background: var(--card);
          padding: 48px;
        }
        .what-card:first-child { border-left: 4px solid var(--rust); }
        .what-card-eyebrow {
          font-size: 11px;
          letter-spacing: .32em;
          text-transform: uppercase;
          color: var(--dust);
          margin-bottom: 20px;
        }
        .what-card h3 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(24px, 3vw, 32px);
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: .02em;
          line-height: 1;
        }
        .what-card p { color: var(--dust); font-size: 14px; line-height: 1.7; }

        /* schedule (02) */
        .schedule-rows {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .schedule-row {
          display: grid;
          grid-template-columns: 160px 140px 1fr 1fr;
          gap: 0;
          padding: 48px 32px;
          background: var(--card);
          transition: background .2s;
        }
        .schedule-row:hover { background: var(--card-alt); }
        .schedule-row.ultra-row { color: var(--rust); }
        .schedule-date {
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: .02em;
        }
        .schedule-type {
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--dust);
          padding-top: 4px;
        }
        .schedule-desc {
          font-size: 15px;
          color: var(--ink);
          grid-column: span 2;
          line-height: 1.6;
        }
        .ultra-row .schedule-desc { color: var(--rust); }

        /* format / events (03) */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
        }
        .event-tile {
          aspect-ratio: 1;
          background: var(--card);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: background .3s;
        }
        .event-tile .dist {
          font-family: 'Anton', sans-serif;
          font-size: clamp(48px, 6vw, 72px);
          color: var(--dust);
          line-height: 1;
          transition: color .3s;
        }
        .event-tile:hover .dist { color: var(--ink); }
        .event-tile .type {
          font-size: 11px;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: var(--dust);
          margin-top: 12px;
        }
        .event-tile.ultra-tile {
          background: var(--rust);
        }
        .event-tile.ultra-tile .dist { color: #fff; }
        .event-tile.ultra-tile .type { color: rgba(255,255,255,.7); }
        .event-tile.ultra-tile:hover {
          background: var(--ink);
        }
        .event-tile.ultra-tile:hover .dist { color: var(--rust); }
        .event-tile.ultra-tile:hover .type { color: var(--rust); }

        /* photo strips */
        .photo-strip {
          display: grid;
          gap: 2px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .photo-strip-3 { grid-template-columns: 1fr 1fr 1fr; }
        .photo-strip-3 img {
          width: 100%;
          height: 600px;
          object-fit: cover;
          filter: grayscale(100%);
          transition: filter 500ms ease;
        }
        .photo-strip-3 img:hover { filter: grayscale(0%); }
        .photo-strip-2 { grid-template-columns: 1fr 1fr; }
        .photo-strip-2 .photo-wrap {
          position: relative;
          overflow: hidden;
        }
        .photo-strip-2 .photo-wrap img {
          width: 100%;
          height: 700px;
          object-fit: cover;
          filter: grayscale(100%);
          transition: filter 500ms ease;
        }
        .photo-strip-2 .photo-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.4);
          transition: opacity 500ms ease;
          pointer-events: none;
        }
        .photo-strip-2 .photo-wrap:hover img { filter: grayscale(0%); }
        .photo-strip-2 .photo-wrap:hover::after { opacity: 0; }

        /* full bleed image break */
        .full-bleed-image {
          width: 100%;
          overflow: hidden;
          position: relative;
          height: 800px;
        }
        .full-bleed-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: grayscale(100%);
        }
        .full-bleed-image::before,
        .full-bleed-image::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 200px;
          z-index: 1;
        }
        .full-bleed-image::before {
          top: 0;
          background: linear-gradient(180deg, var(--bg), transparent);
        }
        .full-bleed-image::after {
          bottom: 0;
          background: linear-gradient(0deg, var(--bg), transparent);
        }

        /* site plan section (04) */
        .site-plan-map-wrap {
          background: var(--card-alt);
          padding: 48px;
          aspect-ratio: 16/9;
          border: 1px solid var(--line);
        }
        .site-plan-svg {
          width: 100%;
          height: 100%;
        }
        .site-plan-stats {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          border-top: 1px solid var(--line);
          padding-top: 64px;
          margin-top: 64px;
        }
        .stat { text-align: center; flex: 1; }
        .stat-label {
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--dust);
          margin-bottom: 12px;
        }
        .stat-num {
          font-family: 'Anton', sans-serif;
          font-size: clamp(24px, 3vw, 32px);
          color: var(--ink);
          line-height: 1;
        }

        /* pulse animation for map dots */
        @keyframes pulse {
          0%, 100% { opacity: .6; r: 3; }
          50% { opacity: 1; r: 5; }
        }
        .pulse-dot { animation: pulse 3s ease-in-out infinite; }

        /* location (05) */
        .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .location-copy h3 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(36px, 4vw, 56px);
          text-transform: uppercase;
          line-height: .95;
          margin-bottom: 24px;
        }
        .location-copy h3 span { color: var(--rust); display: block; }
        .location-copy p {
          color: var(--dust);
          font-size: 20px;
          line-height: 1.7;
          margin-bottom: 16px;
          font-weight: 300;
        }
        .coords {
          background: var(--card);
          border: 1px solid var(--line);
          padding: 20px 24px;
          margin-top: 32px;
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          color: var(--ink);
          letter-spacing: .05em;
        }
        .location-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
        }
        .detail-card {
          aspect-ratio: 1;
          background: var(--card-alt);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .detail-card h4 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(20px, 2vw, 28px);
          text-transform: uppercase;
          letter-spacing: .02em;
          line-height: 1.1;
        }
        .detail-card p {
          font-size: 14px;
          color: var(--dust);
          line-height: 1.6;
        }

        /* grain overlay */
        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* responsive */
        @media (max-width: 900px) {
          .tsp-nav { padding: 16px 24px; }
          .tsp-nav ul { display: none; }
          .what-grid { grid-template-columns: 1fr; }
          .events-grid { grid-template-columns: repeat(2, 1fr); }
          .event-tile { aspect-ratio: auto; padding: 32px; }
          .location-grid { grid-template-columns: 1fr; gap: 48px; }
          .location-details { grid-template-columns: 1fr 1fr; }
          .detail-card { aspect-ratio: auto; padding: 24px; }
          .schedule-row { grid-template-columns: 1fr; gap: 8px; padding: 24px 20px; }
          .schedule-desc { grid-column: span 1; }
          .section-head .num { font-size: clamp(48px, 8vw, 80px); }
          .hero-meta { padding: 16px 24px; gap: 16px; }
          .photo-strip { grid-template-columns: 1fr !important; }
          .photo-strip-3 img { height: 300px; }
          .photo-strip-2 .photo-wrap img { height: 400px; }
          .full-bleed-image { height: 400px; }
          .site-plan-map-wrap { padding: 16px; aspect-ratio: auto; }
          .site-plan-svg { aspect-ratio: 4/3; height: auto; }
          .site-plan-stats { flex-wrap: wrap; gap: 24px; }
          .stat { flex: 0 0 calc(33% - 16px); }
        }
        @media (max-width: 600px) {
          .events-grid { grid-template-columns: repeat(2, 1fr); }
          .location-details { grid-template-columns: 1fr; }
          .stat { flex: 0 0 calc(50% - 12px); }
          .hero-title { font-size: clamp(48px, 12vw, 180px); }
          .manifesto h2 { font-size: clamp(40px, 12vw, 128px); }
        }
      `}</style>
      {children}
    </div>
  );
}
