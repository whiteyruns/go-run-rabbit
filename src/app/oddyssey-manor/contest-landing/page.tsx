"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function ContestLandingPage() {
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
    } else { setError(true); }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#060606", color: "#e8e4dd" }}>
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48 }} />
          <p className="uppercase text-xs mb-2" style={{ color: "#c9a84c", letterSpacing: "4px", fontWeight: 500 }}>Contest Landing Page</p>
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Design Preview</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code" autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px" }} />
            {error && <p className="text-xs uppercase" style={{ color: "#c0392b", letterSpacing: "2px" }}>Invalid access code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase font-medium" style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}>Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0e0e0e", color: "#e5e2e1", fontFamily: "'Inter', sans-serif", fontWeight: 300, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;700&display=swap');
        ${landingStyles}
      `}</style>

      {/* Portal back link */}
      <div className="cl-portal-bar no-print">
        <Link href="/oddyssey-manor" className="cl-portal-back">&larr; Back to Portal</Link>
        <span className="cl-portal-label">Design Preview &mdash; Not yet public</span>
      </div>

      {/* Grain overlay */}
      <div className="cl-grain" />

      {/* Background art-deco geometry */}
      <div className="cl-geo-bg">
        <svg viewBox="0 0 1000 1000" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <circle cx="500" cy="500" r="400" className="cl-deco-line" />
          <path d="M500 100 L500 900 M100 500 L900 500" className="cl-deco-line" />
          <rect x="250" y="250" width="500" height="500" transform="rotate(45 500 500)" className="cl-deco-line" />
          <path d="M300 300 L700 700 M300 700 L700 300" className="cl-deco-line" />
        </svg>
      </div>

      {/* Nav */}
      <nav className="cl-nav">
        <span className="cl-nav-location">AREA15 &middot; Las Vegas</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="cl-nav-logo" />
        <span className="cl-nav-location" />
      </nav>

      {/* Hero + Form */}
      <main className="cl-main">
        <section className="cl-hero">
          <div className="cl-hero-content">
            <span className="cl-eyebrow">Exclusive &middot; Limited Entry</span>
            <h1 className="cl-hero-title">
              ODDYSSEY<br />
              <span className="cl-hero-accent">GIVEAWAY</span>
            </h1>
            <p className="cl-hero-sub">Win the Ultimate AREA15 Experience for Two.</p>
            <p className="cl-hero-desc">
              A multi-sensory journey through Las Vegas&rsquo;s most immersive venue. Includes AREA15 all-access,
              VIP invite to the District 747 Grand Opening, and Golden Hour VIP at Oddyssey Noir.
            </p>
            <div className="cl-hero-deadline">
              <span>Contest closes May 10, 2026</span>
            </div>
          </div>

          {/* Form */}
          <div className="cl-form-card">
            <div className="cl-form-star">
              <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0L17.5 14.5L32 16L17.5 17.5L16 32L14.5 17.5L0 16L14.5 14.5L16 0Z" fill="#c9a84c" opacity="0.5" />
              </svg>
            </div>
            <h2 className="cl-form-title">Enter to Win</h2>
            <form className="cl-form" onSubmit={(e) => e.preventDefault()}>
              <div className="cl-form-row">
                <div className="cl-field">
                  <label>First Name</label>
                  <input type="text" placeholder="First" />
                </div>
                <div className="cl-field">
                  <label>Last Name</label>
                  <input type="text" placeholder="Last" />
                </div>
              </div>
              <div className="cl-field">
                <label>Email Address</label>
                <input type="email" placeholder="you@email.com" />
              </div>
              <div className="cl-form-row">
                <div className="cl-field">
                  <label>Phone</label>
                  <input type="tel" placeholder="+1 (702) ..." />
                </div>
                <div className="cl-field">
                  <label>Instagram Handle</label>
                  <input type="text" placeholder="@username" />
                </div>
              </div>
              <button type="submit" className="cl-submit">Enter to Win</button>
              <p className="cl-consent">
                By entering, you agree to receive email and SMS communications from Oddyssey at AREA15.
                You may unsubscribe at any time. Your information will not be sold to third parties.
                No purchase necessary. Must be 21+. One entry per person.
              </p>
            </form>
          </div>
        </section>

        {/* Steps */}
        <section className="cl-steps-section">
          <div className="cl-steps">
            {[
              { num: "01", title: "Follow @oddysseylv", desc: "Follow Oddyssey on Instagram. Verified at time of winner selection." },
              { num: "02", title: "Tag 2 Friends", desc: "Tag two friends on the official contest post. Each tag expands our reach." },
              { num: "03", title: "Register Above", desc: "Complete the form with your real details. This is your official entry." },
            ].map(s => (
              <div key={s.num} className="cl-step">
                <span className="cl-step-num">{s.num}</span>
                <div>
                  <h3 className="cl-step-title">{s.title}</h3>
                  <p className="cl-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prizes */}
        <section className="cl-prizes-section">
          <div className="cl-prizes-header">
            <h2>The Grand Spoils</h2>
            <div className="cl-prizes-line" />
          </div>
          <div className="cl-prizes-grid">
            <div className="cl-prize-card">
              <div className="cl-prize-img" style={{ backgroundImage: "url('/oddyssey/gal6.webp')" }} />
              <div className="cl-prize-overlay" />
              <div className="cl-prize-content">
                <h3>The AREA15 Experience</h3>
                <p>Omega Mart tickets for two &middot; Dinner + drinks at AREA15 &middot; Golden Hour VIP access</p>
              </div>
            </div>
            <div className="cl-prize-card cl-prize-offset">
              <div className="cl-prize-img" style={{ backgroundImage: "url('/oddyssey/gal14.webp')" }} />
              <div className="cl-prize-overlay" />
              <div className="cl-prize-content">
                <h3>District 747 Grand Opening</h3>
                <p>VIP invite for two &middot; 1,300-capacity immersive venue &middot; Originally a Burning Man art piece</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="cl-footer">
        <div className="cl-footer-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="cl-footer-logo" />
          <div className="cl-footer-links">
            <a>Privacy Policy</a>
            <a>Terms of Entry</a>
            <a>Contest Rules</a>
          </div>
          <p className="cl-footer-legal">&copy; 2026 Oddyssey at AREA15. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const landingStyles = `
/* Grain */
.cl-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Geometric background */
.cl-geo-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; display: flex; align-items: center; justify-content: center; }
.cl-deco-line { stroke: #4d4637; stroke-width: 0.5; fill: none; opacity: 0.15; }

/* Portal bar */
.cl-portal-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 20px; background: rgba(192,57,43,0.9); backdrop-filter: blur(8px);
}
.cl-portal-back { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #fff; text-decoration: none; }
.cl-portal-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.7); }

