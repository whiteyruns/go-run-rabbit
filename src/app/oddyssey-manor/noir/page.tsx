"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function NoirPage() {
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
          <p className="uppercase text-xs mb-2" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>Noir — Handoff Build</p>
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

  return <NoirContent />;
}

function NoirContent() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filterNight, setFilterNight] = useState<"all" | "friday" | "saturday">("all");

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToId = useCallback((id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const filteredEvents = EVENTS.filter(
    (e) => filterNight === "all" || e.night === filterNight
  );

  return (
    <>
      <style>{noirStyles}</style>

      {/* ═══ NAV ═══ */}
      <nav className={`n-nav ${navScrolled ? "scrolled" : ""}`}>
        <Link href="/oddyssey-manor" className="n-nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
        </Link>
        <ul className="n-nav-links">
          <li><Link href="/oddyssey-manor/manor">Manor</Link></li>
          <li><a className="active">Noir</a></li>
          <li><Link href="/oddyssey-manor/private">Private Events</Link></li>
          <li><a onClick={() => scrollToId("n-events")}>Events</a></li>
          <li><a onClick={() => scrollToId("n-tables")}>Bottles &amp; Tables</a></li>
          <li><a className="n-nav-cta" onClick={() => scrollToId("n-events")}>Get Tickets</a></li>
        </ul>
        <div className={`n-hamburger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {mobileOpen && (
        <div className="n-mobile-nav">
          <Link href="/oddyssey-manor/manor" onClick={() => setMobileOpen(false)}>Manor</Link>
          <a onClick={() => setMobileOpen(false)}>Noir</a>
          <Link href="/oddyssey-manor/private" onClick={() => setMobileOpen(false)}>Private Events</Link>
          <a onClick={() => scrollToId("n-events")}>Events</a>
          <a onClick={() => scrollToId("n-tables")}>Bottles &amp; Tables</a>
          <a onClick={() => scrollToId("n-events")} style={{ color: "var(--accent)" }}>Get Tickets</a>
        </div>
      )}

      {/* ═══ FLOATING PAGE NAV ═══ */}
      <div className="page-pill-nav">
        <Link href="/oddyssey-manor/manor">Manor</Link>
        <a className="active">Noir</a>
        <Link href="/oddyssey-manor/private">Private Events</Link>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="n-hero">
        <div className="n-hero-bg" />
        <div className="n-hero-texture" />
        <div className="n-hero-ambient" />
        <div className="n-hero-content">
          <div className="n-hero-eyebrow">Late-Night · Fridays &amp; Saturdays · 10 PM — Late</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/noir.webp" alt="Oddyssey Noir" className="n-hero-logo" />
          <h1>Immersive<br />Nightlife</h1>
          <p className="n-hero-sub">House · Techno · Melodic · Performance · Multi-room experience</p>
          <div className="n-hero-actions">
            <a className="n-btn-primary" onClick={() => scrollToId("n-events")}>View Events</a>
            <a className="n-btn-outline" onClick={() => scrollToId("n-programming")}>Explore Noir</a>
          </div>
        </div>
        <div className="n-hero-scroll">
          <span>Descend</span>
          <div className="n-scroll-line" />
        </div>
      </section>

      {/* ═══ WEEKLY PROGRAMMING ═══ */}
      <section className="n-section-pad n-programming" id="n-programming">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>Weekly Programming</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Two Nights,<br />One Environment</h2>
          <p className="n-section-sub">Recurring weekly formats — predictable cadence, distinct sound, same immersive world.</p>
        </div>
        <div className="n-night-grid">
          <div className="n-night-card n-night-friday">
            <div className="n-night-day">Fridays</div>
            <h3>Liquid Gold</h3>
            <p className="n-night-tagline">Where style, sound, and self-expression collide</p>
            <div className="n-night-meta">
              <span>House</span><span>·</span><span>Electronic</span><span>·</span><span>Melodic</span>
            </div>
            <p className="n-night-desc">
              A Friday ritual. Deeper, melodic, dance-forward. The crowd skews
              polished, the sound skews underground, and the energy builds all night.
            </p>
            <div className="n-night-tag">Golden Hour · Open Bar 10 PM — 12 AM</div>
          </div>
          <div className="n-night-card n-night-saturday">
            <div className="n-night-day">Saturdays</div>
            <h3>Art in Motion</h3>
            <p className="n-night-tagline">A carnivál noir — multi-genre, immersive, performance-driven</p>
            <div className="n-night-meta">
              <span>Multi-genre</span><span>·</span><span>Immersive</span><span>·</span><span>Performance</span>
            </div>
            <p className="n-night-desc">
              Circus acts, roaming performers, shifting rooms, and rotating curators.
              Saturday is Oddyssey at full voltage — harder to predict, impossible to replicate.
            </p>
            <div className="n-night-tag">Golden Hour · Open Bar 10 PM — 12 AM</div>
          </div>
        </div>
      </section>

      {/* ═══ EVENTS CALENDAR ═══ */}
      <section className="n-section-pad n-events" id="n-events">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>Upcoming</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Events Calendar</h2>
          <p className="n-section-sub">Doors 10 PM · 21+ · Inside AREA15</p>
        </div>

        <div className="n-filters">
          {([
            { id: "all", label: "All Nights" },
            { id: "friday", label: "Fridays — Liquid Gold" },
            { id: "saturday", label: "Saturdays — Art in Motion" },
          ] as const).map((f) => (
            <button
              key={f.id}
              className={`n-filter-btn ${filterNight === f.id ? "active" : ""}`}
              onClick={() => setFilterNight(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="n-event-list">
          {filteredEvents.map((evt, i) => (
            <div key={i} className={`n-event-row n-event-${evt.night}`}>
              <div className="n-event-date">{evt.date}</div>
              <div className="n-event-body">
                <div className="n-event-night">{evt.night === "friday" ? "Liquid Gold" : "Art in Motion"}</div>
                <h4>{evt.dj}</h4>
                <span className="n-event-genre">{evt.genre}</span>
              </div>
              <div className="n-event-time">Doors 10 PM</div>
              <div className="n-event-cta">
                <span className="n-btn-primary n-btn-sm">Get Tickets</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TICKET TIERS ═══ */}
      <section className="n-section-pad n-tickets">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>Entry</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Select Your Tier</h2>
          <p className="n-section-sub">Available for every event. Early pricing ends at capacity.</p>
        </div>
        <div className="n-tier-grid">
          {TIERS.map((t) => (
            <div key={t.name} className={`n-tier-card ${t.featured ? "featured" : ""}`}>
              {t.featured && <div className="n-tier-tag">Most Popular</div>}
              <div className="n-tier-name">{t.name}</div>
              <div className="n-tier-price">
                <span className="n-tier-currency">$</span>{t.price}
              </div>
              <ul className="n-tier-features">
                {t.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a className={t.featured ? "n-btn-primary" : "n-btn-outline"} style={{ width: "100%", textAlign: "center" }}>
                Select
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BOTTLES & TABLES ═══ */}
      <section className="n-section-pad n-bottles" id="n-tables">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>VIP</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Bottles &amp; Tables</h2>
          <p className="n-section-sub">Reserved seating, dedicated service, premium bottles. Inquire for custom buyouts.</p>
        </div>
        <div className="n-table-grid">
          {TABLES.map((t) => (
            <div key={t.name} className={`n-table-card ${t.featured ? "featured" : ""}`}>
              {t.featured && <div className="n-table-tag">Most Popular</div>}
              <div className="n-table-name">{t.name}</div>
              <div className="n-table-price">{t.price}</div>
              <div className="n-table-min">{t.note}</div>
              <ul className="n-table-features">
                {t.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a className={t.featured ? "n-btn-primary" : "n-btn-outline"} style={{ width: "100%", textAlign: "center" }}>
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="n-menu">
          <div className="n-label" style={{ textAlign: "center", marginTop: 64 }}>Bottle Menu</div>
          <div className="n-menu-grid">
            {BOTTLE_MENU.map((cat) => (
              <div key={cat.category} className="n-menu-category">
                <h4>{cat.category}</h4>
                {cat.items.map((item) => (
                  <div key={item.name} className="n-menu-item">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="n-menu-note">Placeholder pricing for wireframe purposes. All bottles include mixers, ice, and service.</p>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="n-section-pad n-gallery-section" id="n-gallery">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>The Environment</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Inside Noir</h2>
        </div>
        <div className="n-gallery-grid">
          {[6, 15, 17, 5, 11, 16].map((n, i) => (
            <div key={i} className="n-gallery-cell">
              <div className="n-gallery-cell-inner" style={{ backgroundImage: `url('/oddyssey/gal${n}.webp')` }} />
            </div>
          ))}
        </div>
        <div className="n-gallery-caption">
          <p>Nothing else like this in Las Vegas</p>
        </div>
      </section>

      {/* ═══ VENUE INFO ═══ */}
      <section className="n-section-pad n-venue">
        <div className="n-section-head">
          <div className="n-label" style={{ textAlign: "center" }}>Plan Your Visit</div>
          <h2 className="n-heading-2" style={{ textAlign: "center" }}>Before You Arrive</h2>
        </div>
        <div className="n-venue-grid">
          <div className="n-venue-item">
            <h4>Location</h4>
            <p>3202 W Desert Inn Rd<br />Las Vegas, NV 89102<br /><span>Inside AREA15</span></p>
          </div>
          <div className="n-venue-item">
            <h4>Hours</h4>
            <p>Fridays &amp; Saturdays<br />10 PM — Late<br /><span>Doors at 10 PM</span></p>
          </div>
          <div className="n-venue-item">
            <h4>Dress Code</h4>
            <p>Party / rave gear<br />Costumes welcome<br /><span>Express yourself</span></p>
          </div>
          <div className="n-venue-item">
            <h4>Age</h4>
            <p>21+ only<br />Valid ID required<br /><span>No exceptions</span></p>
          </div>
          <div className="n-venue-item">
            <h4>Accessibility</h4>
            <p>Full ADA compliance<br />On-site parking &amp; rideshare<br /><span>Contact for access needs</span></p>
          </div>
          <div className="n-venue-item">
            <h4>Sensory Notice</h4>
            <p>Concert-level sound<br />Strobes · theatrical haze<br /><span>Performer proximity</span></p>
          </div>
        </div>
      </section>

      {/* ═══ EMAIL CAPTURE ═══ */}
      <section className="n-section-pad n-capture">
        <div className="n-label">Stay Connected</div>
        <h2 className="n-heading-2">Join the Guest List</h2>
        <p className="n-capture-sub">Early ticket access · Special nights · Exclusive announcements</p>
        <form className="n-capture-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="n-footer">
        <div className="n-footer-top">
          <div className="n-footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
            <p>A late-night immersive nightlife environment inside AREA15 Las Vegas.</p>
          </div>
          <div className="n-footer-cols">
            <div className="n-footer-col">
              <h6>Experiences</h6>
              <Link href="/oddyssey-manor/manor">Manor</Link>
              <a>Noir</a>
              <a>Private Events</a>
            </div>
            <div className="n-footer-col">
              <h6>Visit</h6>
              <a>Location</a>
              <a>FAQ</a>
              <a>Accessibility</a>
            </div>
            <div className="n-footer-col">
              <h6>Connect</h6>
              <a>Instagram</a>
              <a>TikTok</a>
              <a>Contact</a>
            </div>
          </div>
        </div>
        <div className="n-footer-legal">
          <p>&copy; 2026 Oddyssey. Part of AREA15 Las Vegas. All rights reserved.</p>
          <div className="n-footer-legal-links">
            <a>Privacy</a>
            <a>Terms</a>
            <a>CA Privacy Notice</a>
          </div>
        </div>
      </footer>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════

type NightType = "friday" | "saturday";

const EVENTS: { date: string; night: NightType; dj: string; genre: string }[] = [
  { date: "Fri Apr 18", night: "friday", dj: "Berri", genre: "House · Electronic" },
  { date: "Sat Apr 19", night: "saturday", dj: "Hector Romero", genre: "Multi-genre · Immersive" },
  { date: "Fri Apr 25", night: "friday", dj: "DJ Brynn Taylor", genre: "House · Electronic" },
  { date: "Sat Apr 26", night: "saturday", dj: "John Julius Knight", genre: "Multi-genre · Immersive" },
  { date: "Fri May 02", night: "friday", dj: "TBA", genre: "House · Electronic" },
  { date: "Sat May 03", night: "saturday", dj: "TBA", genre: "Multi-genre · Immersive" },
  { date: "Fri May 09", night: "friday", dj: "TBA", genre: "House · Electronic" },
  { date: "Sat May 10", night: "saturday", dj: "TBA", genre: "Multi-genre · Immersive" },
];

const TIERS = [
  {
    name: "Early Entry",
    price: 20,
    features: [
      "General admission access",
      "Both dance floors",
      "All themed rooms",
      "Early pricing — limited",
    ],
  },
  {
    name: "General Admission",
    price: 35,
    featured: true,
    features: [
      "General admission access",
      "Both dance floors",
      "All themed rooms",
      "All performers &amp; installations",
      "Golden Hour open bar 10 PM — 12 AM",
    ],
  },
  {
    name: "VIP Experience",
    price: 75,
    features: [
      "Priority entry — skip the line",
      "Reserved seating area",
      "Complimentary welcome drink",
      "All access + backstage lounge",
    ],
  },
];

const TABLES = [
  {
    name: "Standard Table",
    price: "$200",
    note: "Beverage minimum",
    cta: "Reserve",
    features: [
      "Up to 4 guests",
      "Reserved seating area",
      "Dedicated server",
      "Choice of premium bottles",
    ],
  },
  {
    name: "Private Table",
    price: "$350",
    note: "Beverage minimum",
    featured: true,
    cta: "Reserve",
    features: [
      "Up to 6 guests",
      "Premium location",
      "Dedicated server",
      "Priority entry for group",
      "Choice of premium bottles",
    ],
  },
  {
    name: "VIP Buyout",
    price: "Inquire",
    note: "Custom packages available",
    cta: "Contact Us",
    features: [
      "8+ guests",
      "Exclusive section",
      "Dedicated host &amp; server",
      "Custom bottle selection",
      "Priority entry for full group",
    ],
  },
];

const BOTTLE_MENU = [
  {
    category: "Vodka",
    items: [
      { name: "Grey Goose", price: "$450" },
      { name: "Belvedere", price: "$425" },
      { name: "Tito's", price: "$375" },
    ],
  },
  {
    category: "Tequila",
    items: [
      { name: "El Bandido Reposado", price: "$400" },
      { name: "Casamigos Blanco", price: "$450" },
      { name: "Don Julio 1942", price: "$650" },
    ],
  },
  {
    category: "Whiskey",
    items: [
      { name: "Jameson", price: "$375" },
      { name: "Hennessy VS", price: "$450" },
      { name: "Johnnie Walker Black", price: "$425" },
    ],
  },
  {
    category: "Champagne",
    items: [
      { name: "Moët Impérial", price: "$400" },
      { name: "Veuve Clicquot", price: "$450" },
      { name: "Dom Pérignon", price: "$750" },
    ],
  },
];

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════

const noirStyles = `
/* ═══ SHARED TOKENS (declared locally for handoff portability) ═══ */
.n-nav, .n-hero, .n-section-pad, .n-footer, .n-mobile-nav, .page-pill-nav {
  --bg: #060606;
  --bg-elevated: #0d0d0d;
  --bg-card: #111111;
  --border: rgba(201, 168, 76, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --accent: #c9a84c;
  --accent-hover: #d4b85e;
  --accent-dim: rgba(201, 168, 76, 0.08);
  --violet: rgba(80, 40, 100, 0.12);
  --text: #e8e4dd;
  --text-secondary: #9a958d;
  --text-muted: #5a5650;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Inter', -apple-system, sans-serif;
}

/* ═══ NAV ═══ */
.n-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 clamp(20px, 4vw, 60px); height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.6s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.6s;
}
.n-nav.scrolled {
  background: rgba(6,6,6,0.85);
  backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid var(--border-subtle);
}
.n-nav-logo { cursor: pointer; display: flex; align-items: center; transition: opacity 0.3s; text-decoration: none; }
.n-nav-logo:hover { opacity: 0.7; }
.n-nav-logo img { height: 32px; width: auto; }
.n-nav-links { display: flex; align-items: center; gap: 36px; list-style: none; margin: 0; padding: 0; }
.n-nav-links a {
  font-size: 11px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--text-secondary); cursor: pointer; transition: color 0.3s; position: relative;
  text-decoration: none;
}
.n-nav-links a.active { color: var(--accent); }
.n-nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px;
  background: var(--accent); transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
}
.n-nav-links a.active::after { width: 100%; }
.n-nav-links a:hover { color: var(--text); }
.n-nav-links a:hover::after { width: 100%; }
.n-nav-cta {
  font-size: 10px !important; font-weight: 500 !important; letter-spacing: 3px !important;
  color: var(--bg) !important; background: var(--accent); padding: 10px 24px;
  transition: background 0.3s, transform 0.3s;
}
.n-nav-cta::after { display: none !important; }
.n-nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }
.n-hamburger {
  display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 1001;
}
.n-hamburger span { display: block; width: 24px; height: 1px; background: var(--text); transition: transform 0.4s, opacity 0.3s; }
.n-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
.n-hamburger.open span:nth-child(2) { opacity: 0; }
.n-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
.n-mobile-nav {
  position: fixed; inset: 0; background: var(--bg); z-index: 999;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 32px;
}
.n-mobile-nav a {
  font-family: var(--serif); font-size: 32px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-secondary); cursor: pointer; transition: color 0.3s;
  text-decoration: none;
}
.n-mobile-nav a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .n-nav-links { display: none; }
  .n-hamburger { display: flex; }
}

