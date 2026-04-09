"use client";

import { useState, useEffect, useCallback } from "react";

type PageName = "home" | "calendar" | "detail";

export default function OddysseyContent() {
  const [activePage, setActivePage] = useState<PageName>("home");
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const showPage = useCallback((page: PageName) => {
    setActivePage(page);
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      showPage("home");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    },
    [showPage]
  );

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className={`od-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="od-nav-logo" onClick={() => showPage("home")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
        </div>
        <ul className="od-nav-links">
          <li><a onClick={() => showPage("calendar")}>Events</a></li>
          <li><a onClick={() => scrollToId("od-experience")}>Manor Experience</a></li>
          <li><a>Private Events</a></li>
          <li><a>About</a></li>
          <li><a>Visit</a></li>
          <li><a className="od-nav-cta" onClick={() => showPage("calendar")}>Get Tickets</a></li>
        </ul>
        <div
          className={`od-hamburger ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span /><span /><span />
        </div>
      </nav>

      {/* MOBILE NAV */}
      {mobileOpen && (
        <div className="od-mobile-nav">
          <a onClick={() => showPage("home")}>Home</a>
          <a onClick={() => showPage("calendar")}>Events</a>
          <a>Manor Experience</a>
          <a>Private Events</a>
          <a>About</a>
          <a>Visit</a>
          <a onClick={() => showPage("calendar")} style={{ color: "var(--accent)" }}>Get Tickets</a>
        </div>
      )}

      {/* PAGE NAV */}
      <div className="od-page-nav">
        {(["home", "calendar", "detail"] as PageName[]).map((p) => (
          <button
            key={p}
            className={activePage === p ? "active" : ""}
            onClick={() => showPage(p)}
          >
            {p === "home" ? "Home" : p === "calendar" ? "Calendar" : "Event Detail"}
          </button>
        ))}
      </div>

      {/* ════════ HOME ════════ */}
      {activePage === "home" && (
        <div>
          {/* Hero */}
          <section className="od-hero">
            <div className="od-hero-bg" />
            <div className="od-hero-texture" />
            <div className="od-hero-ambient" />
            <div className="od-hero-content">
              <div className="od-hero-eyebrow">Las Vegas &bull; Inside AREA15</div>
              <h1>Immersive<br />Nightlife</h1>
              <p className="od-hero-sub">House &bull; Techno &bull; Performance &bull; Multi-room experience</p>
              <div className="od-hero-actions">
                <a className="od-btn-primary" onClick={() => showPage("calendar")}>View Events</a>
                <a className="od-btn-outline" onClick={() => scrollToId("od-experience")}>Explore Manor</a>
              </div>
            </div>
            <div className="od-hero-scroll">
              <span>Scroll</span>
              <div className="od-scroll-line" />
            </div>
          </section>

          {/* Golden Hour */}
          <section className="od-golden-hour">
            <div className="od-golden-inner">
              <div className="od-golden-content">
                <div className="od-golden-eyebrow">Every Friday &amp; Saturday</div>
                <h2 className="od-golden-title">Golden Hour</h2>
                <p className="od-golden-sub">Open Bar featuring El Bandido Tequila</p>
                <div className="od-golden-details">
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Open Bar</span>
                    <span className="od-golden-time-value">10 PM &ndash; Midnight</span>
                  </div>
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Menu</span>
                    <span className="od-golden-time-value">Paloma &bull; Spicy Margarita &bull; Tequila Soda</span>
                  </div>
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Entry</span>
                    <span className="od-golden-time-value">Free with RSVP &bull; While supplies last</span>
                  </div>
                </div>
                <div className="od-golden-flow">
                  <div className="od-golden-flow-item">
                    <span className="od-golden-flow-time">10 PM</span>
                    <span className="od-golden-flow-dot" />
                    <span className="od-golden-flow-text">Doors + Golden Hour</span>
                  </div>
                  <div className="od-golden-flow-line" />
                  <div className="od-golden-flow-item">
                    <span className="od-golden-flow-time">12 AM</span>
                    <span className="od-golden-flow-dot" />
                    <span className="od-golden-flow-text">Liquid Gold (Fri) / Art in Motion (Sat)</span>
                  </div>
                  <div className="od-golden-flow-line" />
                  <div className="od-golden-flow-item">
                    <span className="od-golden-flow-time">Late</span>
                    <span className="od-golden-flow-dot" />
                    <span className="od-golden-flow-text">Full programming through close</span>
                  </div>
                </div>
                <a className="od-btn-golden">RSVP for Free Entry</a>
              </div>
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="od-section-pad od-events-preview">
            <div className="od-events-header">
              <div>
                <div className="od-label">This Week</div>
                <h2 className="od-heading-2">Upcoming Events</h2>
              </div>
              <a className="od-link" onClick={() => showPage("calendar")}>View All Events &rarr;</a>
            </div>
            <div className="od-event-cards">
              {[
                { date: "Fri Apr 18", name: "Liquid\nGold", genre: "House · Electronic", night: "friday", dj: "Berri" },
                { date: "Sat Apr 19", name: "Art in\nMotion", genre: "Multi-genre · Immersive", night: "saturday", dj: "Hector Romero" },
                { date: "Fri Apr 25", name: "Liquid\nGold", genre: "House · Electronic", night: "friday", dj: "DJ Brynn Taylor" },
              ].map((evt, i) => (
                <div key={i} className={`od-event-card od-event-card-${evt.night}`} onClick={() => showPage("detail")}>
                  <div className="od-event-date">{evt.date}</div>
                  <div className="od-event-name">{evt.name.split("\n").map((l, j) => <span key={j}>{l}<br /></span>)}</div>
                  <div className="od-event-dj">{evt.dj}</div>
                  <div className="od-event-genre">{evt.genre}</div>
                  <div className="od-event-golden-tag">Golden Hour &bull; Open Bar 10 PM&ndash;12 AM</div>
                  <span className="od-btn-primary od-btn-sm">Get Tickets</span>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="od-section-pad od-about">
            <div className="od-about-grid">
              <div>
                <div className="od-label">The Experience</div>
                <h2 className="od-heading-2">What is<br />Oddyssey Noir</h2>
                <p className="od-about-text">
                  A sensual maze and seductive living room with a pulse, tucked away inside
                  the Oddyssey building at AREA15. Themed rooms and textured corridors open
                  into dynamic dance floors designed for connection and community. Music drives
                  the emotional arc of the night as performers move through the experience as
                  living guides — the entire environment breathing, shifting, and responding
                  in real time.
                </p>
                <p className="od-about-tagline">You&apos;ve Arrived.</p>
                <ul className="od-about-features">
                  {["Themed rooms & textured corridors", "Dynamic dance floors", "Performers as living guides", "Music-driven emotional arc", "Designed for connection & community"].map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="od-about-visual">
                <div className="od-about-visual-inner">
                  <span className="od-about-visual-text">Experience the unknown</span>
                </div>
                <div className="od-about-visual-border" />
              </div>
            </div>
          </section>

          {/* Video */}
          <section className="od-video-section">
            <div className="od-video-bg" />
            <div className="od-video-play">
              <div className="od-play-ring"><div className="od-play-triangle" /></div>
              <span className="od-play-label">Watch the experience</span>
            </div>
          </section>

          {/* Experience */}
          <section className="od-section-pad od-experience" id="od-experience">
            <div className="od-label" style={{ textAlign: "center" }}>Choose Your Path</div>
            <h2 className="od-heading-2" style={{ textAlign: "center" }}>Two Experiences,<br />One Destination</h2>
            <div className="od-experience-grid">
              <div className="od-experience-card">
                <div className="od-exp-bg od-exp-bg-manor" />
                <div className="od-exp-content">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/oddyssey/manor.png" alt="Manor" className="od-exp-logo" />
                  <div className="od-label">Theatre</div>
                  <h3>Oddyssey Manor</h3>
                  <p>Immersive cocktail theatre. A guided journey through velvet-draped rooms, interactive characters, circus performance, and craft cocktails.</p>
                  <div className="od-exp-tags">
                    <span>Guided Journey</span><span>Cocktail Theatre</span><span>Ideal for Groups</span>
                  </div>
                  <a className="od-btn-outline">Explore Manor</a>
                </div>
              </div>
              <div className="od-experience-card">
                <div className="od-exp-bg od-exp-bg-noir" />
                <div className="od-exp-content">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/oddyssey/noir.png" alt="Noir" className="od-exp-logo" />
                  <div className="od-label">Nightclub</div>
                  <h3>Oddyssey Noir</h3>
                  <p>Late-night electronic music environment. Two dance floors, dystopian art, roaming performers, and curated underground sound.</p>
                  <div className="od-exp-tags">
                    <span>Dance Focused</span><span>Electronic Music</span><span>Exploration</span>
                  </div>
                  <a className="od-btn-primary" onClick={() => showPage("calendar")}>View Events</a>
                </div>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="od-section-pad od-proof">
            <div className="od-label" style={{ textAlign: "center" }}>Inside Oddyssey</div>
            <div className="od-proof-grid">
              {["Dance floor", "Performers", "Lighting", "Crowd", "Rooms", "Art", "Atmosphere", "Energy"].map((label, i) => (
                <div key={i} className={`od-proof-cell od-proof-cell-${i + 1}`}>
                  <div className="od-proof-cell-inner" />
                  <span className="od-proof-cell-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="od-proof-caption">
              <p>Nothing else like this in Las Vegas</p>
            </div>
          </section>

          {/* Info */}
          <section className="od-section-pad od-info">
            <div className="od-label" style={{ textAlign: "center" }}>Plan Your Visit</div>
            <div className="od-info-grid">
              <div className="od-info-item">
                <h4>Location</h4>
                <p>3202 W Desert Inn Rd<br />Las Vegas, NV 89102<br /><span style={{ fontSize: 14, color: "var(--text-muted)" }}>Inside AREA15</span></p>
              </div>
              <div className="od-info-item">
                <h4>Hours</h4>
                <p>Friday &amp; Saturday<br />10 PM &mdash; Late</p>
              </div>
              <div className="od-info-item">
                <h4>Requirements</h4>
                <p>21+ Only<br /><span style={{ fontSize: 14, color: "var(--text-muted)" }}>Valid ID Required</span></p>
              </div>
            </div>
          </section>

          {/* Email Capture */}
          <section className="od-section-pad od-capture">
            <div className="od-label">Stay Connected</div>
            <h2 className="od-heading-2">Join the Guest List</h2>
            <p className="od-capture-sub">Early ticket access &bull; Special events &bull; Exclusive announcements</p>
            <form className="od-capture-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </section>

          <Footer />
        </div>
      )}

      {/* ════════ CALENDAR ════════ */}
      {activePage === "calendar" && (
        <div>
          <div className="od-section-pad od-calendar-hero">
            <div className="od-label">Programming</div>
            <h1 className="od-heading-1">Events</h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "1.5px" }}>
              Fridays &amp; Saturdays inside AREA15 &bull; 10 PM &ndash; Late
            </p>
          </div>

          <div className="od-filters">
            {["All Events", "Techno", "House", "Melodic"].map((f, i) => (
              <button key={f} className={`od-filter-btn ${i === 0 ? "active" : ""}`}>{f}</button>
            ))}
            <div className="od-filter-divider" />
            {["April", "May", "June"].map((m) => (
              <button key={m} className="od-filter-btn">{m}</button>
            ))}
          </div>

          <div className="od-calendar-list">
            <CalendarMonth title="April 2026" />
            {[
              { date: "Fri Apr 18", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "Berri" },
              { date: "Sat Apr 19", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "Hector Romero" },
              { date: "Fri Apr 25", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "DJ Brynn Taylor" },
              { date: "Sat Apr 26", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "John Julius Knight" },
            ].map((e, i) => (
              <CalendarEvent key={i} {...e} onClick={() => showPage("detail")} />
            ))}

            <CalendarMonth title="May 2026" />
            {[
              { date: "Fri May 02", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "TBA" },
              { date: "Sat May 03", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "TBA" },
              { date: "Fri May 09", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "TBA" },
              { date: "Sat May 10", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "TBA" },
            ].map((e, i) => (
              <CalendarEvent key={i} {...e} onClick={() => showPage("detail")} />
            ))}

            <CalendarMonth title="June 2026" />
            {[
              { date: "Fri Jun 06", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "TBA" },
              { date: "Sat Jun 07", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "TBA" },
              { date: "Fri Jun 13", name: "Golden Hour + Liquid Gold", genre: "House · Electronic", dj: "TBA" },
              { date: "Sat Jun 14", name: "Golden Hour + Art in Motion", genre: "Multi-genre · Immersive", dj: "TBA" },
            ].map((e, i) => (
              <CalendarEvent key={i} {...e} onClick={() => showPage("detail")} />
            ))}
          </div>

          <div style={{ padding: 60, textAlign: "center" }}>
            <a className="od-btn-outline" onClick={() => window.scrollTo(0, 0)}>Back to Top</a>
          </div>
          <Footer />
        </div>
      )}

      {/* ════════ EVENT DETAIL ════════ */}
      {activePage === "detail" && (
        <div>
          <section className="od-detail-hero">
            <div className="od-detail-hero-bg" />
            <div className="od-hero-texture" />
            <div className="od-detail-hero-content">
              <div className="od-detail-date">Friday, April 11, 2026</div>
              <h1>Liquid<br />Gold</h1>
              <p className="od-detail-sub">Where style, sound, and self-expression collide</p>
              <div className="od-detail-artist">Featuring: Berri</div>
            </div>
          </section>

          <section className="od-detail-info">
            <div className="od-detail-info-grid">
              {[
                { label: "Genre", value: "House · Electronic" },
                { label: "Doors Open", value: "10:00 PM" },
                { label: "Location", value: "AREA15" },
                { label: "Age", value: "21+ Only" },
              ].map((item) => (
                <div key={item.label} className="od-detail-info-item">
                  <h5>{item.label}</h5>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="od-section-pad od-detail-tickets">
            <div className="od-label" style={{ textAlign: "center" }}>Secure Your Entry</div>
            <h2 className="od-heading-2" style={{ textAlign: "center" }}>Select Tier</h2>
            <div className="od-ticket-tiers">
              <TicketTier name="Early Entry" price="$21.80" features={["General admission access", "Both dance floors", "All themed rooms", "Early pricing — limited"]} outline />
              <TicketTier name="General Admission" price="$35" features={["General admission access", "Both dance floors", "All themed rooms", "All performers & installations"]} featured />
              <TicketTier name="VIP Experience" price="$75" features={["Priority entry — skip the line", "Reserved seating area", "Complimentary welcome drink", "All access + backstage lounge"]} outline />
            </div>
          </section>

          <section className="od-section-pad od-detail-gallery">
            <div className="od-label" style={{ textAlign: "center" }}>The Atmosphere</div>
            <div className="od-gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`od-gallery-cell od-gallery-cell-${i}`}>
                  <div className="od-gallery-cell-inner" />
                </div>
              ))}
            </div>
          </section>

          <section className="od-section-pad od-capture" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <h2 className="od-heading-2" style={{ marginBottom: 32 }}>Don&apos;t Miss This Night</h2>
            <a className="od-btn-primary">Get Tickets</a>
          </section>

          <Footer />
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="od-footer">
      <div className="od-footer-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" style={{ height: 24, width: "auto", opacity: 0.5 }} />
      </div>
      <ul className="od-footer-links">
        <li><a>Instagram</a></li>
        <li><a>TikTok</a></li>
        <li><a>Privacy</a></li>
        <li><a>Terms</a></li>
      </ul>
      <div className="od-footer-legal">&copy; 2026 Oddyssey. Part of AREA15 Las Vegas. All rights reserved.</div>
    </footer>
  );
}

function CalendarMonth({ title }: { title: string }) {
  return (
    <div className="od-cal-month"><h3>{title}</h3></div>
  );
}

function CalendarEvent({ date, name, genre, dj, onClick }: { date: string; name: string; genre: string; dj?: string; onClick: () => void }) {
  return (
    <div className="od-cal-event" onClick={onClick}>
      <div className="od-cal-date">{date}</div>
      <div className="od-cal-info">
        <h4>{name}</h4>
        {dj && <span className="od-cal-dj">{dj}</span>}
        <span className="od-cal-genre">{genre}</span>
      </div>
      <div className="od-cal-time">Doors 10 PM</div>
      <div className="od-cal-ticket"><span className="od-btn-primary od-btn-sm">Buy Tickets</span></div>
    </div>
  );
}

function TicketTier({ name, price, features, featured, outline }: { name: string; price: string; features: string[]; featured?: boolean; outline?: boolean }) {
  return (
    <div className={`od-ticket-tier ${featured ? "featured" : ""}`}>
      <div className="od-tier-name">{name}</div>
      <div className="od-tier-price">{price}</div>
      <ul className="od-tier-features">
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <a className={outline ? "od-btn-outline" : "od-btn-primary"} style={{ textAlign: "center" }}>Select</a>
    </div>
  );
}

const styles = `
/* ═══ NAV ═══ */
.od-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 clamp(20px, 4vw, 60px); height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.6s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.6s;
}
.od-nav.scrolled {
  background: rgba(6,6,6,0.85);
  backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid var(--border-subtle);
}
.od-nav-logo { cursor: pointer; display: flex; align-items: center; transition: opacity 0.3s; }
.od-nav-logo:hover { opacity: 0.7; }
.od-nav-logo img { height: 32px; width: auto; }
.od-nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
.od-nav-links a {
  font-size: 11px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--text-secondary); cursor: pointer; transition: color 0.3s; position: relative;
}
.od-nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px;
  background: var(--accent); transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
}
.od-nav-links a:hover { color: var(--text); }
.od-nav-links a:hover::after { width: 100%; }
.od-nav-cta {
  font-size: 10px !important; font-weight: 500 !important; letter-spacing: 3px !important;
  color: var(--bg) !important; background: var(--accent); padding: 10px 24px;
  transition: background 0.3s, transform 0.3s;
}
.od-nav-cta::after { display: none !important; }
.od-nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }
.od-hamburger {
  display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 1001;
}
.od-hamburger span { display: block; width: 24px; height: 1px; background: var(--text); transition: transform 0.4s, opacity 0.3s; }
.od-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
.od-hamburger.open span:nth-child(2) { opacity: 0; }
.od-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
.od-mobile-nav {
  position: fixed; inset: 0; background: var(--bg); z-index: 999;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 32px;
}
.od-mobile-nav a {
  font-family: var(--serif); font-size: 32px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-secondary); cursor: pointer; transition: color 0.3s;
}
.od-mobile-nav a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .od-nav-links { display: none; }
  .od-hamburger { display: flex; }
}

/* ═══ PAGE NAV ═══ */
.od-page-nav {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 900;
  display: flex; gap: 2px; background: rgba(6,6,6,0.9); backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle); padding: 6px;
}
.od-page-nav button {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); padding: 10px 20px; transition: all 0.3s; cursor: pointer;
}
.od-page-nav button:hover { color: var(--text); }
.od-page-nav button.active { background: var(--accent); color: var(--bg); }
@media (max-width: 600px) {
  .od-page-nav { bottom: 12px; padding: 4px; }
  .od-page-nav button { padding: 8px 12px; font-size: 8px; letter-spacing: 1px; }
}

/* ═══ SHARED ═══ */
.od-label {
  font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px;
}
.od-section-pad { padding: clamp(80px,12vw,160px) clamp(20px,6vw,120px); }
.od-heading-1 {
  font-family: var(--serif); font-size: clamp(36px,6vw,72px); font-weight: 300;
  letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px;
}
.od-heading-2 {
  font-family: var(--serif); font-size: clamp(28px,4vw,48px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase;
}
.od-btn-primary {
  display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px;
  text-transform: uppercase; color: var(--bg); background: var(--accent);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.od-btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.2); }
.od-btn-sm { font-size: 9px !important; padding: 12px 28px !important; }
.od-btn-outline {
  display: inline-block; font-size: 10px; font-weight: 400; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-secondary); border: 1px solid var(--border);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s;
}
.od-btn-outline:hover { color: var(--text); border-color: var(--accent); background: var(--accent-dim); }
.od-link {
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
  border-bottom: 1px solid var(--border); padding-bottom: 4px; cursor: pointer; transition: border-color 0.3s;
}
.od-link:hover { border-color: var(--accent); }

/* ═══ HERO ═══ */
.od-hero {
  position: relative; height: 100vh; min-height: 700px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,8vw,120px); overflow: hidden;
}
.od-hero-bg {
  position: absolute; inset: 0; z-index: 1;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(13,8,18,0.8) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.15) 0%, rgba(6,6,6,0.4) 50%, rgba(6,6,6,0.85) 100%),
    url('/oddyssey/oddynoir.png') center/cover no-repeat;
}
.od-hero-texture {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px);
}
.od-hero-ambient {
  position: absolute; inset: 0; z-index: 1;
  background:
    conic-gradient(from 200deg at 30% 70%, transparent 0deg, rgba(201,168,76,0.04) 40deg, transparent 80deg),
    conic-gradient(from 60deg at 75% 35%, transparent 0deg, rgba(80,40,100,0.06) 30deg, transparent 60deg);
  animation: odAmbient 20s ease-in-out infinite alternate;
}
@keyframes odAmbient { 0% { opacity: 0.6; } 100% { opacity: 1; } }
.od-hero-content { position: relative; z-index: 10; max-width: 900px; }
.od-hero-eyebrow {
  font-size: 11px; font-weight: 400; letter-spacing: 5px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px;
  opacity: 0; transform: translateY(20px); animation: odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
}
.od-hero h1 {
  font-family: var(--serif); font-size: clamp(38px,7vw,82px); font-weight: 300;
  line-height: 1.05; letter-spacing: clamp(2px,0.5vw,6px); text-transform: uppercase; margin-bottom: 20px;
  opacity: 0; transform: translateY(30px); animation: odFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
}
.od-hero-sub {
  font-size: clamp(12px,1.4vw,15px); font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-secondary); margin-bottom: 48px;
  opacity: 0; transform: translateY(20px); animation: odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s forwards;
}
.od-hero-actions {
  display: flex; gap: 16px; flex-wrap: wrap;
  opacity: 0; transform: translateY(20px); animation: odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1s forwards;
}
@keyframes odFadeUp { to { opacity: 1; transform: translateY(0); } }
.od-hero-scroll {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0; animation: odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.5s forwards;
}
.od-hero-scroll span { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-muted); }
.od-scroll-line {
  width: 1px; height: 40px; background: linear-gradient(to bottom, var(--accent), transparent);
  animation: odScrollPulse 2s ease-in-out infinite;
}
@keyframes odScrollPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

/* ═══ GOLDEN HOUR ═══ */
.od-golden-hour {
  position: relative; overflow: hidden;
  border-top: 1px solid var(--border-subtle);
  background: linear-gradient(180deg, #0c0906 0%, var(--bg) 100%);
}
.od-golden-inner {
  padding: clamp(60px,10vw,120px) clamp(20px,6vw,120px);
  position: relative;
}
.od-golden-inner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 80%, rgba(212,165,116,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.od-golden-content { position: relative; z-index: 2; max-width: 680px; margin: 0 auto; text-align: center; }
.od-golden-eyebrow {
  font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 16px;
}
.od-golden-title {
  font-family: var(--serif); font-size: clamp(36px,6vw,64px); font-weight: 300;
  letter-spacing: 4px; text-transform: uppercase; color: #d4a574; margin-bottom: 8px;
}
.od-golden-sub {
  font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-secondary); margin-bottom: 40px;
}
.od-golden-details { margin-bottom: 40px; }
.od-golden-time {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0; border-bottom: 1px solid var(--border-subtle);
}
.od-golden-time:first-child { border-top: 1px solid var(--border-subtle); }
.od-golden-time-label {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: #d4a574; font-weight: 500;
}
.od-golden-time-value { font-size: 13px; color: var(--text-secondary); letter-spacing: 0.5px; }
.od-golden-flow {
  display: flex; align-items: center; justify-content: center; gap: 0;
  margin-bottom: 40px; flex-wrap: wrap;
}
.od-golden-flow-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 20px;
}
.od-golden-flow-time {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #d4a574; font-weight: 500;
}
.od-golden-flow-dot {
  width: 8px; height: 8px; border: 1px solid #d4a574; transform: rotate(45deg);
}
.od-golden-flow-text { font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; text-align: center; }
.od-golden-flow-line { width: 40px; height: 1px; background: rgba(212,165,116,0.3); margin-top: 8px; }
.od-btn-golden {
  display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px;
  text-transform: uppercase; color: #0c0906; background: #d4a574;
  padding: 14px 40px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.od-btn-golden:hover { background: #deb68a; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,165,116,0.2); }
.od-event-golden-tag {
  font-size: 10px; letter-spacing: 1.5px; color: #d4a574; margin-bottom: 16px;
  padding: 6px 0; border-top: 1px solid rgba(212,165,116,0.15);
}
@media (max-width: 600px) {
  .od-golden-flow-line { width: 1px; height: 20px; margin-top: 0; }
  .od-golden-flow { flex-direction: column; gap: 8px; }
}

/* ═══ EVENTS PREVIEW ═══ */
.od-events-preview { background: var(--bg); border-top: 1px solid var(--border-subtle); }
.od-events-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; flex-wrap: wrap; gap: 20px; }
.od-event-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border-subtle); }
.od-event-card {
  background: var(--bg); padding: 40px 32px; display: flex; flex-direction: column;
  cursor: pointer; position: relative; transition: background 0.5s;
}
.od-event-card:hover { background: var(--bg-card); }
.od-event-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.od-event-card:hover::before { transform: scaleX(1); }
.od-event-card-friday { background: linear-gradient(180deg, rgba(6,6,6,0.92) 0%, rgba(6,6,6,0.97) 100%), url('/oddyssey/liquid-gold-friday.webp') center/cover no-repeat; }
.od-event-card-friday:hover { background: linear-gradient(180deg, rgba(6,6,6,0.82) 0%, rgba(6,6,6,0.92) 100%), url('/oddyssey/liquid-gold-friday.webp') center/cover no-repeat; }
.od-event-card-friday::before { background: #d4a574 !important; }
.od-event-card-friday .od-event-date { color: #d4a574; }
.od-event-card-saturday { background: linear-gradient(180deg, rgba(6,6,6,0.92) 0%, rgba(6,6,6,0.97) 100%), url('/oddyssey/oddyssey-noir-event.webp') center/cover no-repeat; }
.od-event-card-saturday:hover { background: linear-gradient(180deg, rgba(6,6,6,0.82) 0%, rgba(6,6,6,0.92) 100%), url('/oddyssey/oddyssey-noir-event.webp') center/cover no-repeat; }
.od-event-date { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
.od-event-name { font-family: var(--serif); font-size: clamp(22px,2.5vw,32px); font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; line-height: 1.2; }
.od-event-dj { font-family: var(--serif); font-size: 16px; font-weight: 400; color: var(--text); letter-spacing: 1px; margin-bottom: 8px; }
.od-event-genre { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 32px; }
.od-event-card .od-btn-primary { margin-top: auto; align-self: flex-start; }
@media (max-width: 900px) { .od-event-cards { grid-template-columns: 1fr; } }

/* ═══ ABOUT ═══ */
.od-about {
  background: var(--bg-elevated); border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle); position: relative;
}
.od-about::before {
  content: ''; position: absolute; top: 50%; right: -5%; width: 300px; height: 500px;
  transform: translateY(-50%); background: url('/oddyssey/key.svg') center/contain no-repeat;
  opacity: 0.03; pointer-events: none;
}
.od-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,6vw,100px); align-items: start; }
.od-about-text { font-size: 15px; font-weight: 300; line-height: 1.8; color: var(--text-secondary); margin-bottom: 16px; margin-top: 24px; }
.od-about-tagline { font-family: var(--serif); font-size: 24px; font-weight: 400; font-style: italic; color: var(--accent); letter-spacing: 2px; margin-bottom: 40px; }
.od-about-features { list-style: none; display: flex; flex-direction: column; }
.od-about-features li {
  font-size: 13px; font-weight: 300; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--text-secondary); padding: 16px 0; border-bottom: 1px solid var(--border-subtle);
  display: flex; align-items: center; gap: 16px; transition: color 0.3s, padding-left 0.3s;
}
.od-about-features li:first-child { border-top: 1px solid var(--border-subtle); }
.od-about-features li:hover { color: var(--text); padding-left: 8px; }
.od-about-features li::before {
  content: ''; width: 6px; height: 6px; border: 1px solid var(--accent); flex-shrink: 0; transform: rotate(45deg);
}
.od-about-visual { position: relative; aspect-ratio: 3/4; overflow: hidden; }
.od-about-visual-inner {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 70%, rgba(201,168,76,0.1) 0%, transparent 50%),
    linear-gradient(160deg, rgba(13,10,8,0.3) 0%, rgba(10,8,13,0.4) 100%),
    url('/oddyssey/drink.png') center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
}
.od-about-visual-text {
  font-family: var(--serif); font-size: 14px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--text-muted); writing-mode: vertical-lr; transform: rotate(180deg);
}
.od-about-visual-border { position: absolute; inset: 12px; border: 1px solid var(--border); pointer-events: none; }
@media (max-width: 900px) {
  .od-about-grid { grid-template-columns: 1fr; }
  .od-about-visual { aspect-ratio: 16/9; max-height: 300px; }
}

/* ═══ VIDEO ═══ */
.od-video-section { position: relative; height: 70vh; min-height: 400px; overflow: hidden; cursor: pointer; }
.od-video-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.05) 0%, transparent 50%),
    linear-gradient(180deg, var(--bg) 0%, rgba(6,6,6,0.5) 30%, rgba(6,6,6,0.5) 70%, var(--bg) 100%),
    url('/oddyssey/oddynoir.png') center 30%/cover no-repeat;
  filter: saturate(0.6) brightness(0.4);
}
.od-video-play {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.od-play-ring {
  width: 80px; height: 80px; border: 1px solid var(--accent); border-radius: 50% !important;
  display: flex; align-items: center; justify-content: center; transition: all 0.5s;
}
.od-video-section:hover .od-play-ring { transform: scale(1.1); box-shadow: 0 0 40px rgba(201,168,76,0.15); }
.od-play-triangle { width: 0; height: 0; border-left: 16px solid var(--accent); border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 4px; }
.od-play-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--text-muted); }

/* ═══ EXPERIENCE ═══ */
.od-experience { background: var(--bg); border-top: 1px solid var(--border-subtle); }
.od-experience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border-subtle); margin-top: 60px; }
.od-experience-card { background: var(--bg); padding: clamp(40px,5vw,80px); position: relative; overflow: hidden; transition: background 0.6s; }
.od-experience-card:hover { background: var(--bg-card); }
.od-exp-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s; }
.od-experience-card:hover .od-exp-bg { opacity: 1; }
.od-exp-bg-manor {
  background: radial-gradient(ellipse at 30% 80%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.7), rgba(6,6,6,0.9)),
    url('/oddyssey/drink.png') center/cover no-repeat;
}
.od-exp-bg-noir {
  background: radial-gradient(ellipse at 70% 80%, rgba(80,40,100,0.08) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.6), rgba(6,6,6,0.85)),
    url('/oddyssey/oddynoir.png') center/cover no-repeat;
}
.od-exp-content { position: relative; z-index: 2; }
.od-exp-logo { height: 60px; width: auto; margin-bottom: 20px; opacity: 0.9; filter: brightness(1.1); }
.od-experience-card h3 {
  font-family: var(--serif); font-size: clamp(28px,3.5vw,46px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; line-height: 1.15;
}
.od-experience-card p { font-size: 14px; font-weight: 300; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; }
.od-exp-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
.od-exp-tags span {
  font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted);
  border: 1px solid var(--border-subtle); padding: 6px 14px;
}
@media (max-width: 768px) { .od-experience-grid { grid-template-columns: 1fr; } }

/* ═══ PROOF ═══ */
.od-proof { background: var(--bg-elevated); border-top: 1px solid var(--border-subtle); overflow: hidden; }
.od-proof-grid { display: grid; grid-template-columns: repeat(4,1fr); grid-template-rows: repeat(2,1fr); gap: 4px; margin-top: 60px; aspect-ratio: 2/1; }
.od-proof-cell { position: relative; overflow: hidden; }
.od-proof-cell-inner { position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
.od-proof-cell:hover .od-proof-cell-inner { transform: scale(1.05); }
.od-proof-cell-1 .od-proof-cell-inner { background: url('/oddyssey/oddynoir.png') center/cover; }
.od-proof-cell-2 .od-proof-cell-inner { background: url('/oddyssey/drink.png') center/cover; }
.od-proof-cell-3 .od-proof-cell-inner { background: url('/oddyssey/oddynoir.png') 20% 40%/cover; filter: saturate(0.7) brightness(0.8); }
.od-proof-cell-4 .od-proof-cell-inner { background: linear-gradient(135deg, rgba(13,10,8,0.6), rgba(10,8,13,0.8)), url('/oddyssey/drink.png') 80% center/cover; }
.od-proof-cell-5 .od-proof-cell-inner { background: url('/oddyssey/oddynoir.png') 60% 80%/cover; filter: hue-rotate(20deg) brightness(0.7); }
.od-proof-cell-6 .od-proof-cell-inner { background: url('/oddyssey/drink.png') 30% 60%/cover; filter: saturate(1.2); }
.od-proof-cell-7 .od-proof-cell-inner { background: url('/oddyssey/oddynoir.png') 80% 20%/cover; filter: saturate(0.5) brightness(0.6); }
.od-proof-cell-8 .od-proof-cell-inner { background: url('/oddyssey/oddynoir.png') center 60%/cover; filter: hue-rotate(-10deg) brightness(0.9); }
.od-proof-cell-label {
  position: absolute; bottom: 12px; left: 12px; font-size: 9px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--text-muted); opacity: 0; transform: translateY(8px);
  transition: all 0.4s;
}
.od-proof-cell:hover .od-proof-cell-label { opacity: 1; transform: translateY(0); }
.od-proof-caption { text-align: center; margin-top: 60px; }
.od-proof-caption p { font-family: var(--serif); font-size: clamp(20px,3vw,36px); font-weight: 300; font-style: italic; color: var(--text-secondary); letter-spacing: 2px; }
@media (max-width: 768px) {
  .od-proof-grid { grid-template-columns: repeat(2,1fr); grid-template-rows: repeat(4,1fr); aspect-ratio: 1/2; }
}

/* ═══ INFO ═══ */
.od-info { background: var(--bg); border-top: 1px solid var(--border-subtle); }
.od-info-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border-subtle); margin-top: 60px; }
.od-info-item { background: var(--bg); padding: 40px; text-align: center; }
.od-info-item h4 { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; font-weight: 500; }
.od-info-item p { font-family: var(--serif); font-size: 20px; font-weight: 300; letter-spacing: 1px; color: var(--text-secondary); line-height: 1.6; }
@media (max-width: 600px) { .od-info-grid { grid-template-columns: 1fr; } }

/* ═══ CAPTURE ═══ */
.od-capture { background: var(--bg-elevated); border-top: 1px solid var(--border-subtle); text-align: center; }
.od-capture-sub { font-size: 13px; color: var(--text-muted); letter-spacing: 1.5px; margin-bottom: 40px; margin-top: 12px; }
.od-capture-form { display: flex; justify-content: center; gap: 0; max-width: 520px; margin: 0 auto; }
.od-capture-form input {
  flex: 1; background: var(--bg); border: 1px solid var(--border-subtle); border-right: none;
  padding: 16px 24px; font-family: var(--sans); font-size: 13px; font-weight: 300;
  color: var(--text); outline: none; transition: border-color 0.3s;
}
.od-capture-form input::placeholder { color: var(--text-muted); }
.od-capture-form input:focus { border-color: var(--accent); }
.od-capture-form button {
  background: var(--accent); color: var(--bg); font-size: 10px; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase; padding: 16px 32px;
  border: 1px solid var(--accent); cursor: pointer; transition: background 0.3s; white-space: nowrap;
}
.od-capture-form button:hover { background: var(--accent-hover); }
@media (max-width: 500px) {
  .od-capture-form { flex-direction: column; }
  .od-capture-form input { border-right: 1px solid var(--border-subtle); border-bottom: none; }
}

/* ═══ CALENDAR ═══ */
.od-calendar-hero { padding-top: 140px !important; padding-bottom: 40px !important; border-bottom: 1px solid var(--border-subtle); }
.od-filters {
  padding: 24px clamp(20px,6vw,120px); border-bottom: 1px solid var(--border-subtle);
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}
.od-filter-btn {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);
  padding: 10px 20px; border: 1px solid var(--border-subtle); cursor: pointer; transition: all 0.3s;
  background: transparent;
}
.od-filter-btn:hover, .od-filter-btn.active { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
.od-filter-divider { width: 1px; height: 20px; background: var(--border-subtle); margin: 0 8px; }
.od-calendar-list { padding: 0 clamp(20px,6vw,120px); }
.od-cal-month { padding-top: 48px; margin-bottom: 8px; }
.od-cal-month h3 {
  font-family: var(--serif); font-size: 14px; font-weight: 400; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-muted); padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.od-cal-event {
  display: grid; grid-template-columns: 140px 1fr auto auto; align-items: center; gap: 32px;
  padding: 28px 0; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background 0.3s;
}
.od-cal-event:hover { background: var(--accent-dim); margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
.od-cal-date { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
.od-cal-info h4 {
  font-family: var(--serif); font-size: clamp(18px,2vw,26px); font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;
}
.od-cal-dj { display: block; font-family: var(--serif); font-size: 15px; font-weight: 400; color: var(--text); letter-spacing: 1px; margin-bottom: 4px; }
.od-cal-genre { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); }
.od-cal-time { font-size: 12px; color: var(--text-muted); letter-spacing: 1px; text-align: right; }
@media (max-width: 768px) {
  .od-cal-event { grid-template-columns: 1fr; gap: 12px; padding: 24px 0; }
  .od-cal-time { text-align: left; }
  .od-cal-ticket { justify-self: start; }
}

/* ═══ DETAIL ═══ */
.od-detail-hero {
  position: relative; height: 65vh; min-height: 500px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,6vw,100px); overflow: hidden;
}
.od-detail-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 40% 70%, rgba(212,165,116,0.08) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.2) 0%, rgba(6,6,6,0.8) 100%),
    url('/oddyssey/liquid-gold-friday.webp') center/cover no-repeat;
}
.od-detail-hero-content { position: relative; z-index: 2; }
.od-detail-date {
  font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 20px;
}
.od-detail-hero h1 {
  font-family: var(--serif); font-size: clamp(40px,7vw,86px); font-weight: 300;
  letter-spacing: clamp(3px,0.8vw,8px); text-transform: uppercase; line-height: 1.05; margin-bottom: 12px;
}
.od-detail-sub {
  font-family: var(--serif); font-size: clamp(16px,2vw,24px); font-weight: 300;
  font-style: italic; color: var(--text-secondary); letter-spacing: 2px;
}
.od-detail-artist {
  font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(201,168,76,0.2);
}
.od-detail-info { border-bottom: 1px solid var(--border-subtle); }
.od-detail-info-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border-subtle); }
.od-detail-info-item { background: var(--bg); padding: 32px; text-align: center; }
.od-detail-info-item h5 { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; font-weight: 400; }
.od-detail-info-item p { font-family: var(--serif); font-size: 18px; font-weight: 300; letter-spacing: 1px; }
@media (max-width: 600px) { .od-detail-info-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ TICKETS ═══ */
.od-detail-tickets { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.od-ticket-tiers { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border-subtle); margin-top: 48px; }
.od-ticket-tier {
  background: var(--bg-elevated); padding: clamp(32px,4vw,56px);
  display: flex; flex-direction: column; transition: background 0.4s; position: relative;
}
.od-ticket-tier:hover { background: var(--bg-card); }
.od-ticket-tier.featured { background: var(--bg-card); }
.od-ticket-tier.featured::before {
  content: 'POPULAR'; position: absolute; top: 0; left: 0; right: 0; padding: 8px;
  font-size: 9px; letter-spacing: 3px; text-align: center; background: var(--accent);
  color: var(--bg); font-weight: 500;
}
.od-tier-name { font-family: var(--serif); font-size: 22px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.od-tier-price { font-family: var(--serif); font-size: 36px; font-weight: 300; color: var(--accent); margin-bottom: 24px; }
.od-tier-features { list-style: none; margin-bottom: 32px; flex: 1; }
.od-tier-features li { font-size: 12px; color: var(--text-secondary); padding: 8px 0; border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.5px; }
.od-tier-features li:last-child { border-bottom: none; }
@media (max-width: 768px) { .od-ticket-tiers { grid-template-columns: 1fr; } }

/* ═══ GALLERY ═══ */
.od-detail-gallery { border-bottom: 1px solid var(--border-subtle); }
.od-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; margin-top: 48px; }
.od-gallery-cell { aspect-ratio: 4/3; overflow: hidden; position: relative; }
.od-gallery-cell-inner { position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
.od-gallery-cell:hover .od-gallery-cell-inner { transform: scale(1.08); }
.od-gallery-cell-1 .od-gallery-cell-inner { background: url('/oddyssey/oddynoir.png') center/cover; }
.od-gallery-cell-2 .od-gallery-cell-inner { background: url('/oddyssey/drink.png') center/cover; }
.od-gallery-cell-3 .od-gallery-cell-inner { background: url('/oddyssey/oddynoir.png') 30% 60%/cover; filter: saturate(0.6) brightness(0.8); }
.od-gallery-cell-4 .od-gallery-cell-inner { background: url('/oddyssey/drink.png') 60% center/cover; filter: hue-rotate(10deg); }
.od-gallery-cell-5 .od-gallery-cell-inner { background: url('/oddyssey/oddynoir.png') 70% 30%/cover; filter: brightness(0.7); }
.od-gallery-cell-6 .od-gallery-cell-inner { background: url('/oddyssey/oddynoir.png') center 80%/cover; filter: saturate(0.5) brightness(0.9); }
@media (max-width: 600px) { .od-gallery-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ FOOTER ═══ */
.od-footer {
  padding: 60px clamp(20px,6vw,120px); border-top: 1px solid var(--border-subtle);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
}
.od-footer-links { display: flex; gap: 32px; list-style: none; }
.od-footer-links a { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); cursor: pointer; transition: color 0.3s; }
.od-footer-links a:hover { color: var(--accent); }
.od-footer-legal { width: 100%; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-subtle); font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
`;
