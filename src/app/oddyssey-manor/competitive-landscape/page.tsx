"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function CompetitiveLandscapePage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Competitive Landscape</p>
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
      <style>{clStyles}</style>
      <div className="cl-page">
        <Link href="/oddyssey-manor" className="cl-back">&larr; All Documents</Link>

        <div className="cl-top-bar no-print">
          <button className="cl-pdf-btn" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Save as PDF
          </button>
        </div>

        <div className="cl-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="cl-logo" />
          <div className="cl-label">Competitive Intelligence</div>
          <h1>Competitive Landscape</h1>
          <p className="cl-subtitle">Las Vegas Alternative &amp; Immersive Nightlife</p>
          <div className="cl-meta">April 2026 &bull; Prepared by Go Run Rabbit</div>
        </div>

        {/* Key Insight */}
        <div className="cl-insight">
          <p><strong>Oddyssey occupies a unique position:</strong> the only venue in Las Vegas combining immersive theatre AND late-night club under one roof. The theatre-to-rave transition is structurally unique and solves the #1 failure pattern of immersive venues in Vegas &mdash; lack of repeat visitability. Five major immersive venues have closed at AREA15 in two years. Oddyssey&rsquo;s Noir component is the structural insurance against this pattern.</p>
        </div>

        {/* Market Context */}
        <div className="cl-section">
          <div className="cl-section-title">Market Context</div>
          <div className="cl-metrics">
            {[
              { num: "38.5M", label: "LV Visitors 2025", note: "Down 7.5% YoY" },
              { num: "40.1M", label: "2026 Projected", note: "+2.4% rebound" },
              { num: "15M+", label: "AREA15 Cumulative", note: "69% under 35" },
              { num: "$137B", label: "Global Immersive Market", note: "26-30% CAGR" },
            ].map(m => (
              <div key={m.label} className="cl-metric">
                <div className="cl-metric-num">{m.num}</div>
                <div className="cl-metric-label">{m.label}</div>
                <div className="cl-metric-note">{m.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Competitors */}
        <div className="cl-section">
          <div className="cl-section-title">Direct Competitors</div>

          {[
            {
              name: "Discopussy", threat: "HIGH", location: "512 Fremont St (DTLV)",
              format: "Underground house/techno warehouse club",
              pricing: "$20-50 cover", capacity: "500", ig: "33K followers",
              music: "House, techno, disco, funk — Void Acoustics sound system",
              unique: "Signature 'pus' light installation (8 tentacles, disco ball head, 10K laser-cut components). True underground programming.",
              why: "Closest direct competitor. Same target demo (anti-mega-club seekers), similar energy, 7x the Instagram following. CBM ecosystem creates cross-promotion advantages."
            },
            {
              name: "We All Scream", threat: "MEDIUM", location: "Fremont East (DTLV)",
              format: "Nightclub + art space + ice cream parlor",
              pricing: "$20-40 cover", capacity: "10,000 sq ft, 4 stages", ig: "@weallscreamdtlv",
              music: "Hip-hop, reggaeton, EDM, open format",
              unique: "Ice cream theme with DJ booth shaped like a cone. Proceeds support local art projects. 360-degree rooftop.",
              why: "Competes for 'Instagram-worthy alternative night out' dollar but lacks immersive theatre layer. Different vibe (playful vs. theatrical)."
            },
            {
              name: "Commonwealth", threat: "LOW-MED", location: "525 E Fremont St (DTLV)",
              format: "Two-story cocktail bar + hidden speakeasy (The Laundry Room)",
              pricing: "$20-40 cover", capacity: "6,000 sq ft + 22-seat speakeasy", ig: "7.7K followers",
              music: "Hip-hop, open format DJs",
              unique: "The Laundry Room speakeasy (internationally acclaimed, 22 seats max). Pre-Prohibition design. Pioneered Fremont East since 2012.",
              why: "More cocktail bar than immersive experience. Different location. Not competing for the same exact experience."
            },
            {
              name: "Meow Wolf Omega Mart", threat: "SYMBIOTIC", location: "Inside AREA15",
              format: "Immersive art installation / interactive supermarket",
              pricing: "$49-59 adults", capacity: "1M+ visitors in 2023", ig: "900K+ (brand-wide)",
              music: "N/A — daytime immersive art",
              unique: "300+ artists. Secret portals, surreal storylines. The anchor tenant of AREA15.",
              why: "Drives foot traffic TO AREA15 that Oddyssey can convert. Competes for 'immersive experience' budget but not the late-night slot. Position as evening complement, not substitute."
            },
            {
              name: "On The Record", threat: "LOW-MED", location: "Park MGM (Strip)",
              format: "Three-room speakeasy behind a record store facade",
              pricing: "$20-40 cover", capacity: "11,000 sq ft", ig: "@ontherecordlv",
              music: "70s/80s/90s, open format, hip-hop, EDM, Latin",
              unique: "Record store entrance concept. Three distinct rooms. Hidden Vinyl Parlor (25 seats).",
              why: "Shares 'experiential entry' concept but fundamentally a nightclub. Strip location targets different customer flow."
            },
            {
              name: "The Barbershop", threat: "LOW", location: "Cosmopolitan (Strip)",
              format: "Speakeasy + functioning barbershop + live music",
              pricing: "No cover, cocktails $20-30", capacity: "133-200", ig: "@thebarbershoplv",
              music: "Live local & national acts (rock, blues)",
              unique: "Hidden entrance through janitor door. Real barbershop services. Prohibition-era cocktails.",
              why: "Different model (walk-in vs. ticketed). Strip location. No immersive theatre component."
            },
          ].map(c => (
            <div key={c.name} className="cl-competitor">
              <div className="cl-comp-header">
                <div>
                  <h3>{c.name}</h3>
                  <span className="cl-comp-location">{c.location}</span>
                </div>
                <span className={`cl-threat cl-threat-${c.threat.toLowerCase().replace('-', '')}`}>{c.threat} THREAT</span>
              </div>
              <div className="cl-comp-grid">
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Format</span>
                  <span>{c.format}</span>
                </div>
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Pricing</span>
                  <span>{c.pricing}</span>
                </div>
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Capacity</span>
                  <span>{c.capacity}</span>
                </div>
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Instagram</span>
                  <span>{c.ig}</span>
                </div>
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Music</span>
                  <span>{c.music}</span>
                </div>
                <div className="cl-comp-detail">
                  <span className="cl-detail-label">Differentiator</span>
                  <span>{c.unique}</span>
                </div>
              </div>
              <div className="cl-comp-why">
                <span className="cl-detail-label">Why it matters</span>
                <p>{c.why}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AREA15 Ecosystem */}
        <div className="cl-section">
          <div className="cl-section-title">AREA15 Ecosystem</div>
          <div className="cl-insight" style={{ borderLeftColor: "#d4a574" }}>
            <p><strong>The immersive shakeout:</strong> Lost Spirits Distillery and Illuminarium both closed at AREA15. The common failure pattern: 30-45 minute one-and-done experiences, no repeat visitability, high production costs, dependent on first-time tourist traffic. <strong>Oddyssey&rsquo;s Noir component solves this</strong> &mdash; locals come for the rave, not the theatre. Rotating programming (Liquid Gold / Art in Motion) and Golden Hour create weekly cadence.</p>
          </div>
          <div className="cl-eco-grid">
            {[
              { name: "Oddwood", role: "Feeder venue", note: "Craft cocktail lounge, same complex. Pre-game / wind-down spot for Oddyssey guests." },
              { name: "Asylum Bar + Arcade", role: "Complementary", note: "Casual gaming bar. Earlier evening activity that could feed into Oddyssey." },
              { name: "Omega Mart", role: "Traffic driver", note: "1M+ annual visitors. Drives AREA15 foot traffic Oddyssey can convert." },
              { name: "Zone 2 Expansion", role: "Tailwind", note: "District 747 (1,300-cap immersive nightlife venue in a decommissioned 747 fuselage), Museum of Ice Cream. Growing ecosystem." },
            ].map(e => (
              <div key={e.name} className="cl-eco-card">
                <h4>{e.name}</h4>
                <span className="cl-eco-role">{e.role}</span>
                <p>{e.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CBM Dominance */}
        <div className="cl-section">
          <div className="cl-section-title">Corner Bar Management</div>
          <div className="cl-cbm">
            <p>CBM (Ryan Doherty) is the dominant operator in Las Vegas alternative nightlife. They operate <strong>multiple venues</strong> on Fremont East generating significant annual revenue. Their portfolio includes Oddyssey&rsquo;s three closest competitors (Discopussy, We All Scream, Commonwealth).</p>
            <div className="cl-cbm-venues">
              {["Discopussy", "We All Scream", "Commonwealth", "Cheapshot", "Lucky Day"].map(v => (
                <span key={v} className="cl-cbm-tag">{v}</span>
              ))}
            </div>
            <p style={{ marginTop: 16 }}><strong>Implication:</strong> CBM&rsquo;s Fremont East cross-promotion engine is a competitive moat. However, Oddyssey&rsquo;s immersive theatre component is something CBM has never built, and the AREA15 location captures a different tourist flow than Fremont East.</p>
          </div>
        </div>

        {/* Positioning Map */}
        <div className="cl-section">
          <div className="cl-section-title">Competitive Positioning</div>
          <div className="cl-pos-table">
            <table>
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Immersive</th>
                  <th>Nightlife</th>
                  <th>Price</th>
                  <th>Repeat</th>
                  <th>Threat</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { v: "Oddyssey Manor", im: "Very High", nl: "Medium", pr: "$79-239", rp: "Medium", th: "—" },
                  { v: "Oddyssey Noir", im: "Medium", nl: "Very High", pr: "$20", rp: "High", th: "—" },
                  { v: "Discopussy", im: "Low-Med", nl: "Very High", pr: "$20-50", rp: "High", th: "HIGH" },
                  { v: "We All Scream", im: "Medium", nl: "High", pr: "$20-40", rp: "Med-High", th: "MEDIUM" },
                  { v: "Commonwealth", im: "Low", nl: "High", pr: "$20-40", rp: "High", th: "LOW-MED" },
                  { v: "Omega Mart", im: "Very High", nl: "None", pr: "$49-59", rp: "Low", th: "SYMBIOTIC" },
                  { v: "On The Record", im: "Medium", nl: "High", pr: "$20-40", rp: "Med-High", th: "LOW-MED" },
                  { v: "Barbershop", im: "Medium", nl: "Medium", pr: "No cover", rp: "High", th: "LOW" },
                ].map(r => (
                  <tr key={r.v}>
                    <td><strong>{r.v}</strong></td>
                    <td>{r.im}</td>
                    <td>{r.nl}</td>
                    <td>{r.pr}</td>
                    <td>{r.rp}</td>
                    <td><span className={`cl-threat-sm ${r.th === "HIGH" ? "cl-th-high" : r.th === "MEDIUM" ? "cl-th-med" : r.th === "SYMBIOTIC" ? "cl-th-sym" : ""}`}>{r.th}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* White Space */}
        <div className="cl-section">
          <div className="cl-section-title">White Space &amp; Strategic Advantages</div>
          <div className="cl-ws-grid">
            {[
              { title: "Theatre-to-Club Pipeline", desc: "No competitor offers a daytime immersive theatre that converts the same audience into a late-night club. This dual-revenue model is structurally unique in Vegas." },
              { title: "AREA15 Captive Traffic", desc: "15M+ visitors, 69% under 35. Omega Mart drives foot traffic Oddyssey can convert. No CBM competitor has this built-in tourist pipeline." },
              { title: "Premium + Accessible", desc: "Manor ($79-239) captures high-spend guests. Noir ($20) + Golden Hour (free with RSVP) captures volume. No competitor spans this range." },
              { title: "Instagram Gap = Opportunity", desc: "At 4.8K followers vs. Discopussy's 33K, there's massive growth runway. The immersive content is inherently more shareable than a standard club." },
              { title: "Named Nights + Open Bar", desc: "Liquid Gold, Art in Motion, and Golden Hour create a weekly identity that no AREA15 venue has. This drives local repeat visits — the antidote to the 'immersive graveyard.'" },
              { title: "Private Events Vacuum", desc: "No immersive theatre venue in Vegas offers private event packages with this production level. Corporate, bachelorette, and brand activation revenue is untapped." },
            ].map(w => (
              <div key={w.title} className="cl-ws-card">
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="cl-section">
          <div className="cl-section-title">Sources</div>
          <div className="cl-sources">
            {[
              { label: "AREA15 surpasses 15M visitors", url: "nevadabusiness.com/2025/08/area15-surpasses-15-million-visitors" },
              { label: "AREA15 Zone 2 expansion details", url: "area15.com/zone2" },
              { label: "Las Vegas 2025 visitation down 7.5%", url: "reviewjournal.com/business/tourism/las-vegas-closes-the-book-on-2025-visitation-down-7-5" },
              { label: "Las Vegas 2026 tourism recovery projected", url: "travelweekly.com — Las Vegas tourism recovery expected in 2026" },
              { label: "Illuminarium at AREA15 closing permanently", url: "fox5vegas.com/2026/03/05/illuminarium-area15-las-vegas-close-permanently" },
              { label: "Las Vegas immersive venue closures trend", url: "casino.org/news/tourists-less-immersed-in-las-vegas-trend" },
              { label: "Corner Bar Management portfolio & revenue", url: "lasvegasmagazine.com/entertainment/2022/aug/12/corner-bar-management" },
              { label: "Fremont East district evolution", url: "lasvegasweekly.com/nightlife/2025/oct/16/fremont-east-evolves" },
              { label: "Global immersive entertainment market size", url: "grandviewresearch.com/industry-analysis/immersive-entertainment-market-report" },
              { label: "Oddyssey signals new era of Vegas nightlife", url: "yahoo.com/entertainment/articles/area15-oddyssey-signals-era-vegas-020022338" },
              { label: "Discopussy official", url: "discopussydtlv.com" },
              { label: "We All Scream official", url: "weallscream.com" },
              { label: "Commonwealth official", url: "commonwealthlv.com" },
              { label: "Meow Wolf Omega Mart", url: "meowwolf.com/visit/las-vegas" },
              { label: "Lost Spirits Distillery (closed)", url: "yelp.com/biz/lost-spirits-distillery-las-vegas-2" },
            ].map((s, i) => (
              <div key={i} className="cl-source">
                <span className="cl-source-num">{i + 1}</span>
                <span className="cl-source-text">{s.label} &mdash; <span className="cl-source-url">{s.url}</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="cl-footer">
          <Link href="/oddyssey-manor" className="cl-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const clStyles = `
.cl-page { max-width: 1000px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.cl-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.cl-back:hover { color: #c9a84c; }

.cl-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.cl-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.cl-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 16px; }
.cl-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px,5vw,48px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.cl-subtitle { font-size: 14px; letter-spacing: 2px; color: #9a958d; margin-bottom: 8px; }
.cl-meta { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; }

.cl-insight { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); border-left: 3px solid #c9a84c; padding: 24px 28px; margin-bottom: 40px; }
.cl-insight p { font-size: 14px; color: #9a958d; line-height: 1.7; }
.cl-insight strong { color: #e8e4dd; font-weight: 500; }

.cl-section { margin-bottom: 56px; }
.cl-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }

.cl-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.cl-metric { background: #060606; padding: 24px; text-align: center; }
.cl-metric-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #c9a84c; margin-bottom: 4px; }
.cl-metric-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #9a958d; margin-bottom: 4px; }
.cl-metric-note { font-size: 10px; color: #5a5650; }

.cl-competitor { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
.cl-comp-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cl-comp-header h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; letter-spacing: 1px; }
.cl-comp-location { font-size: 11px; color: #5a5650; letter-spacing: 1px; }
.cl-threat { font-size: 9px; letter-spacing: 2px; padding: 5px 14px; font-weight: 600; flex-shrink: 0; }
.cl-threat-high { color: #c0392b; border: 1px solid rgba(192,57,43,0.3); }
.cl-threat-medium { color: #f39c12; border: 1px solid rgba(243,156,18,0.3); }
.cl-threat-lowmed { color: #f39c12; border: 1px solid rgba(243,156,18,0.2); }
.cl-threat-low { color: #27ae60; border: 1px solid rgba(39,174,96,0.3); }
.cl-threat-symbiotic { color: #3498db; border: 1px solid rgba(52,152,219,0.3); }

.cl-comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 0; }
.cl-comp-detail { padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; gap: 12px; font-size: 13px; color: #9a958d; }
.cl-detail-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; font-weight: 500; min-width: 80px; flex-shrink: 0; padding-top: 3px; }
.cl-comp-why { padding: 16px 24px; border-top: 1px solid rgba(201,168,76,0.08); }
.cl-comp-why p { font-size: 13px; color: #9a958d; margin-top: 4px; }

.cl-eco-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.cl-eco-card { background: #060606; padding: 24px; }
.cl-eco-card h4 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; margin-bottom: 4px; }
.cl-eco-role { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #d4a574; font-weight: 500; }
.cl-eco-card p { font-size: 12px; color: #9a958d; margin-top: 8px; line-height: 1.6; }

.cl-cbm { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 24px; }
.cl-cbm p { font-size: 14px; color: #9a958d; line-height: 1.7; }
.cl-cbm strong { color: #e8e4dd; font-weight: 500; }
.cl-cbm-venues { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.cl-cbm-tag { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #5a5650; border: 1px solid rgba(255,255,255,0.06); padding: 5px 12px; }

.cl-pos-table { overflow-x: auto; }
.cl-pos-table table { width: 100%; border-collapse: collapse; }
.cl-pos-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.cl-pos-table td { padding: 12px 14px; font-size: 12px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.04); }
.cl-pos-table strong { color: #e8e4dd; font-weight: 400; }
.cl-threat-sm { font-size: 9px; letter-spacing: 1px; font-weight: 600; }
.cl-th-high { color: #c0392b; }
.cl-th-med { color: #f39c12; }
.cl-th-sym { color: #3498db; }

.cl-ws-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.cl-ws-card { background: #060606; padding: 24px; position: relative; }
.cl-ws-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #c9a84c; }
.cl-ws-card h4 { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 8px; }
.cl-ws-card p { font-size: 13px; color: #9a958d; line-height: 1.6; }

.cl-sources { display: flex; flex-direction: column; gap: 0; }
.cl-source { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; color: #9a958d; }
.cl-source-num { font-size: 10px; color: #5a5650; min-width: 20px; font-weight: 500; }
.cl-source-url { color: #5a5650; font-style: italic; }

.cl-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

/* PDF Button */
.cl-top-bar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.cl-pdf-btn {
  display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; color: #9a958d; background: transparent;
  border: 1px solid rgba(255,255,255,0.06); padding: 10px 20px;
  cursor: pointer; transition: all 0.3s; font-family: inherit; font-weight: 500;
}
.cl-pdf-btn:hover { color: #c9a84c; border-color: rgba(201,168,76,0.3); }

@media (max-width: 700px) {
  .cl-page { padding: 24px 20px 60px; }
  .cl-metrics, .cl-eco-grid, .cl-ws-grid { grid-template-columns: 1fr; }
  .cl-comp-grid { grid-template-columns: 1fr; }
  .cl-comp-header { flex-direction: column; gap: 12px; }
  .cl-footer { flex-direction: column; gap: 12px; text-align: center; }
}

@media print {
  body, html, div, section { background: #fff !important; color: #111 !important; }

  .cl-page, .cl-header, .cl-section, .cl-insight,
  .cl-metrics, .cl-metric, .cl-competitor, .cl-comp-header, .cl-comp-grid,
  .cl-comp-detail, .cl-comp-why, .cl-eco-grid, .cl-eco-card,
  .cl-cbm, .cl-pos-table, .cl-ws-grid, .cl-ws-card,
  .cl-sources, .cl-source { background: #fff !important; color: #111 !important; }

  .cl-page { padding: 20px 40px; max-width: none; }
  .no-print, .cl-back, .cl-footer { display: none !important; }

  .cl-header { padding-bottom: 24px; margin-bottom: 24px; border-bottom: 2px solid #111; }
  .cl-logo { filter: invert(1); height: 36px; }
  .cl-label { color: #333 !important; }
  .cl-header h1 { color: #111 !important; font-size: 36px; }
  .cl-subtitle { color: #555 !important; }
  .cl-meta { color: #888 !important; }

  .cl-section { margin-bottom: 28px; }
  .cl-section-title { color: #111 !important; font-size: 18px; border-bottom: 2px solid #111; margin-bottom: 16px; padding-bottom: 8px; }

  .cl-insight { background: #f5f5f5 !important; border: 1px solid #ccc !important; border-left: 3px solid #111 !important; }
  .cl-insight p { color: #333 !important; }
  .cl-insight strong { color: #000 !important; }

  .cl-metrics { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .cl-metric { background: #fff !important; border-bottom: 1px solid #eee; }
  .cl-metric-num { color: #111 !important; }
  .cl-metric-label { color: #333 !important; }
  .cl-metric-note { color: #888 !important; }

  .cl-competitor { background: #fff !important; border: 1px solid #ccc !important; }
  .cl-comp-header { border-color: #ddd !important; }
  .cl-comp-header h3 { color: #111 !important; }
  .cl-comp-location { color: #555 !important; }
  .cl-threat { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .cl-threat-high { color: #c0392b !important; border-color: #c0392b !important; }
  .cl-threat-medium { color: #f39c12 !important; border-color: #f39c12 !important; }
  .cl-threat-low { color: #27ae60 !important; border-color: #27ae60 !important; }
  .cl-threat-symbiotic { color: #3498db !important; border-color: #3498db !important; }
  .cl-comp-detail { border-color: #eee !important; color: #333 !important; }
  .cl-detail-label { color: #888 !important; }
  .cl-comp-why { border-color: #eee !important; }
  .cl-comp-why p { color: #555 !important; }

  .cl-eco-grid { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .cl-eco-card { background: #fff !important; border-bottom: 1px solid #eee; }
  .cl-eco-card h4 { color: #111 !important; }
  .cl-eco-role { color: #333 !important; }
  .cl-eco-card p { color: #555 !important; }

  .cl-cbm { background: #f5f5f5 !important; border: 1px solid #ccc !important; }
  .cl-cbm p { color: #333 !important; }
  .cl-cbm strong { color: #000 !important; }
  .cl-cbm-tag { color: #333 !important; border-color: #ccc !important; }

  .cl-pos-table table { border: 1px solid #ccc; }
  .cl-pos-table th { color: #555 !important; border-color: #ccc !important; }
  .cl-pos-table td { color: #333 !important; border-color: #ddd !important; }
  .cl-pos-table strong { color: #000 !important; }
  .cl-th-high { color: #c0392b !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .cl-th-med { color: #f39c12 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .cl-th-sym { color: #3498db !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  .cl-ws-grid { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .cl-ws-card { background: #fff !important; border-bottom: 1px solid #eee; }
  .cl-ws-card::before { background: #111 !important; }
  .cl-ws-card h4 { color: #111 !important; }
  .cl-ws-card p { color: #555 !important; }

  .cl-source { border-color: #eee !important; color: #333 !important; }
  .cl-source-num { color: #888 !important; }
  .cl-source-url { color: #888 !important; }
}
`;