/* ═══ FLOATING PAGE PILL NAV ═══ */
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

/* ═══ PRIMITIVES ═══ */
.n-label {
  font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px;
}
.n-section-pad { padding: clamp(80px,12vw,160px) clamp(20px,6vw,120px); }
.n-section-head { max-width: 720px; margin: 0 auto 64px; text-align: center; }
.n-section-sub {
  font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--text-secondary);
  letter-spacing: 0.5px; margin-top: 20px;
}
.n-heading-2 {
  font-family: var(--serif); font-size: clamp(28px,4vw,48px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; line-height: 1.1;
}
.n-btn-primary {
  display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px;
  text-transform: uppercase; color: var(--bg); background: var(--accent);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  border: none; text-decoration: none;
}
.n-btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.2); }
.n-btn-sm { font-size: 9px !important; padding: 10px 24px !important; }
.n-btn-outline {
  display: inline-block; font-size: 10px; font-weight: 400; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-secondary); border: 1px solid var(--border);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s;
  background: transparent; text-decoration: none;
}
.n-btn-outline:hover { color: var(--text); border-color: var(--accent); background: var(--accent-dim); }

/* ═══ HERO ═══ */
.n-hero {
  position: relative; height: 100vh; min-height: 720px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,8vw,120px); overflow: hidden;
}
.n-hero-bg {
  position: absolute; inset: 0; z-index: 1;
  background:
    radial-gradient(ellipse at 70% 80%, rgba(80,40,100,0.15) 0%, transparent 55%),
    radial-gradient(ellipse at 20% 30%, rgba(201,168,76,0.06) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.25) 0%, rgba(6,6,6,0.55) 50%, rgba(6,6,6,0.92) 100%),
    url('/oddyssey/gal8.webp') center 40%/cover no-repeat;
}
.n-hero-texture {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px);
}
.n-hero-ambient {
  position: absolute; inset: 0; z-index: 1;
  background:
    conic-gradient(from 200deg at 30% 70%, transparent 0deg, rgba(80,40,100,0.10) 40deg, transparent 80deg),
    conic-gradient(from 60deg at 75% 35%, transparent 0deg, rgba(201,168,76,0.05) 30deg, transparent 60deg);
  animation: nAmbient 18s ease-in-out infinite alternate;
}
@keyframes nAmbient { 0% { opacity: 0.7; } 100% { opacity: 1; } }
.n-hero-content { position: relative; z-index: 10; max-width: 960px; }
.n-hero-eyebrow {
  font-size: 11px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 28px;
  opacity: 0; transform: translateY(20px); animation: nFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
}
.n-hero-logo {
  height: 72px; width: auto; margin-bottom: 32px; filter: brightness(1.15);
  opacity: 0; transform: translateY(20px); animation: nFadeUp 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
}
.n-hero h1 {
  font-family: var(--serif); font-size: clamp(40px,7vw,92px); font-weight: 300;
  line-height: 1.05; letter-spacing: clamp(2px,0.6vw,8px); text-transform: uppercase; margin-bottom: 24px;
  opacity: 0; transform: translateY(30px); animation: nFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.7s forwards;
}
.n-hero-sub {
  font-size: clamp(12px,1.4vw,15px); font-weight: 300; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-secondary); margin-bottom: 48px; max-width: 660px;
  opacity: 0; transform: translateY(20px); animation: nFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.9s forwards;
}
.n-hero-actions {
  display: flex; gap: 16px; flex-wrap: wrap;
  opacity: 0; transform: translateY(20px); animation: nFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards;
}
@keyframes nFadeUp { to { opacity: 1; transform: translateY(0); } }
.n-hero-scroll {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0; animation: nFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.5s forwards;
}
.n-hero-scroll span { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-muted); }
.n-scroll-line {
  width: 1px; height: 40px; background: linear-gradient(to bottom, var(--accent), transparent);
  animation: nScrollPulse 2s ease-in-out infinite;
}
@keyframes nScrollPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

