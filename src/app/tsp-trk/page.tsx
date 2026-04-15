"use client";

import AuthGate from "./components/AuthGate";

function TrackMap() {
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grit" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="#0d0d0d" />
          <circle cx="1" cy="1" r=".4" fill="#2a2520" opacity=".5" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#grit)" />
      <g stroke="#f5f1e8" strokeWidth="1.5" fill="none">
        <rect x="100" y="160" width="200" height="80" rx="40" ry="40" />
        <rect x="105" y="165" width="190" height="70" rx="35" ry="35" opacity=".4" />
        <rect x="110" y="170" width="180" height="60" rx="30" ry="30" opacity=".25" />
      </g>
      <path
        d="M 200 90 C 130 90, 130 160, 200 160 C 270 160, 270 90, 200 90 Z M 200 280 C 130 280, 130 350, 200 350 C 270 350, 270 280, 200 280 Z"
        fill="none"
        stroke="#c5532a"
        strokeWidth="1.8"
        strokeDasharray="4 4"
        opacity=".85"
      />
      <g stroke="#c5532a" strokeWidth="1">
        <line x1="200" y1="0" x2="200" y2="400" opacity=".15" />
        <line x1="0" y1="200" x2="400" y2="200" opacity=".15" />
        <circle cx="200" cy="200" r="3" fill="#c5532a" />
      </g>
      <text x="20" y="30" fill="#a8957c" fontFamily="Anton" fontSize="11" letterSpacing="2">
        N
      </text>
      <text x="20" y="380" fill="#a8957c" fontFamily="Inter" fontSize="9" letterSpacing="2">
        APEX DRY LAKE — APPROX. LAYOUT
      </text>
    </svg>
  );
}

