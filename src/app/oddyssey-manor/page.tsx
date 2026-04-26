"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function OddysseyHubPage() {
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
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#060606", color: "#e8e4dd", fontFamily: "var(--sans)" }}>
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="uppercase tracking-[0.3em] text-xs mb-12" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>Client Portal</p>
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

  return <HubContent />;
}

function HubContent() {
  return (
    <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh" }}>
      <style>{hubStyles}</style>
      <div className="hub-page">
        <div className="hub-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="hub-logo" />
          <div className="hub-label">Client Portal</div>
          <p className="hub-sub">Go Run Rabbit &bull; April 2026</p>
        </div>

        {/* Internal Tools */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">01</div>
            <div>
              <h2>Internal Tools</h2>
              <p>Operational dashboards for the Oddyssey team &mdash; not for handoff</p>
            </div>
          </div>
          <div className="hub-grid">
            <Link href="/oddyssey-manor/admin/food" className="hub-card hub-card-featured">
              <div className="hub-card-tag" style={{ color: "#27ae60", borderColor: "#27ae60" }}>Admin Tool</div>
              <h3>Manor · Food Inclusions</h3>
              <p>Upload Ticketure CSV → validate → generate kitchen-ready prep sheets. Auto-pull, nightly recap with WoW.</p>
              <span className="hub-card-link">Open Tool &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/admin/noir" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#b46ec8", borderColor: "#b46ec8" }}>Admin Tool</div>
              <h3>Noir · Ticket Sales</h3>
              <p>Attendance, revenue, capacity, and package mix for Noir. Auto-pull, nightly recap with week-over-week.</p>
              <span className="hub-card-link">Open Tool &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/admin/pour-log" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Admin Tool</div>
              <h3>Golden Hour · Pour Log</h3>
              <p>Capture bottle counts for the featured tequila (Bandido / Telsen) and champagne (KU). Feeds the sponsor recap.</p>
              <span className="hub-card-link">Open Tool &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/admin/weekend-recap" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#7fc3ff", borderColor: "#7fc3ff" }}>Admin Tool</div>
              <h3>Weekend Recap</h3>
              <p>Monday-scrum snapshot: Fri/Sat per venue with ticket revenue, bar net, open-bar depletion, channel × package mix, and YTD trajectory.</p>
              <span className="hub-card-link">Open Tool &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Handoff Build */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">02</div>
            <div>
              <h2>Handoff Build</h2>
              <p>Production-ready page builds to hand to the Oddyssey dev team &mdash; approved design applied to live-site content</p>
            </div>
          </div>
          <div className="hub-grid">
            <Link href="/oddyssey-manor/manor" className="hub-card hub-card-featured">
              <div className="hub-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Handoff</div>
              <h3>Manor</h3>
              <p>Full Manor page &mdash; hero, 4 ticket tiers, cocktails, bites, cast, 80-min flow, gallery, FAQ. Mirrors oddysseylv.com/manor structure with the approved noir aesthetic.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/noir" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Handoff</div>
              <h3>Noir</h3>
              <p>Late-night immersive nightlife &mdash; Liquid Gold Fridays, Art in Motion Saturdays, 3 ticket tiers, bottles &amp; tables, bottle menu, events calendar, gallery.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/private" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Handoff</div>
              <h3>Private Events</h3>
              <p>Venue spaces, event types, inclusions, and inquiry form &mdash; corporate, celebrations, brand activations, weddings, buyouts.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Website & Design */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">03</div>
            <div>
              <h2>Website &amp; Design</h2>
              <p>Wireframes, optimization audit, and technical SEO analysis</p>
            </div>
          </div>
          <div className="hub-grid hub-grid-3">
            <Link href="/oddyssey-manor/wireframes" className="hub-card hub-card-featured">
              <div className="hub-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Interactive</div>
              <h3>Website Wireframes</h3>
              <p>Homepage, event calendar, event detail, private events &mdash; 4 pages with brand assets, Golden Hour, bottles &amp; tables.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/audit" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#9a958d", borderColor: "#9a958d" }}>Report</div>
              <h3>Optimization Audit</h3>
              <p>11 findings, 8 recommendations, Golden Hour integration, homepage structure.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/seo-audit" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#e74c3c", borderColor: "#e74c3c" }}>Technical</div>
              <h3>SEO Audit</h3>
              <p>Structured data, meta tags, content analysis, Ticketure integration, 16 action items.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">04</div>
            <div>
              <h2>Market Intelligence</h2>
              <p>Competitive positioning, strategic analysis, and market context</p>
            </div>
          </div>
          <div className="hub-grid">
            <Link href="/oddyssey-manor/competitive-landscape" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#3498db", borderColor: "#3498db" }}>Intelligence</div>
              <h3>Competitive Landscape</h3>
              <p>6 direct competitors, CBM analysis, AREA15 ecosystem, positioning map, white space, cited sources.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/swot-porters" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#27ae60", borderColor: "#27ae60" }}>Strategy</div>
              <h3>SWOT &amp; Porter&rsquo;s Five Forces</h3>
              <p>28-point SWOT, cross-analysis, five forces rated, industry attractiveness score: 5.2/10.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Golden Hour Program */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">05</div>
            <div>
              <h2>Golden Hour Program</h2>
              <p>Open bar concept with El Bandido Tequila &mdash; venue proposal, brand pitch, and marketing assets</p>
            </div>
          </div>
          <div className="hub-grid hub-grid-3">
            <Link href="/oddyssey-manor/golden-hour" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Proposal</div>
              <h3>Golden Hour Proposal</h3>
              <p>Venue-facing pitch &mdash; executive summary, inventory model, value exchange, 4-week pilot plan.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/bandido-partnership" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Brand Pitch</div>
              <h3>El Bandido Partnership</h3>
              <p>Brand-facing pitch &mdash; what El Bandido gets: LV market anchor, weekly exposure, ROI model, cocktail program.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/golden-hour-kit" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Marketing</div>
              <h3>Marketing Asset Kit</h3>
              <p>3 IG posts, story sequence, email blast, TikTok concepts, creative mockups, content calendar.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Growth */}
        <div className="hub-group">
          <div className="hub-group-header">
            <div className="hub-group-num">06</div>
            <div>
              <h2>Audience Growth</h2>
              <p>Database building, social growth, and email capture strategies</p>
            </div>
          </div>
          <div className="hub-grid">
            <Link href="/oddyssey-manor/contest-concept" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#e67e22", borderColor: "#e67e22" }}>Concept</div>
              <h3>Contest &amp; Giveaway</h3>
              <p>Strategy, prize package, timeline, contest rules, data policy. Requires AREA15 approval. Exportable as PDF.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/oddyssey-manor/contest-landing" className="hub-card">
              <div className="hub-card-tag" style={{ color: "#c9a84c", borderColor: "#c9a84c" }}>Design</div>
              <h3>Landing Page Preview</h3>
              <p>Stitch-designed contest registration page &mdash; editorial noir aesthetic, mobile-first, art-deco line art, real gallery imagery.</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="hub-footer">
          <p>Oddyssey Manor &amp; Noir &bull; AREA15 &bull; Las Vegas</p>
        </div>
      </div>
    </div>
  );
}