/* ═══ PROGRAMMING ═══ */
.n-programming { background: var(--bg-elevated); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); }
.n-night-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.n-night-card {
  padding: clamp(40px,5vw,72px); position: relative; overflow: hidden;
  background: var(--bg-elevated); transition: background 0.6s;
}
.n-night-card::before {
  content: ''; position: absolute; inset: 0; z-index: 0; opacity: 0.25;
  transition: opacity 0.6s;
}
.n-night-card:hover::before { opacity: 0.4; }
.n-night-friday::before {
  background:
    radial-gradient(ellipse at 30% 80%, rgba(212,165,116,0.14) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.6), rgba(6,6,6,0.92)),
    url('/oddyssey/liquid-gold-friday.webp') center/cover no-repeat;
}
.n-night-saturday::before {
  background:
    radial-gradient(ellipse at 70% 80%, rgba(80,40,100,0.18) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.6), rgba(6,6,6,0.92)),
    url('/oddyssey/oddyssey-noir-event.webp') center/cover no-repeat;
}
.n-night-card > * { position: relative; z-index: 1; }
.n-night-day {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
  color: var(--accent); margin-bottom: 18px;
}
.n-night-friday .n-night-day { color: #d4a574; }
.n-night-card h3 {
  font-family: var(--serif); font-size: clamp(36px,5vw,58px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; margin: 0 0 14px; line-height: 1.05;
}
.n-night-tagline {
  font-family: var(--serif); font-size: 16px; font-style: italic; font-weight: 400;
  color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 24px;
}
.n-night-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 24px;
}
.n-night-desc {
  font-size: 14px; font-weight: 300; line-height: 1.75; color: var(--text-secondary);
  margin-bottom: 28px;
}
.n-night-tag {
  font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #d4a574;
  padding: 10px 0; border-top: 1px solid rgba(212,165,116,0.2); border-bottom: 1px solid rgba(212,165,116,0.2);
}
@media (max-width: 768px) { .n-night-grid { grid-template-columns: 1fr; } }

/* ═══ EVENTS ═══ */
.n-events { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.n-filters {
  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  margin-bottom: 40px;
}
.n-filter-btn {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);
  padding: 10px 20px; border: 1px solid var(--border-subtle); cursor: pointer; transition: all 0.3s;
  background: transparent;
}
.n-filter-btn:hover, .n-filter-btn.active { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
.n-event-list { max-width: 1000px; margin: 0 auto; }
.n-event-row {
  display: grid; grid-template-columns: 120px 1fr auto auto; align-items: center; gap: 28px;
  padding: 24px 20px; border-bottom: 1px solid var(--border-subtle);
  cursor: pointer; transition: background 0.3s;
}
.n-event-row:hover { background: var(--accent-dim); }
.n-event-row:first-child { border-top: 1px solid var(--border-subtle); }
.n-event-date {
  font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--accent);
}
.n-event-friday .n-event-date { color: #d4a574; }
.n-event-body { display: flex; flex-direction: column; gap: 4px; }
.n-event-night {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); font-weight: 500;
}
.n-event-friday .n-event-night { color: #d4a574; }
.n-event-body h4 {
  font-family: var(--serif); font-size: clamp(19px,2vw,26px); font-weight: 400;
  letter-spacing: 1.5px; margin: 0; color: var(--text);
}
.n-event-genre {
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted);
}
.n-event-time {
  font-size: 12px; color: var(--text-muted); letter-spacing: 1px; text-align: right;
}
@media (max-width: 768px) {
  .n-event-row { grid-template-columns: 1fr; gap: 10px; padding: 24px 16px; }
  .n-event-time { text-align: left; }
}

/* ═══ TIERS ═══ */
.n-tickets { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.n-tier-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1100px; margin: 0 auto;
}
.n-tier-card {
  background: var(--bg-elevated); padding: clamp(32px,4vw,56px);
  display: flex; flex-direction: column; position: relative; transition: background 0.4s;
}
.n-tier-card:hover { background: var(--bg-card); }
.n-tier-card.featured { background: var(--bg-card); }
.n-tier-card.featured::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent);
}
.n-tier-tag {
  position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
  background: var(--accent); color: var(--bg); padding: 6px 14px;
}
.n-tier-name {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;
}
.n-tier-price {
  font-family: var(--serif); font-size: 56px; font-weight: 300; color: var(--accent);
  line-height: 1; margin-bottom: 28px; display: flex; align-items: flex-start; gap: 4px;
}
.n-tier-currency { font-size: 22px; margin-top: 8px; opacity: 0.7; }
.n-tier-features { list-style: none; margin: 0 0 28px; padding: 0; flex: 1; }
.n-tier-features li {
  font-size: 12px; color: var(--text-secondary); padding: 9px 0;
  border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.3px; line-height: 1.4;
  position: relative; padding-left: 18px;
}
.n-tier-features li::before {
  content: ''; position: absolute; left: 0; top: 14px;
  width: 5px; height: 5px; border: 1px solid var(--accent); transform: rotate(45deg);
}
.n-tier-features li:last-child { border-bottom: none; }
@media (max-width: 768px) { .n-tier-grid { grid-template-columns: 1fr; } }

