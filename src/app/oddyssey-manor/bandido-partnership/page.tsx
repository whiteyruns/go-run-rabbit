"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function BandidoPartnershipPage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Brand Partnership</p>
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
      <style>{bpStyles}</style>
      <div className="bp-page">
        <Link href="/oddyssey-manor" className="bp-back">&larr; All Documents</Link>

        <div className="bp-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="bp-logo" />
          <div className="bp-presents">Brand Partnership Proposal</div>
          <h1>El Bandido Yankee<br />&times; Oddyssey</h1>
          <p className="bp-subtitle">Golden Hour &mdash; Featured Spirit Program</p>
          <div className="bp-meta">Las Vegas &bull; AREA15 &bull; Every Friday &amp; Saturday</div>
        </div>

        {/* The Opportunity */}
        <div className="bp-section">
          <div className="bp-section-title">The Opportunity</div>
          <div className="bp-insight">
            <p><strong>El Bandido Yankee gets a Las Vegas on-premise anchor</strong> inside one of the city&rsquo;s most talked-about immersive entertainment venues. Oddyssey at AREA15 draws from 15M+ visitors annually, 69% under 35 &mdash; exactly the demographic building brand loyalty in the ultra-premium tequila category. <strong>This isn&rsquo;t a one-night sampling event. It&rsquo;s a weekly, recurring featured spirit program</strong> with your brand at the center of every Friday and Saturday night.</p>
          </div>
        </div>

        {/* What is Golden Hour */}
        <div className="bp-section">
          <div className="bp-section-title">What is Golden Hour</div>
          <p className="bp-body">Golden Hour is a 2-hour complimentary cocktail program running every Friday and Saturday at Oddyssey Noir from 10 PM to midnight. Guests who RSVP receive free entry. Three featured cocktails &mdash; all built on El Bandido Yankee &mdash; are served while supplies last. After midnight, the night evolves into Liquid Gold (Fridays) or Art in Motion (Saturdays) with paid bar service through close.</p>
          <div className="bp-timeline">
            {[
              { time: "10 PM", event: "Doors + Golden Hour begins", note: "El Bandido featured cocktails flowing" },
              { time: "10–12", event: "Open bar — while supplies last", note: "~260 cocktails per night from 3 cases" },
              { time: "12 AM", event: "Golden Hour ends", note: "Paid bar takes over, El Bandido stays on menu" },
              { time: "Late", event: "Liquid Gold / Art in Motion continues", note: "Full programming through close" },
            ].map((item, i) => (
              <div key={i} className="bp-timeline-row">
                <div className="bp-timeline-time">{item.time}</div>
                <div className="bp-timeline-dot" />
                <div className="bp-timeline-content">
                  <strong>{item.event}</strong>
                  <span>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Cocktails */}
        <div className="bp-section">
          <div className="bp-section-title">Featured Cocktails</div>
          <p className="bp-body">Three signature cocktails built exclusively on El Bandido Yankee, served during Golden Hour.</p>
          <div className="bp-cocktail-grid">
            <div className="bp-cocktail">
              <h4>Bandido Margarita</h4>
              <div className="bp-spirit">El Bandido Blanco</div>
              <p>2 parts Blanco, 1 part lime juice, &frac34; part agave nectar. Served over ice.</p>
            </div>
            <div className="bp-cocktail">
              <h4>Inside Job</h4>
              <div className="bp-spirit">El Bandido Reposado</div>
              <p>1.5 oz Reposado, 0.5 oz Braulio, 0.5 oz sweet vermouth, 0.5 oz Yellow Chartreuse. Orange twist.</p>
            </div>
            <div className="bp-cocktail">
              <h4>Bandido Lemonade</h4>
              <div className="bp-spirit">El Bandido Blanco</div>
              <p>2 oz Blanco, 2 oz coconut water, 1 oz fresh lemon, 2 oz lemonade. Sugar rim, mint garnish.</p>
            </div>
          </div>
          <p className="bp-note">Recipes sourced from elbandidoyankee.com. All cocktails feature El Bandido Yankee as the exclusive spirit.</p>
        </div>

        {/* What El Bandido Gets */}
        <div className="bp-section">
          <div className="bp-section-title">What El Bandido Yankee Gets</div>
          <div className="bp-value-grid">
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h4>Weekly Recurring Presence</h4>
              <p>Not a one-night activation. El Bandido is the featured spirit every Friday &amp; Saturday night, 52 weeks a year. Consistent, predictable brand impressions.</p>
            </div>
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h4>200&ndash;400 Qualified Adults / Night</h4>
              <p>21+, experience-seeking, 69% under 35. Extended 2-hour sampling window &mdash; not a 30-second taste at a trade show. Real cocktail discovery in a premium environment.</p>
            </div>
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h4>Full Marketing Integration</h4>
              <p>El Bandido Yankee logo on all Golden Hour social graphics, email blasts, ticket pages, digital signage, and onsite cocktail menus. Co-branded across every touchpoint.</p>
            </div>
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h4>Las Vegas Market Foothold</h4>
              <p>Anchor on-premise account in the #1 entertainment market in the US. AREA15 is the fastest-growing entertainment district in Vegas with 15M+ cumulative visitors.</p>
            </div>
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <h4>Content Engine</h4>
              <p>Oddyssey&rsquo;s immersive environment produces inherently shareable content. Every Golden Hour night generates crowd footage, cocktail close-ups, and performer content &mdash; all co-branded with El Bandido.</p>
            </div>
            <div className="bp-value-card">
              <div className="bp-value-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d4a574" strokeWidth="1">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h4>Measurable ROI</h4>
              <p>Track inventory burn rate, RSVP volume (email captures), social mentions, and conversion to paid bar orders after midnight. Real data, not guesswork.</p>
            </div>
          </div>
        </div>

        {/* Brand Visibility Package */}
        <div className="bp-section">
          <div className="bp-section-title">Brand Visibility Package</div>
          <div className="bp-two-col">
            <div className="bp-col">
              <h4>Standard (Included)</h4>
              <ul>
                <li>Logo on all Golden Hour social graphics (IG feed + stories, TikTok)</li>
                <li>Brand logo in email marketing blasts</li>
                <li>Featured placement on onsite cocktail menu</li>
                <li>Logo on ticket page header</li>
                <li>Digital signage inside venue</li>
                <li>&ldquo;Open Bar featuring El Bandido Yankee Tequila&rdquo; on all copy</li>
              </ul>
            </div>
            <div className="bp-col">
              <h4>Premium Add-Ons (Optional)</h4>
              <ul>
                <li>Step &amp; repeat photo wall at entry</li>
                <li>Branded glassware / custom garnish</li>
                <li>Cocktail naming integration (&ldquo;The Bandido Margarita&rdquo;)</li>
                <li>Onsite brand ambassadors</li>
                <li>Co-branded content shoots for El Bandido channels</li>
                <li>Exclusive post-midnight menu feature (paid bar)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Investment Model */}
        <div className="bp-section">
          <div className="bp-section-title">Investment Model</div>
          <div className="bp-table-wrap">
            <table className="bp-table">
              <thead><tr><th>Component</th><th>Contribution</th><th>Yield</th></tr></thead>
              <tbody>
                <tr><td>Oddyssey purchases</td><td>2 cases / night (12 bottles)</td><td>~174 cocktails</td></tr>
                <tr><td><strong>El Bandido contributes</strong></td><td><strong>1 case / night (6 bottles)</strong></td><td><strong>~87 cocktails</strong></td></tr>
                <tr><td>Total per night</td><td>3 cases (18 bottles)</td><td>~260 cocktails</td></tr>
                <tr><td>Weekly (Fri + Sat)</td><td>6 cases (36 bottles)</td><td>~520 cocktails</td></tr>
                <tr><td><strong>4-week pilot total</strong></td><td><strong>24 cases (144 bottles)</strong></td><td><strong>~2,080 cocktails</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p className="bp-note">Based on 750ml bottles, 6 per case, avg 1.75oz pour per cocktail. El Bandido&rsquo;s contribution: 1 case per night (6 bottles) &mdash; approximately $270&ndash;330 wholesale value per night.</p>
        </div>

        {/* What El Bandido Gets Per Dollar */}
        <div className="bp-section">
          <div className="bp-section-title">Return on Investment</div>
          <div className="bp-roi-grid">
            {[
              { metric: "~520", label: "Cocktails served / week", sub: "with your spirit exclusively" },
              { metric: "400–800", label: "Qualified tastings / week", sub: "21+, in premium setting" },
              { metric: "8", label: "Nights in pilot", sub: "4 weekends, Fri + Sat" },
              { metric: "~2,080", label: "Total cocktails in pilot", sub: "from 24 cases contributed" },
            ].map(m => (
              <div key={m.label} className="bp-roi-card">
                <div className="bp-roi-num">{m.metric}</div>
                <div className="bp-roi-label">{m.label}</div>
                <div className="bp-roi-sub">{m.sub}</div>
              </div>
            ))}
          </div>
          <div className="bp-insight" style={{ marginTop: 24 }}>
            <p>At ~$300/night wholesale for 1 case, El Bandido&rsquo;s pilot investment is approximately <strong>$2,400 over 4 weeks</strong> (8 nights). In return: <strong>~2,080 cocktails served, 3,200&ndash;6,400 brand impressions, weekly social content, email list exposure, and a Las Vegas on-premise anchor account</strong> &mdash; all in the market you&rsquo;re actively expanding into.</p>
          </div>
        </div>

        {/* Why Oddyssey */}
        <div className="bp-section">
          <div className="bp-section-title">Why Oddyssey</div>
          <div className="bp-why-grid">
            {[
              { title: "Not a generic club", desc: "Oddyssey is an immersive theatre and nightlife venue — performers, themed rooms, circus acts, two dance floors. Your brand lives in a memorable environment, not a forgettable bar." },
              { title: "AREA15 ecosystem", desc: "15M+ visitors, anchored by Meow Wolf's Omega Mart. The fastest-growing entertainment district in Vegas with Zone 2 expansion adding 300,000 sq ft." },
              { title: "The right demographic", desc: "69% under 35, experience-seekers, culturally fluent. The exact audience building loyalty in the ultra-premium tequila category." },
              { title: "Content-native environment", desc: "The immersive production value means every night generates high-quality social content — crowd footage, cocktail shots, performer moments — all co-branded with El Bandido." },
              { title: "Additive-free fits the brand", desc: "Oddyssey's craft cocktail program aligns with El Bandido's 'no additives, no chemicals' positioning. Premium spirit in a premium setting — the story writes itself." },
              { title: "Weekly consistency", desc: "Not a one-off activation. Golden Hour runs every Friday and Saturday — building recognition through repetition. Guests associate El Bandido with the best part of their night." },
            ].map(w => (
              <div key={w.title} className="bp-why-card">
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pilot Structure */}
        <div className="bp-section">
          <div className="bp-section-title">4-Week Pilot</div>
          <div className="bp-table-wrap">
            <table className="bp-table">
              <thead><tr><th>Week</th><th>Dates</th><th>El Bandido Contribution</th><th>Focus</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Fri 4/17 &amp; Sat 4/18</td><td>2 cases</td><td>Launch &mdash; baseline attendance &amp; burn rate</td></tr>
                <tr><td>2</td><td>Fri 4/24 &amp; Sat 4/25</td><td>2 cases</td><td>Optimize pour strategy &amp; inventory</td></tr>
                <tr><td>3</td><td>Fri 5/1 &amp; Sat 5/2</td><td>2 cases</td><td>Scale if demand warrants</td></tr>
                <tr><td>4</td><td>Fri 5/8 &amp; Sat 5/9</td><td>2 cases</td><td>Final measurement &amp; evaluation</td></tr>
              </tbody>
            </table>
          </div>
          <p className="bp-body" style={{ marginTop: 16 }}><strong>Post-pilot evaluation:</strong> attendance lift, inventory burn rate (how fast does supply run out?), social mentions &amp; tagged content, return visit rate, and conversion to paid El Bandido orders after midnight.</p>
        </div>

        {/* CTA */}
        <div className="bp-section bp-cta-section">
          <h2>Let&rsquo;s Build This Together</h2>
          <p>El Bandido Yankee gets a Las Vegas anchor. Oddyssey gets a packed room. Guests get free drinks in an unforgettable setting. Everyone wins.</p>
          <p className="bp-cta-contact">Contact: Go Run Rabbit</p>
        </div>

        <div className="bp-footer">
          <Link href="/oddyssey-manor" className="bp-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const bpStyles = `
.bp-page { max-width: 960px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.bp-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.bp-back:hover { color: #c9a84c; }

.bp-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.bp-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.bp-presents { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #5a5650; margin-bottom: 20px; font-weight: 500; }
.bp-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px,5vw,52px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; line-height: 1.15; }
.bp-subtitle { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #d4a574; margin-bottom: 8px; }
.bp-meta { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; }

.bp-section { margin-bottom: 56px; }
.bp-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bp-body { font-size: 14px; color: #9a958d; line-height: 1.7; margin-bottom: 24px; }
.bp-body strong { color: #e8e4dd; font-weight: 500; }
.bp-note { font-size: 11px; color: #5a5650; margin-top: 12px; font-style: italic; line-height: 1.6; }

.bp-insight { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); border-left: 3px solid #d4a574; padding: 24px 28px; margin-bottom: 32px; }
.bp-insight p { font-size: 14px; color: #9a958d; line-height: 1.7; }
.bp-insight strong { color: #e8e4dd; font-weight: 500; }

.bp-timeline { display: flex; flex-direction: column; margin-top: 24px; }
.bp-timeline-row { display: grid; grid-template-columns: 70px 20px 1fr; gap: 12px; align-items: start; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bp-timeline-time { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; color: #d4a574; text-align: right; padding-top: 2px; }
.bp-timeline-dot { width: 8px; height: 8px; border: 1px solid #d4a574; transform: rotate(45deg); margin-top: 5px; justify-self: center; }
.bp-timeline-content { font-size: 13px; color: #9a958d; }
.bp-timeline-content strong { display: block; color: #e8e4dd; font-weight: 400; margin-bottom: 2px; }

.bp-cocktail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); margin-top: 16px; }
.bp-cocktail { background: #060606; padding: 24px; }
.bp-cocktail h4 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; letter-spacing: 1px; margin-bottom: 6px; }
.bp-spirit { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #d4a574; font-weight: 500; margin-bottom: 12px; }
.bp-cocktail p { font-size: 12px; color: #5a5650; line-height: 1.5; }

.bp-value-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.bp-value-card { background: #060606; padding: 28px; }
.bp-value-icon { margin-bottom: 16px; }
.bp-value-card h4 { font-size: 13px; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 10px; }
.bp-value-card p { font-size: 12px; color: #9a958d; line-height: 1.6; }

.bp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.bp-col { background: #060606; padding: 28px; }
.bp-col h4 { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #d4a574; font-weight: 500; margin-bottom: 16px; }
.bp-col ul { list-style: none; }
.bp-col li { font-size: 12px; color: #9a958d; padding: 7px 0 7px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; line-height: 1.5; }
.bp-col li::before { content: ''; position: absolute; left: 0; top: 13px; width: 4px; height: 4px; border: 1px solid #d4a574; transform: rotate(45deg); }

.bp-table-wrap { overflow-x: auto; }
.bp-table { width: 100%; border-collapse: collapse; }
.bp-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.bp-table td { padding: 14px 16px; font-size: 13px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.04); }
.bp-table strong { color: #e8e4dd; font-weight: 500; }

.bp-roi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.bp-roi-card { background: #060606; padding: 24px; text-align: center; }
.bp-roi-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #d4a574; margin-bottom: 4px; }
.bp-roi-label { font-size: 11px; color: #e8e4dd; letter-spacing: 1px; margin-bottom: 4px; }
.bp-roi-sub { font-size: 10px; color: #5a5650; }

.bp-why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.bp-why-card { background: #060606; padding: 24px; position: relative; }
.bp-why-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #d4a574; }
.bp-why-card h4 { font-size: 12px; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px; }
.bp-why-card p { font-size: 12px; color: #9a958d; line-height: 1.6; }

.bp-cta-section { text-align: center; padding: 48px 32px; background: #0d0d0d; border: 1px solid rgba(212,165,116,0.1); }
.bp-cta-section h2 { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; color: #d4a574; margin-bottom: 12px; }
.bp-cta-section p { font-size: 14px; color: #9a958d; margin-bottom: 8px; }
.bp-cta-contact { font-size: 12px; color: #5a5650; letter-spacing: 2px; text-transform: uppercase; margin-top: 16px !important; }

.bp-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 768px) {
  .bp-page { padding: 24px 20px 60px; }
  .bp-value-grid, .bp-why-grid, .bp-cocktail-grid { grid-template-columns: 1fr; }
  .bp-two-col { grid-template-columns: 1fr; }
  .bp-roi-grid { grid-template-columns: 1fr 1fr; }
  .bp-footer { flex-direction: column; gap: 12px; text-align: center; }
}
`;
