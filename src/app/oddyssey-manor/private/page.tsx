"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function PrivatePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("od-auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

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
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#060606", color: "#e8e4dd", fontFamily: "var(--sans)" }}>
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="uppercase text-xs mb-2" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>Private Events — Handoff</p>
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "2px" }}>Developer Reference</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code" autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-medium"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px" }}
            />
            {error && <p className="text-xs tracking-widest uppercase" style={{ color: "#c0392b" }}>Invalid access code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase tracking-widest font-medium"
              style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}>Enter</button>
          </form>
          <p className="mt-16 text-xs uppercase" style={{ color: "#5a5650", letterSpacing: "2px" }}>Presented by Go Run Rabbit</p>
        </div>
      </div>
    );
  }

  return <PrivateContent />;
}

function PrivateContent() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToId = useCallback((id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <style>{privateStyles}</style>

      {/* ═══ NAV ═══ */}
      <nav className={`p-nav ${navScrolled ? "scrolled" : ""}`}>
        <Link href="/oddyssey" className="p-nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
        </Link>
        <ul className="p-nav-links">
          <li><Link href="/oddyssey-manor/manor">Manor</Link></li>
          <li><Link href="/oddyssey-manor/noir">Noir</Link></li>
          <li><a className="active">Private Events</a></li>
          <li><a onClick={() => scrollToId("p-inquiry")}>Inquiry</a></li>
          <li><a className="p-nav-cta" onClick={() => scrollToId("p-inquiry")}>Plan Your Event</a></li>
        </ul>
        <div className={`p-hamburger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {mobileOpen && (
        <div className="p-mobile-nav">
          <Link href="/oddyssey-manor/manor" onClick={() => setMobileOpen(false)}>Manor</Link>
          <Link href="/oddyssey-manor/noir" onClick={() => setMobileOpen(false)}>Noir</Link>
          <a onClick={() => setMobileOpen(false)}>Private Events</a>
          <a onClick={() => scrollToId("p-inquiry")} style={{ color: "var(--accent)" }}>Plan Your Event</a>
        </div>
      )}

      {/* ═══ FLOATING PAGE NAV ═══ */}
      <div className="page-pill-nav">
        <Link href="/oddyssey-manor/manor">Manor</Link>
        <Link href="/oddyssey-manor/noir">Noir</Link>
        <a className="active">Private Events</a>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="p-hero">
        <div className="p-hero-bg" />
        <div className="p-hero-texture" />
        <div className="p-hero-content">
          <div className="p-label">Host at Oddyssey</div>
          <h1>Private<br />Events</h1>
          <p className="p-hero-sub">Immersive venues for unforgettable experiences at AREA15</p>
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="p-section-pad p-intro">
        <div style={{ maxWidth: 720 }}>
          <h2 className="p-heading-2" style={{ marginBottom: 24 }}>Your Event,<br />Our World</h2>
          <p className="p-intro-body">
            Transform Oddyssey into your own immersive venue. Whether it&rsquo;s a corporate
            reception, product launch, birthday celebration, or bachelorette weekend &mdash;
            our theatrical spaces, production capabilities, and creative team deliver
            experiences that can&rsquo;t be replicated anywhere else in Las Vegas.
          </p>
        </div>
      </section>

      {/* ═══ SPACES ═══ */}
      <section className="p-section-pad p-spaces">
        <div className="p-label">Available Spaces</div>
        <h2 className="p-heading-2" style={{ marginBottom: 56 }}>Choose Your Venue</h2>
        <div className="p-space-list">
          <div className="p-space">
            <div className="p-space-img p-space-manor" />
            <div className="p-space-body">
              <h3>Oddyssey Manor</h3>
              <p className="p-space-type">Immersive Cocktail Theatre</p>
              <div className="p-space-rows">
                <div className="p-space-row">
                  <span className="p-space-row-label">Format</span>
                  <span>Full buyout or sectional</span>
                </div>
                <div className="p-space-row">
                  <span className="p-space-row-label">Ideal for</span>
                  <span>Corporate receptions, launch events, milestone celebrations</span>
                </div>
                <div className="p-space-row">
                  <span className="p-space-row-label">Includes</span>
                  <span>Themed rooms, interactive performers, craft cocktail program</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-space">
            <div className="p-space-img p-space-noir" />
            <div className="p-space-body">
              <h3>Oddyssey Noir</h3>
              <p className="p-space-type">Late-Night Dance Environment</p>
              <div className="p-space-rows">
                <div className="p-space-row">
                  <span className="p-space-row-label">Format</span>
                  <span>Full buyout or VIP sections</span>
                </div>
                <div className="p-space-row">
                  <span className="p-space-row-label">Ideal for</span>
                  <span>After-parties, brand activations, bachelorette &amp; birthday</span>
                </div>
                <div className="p-space-row">
                  <span className="p-space-row-label">Includes</span>
                  <span>Two dance floors, DJ, roaming performers, themed corridors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EVENT TYPES ═══ */}
      <section className="p-section-pad p-types">
        <div className="p-label">Event Types</div>
        <h2 className="p-heading-2" style={{ marginBottom: 56 }}>What We Host</h2>
        <div className="p-types-grid">
          {EVENT_TYPES.map((t) => (
            <div key={t.title} className="p-type-card">
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="p-section-pad p-services">
        <div className="p-label">Services</div>
        <h2 className="p-heading-2" style={{ marginBottom: 56 }}>What&rsquo;s Included</h2>
        <div className="p-services-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="p-service">
              <h4>{s.title}</h4>
              <ul>
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INQUIRY FORM ═══ */}
      <section className="p-section-pad p-inquiry" id="p-inquiry">
        <div className="p-section-head">
          <div className="p-label">Get Started</div>
          <h2 className="p-heading-2">Request a Consultation</h2>
          <p className="p-section-sub">Tell us about your event and our team will follow up within 24 hours.</p>
        </div>
        <form className="p-form" onSubmit={(e) => e.preventDefault()}>
          <div className="p-form-grid">
            <input type="text" placeholder="First name" />
            <input type="text" placeholder="Last name" />
            <input type="email" placeholder="Email" />
            <input type="tel" placeholder="Phone" />
            <input type="text" placeholder="Event date" />
            <input type="text" placeholder="Guest count" />
          </div>
          <select defaultValue="">
            <option value="" disabled>Event type</option>
            <option>Corporate</option>
            <option>Birthday / Celebration</option>
            <option>Bachelorette / Bachelor</option>
            <option>Brand Activation</option>
            <option>Wedding Event</option>
            <option>Holiday Party</option>
            <option>Full Buyout</option>
            <option>Other</option>
          </select>
          <textarea placeholder="Tell us about your vision" rows={4} />
          <button type="submit" className="p-btn-primary" style={{ width: "100%", textAlign: "center" }}>Submit Inquiry</button>
        </form>
      </section>

      {/* ═══ INFO ═══ */}
      <section className="p-section-pad p-info">
        <div className="p-info-grid">
          <div className="p-info-item">
            <h4>Location</h4>
            <p>Oddyssey at AREA15<br />3202 W Desert Inn Rd<br />Las Vegas, NV 89102</p>
          </div>
          <div className="p-info-item">
            <h4>Contact</h4>
            <p>events@oddysseylv.com<br />702-846-7900</p>
          </div>
          <div className="p-info-item">
            <h4>Requirements</h4>
            <p>21+ events only<br />Minimum guest counts apply</p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="p-footer">
        <div className="p-footer-top">
          <div className="p-footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
            <p>Immersive venues for private events at AREA15 Las Vegas.</p>
          </div>
          <div className="p-footer-cols">
            <div className="p-footer-col">
              <h6>Experiences</h6>
              <Link href="/oddyssey-manor/manor">Manor</Link>
              <Link href="/oddyssey-manor/noir">Noir</Link>
              <a>Private Events</a>
            </div>
            <div className="p-footer-col">
              <h6>Connect</h6>
              <a>events@oddysseylv.com</a>
              <a>702-846-7900</a>
              <a>Instagram</a>
            </div>
            <div className="p-footer-col">
              <h6>Legal</h6>
              <a>Privacy</a>
              <a>Terms</a>
              <a>CA Privacy</a>
            </div>
          </div>
        </div>
        <div className="p-footer-legal">
          <p>&copy; 2026 Oddyssey. Part of AREA15 Las Vegas. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

// ═══ CONTENT ═══
const EVENT_TYPES = [
  { title: "Corporate", desc: "Receptions, team events, product launches, client entertainment" },
  { title: "Celebrations", desc: "Birthdays, bachelorette & bachelor parties, anniversaries" },
  { title: "Brand Activations", desc: "Immersive branded experiences, influencer events, press launches" },
  { title: "Wedding Events", desc: "Rehearsal dinners, after-parties, non-traditional ceremonies" },
  { title: "Holiday Parties", desc: "Company holiday events, New Year&rsquo;s Eve, themed seasonal gatherings" },
  { title: "Full Buyouts", desc: "Exclusive access to Manor, Noir, or both for your group" },
];

const SERVICES = [
  { title: "Production", items: ["Sound & lighting design", "4K projection mapping", "Custom branded content"] },
  { title: "Entertainment", items: ["Curated DJ sets", "Roaming performers", "Interactive characters"] },
  { title: "Food & Beverage", items: ["Custom cocktail menus", "Catering packages", "Bottle service & VIP tables"] },
  { title: "Planning", items: ["Dedicated event coordinator", "Day-of production management", "Photography & videography"] },
];

// ═══ STYLES ═══
const privateStyles = `
.p-nav, .p-hero, .p-section-pad, .p-footer, .p-mobile-nav, .page-pill-nav {
  --bg: #060606;
  --bg-elevated: #0d0d0d;
  --bg-card: #111111;
  --border: rgba(201, 168, 76, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --accent: #c9a84c;
  --accent-hover: #d4b85e;
  --accent-dim: rgba(201, 168, 76, 0.08);
  --text: #e8e4dd;
  --text-secondary: #9a958d;
  --text-muted: #5a5650;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Inter', -apple-system, sans-serif;
}

/* NAV */
.p-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 clamp(20px, 4vw, 60px); height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.6s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.6s;
}
.p-nav.scrolled {
  background: rgba(6,6,6,0.85);
  backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid var(--border-subtle);
}
.p-nav-logo { cursor: pointer; display: flex; align-items: center; transition: opacity 0.3s; text-decoration: none; }
.p-nav-logo:hover { opacity: 0.7; }
.p-nav-logo img { height: 32px; width: auto; }
.p-nav-links { display: flex; align-items: center; gap: 36px; list-style: none; margin: 0; padding: 0; }
.p-nav-links a {
  font-size: 11px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--text-secondary); cursor: pointer; transition: color 0.3s; position: relative;
  text-decoration: none;
}
.p-nav-links a.active { color: var(--accent); }
.p-nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px;
  background: var(--accent); transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
}
.p-nav-links a.active::after { width: 100%; }
.p-nav-links a:hover { color: var(--text); }
.p-nav-links a:hover::after { width: 100%; }
.p-nav-cta {
  font-size: 10px !important; font-weight: 500 !important; letter-spacing: 3px !important;
  color: var(--bg) !important; background: var(--accent); padding: 10px 24px;
  transition: background 0.3s, transform 0.3s;
}
.p-nav-cta::after { display: none !important; }
.p-nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }
.p-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 1001; }
.p-hamburger span { display: block; width: 24px; height: 1px; background: var(--text); transition: transform 0.4s, opacity 0.3s; }
.p-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
.p-hamburger.open span:nth-child(2) { opacity: 0; }
.p-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
.p-mobile-nav {
  position: fixed; inset: 0; background: var(--bg); z-index: 999;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 32px;
}
.p-mobile-nav a {
  font-family: var(--serif); font-size: 32px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-secondary); cursor: pointer; transition: color 0.3s;
  text-decoration: none;
}
.p-mobile-nav a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .p-nav-links { display: none; }
  .p-hamburger { display: flex; }
}