/* ═══ BOTTLES & TABLES ═══ */
.n-bottles { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.n-table-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1100px; margin: 0 auto;
}
.n-table-card {
  background: var(--bg); padding: clamp(28px,3vw,44px);
  display: flex; flex-direction: column; position: relative; transition: background 0.4s;
}
.n-table-card:hover { background: var(--bg-elevated); }
.n-table-card.featured { background: var(--bg-elevated); }
.n-table-card.featured::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent);
}
.n-table-tag {
  position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
  background: var(--accent); color: var(--bg); padding: 6px 14px;
}
.n-table-name {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;
}
.n-table-price {
  font-family: var(--serif); font-size: 40px; font-weight: 300; color: var(--accent);
  line-height: 1; margin-bottom: 6px;
}
.n-table-min {
  font-size: 11px; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 24px;
  text-transform: uppercase;
}
.n-table-features { list-style: none; margin: 0 0 28px; padding: 0; flex: 1; }
.n-table-features li {
  font-size: 12px; color: var(--text-secondary); padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.3px;
  position: relative; padding-left: 18px;
}
.n-table-features li::before {
  content: ''; position: absolute; left: 0; top: 14px;
  width: 5px; height: 5px; border: 1px solid var(--accent); transform: rotate(45deg);
}
.n-table-features li:last-child { border-bottom: none; }
@media (max-width: 768px) { .n-table-grid { grid-template-columns: 1fr; } }

