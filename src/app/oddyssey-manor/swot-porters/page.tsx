"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function SwotPortersPage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>SWOT &amp; Porter&rsquo;s Analysis</p>
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
    <div style={{ background: "#060606", color: "#e8e4dd" }}>
      <style>{swStyles}</style>
      <div className="sw-page">
        <Link href="/oddyssey-manor" className="sw-back">&larr; All Documents</Link>

        <div className="sw-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="sw-logo" />
          <div className="sw-label">Strategic Analysis</div>
          <h1>SWOT &amp; Porter&rsquo;s<br />Five Forces</h1>
          <p className="sw-subtitle">Oddyssey Manor &amp; Noir &bull; Las Vegas Alternative Nightlife</p>
          <div className="sw-meta">April 2026 &bull; Go Run Rabbit</div>
        </div>

        {/* SWOT Grid */}
        <div className="sw-section">
          <div className="sw-section-title">SWOT Analysis</div>
          <div className="sw-swot-grid">
            <div className="sw-swot-card sw-strengths">
              <h3>Strengths</h3>
              <ul>
                <li><strong>Unique dual-model</strong> &mdash; only venue in Vegas combining immersive theatre + late-night club under one roof</li>
                <li><strong>AREA15 captive traffic</strong> &mdash; 15M+ visitors, 69% under 35, built-in tourist pipeline</li>
                <li><strong>Premium + accessible pricing</strong> &mdash; Manor $79-239 captures high-spend; Noir $20 + Golden Hour free captures volume</li>
                <li><strong>Repeat visitability</strong> &mdash; Noir&rsquo;s rotating programming (Liquid Gold / Art in Motion) drives weekly local returns</li>
                <li><strong>High production moat</strong> &mdash; velvet rooms, circus acts, interactive performers, 4K projection &mdash; can&rsquo;t be replicated by a bar operator</li>
                <li><strong>Golden Hour partnership model</strong> &mdash; three-way value exchange creates revenue beyond tickets and bar</li>
                <li><strong>Manor-to-Noir upsell</strong> &mdash; every Manor ticket includes Noir access, built-in cross-sell</li>
              </ul>
            </div>
            <div className="sw-swot-card sw-weaknesses">
              <h3>Weaknesses</h3>
              <ul>
                <li><strong>Website-to-reality disconnect</strong> &mdash; programming, lineups, best copy, bottle service &mdash; none on oddysseylv.com</li>
                <li><strong>Instagram gap</strong> &mdash; 4,800 followers vs. Discopussy&rsquo;s 33K. Social proof severely underdeveloped</li>
                <li><strong>No owned audience</strong> &mdash; zero email capture, no guest list database. Every week starts from zero</li>
                <li><strong>AREA15 dependency</strong> &mdash; operates inside a third-party complex, subject to their hours, policies, traffic</li>
                <li><strong>Immersive venue stigma</strong> &mdash; 5 closures in 2 years at AREA15 creates market skepticism</li>
                <li><strong>Limited operating window</strong> &mdash; Manor Thu-Sun 6:30-10PM, Noir Fri-Sat only. Narrow revenue hours</li>
                <li><strong>No bottle/menu visibility</strong> &mdash; high-spend guests can&rsquo;t figure out how to spend more</li>
              </ul>
            </div>
            <div className="sw-swot-card sw-opportunities">
              <h3>Opportunities</h3>
              <ul>
                <li><strong>2026 tourism rebound</strong> &mdash; 40.1M visitors projected (+2.4%), WrestleMania, FIFA, F1 driving traffic</li>
                <li><strong>Immersive market explosion</strong> &mdash; $137B globally, 26-30% CAGR, 70% of Gen Z prioritizes experiences</li>
                <li><strong>Private events vacuum</strong> &mdash; no immersive venue in Vegas offers corporate/bachelorette packages at this level</li>
                <li><strong>Golden Hour as audience engine</strong> &mdash; RSVP captures emails, free entry removes all objections</li>
                <li><strong>AREA15 Zone 2 expansion</strong> &mdash; Boeing 747 venue, Museum of Ice Cream, growing ecosystem</li>
                <li><strong>Artist-name SEO gap</strong> &mdash; DJs booked but not on website. Every search is uncaptured organic traffic</li>
                <li><strong>CBM partnership potential</strong> &mdash; Oddwood cross-promo (pre-game &rarr; main event) rather than pure competition</li>
              </ul>
            </div>
            <div className="sw-swot-card sw-threats">
              <h3>Threats</h3>
              <ul>
                <li><strong>CBM dominance</strong> &mdash; 9+ venues, $25M/yr, controls 3 closest competitors AND has a venue inside AREA15</li>
                <li><strong>AREA15 immersive fatigue</strong> &mdash; 5 closures signal format exhaustion, eroding consumer trust</li>
                <li><strong>Discretionary spending decline</strong> &mdash; 2025 visitation down 7.5%, economic uncertainty, inflation</li>
                <li><strong>Boeing 747 nightlife venue</strong> &mdash; 1,300-capacity competitor opening in AREA15 Zone 2</li>
                <li><strong>Punchdrunk rumored Vegas project</strong> &mdash; Sleep No More creators could enter at globally recognized brand level</li>
                <li><strong>DJ talent poaching</strong> &mdash; if CBM or Strip clubs offer bigger guarantees, programming quality erodes</li>
                <li><strong>Algorithm dependency</strong> &mdash; no owned audience means one platform shift craters visibility overnight</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cross Analysis */}
        <div className="sw-section">
          <div className="sw-section-title">Cross-Analysis</div>
          <div className="sw-cross-grid">
            <div className="sw-cross-card sw-cross-so">
              <h4>SO Strategies <span>(Strengths &times; Opportunities)</span></h4>
              <ul>
                <li>Leverage dual-model + private events vacuum &rarr; launch corporate/bachelorette packages no competitor can match in production value</li>
                <li>Use Golden Hour + 2026 tourism rebound &rarr; build email list during peak visitation, creating owned audience for off-peak</li>
                <li>Combine AREA15 traffic + Zone 2 expansion &rarr; position as the evening anchor for the growing ecosystem</li>
              </ul>
            </div>
            <div className="sw-cross-card sw-cross-wt">
              <h4>WT Risks <span>(Weaknesses &times; Threats)</span></h4>
              <ul>
                <li>Instagram gap + CBM dominance = invisible in the channels where the target audience discovers nightlife</li>
                <li>No owned audience + algorithm dependency = one platform change craters attendance with no fallback</li>
                <li>AREA15 dependency + immersive fatigue = if AREA15&rsquo;s brand suffers from more closures, Oddyssey absorbs reputational damage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Porter's Five Forces */}
        <div className="sw-section">
          <div className="sw-section-title">Porter&rsquo;s Five Forces</div>

          <div className="sw-forces">
            {[
              {
                name: "Supplier Power", rating: 4, level: "Moderate-Low",
                analysis: "DJs have options but Oddyssey's immersive format is a differentiated booking. Beverage distribution is commoditized. El Bandido partnership actually reverses supplier power — the brand pays for placement.",
                critical: "AREA15 (landlord) is the exception — HIGH power. Controls hours, traffic, lease terms. Single point of dependency."
              },
              {
                name: "Buyer Power", rating: 6, level: "Moderate-High",
                analysis: "100+ nightlife venues in Vegas means extreme buyer choice. Low switching costs, no loyalty program, no lock-in. Manor guests ($79-239) are less price-sensitive; Noir guests ($20) compare against Discopussy, Commonwealth.",
                critical: "Golden Hour neutralizes this — free entry + free drinks eliminates price as a decision factor entirely."
              },
              {
                name: "Competitive Rivalry", rating: 7, level: "High",
                analysis: "CBM controls the alternative segment with 9+ venues and cross-promotion. At the Noir level, late-night club with DJs is commoditized. Fixed production costs create pressure to fill the room every night.",
                critical: "At the Manor level, rivalry is LOW — no direct competitor offers immersive cocktail theatre in Vegas. The dual-model is the moat."
              },
              {
                name: "Threat of Substitution", rating: 7, level: "High",
                analysis: "Any Friday/Saturday entertainment competes — other clubs, shows, concerts, restaurants, staying in. Free options abundant (Fremont Street Experience, hotel pools).",
                critical: "Manor's immersive theatre is hard to substitute — you can't replicate 'performers as living guides' at home. Noir alone is more substitutable."
              },
              {
                name: "Threat of New Entry", rating: 5, level: "Moderate",
                analysis: "Capital barriers are high ($5-20M+ build-out). Limited AREA15 space deters casual entrants. Nevada licensing is not prohibitive.",
                critical: "CBM has capital + AREA15 presence (Oddwood). Punchdrunk and international brands could enter. Boeing 747 venue is a real-time new entrant."
              },
            ].map(f => (
              <div key={f.name} className="sw-force">
                <div className="sw-force-header">
                  <h4>{f.name}</h4>
                  <div className="sw-force-rating">
                    <div className="sw-rating-bar">
                      <div className="sw-rating-fill" style={{ width: `${f.rating * 10}%` }} />
                    </div>
                    <span className="sw-rating-num">{f.rating}/10</span>
                    <span className="sw-rating-level">{f.level}</span>
                  </div>
                </div>
                <p>{f.analysis}</p>
                <div className="sw-force-critical"><strong>Key factor:</strong> {f.critical}</div>
              </div>
            ))}
          </div>

          {/* Overall Score */}
          <div className="sw-overall">
            <div className="sw-overall-score">
              <div className="sw-overall-num">5.2</div>
              <div className="sw-overall-label">Industry Attractiveness<br /><span>out of 10</span></div>
            </div>
            <div className="sw-overall-text">
              <p>Moderately attractive but competitive market. Oddyssey&rsquo;s moat is the dual-model (theatre + club) &mdash; the only structural advantage that&rsquo;s genuinely hard to replicate. Everything else (DJs, vibes, location) can be matched.</p>
              <p><strong>Strategic imperative:</strong> deepen the moat (more immersive, more production value, stronger brand) while fixing the distribution gap (website, social, email) before CBM or a new entrant closes the window.</p>
            </div>
          </div>
        </div>

        {/* Forces Summary Table */}
        <div className="sw-section">
          <div className="sw-section-title">Forces Summary</div>
          <div className="sw-forces-table">
            <table>
              <thead><tr><th>Force</th><th>Rating</th><th>Assessment</th></tr></thead>
              <tbody>
                {[
                  { f: "Supplier Power", r: "4/10", a: "Manageable except AREA15 landlord leverage" },
                  { f: "Buyer Power", r: "6/10", a: "High choice, low switching — mitigated by Golden Hour" },
                  { f: "Competitive Rivalry", r: "7/10", a: "Intense in alt-nightlife, CBM dominance" },
                  { f: "Substitution Threat", r: "7/10", a: "Many alternatives for entertainment spend" },
                  { f: "New Entry Threat", r: "5/10", a: "Capital barriers help, but funded brands could enter" },
                ].map(row => (
                  <tr key={row.f}><td><strong>{row.f}</strong></td><td>{row.r}</td><td>{row.a}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sw-footer">
          <Link href="/oddyssey-manor" className="sw-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const swStyles = `
.sw-page { max-width: 1000px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.sw-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.sw-back:hover { color: #c9a84c; }

.sw-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.sw-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.sw-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 16px; }
.sw-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px,5vw,48px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; line-height: 1.15; }
.sw-subtitle { font-size: 14px; letter-spacing: 2px; color: #9a958d; margin-bottom: 8px; }
.sw-meta { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; }

.sw-section { margin-bottom: 56px; }
.sw-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }

/* SWOT Grid */
.sw-swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.sw-swot-card { background: #060606; padding: 28px; }
.sw-swot-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; }
.sw-strengths h3 { color: #27ae60; border-bottom: 1px solid rgba(39,174,96,0.2); }
.sw-weaknesses h3 { color: #c0392b; border-bottom: 1px solid rgba(192,57,43,0.2); }
.sw-opportunities h3 { color: #3498db; border-bottom: 1px solid rgba(52,152,219,0.2); }
.sw-threats h3 { color: #f39c12; border-bottom: 1px solid rgba(243,156,18,0.2); }
.sw-swot-card ul { list-style: none; }
.sw-swot-card li { font-size: 13px; color: #9a958d; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); line-height: 1.5; }
.sw-swot-card li:last-child { border-bottom: none; }
.sw-swot-card strong { color: #e8e4dd; font-weight: 500; }

/* Cross Analysis */
.sw-cross-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.sw-cross-card { background: #060606; padding: 28px; }
.sw-cross-card h4 { font-size: 13px; font-weight: 500; letter-spacing: 1px; margin-bottom: 16px; }
.sw-cross-card h4 span { color: #5a5650; font-weight: 300; }
.sw-cross-so h4 { color: #27ae60; }
.sw-cross-wt h4 { color: #c0392b; }
.sw-cross-card ul { list-style: none; }
.sw-cross-card li { font-size: 13px; color: #9a958d; padding: 8px 0 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; line-height: 1.5; }
.sw-cross-card li::before { content: ''; position: absolute; left: 0; top: 15px; width: 5px; height: 5px; border: 1px solid; transform: rotate(45deg); }
.sw-cross-so li::before { border-color: #27ae60; }
.sw-cross-wt li::before { border-color: #c0392b; }

/* Forces */
.sw-forces { display: flex; flex-direction: column; gap: 16px; }
.sw-force { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 24px; }
.sw-force-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.sw-force h4 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; letter-spacing: 1px; }
.sw-force-rating { display: flex; align-items: center; gap: 12px; }
.sw-rating-bar { width: 100px; height: 4px; background: rgba(255,255,255,0.06); position: relative; }
.sw-rating-fill { position: absolute; top: 0; left: 0; height: 100%; background: #c9a84c; transition: width 0.6s; }
.sw-rating-num { font-size: 14px; color: #c9a84c; font-weight: 500; letter-spacing: 1px; }
.sw-rating-level { font-size: 10px; color: #5a5650; letter-spacing: 1.5px; text-transform: uppercase; }
.sw-force > p { font-size: 13px; color: #9a958d; margin-bottom: 12px; }
.sw-force-critical { font-size: 12px; color: #9a958d; padding: 12px 16px; background: rgba(201,168,76,0.04); border-left: 2px solid rgba(201,168,76,0.2); }
.sw-force-critical strong { color: #c9a84c; font-weight: 500; }

/* Overall */
.sw-overall { display: grid; grid-template-columns: 200px 1fr; gap: 1px; background: rgba(255,255,255,0.06); margin-top: 32px; }
.sw-overall-score { background: #0d0d0d; padding: 32px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
.sw-overall-num { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 300; color: #c9a84c; line-height: 1; margin-bottom: 8px; }
.sw-overall-label { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.5; }
.sw-overall-label span { font-size: 9px; }
.sw-overall-text { background: #0d0d0d; padding: 32px; }
.sw-overall-text p { font-size: 14px; color: #9a958d; margin-bottom: 12px; line-height: 1.7; }
.sw-overall-text strong { color: #e8e4dd; font-weight: 500; }

/* Table */
.sw-forces-table { overflow-x: auto; }
.sw-forces-table table { width: 100%; border-collapse: collapse; }
.sw-forces-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.sw-forces-table td { padding: 14px 16px; font-size: 13px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.04); }
.sw-forces-table strong { color: #e8e4dd; font-weight: 400; }

.sw-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .sw-page { padding: 24px 20px 60px; }
  .sw-swot-grid, .sw-cross-grid { grid-template-columns: 1fr; }
  .sw-overall { grid-template-columns: 1fr; }
  .sw-force-header { flex-direction: column; align-items: flex-start; }
  .sw-footer { flex-direction: column; gap: 12px; text-align: center; }
}
`;
