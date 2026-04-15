"use client";

import AuthGate from "./components/AuthGate";

function SitePlanMap() {
  return (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="site-plan-svg">
      <defs>
        {/* Playa ground texture */}
        <pattern id="playa" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#141210" />
          <circle cx="1" cy="2" r=".3" fill="#1e1c18" opacity=".6" />
          <circle cx="4" cy="5" r=".25" fill="#1a1814" opacity=".5" />
          <circle cx="3" cy="1" r=".2" fill="#1e1c18" opacity=".4" />
        </pattern>
        {/* Desert brush scatter */}
        <pattern id="brush" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="8" r="2" fill="#1a1a14" opacity=".3" />
          <circle cx="45" cy="22" r="1.5" fill="#1a1a14" opacity=".25" />
          <circle cx="28" cy="48" r="2.5" fill="#1a1a14" opacity=".2" />
          <circle cx="52" cy="55" r="1.8" fill="#1a1a14" opacity=".3" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softglow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground */}
      <rect width="800" height="600" fill="url(#playa)" />
      <rect width="800" height="600" fill="url(#brush)" />

      {/* Grid lines — subtle survey marks */}
      <g stroke="#1e1c18" strokeWidth=".5" opacity=".3">
        <line x1="0" y1="150" x2="800" y2="150" strokeDasharray="2 8" />
        <line x1="0" y1="300" x2="800" y2="300" strokeDasharray="2 8" />
        <line x1="0" y1="450" x2="800" y2="450" strokeDasharray="2 8" />
        <line x1="200" y1="0" x2="200" y2="600" strokeDasharray="2 8" />
        <line x1="400" y1="0" x2="400" y2="600" strokeDasharray="2 8" />
        <line x1="600" y1="0" x2="600" y2="600" strokeDasharray="2 8" />
      </g>

      {/* === FIGURE-8 ULTRA COURSE === */}
      {/* Two large loops west of the oval, well-separated from track */}
      <g className="ultra-course">
        {/* Upper loop */}
        <ellipse cx="200" cy="200" rx="110" ry="95"
          fill="none" stroke="#c5532a" strokeWidth="2" strokeDasharray="8 5"
          opacity=".5" />
        {/* Lower loop */}
        <ellipse cx="200" cy="400" rx="110" ry="95"
          fill="none" stroke="#c5532a" strokeWidth="2" strokeDasharray="8 5"
          opacity=".5" />
        {/* Crossing point glow */}
        <circle cx="200" cy="300" r="8" fill="#c5532a" opacity=".08" filter="url(#softglow)" />
        <circle cx="200" cy="300" r="3" fill="#c5532a" opacity=".6" className="pulse-dot" />
        {/* Ultra label */}
        <text x="88" y="205" fill="#c5532a" fontSize="9" letterSpacing="3"
          fontFamily="Anton, sans-serif" opacity=".7">ULTRA COURSE</text>
        <text x="88" y="218" fill="#a8957c" fontSize="7" letterSpacing="2"
          fontFamily="Inter, sans-serif" opacity=".5">FIGURE-8 LOOP</text>
      </g>

      {/* === MAIN OVAL TRACK (400m, 8 lanes) === */}
      {/* Positioned center-right, oriented with straights running roughly N-S */}
      <g className="main-track" transform="translate(480, 300)">
        {/* Safety perimeter — red boundary line */}
        <ellipse cx="0" cy="0" rx="142" ry="108"
          fill="none" stroke="#c5532a" strokeWidth="1" opacity=".25" />

        {/* Track surface — subtle fill */}
        <ellipse cx="0" cy="0" rx="130" ry="96"
          fill="#161412" stroke="none" />

        {/* 8 lanes — outer to inner */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <ellipse key={i} cx="0" cy="0"
            rx={130 - i * 10} ry={96 - i * 7.5}
            fill="none" stroke="#f5f1e8"
            strokeWidth={i === 0 ? "1.5" : "0.6"}
            opacity={i === 0 ? ".7" : ".2"} />
        ))}

        {/* Lane numbers */}
        {[1,2,3,4,5,6,7,8].map(i => (
          <text key={i} x={-135 + (i-1) * 10 + 5} y="4"
            fill="#a8957c" fontSize="6" textAnchor="middle"
            fontFamily="Inter, sans-serif" opacity=".4">{i}</text>
        ))}

        {/* Start/Finish line — eastern straight */}
        <line x1="90" y1="-96" x2="90" y2="96"
          stroke="#f5f1e8" strokeWidth="2" opacity=".5" />
        <line x1="88" y1="-96" x2="88" y2="96"
          stroke="#f5f1e8" strokeWidth="0.5" opacity=".3" />

        {/* S/F label */}
        <text x="100" y="-80" fill="#f5f1e8" fontSize="7" letterSpacing="2"
          fontFamily="Inter, sans-serif" opacity=".5">S/F</text>

        {/* Stagger marks on the curves */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <line key={`stag-${i}`}
            x1={-130 + i * 10} y1={-2}
            x2={-130 + i * 10} y2={2}
            stroke="#f5f1e8" strokeWidth="0.5" opacity=".3" />
        ))}

        {/* Track label */}
        <text x="0" y="0" fill="#f5f1e8" fontSize="10" textAnchor="middle"
          fontFamily="Anton, sans-serif" letterSpacing="4" opacity=".15">400M OVAL</text>
      </g>

      {/* === STAGING / OPERATIONS AREA === */}
      <g className="staging">
        {/* Staging area — east of the track */}
        <rect x="645" y="245" width="80" height="55" rx="2"
          fill="none" stroke="#a8957c" strokeWidth="0.8" strokeDasharray="3 3" opacity=".4" />
        <text x="660" y="259" fill="#a8957c" fontSize="7" letterSpacing="2"
          fontFamily="Inter, sans-serif" opacity=".5">STAGING</text>

        {/* Medical tent */}
        <rect x="650" y="268" width="16" height="12" rx="1"
          fill="#c5532a" opacity=".15" stroke="#c5532a" strokeWidth="0.5" />
        <text x="658" y="276" fill="#c5532a" fontSize="5" textAnchor="middle"
          fontFamily="Inter, sans-serif" opacity=".7">MED</text>

        {/* Portable toilets — small icons */}
        <g opacity=".4">
          <rect x="672" y="268" width="5" height="5" fill="#4a8c8c" rx=".5" />
          <rect x="679" y="268" width="5" height="5" fill="#4a8c8c" rx=".5" />
          <rect x="686" y="268" width="5" height="5" fill="#4a8c8c" rx=".5" />
          <rect x="672" y="275" width="5" height="5" fill="#4a8c8c" rx=".5" />
          <rect x="679" y="275" width="5" height="5" fill="#4a8c8c" rx=".5" />
          <text x="672" y="290" fill="#4a8c8c" fontSize="5"
            fontFamily="Inter, sans-serif" opacity=".8">WC ×9</text>
        </g>

        {/* EMS vehicle icon */}
        <rect x="700" y="270" width="14" height="8" rx="1"
          fill="#c5532a" opacity=".2" stroke="#c5532a" strokeWidth="0.5" />
        <text x="707" y="276" fill="#c5532a" fontSize="4" textAnchor="middle"
          fontFamily="Inter, sans-serif" opacity=".7">EMS</text>
      </g>

      {/* === STAFF PARKING === */}
      <g className="parking">
        <rect x="645" y="120" width="110" height="65" rx="2"
          fill="#0f0e0c" stroke="#a8957c" strokeWidth="0.8" strokeDasharray="4 3" opacity=".35" />
        <text x="670" y="140" fill="#a8957c" fontSize="8" letterSpacing="2"
          fontFamily="Inter, sans-serif" opacity=".5">STAFF PARKING</text>
        <text x="670" y="152" fill="#a8957c" fontSize="6" letterSpacing="1"
          fontFamily="Inter, sans-serif" opacity=".35">20 VEHICLES</text>
        {/* Vehicle markers */}
        {[0,1,2,3,4].map(i => (
          <rect key={`v-${i}`} x={660 + i * 16} y={162} width="10" height="5" rx=".5"
            fill="#a8957c" opacity=".12" />
        ))}
      </g>

      {/* === ACCESS ROADS === */}
      <g className="access-roads">
        {/* Upper access road — from parking east */}
        <line x1="755" y1="150" x2="790" y2="120"
          stroke="#a8957c" strokeWidth="2.5" opacity=".2" />
        <line x1="755" y1="150" x2="790" y2="120"
          stroke="#a8957c" strokeWidth="1" strokeDasharray="6 4" opacity=".4" />
        <polygon points="784,124 790,120 786,130" fill="#a8957c" opacity=".4" />

        {/* Lower access road from south-east */}
        <line x1="700" y1="420" x2="790" y2="460"
          stroke="#a8957c" strokeWidth="2.5" opacity=".2" />
        <line x1="700" y1="420" x2="790" y2="460"
          stroke="#a8957c" strokeWidth="1" strokeDasharray="6 4" opacity=".4" />
        <polygon points="780,456 790,460 782,450" fill="#a8957c" opacity=".4" />

        {/* Access label */}
        <text x="750" y="340" fill="#a8957c" fontSize="9" letterSpacing="3"
          fontFamily="Anton, sans-serif" opacity=".4" textAnchor="middle">ACCESS</text>
        <text x="750" y="354" fill="#a8957c" fontSize="9" letterSpacing="3"
          fontFamily="Anton, sans-serif" opacity=".4" textAnchor="middle">POINTS</text>
      </g>

      {/* === 30-FT EMERGENCY ACCESS LANE === */}
      <ellipse cx="500" cy="300" rx="175" ry="150"
        fill="none" stroke="#a8957c" strokeWidth="0.5" strokeDasharray="2 6" opacity=".2" />
      <text x="340" y="475" fill="#a8957c" fontSize="6" letterSpacing="1.5"
        fontFamily="Inter, sans-serif" opacity=".25"
        transform="rotate(-8, 340, 475)">30-FT EMERGENCY LANE</text>

      {/* === COMPASS === */}
      <g transform="translate(60, 50)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#a8957c" strokeWidth=".5" opacity=".3" />
        <line x1="0" y1="-15" x2="0" y2="-8" stroke="#f5f1e8" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="0" y2="15" stroke="#a8957c" strokeWidth=".5" opacity=".4" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="#a8957c" strokeWidth=".5" opacity=".3" />
        <text x="0" y="-22" fill="#f5f1e8" fontSize="11" textAnchor="middle"
          fontFamily="Anton, sans-serif" letterSpacing="2">N</text>
      </g>

      {/* === SCALE BAR === */}
      <g transform="translate(60, 560)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="#a8957c" strokeWidth="1" opacity=".4" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#a8957c" strokeWidth=".5" opacity=".4" />
        <line x1="80" y1="-4" x2="80" y2="4" stroke="#a8957c" strokeWidth=".5" opacity=".4" />
        <text x="40" y="12" fill="#a8957c" fontSize="7" textAnchor="middle"
          fontFamily="Inter, sans-serif" letterSpacing="1" opacity=".4">~100m</text>
      </g>

      {/* === LEGEND === */}
      <g transform="translate(60, 490)">
        <text x="0" y="0" fill="#a8957c" fontSize="8" letterSpacing="2"
          fontFamily="Anton, sans-serif" opacity=".5">LEGEND</text>
        {/* Oval track */}
        <line x1="0" y1="14" x2="24" y2="14" stroke="#f5f1e8" strokeWidth="1.5" opacity=".7" />
        <text x="30" y="17" fill="#a8957c" fontSize="7"
          fontFamily="Inter, sans-serif" opacity=".5">Main Oval Track (400m)</text>
        {/* Ultra */}
        <line x1="0" y1="28" x2="24" y2="28" stroke="#c5532a" strokeWidth="1.5" strokeDasharray="4 3" opacity=".6" />
        <text x="30" y="31" fill="#a8957c" fontSize="7"
          fontFamily="Inter, sans-serif" opacity=".5">Ultra Course (Figure-8)</text>
        {/* Access */}
        <line x1="0" y1="42" x2="24" y2="42" stroke="#a8957c" strokeWidth="1" strokeDasharray="4 3" opacity=".4" />
        <text x="30" y="45" fill="#a8957c" fontSize="7"
          fontFamily="Inter, sans-serif" opacity=".5">Access Roads</text>
      </g>

      {/* === TITLE BLOCK === */}
      <g transform="translate(60, 95)">
        <text x="0" y="0" fill="#f5f1e8" fontSize="11" letterSpacing="3"
          fontFamily="Anton, sans-serif" opacity=".6">MAKE RUNNING</text>
        <text x="0" y="16" fill="#f5f1e8" fontSize="11" letterSpacing="3"
          fontFamily="Anton, sans-serif" opacity=".6">TRACK MEET &apos;26</text>
        <line x1="0" y1="24" x2="100" y2="24" stroke="#a8957c" strokeWidth=".5" opacity=".3" />
        <text x="0" y="36" fill="#a8957c" fontSize="6.5" letterSpacing="1"
          fontFamily="Inter, sans-serif" opacity=".4">TOTAL AREA: 7.20 ACRES</text>
        <text x="0" y="48" fill="#a8957c" fontSize="6.5" letterSpacing="1"
          fontFamily="Inter, sans-serif" opacity=".4">APEX DRY LAKE BED, NV</text>
        <text x="0" y="60" fill="#a8957c" fontSize="6.5" letterSpacing="1"
          fontFamily="Inter, sans-serif" opacity=".4">36°27′35.9″N 114°52′05.0″W</text>
      </g>
    </svg>
  );
}