const hubStyles = `
.hub-page { max-width: 960px; margin: 0 auto; padding: 80px 40px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; }
.hub-header { text-align: center; margin-bottom: 72px; }
.hub-logo { height: 48px; width: auto; margin: 0 auto 24px; display: block; }
.hub-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 8px; }
.hub-sub { font-size: 12px; color: #5a5650; letter-spacing: 1.5px; }

.hub-group { margin-bottom: 56px; }
.hub-group-header { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
.hub-group-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: rgba(201,168,76,0.3); line-height: 1; min-width: 36px; }
.hub-group-header h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
.hub-group-header p { font-size: 12px; color: #5a5650; letter-spacing: 1px; }

.hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.hub-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.hub-card-featured { grid-row: 1 / 1; }
.hub-card {
  background: #060606; padding: 32px; display: flex; flex-direction: column;
  text-decoration: none; color: #e8e4dd; transition: background 0.4s cubic-bezier(0.16,1,0.3,1);
  position: relative; cursor: pointer;
}
.hub-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: #c9a84c; transform: scaleX(0); transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
}
.hub-card:hover { background: #0d0d0d; }
.hub-card:hover::before { transform: scaleX(1); }
.hub-card-tag {
  font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 500;
  border: 1px solid; padding: 4px 12px; align-self: flex-start; margin-bottom: 16px;
}
.hub-card h3 {
  font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 400;
  letter-spacing: 1px; margin-bottom: 10px;
}
.hub-card p { font-size: 13px; color: #9a958d; line-height: 1.6; flex: 1; margin-bottom: 20px; }
.hub-card-link { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; }

.hub-footer { margin-top: 60px; text-align: center; }
.hub-footer p { font-size: 10px; color: #5a5650; letter-spacing: 2px; text-transform: uppercase; }

@media (max-width: 768px) { .hub-grid-3 { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .hub-grid { grid-template-columns: 1fr; } .hub-page { padding: 40px 20px; } .hub-group-num { display: none; } }
`;
