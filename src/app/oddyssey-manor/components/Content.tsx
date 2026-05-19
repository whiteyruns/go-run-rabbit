"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { OddysseyTopNav } from "@/components/oddyssey/OddysseyTopNav";
import { FollowBand } from "@/components/oddyssey/FollowBand";
import { FeaturedEventRail } from "@/components/oddyssey/FeaturedEventRail";
import { ContestBand } from "@/components/oddyssey/ContestBand";
import { annotatedEvents, type AnnotatedEventRow } from "@/components/oddyssey/events-calendar";

type PageName = "home" | "calendar" | "detail" | "private";

export default function OddysseyContent() {
  const [activePage, setActivePage] = useState<PageName>("home");

  const showPage = useCallback((page: PageName) => {
    setActivePage(page);
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

      <OddysseyTopNav
        active="home"
        pageItems={[
          { label: "Events", onClick: () => showPage("calendar") },
          { label: "About", scrollTo: "od-about" },
        ]}
        ctaAction={() => showPage("calendar")}
      />

      {/* PAGE NAV */}
      <div className="od-page-nav">
        {(["home", "calendar", "detail", "private"] as PageName[]).map((p) => (
          <button
            key={p}
            className={activePage === p ? "active" : ""}
            onClick={() => showPage(p)}
          >
            {{ home: "Home", calendar: "Calendar", detail: "Event Detail", private: "Private Events" }[p]}
          </button>
        ))}
      </div>

      {/* ════════ HOME ════════ */}
      {activePage === "home" && (
        <div>
          {/* Hero */}
          <section className="od-hero">
            <video
              className="od-hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/oddyssey/home-hero-poster.jpg"
              aria-hidden="true"
            >
              <source src="/oddyssey/oddy-home-hero.webm" type="video/webm" />
            </video>
            <div className="od-hero-scrim" />
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

          {/* Experience — Manor + Noir, surfaced directly under hero
              so visitors choose their night in the first scroll. */}
          <section className="od-section-pad od-experience" id="od-experience">
            <div className="od-label" style={{ textAlign: "center" }}>Choose Your Path</div>
            <h2 className="od-heading-2" style={{ textAlign: "center" }}>Two Experiences,<br />One Destination</h2>
            <div className="od-experience-grid">
              <div className="od-experience-card">
                <div className="od-exp-bg od-exp-bg-manor" />
                <div className="od-exp-content">
                  <Image src="/oddyssey/manor.webp" alt="Manor" width={404} height={505} className="od-exp-logo" />
                  <div className="od-label">Theatre</div>
                  <h3>Oddyssey Manor</h3>
                  <p>Immersive cocktail theatre. A guided journey through velvet-draped rooms, interactive characters, circus performance, and craft cocktails.</p>
                  <div className="od-exp-tags">
                    <span>Guided Journey</span><span>Cocktail Theatre</span><span>Ideal for Groups</span>
                  </div>
                  <Link href="/oddyssey-manor/manor" className="od-btn-outline">Explore Manor</Link>
                </div>
              </div>
              <div className="od-experience-card">
                <div className="od-exp-bg od-exp-bg-noir" />
                <div className="od-exp-content">
                  <Image src="/oddyssey/noir.webp" alt="Noir" width={404} height={505} className="od-exp-logo" />
                  <div className="od-label">Nightclub</div>
                  <h3>Oddyssey Noir</h3>
                  <p>Late-night electronic music environment. Two dance floors, dystopian art, roaming performers, and curated underground sound.</p>
                  <div className="od-exp-tags">
                    <span>Dance Focused</span><span>Electronic Music</span><span>Exploration</span>
                  </div>
                  <Link href="/oddyssey-manor/noir" className="od-btn-primary">Explore Noir</Link>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Events — special / themed nights surface above
              Golden Hour so a Pride takeover or Halloween night
              doesn't get buried under regular programming. */}
          <FeaturedEventRail
            pageAccent="#c9a84c"
            heading="Don't Miss"
            eyebrow="Featured Events"
          />

          {/* Golden Hour */}
          <section className="od-golden-hour">
            <div className="od-golden-inner">
              <div className="od-golden-content">
                <div className="od-golden-eyebrow">Every Friday &amp; Saturday</div>
                <h2 className="od-golden-title">Golden Hour</h2>
                <p className="od-golden-sub">Tequila Cocktails &bull; KU Champagne &bull; Caviar Bumps</p>
                <div className="od-golden-details">
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Open Bar</span>
                    <span className="od-golden-time-value">10 PM &ndash; Midnight &bull; While supplies last</span>
                  </div>
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Friday</span>
                    <span className="od-golden-time-value">El Bandido Yankee Reposado &bull; KU Champagne</span>
                  </div>
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Saturday</span>
                    <span className="od-golden-time-value">Telson Blanco &bull; KU Champagne</span>
                  </div>
                  <div className="od-golden-time">
                    <span className="od-golden-time-label">Add-ons</span>
                    <span className="od-golden-time-value">Caviar Bumps &middot; Premium pours by request</span>
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
                    <span className="od-golden-flow-text">Liquid Gold (Fri) &middot; Oddyssey Noir (Sat)</span>
                  </div>
                  <div className="od-golden-flow-line" />
                  <div className="od-golden-flow-item">
                    <span className="od-golden-flow-time">Late</span>
                    <span className="od-golden-flow-dot" />
                    <span className="od-golden-flow-text">Full programming through close</span>
                  </div>
                </div>
                <a href="https://oddysseylv.com/noir#tickets" target="_blank" rel="noreferrer" className="od-btn-golden">Get Tickets</a>
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
                { date: "Fri May 22", name: "Liquid\nGold", genre: "House · Electronic", night: "friday", dj: "DJ Brynn Taylor" },
                { date: "Sat May 23", name: "Oddyssey\nNoir", genre: "House · Electronic", night: "saturday", dj: "Tony Touch" },
                { date: "Fri May 29", name: "Liquid\nGold", genre: "House · Electronic", night: "friday", dj: "Soni Withaneye" },
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

          {/* Contest band — sits between the events scroll and the
              About narrative. Functions as the social-growth lever:
              follow → tag → RSVP to enter the monthly drawing. */}
          <ContestBand />

          {/* About */}
          <section className="od-section-pad od-about" id="od-about">
            <div className="od-about-grid">
              <div>
                <div className="od-label">The Experience</div>
                <h2 className="od-heading-2">What is<br />Oddyssey</h2>
                <p className="od-about-text">
                  A premier immersive theatre and alternative nightlife destination born from
                  the fusion of AREA15&apos;s hidden lore and the mythic journey of Homer&apos;s Odyssey.
                  Sirens, shapeshifters, and eccentric hosts invite you to explore velvet-draped
                  rooms, interactive installations, and craft cocktails that blur the line
                  between theatre and nightlife.
                </p>
                <p className="od-about-text" style={{ marginBottom: 8 }}>
                  In the evening, <strong>Oddyssey Manor</strong> opens for immersive cocktail
                  theatre &mdash; four ticket tiers, rotating performance, plated bites. Friday and
                  Saturday after close, the space transforms into <strong>Oddyssey Noir</strong> &mdash;
                  a sensual, living-room maze centered by a pulsing dance floor.
                </p>
                <p className="od-about-tagline">Every guest becomes part of the myth.</p>
                <ul className="od-about-features">
                  {["Velvet-draped rooms & interactive installations", "Sirens, shapeshifters & eccentric hosts", "Craft cocktails & decadent food", "DJs, circus acts & underground intrigue", "Two dance floors through close"].map((f) => (
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

          {/* Video — the live Manor hero video, looped + muted as a
              cinematic break between About and Social Proof. Teases
              what the user sees on the Manor flagship hero. */}
          <section className="od-video-section">
            <video
              className="od-video-el"
              autoPlay muted loop playsInline preload="auto"
              poster="/oddyssey/gal14.webp"
              aria-hidden="true"
            >
              <source src="/oddyssey/oddy-manor-2026.webm" type="video/webm" />
            </video>
            <div className="od-video-scrim" />
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

          {/* Info — both venue schedules surfaced so the home reads
              correctly. Manor runs Thu–Sun (dinner show); Noir runs
              Fri–Sat late. */}
          <section className="od-section-pad od-info">
            <div className="od-label" style={{ textAlign: "center" }}>Plan Your Visit</div>
            <div className="od-info-grid">
              <div className="od-info-item">
                <h4>Location</h4>
                <p>
                  3202 W Desert Inn Rd<br />
                  Las Vegas, NV 89102<br />
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Inside AREA15</span>
                </p>
              </div>
              <div className="od-info-item">
                <h4>Hours</h4>
                <p>
                  <strong style={{ color: "var(--text)" }}>Manor</strong> &middot; Thu–Sun &middot; 6:30 PM<br />
                  <strong style={{ color: "var(--text)" }}>Noir</strong> &middot; Fri–Sat &middot; 10 PM–Late
                </p>
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
      {activePage === "calendar" && <CalendarPage showDetail={() => showPage("detail")} />}

      {/* ════════ EVENT DETAIL ════════ */}
      {activePage === "detail" && (
        <div>
          <section className="od-detail-hero">
            <div className="od-detail-hero-bg" />
            <div className="od-hero-texture" />
            <div className="od-detail-hero-content">
              <div className="od-detail-date">Friday, May 22, 2026</div>
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

          {/* Ticket section removed — events calendar already exposes
              per-event Get Tickets buttons; this card was duplicating. */}

          {/* Bottles & Tables */}
          <section className="od-section-pad od-bottles" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="od-label" style={{ textAlign: "center" }}>Bottles &amp; Tables</div>
            <h2 className="od-heading-2" style={{ textAlign: "center", marginBottom: 48 }}>Reserve a Table</h2>
            <div className="od-bottle-grid">
              <div className="od-bottle-card">
                <div className="od-bottle-name">Standard Table</div>
                <div className="od-bottle-price">$200</div>
                <div className="od-bottle-min">beverage minimum</div>
                <ul className="od-bottle-features">
                  <li>Up to 4 guests</li>
                  <li>Reserved seating area</li>
                  <li>Dedicated server</li>
                  <li>Choice of premium bottles</li>
                </ul>
                <a href="https://oddysseylv.com/noir#tickets" target="_blank" rel="noreferrer" className="od-btn-outline" style={{ textAlign: "center", width: "100%" }}>Reserve</a>
              </div>
              <div className="od-bottle-card od-bottle-featured">
                <div className="od-bottle-name">Private Table</div>
                <div className="od-bottle-price">$350</div>
                <div className="od-bottle-min">beverage minimum</div>
                <ul className="od-bottle-features">
                  <li>Up to 6 guests</li>
                  <li>Premium location</li>
                  <li>Dedicated server</li>
                  <li>Priority entry for group</li>
                  <li>Choice of premium bottles</li>
                </ul>
                <a href="https://oddysseylv.com/noir#tickets" target="_blank" rel="noreferrer" className="od-btn-primary" style={{ textAlign: "center", width: "100%" }}>Reserve</a>
              </div>
              <div className="od-bottle-card">
                <div className="od-bottle-name">VIP Buyout</div>
                <div className="od-bottle-price">Inquire</div>
                <div className="od-bottle-min">custom packages available</div>
                <ul className="od-bottle-features">
                  <li>8+ guests</li>
                  <li>Exclusive section</li>
                  <li>Dedicated host &amp; server</li>
                  <li>Custom bottle selection</li>
                  <li>Priority entry for full group</li>
                </ul>
                <a href="mailto:events@oddysseylv.com?subject=VIP%20Buyout%20inquiry" className="od-btn-outline" style={{ textAlign: "center", width: "100%" }}>Contact Us</a>
              </div>
            </div>

            <div className="od-bottle-menu">
              <div className="od-label" style={{ textAlign: "center", marginTop: 48 }}>Bottle Menu</div>
              <div className="od-menu-grid">
                <div className="od-menu-category">
                  <h4>Vodka</h4>
                  <div className="od-menu-item"><span>Grey Goose</span><span>$450</span></div>
                  <div className="od-menu-item"><span>Belvedere</span><span>$425</span></div>
                  <div className="od-menu-item"><span>Tito&apos;s</span><span>$375</span></div>
                </div>
                <div className="od-menu-category">
                  <h4>Tequila</h4>
                  <div className="od-menu-item"><span>El Bandido Reposado</span><span>$400</span></div>
                  <div className="od-menu-item"><span>Casamigos Blanco</span><span>$450</span></div>
                  <div className="od-menu-item"><span>Don Julio 1942</span><span>$650</span></div>
                </div>
                <div className="od-menu-category">
                  <h4>Whiskey</h4>
                  <div className="od-menu-item"><span>Jameson</span><span>$375</span></div>
                  <div className="od-menu-item"><span>Hennessy VS</span><span>$450</span></div>
                  <div className="od-menu-item"><span>Johnnie Walker Black</span><span>$425</span></div>
                </div>
                <div className="od-menu-category">
                  <h4>Champagne</h4>
                  <div className="od-menu-item"><span>Mo&euml;t Imp&eacute;rial</span><span>$400</span></div>
                  <div className="od-menu-item"><span>Veuve Clicquot</span><span>$450</span></div>
                  <div className="od-menu-item"><span>Dom P&eacute;rignon</span><span>$750</span></div>
                </div>
              </div>
              <p className="od-menu-note">Placeholder pricing for wireframe purposes. All bottles include mixers, ice, and service.</p>
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
            <a href="https://oddysseylv.com/noir#tickets" target="_blank" rel="noreferrer" className="od-btn-primary">Get Tickets</a>
          </section>

          <Footer />
        </div>
      )}

      {/* ════════ PRIVATE EVENTS ════════ */}
      {activePage === "private" && (
        <div>
          {/* Hero */}
          <section className="od-private-hero">
            <div className="od-private-hero-bg" />
            <div className="od-hero-texture" />
            <div className="od-private-hero-content">
              <div className="od-label" style={{ opacity: 0, animation: "odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s forwards" }}>Host at Oddyssey</div>
              <h1 style={{ opacity: 0, animation: "odFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards" }}>Private<br />Events</h1>
              <p className="od-private-hero-sub" style={{ opacity: 0, animation: "odFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s forwards" }}>
                Immersive venues for unforgettable experiences at AREA15
              </p>
            </div>
          </section>

          {/* Intro */}
          <section className="od-section-pad" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ maxWidth: 700 }}>
              <h2 className="od-heading-2" style={{ marginBottom: 20 }}>Your Event,<br />Our World</h2>
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: "var(--text-secondary)" }}>
                Transform Oddyssey into your own immersive venue. Whether it&apos;s a corporate
                reception, product launch, birthday celebration, or bachelorette weekend &mdash;
                our theatrical spaces, production capabilities, and creative team deliver
                experiences that can&apos;t be replicated anywhere else in Las Vegas.
              </p>
            </div>
          </section>

          {/* Spaces */}
          <section className="od-section-pad" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="od-label">Available Spaces</div>
            <h2 className="od-heading-2" style={{ marginBottom: 48 }}>Choose Your Venue</h2>
            <div className="od-private-spaces">
              <div className="od-private-space">
                <div className="od-private-space-img od-private-space-manor" />
                <div className="od-private-space-content">
                  <h3>Oddyssey Manor</h3>
                  <p className="od-private-space-type">Immersive Cocktail Theatre</p>
                  <div className="od-private-space-details">
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Format</span>
                      <span>Full buyout or sectional</span>
                    </div>
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Ideal for</span>
                      <span>Corporate receptions, launch events, milestone celebrations</span>
                    </div>
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Includes</span>
                      <span>Themed rooms, interactive performers, craft cocktail program</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="od-private-space">
                <div className="od-private-space-img od-private-space-noir" />
                <div className="od-private-space-content">
                  <h3>Oddyssey Noir</h3>
                  <p className="od-private-space-type">Late-Night Dance Environment</p>
                  <div className="od-private-space-details">
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Format</span>
                      <span>Full buyout or VIP sections</span>
                    </div>
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Ideal for</span>
                      <span>After-parties, brand activations, bachelorette &amp; birthday</span>
                    </div>
                    <div className="od-private-detail-row">
                      <span className="od-private-detail-label">Includes</span>
                      <span>Two dance floors, DJ, roaming performers, themed corridors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Event Types */}
          <section className="od-section-pad" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="od-label">Event Types</div>
            <h2 className="od-heading-2" style={{ marginBottom: 48 }}>What We Host</h2>
            <div className="od-private-types">
              {[
                { title: "Corporate", desc: "Receptions, team events, product launches, client entertainment" },
                { title: "Celebrations", desc: "Birthdays, bachelorette & bachelor parties, anniversaries" },
                { title: "Brand Activations", desc: "Immersive branded experiences, influencer events, press launches" },
                { title: "Wedding Events", desc: "Rehearsal dinners, after-parties, non-traditional ceremonies" },
                { title: "Holiday Parties", desc: "Company holiday events, New Year's Eve, themed seasonal gatherings" },
                { title: "Full Buyouts", desc: "Exclusive access to Manor, Noir, or both for your group" },
              ].map((t) => (
                <div key={t.title} className="od-private-type">
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What's Included */}
          <section className="od-section-pad" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="od-label">Services</div>
            <h2 className="od-heading-2" style={{ marginBottom: 48 }}>What&apos;s Included</h2>
            <div className="od-private-services">
              {[
                { title: "Production", items: ["Sound & lighting design", "4K projection mapping", "Custom branded content"] },
                { title: "Entertainment", items: ["Curated DJ sets", "Roaming performers", "Interactive characters"] },
                { title: "Food & Beverage", items: ["Custom cocktail menus", "Catering packages", "Bottle service & VIP tables"] },
                { title: "Planning", items: ["Dedicated event coordinator", "Day-of production management", "Photography & videography"] },
              ].map((s) => (
                <div key={s.title} className="od-private-service">
                  <h4>{s.title}</h4>
                  <ul>
                    {s.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Inquiry Form */}
          <section className="od-section-pad od-capture">
            <div className="od-label">Get Started</div>
            <h2 className="od-heading-2">Request a Consultation</h2>
            <p className="od-capture-sub">Tell us about your event and our team will follow up within 24 hours.</p>
            <form className="od-private-form" onSubmit={(e) => e.preventDefault()}>
              <div className="od-private-form-grid">
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
              <button type="submit" className="od-btn-primary" style={{ width: "100%", textAlign: "center" }}>Submit Inquiry</button>
            </form>
          </section>

          {/* Info */}
          <section className="od-section-pad od-info" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="od-info-grid">
              <div className="od-info-item">
                <h4>Location</h4>
                <p>Oddyssey at AREA15<br />3202 W Desert Inn Rd<br />Las Vegas, NV 89102</p>
              </div>
              <div className="od-info-item">
                <h4>Contact</h4>
                <p>events@oddysseylv.com<br />702-846-7900</p>
              </div>
              <div className="od-info-item">
                <h4>Requirements</h4>
                <p>21+ events only<br />Minimum guest counts apply</p>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <>
      <FollowBand
        instagram="oddysseylv"
        instagramSecondary="oddyssey.manor"
        tiktok="oddysseylv"
        accent="#c9a84c"
        blurb="DJ lineups, weekly drops, behind-the-scenes — first on social. Followers + taggers enter the monthly drawing for a free Manor + Noir night."
      />
      <footer className="od-footer">
        <div className="od-footer-logo">
          <Image src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" width={129} height={62} style={{ height: 24, width: "auto", opacity: 0.5 }} />
        </div>
        <ul className="od-footer-links">
          <li>
            <a href="https://www.instagram.com/oddysseylv/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </li>
          <li>
            <a href="https://www.tiktok.com/@oddysseylv" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          </li>
          <li><a>Privacy</a></li>
          <li><a>Terms</a></li>
        </ul>
        <div className="od-footer-legal">&copy; 2026 Oddyssey. Part of AREA15 Las Vegas. All rights reserved.</div>
      </footer>
    </>
  );
}

function CalendarMonth({ title, tbaCount }: { title: string; tbaCount?: number }) {
  return (
    <div className="od-cal-month">
      <h3>{title}</h3>
      {tbaCount && tbaCount > 0 ? (
        <span className="od-cal-month-note">
          + {tbaCount} more {tbaCount === 1 ? "date" : "dates"} dropping — follow{" "}
          <a href="https://www.instagram.com/oddysseylv/" target="_blank" rel="noopener noreferrer">@oddysseylv</a>
        </span>
      ) : null}
    </div>
  );
}

type NightFilter = "all" | "friday" | "saturday" | "featured";
type MonthFilter = "all" | "05" | "06" | "07";

function CalendarPage({ showDetail }: { showDetail: () => void }) {
  const [night, setNight] = useState<NightFilter>("all");
  const [month, setMonth] = useState<MonthFilter>("all");

  const annotated = annotatedEvents();

  // Visible after filter pass.
  const visible = annotated.filter((e) => {
    if (night === "friday" && e.night !== "friday") return false;
    if (night === "saturday" && e.night !== "saturday") return false;
    if (night === "featured" && !e.featuredSlug) return false;
    if (month !== "all" && e.dateISO.slice(5, 7) !== month) return false;
    return true;
  });

  // Filterable but TBA-only rows get collapsed into a per-month
  // 'more dates dropping' tag rather than printed as a wall of TBA.
  const showable = visible.filter((e) => e.dj || e.featuredSlug);

  // Group surviving events by month for headered render.
  const months: { key: string; label: string; events: typeof showable; tbaCount: number }[] = [];
  const tbaByMonth: Record<string, number> = {};
  for (const e of visible) {
    if (!e.dj && !e.featuredSlug) {
      const k = e.dateISO.slice(0, 7);
      tbaByMonth[k] = (tbaByMonth[k] ?? 0) + 1;
    }
  }
  for (const e of showable) {
    const k = e.dateISO.slice(0, 7);
    let m = months.find((mm) => mm.key === k);
    if (!m) {
      const [yr, mo] = k.split("-");
      const labelMap: Record<string, string> = { "05": "May", "06": "June", "07": "July" };
      m = { key: k, label: `${labelMap[mo]} ${yr}`, events: [], tbaCount: tbaByMonth[k] ?? 0 };
      months.push(m);
    }
    m.events.push(e);
  }
  // Months with TBA-only events but no showables still get a header so
  // the 'more dates dropping' callout surfaces.
  for (const k of Object.keys(tbaByMonth)) {
    if (months.find((m) => m.key === k)) continue;
    const [yr, mo] = k.split("-");
    const labelMap: Record<string, string> = { "05": "May", "06": "June", "07": "July" };
    months.push({ key: k, label: `${labelMap[mo]} ${yr}`, events: [], tbaCount: tbaByMonth[k] });
  }
  months.sort((a, b) => a.key.localeCompare(b.key));

  const NIGHT_OPTS: { id: NightFilter; label: string }[] = [
    { id: "all", label: "All Events" },
    { id: "friday", label: "Liquid Gold (Fri)" },
    { id: "saturday", label: "Noir (Sat)" },
    { id: "featured", label: "Featured" },
  ];
  const MONTH_OPTS: { id: MonthFilter; label: string }[] = [
    { id: "all", label: "All Months" },
    { id: "05", label: "May" },
    { id: "06", label: "June" },
    { id: "07", label: "July" },
  ];

  return (
    <div>
      <div className="od-section-pad od-calendar-hero">
        <div className="od-label">Programming</div>
        <h1 className="od-heading-1">Events</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "1.5px" }}>
          Fridays &amp; Saturdays inside AREA15 &bull; 10 PM &ndash; Late
        </p>
      </div>

      <div className="od-filters">
        {NIGHT_OPTS.map((f) => (
          <button
            key={f.id}
            className={`od-filter-btn ${night === f.id ? "active" : ""}`}
            onClick={() => setNight(f.id)}
          >
            {f.label}
          </button>
        ))}
        <div className="od-filter-divider" />
        {MONTH_OPTS.map((m) => (
          <button
            key={m.id}
            className={`od-filter-btn ${month === m.id ? "active" : ""}`}
            onClick={() => setMonth(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="od-calendar-list">
        {months.length === 0 ? (
          <div className="od-cal-empty">
            <p>No events match — try a different filter.</p>
            <button className="od-btn-outline" onClick={() => { setNight("all"); setMonth("all"); }}>
              Reset filters
            </button>
          </div>
        ) : (
          months.map((m) => (
            <div key={m.key}>
              <CalendarMonth title={m.label} tbaCount={m.tbaCount} />
              {m.events.map((e) => (
                <CalendarEvent key={e.dateISO} event={e} showDetail={showDetail} />
              ))}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: 60, textAlign: "center" }}>
        <a className="od-btn-outline" onClick={() => window.scrollTo(0, 0)}>Back to Top</a>
      </div>
      <Footer />
    </div>
  );
}

function CalendarEvent({ event, showDetail }: { event: AnnotatedEventRow; showDetail: () => void }) {
  const accent = event.accent ?? "var(--accent)";
  const inner = (
    <>
      <div className="od-cal-date">{event.date}</div>
      <div className="od-cal-info">
        {event.eyebrow && (
          <span className="od-cal-eyebrow" style={{ color: accent }}>{event.eyebrow}</span>
        )}
        <h4>{event.displayName}</h4>
        {event.dj && <span className="od-cal-dj">{event.dj}</span>}
        <span className="od-cal-genre">House · Electronic</span>
      </div>
      <div className="od-cal-time">Doors 10 PM</div>
      <div className="od-cal-ticket">
        <span className="od-btn-primary od-btn-sm" style={event.featuredSlug ? { background: accent } : undefined}>
          {event.featuredSlug ? "Open Event" : "Buy Tickets"}
        </span>
      </div>
    </>
  );
  if (event.featuredSlug) {
    return (
      <Link href={`/oddyssey-manor/events/${event.featuredSlug}`} className="od-cal-event od-cal-event-featured">
        {inner}
      </Link>
    );
  }
  return (
    <div className="od-cal-event" onClick={showDetail}>
      {inner}
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
  .od-page-nav { bottom: 12px; padding: 3px; left: 8px; right: 8px; transform: none; }
  .od-page-nav button { padding: 8px 8px; font-size: 7px; letter-spacing: 0.5px; flex: 1; }
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
.od-hero-video {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  filter: saturate(0.95) brightness(0.75);
}
.od-hero-scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(13,8,18,0.6) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.15) 0%, rgba(6,6,6,0.45) 50%, rgba(6,6,6,0.88) 100%);
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
    url('/oddyssey/gal17.webp') center/cover no-repeat;
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
.od-video-section { position: relative; height: 70vh; min-height: 400px; overflow: hidden; }
.od-video-el {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; pointer-events: none;
}
.od-video-scrim {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.04) 0%, transparent 50%),
    linear-gradient(180deg, var(--bg) 0%, rgba(6,6,6,0.30) 18%, rgba(6,6,6,0.30) 82%, var(--bg) 100%);
}

/* ═══ EXPERIENCE ═══ */
.od-experience { background: var(--bg); border-top: 1px solid var(--border-subtle); }
.od-experience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border-subtle); margin-top: 60px; }
.od-experience-card { background: var(--bg); padding: clamp(40px,5vw,80px); position: relative; overflow: hidden; transition: background 0.6s; }
.od-experience-card:hover { background: var(--bg-card); }
.od-exp-bg { position: absolute; inset: 0; opacity: 0.55; transition: opacity 0.8s; }
.od-experience-card:hover .od-exp-bg { opacity: 0.95; }
/* Card hover backgrounds use the cinematic brand shoots — gal15
   (small 700px) was upscaled and pixelated; gal8 was the same risqué
   shot we pulled off the Noir hero + Private. Manor card now uses
   manor1 (performer + wolf-mask, red lanterns); Noir card uses the
   noir-hero-poster (DJ neon + AREA15 exterior at night). */
.od-exp-bg-manor {
  background: radial-gradient(ellipse at 30% 80%, rgba(201,168,76,0.10) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.55), rgba(6,6,6,0.85)),
    url('/oddyssey/manor1.jpg') center/cover no-repeat;
}
.od-exp-bg-noir {
  background: radial-gradient(ellipse at 70% 80%, rgba(180,110,200,0.10) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,6,6,0.5), rgba(6,6,6,0.85)),
    url('/oddyssey/noir-hero-poster.jpg') center/cover no-repeat;
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
/* Cinematic shoots replace the small gal*.webp tiles. Mapping reads
   loosely along the label set (Dance floor / Performers / Lighting /
   Crowd / Rooms / Art / Atmosphere / Energy). gal8 (the risqué shot
   we already pulled off the Noir hero, Private Noir card, and Manor
   experience hover) is finally retired from the public-facing pages. */
.od-proof-cell-1 .od-proof-cell-inner { background: url('/oddyssey/home-hero-poster.jpg') center/cover; }
.od-proof-cell-2 .od-proof-cell-inner { background: url('/oddyssey/manor1.jpg') center/cover; }
.od-proof-cell-3 .od-proof-cell-inner { background: url('/oddyssey/manor4.jpg') center/cover; }
.od-proof-cell-4 .od-proof-cell-inner { background: url('/oddyssey/dinner-guest.jpg') center/cover; }
.od-proof-cell-5 .od-proof-cell-inner { background: url('/oddyssey/manor-hero-poster.jpg') center/cover; }
.od-proof-cell-6 .od-proof-cell-inner { background: url('/oddyssey/manor3.jpg') center/cover; }
.od-proof-cell-7 .od-proof-cell-inner { background: url('/oddyssey/voyeur-img2.jpg') center/cover; }
.od-proof-cell-8 .od-proof-cell-inner { background: url('/oddyssey/noir-hero-poster.jpg') center/cover; }
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
.od-cal-month { padding-top: 48px; margin-bottom: 8px; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; }
.od-cal-month h3 {
  font-family: var(--serif); font-size: 14px; font-weight: 400; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-muted); margin: 0;
}
.od-cal-month-note { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); font-style: italic; }
.od-cal-month-note a { color: var(--accent); text-decoration: none; }
.od-cal-month-note a:hover { text-decoration: underline; }
.od-cal-event {
  display: grid; grid-template-columns: 140px 1fr auto auto; align-items: center; gap: 32px;
  padding: 28px 0; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background 0.3s;
  text-decoration: none; color: inherit;
}
.od-cal-event:hover { background: var(--accent-dim); margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
.od-cal-event-featured { background: rgba(180,110,200,0.04); }
.od-cal-event-featured:hover { background: rgba(180,110,200,0.10); }
.od-cal-date { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
.od-cal-eyebrow { display: block; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; font-weight: 500; }
.od-cal-info h4 {
  font-family: var(--serif); font-size: clamp(18px,2vw,26px); font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;
}
.od-cal-dj { display: block; font-family: var(--serif); font-size: 15px; font-weight: 400; color: var(--text); letter-spacing: 1px; margin-bottom: 4px; }
.od-cal-genre { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); }
.od-cal-time { font-size: 12px; color: var(--text-muted); letter-spacing: 1px; text-align: right; }
.od-cal-empty { padding: 80px 20px; text-align: center; color: var(--text-secondary); }
.od-cal-empty p { font-size: 14px; letter-spacing: 1px; margin-bottom: 24px; }
.od-cal-empty button { font-family: inherit; cursor: pointer; }
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
    url('/oddyssey/gal7.webp') center/cover no-repeat;
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
.od-ticket-tiers.od-ticket-tiers-single { grid-template-columns: minmax(0, 520px); justify-content: center; background: transparent; }
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

/* ═══ BOTTLES & TABLES ═══ */
.od-bottle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border-subtle); }
.od-bottle-card {
  background: var(--bg); padding: clamp(24px,3vw,40px); display: flex; flex-direction: column;
  transition: background 0.4s; position: relative;
}
.od-bottle-card:hover { background: var(--bg-card); }
.od-bottle-featured { background: var(--bg-card); }
.od-bottle-featured::before {
  content: 'POPULAR'; position: absolute; top: 0; left: 0; right: 0; padding: 8px;
  font-size: 9px; letter-spacing: 3px; text-align: center; background: var(--accent);
  color: var(--bg); font-weight: 500;
}
.od-bottle-name { font-family: var(--serif); font-size: 22px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.od-bottle-price { font-family: var(--serif); font-size: 36px; font-weight: 300; color: var(--accent); margin-bottom: 4px; }
.od-bottle-min { font-size: 11px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 24px; }
.od-bottle-features { list-style: none; margin-bottom: 28px; flex: 1; }
.od-bottle-features li { font-size: 12px; color: var(--text-secondary); padding: 7px 0; border-bottom: 1px solid var(--border-subtle); }
.od-bottle-features li:last-child { border-bottom: none; }

.od-menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border-subtle); margin-top: 16px; }
.od-menu-category { background: var(--bg); padding: 24px; }
.od-menu-category h4 { font-family: var(--serif); font-size: 16px; font-weight: 400; letter-spacing: 1px; color: var(--accent); margin-bottom: 16px; }
.od-menu-item { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); padding: 8px 0; border-bottom: 1px solid var(--border-subtle); }
.od-menu-item:last-child { border-bottom: none; }
.od-menu-note { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 16px; font-style: italic; }
@media (max-width: 768px) { .od-bottle-grid { grid-template-columns: 1fr; } .od-menu-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .od-menu-grid { grid-template-columns: 1fr; } }

/* ═══ GALLERY ═══ */
.od-detail-gallery { border-bottom: 1px solid var(--border-subtle); }
.od-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; margin-top: 48px; }
.od-gallery-cell { aspect-ratio: 4/3; overflow: hidden; position: relative; }
.od-gallery-cell-inner { position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
.od-gallery-cell:hover .od-gallery-cell-inner { transform: scale(1.08); }
.od-gallery-cell-1 .od-gallery-cell-inner { background: url('/oddyssey/gal6.webp') center/cover; }
.od-gallery-cell-2 .od-gallery-cell-inner { background: url('/oddyssey/gal15.webp') center/cover; }
.od-gallery-cell-3 .od-gallery-cell-inner { background: url('/oddyssey/gal17.webp') center/cover; }
.od-gallery-cell-4 .od-gallery-cell-inner { background: url('/oddyssey/gal5.webp') center/cover; }
.od-gallery-cell-5 .od-gallery-cell-inner { background: url('/oddyssey/gal11.webp') center/cover; }
.od-gallery-cell-6 .od-gallery-cell-inner { background: url('/oddyssey/gal16.webp') center/cover; }
@media (max-width: 600px) { .od-gallery-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ PRIVATE EVENTS ═══ */
.od-private-hero {
  position: relative; height: 55vh; min-height: 420px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,6vw,100px); overflow: hidden;
}
.od-private-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 70%, rgba(201,168,76,0.06) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.3) 0%, rgba(6,6,6,0.85) 100%),
    url('/oddyssey/gal5.webp') center/cover no-repeat;
}
.od-private-hero-content { position: relative; z-index: 2; }
.od-private-hero h1 {
  font-family: var(--serif); font-size: clamp(40px,7vw,76px); font-weight: 300;
  letter-spacing: clamp(3px,0.8vw,6px); text-transform: uppercase; line-height: 1.05; margin-bottom: 12px;
}
.od-private-hero-sub { font-size: 14px; color: var(--text-secondary); letter-spacing: 2px; }

/* Spaces */
.od-private-spaces { display: flex; flex-direction: column; gap: 1px; background: var(--border-subtle); }
.od-private-space {
  display: grid; grid-template-columns: 280px 1fr; background: var(--bg-elevated);
  transition: background 0.4s;
}
.od-private-space:hover { background: var(--bg-card); }
.od-private-space-img { min-height: 240px; }
.od-private-space-manor {
  background: linear-gradient(135deg, rgba(6,6,6,0.2), rgba(6,6,6,0.5)), url('/oddyssey/gal15.webp') center/cover no-repeat;
}
.od-private-space-noir {
  background: linear-gradient(135deg, rgba(6,6,6,0.2), rgba(6,6,6,0.5)), url('/oddyssey/gal8.webp') center/cover no-repeat;
}
.od-private-space-content { padding: 32px; }
.od-private-space-content h3 {
  font-family: var(--serif); font-size: 24px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;
}
.od-private-space-type { font-size: 12px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
.od-private-space-details { display: flex; flex-direction: column; }
.od-private-detail-row {
  display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);
  font-size: 13px; color: var(--text-secondary);
}
.od-private-detail-row:last-child { border-bottom: none; }
.od-private-detail-label {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
  font-weight: 500; min-width: 80px; padding-top: 2px; flex-shrink: 0;
}
@media (max-width: 768px) {
  .od-private-space { grid-template-columns: 1fr; }
  .od-private-space-img { min-height: 180px; }
}

/* Event Types */
.od-private-types {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border-subtle);
}
.od-private-type {
  background: var(--bg); padding: 28px; transition: background 0.3s;
}
.od-private-type:hover { background: var(--bg-card); }
.od-private-type h4 {
  font-family: var(--serif); font-size: 18px; font-weight: 400;
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;
}
.od-private-type p { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
@media (max-width: 768px) { .od-private-types { grid-template-columns: 1fr; } }

/* Services */
.od-private-services {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border-subtle);
}
.od-private-service {
  background: var(--bg-elevated); padding: 28px;
}
.od-private-service h4 {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin-bottom: 16px;
}
.od-private-service ul { list-style: none; }
.od-private-service li {
  font-size: 13px; color: var(--text-secondary); padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.od-private-service li:last-child { border-bottom: none; }
@media (max-width: 768px) { .od-private-services { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .od-private-services { grid-template-columns: 1fr; } }

/* Inquiry Form */
.od-private-form { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
.od-private-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.od-private-form input, .od-private-form select, .od-private-form textarea {
  background: var(--bg); border: 1px solid var(--border-subtle); padding: 16px 20px;
  font-family: var(--sans); font-size: 13px; font-weight: 300; color: var(--text);
  outline: none; transition: border-color 0.3s; width: 100%;
}
.od-private-form input::placeholder, .od-private-form textarea::placeholder { color: var(--text-muted); }
.od-private-form input:focus, .od-private-form select:focus, .od-private-form textarea:focus { border-color: var(--accent); }
.od-private-form select { color: var(--text-muted); appearance: none; cursor: pointer; }
.od-private-form textarea { resize: vertical; min-height: 100px; }
@media (max-width: 500px) { .od-private-form-grid { grid-template-columns: 1fr; } }

/* ═══ FOOTER ═══ */
.od-footer {
  padding: 60px clamp(20px,6vw,120px) 80px; border-top: 1px solid var(--border-subtle);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
}
.od-footer-links { display: flex; gap: 32px; list-style: none; }
.od-footer-links a { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); cursor: pointer; transition: color 0.3s; }
.od-footer-links a:hover { color: var(--accent); }
.od-footer-legal { width: 100%; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-subtle); font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }

/* ═══ MOBILE FALLBACKS ═══ */
/* Any multi-column grid on this page that didn't already have a
   mobile rule. Two breakpoints: 900px collapses tablets, 600px
   collapses phones. */
@media (max-width: 900px) {
  .od-experience-grid { grid-template-columns: 1fr; }
  .od-about-grid { grid-template-columns: 1fr; gap: 32px; }
  .od-private-form-grid { grid-template-columns: 1fr; }
  .od-info-grid { grid-template-columns: 1fr 1fr; }
  .od-private-types { grid-template-columns: 1fr 1fr; }
  .od-ticket-tiers { grid-template-columns: 1fr; }
  .od-event-cards { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .od-info-grid { grid-template-columns: 1fr; }
  .od-private-types { grid-template-columns: 1fr; }
}
`;