/* FLOATING PAGE PILL NAV */
.page-pill-nav {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 900;
  display: flex; gap: 2px; background: rgba(6,6,6,0.9); backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle); padding: 6px;
}
.page-pill-nav a {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); padding: 10px 20px; transition: all 0.3s; cursor: pointer;
  text-decoration: none;
}
.page-pill-nav a:hover { color: var(--text); }
.page-pill-nav a.active { background: var(--accent); color: var(--bg); }
@media (max-width: 600px) {
  .page-pill-nav { bottom: 12px; padding: 3px; left: 8px; right: 8px; transform: none; justify-content: center; }
  .page-pill-nav a { padding: 8px 12px; font-size: 8px; letter-spacing: 1px; flex: 1; text-align: center; }
}

/* PRIMITIVES */
.p-label {
  font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px;
}
.p-section-pad { padding: clamp(80px,10vw,140px) clamp(20px,6vw,120px); }
.p-section-head { max-width: 720px; margin: 0 auto 56px; text-align: center; }
.p-section-sub {
  font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--text-secondary);
  letter-spacing: 0.5px; margin-top: 20px;
}
.p-heading-2 {
  font-family: var(--serif); font-size: clamp(28px,4vw,48px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; line-height: 1.1;
}
.p-btn-primary {
  display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px;
  text-transform: uppercase; color: var(--bg); background: var(--accent);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s;
  border: none; text-decoration: none;
}
.p-btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); }