function SiteContent() {
  return (
    <>
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <nav className="tsp-nav">
        <span className="nav-brand">TSP TRK 2026</span>
        <ul>
          <li><a href="#about">The Meet</a></li>
          <li><a href="#schedule">Schedule</a></li>
          <li><a href="#format">Format</a></li>
          <li><a href="#site-plan">Site Plan</a></li>
          <li><a href="#location">Location</a></li>
        </ul>
        <a href="mailto:keith@gorunrabbit.com?subject=TSP%20TRK%202026" className="cta">Contact</a>
      </nav>

      {/* ── HERO ── */}
      <header className="tsp-hero">
        <div className="hero-bg-image" aria-hidden="true">
          <img src="/tsp-trk/images/desert-runner-road.jpg" alt="" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            TSP TRK <span className="dot" /> 2026 <span className="dot" /> Apex Dry Lake, NV
          </div>
          <h1 className="display hero-title">
            Make Running.<span>Track Meet.</span>
          </h1>
          <div className="hero-cta">
            <a href="#about" className="cta rust">View Briefing</a>
            <a href="#schedule" className="cta">See Schedule</a>
          </div>
        </div>
        <div className="hero-meta">
          <div><b>Dates</b>October 1–5, 2026</div>
          <div><b>Format</b>Two-Day Track Meet + Ultra</div>
          <div><b>Field</b>15–18 Teams · 8–10 Runners</div>
          <div><b>Vibe</b>No Spectators. No Sponsors.</div>
        </div>
      </header>

      {/* ── PHOTO STRIP 1 ── */}
      <div className="photo-strip photo-strip-3">
        <img src="/tsp-trk/images/desert-checkpoint-ai.jpg" alt="Desert checkpoint with umbrella" />
        <img src="/tsp-trk/images/track-sprinters-ai.jpg" alt="Track sprinters in action" />
        <img src="/tsp-trk/images/prefontaine.jpg" alt="Steve Prefontaine" />
      </div>

      {/* ── MANIFESTO ── */}
      <section className="manifesto">
        <div className="tsp-container">
          <h2 className="display">
            No Spectators.<br />
            <span>No Sponsors.</span>
          </h2>
          <p>
            TSP has always lived at the edges of running culture. TRK is the next
            experiment — bringing track into our favorite laboratory: the desert.
            Where runners from amateur to pro throw down in raw, head-to-head
            competition under a sky that doesn&apos;t care about your PR.
          </p>
        </div>
      </section>

      {/* ── 01 THE MEET ── */}
      <section id="about" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">01</div>
            <h2>A Track in the Dust.</h2>
          </div>
          <div className="what-grid">
            <div className="what-card">
              <div className="what-card-eyebrow">Infrastructure</div>
              <h3>Oval, Marked &amp; Measured</h3>
              <p>
                A temporary 400m oval with eight lanes, weighted cones, and chalk
                lines. Standard distances, sacred geometry, on a playa older than
                any stadium.
              </p>
            </div>
            <div className="what-card">
              <div className="what-card-eyebrow">Endurance</div>
              <h3>Figure-8 Ultra Loop</h3>
              <p>
                A separate loop branches off the oval — a figure-8 ribbon for the
                long-distance event. Run through the cross. Run through the night.
              </p>
            </div>
            <div className="what-card">
              <div className="what-card-eyebrow">Logistics</div>
              <h3>15–18 Teams. One Playa.</h3>
              <p>
                Teams of 8–10 runners, mixed amateur and pro. Pros assigned by
                raffle. No trades. You are only as strong as your weakest link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 SCHEDULE ── */}
      <section id="schedule" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">02</div>
            <h2>Program.</h2>
          </div>
          <div className="schedule-rows">
            {[
              { date: "Thu Oct 1", type: "Setup", desc: "Track build, staging, site prep — staff & crew only.", ultra: false },
              { date: "Fri Oct 2", type: "Arrival", desc: "Teams roll in. RV/staff parking opens. Registration. Briefing under the dust.", ultra: false },
              { date: "Sat Oct 3", type: "Meet Day 1", desc: "Main competition window. Heats, prelims, the first scores on the board.", ultra: false },
              { date: "Sun Oct 4", type: "Meet Day 2 + Ultra", desc: "Finals. Ultra wraps. Podium under directional LEDs. Initial breakdown.", ultra: true },
              { date: "Mon Oct 5", type: "Strike", desc: "Leave No Trace. Track removal. Full restoration. Off the playa.", ultra: false },
            ].map((row, i) => (
              <div className={`schedule-row ${row.ultra ? "ultra-row" : ""}`} key={i}>
                <div className="schedule-date">{row.date}</div>
                <div className="schedule-type">{row.type}</div>
                <div className="schedule-desc">{row.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 FORMAT ── */}
      <section id="format" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">03</div>
            <h2>The Disciplines.</h2>
          </div>
          <div className="events-grid">
            {[
              { dist: "400m", type: "Sprint", ultra: false },
              { dist: "800m", type: "Mid-Distance", ultra: false },
              { dist: "Mile", type: "1,609m", ultra: false },
              { dist: "DMR", type: "Distance Medley", ultra: false },
              { dist: "4×800", type: "Relay", ultra: false },
              { dist: "Ultra", type: "Figure-8 / Long", ultra: true },
            ].map((evt, i) => (
              <div className={`event-tile ${evt.ultra ? "ultra-tile" : ""}`} key={i}>
                <div className="dist">{evt.dist}</div>
                <div className="type">{evt.type}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL BLEED IMAGE ── */}
      <div className="full-bleed-image">
        <img src="/tsp-trk/images/desert-tracks.jpg" alt="Railroad tracks into the desert" />
      </div>

      {/* ── 04 SITE PLAN ── */}
      <section id="site-plan" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">04</div>
            <h2>Site Plan.</h2>
          </div>
          <div className="site-plan-map-wrap">
            <SitePlanMap />
          </div>
          <div className="site-plan-stats">
            <div className="stat">
              <div className="stat-label">Acres Total</div>
              <div className="stat-num">7.2</div>
            </div>
            <div className="stat">
              <div className="stat-label">Lanes</div>
              <div className="stat-num">8</div>
            </div>
            <div className="stat">
              <div className="stat-label">Weighted Cones</div>
              <div className="stat-num">~80</div>
            </div>
            <div className="stat">
              <div className="stat-label">Paramedics</div>
              <div className="stat-num">2</div>
            </div>
            <div className="stat">
              <div className="stat-label">Toilets</div>
              <div className="stat-num">9</div>
            </div>
            <div className="stat">
              <div className="stat-label">Vehicles</div>
              <div className="stat-num">20</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP 2 ── */}
      <div className="photo-strip photo-strip-2">
        <div className="photo-wrap">
          <img src="/tsp-trk/images/desert-setup-bw.jpg" alt="Desert checkpoint setup" />
        </div>
        <div className="photo-wrap">
          <img src="/tsp-trk/images/runners-trail.jpg" alt="Runners on desert trail" />
        </div>
      </div>

      {/* ── 05 LOCATION ── */}
      <section id="location" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">05</div>
            <h2>Location.</h2>
          </div>
          <div className="location-grid">
            <div className="location-copy">
              <h3>
                One road in.<span>One road out.</span>
              </h3>
              <p>
                North of Apex, Nevada — a flat, cracked playa on BLM-managed land
                just off the I-15 / U.S. 93 corridor. Closer to the truth than any
                stadium gets.
              </p>
              <p>
                This is a closed, small-scale pilot under permit with the Bureau of
                Land Management. Leave No Trace. No commercial vending. Vehicles to
                existing routes only.
              </p>
              <div className="coords">36°27′35.9″N · 114°52′05.0″W</div>
            </div>
            <div className="location-details">
              <div className="detail-card">
                <h4>Access</h4>
                <p>I-15 / U.S. 93 corridor, 1–2 mi from main access points near Apex</p>
              </div>
              <div className="detail-card">
                <h4>Surface</h4>
                <p>Dry lake bed (playa) — flat, cracked, hard-packed. No ground alteration.</p>
              </div>
              <div className="detail-card">
                <h4>Permit</h4>
                <p>Bureau of Land Management. Photos and restoration report within 7 days post-event.</p>
              </div>
              <div className="detail-card">
                <h4>Weather Contingency</h4>
                <p>Postpone/cancel if high winds, rain, or conditions that could cause dust storms or playa damage.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

export default function TspTrkPage() {
  return (
    <AuthGate>
      <SiteContent />
    </AuthGate>
  );
}
