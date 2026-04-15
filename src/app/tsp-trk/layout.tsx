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
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tsp-nav .logo { height: 34px; opacity: .95; }
        .tsp-nav ul { display: flex; gap: 28px; list-style: none; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; margin: 0; padding: 0; }
        .tsp-nav a { opacity: .75; transition: opacity .2s; }
        .tsp-nav a:hover { opacity: 1; }

        /* hero */
        .tsp-hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 120px 0 80px;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 20% 10%, #1a1410 0%, transparent 60%),
            radial-gradient(ellipse at 90% 90%, #2a1a10 0%, transparent 50%),
            var(--bg);
        }
        .tsp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,.012) 2px 3px);
          pointer-events: none;
        }
        .hero-title { font-size: clamp(64px, 12vw, 200px); margin-bottom: 24px; }
        .hero-title span { display: block; color: var(--rust); }
        .hero-meta {
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--line);
          font-size: 13px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .hero-meta b {
          display: block;
          color: var(--ink);
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 11px;
          letter-spacing: .22em;
        }
        .hero-cta { margin-top: 48px; display: flex; gap: 16px; flex-wrap: wrap; }

        /* container */
        .tsp-container { max-width: 1280px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }

        /* manifesto */
        .manifesto {
          padding: 160px 0;
          text-align: center;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .manifesto h2 { font-size: clamp(56px, 10vw, 160px); }
        .manifesto h2 span { color: var(--rust); }
        .manifesto p { max-width: 680px; margin: 48px auto 0; font-size: 18px; line-height: 1.7; color: var(--dust); }

        /* sections */
        .tsp-section { padding: 120px 0; }
        .section-head {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 48px;
          margin-bottom: 72px;
          align-items: end;
        }
        .section-head .num {
          font-family: 'Anton', sans-serif;
          font-size: 80px;
          color: var(--rust);
          line-height: .8;
        }
        .section-head h2 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(40px, 6vw, 72px);
          text-transform: uppercase;
          letter-spacing: .01em;
          line-height: .95;
        }
        .section-head .label {
          font-size: 11px;
          letter-spacing: .32em;
          text-transform: uppercase;
          color: var(--dust);
          margin-bottom: 12px;
        }

        /* what cards */
        .what { background: #0d0d0d; }
        .what-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--line);
        }
        .what-card { background: var(--bg); padding: 48px 32px; }
        .what-card .num {
          font-family: 'Anton', sans-serif;
          font-size: 48px;
          color: var(--rust);
          line-height: 1;
          margin-bottom: 24px;
        }
        .what-card h3 {
          font-family: 'Anton', sans-serif;
          font-size: 28px;
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: .02em;
        }
        .what-card p { color: var(--dust); font-size: 15px; line-height: 1.65; }

        /* schedule */
        .schedule-table { border-top: 1px solid var(--line); }
        .day {
          border-bottom: 1px solid var(--line);
          padding: 40px 0;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 48px;
        }
        .day-label { font-family: 'Anton', sans-serif; }
        .day-date { font-size: 36px; color: var(--ink); line-height: 1; }
        .day-name {
          font-size: 14px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--rust);
          margin-top: 12px;
        }
        .day-items { display: flex; flex-direction: column; gap: 18px; }
        .day-item {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 24px;
          align-items: baseline;
        }
        .day-time {
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .day-desc { font-size: 16px; color: var(--ink); }

        /* format / events */
        .format { background: linear-gradient(180deg, #0a0a0a, #100806); }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: var(--line);
          border: 1px solid var(--line);
        }
        .event { background: var(--bg); padding: 36px 24px; text-align: center; }
        .event .dist {
          font-family: 'Anton', sans-serif;
          font-size: 42px;
          color: var(--ink);
          line-height: 1;
        }
        .event .type {
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--dust);
          margin-top: 14px;
        }
        .event.ultra .dist { color: var(--rust); }

        /* location */
        .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .location-copy h3 {
          font-family: 'Anton', sans-serif;
          font-size: 64px;
          text-transform: uppercase;
          line-height: .95;
          margin-bottom: 24px;
        }
        .location-copy h3 span { color: var(--rust); display: block; }
        .location-copy p { color: var(--dust); font-size: 16px; line-height: 1.7; margin-bottom: 16px; }
        .coords {
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          color: var(--ink);
          letter-spacing: .05em;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }
        .map-art {
          aspect-ratio: 1/1;
          background: #0d0d0d;
          border: 1px solid var(--line);
          position: relative;
          overflow: hidden;
        }
        .map-art svg { width: 100%; height: 100%; }

        /* register */
        .register {
          padding: 160px 0;
          text-align: center;
          background: radial-gradient(ellipse at center, #1a0e08 0%, var(--bg) 70%);
        }
        .register h2 {
          font-family: 'Anton', sans-serif;
          font-size: clamp(64px, 11vw, 180px);
          text-transform: uppercase;
          line-height: .9;
          margin-bottom: 24px;
        }
        .register h2 span { color: var(--rust); }
        .register .sub {
          color: var(--dust);
          font-size: 14px;
          letter-spacing: .28em;
          text-transform: uppercase;
          margin-bottom: 48px;
        }
        .register .cta { font-size: 14px; padding: 22px 48px; }

        /* footer */
        .tsp-footer {
          padding: 64px 0 48px;
          border-top: 1px solid var(--line);
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--dust);
        }
        .tsp-footer .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .tsp-footer a:hover { color: var(--ink); }

        /* responsive */
        @media (max-width: 900px) {
          .tsp-nav ul { display: none; }
          .what-grid { grid-template-columns: 1fr; }
          .events-grid { grid-template-columns: repeat(2, 1fr); }
          .location-grid { grid-template-columns: 1fr; gap: 48px; }
          .day { grid-template-columns: 1fr; gap: 20px; }
          .day-item { grid-template-columns: 100px 1fr; gap: 16px; }
          .section-head { grid-template-columns: 60px 1fr; gap: 24px; }
          .section-head .num { font-size: 48px; }
          .hero-meta { gap: 24px; }
        }
      `}</style>
      {children}
    </div>
  );
}