.n-menu { max-width: 1100px; margin: 0 auto; }
.n-menu-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border-subtle); margin-top: 20px;
}
.n-menu-category { background: var(--bg); padding: 24px; }
.n-menu-category h4 {
  font-family: var(--serif); font-size: 16px; font-weight: 400;
  letter-spacing: 1.5px; color: var(--accent); margin: 0 0 16px;
  text-transform: uppercase;
}
.n-menu-item {
  display: flex; justify-content: space-between; font-size: 12px;
  color: var(--text-secondary); padding: 8px 0; border-bottom: 1px solid var(--border-subtle);
}
.n-menu-item:last-child { border-bottom: none; }
.n-menu-note {
  font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 20px;
  font-style: italic; letter-spacing: 0.5px;
}
@media (max-width: 768px) { .n-menu-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .n-menu-grid { grid-template-columns: 1fr; } }

/* ═══ GALLERY ═══ */
.n-gallery-section { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); overflow: hidden; }
.n-gallery-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
  max-width: 1300px; margin: 0 auto;
}
.n-gallery-cell { aspect-ratio: 4/3; overflow: hidden; position: relative; cursor: pointer; }
.n-gallery-cell-inner {
  position: absolute; inset: 0; background-position: center; background-size: cover;
  transition: transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.n-gallery-cell:hover .n-gallery-cell-inner { transform: scale(1.06); }
.n-gallery-caption { text-align: center; margin-top: 56px; }
.n-gallery-caption p {
  font-family: var(--serif); font-size: clamp(20px,3vw,34px); font-weight: 300;
  font-style: italic; color: var(--text-secondary); letter-spacing: 2px;
}
@media (max-width: 600px) { .n-gallery-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ VENUE ═══ */
.n-venue { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.n-venue-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.n-venue-item { background: var(--bg); padding: 36px 28px; text-align: center; transition: background 0.4s; }
.n-venue-item:hover { background: var(--bg-elevated); }
.n-venue-item h4 {
  font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 16px;
}
.n-venue-item p {
  font-family: var(--serif); font-size: 17px; font-weight: 300;
  letter-spacing: 1px; color: var(--text); line-height: 1.6;
}
.n-venue-item p span {
  display: block; margin-top: 6px; font-family: var(--sans); font-size: 11px;
  letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 400;
}
@media (max-width: 900px) { .n-venue-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .n-venue-grid { grid-template-columns: 1fr; } }

/* ═══ CAPTURE ═══ */
.n-capture { background: var(--bg-elevated); border-top: 1px solid var(--border-subtle); text-align: center; }
.n-capture-sub { font-size: 13px; color: var(--text-muted); letter-spacing: 1.5px; margin: 12px 0 40px; }
.n-capture-form { display: flex; justify-content: center; gap: 0; max-width: 520px; margin: 0 auto; }
.n-capture-form input {
  flex: 1; background: var(--bg); border: 1px solid var(--border-subtle); border-right: none;
  padding: 16px 24px; font-family: var(--sans); font-size: 13px; font-weight: 300;
  color: var(--text); outline: none; transition: border-color 0.3s;
}
.n-capture-form input::placeholder { color: var(--text-muted); }
.n-capture-form input:focus { border-color: var(--accent); }
.n-capture-form button {
  background: var(--accent); color: var(--bg); font-size: 10px; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase; padding: 16px 32px;
  border: 1px solid var(--accent); cursor: pointer; transition: background 0.3s; white-space: nowrap;
}
.n-capture-form button:hover { background: var(--accent-hover); }
@media (max-width: 500px) {
  .n-capture-form { flex-direction: column; }
  .n-capture-form input { border-right: 1px solid var(--border-subtle); border-bottom: none; }
}

/* ═══ FOOTER ═══ */
.n-footer {
  padding: 80px clamp(20px,6vw,120px) 40px; border-top: 1px solid var(--border-subtle);
  background: var(--bg);
}
.n-footer-top {
  display: grid; grid-template-columns: 1.2fr 2fr; gap: 60px;
  padding-bottom: 60px; border-bottom: 1px solid var(--border-subtle);
}
.n-footer-brand img { height: 28px; width: auto; margin-bottom: 20px; opacity: 0.7; }
.n-footer-brand p {
  font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--text-muted);
  letter-spacing: 0.5px; max-width: 340px;
}
.n-footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.n-footer-col { display: flex; flex-direction: column; gap: 12px; }
.n-footer-col h6 {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 4px;
}
.n-footer-col a {
  font-size: 12px; letter-spacing: 1px; color: var(--text-secondary);
  cursor: pointer; transition: color 0.3s; text-decoration: none;
}
.n-footer-col a:hover { color: var(--text); }
.n-footer-legal {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
  padding-top: 40px;
}
.n-footer-legal p {
  font-size: 11px; letter-spacing: 1px; color: var(--text-muted);
}
.n-footer-legal-links { display: flex; gap: 24px; }
.n-footer-legal-links a {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); cursor: pointer; transition: color 0.3s; text-decoration: none;
}
.n-footer-legal-links a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .n-footer-top { grid-template-columns: 1fr; gap: 40px; }
  .n-footer-cols { grid-template-columns: 1fr 1fr 1fr; }
}
@media (max-width: 600px) {
  .n-footer-cols { grid-template-columns: 1fr 1fr; }
}
`;