function SiteContent() {
  return (
    <>
      <nav className="tsp-nav">
        <img src="/tsp-trk/tsp_logo-white.png" alt="The Speed Project" className="logo" />
        <ul>
          <li><a href="#about">The Meet</a></li>
          <li><a href="#schedule">Schedule</a></li>
          <li><a href="#format">Format</a></li>
          <li><a href="#location">Location</a></li>
        </ul>
        <a href="#register" className="cta">Contact</a>
      </nav>

      <header className="tsp-hero">
        <div className="tsp-container">
          <div className="eyebrow">
            TSP TRK <span className="dot" /> 2026 <span className="dot" /> Apex Dry Lake, NV
          </div>
          <h1 className="display hero-title">
            Make Running.<span>Track Meet.</span>
          </h1>
          <div className="hero-cta">
            <a href="#about" className="cta rust">View Briefing</a>
            <a href="#schedule" className="cta">See Schedule</a>
          </div>
          <div className="hero-meta">
            <div><b>Dates</b>October 1–5, 2026</div>
            <div><b>Format</b>Two-Day Track Meet + Ultra</div>
            <div><b>Field</b>15–18 Teams · 8–10 Runners</div>
            <div><b>Vibe</b>No Spectators. No Sponsors.</div>
          </div>
        </div>
      </header>

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

      <section id="about" className="tsp-section what">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">01</div>
            <div>
              <div className="label">The Meet</div>
              <h2>A Track in the Dust.</h2>
            </div>
          </div>
          <div className="what-grid">
            <div className="what-card">
              <div className="num">400m</div>
              <h3>Oval, marked &amp; measured</h3>
              <p>
                A temporary 400m oval with eight lanes, weighted cones, and chalk
                lines. Standard distances, sacred geometry, on a playa older than
                any stadium.
              </p>
            </div>
            <div className="what-card">
              <div className="num">&infin;</div>
              <h3>Figure-8 Ultra Loop</h3>
              <p>
                A separate loop branches off the oval — a figure-8 ribbon for the
                long-distance event. Run through the cross. Run through the night.
              </p>
            </div>
            <div className="what-card">
              <div className="num">120+</div>
              <h3>15–18 teams. One playa.</h3>
              <p>
                Teams of 8–10 runners, mixed amateur and pro. Pros assigned by
                raffle. No trades. You are only as strong as your weakest link.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">02</div>
            <div>
              <div className="label">Program</div>
              <h2>Five Days. One Tribe.</h2>
            </div>
          </div>
          <div className="schedule-table">
            <div className="day">
              <div className="day-label">
                <div className="day-date">Thu Oct 1</div>
                <div className="day-name">Setup Day 1</div>
              </div>
              <div className="day-items">
                <div className="day-item">
                  <div className="day-time">All Day</div>
                  <div className="day-desc">
                    Track build, staging, site prep — staff &amp; crew only.
                  </div>
                </div>
              </div>
            </div>
            <div className="day">
              <div className="day-label">
                <div className="day-date">Fri Oct 2</div>
                <div className="day-name">Arrival</div>
              </div>
              <div className="day-items">
                <div className="day-item">
                  <div className="day-time">Morning</div>
                  <div className="day-desc">Continued setup &amp; registration.</div>
                </div>
                <div className="day-item">
                  <div className="day-time">Sundown</div>
                  <div className="day-desc">
                    Teams roll in. RV/staff parking opens. Briefing under the dust.
                  </div>
                </div>
              </div>
            </div>
            <div className="day">
              <div className="day-label">
                <div className="day-date">Sat Oct 3</div>
                <div className="day-name">Meet Day 1</div>
              </div>
              <div className="day-items">
                <div className="day-item">
                  <div className="day-time">Morning–Eve</div>
                  <div className="day-desc">
                    Main competition window. Heats, prelims, the first scores on the
                    board.
                  </div>
                </div>
              </div>
            </div>
            <div className="day">
              <div className="day-label">
                <div className="day-date">Sun Oct 4</div>
                <div className="day-name">Meet Day 2</div>
              </div>
              <div className="day-items">
                <div className="day-item">
                  <div className="day-time">Morning–Eve</div>
                  <div className="day-desc">
                    Finals. Ultra wraps. Podium under directional LEDs.
                  </div>
                </div>
                <div className="day-item">
                  <div className="day-time">Late</div>
                  <div className="day-desc">Initial breakdown. Site secured.</div>
                </div>
              </div>
            </div>
            <div className="day">
              <div className="day-label">
                <div className="day-date">Mon Oct 5</div>
                <div className="day-name">Strike</div>
              </div>
              <div className="day-items">
                <div className="day-item">
                  <div className="day-time">8:00–13:00</div>
                  <div className="day-desc">
                    Leave No Trace. Track removal. Full restoration. Off the playa.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="format" className="tsp-section format">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">03</div>
            <div>
              <div className="label">Race Format</div>
              <h2>Six Events. One Truth.</h2>
            </div>
          </div>
          <div className="events-grid">
            <div className="event">
              <div className="dist">400m</div>
              <div className="type">Sprint</div>
            </div>
            <div className="event">
              <div className="dist">800m</div>
              <div className="type">Mid-D</div>
            </div>
            <div className="event">
              <div className="dist">Mile</div>
              <div className="type">1,609m</div>
            </div>
            <div className="event">
              <div className="dist">DMR</div>
              <div className="type">Distance Medley</div>
            </div>
            <div className="event">
              <div className="dist">4×800</div>
              <div className="type">Relay</div>
            </div>
            <div className="event ultra">
              <div className="dist">Ultra</div>
              <div className="type">Figure-8 / Long</div>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="tsp-section">
        <div className="tsp-container">
          <div className="section-head">
            <div className="num">04</div>
            <div>
              <div className="label">Location</div>
              <h2>Apex Dry Lake.</h2>
            </div>
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
            <div className="map-art" aria-hidden="true">
              <TrackMap />
            </div>
          </div>
        </div>
      </section>

      <section id="register" className="register">
        <div className="tsp-container">
          <div className="sub">Team Coordination</div>
          <h2 className="display">
            Questions?<br />
            <span>Hit Keith Direct.</span>
          </h2>
          <a
            href="mailto:keith@gorunrabbit.com?subject=TSP%20TRK%202026"
            className="cta rust"
          >
            keith@gorunrabbit.com
          </a>
        </div>
      </section>

      <footer className="tsp-footer">
        <div className="tsp-container row">
          <div>&copy; 2026 Make Running &middot; A Go Run Rabbit Production</div>
          <div>
            <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a>
            &nbsp;&middot;&nbsp;
            <a href="tel:+19785908654">978.590.8654</a>
          </div>
        </div>
      </footer>
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