/* Nav */
.cl-nav {
  position: fixed; top: 36px; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 48px; background: transparent; backdrop-filter: blur(12px);
}
.cl-nav-location { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #9a958d; flex: 1; }
.cl-nav-logo { height: 28px; width: auto; flex-shrink: 0; }

/* Hero */
.cl-main { position: relative; z-index: 1; }
.cl-hero {
  max-width: 1280px; margin: 0 auto; padding: 140px 48px 80px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;
  min-height: 100vh;
}
.cl-hero-content { display: flex; flex-direction: column; justify-content: center; padding-top: 40px; }
.cl-eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; font-style: italic; }
.cl-hero-title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(56px, 8vw, 96px);
  font-weight: 300; font-style: italic; line-height: 0.9; letter-spacing: -2px; margin-bottom: 24px;
}
.cl-hero-accent { font-style: normal; color: #c9a84c; }
.cl-hero-sub { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-style: italic; color: #d0c5b2; margin-bottom: 16px; }
.cl-hero-desc { font-size: 14px; color: #9a958d; line-height: 1.7; max-width: 420px; margin-bottom: 40px; }
.cl-hero-deadline { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #99907e; display: flex; align-items: center; gap: 8px; }

/* Form card */
.cl-form-card {
  background: #131313; padding: 48px; position: relative;
  border-left: 1px solid rgba(77,70,55,0.2); border-top: 1px solid rgba(77,70,55,0.2);
}
.cl-form-star { position: absolute; top: -12px; left: -12px; }
.cl-form-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; margin-bottom: 40px; }
.cl-form { display: flex; flex-direction: column; gap: 32px; }
.cl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.cl-field label {
  display: block; font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: #99907e; margin-bottom: 8px;
}
.cl-field input {
  width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(77,70,55,0.4);
  padding: 10px 0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
  color: #e5e2e1; outline: none; transition: border-color 0.3s;
}
.cl-field input:focus { border-color: #c9a84c; }
.cl-field input::placeholder { color: #4d4637; }
.cl-submit {
  width: 100%; background: #c9a84c; color: #3d2e00; padding: 18px;
  font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
  border: none; cursor: pointer; transition: background 0.3s; font-family: 'Inter', sans-serif;
}
.cl-submit:hover { background: #e6c364; }
.cl-consent { font-size: 9px; color: #99907e; text-align: center; line-height: 1.6; letter-spacing: 0.5px; }

/* Steps */
.cl-steps-section {
  max-width: 1280px; margin: 0 auto; padding: 100px 48px;
  border-top: 1px solid rgba(77,70,55,0.1);
}
.cl-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 64px; }
.cl-step { display: flex; flex-direction: column; gap: 16px; }
.cl-step-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-style: italic; color: #c9a84c; }
.cl-step-title { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.cl-step-desc { font-size: 14px; font-weight: 300; color: #d0c5b2; line-height: 1.7; }

/* Prizes */
.cl-prizes-section { max-width: 1280px; margin: 0 auto; padding: 100px 48px 120px; }
.cl-prizes-header { margin-bottom: 48px; }
.cl-prizes-header h2 { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300; font-style: italic; margin-bottom: 16px; }
.cl-prizes-line { width: 96px; height: 1px; background: #c9a84c; }
.cl-prizes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.cl-prize-card { position: relative; aspect-ratio: 4/5; overflow: hidden; }
.cl-prize-offset { margin-top: 80px; }
.cl-prize-img { position: absolute; inset: 0; background-size: cover; background-position: center; filter: grayscale(1) brightness(0.6); transition: all 0.7s; }
.cl-prize-card:hover .cl-prize-img { filter: grayscale(0) brightness(0.7); transform: scale(1.05); }
.cl-prize-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,14,14,0.9), transparent 60%); }
.cl-prize-content { position: absolute; bottom: 32px; left: 32px; right: 32px; z-index: 2; }
.cl-prize-content h3 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; margin-bottom: 8px; }
.cl-prize-content p { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #d0c5b2; line-height: 1.6; }

/* Footer */
.cl-footer { border-top: 1px solid rgba(77,70,55,0.2); padding: 48px; }
.cl-footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.cl-footer-logo { height: 24px; width: auto; opacity: 0.5; }
.cl-footer-links { display: flex; gap: 24px; }
.cl-footer-links a { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #9a958d; cursor: pointer; transition: color 0.3s; }
.cl-footer-links a:hover { color: #e5e2e1; }
.cl-footer-legal { font-size: 9px; color: #9a958d; letter-spacing: 1px; text-transform: uppercase; opacity: 0.6; }

/* Mobile */
@media (max-width: 900px) {
  .cl-nav { padding: 12px 24px; top: 36px; }
  .cl-nav-location:first-child { display: none; }
  .cl-hero { grid-template-columns: 1fr; gap: 40px; padding: 120px 24px 60px; min-height: auto; }
  .cl-hero-title { font-size: 48px; }
  .cl-hero-sub { font-size: 20px; }
  .cl-form-card { padding: 32px 24px; border: none; border-top: 1px solid rgba(77,70,55,0.2); }
  .cl-form-row { grid-template-columns: 1fr; gap: 24px; }
  .cl-steps { grid-template-columns: 1fr; gap: 40px; }
  .cl-steps-section { padding: 60px 24px; }
  .cl-prizes-section { padding: 60px 24px 80px; }
  .cl-prizes-grid { grid-template-columns: 1fr; }
  .cl-prize-offset { margin-top: 0; }
  .cl-footer { padding: 32px 24px; }
}

@media (max-width: 500px) {
  .cl-hero-title { font-size: 40px; }
  .cl-portal-bar { flex-direction: column; gap: 4px; padding: 6px 16px; }
}
`;
