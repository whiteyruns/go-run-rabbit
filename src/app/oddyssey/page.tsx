"use client";

/**
 * Oddyssey — brand-forward wireframe home.
 *
 * Lands here from /oddyssey. Surfaces the two flagship product pages
 * (Manor, Noir) front and center, then a connective tissue of every
 * supporting wireframe page (Golden Hour, Bandido pitch, audit, etc).
 *
 * The old /oddyssey-manor URL redirects up here. Internal admin tools
 * (food summary, weekend recap, pour log, etc.) live behind a quiet
 * link at the very bottom — they're not the wireframe story.
 *
 * Same access-code gate (`od-auth` sessionStorage key) as the rest of
 * the wireframe tree.
 */

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function OddysseyHome() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (typeof window !== "undefined" && !authenticated) {
    const stored = sessionStorage.getItem("od-auth");
    if (stored === "true") setAuthenticated(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("od-auth", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#060606", color: "#e8e4dd", fontFamily: "var(--sans)" }}
      >
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="uppercase tracking-[0.3em] text-xs mb-12" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>
            Brand Wireframe
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code"
              autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-medium"
              style={{
                background: "#0d0d0d", border: "none",
                borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`,
                color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px",
              }}
            />
            {error && <p className="text-xs tracking-widest uppercase" style={{ color: "#c0392b" }}>Invalid access code</p>}
            <button
              type="submit"
              className="w-full py-4 text-xs uppercase tracking-widest font-medium"
              style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}
            >
              Enter
            </button>
          </form>
          <p className="mt-16 text-xs uppercase" style={{ color: "#5a5650", letterSpacing: "2px" }}>
            Presented by Go Run Rabbit
          </p>
        </div>
      </div>
    );
  }

  return <HomeBody />;
}

function HomeBody() {
  return (
    <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh" }}>
      <style>{homeStyles}</style>
      <div className="od-home">
        {/* ─── Brand mark + tagline ───────────────────────────────── */}
        <header className="od-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="od-hero-logo" />
          <div className="od-hero-eyebrow">A New Kind of Night in Las Vegas</div>
          <h1 className="od-hero-h1">Two destinations.<br />One Oddyssey.</h1>
          <p className="od-hero-lede">
            Manor delivers a 90-minute immersive dining show. Noir takes over after 10 PM
            with late-night nightlife. Both live inside AREA15, both share the Oddyssey DNA.
          </p>
        </header>

        {/* ─── Flagship: Manor + Noir ─────────────────────────────── */}
        <section className="od-flagship">
          <Link href="/oddyssey-manor/manor" className="od-flagship-card od-flag-manor">
            <div className="od-flag-eyebrow" style={{ color: "#c9a84c" }}>Flagship · Dinner Show</div>
            <h2>Oddyssey Manor</h2>
            <p>
              Four-course tasting menu woven through a roving immersive performance.
              Four ticket tiers from Explorer to Ultimate Party Guest. Thu–Sun, 6:30–9 PM.
            </p>
            <span className="od-flag-cta">Enter Manor &rarr;</span>
          </Link>
          <Link href="/oddyssey-manor/noir" className="od-flagship-card od-flag-noir">
            <div className="od-flag-eyebrow" style={{ color: "#b46ec8" }}>Flagship · Nightlife</div>
            <h2>Oddyssey Noir</h2>
            <p>
              Late-night immersive nightlife. Liquid Gold Fridays, Art in Motion Saturdays.
              Bottle service, three ticket tiers, Golden Hour open bar. Fri–Sat, 10 PM–close.
            </p>
            <span className="od-flag-cta">Enter Noir &rarr;</span>
          </Link>
        </section>

        {/* ─── Explore the brand ──────────────────────────────────── */}
        <section className="od-group">
          <div className="od-group-header">
            <div className="od-group-num">01</div>
            <div>
              <h3>Explore the brand</h3>
              <p>Full wireframes and supporting pages — what the live site will feel like.</p>
            </div>
          </div>
          <div className="od-grid od-grid-3">
            <Link href="/oddyssey-manor/wireframes" className="od-card">
              <div className="od-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Interactive</div>
              <h4>Website Wireframes</h4>
              <p>Homepage, event calendar, event detail, private events — four interconnected mocks.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/private" className="od-card">
              <div className="od-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Page</div>
              <h4>Private Events</h4>
              <p>Venue spaces, event types, inclusions, inquiry form — corporate, celebrations, buyouts.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/contest-landing" className="od-card">
              <div className="od-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Landing</div>
              <h4>Contest Landing</h4>
              <p>Stitch-designed registration page — editorial noir aesthetic, art-deco line art.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
          </div>
        </section>

        {/* ─── Programs ────────────────────────────────────────────── */}
        <section className="od-group">
          <div className="od-group-header">
            <div className="od-group-num">02</div>
            <div>
              <h3>Programs</h3>
              <p>Activations layered on top of the venue — sponsor pitches, marketing kits, growth.</p>
            </div>
          </div>
          <div className="od-grid od-grid-3">
            <Link href="/oddyssey-manor/golden-hour" className="od-card">
              <div className="od-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Proposal</div>
              <h4>Golden Hour</h4>
              <p>Open-bar concept with El Bandido Tequila — venue-facing pitch, 4-week pilot plan.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/bandido-partnership" className="od-card">
              <div className="od-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Brand Pitch</div>
              <h4>El Bandido Partnership</h4>
              <p>Brand-facing pitch — LV market anchor, weekly exposure, ROI model, cocktail program.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/golden-hour-kit" className="od-card">
              <div className="od-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Marketing</div>
              <h4>Marketing Kit</h4>
              <p>IG posts, story sequence, email blast, TikTok concepts, content calendar.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/contest-concept" className="od-card">
              <div className="od-card-tag" style={{ color: "#e67e22", borderColor: "#e67e22" }}>Growth</div>
              <h4>Contest & Giveaway</h4>
              <p>Strategy, prize package, contest rules, data policy. Requires AREA15 approval.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
          </div>
        </section>

        {/* ─── Insights ────────────────────────────────────────────── */}
        <section className="od-group">
          <div className="od-group-header">
            <div className="od-group-num">03</div>
            <div>
              <h3>Insights</h3>
              <p>Strategic analysis informing the brand and the build.</p>
            </div>
          </div>
          <div className="od-grid od-grid-2">
            <Link href="/oddyssey-manor/competitive-landscape" className="od-card">
              <div className="od-card-tag" style={{ color: "#3498db", borderColor: "#3498db" }}>Intelligence</div>
              <h4>Competitive Landscape</h4>
              <p>Six direct competitors, CBM analysis, AREA15 ecosystem, positioning map, white space.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/swot-porters" className="od-card">
              <div className="od-card-tag" style={{ color: "#27ae60", borderColor: "#27ae60" }}>Strategy</div>
              <h4>SWOT & Porter&rsquo;s Five Forces</h4>
              <p>28-point SWOT, cross-analysis, five forces rated, industry attractiveness 5.2/10.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/audit" className="od-card">
              <div className="od-card-tag" style={{ color: "#9a958d", borderColor: "#9a958d" }}>Report</div>
              <h4>Optimization Audit</h4>
              <p>Eleven findings, eight recommendations, Golden Hour integration, homepage structure.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/seo-audit" className="od-card">
              <div className="od-card-tag" style={{ color: "#e74c3c", borderColor: "#e74c3c" }}>Technical</div>
              <h4>SEO Audit</h4>
              <p>Structured data, meta tags, Ticketure integration, 16 action items.</p>
              <span className="od-card-link">Open &rarr;</span>
            </Link>
          </div>
        </section>

        {/* ─── Footer with internal-tools quiet link ──────────────── */}
        <footer className="od-foot">
          <div>Oddyssey Manor &amp; Noir &bull; AREA15 &bull; Las Vegas</div>
          <Link href="/oddyssey-manor/admin" className="od-foot-link">Internal Tools &rarr;</Link>
        </footer>
      </div>
    </div>
  );
}

const homeStyles = `
.od-home { max-width: 1100px; margin: 0 auto; padding: 64px 40px 96px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; }

.od-hero { text-align: center; margin-bottom: 72px; }
.od-hero-logo { height: 56px; width: auto; margin: 0 auto 28px; display: block; }
.od-hero-eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 18px; }
.od-hero-h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(36px, 6vw, 64px); font-weight: 300; line-height: 1.05; letter-spacing: 1px; margin: 0 0 24px; }
.od-hero-lede { font-size: 15px; color: #9a958d; max-width: 580px; margin: 0 auto; line-height: 1.7; }

.od-flagship { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); margin-bottom: 72px; }
.od-flagship-card {
  background: #0a0a0a; padding: 56px 44px; display: flex; flex-direction: column;
  text-decoration: none; color: #e8e4dd;
  transition: background 0.5s cubic-bezier(0.16,1,0.3,1);
  position: relative; min-height: 280px;
}
.od-flagship-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.od-flag-manor::before { background: #c9a84c; }
.od-flag-noir::before { background: #b46ec8; }
.od-flagship-card:hover { background: #111; }
.od-flagship-card:hover::before { transform: scaleX(1); }
.od-flag-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; margin-bottom: 16px; }
.od-flagship-card h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 38px; font-weight: 300; letter-spacing: 1px; margin: 0 0 16px; }
.od-flagship-card p { font-size: 14px; color: #9a958d; line-height: 1.7; flex: 1; margin-bottom: 28px; }
.od-flag-cta { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9a84c; font-weight: 500; }
.od-flag-noir .od-flag-cta { color: #b46ec8; }

.od-group { margin-bottom: 64px; }
.od-group-header { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
.od-group-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: rgba(201,168,76,0.3); line-height: 1; min-width: 36px; }
.od-group-header h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; }
.od-group-header p { font-size: 12px; color: #5a5650; letter-spacing: 1px; margin: 0; }

.od-grid { display: grid; gap: 1px; background: rgba(255,255,255,0.06); }
.od-grid-2 { grid-template-columns: 1fr 1fr; }
.od-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

.od-card {
  background: #060606; padding: 30px 28px; display: flex; flex-direction: column;
  text-decoration: none; color: #e8e4dd;
  transition: background 0.4s cubic-bezier(0.16,1,0.3,1);
  position: relative;
}
.od-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: #c9a84c; transform: scaleX(0); transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
}
.od-card:hover { background: #0d0d0d; }
.od-card:hover::before { transform: scaleX(1); }
.od-card-tag { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 500; border: 1px solid; padding: 4px 12px; align-self: flex-start; margin-bottom: 16px; }
.od-card h4 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 400; letter-spacing: 1px; margin: 0 0 10px; }
.od-card p { font-size: 13px; color: #9a958d; line-height: 1.6; flex: 1; margin: 0 0 20px; }
.od-card-link { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; }

.od-foot { margin-top: 56px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650;
}
.od-foot-link { color: #5a5650; text-decoration: none; }
.od-foot-link:hover { color: #c9a84c; }

@media (max-width: 900px) {
  .od-flagship { grid-template-columns: 1fr; }
  .od-grid-3 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .od-home { padding: 40px 20px 60px; }
  .od-grid-2, .od-grid-3 { grid-template-columns: 1fr; }
  .od-group-num { display: none; }
  .od-flagship-card { padding: 40px 28px; min-height: 220px; }
}
`;