/* HERO */
.p-hero {
  position: relative; height: 55vh; min-height: 420px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,6vw,100px); overflow: hidden;
}
.p-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 70%, rgba(201,168,76,0.06) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.3) 0%, rgba(6,6,6,0.85) 100%),
    url('/oddyssey/gal5.webp') center/cover no-repeat;
}
.p-hero-texture {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px);
}
.p-hero-content { position: relative; z-index: 2; }
.p-hero h1 {
  font-family: var(--serif); font-size: clamp(40px,7vw,76px); font-weight: 300;
  letter-spacing: clamp(3px,0.8vw,6px); text-transform: uppercase; line-height: 1.05; margin: 0 0 16px;
  opacity: 0; animation: pFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
}
.p-hero-sub {
  font-size: 14px; color: var(--text-secondary); letter-spacing: 2px;
  opacity: 0; animation: pFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s forwards;
}
@keyframes pFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* INTRO */
.p-intro { border-bottom: 1px solid var(--border-subtle); }
.p-intro-body {
  font-size: 15px; font-weight: 300; line-height: 1.8; color: var(--text-secondary);
}

/* SPACES */
.p-spaces { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.p-space-list { display: flex; flex-direction: column; gap: 1px; background: var(--border-subtle); }
.p-space {
  display: grid; grid-template-columns: 280px 1fr; background: var(--bg-elevated);
  transition: background 0.4s;
}
.p-space:hover { background: var(--bg-card); }
.p-space-img { min-height: 240px; }
.p-space-manor {
  background: linear-gradient(135deg, rgba(6,6,6,0.2), rgba(6,6,6,0.5)), url('/oddyssey/gal15.webp') center/cover no-repeat;
}
.p-space-noir {
  background: linear-gradient(135deg, rgba(6,6,6,0.2), rgba(6,6,6,0.5)), url('/oddyssey/gal8.webp') center/cover no-repeat;
}
.p-space-body { padding: 36px; }
.p-space-body h3 {
  font-family: var(--serif); font-size: 28px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px;
}
.p-space-type {
  font-size: 12px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 24px; font-weight: 500;
}
.p-space-rows { display: flex; flex-direction: column; }
.p-space-row {
  display: flex; gap: 16px; padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 13px; color: var(--text-secondary); line-height: 1.5;
}
.p-space-row:last-child { border-bottom: none; }
.p-space-row-label {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
  font-weight: 500; min-width: 90px; padding-top: 2px; flex-shrink: 0;
}
@media (max-width: 768px) {
  .p-space { grid-template-columns: 1fr; }
  .p-space-img { min-height: 180px; }
}

/* TYPES */
.p-types { border-bottom: 1px solid var(--border-subtle); }
.p-types-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.p-type-card { background: var(--bg); padding: 32px; transition: background 0.3s; }
.p-type-card:hover { background: var(--bg-elevated); }
.p-type-card h4 {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 10px;
}
.p-type-card p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
@media (max-width: 768px) { .p-types-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .p-types-grid { grid-template-columns: 1fr; } }

/* SERVICES */
.p-services { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.p-services-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.p-service { background: var(--bg-elevated); padding: 32px 28px; }
.p-service h4 {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 18px;
}
.p-service ul { list-style: none; margin: 0; padding: 0; }
.p-service li {
  font-size: 13px; color: var(--text-secondary); padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.3px;
}
.p-service li:last-child { border-bottom: none; }
@media (max-width: 900px) { .p-services-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .p-services-grid { grid-template-columns: 1fr; } }

/* INQUIRY */
.p-inquiry { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.p-form { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
.p-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.p-form input, .p-form select, .p-form textarea {
  background: var(--bg); border: 1px solid var(--border-subtle); padding: 16px 20px;
  font-family: var(--sans); font-size: 13px; font-weight: 300; color: var(--text);
  outline: none; transition: border-color 0.3s; width: 100%;
}
.p-form input::placeholder, .p-form textarea::placeholder { color: var(--text-muted); }
.p-form input:focus, .p-form select:focus, .p-form textarea:focus { border-color: var(--accent); }
.p-form select { color: var(--text-muted); appearance: none; cursor: pointer; }
.p-form textarea { resize: vertical; min-height: 110px; }
@media (max-width: 500px) { .p-form-grid { grid-template-columns: 1fr; } }

/* INFO */
.p-info { background: var(--bg-elevated); }
.p-info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.p-info-item { background: var(--bg-elevated); padding: 36px; text-align: center; }
.p-info-item h4 {
  font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin: 0 0 16px; font-weight: 500;
}
.p-info-item p {
  font-family: var(--serif); font-size: 18px; font-weight: 300;
  letter-spacing: 1px; color: var(--text-secondary); line-height: 1.6;
}
@media (max-width: 600px) { .p-info-grid { grid-template-columns: 1fr; } }

/* FOOTER */
.p-footer {
  padding: 80px clamp(20px,6vw,120px) 40px; border-top: 1px solid var(--border-subtle);
  background: var(--bg);
}
.p-footer-top {
  display: grid; grid-template-columns: 1.2fr 2fr; gap: 60px;
  padding-bottom: 60px; border-bottom: 1px solid var(--border-subtle);
}
.p-footer-brand img { height: 28px; width: auto; margin-bottom: 20px; opacity: 0.7; }
.p-footer-brand p {
  font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--text-muted);
  letter-spacing: 0.5px; max-width: 340px;
}
.p-footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.p-footer-col { display: flex; flex-direction: column; gap: 12px; }
.p-footer-col h6 {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 4px;
}
.p-footer-col a {
  font-size: 12px; letter-spacing: 1px; color: var(--text-secondary);
  cursor: pointer; transition: color 0.3s; text-decoration: none;
}
.p-footer-col a:hover { color: var(--text); }
.p-footer-legal {
  padding-top: 40px; text-align: center;
}
.p-footer-legal p { font-size: 11px; letter-spacing: 1px; color: var(--text-muted); }
@media (max-width: 900px) { .p-footer-top { grid-template-columns: 1fr; gap: 40px; } }
@media (max-width: 600px) { .p-footer-cols { grid-template-columns: 1fr 1fr; } }
`;
