"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function GoldenHourPage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Golden Hour Proposal</p>
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
      <style>{ghStyles}</style>
      <div className="gh-page">
        <Link href="/oddyssey-manor" className="gh-back">&larr; All Documents</Link>

        <div className="gh-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="gh-logo" />
          <div className="gh-presents">Presents</div>
          <h1>Golden Hour</h1>
          <p className="gh-subtitle">Open Bar featuring El Bandido Tequila</p>
          <div className="gh-meta">A Brand Partnership & Traffic Catalyst Program<br />Pilot Launch: April 17&ndash;18, 2026</div>
        </div>

        {/* Executive Summary */}
        <div className="gh-section">
          <div className="gh-section-title">Executive Summary</div>
          <p>Golden Hour is a 2-hour open bar program designed to pack Oddyssey Noir from the moment doors open. Tequila cocktails, champagne, and caviar bumps &mdash; $18 cover at the door, free for existing database via email invite. The program fills the room before peak hours and transitions seamlessly into Liquid Gold (Fridays) and Art in Motion (Saturdays).</p>
          <p>Each night features a different tequila brand partner: <strong>El Bandido Reposado (Fridays)</strong> and <strong>Telson (Saturdays)</strong>, alongside <strong>KU Champagne</strong> served in the Red Room. The program launches as a <strong>4-week pilot</strong> on April 17&ndash;18, 2026.</p>
        </div>

        {/* Problem / Solution */}
        <div className="gh-two-col">
          <div className="gh-col">
            <div className="gh-col-label" style={{ color: "#c0392b" }}>The Problem</div>
            <p>Guests arrive late, split time across venues, and decide based on drink cost. For a newer concept like Oddyssey, removing the financial barrier while showcasing the experience is the fastest path to building a loyal audience. A packed room creates energy; energy creates word-of-mouth.</p>
          </div>
          <div className="gh-col">
            <div className="gh-col-label" style={{ color: "#27ae60" }}>The Solution</div>
            <p>A 2-hour open bar: $18 at the door, free for existing database contacts via email invite. Tequila cocktails at both bars, champagne in the Red Room, caviar bumps on Saturdays. The email blast drives early RSVPs and captures attendance data. Not a happy hour teaser &mdash; a full commitment.</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="gh-section">
          <div className="gh-section-title">Event Timeline</div>
          <div className="gh-timeline">
            {[
              { time: "10:00 PM", event: "Doors open — Golden Hour begins", note: "Open bar: tequila cocktails (both bars) + KU Champagne (Red Room)" },
              { time: "10–12 AM", event: "Open bar flowing — while supplies last", note: "Fri: El Bandido Reposado · Sat: Telson + $10 caviar bumps" },
              { time: "11:30 PM", event: "Last call on Golden Hour", note: "If supplies remain" },
              { time: "12:00 AM", event: "Golden Hour ends — all bars return to paid", note: "Full revenue window opens" },
              { time: "12–2+ AM", event: "Liquid Gold (Fri) / Art in Motion (Sat)", note: "Paid bar through close" },
            ].map((item, i) => (
              <div key={i} className="gh-timeline-row">
                <div className="gh-timeline-time">{item.time}</div>
                <div className="gh-timeline-dot" />
                <div className="gh-timeline-content">
                  <strong>{item.event}</strong>
                  <span>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="gh-section">
          <div className="gh-section-title">Inventory Model</div>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead><tr><th>Component</th><th>Contribution</th><th>Yield</th></tr></thead>
              <tbody>
                <tr><td>Venue purchase</td><td>2 cases (12 bottles)</td><td>~174 cocktails</td></tr>
                <tr><td>El Bandido contribution</td><td>1 case (6 bottles)</td><td>~87 cocktails</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>3 cases (18 bottles)</strong></td><td><strong>~260 cocktails</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p className="gh-table-note">Based on 750ml bottles, 6 per case, avg 1.75oz pour per cocktail (~14.5 drinks/bottle). Featured cocktails are complimentary during Golden Hour. Full paid bar remains open for guests who prefer other drinks &mdash; all standard menu items available for purchase throughout the evening.</p>
        </div>

        {/* Menu */}
        <div className="gh-section">
          <div className="gh-section-title">Golden Hour Menu</div>

          <h3 style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1, marginBottom: 16, color: "#d4a574" }}>Friday &mdash; El Bandido Reposado (Both Bars)</h3>
          <div className="gh-menu-grid">
            {[
              { name: "Bandido Margarita", desc: "El Bandido Blanco, lime juice, agave nectar — served on ice" },
              { name: "Inside Job", desc: "El Bandido Reposado, Braulio, sweet vermouth, Yellow Chartreuse — orange twist" },
              { name: "Bandido Lemonade", desc: "El Bandido Blanco, coconut water, fresh lemon, lemonade — sugar rim, mint" },
            ].map(c => (
              <div key={c.name} className="gh-menu-item">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1, marginBottom: 16, marginTop: 32, color: "#9a958d" }}>Saturday &mdash; Telson (Both Bars)</h3>
          <div className="gh-menu-grid">
            {[
              { name: "Telson Margarita", desc: "Telson tequila, lime juice, agave nectar — served on ice" },
              { name: "Telson Paloma", desc: "Telson tequila, grapefruit, lime, soda — refreshing, crowd-friendly" },
              { name: "Telson Soda", desc: "Telson tequila, soda, lime — clean, fast pour, high throughput" },
            ].map(c => (
              <div key={c.name} className="gh-menu-item">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1, marginBottom: 16, marginTop: 32 }}>Red Room &mdash; Both Nights</h3>
          <div className="gh-menu-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              { name: "KU Champagne", desc: "Served in the Red Room — complimentary during Golden Hour, both nights" },
              { name: "Caviar Bumps", desc: "$10 — served at the champagne station in the Red Room (Saturday only)" },
            ].map(c => (
              <div key={c.name} className="gh-menu-item">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="gh-menu-note">All other bar offerings at regular price during Golden Hour. All bars return to fully paid at midnight.</p>
        </div>

        {/* Night Integration */}
        <div className="gh-section">
          <div className="gh-section-title">Themed Night Integration</div>
          <div className="gh-two-col">
            <div className="gh-col gh-col-friday">
              <div className="gh-col-label" style={{ color: "#d4a574" }}>Friday &mdash; Liquid Gold</div>
              <p><strong>Tequila:</strong> El Bandido Reposado (both bars)</p>
              <p><strong>Champagne:</strong> KU (Red Room)</p>
              <p><strong>10 PM&ndash;12 AM:</strong> Golden Hour open bar</p>
              <p><strong>12 AM&ndash;Late:</strong> Paid bar, deep house &amp; techno</p>
            </div>
            <div className="gh-col gh-col-saturday">
              <div className="gh-col-label">Saturday &mdash; Art in Motion</div>
              <p><strong>Tequila:</strong> Telson (both bars)</p>
              <p><strong>Champagne:</strong> KU (Red Room)</p>
              <p><strong>Caviar:</strong> $10 caviar bumps (Red Room champagne station)</p>
              <p><strong>10 PM&ndash;12 AM:</strong> Golden Hour open bar</p>
              <p><strong>12 AM&ndash;Late:</strong> Paid bar, rotating genres</p>
            </div>
          </div>
        </div>

        {/* RSVP */}
        <div className="gh-section">
          <div className="gh-section-title">Entry Model</div>
          <div className="gh-rsvp-grid">
            {[
              { title: "Database Invite — Free", desc: "Email blast to existing contacts gets them in free. Rewards loyalty, guarantees a base crowd, reactivates lapsed guests, and captures RSVP data for future marketing." },
              { title: "Walk-up — $18", desc: "Standard door price includes open bar access. Generates revenue from spontaneous guests and tourists. All walk-ups still get the full Golden Hour experience." },
              { title: "Email Capture", desc: "Every database invite is a trackable RSVP. Over the 4-week pilot, this builds an owned audience list for future events, paid nights, and Manor upsells." },
            ].map(item => (
              <div key={item.title} className="gh-rsvp-item">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Value Exchange */}
        <div className="gh-section">
          <div className="gh-section-title">Value Exchange</div>
          <div className="gh-value-grid">
            {[
              { title: "For Oddyssey", items: ["Packs the room from doors open", "Removes #1 guest objection (drink cost)", "Creates predictable weekly anchor", "Massive organic social content", "Offsets cost through brand partnership"] },
              { title: "For El Bandido Tequila", items: ["200–400 adults per night sampling", "Logo across all marketing assets", "Featured cocktail menu placement", "Social media inclusion (IG + TikTok)", "Premium nightlife brand association"] },
              { title: "For the Guest", items: ["Free entry with RSVP", "Complimentary cocktails 10 PM–12 AM", "Discover El Bandido through curated drinks", "Full Oddyssey Noir experience", "No cover, no drink tab"] },
            ].map(col => (
              <div key={col.title} className="gh-value-col">
                <h4>{col.title}</h4>
                <ul>{col.items.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        {/* Target Metrics */}
        <div className="gh-section">
          <div className="gh-section-title">Target Metrics</div>
          <div className="gh-metrics">
            {[
              { metric: "200–400", label: "Attendance / Night" },
              { metric: "75–150", label: "Early Arrivals (by 10:30)" },
              { metric: "90+", label: "Avg Minutes Dwell Time" },
              { metric: "30+", label: "Tagged Posts / Night" },
            ].map(m => (
              <div key={m.label} className="gh-metric">
                <div className="gh-metric-num">{m.metric}</div>
                <div className="gh-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pilot */}
        <div className="gh-section">
          <div className="gh-section-title">4-Week Pilot Structure</div>
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead><tr><th>Week</th><th>Dates</th><th>Focus</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Fri 4/17 & Sat 4/18</td><td>Launch — baseline attendance & inventory burn rate</td></tr>
                <tr><td>2</td><td>Fri 4/24 & Sat 4/25</td><td>Optimize inventory volume & pour strategy</td></tr>
                <tr><td>3</td><td>Fri 5/1 & Sat 5/2</td><td>Scale — test increased inventory if demand warrants</td></tr>
                <tr><td>4</td><td>Fri 5/8 & Sat 5/9</td><td>Final measurement & evaluation</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Positioning */}
        <div className="gh-section">
          <div className="gh-insight">
            <p>Golden Hour is not a happy hour gimmick or a loss-leader. It is a <strong>venue-filling traffic catalyst</strong> &mdash; a strategic program designed to pack the room, create massive social buzz, and let the Oddyssey experience sell itself. When guests walk into a full venue with free El Bandido Tequila cocktails, live performers, and two dance floors, they don&rsquo;t just have a good night &mdash; they tell everyone about it. That&rsquo;s the engine that builds a weekly audience.</p>
          </div>
        </div>

        <div className="gh-footer">
          <Link href="/oddyssey-manor" className="gh-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const ghStyles = `
.gh-page { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.gh-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.gh-back:hover { color: #c9a84c; }

.gh-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.gh-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.gh-presents { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #5a5650; margin-bottom: 16px; }
.gh-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px,6vw,64px); font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: #d4a574; margin-bottom: 8px; }
.gh-subtitle { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #9a958d; margin-bottom: 24px; }
.gh-meta { font-size: 12px; color: #5a5650; letter-spacing: 1px; line-height: 1.8; }

.gh-section { margin-bottom: 48px; }
.gh-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.gh-section > p { font-size: 14px; color: #9a958d; margin-bottom: 16px; }
.gh-section strong { color: #e8e4dd; font-weight: 500; }

.gh-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px; }
.gh-col { background: #060606; padding: 28px; }
.gh-col-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; margin-bottom: 12px; color: #9a958d; }
.gh-col p { font-size: 13px; color: #9a958d; line-height: 1.7; margin-bottom: 8px; }
.gh-col strong { color: #e8e4dd; font-weight: 500; }

.gh-timeline { display: flex; flex-direction: column; }
.gh-timeline-row { display: grid; grid-template-columns: 90px 20px 1fr; gap: 12px; align-items: start; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.gh-timeline-time { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; color: #d4a574; text-align: right; padding-top: 2px; }
.gh-timeline-dot { width: 8px; height: 8px; border: 1px solid #d4a574; transform: rotate(45deg); margin-top: 5px; justify-self: center; }
.gh-timeline-content { font-size: 13px; color: #9a958d; }
.gh-timeline-content strong { display: block; color: #e8e4dd; font-weight: 400; margin-bottom: 2px; }

.gh-table-wrap { overflow-x: auto; }
.gh-table { width: 100%; border-collapse: collapse; }
.gh-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.gh-table td { padding: 14px 16px; font-size: 13px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.06); }
.gh-table strong { color: #e8e4dd; font-weight: 500; }

.gh-menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.gh-menu-item { background: #060606; padding: 24px; }
.gh-menu-item h4 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; letter-spacing: 1px; margin-bottom: 8px; color: #d4a574; }
.gh-menu-item p { font-size: 12px; color: #5a5650; }
.gh-menu-note { font-size: 12px; color: #5a5650; margin-top: 16px; font-style: italic; }
.gh-table-note { font-size: 11px; color: #5a5650; margin-top: 16px; line-height: 1.6; font-style: italic; }

.gh-rsvp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.gh-rsvp-item { background: #060606; padding: 24px; }
.gh-rsvp-item h4 { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 10px; }
.gh-rsvp-item p { font-size: 13px; color: #9a958d; line-height: 1.6; }

.gh-value-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.gh-value-col { background: #060606; padding: 24px; }
.gh-value-col h4 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; letter-spacing: 1px; margin-bottom: 16px; }
.gh-value-col ul { list-style: none; }
.gh-value-col li { font-size: 12px; color: #9a958d; padding: 6px 0 6px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; }
.gh-value-col li::before { content: ''; position: absolute; left: 0; top: 12px; width: 4px; height: 4px; border: 1px solid #c9a84c; transform: rotate(45deg); }

.gh-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.gh-metric { background: #060606; padding: 28px; text-align: center; }
.gh-metric-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #d4a574; margin-bottom: 6px; }
.gh-metric-label { font-size: 10px; color: #5a5650; letter-spacing: 1.5px; text-transform: uppercase; }

.gh-insight { background: #0d0d0d; border: 1px solid rgba(212,165,116,0.15); border-left: 3px solid #d4a574; padding: 28px 32px; }
.gh-insight p { font-size: 15px; color: #9a958d; line-height: 1.7; }
.gh-insight strong { color: #e8e4dd; font-weight: 500; }

.gh-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .gh-page { padding: 24px 20px 60px; }
  .gh-two-col, .gh-menu-grid, .gh-rsvp-grid, .gh-value-grid { grid-template-columns: 1fr; }
  .gh-metrics { grid-template-columns: 1fr 1fr; }
  .gh-timeline-row { grid-template-columns: 70px 16px 1fr; gap: 8px; }
  .gh-timeline-time { font-size: 10px; }
  .gh-header h1 { font-size: 40px; }
  .gh-footer { flex-direction: column; gap: 12px; text-align: center; }
}
`;
