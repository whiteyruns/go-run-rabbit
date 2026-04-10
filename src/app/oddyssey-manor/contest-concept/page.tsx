"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function ContestConceptPage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Contest Concept</p>
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
      <style>{ccStyles}</style>
      <div className="cc-page">
        <Link href="/oddyssey-manor" className="cc-back">&larr; All Documents</Link>

        <div className="cc-top-bar no-print">
          <button className="cc-pdf-btn" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Save as PDF
          </button>
        </div>

        <div className="cc-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="cc-logo" />
          <div className="cc-label">Database Growth Concept</div>
          <h1>Contest &amp;<br />Giveaway</h1>
          <p className="cc-subtitle">Build the Email + SMS Database Before Golden Hour Launch</p>
          <div className="cc-meta">Requires AREA15 Approval</div>
          <div className="cc-print-meta print-only">Prepared by Go Run Rabbit &bull; April 2026</div>
        </div>

        {/* Strategy */}
        <div className="cc-section">
          <div className="cc-section-title">The Strategy</div>
          <div className="cc-insight">
            <p><strong>Golden Hour&rsquo;s free entry relies on emailing the existing database &mdash; but the database is small.</strong> A 30-day contest builds the email and phone list continuously, creates organic social reach through IG tagging, and drives followers to @oddysseylv. Launching alongside Golden Hour means each weekend amplifies the contest &mdash; attendees share, tag friends, and drive more entries. By the time the contest closes (5/10), the database has grown across the entire 4-week Golden Hour pilot.</p>
          </div>
        </div>

        {/* What We're Giving Away */}
        <div className="cc-section">
          <div className="cc-section-title">The Prize Package</div>
          <div className="cc-prize-grid">
            <div className="cc-prize-card cc-prize-main">
              <div className="cc-prize-tag">Grand Prize</div>
              <h3>AREA15 Experience for Two</h3>
              <ul>
                <li>Omega Mart tickets (2)</li>
                <li>Dinner + drinks at AREA15</li>
                <li>Golden Hour VIP access (skip the line, reserved section)</li>
              </ul>
            </div>
            <div className="cc-prize-card cc-prize-exclusive">
              <div className="cc-prize-tag" style={{ color: "#d4a574", borderColor: "#d4a574" }}>Exclusive</div>
              <h3>District 747 Grand Opening</h3>
              <ul>
                <li>VIP invite for two to the District 747 grand opening (date TBD)</li>
                <li>AREA15&rsquo;s 1,300-capacity immersive nightlife venue built inside a decommissioned Boeing 747 fuselage</li>
                <li>Originally a Burning Man art piece, later acquired by Tony Hsieh &mdash; now the centerpiece of AREA15 Zone 2</li>
                <li>Cocktail bar, DJ booths, projection mapping, dining &mdash; exclusive guest list only</li>
              </ul>
            </div>
          </div>
          <p className="cc-note">Prize package components require AREA15 coordination and approval. District 747 grand opening date TBD &mdash; the venue (Zone 2) is in rolling debut phase. Originally a Burning Man art piece transported to AREA15 in February 2025.</p>
        </div>

        {/* How It Works */}
        <div className="cc-section">
          <div className="cc-section-title">How It Works</div>
          <div className="cc-steps">
            {[
              { num: "01", title: "Follow @oddysseylv", desc: "Contestant must follow Oddyssey on Instagram. Verified at time of winner selection." },
              { num: "02", title: "Tag 2 friends on the contest post", desc: "Drives organic reach — each entry generates 2 new impressions from tagged friends seeing the brand. Spot-checked at winner selection." },
              { num: "03", title: "Register on the landing page", desc: "Name, email, phone, and IG handle. This is the official entry and the database capture mechanism." },
            ].map(s => (
              <div key={s.num} className="cc-step">
                <div className="cc-step-num">{s.num}</div>
                <div className="cc-step-content">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What This Builds */}
        <div className="cc-section">
          <div className="cc-section-title">What This Builds</div>
          <div className="cc-value-grid">
            {[
              { metric: "Email List", desc: "Every entry = 1 email address. This becomes the Golden Hour free-entry invite list and the foundation for all future marketing." },
              { metric: "Phone List", desc: "SMS capture enables day-of pushes: \"Golden Hour starts in 2 hours.\" Higher open rates than email for time-sensitive nightlife." },
              { metric: "IG Followers", desc: "Every entry = 1 new follower for @oddysseylv. Currently at ~4,800 — this is the fastest organic growth mechanism available." },
              { metric: "Social Reach", desc: "Every entry = 2 tagged friends who see the Oddyssey brand. 500 entries = 1,000 organic impressions from people in the contestant's network." },
            ].map(v => (
              <div key={v.metric} className="cc-value-card">
                <h4>{v.metric}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="cc-section">
          <div className="cc-section-title">Suggested Timeline</div>
          <div className="cc-timeline">
            {[
              { date: "Week of 4/7", event: "Get AREA15 approval on prize package", note: "Confirm Omega Mart tickets, dining, District 747 invite" },
              { date: "4/8–9", event: "Build landing page + contest post creative", note: "Landing page hosted, IG post designed" },
              { date: "4/10", event: "Launch contest", note: "IG post goes live, landing page opens" },
              { date: "4/10–5/10", event: "Contest runs (30 days)", note: "Weekly stories + posts driving entries, cross-promo with Golden Hour" },
              { date: "4/17", event: "Golden Hour launches (Week 1)", note: "Email blast to database — contest entries start receiving invites" },
              { date: "Weekly", event: "Golden Hour fuels contest visibility", note: "Each weekend drives more entries as attendees share + tag" },
              { date: "5/10", event: "Contest closes + winner announced", note: "Story + post, winner notified via DM. Aligns with end of Golden Hour pilot" },
            ].map((t, i) => (
              <div key={i} className="cc-timeline-row">
                <div className="cc-timeline-date">{t.date}</div>
                <div className="cc-timeline-dot" />
                <div className="cc-timeline-content">
                  <strong>{t.event}</strong>
                  <span>{t.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landing Page Mockup */}
        <div className="cc-section">
          <div className="cc-section-title">Landing Page Concept</div>
          <p className="cc-note" style={{ marginBottom: 24 }}>What the public-facing registration page would look like. Built to convert — minimal fields, clear prize, on-brand aesthetic.</p>

          <div className="cc-mockup">
            <div className="cc-mockup-inner">
              <div className="cc-mockup-overlay" />
              <div className="cc-mockup-content">
                <div className="cc-mockup-eyebrow">Win the Ultimate AREA15 Experience</div>
                <h2>Oddyssey<br />Giveaway</h2>
                <p className="cc-mockup-prize">AREA15 experience for two + VIP invite to the District 747 grand opening + Golden Hour VIP access</p>

                <div className="cc-mockup-form">
                  <div className="cc-mockup-form-row">
                    <div className="cc-mockup-input">First name</div>
                    <div className="cc-mockup-input">Last name</div>
                  </div>
                  <div className="cc-mockup-input">Email address</div>
                  <div className="cc-mockup-input">Phone number</div>
                  <div className="cc-mockup-input">Instagram handle</div>
                  <div className="cc-mockup-btn">Enter to Win</div>
                </div>

                <div className="cc-mockup-rules">
                  <p>To enter: Follow @oddysseylv on Instagram &bull; Tag 2 friends on the contest post &bull; Register above</p>
                  <p>Contest runs 4/10 &ndash; 5/10. Winner announced 5/10. Must be 21+. One entry per person.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contest Post Copy */}
        <div className="cc-section">
          <div className="cc-section-title">Contest Post Copy</div>
          <div className="cc-post">
            <div className="cc-post-header">
              <span className="cc-post-label">Instagram Feed Post</span>
              <span className="cc-post-type">Contest Announcement</span>
            </div>
            <div className="cc-post-visual">Dark, moody venue interior or art-deco graphic &bull; Text overlay: ODDYSSEY GIVEAWAY &bull; AREA15 Experience for Two</div>
            <div className="cc-post-caption">
              <div className="cc-caption-label">Caption</div>
              <p>We&rsquo;re giving away the ultimate AREA15 night. For two. 🖤</p>
              <p>The prize:<br />
              &bull; Omega Mart tickets for two<br />
              &bull; Dinner + drinks at AREA15<br />
              &bull; VIP invite to the District 747 grand opening<br />
              &bull; Golden Hour VIP at Oddyssey Noir</p>
              <p>How to enter:<br />
              1. Follow @oddysseylv<br />
              2. Tag 2 friends in the comments<br />
              3. Register at the link in bio</p>
              <p>Winner announced 5/10. You have 30 days. Don&rsquo;t wait.</p>
              <p style={{ color: "#5a5650", fontSize: 11 }}>Must be 21+. One entry per person. Link in bio.</p>
            </div>
          </div>
        </div>

        {/* Approval Items */}
        <div className="cc-section">
          <div className="cc-section-title">Requires AREA15 Approval</div>
          <div className="cc-approval-grid">
            {[
              { item: "Omega Mart tickets (2)", status: "Needs approval", note: "Could be comped or purchased at group rate" },
              { item: "Dining credit at AREA15", status: "Needs approval", note: "The Beast, Kaia, or Oddwood — TBD" },
              { item: "District 747 grand opening invite", status: "Needs approval", note: "Date TBD — may need to be issued closer to opening" },
              { item: "Golden Hour VIP access", status: "Oddyssey decision", note: "Skip-the-line + reserved section on launch weekend" },
              { item: "Landing page hosting", status: "Ready to build", note: "Can host on gorunrabbit.com or oddysseylv.com" },
              { item: "Contest rules / legal", status: "Needs review", note: "Standard giveaway terms — no purchase necessary, 21+, void where prohibited" },
            ].map(a => (
              <div key={a.item} className="cc-approval-card">
                <h4>{a.item}</h4>
                <span className={`cc-approval-status ${a.status === "Ready to build" ? "cc-status-ready" : a.status === "Oddyssey decision" ? "cc-status-oddyssey" : "cc-status-pending"}`}>{a.status}</span>
                <p>{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contest Rules */}
        <div className="cc-section">
          <div className="cc-section-title">Official Contest Rules</div>
          <div className="cc-rules">
            <div className="cc-rule-group">
              <h4>Eligibility</h4>
              <ul>
                <li>Open to legal residents of the United States, 21 years of age or older at time of entry.</li>
                <li>Employees of Oddyssey, AREA15, Go Run Rabbit, and their immediate family members are not eligible.</li>
                <li>Void where prohibited by law.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>How to Enter</h4>
              <ul>
                <li>No purchase necessary to enter or win.</li>
                <li>Follow @oddysseylv on Instagram.</li>
                <li>Tag 2 friends in the comments of the official contest post.</li>
                <li>Complete the registration form at the official contest landing page with valid name, email address, phone number, and Instagram handle.</li>
                <li>Limit one (1) entry per person. Multiple entries from the same person will be disqualified.</li>
                <li>Contest period: [Start Date] through [End Date] at 11:59 PM PT.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>Winner Selection</h4>
              <ul>
                <li>One (1) winner will be selected at random from all eligible entries.</li>
                <li>Winner will be verified for Instagram follow and tag compliance before confirmation.</li>
                <li>Winner will be notified via Instagram DM and email within 48 hours of drawing.</li>
                <li>Winner must respond within 72 hours or an alternate winner will be selected.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>Prize</h4>
              <ul>
                <li>One (1) AREA15 Experience Package for two, including: Omega Mart tickets (2), dining credit at AREA15, Golden Hour VIP access, and VIP invite to the District 747 grand opening (date TBD).</li>
                <li>Approximate retail value: $[TBD].</li>
                <li>Prize is non-transferable and may not be exchanged for cash or credit.</li>
                <li>Oddyssey reserves the right to substitute a prize of equal or greater value.</li>
                <li>Winner is responsible for any applicable taxes.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>General Conditions</h4>
              <ul>
                <li>By entering, participants agree to be bound by these Official Rules.</li>
                <li>Oddyssey and AREA15 reserve the right to cancel, modify, or suspend the contest at any time.</li>
                <li>By entering, winner consents to the use of their name, likeness, and Instagram handle for promotional purposes without additional compensation.</li>
                <li>This contest is in no way sponsored, administered by, or associated with Instagram/Meta.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="cc-section">
          <div className="cc-section-title">Data Collection &amp; Privacy</div>
          <div className="cc-insight" style={{ marginBottom: 24 }}>
            <p><strong>Transparency is critical.</strong> Entrants are sharing personal contact information. The registration form must clearly state how their data will be used, and entry constitutes consent.</p>
          </div>
          <div className="cc-rules">
            <div className="cc-rule-group">
              <h4>Data Collected</h4>
              <ul>
                <li>First name and last name</li>
                <li>Email address</li>
                <li>Phone number (mobile)</li>
                <li>Instagram handle</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>How Data Will Be Used</h4>
              <ul>
                <li>To administer the contest, select and notify the winner.</li>
                <li>To send event announcements, ticket offers, and promotional communications from Oddyssey and AREA15 via email and/or SMS.</li>
                <li>Email and SMS communications will include an unsubscribe/opt-out option in every message.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>Consent Language (on registration form)</h4>
              <ul>
                <li>&ldquo;By entering, you agree to receive email and SMS communications from Oddyssey at AREA15 regarding events, promotions, and special offers. You may unsubscribe at any time. Your information will not be sold to third parties.&rdquo;</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>Data Sharing</h4>
              <ul>
                <li>Entrant data will be shared with Oddyssey and AREA15 for marketing purposes only.</li>
                <li>Data will NOT be sold, rented, or distributed to unrelated third parties.</li>
                <li>Brand partners (El Bandido, Telson, KU) will NOT receive entrant contact information unless the entrant separately opts in.</li>
              </ul>
            </div>
            <div className="cc-rule-group">
              <h4>Compliance</h4>
              <ul>
                <li>All email communications will comply with CAN-SPAM Act requirements.</li>
                <li>All SMS communications will comply with TCPA regulations and include opt-out instructions.</li>
                <li>Data will be stored securely and retained only as long as necessary for marketing purposes.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="cc-footer">
          <Link href="/oddyssey-manor" className="cc-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const ccStyles = `
.cc-page { max-width: 960px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.cc-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.cc-back:hover { color: #c9a84c; }

.cc-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.cc-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.cc-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 16px; }
.cc-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px,6vw,56px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; line-height: 1.1; }
.cc-subtitle { font-size: 14px; letter-spacing: 2px; color: #9a958d; margin-bottom: 12px; }
.cc-meta { font-size: 11px; color: #c0392b; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }

.cc-section { margin-bottom: 56px; }
.cc-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-note { font-size: 11px; color: #5a5650; font-style: italic; line-height: 1.6; }

.cc-insight { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); border-left: 3px solid #c9a84c; padding: 24px 28px; }
.cc-insight p { font-size: 14px; color: #9a958d; line-height: 1.7; }
.cc-insight strong { color: #e8e4dd; font-weight: 500; }

/* Prize */
.cc-prize-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.cc-prize-card { background: #060606; padding: 28px; }
.cc-prize-tag { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9a84c; border: 1px solid rgba(201,168,76,0.3); padding: 4px 12px; display: inline-block; margin-bottom: 16px; font-weight: 500; }
.cc-prize-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; letter-spacing: 1px; margin-bottom: 16px; }
.cc-prize-card ul { list-style: none; }
.cc-prize-card li { font-size: 13px; color: #9a958d; padding: 6px 0 6px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; }
.cc-prize-card li::before { content: ''; position: absolute; left: 0; top: 13px; width: 4px; height: 4px; border: 1px solid #c9a84c; transform: rotate(45deg); }
.cc-prize-card li:last-child { border-bottom: none; }

/* Steps */
.cc-steps { display: flex; flex-direction: column; gap: 0; }
.cc-step { display: flex; gap: 20px; padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-step:first-child { padding-top: 0; }
.cc-step-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: rgba(201,168,76,0.3); min-width: 40px; line-height: 1; }
.cc-step-content h4 { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.cc-step-content p { font-size: 13px; color: #9a958d; }

/* Value */
.cc-value-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.cc-value-card { background: #060606; padding: 24px; position: relative; }
.cc-value-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #c9a84c; }
.cc-value-card h4 { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 8px; }
.cc-value-card p { font-size: 12px; color: #9a958d; line-height: 1.6; }

/* Timeline */
.cc-timeline { display: flex; flex-direction: column; }
.cc-timeline-row { display: grid; grid-template-columns: 110px 20px 1fr; gap: 12px; align-items: start; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-timeline-date { font-size: 11px; font-weight: 500; letter-spacing: 1.5px; color: #d4a574; text-align: right; padding-top: 2px; }
.cc-timeline-dot { width: 8px; height: 8px; border: 1px solid #d4a574; transform: rotate(45deg); margin-top: 5px; justify-self: center; }
.cc-timeline-content { font-size: 13px; color: #9a958d; }
.cc-timeline-content strong { display: block; color: #e8e4dd; font-weight: 400; margin-bottom: 2px; }

/* Landing Page Mockup */
.cc-mockup { position: relative; overflow: hidden; }
.cc-mockup-inner { background: linear-gradient(180deg, #0c0906, #080608); padding: 48px; position: relative; border: 1px solid rgba(255,255,255,0.06); }
.cc-mockup-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 70%, rgba(201,168,76,0.04) 0%, transparent 60%); pointer-events: none; }
.cc-mockup-content { position: relative; z-index: 2; max-width: 480px; margin: 0 auto; text-align: center; }
.cc-mockup-eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #5a5650; margin-bottom: 20px; }
.cc-mockup-content h2 { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; line-height: 1.1; margin-bottom: 16px; }
.cc-mockup-prize { font-size: 12px; color: #9a958d; line-height: 1.6; margin-bottom: 32px; }
.cc-mockup-form { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; }
.cc-mockup-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.cc-mockup-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px 16px; font-size: 12px; color: #5a5650; }
.cc-mockup-btn { background: #c9a84c; color: #060606; padding: 14px; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; text-align: center; }
.cc-mockup-rules { font-size: 10px; color: #5a5650; line-height: 1.6; }
.cc-mockup-rules p { margin-bottom: 4px; }

/* Contest Post */
.cc-post { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); }
.cc-post-header { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-post-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; font-weight: 500; }
.cc-post-type { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; }
.cc-post-visual { padding: 16px 20px; font-size: 12px; color: #5a5650; font-style: italic; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-post-caption { padding: 20px; }
.cc-caption-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; font-weight: 500; margin-bottom: 12px; }
.cc-post-caption p { font-size: 13px; color: #9a958d; margin-bottom: 12px; line-height: 1.6; }

/* Approval */
.cc-approval-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.cc-approval-card { background: #060606; padding: 20px; }
.cc-approval-card h4 { font-size: 13px; font-weight: 400; margin-bottom: 6px; }
.cc-approval-status { display: inline-block; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; font-weight: 500; margin-bottom: 8px; }
.cc-status-pending { color: #f39c12; border: 1px solid rgba(243,156,18,0.3); }
.cc-status-oddyssey { color: #3498db; border: 1px solid rgba(52,152,219,0.3); }
.cc-status-ready { color: #27ae60; border: 1px solid rgba(39,174,96,0.3); }
.cc-approval-card p { font-size: 11px; color: #5a5650; }

/* Rules */
.cc-rules { display: flex; flex-direction: column; gap: 0; }
.cc-rule-group { padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cc-rule-group:last-child { border-bottom: none; }
.cc-rule-group h4 { font-size: 12px; font-weight: 500; letter-spacing: 1px; margin-bottom: 12px; color: #e8e4dd; }
.cc-rule-group ul { list-style: none; }
.cc-rule-group li { font-size: 12px; color: #9a958d; padding: 5px 0 5px 16px; position: relative; line-height: 1.6; }
.cc-rule-group li::before { content: ''; position: absolute; left: 0; top: 11px; width: 4px; height: 4px; border: 1px solid rgba(201,168,76,0.4); transform: rotate(45deg); }

/* PDF Button */
.cc-top-bar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.cc-pdf-btn {
  display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; color: #9a958d; background: transparent;
  border: 1px solid rgba(255,255,255,0.06); padding: 10px 20px;
  cursor: pointer; transition: all 0.3s; font-family: inherit; font-weight: 500;
}
.cc-pdf-btn:hover { color: #c9a84c; border-color: rgba(201,168,76,0.3); }
.print-only { display: none; }
.cc-print-meta { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; margin-top: 12px; }

.cc-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .cc-page { padding: 24px 20px 60px; }
  .cc-prize-grid, .cc-value-grid, .cc-approval-grid { grid-template-columns: 1fr; }
  .cc-timeline-row { grid-template-columns: 80px 16px 1fr; }
  .cc-mockup-form-row { grid-template-columns: 1fr; }
  .cc-footer { flex-direction: column; gap: 12px; text-align: center; }
}

@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { background: #fff !important; color: #111 !important; }
  .cc-page { padding: 0; max-width: none; }

  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .cc-back { display: none !important; }
  .cc-footer { display: none !important; }

  .cc-header { padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid #ddd; }
  .cc-logo { filter: invert(1); height: 36px; }
  .cc-label { color: #333; }
  .cc-header h1 { color: #111; font-size: 36px; }
  .cc-subtitle { color: #555; }
  .cc-meta { color: #c0392b; }
  .cc-print-meta { color: #888; }

  .cc-section { margin-bottom: 28px; page-break-inside: avoid; }
  .cc-section-title { color: #333; font-size: 18px; border-bottom: 1px solid #ddd; margin-bottom: 16px; padding-bottom: 8px; }

  .cc-insight { background: #f8f8f8 !important; border: 1px solid #ddd; border-left: 3px solid #333; }
  .cc-insight p { color: #333; font-size: 12px; }
  .cc-insight strong { color: #111; }

  .cc-prize-grid, .cc-value-grid, .cc-approval-grid { background: #ddd; }
  .cc-prize-card, .cc-value-card, .cc-approval-card { background: #fff !important; }
  .cc-prize-tag { color: #333 !important; border-color: #999 !important; }
  .cc-prize-card h3 { color: #111; }
  .cc-prize-card li { color: #333; border-color: #eee; }
  .cc-prize-card li::before { border-color: #999; }
  .cc-note { color: #888; }

  .cc-step-num { color: #ccc; }
  .cc-step-content h4 { color: #111; }
  .cc-step-content p { color: #555; }
  .cc-step { border-color: #eee; }

  .cc-value-card::before { background: #333; }
  .cc-value-card h4 { color: #333; }
  .cc-value-card p { color: #555; }

  .cc-timeline-date { color: #333; }
  .cc-timeline-dot { border-color: #999; }
  .cc-timeline-content { color: #555; }
  .cc-timeline-content strong { color: #111; }
  .cc-timeline-row { border-color: #eee; }

  .cc-mockup { page-break-inside: avoid; }
  .cc-mockup-inner { background: #f5f5f5 !important; border: 1px solid #ddd; }
  .cc-mockup-overlay { display: none; }
  .cc-mockup-eyebrow { color: #888; }
  .cc-mockup-content h2 { color: #111; font-size: 32px; }
  .cc-mockup-prize { color: #555; }
  .cc-mockup-input { background: #fff !important; border: 1px solid #ccc !important; color: #888; }
  .cc-mockup-btn { background: #333 !important; color: #fff !important; }
  .cc-mockup-rules { color: #888; }

  .cc-post { background: #f8f8f8 !important; border: 1px solid #ddd; }
  .cc-post-header { border-color: #ddd; }
  .cc-post-label { color: #333; }
  .cc-post-type { color: #888; }
  .cc-post-visual { color: #888; border-color: #ddd; }
  .cc-post-caption p { color: #333; }
  .cc-caption-label { color: #888; }

  .cc-approval-status { font-size: 8px; }
  .cc-status-pending { color: #c0392b !important; border-color: #c0392b !important; }
  .cc-status-oddyssey { color: #2980b9 !important; border-color: #2980b9 !important; }
  .cc-status-ready { color: #27ae60 !important; border-color: #27ae60 !important; }
  .cc-approval-card h4 { color: #111; }
  .cc-approval-card p { color: #666; }

  .cc-rule-group { page-break-inside: avoid; border-color: #eee; }
  .cc-rule-group h4 { color: #111; }
  .cc-rule-group li { color: #333; }
  .cc-rule-group li::before { border-color: #999; }
}
`;
