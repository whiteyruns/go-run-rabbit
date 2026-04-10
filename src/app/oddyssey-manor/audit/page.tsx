"use client";

import { useState } from "react";

const ACCESS_CODE = "oddyssey2026";

export default function AuditPage() {
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
          <p className="uppercase tracking-[0.3em] text-xs mb-2" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>Website Optimization</p>
          <p className="uppercase tracking-[0.2em] text-xs mb-12" style={{ color: "#5a5650" }}>Audit Report</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code" autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-medium"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px" }}
            />
            {error && <p className="text-xs tracking-widest uppercase" style={{ color: "#c0392b" }}>Invalid access code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase tracking-widest font-medium" style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}>Enter</button>
          </form>
          <p className="mt-16 text-xs tracking-[0.15em] uppercase" style={{ color: "#5a5650", letterSpacing: "2px" }}>Presented by Go Run Rabbit</p>
        </div>
      </div>
    );
  }

  return <AuditContent />;
}

function AuditContent() {
  return (
    <div style={{ background: "#060606", color: "#e8e4dd" }}>
      <style>{auditStyles}</style>
      <div className="audit-page">
        <a href="/oddyssey-manor" className="audit-back">&larr; All Documents</a>

        {/* HEADER */}
        <div className="audit-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="audit-header-logo" />
          <div className="audit-label">Website Optimization Assessment</div>
          <h2>Manor & Noir &mdash; oddysseylv.com</h2>
          <div className="audit-header-meta">Prepared April 2026 &bull; Objective: Increase Nightlife Ticket Conversion & Weekly Attendance</div>
        </div>

        {/* KEY INSIGHT */}
        <div className="audit-insight">
          <p><strong>The programming identity, editorial voice, DJ lineups, and creative assets all exist</strong> &mdash; they&rsquo;re just completely disconnected from the website. &ldquo;Liquid Gold&rdquo; Fridays have distinct branding. Saturdays are now named &ldquo;Art in Motion.&rdquo; <strong>A full DJ lineup (Optic, Neco, Mike Taylor, Laguerre, Berri, Hector Romero, DJ Brynn Taylor, John Julius Knight) is posted only on Instagram.</strong> None of this appears on oddysseylv.com. <strong>The fix isn&rsquo;t creating content &mdash; it&rsquo;s connecting what already exists to the website.</strong></p>
        </div>

        {/* CURRENT STATE */}
        <div className="audit-section">
          <div className="audit-section-title">Current State</div>

          <div className="audit-night-grid">
            <div className="audit-night-card audit-night-friday">
              <div className="audit-night-tag" style={{ color: "#d4a574" }}>Friday Nights</div>
              <div className="audit-night-name">Liquid Gold</div>
              <div className="audit-night-genre">House &bull; Electronic &bull; Genre-blurring</div>
              <div className="audit-night-desc">&ldquo;A living editorial shoot where style, sound, and self-expression collide. After a little Liquid Gold, everyone is the main character.&rdquo;</div>
              <div className="audit-night-talent">Talent (IG only): Optic, Mike Taylor, Berri, DJ Brynn Taylor</div>
              <span className="audit-status audit-status-exists">Named &bull; Branded</span>
              <span className="audit-status audit-status-partial">Talent on IG only</span>
              <span className="audit-status audit-status-missing">Not on website</span>
            </div>
            <div className="audit-night-card audit-night-saturday">
              <div className="audit-night-tag" style={{ color: "#9a958d" }}>Saturday Nights</div>
              <div className="audit-night-name">Art in Motion</div>
              <div className="audit-night-genre">Multi-genre &bull; Immersive</div>
              <div className="audit-night-desc">&ldquo;A sensual maze and seductive living room with a pulse. Music drives the emotional arc of the night as performers move through the experience as living guides.&rdquo;</div>
              <div className="audit-night-talent">Talent (IG only): Neco, Laguerre, Hector Romero, John Julius Knight</div>
              <span className="audit-status audit-status-exists">Newly named</span>
              <span className="audit-status audit-status-partial">Talent on IG only</span>
            </div>
          </div>

          <div className="audit-state-grid">
            <div className="audit-state-card">
              <h4><span className="audit-card-icon">&#9670;</span> Oddyssey Manor</h4>
              <ul>
                <li>Immersive cocktail theatre, 80-min cycles</li>
                <li>Thu&ndash;Sun, 6:30&ndash;10:00 PM</li>
                <li>4 ticket tiers: $79&ndash;$239</li>
                <li>All tiers include Noir access</li>
                <li>Ticketing via Ticketure</li>
              </ul>
            </div>
            <div className="audit-state-card">
              <h4><span className="audit-card-icon">&#9670;</span> Oddyssey Noir</h4>
              <ul>
                <li>Late-night club, 2 dance floors</li>
                <li>Fri &amp; Sat, 10 PM&ndash;Late</li>
                <li>GA from $20 / Tables $200&ndash;$350 min</li>
                <li>Every Fri/Sat programmed through June &rsquo;26</li>
                <li>Zero DJ names or talent on website</li>
              </ul>
            </div>
            <div className="audit-state-card">
              <h4>Tech Stack</h4>
              <div className="audit-tech-bar">
                {["Next.js", "React", "Tailwind CSS", "Vercel", "GTM", "Ticketure"].map(t => (
                  <span key={t} className="audit-tech-tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="audit-state-card">
              <h4>Content &amp; SEO</h4>
              <ul>
                <li>3 blog posts (all Jan 2026, none since)</li>
                <li>No email capture anywhere on site</li>
                <li>Best copy lives on social/ticketing only</li>
                <li>Contact routes to AREA15 general page</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FINDINGS */}
        <div className="audit-section">
          <div className="audit-section-title">Audit Findings</div>
          <table className="audit-table">
            <thead><tr><th style={{ width: 30 }}>#</th><th>Finding</th><th style={{ width: 90 }}>Priority</th><th>Impact</th></tr></thead>
            <tbody>
              {[
                { n: 1, finding: <><strong>Programming identity not on website</strong> &mdash; &ldquo;Liquid Gold&rdquo; Fridays and &ldquo;Art in Motion&rdquo; Saturdays have branding and copy but zero presence on oddysseylv.com. The website shows generic dates with no night names, genres, or talent.</>, priority: "critical", impact: "Ticket conversion, night differentiation" },
                { n: 2, finding: <><strong>No homepage event visibility</strong> &mdash; hero is narrative-driven with no upcoming dates, no &ldquo;this week&rdquo; section. Requires multiple clicks to find what&rsquo;s happening.</>, priority: "critical", impact: "First-visit conversion, bounce rate" },
                { n: 3, finding: <><strong>DJ lineups exist but only on Instagram</strong> &mdash; a full talent schedule (Optic, Neco, Mike Taylor, Laguerre, Berri, Hector Romero, DJ Brynn Taylor, John Julius Knight) is promoted on IG but does not appear anywhere on oddysseylv.com. Artist-name search traffic goes to zero.</>, priority: "critical", impact: "SEO, ticket conversion, artist discovery" },
                { n: 4, finding: <><strong>Night identities need website presence</strong> &mdash; Liquid Gold (Fri) and Art in Motion (Sat) are now both named. Neither appears on the website yet. Both need distinct creative, copy, and DJ lineups surfaced on event pages.</>, priority: "high", impact: "Night differentiation, repeat attendance" },
                { n: 5, finding: <><strong>No email capture mechanism</strong> &mdash; no newsletter, guest list signup, or early-access funnel. Golden Hour RSVP solves this if connected to the website.</>, priority: "high", impact: "Retention, owned audience" },
                { n: 6, finding: <><strong>Missing conversion signals</strong> &mdash; no urgency indicators (limited capacity, early pricing), no social proof (reviews, crowd footage, press mentions).</>, priority: "high", impact: "Purchase urgency, trust" },
                { n: 7, finding: <><strong>Manor vs Noir confusion</strong> &mdash; the two experiences aren&rsquo;t compared side-by-side. New visitors don&rsquo;t know which to book or that Manor includes Noir access.</>, priority: "high", impact: "Decision clarity, Manor upsell" },
                { n: 8, finding: <><strong>No bottle service menu or table pricing</strong> &mdash; the site mentions table minimums ($200/$350) but has no bottle menu, no drink menu, no table packages. Guests who want to spend more literally can&rsquo;t figure out how. Standard for every nightlife venue in Las Vegas.</>, priority: "high", impact: "Revenue per visit, high-spend guests" },
                { n: 9, finding: <><strong>No private events page</strong> &mdash; no group booking, bachelorette packages, or corporate inquiry form. Standard for LV venues, currently absent.</>, priority: "medium", impact: "Group sales, corporate revenue" },
                { n: 10, finding: <><strong>Dead blog / no content engine</strong> &mdash; 3 posts from January, nothing since. No event recaps, artist spotlights, or SEO-building content.</>, priority: "medium", impact: "Organic search, credibility" },
                { n: 11, finding: <><strong>Weak search visibility</strong> &mdash; no keyword-optimized copy targeting &ldquo;Las Vegas house music,&rdquo; &ldquo;AREA15 nightlife,&rdquo; or &ldquo;immersive nightclub Las Vegas.&rdquo;</>, priority: "medium", impact: "Organic discovery" },
              ].map(row => (
                <tr key={row.n}>
                  <td>{row.n}</td>
                  <td>{row.finding}</td>
                  <td><span className={`audit-priority-${row.priority}`}>{row.priority}</span></td>
                  <td className="audit-impact">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GOLDEN HOUR */}
        <div className="audit-section">
          <div className="audit-section-title">Proposed: Golden Hour</div>
          <div className="audit-insight" style={{ borderLeftColor: "#d4a574" }}>
            <p><strong style={{ color: "#d4a574" }}>Golden Hour</strong> is a recurring open bar program designed to drive early attendance and build weekly momentum. Complimentary cocktails from a brand partner (El Bandido Tequila) served 10 PM&ndash;midnight, while supplies last. <strong>RSVP = free entry.</strong> After midnight, the night evolves into Liquid Gold (Fridays) or Art in Motion (Saturdays) with paid bar through close.</p>
          </div>
          <div className="audit-state-grid" style={{ marginTop: 20 }}>
            <div className="audit-state-card">
              <h4>The Format</h4>
              <ul>
                <li>10 PM &ndash; Midnight: Open bar (while supplies last)</li>
                <li>Midnight &ndash; Late: Full programming continues</li>
                <li>RSVP = complimentary entry</li>
                <li>Walk-ups pay standard GA</li>
                <li>Menu: Bandido Margarita, Inside Job, Bandido Lemonade</li>
              </ul>
            </div>
            <div className="audit-state-card">
              <h4>The Value</h4>
              <ul>
                <li>Drives 75&ndash;150 early attendees at doors</li>
                <li>RSVP captures email &mdash; solves the email gap</li>
                <li>Brand partner gets weekly homepage presence</li>
                <li>Creates predictable weekly cadence</li>
                <li>Bar revenue accelerates after midnight</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="audit-section">
          <div className="audit-section-title">Recommendations</div>
          <div className="audit-rec-grid">
            <div className="audit-rec">
              <div className="audit-rec-num">01 &mdash; Homepage</div>
              <h4>Surface Golden Hour + Programming</h4>
              <p>Add a persistent Golden Hour section (open bar, 10 PM&ndash;midnight, RSVP for free entry) followed by weekly event cards with night names, DJs, and ticket links.</p>
              <div className="audit-example">
                <span className="audit-example-label">Recommended Flow</span>
                <strong style={{ color: "#d4a574" }}>GOLDEN HOUR</strong> &mdash; Open bar 10 PM&ndash;Midnight &mdash; RSVP for free entry<br /><br />
                FRI APR 18 &mdash; <strong style={{ color: "#d4a574" }}>LIQUID GOLD</strong> &mdash; Berri &mdash; House<br />
                SAT APR 19 &mdash; <strong>ART IN MOTION</strong> &mdash; Hector Romero &mdash; Immersive<br />
                <span style={{ color: "#c9a84c" }}>GET TICKETS &rarr;</span>
              </div>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">02 &mdash; Talent</div>
              <h4>Put DJ Lineups on the Website</h4>
              <p>A full talent schedule exists on Instagram but has zero presence on oddysseylv.com. Every event page should list the performing artist.</p>
              <div className="audit-example">
                <span className="audit-example-label">Instagram vs. Website</span>
                <strong style={{ color: "#d4a574" }}>FRI 4/18 &mdash; GOLDEN HOUR + LIQUID GOLD</strong> &mdash; Berri<br />
                <strong>SAT 4/19 &mdash; GOLDEN HOUR + ART IN MOTION</strong> &mdash; Hector Romero<br />
                <em style={{ color: "#5a5650" }}>^ On Instagram. Website shows: generic date, no name, no DJ.</em>
              </div>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">03 &mdash; Copy</div>
              <h4>Move Best Copy to Website</h4>
              <p>The editorial voice exists in ticketing/social but not on oddysseylv.com. The mythology, venue description, and night copy should live on the homepage.</p>
              <div className="audit-example">
                <span className="audit-example-label">Copy that should be on the site</span>
                <em>&ldquo;Sirens, shapeshifters, and eccentric hosts&rdquo;</em><br />
                <em>&ldquo;A carniv&aacute;l noir warehouse rave of DJs, circus acts, and underground intrigue&rdquo;</em><br />
                <em>&ldquo;After a little Liquid Gold, everyone is the main character&rdquo;</em>
              </div>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">04 &mdash; Conversion</div>
              <h4>Add Urgency &amp; Social Proof</h4>
              <p>Nightlife buyers decide quickly. Add scarcity signals and atmosphere validation to every event page.</p>
              <div className="audit-example">
                <span className="audit-example-label">Signals to Add</span>
                &bull; &ldquo;Golden Hour RSVP &mdash; free entry while it lasts&rdquo;<br />
                &bull; &ldquo;Limited availability&rdquo; badge<br />
                &bull; Short looping crowd/atmosphere video<br />
                &bull; Attendance momentum (&ldquo;Popular event&rdquo;)
              </div>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">05 &mdash; Clarity</div>
              <h4>Manor vs Noir Comparison</h4>
              <p>Add a side-by-side block so visitors instantly understand the difference and that Manor includes Noir access.</p>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">06 &mdash; Capture</div>
              <h4>Golden Hour RSVP as Email Funnel</h4>
              <p>The Golden Hour RSVP naturally solves the email capture gap. Connect it to homepage, event pages, and post-purchase flow to build an owned audience.</p>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">07 &mdash; SEO</div>
              <h4>Keyword-Optimized Copy</h4>
              <p>Target: &ldquo;Las Vegas house music,&rdquo; &ldquo;AREA15 nightlife,&rdquo; &ldquo;Liquid Gold Las Vegas,&rdquo; &ldquo;immersive nightclub Las Vegas.&rdquo;</p>
            </div>
            <div className="audit-rec">
              <div className="audit-rec-num">08 &mdash; Revenue</div>
              <h4>Private Events &amp; Group Booking</h4>
              <p>Add a dedicated page for bachelorette, birthday, corporate, and full buyout inquiries with an inquiry form.</p>
            </div>
          </div>
        </div>

        {/* HOMEPAGE STRUCTURE */}
        <div className="audit-section">
          <div className="audit-section-title">Recommended Homepage Structure</div>
          <div className="audit-flow">
            {[
              { title: "Hero + Positioning", desc: "Clear one-line identity + primary ticket CTA." },
              { title: "Golden Hour", desc: "Persistent section: open bar 10 PM–midnight, RSVP for free entry. Email capture + brand partner real estate." },
              { title: "This Week: Liquid Gold + Art in Motion", desc: "Event cards with night branding, DJ names, genre, Golden Hour badge, and ticket link." },
              { title: "Venue Description", desc: "\"Sirens, shapeshifters... a carnavál noir warehouse rave\" — the mythology that defines Oddyssey." },
              { title: "Atmosphere Video", desc: "15–30 second looping reel — crowd, dance floor, performers." },
              { title: "Choose Your Experience", desc: "Manor vs Noir side-by-side with logos. Highlight Manor includes Noir access." },
              { title: "Social Proof + Practical Info", desc: "Crowd imagery, hours, location, 21+." },
            ].map((item, i) => (
              <div key={i} className="audit-flow-item">
                <div className="audit-flow-line">
                  <div className="audit-flow-dot" />
                  {i < 6 && <div className="audit-flow-connector" />}
                </div>
                <div className="audit-flow-content">
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IMPACT */}
        <div className="audit-section">
          <div className="audit-section-title">Expected Impact</div>
          <div className="audit-impact-grid">
            {[
              { arrow: "↓", label: "Bounce Rate" },
              { arrow: "↑", label: "Ticket Conversion" },
              { arrow: "↑", label: "Weekly Consistency" },
              { arrow: "↑", label: "Organic Discovery" },
            ].map(card => (
              <div key={card.label} className="audit-impact-card">
                <div className="audit-impact-arrow">{card.arrow}</div>
                <div className="audit-impact-label">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="audit-wireframe-banner">
            <h4>Interactive Wireframes</h4>
            <p>Full homepage, event calendar, event detail, and private events wireframes built with Oddyssey brand assets.</p>
            <a href="/oddyssey-manor/wireframes" className="audit-wireframe-link">View Wireframes &rarr;</a>
          </div>
        </div>

        {/* FOOTER */}
        <div className="audit-footer">
          <a href="/oddyssey-manor" className="audit-back">&larr; All Documents</a>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const auditStyles = `
.audit-page { max-width: 1100px; margin: 0 auto; padding: 60px 40px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.6; }
.audit-page ::selection { background: #c9a84c; color: #060606; }

.audit-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.audit-header-logo { height: 52px; width: auto; margin: 0 auto 24px; display: block; }
.audit-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px; font-weight: 500; }
.audit-header h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 300; color: #9a958d; letter-spacing: 2px; }
.audit-header-meta { margin-top: 24px; font-size: 11px; color: #5a5650; letter-spacing: 1.5px; }

.audit-insight { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); border-left: 3px solid #c9a84c; padding: 28px 32px; margin-bottom: 50px; position: relative; }
.audit-insight::before { content: 'KEY INSIGHT'; position: absolute; top: -10px; left: 28px; font-size: 9px; letter-spacing: 3px; color: #c9a84c; background: #060606; padding: 0 12px; font-weight: 500; }
.audit-insight p { font-size: 15px; font-weight: 300; line-height: 1.7; color: #9a958d; }
.audit-insight strong { color: #e8e4dd; font-weight: 500; }

.audit-section { margin-bottom: 56px; }
.audit-section-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }

.audit-night-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px; }
.audit-night-card { padding: 28px; position: relative; overflow: hidden; }
.audit-night-friday { background: linear-gradient(180deg, rgba(6,6,6,0.88), rgba(6,6,6,0.95)), url('/oddyssey/liquid-gold-friday.webp') center/cover no-repeat; }
.audit-night-saturday { background: linear-gradient(180deg, rgba(6,6,6,0.88), rgba(6,6,6,0.95)), url('/oddyssey/oddyssey-noir-event.webp') center/cover no-repeat; }
.audit-night-tag { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; margin-bottom: 12px; }
.audit-night-name { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.audit-night-genre { font-size: 12px; letter-spacing: 1.5px; color: #5a5650; margin-bottom: 12px; }
.audit-night-desc { font-size: 12px; color: #9a958d; line-height: 1.6; font-style: italic; }
.audit-night-talent { font-size: 11px; color: #9a958d; margin-top: 12px; margin-bottom: 4px; }
.audit-status { display: inline-block; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; margin-top: 12px; font-weight: 500; margin-right: 6px; }
.audit-status-exists { border: 1px solid #27ae60; color: #27ae60; }
.audit-status-partial { border: 1px solid #f39c12; color: #f39c12; }
.audit-status-missing { border: 1px solid #c0392b; color: #c0392b; }

.audit-state-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px; }
.audit-state-card { background: #060606; padding: 28px; }
.audit-state-card h4 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; margin-bottom: 16px; letter-spacing: 1px; }
.audit-card-icon { color: #c9a84c; margin-right: 8px; font-size: 10px; }
.audit-state-card ul { list-style: none; }
.audit-state-card li { font-size: 13px; color: #9a958d; padding: 5px 0 5px 16px; position: relative; }
.audit-state-card li::before { content: ''; position: absolute; left: 0; top: 13px; width: 5px; height: 5px; border: 1px solid #c9a84c; transform: rotate(45deg); }
.audit-tech-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.audit-tech-tag { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15); color: #c9a84c; padding: 5px 14px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }

.audit-table { width: 100%; border-collapse: collapse; }
.audit-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.audit-table td { padding: 16px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: top; }
.audit-table tr:hover { background: #0d0d0d; }
.audit-priority-critical { color: #c0392b; font-weight: 600; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; }
.audit-priority-high { color: #f39c12; font-weight: 600; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; }
.audit-priority-medium { color: #27ae60; font-weight: 600; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; }
.audit-impact { font-size: 11px; color: #5a5650; font-style: italic; }

.audit-rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.audit-rec { background: #060606; padding: 28px; position: relative; }
.audit-rec::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #c9a84c; }
.audit-rec-num { font-size: 10px; color: #c9a84c; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500; }
.audit-rec h4 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; margin-bottom: 10px; letter-spacing: 1px; }
.audit-rec p { font-size: 13px; color: #9a958d; line-height: 1.6; }
.audit-example { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 16px; margin-top: 12px; font-size: 12px; color: #e8e4dd; line-height: 1.8; }
.audit-example-label { color: #5a5650; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 8px; }

.audit-flow { display: flex; flex-direction: column; margin-top: 16px; }
.audit-flow-item { display: flex; align-items: stretch; min-height: 56px; }
.audit-flow-line { width: 40px; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.audit-flow-dot { width: 8px; height: 8px; border: 1px solid #c9a84c; transform: rotate(45deg); flex-shrink: 0; margin-top: 8px; }
.audit-flow-connector { width: 1px; flex: 1; background: rgba(255,255,255,0.06); }
.audit-flow-content { padding: 0 0 20px 12px; }
.audit-flow-content h5 { font-size: 13px; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 2px; }
.audit-flow-content p { font-size: 12px; color: #5a5650; }

.audit-impact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); margin-top: 20px; }
.audit-impact-card { background: #060606; padding: 28px 20px; text-align: center; }
.audit-impact-arrow { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #c9a84c; line-height: 1; margin-bottom: 8px; }
.audit-impact-label { font-size: 10px; color: #5a5650; letter-spacing: 1.5px; text-transform: uppercase; }

.audit-wireframe-banner { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); padding: 32px; text-align: center; margin-top: 40px; }
.audit-wireframe-banner h4 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.audit-wireframe-banner p { font-size: 13px; color: #9a958d; margin-bottom: 20px; }
.audit-wireframe-link { display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #060606; background: #c9a84c; padding: 14px 36px; text-decoration: none; transition: background 0.3s; }
.audit-wireframe-link:hover { background: #d4b85e; }

.audit-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.audit-back:hover { color: #c9a84c; }
.audit-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .audit-page { padding: 32px 20px; }
  .audit-state-grid, .audit-night-grid, .audit-rec-grid { grid-template-columns: 1fr; }
  .audit-impact-grid { grid-template-columns: 1fr 1fr; }
}
`;
