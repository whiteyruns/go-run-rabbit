"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function GoldenHourKitPage() {
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
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Marketing Asset Kit</p>
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
      <style>{kitStyles}</style>
      <div className="kit-page">
        <Link href="/oddyssey-manor" className="kit-back">&larr; All Documents</Link>

        <div className="kit-top-bar no-print">
          <button className="kit-pdf-btn" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Save as PDF
          </button>
        </div>

        <div className="kit-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="kit-logo" />
          <div className="kit-presents">Golden Hour</div>
          <h1>Marketing Asset Kit</h1>
          <p className="kit-subtitle">Social Media &bull; Email &bull; Ticket Page &bull; Content Calendar</p>
          <div className="kit-meta">Launch Weekend: April 17&ndash;18, 2026</div>
        </div>

        {/* Instagram Posts */}
        <div className="kit-section">
          <div className="kit-section-title">Instagram Feed Posts</div>

          {[
            {
              num: "Post 1", type: "Launch Announcement",
              visual: "Dark, moody shot \u2022 Tequila cocktail + champagne glass \u2022 Text overlay: GOLDEN HOUR / OPEN BAR / 10 PM\u2013Midnight",
              caption: `Something new starts this Friday. 🖤

Golden Hour at Oddyssey Noir. Doors at 10. Open bar till midnight.

Tequila cocktails. Champagne. While supplies last. Received our invite? You're in free.

Then Liquid Gold takes over at midnight. You already know.

Every Friday & Saturday | AREA15, Oddyssey | Link in bio`,
            },
            {
              num: "Post 2", type: "The Menu",
              visual: "Carousel: cocktail close-ups + champagne pour + caviar bump \u2022 Dark, atmospheric",
              caption: `The Golden Hour menu. 🖤

Friday — @elbandidotequila Reposado cocktails at both bars. Champagne in the Red Room.

Saturday — @telsontequila cocktails at both bars. Champagne in the Red Room. $10 caviar bumps at the champagne station.

Open bar 10 PM – Midnight. While supplies last. All other drinks at regular price.

Save this. You'll want it Friday.`,
            },
            {
              num: "Post 3", type: "Saturday Replay",
              visual: "Friday night recap footage \u2022 Crowd, cocktails, Red Room champagne, performers",
              caption: `Friday's Golden Hour went fast. 🖤

Saturday's your second chance. Open bar. Champagne. Caviar bumps. 10 PM – Midnight.

Got the invite? You're in free. Then Art in Motion takes over at midnight.

Doors at 10. Don't be late this time.

Every Friday & Saturday | AREA15, Oddyssey | Link in bio`,
            },
          ].map((post) => (
            <CopyablePost key={post.num} num={post.num} type={post.type} visual={post.visual} caption={post.caption} />
          ))}
        </div>

        {/* Creative Mockups */}
        <div className="kit-section">
          <div className="kit-section-title">Creative Mockups</div>
          <p className="kit-note">Visual direction for social assets. Screenshot or use as creative brief for design team.</p>

          <div className="mock-grid">
            {/* Golden Hour Main Promo */}
            <div className="mock-card mock-golden-hour">
              <div className="mock-overlay" />
              <div className="mock-content">
                <div className="mock-area15">AREA15 / DISTRICT</div>
                <svg className="mock-starburst" viewBox="0 0 60 60" width="40" height="40">
                  <line x1="30" y1="0" x2="30" y2="60" stroke="#d4a574" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="0" y1="30" x2="60" y2="30" stroke="#d4a574" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="8" y1="8" x2="52" y2="52" stroke="#d4a574" strokeWidth="0.5" opacity="0.3"/>
                  <line x1="52" y1="8" x2="8" y2="52" stroke="#d4a574" strokeWidth="0.5" opacity="0.3"/>
                  <circle cx="30" cy="30" r="4" stroke="#d4a574" strokeWidth="0.5" fill="none" opacity="0.5"/>
                </svg>
                <div className="mock-gh-title">GOLDEN<br />HOUR</div>
                <div className="mock-gh-sub">OPEN BAR</div>
                <div className="mock-gh-time">10 PM &ndash; MIDNIGHT</div>
                <div className="mock-gh-detail">
                  <span>Tequila &bull; Champagne &bull; Caviar</span>
                </div>
                <div className="mock-gh-rsvp">EVERY FRIDAY &amp; SATURDAY</div>
                <div className="mock-gh-nights">
                  <span>Fridays: Liquid Gold <svg className="mock-icon" viewBox="0 0 16 16" width="10" height="10"><path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2Z" fill="#d4a574"/></svg></span>
                  <span>Saturdays: Art in Motion <svg className="mock-icon" viewBox="0 0 12 12" width="8" height="8"><rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" stroke="#9a958d" strokeWidth="1" fill="none"/></svg></span>
                </div>
                <div className="mock-gh-cta">while supplies last</div>
              </div>
            </div>

            {/* Liquid Gold Friday */}
            <div className="mock-card mock-liquid-gold">
              <div className="mock-overlay" />
              <div className="mock-content">
                <div className="mock-tag-friday">FRIDAY 04.17</div>
                <svg className="mock-deco-diamond" viewBox="0 0 40 40" width="24" height="24">
                  <rect x="8" y="8" width="24" height="24" transform="rotate(45 20 20)" stroke="#d4a574" strokeWidth="0.5" fill="none" opacity="0.5"/>
                  <rect x="13" y="13" width="14" height="14" transform="rotate(45 20 20)" stroke="#d4a574" strokeWidth="0.5" fill="none" opacity="0.3"/>
                  <line x1="20" y1="4" x2="20" y2="36" stroke="#d4a574" strokeWidth="0.3" opacity="0.2"/>
                  <line x1="4" y1="20" x2="36" y2="20" stroke="#d4a574" strokeWidth="0.3" opacity="0.2"/>
                </svg>
                <div className="mock-lg-title">LIQUID<br />GOLD</div>
                <div className="mock-lg-dj">BERRI</div>
                <div className="mock-lg-genre">House &bull; Electronic</div>
                <div className="mock-lg-golden">
                  Golden Hour 10 PM &ndash; Midnight<br />
                  <span>Open Bar &bull; 10 PM &ndash; Midnight</span>
                </div>
                <div className="mock-lg-venue">AREA15 &bull; Oddyssey</div>
              </div>
            </div>

            {/* Art in Motion Saturday */}
            <div className="mock-card mock-art-in-motion">
              <div className="mock-overlay" />
              <div className="mock-content">
                <div className="mock-tag-saturday">SATURDAY 04.18</div>
                <svg className="mock-deco-arch" viewBox="0 0 60 30" width="48" height="24">
                  <path d="M0 30 Q30 -5 60 30" stroke="#9a958d" strokeWidth="0.5" fill="none" opacity="0.4"/>
                  <path d="M8 30 Q30 2 52 30" stroke="#9a958d" strokeWidth="0.5" fill="none" opacity="0.25"/>
                  <line x1="30" y1="0" x2="30" y2="30" stroke="#9a958d" strokeWidth="0.3" opacity="0.15"/>
                </svg>
                <div className="mock-aim-title">ART IN<br />MOTION</div>
                <div className="mock-aim-dj">HECTOR ROMERO</div>
                <div className="mock-aim-genre">Multi-genre &bull; Immersive</div>
                <div className="mock-aim-golden">
                  Golden Hour 10 PM &ndash; Midnight<br />
                  <span>Open Bar &bull; Champagne &bull; Caviar</span>
                </div>
                <div className="mock-aim-venue">AREA15 &bull; Oddyssey</div>
              </div>
            </div>

            {/* Weekend Lineup */}
            <div className="mock-card mock-weekend">
              <div className="mock-overlay" />
              <div className="mock-content">
                <div className="mock-wk-header">THIS WEEKEND</div>
                <div className="mock-wk-golden">GOLDEN HOUR &bull; OPEN BAR &bull; 10 PM</div>
                <div className="mock-wk-split">
                  <div className="mock-wk-night mock-wk-fri">
                    <div className="mock-wk-day">FRIDAY</div>
                    <div className="mock-wk-name">Liquid Gold <svg className="mock-icon" viewBox="0 0 16 16" width="10" height="10"><path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2Z" fill="#d4a574"/></svg></div>
                    <div className="mock-wk-dj">BERRI</div>
                    <div className="mock-wk-desc">House &bull; Electronic</div>
                  </div>
                  <div className="mock-wk-divider" />
                  <div className="mock-wk-night mock-wk-sat">
                    <div className="mock-wk-day">SATURDAY</div>
                    <div className="mock-wk-name">Art in Motion <svg className="mock-icon" viewBox="0 0 12 12" width="8" height="8"><rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" stroke="#9a958d" strokeWidth="1" fill="none"/></svg></div>
                    <div className="mock-wk-dj">HECTOR ROMERO</div>
                    <div className="mock-wk-desc">Multi-genre &bull; Immersive</div>
                  </div>
                </div>
                <div className="mock-wk-footer">
                  Open Bar &bull; While Supplies Last<br />
                  <span>AREA15 &bull; Oddyssey &bull; 10 PM &bull; 21+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Sequence */}
        <div className="kit-section">
          <div className="kit-section-title">Instagram / TikTok Story Sequence</div>
          <p className="kit-note">5-story sequence to run day-of (Friday and Saturday)</p>
          <div className="kit-story-grid">
            {[
              { slide: "1", visual: "Black screen, slow text reveal", text: "Tonight. 🖤" },
              { slide: "2", visual: "Cocktail pour + champagne, slow-mo", text: "Golden Hour. Open bar. 10 PM." },
              { slide: "3", visual: "Bartender lining up glasses, champagne station", text: "Tequila cocktails. Champagne. While supplies last." },
              { slide: "4", visual: "Venue interior, performers, crowd", text: "Then Liquid Gold / Art in Motion takes over at midnight." },
              { slide: "5", visual: "Swipe up / link sticker", text: "Oddyssey at AREA15. 10 PM. Link in bio." },
            ].map(s => (
              <div key={s.slide} className="kit-story-card">
                <div className="kit-story-num">{s.slide}</div>
                <div className="kit-story-visual">{s.visual}</div>
                <div className="kit-story-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Blast */}
        <div className="kit-section">
          <div className="kit-section-title">Email Blast</div>
          <div className="kit-email">
            <div className="kit-email-subjects">
              <div className="kit-caption-label">Subject Line Options (A/B Test)</div>
              <p>A: We just opened the bar.</p>
              <p>B: This email is your ticket. Free entry this Friday.</p>
              <p>C: Golden Hour starts at 10. You&rsquo;re in free.</p>
              <p style={{ color: "#5a5650", fontSize: 11, marginTop: 8 }}>Preview: Open bar 10 PM &ndash; Midnight. Tequila cocktails, champagne, while supplies last.</p>
            </div>
            <CopyableBlock label="Email Body" text={`GOLDEN HOUR
Open Bar at Oddyssey Noir

This email is your invite. You're in free. 🖤

This Friday and Saturday, Golden Hour kicks off at 10 PM. Open bar till midnight — tequila cocktails at both bars, champagne in the Red Room. While supplies last.

Friday: El Bandido Reposado cocktails + KU Champagne
Saturday: Telson cocktails + KU Champagne + $10 caviar bumps

The bar runs dry when it runs dry. No extensions. After midnight, the night evolves — Liquid Gold on Fridays, Art in Motion on Saturdays. Two dance floors. Performers in the crowd. DJs through close.

Show up early. You don't want to miss this one.

Doors: 10 PM | Golden Hour: 10 PM – Midnight | Oddyssey at AREA15 | 21+ only`}>
            <div className="kit-email-body" style={{ padding: 0 }}>
              <h3 style={{ color: "#d4a574", fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>GOLDEN HOUR</h3>
              <p style={{ color: "#5a5650", fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>Open Bar at Oddyssey Noir</p>
              <p>This email is your invite. You&rsquo;re in free. 🖤</p>
              <p>This Friday and Saturday, Golden Hour kicks off at 10 PM. Open bar till midnight &mdash; tequila cocktails at both bars, champagne in the Red Room. While supplies last.</p>
              <p><strong style={{ color: "#d4a574" }}>Friday:</strong> El Bandido Reposado cocktails + KU Champagne<br /><strong>Saturday:</strong> Telson cocktails + KU Champagne + $10 caviar bumps</p>
              <p>The bar runs dry when it runs dry. No extensions. After midnight, the night evolves &mdash; Liquid Gold on Fridays, Art in Motion on Saturdays. Two dance floors. Performers in the crowd. DJs through close.</p>
              <p>Show up early. You don&rsquo;t want to miss this one.</p>
              <div style={{ background: "#0d0d0d", padding: 20, marginTop: 16, fontSize: 12, color: "#9a958d" }}>
                Doors: 10 PM<br />Golden Hour: 10 PM &ndash; Midnight<br />Oddyssey at AREA15<br />21+ only | Link below
              </div>
            </div>
            </CopyableBlock>
          </div>
        </div>

        {/* Ticket Page */}
        <div className="kit-section">
          <div className="kit-section-title">Ticket Page Copy</div>
          <CopyableBlock label="Ticket Page Copy" text={`Golden Hour + Liquid Gold (Fri) / Art in Motion (Sat)
Open Bar · Tequila Cocktails · Champagne · While Supplies Last

The night starts with Golden Hour — open bar from 10 PM to midnight. Tequila cocktails at both bars, champagne in the Red Room. While supplies last. First come, first served.

Friday: El Bandido Reposado cocktails + KU Champagne
Saturday: Telson cocktails + KU Champagne + $10 caviar bumps

All other drinks at regular price. Bars return to paid at midnight.

After midnight, the night keeps going. Liquid Gold on Fridays. Art in Motion on Saturdays. Two dance floors, performers in the crowd, DJs through close. Your ticket gets you both — Golden Hour and the full Noir experience.

Doors: 10 PM · Golden Hour: 10 PM – Midnight · Oddyssey at AREA15 · 21+ only`}>
          <div className="kit-ticket">
            <div className="kit-caption-label" style={{ marginBottom: 8 }}>Event Title</div>
            <p><strong>Golden Hour + Liquid Gold (Fri) / Art in Motion (Sat)</strong></p>
            <p style={{ color: "#5a5650", marginBottom: 16 }}>Open Bar &bull; Tequila Cocktails &bull; Champagne &bull; While Supplies Last</p>
            <div className="kit-caption-label">Description</div>
            <p>The night starts with Golden Hour &mdash; open bar from 10 PM to midnight. Tequila cocktails at both bars, champagne in the Red Room. While supplies last.</p>
            <p><strong style={{ color: "#d4a574" }}>Friday:</strong> El Bandido Reposado cocktails + KU Champagne<br /><strong>Saturday:</strong> Telson cocktails + KU Champagne + $10 caviar bumps</p>
            <p>All other drinks at regular price. Bars return to paid at midnight.</p>
            <p>After midnight, the night keeps going. Liquid Gold on Fridays. Art in Motion on Saturdays. Two dance floors, performers in the crowd, DJs through close.</p>
            <div style={{ background: "#0d0d0d", padding: 16, marginTop: 12, fontSize: 12, color: "#9a958d" }}>
              Doors: 10 PM &bull; Golden Hour: 10 PM &ndash; Midnight &bull; Oddyssey at AREA15 &bull; 21+ only
            </div>
          </div>
          </CopyableBlock>
        </div>

        {/* TikTok */}
        <div className="kit-section">
          <div className="kit-section-title">TikTok Video Concepts</div>
          <div className="kit-tiktok-grid">
            {[
              { title: "Announcement", format: "15–30 sec", hook: "Free entry and free drinks every Friday in Vegas and nobody's talking about it yet", visual: "Quick cuts: cocktail pour, venue lighting, bartender shake, crowd arriving. End card: Golden Hour / 10 PM / Oddyssey / Link in bio" },
              { title: "Day-Of Hype", format: "10–15 sec", hook: "Golden Hour starts in 6 hours. Open bar till midnight. Don't be late.", visual: "Fast cuts: glasses lining up, bottles on display, ice hitting glass, doors about to open" },
              { title: "Recap + FOMO", format: "15–30 sec", hook: "The bar ran dry in [XX] minutes last night", visual: "Friday crowd montage, cocktail close-ups, energy. Hard cut to black: 'Saturday. Same deal. Don't sleep.'" },
            ].map(v => (
              <div key={v.title} className="kit-tiktok-card">
                <div className="kit-tiktok-title">{v.title}</div>
                <div className="kit-tiktok-format">{v.format}</div>
                <div className="kit-caption-label" style={{ marginTop: 12 }}>Hook</div>
                <p style={{ fontStyle: "italic" }}>&ldquo;{v.hook}&rdquo;</p>
                <div className="kit-caption-label" style={{ marginTop: 8 }}>Visual</div>
                <p>{v.visual}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Calendar */}
        <div className="kit-section">
          <div className="kit-section-title">Week 1 Content Calendar</div>
          <div className="kit-table-wrap">
            <table className="kit-table">
              <thead><tr><th>Day</th><th>Platform</th><th>Content</th></tr></thead>
              <tbody>
                <tr><td>Mon 4/14</td><td>Email</td><td>Blast #1: Golden Hour x Liquid Gold launch (A/B test)</td></tr>
                <tr><td>Tue 4/15</td><td>IG + TikTok</td><td>Post 1: Launch announcement + TikTok Video 1</td></tr>
                <tr><td>Wed 4/16</td><td>IG Feed</td><td>Post 2: Cocktail carousel (3 drinks)</td></tr>
                <tr><td>Thu 4/17</td><td>IG Stories + TikTok</td><td>Day-of hype: 5-story sequence + Video 2</td></tr>
                <tr><td>Fri 4/17</td><td>IG Stories (live)</td><td>Real-time stories from event</td></tr>
                <tr><td>Sat 4/18</td><td>IG Feed + Stories</td><td>Post 3: Saturday FOMO + day-of sequence</td></tr>
                <tr><td>Sun 4/19</td><td>IG + TikTok</td><td>Weekend recap / Video 3 — tease next week</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="kit-footer">
          <Link href="/oddyssey-manor" className="kit-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

function CopyablePost({ num, type, visual, caption }: { num: string; type: string; visual: string; caption: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [caption]);

  return (
    <div className="kit-post">
      <div className="kit-post-header">
        <span className="kit-post-num">{num}</span>
        <span className="kit-post-type">{type}</span>
      </div>
      <div className="kit-post-visual">{visual}</div>
      <div className="kit-post-caption">
        <div className="kit-caption-header">
          <span className="kit-caption-label">Caption</span>
          <button className={`kit-copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Caption"}
          </button>
        </div>
        {caption.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}

function CopyableBlock({ label, text, children }: { label: string; text: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div style={{ position: "relative" }}>
      <div className="kit-caption-header">
        <span className="kit-caption-label">{label}</span>
        <button className={`kit-copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {children}
    </div>
  );
}

const kitStyles = `
.kit-page { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.kit-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.kit-back:hover { color: #c9a84c; }

.kit-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.kit-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.kit-presents { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #d4a574; margin-bottom: 16px; font-weight: 500; }
.kit-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px,5vw,52px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.kit-subtitle { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #9a958d; margin-bottom: 12px; }
.kit-meta { font-size: 12px; color: #5a5650; letter-spacing: 1px; }

.kit-section { margin-bottom: 56px; }
.kit-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.kit-note { font-size: 12px; color: #5a5650; font-style: italic; margin-bottom: 20px; }

.kit-post { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
.kit-post-header { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.kit-post-num { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; font-weight: 500; }
.kit-post-type { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; }
.kit-post-visual { padding: 16px 20px; font-size: 12px; color: #5a5650; font-style: italic; border-bottom: 1px solid rgba(255,255,255,0.06); }
.kit-post-caption { padding: 20px; }
.kit-caption-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kit-caption-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; font-weight: 500; margin-bottom: 0; }
.kit-copy-btn {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c;
  background: transparent; border: 1px solid rgba(201,168,76,0.2); padding: 6px 14px;
  cursor: pointer; transition: all 0.3s; font-family: inherit; font-weight: 500;
}
.kit-copy-btn:hover { border-color: #c9a84c; background: rgba(201,168,76,0.08); }
.kit-copy-btn.copied { color: #27ae60; border-color: rgba(39,174,96,0.3); }
.kit-post-caption p { font-size: 13px; color: #9a958d; margin-bottom: 10px; }

.kit-story-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.kit-story-card { background: #060606; padding: 20px; text-align: center; }
.kit-story-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #d4a574; margin-bottom: 8px; }
.kit-story-visual { font-size: 11px; color: #5a5650; margin-bottom: 12px; font-style: italic; }
.kit-story-text { font-size: 11px; color: #9a958d; line-height: 1.5; }

.kit-email { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.kit-email > div { background: #060606; padding: 24px; }
.kit-email p { font-size: 13px; color: #9a958d; margin-bottom: 10px; }

.kit-ticket { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 24px; }
.kit-ticket p { font-size: 13px; color: #9a958d; margin-bottom: 10px; }
.kit-ticket strong { color: #e8e4dd; font-weight: 500; }

.kit-tiktok-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.kit-tiktok-card { background: #060606; padding: 24px; }
.kit-tiktok-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; letter-spacing: 1px; margin-bottom: 4px; }
.kit-tiktok-format { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; }
.kit-tiktok-card p { font-size: 12px; color: #9a958d; line-height: 1.5; }

.kit-table-wrap { overflow-x: auto; }
.kit-table { width: 100%; border-collapse: collapse; }
.kit-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.kit-table td { padding: 14px 16px; font-size: 13px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.06); }

/* ═══ CREATIVE MOCKUPS ═══ */
.mock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.mock-card {
  min-height: 420px; position: relative; overflow: hidden; display: flex;
  align-items: center; justify-content: center;
}
.mock-overlay { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.mock-content {
  position: relative; z-index: 2; text-align: center; padding: 32px;
  width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

/* Golden Hour Main */
.mock-golden-hour {
  background: linear-gradient(160deg, #0c0906 0%, #1a140a 40%, #0d0808 100%);
}
.mock-golden-hour .mock-overlay {
  background:
    radial-gradient(ellipse at 50% 70%, rgba(212,165,116,0.08) 0%, transparent 60%);
  border: 1px solid rgba(212,165,116,0.1);
}
.mock-golden-hour .mock-overlay::before {
  content: ''; position: absolute; inset: 12px;
  border: 1px solid rgba(212,165,116,0.08);
}
.mock-liquid-gold .mock-overlay {
  border: 1px solid rgba(212,165,116,0.1);
  background: radial-gradient(ellipse at 50% 60%, rgba(212,165,116,0.06) 0%, transparent 60%);
}
.mock-liquid-gold .mock-overlay::before {
  content: ''; position: absolute; inset: 12px;
  border: 1px solid rgba(212,165,116,0.06);
}
.mock-art-in-motion .mock-overlay {
  border: 1px solid rgba(154,149,141,0.08);
  background: radial-gradient(ellipse at 50% 60%, rgba(154,149,141,0.04) 0%, transparent 60%);
}
.mock-art-in-motion .mock-overlay::before {
  content: ''; position: absolute; inset: 12px;
  border: 1px solid rgba(154,149,141,0.06);
}
.mock-weekend .mock-overlay {
  border: 1px solid rgba(201,168,76,0.06);
  background: radial-gradient(ellipse at 50% 80%, rgba(201,168,76,0.03) 0%, transparent 50%);
}
.mock-icon { display: inline-block; vertical-align: middle; margin-left: 4px; }
.mock-starburst { margin-bottom: 16px; }
.mock-deco-diamond { margin: 12px 0; }
.mock-deco-arch { margin: 12px 0; }
.mock-area15 { font-size: 9px; letter-spacing: 4px; color: #5a5650; margin-bottom: 16px; }
.mock-gh-title {
  font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 300;
  letter-spacing: 6px; line-height: 1; color: #d4a574; margin-bottom: 12px;
}
.mock-gh-sub { font-size: 11px; letter-spacing: 5px; color: #e8e4dd; margin-bottom: 4px; }
.mock-gh-time { font-size: 13px; letter-spacing: 3px; color: #9a958d; margin-bottom: 20px; }
.mock-gh-detail { font-size: 11px; color: #9a958d; line-height: 1.8; margin-bottom: 20px; }
.mock-gh-detail span { color: #d4a574; font-size: 10px; letter-spacing: 2px; }
.mock-gh-rsvp {
  font-size: 10px; letter-spacing: 3px; color: #0c0906; background: #d4a574;
  padding: 10px 28px; margin-bottom: 20px;
}
.mock-gh-nights { font-size: 10px; letter-spacing: 1.5px; color: #5a5650; margin-bottom: 8px; }
.mock-gh-nights span { display: block; margin: 4px 0; }
.mock-gh-cta { font-size: 9px; letter-spacing: 3px; color: #5a5650; text-transform: uppercase; }

/* Liquid Gold Friday */
.mock-liquid-gold {
  background: linear-gradient(160deg, #0c0906 0%, #14100a 40%, #0a0808 100%);
}
.mock-tag-friday { font-size: 10px; letter-spacing: 4px; color: #d4a574; margin-bottom: 20px; }
.mock-lg-title {
  font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300;
  letter-spacing: 5px; line-height: 1.05; color: #e8e4dd; margin-bottom: 16px;
}
.mock-lg-dj { font-size: 20px; letter-spacing: 4px; color: #d4a574; margin-bottom: 6px; }
.mock-lg-genre { font-size: 11px; letter-spacing: 2px; color: #5a5650; margin-bottom: 24px; }
.mock-lg-golden {
  font-size: 10px; letter-spacing: 2px; color: #9a958d; line-height: 1.8;
  padding: 12px 0; border-top: 1px solid rgba(212,165,116,0.15); border-bottom: 1px solid rgba(212,165,116,0.15);
  margin-bottom: 16px;
}
.mock-lg-golden span { color: #d4a574; }
.mock-lg-venue { font-size: 9px; letter-spacing: 3px; color: #5a5650; }

/* Art in Motion Saturday */
.mock-art-in-motion {
  background: linear-gradient(160deg, #080608 0%, #0c0a0e 40%, #080808 100%);
}
.mock-tag-saturday { font-size: 10px; letter-spacing: 4px; color: #9a958d; margin-bottom: 20px; }
.mock-aim-title {
  font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300;
  letter-spacing: 5px; line-height: 1.05; color: #e8e4dd; margin-bottom: 16px;
}
.mock-aim-dj { font-size: 20px; letter-spacing: 4px; color: #e8e4dd; margin-bottom: 6px; }
.mock-aim-genre { font-size: 11px; letter-spacing: 2px; color: #5a5650; margin-bottom: 24px; }
.mock-aim-golden {
  font-size: 10px; letter-spacing: 2px; color: #9a958d; line-height: 1.8;
  padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 16px;
}
.mock-aim-golden span { color: #c9a84c; }
.mock-aim-venue { font-size: 9px; letter-spacing: 3px; color: #5a5650; }

/* Weekend Lineup */
.mock-weekend {
  background: linear-gradient(180deg, #080608 0%, #0c0a08 50%, #080608 100%);
  grid-column: 1 / -1; min-height: 360px;
}
.mock-weekend .mock-overlay {
  background: radial-gradient(ellipse at 50% 80%, rgba(201,168,76,0.04) 0%, transparent 60%);
}
.mock-wk-header {
  font-size: 12px; letter-spacing: 6px; color: #e8e4dd; margin-bottom: 8px;
}
.mock-wk-golden {
  font-size: 9px; letter-spacing: 3px; color: #d4a574; margin-bottom: 28px;
}
.mock-wk-split { display: flex; gap: 0; align-items: center; width: 100%; margin-bottom: 28px; }
.mock-wk-night { flex: 1; padding: 0 24px; }
.mock-wk-divider { width: 1px; height: 80px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
.mock-wk-day { font-size: 10px; letter-spacing: 4px; color: #5a5650; margin-bottom: 8px; }
.mock-wk-fri .mock-wk-day { color: #d4a574; }
.mock-wk-name {
  font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300;
  letter-spacing: 2px; margin-bottom: 8px;
}
.mock-wk-dj { font-size: 14px; letter-spacing: 3px; color: #e8e4dd; margin-bottom: 4px; }
.mock-wk-desc { font-size: 10px; letter-spacing: 1.5px; color: #5a5650; }
.mock-wk-footer { font-size: 10px; letter-spacing: 2px; color: #9a958d; line-height: 1.8; }
.mock-wk-footer span { color: #5a5650; font-size: 9px; }

@media (max-width: 600px) {
  .mock-grid { grid-template-columns: 1fr; }
  .mock-weekend { min-height: 400px; }
  .mock-wk-split { flex-direction: column; gap: 20px; }
  .mock-wk-divider { width: 40px; height: 1px; }
  .mock-gh-title, .mock-lg-title, .mock-aim-title { font-size: 36px; }
  .mock-wk-name { font-size: 20px; }
}

.kit-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

/* PDF Button */
.kit-top-bar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.kit-pdf-btn {
  display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; color: #9a958d; background: transparent;
  border: 1px solid rgba(255,255,255,0.06); padding: 10px 20px;
  cursor: pointer; transition: all 0.3s; font-family: inherit; font-weight: 500;
}
.kit-pdf-btn:hover { color: #c9a84c; border-color: rgba(201,168,76,0.3); }

@media (max-width: 700px) {
  .kit-page { padding: 24px 20px 60px; }
  .kit-story-grid { grid-template-columns: repeat(3, 1fr); }
  .kit-email, .kit-tiktok-grid { grid-template-columns: 1fr; }
}
@media (max-width: 500px) { .kit-story-grid { grid-template-columns: 1fr 1fr; } }

@media print {
  body, html, div, section { background: #fff !important; color: #111 !important; }

  .kit-page, .kit-header, .kit-section,
  .kit-post, .kit-post-header, .kit-post-visual, .kit-post-caption,
  .kit-story-grid, .kit-story-card, .kit-email, .kit-email > div,
  .kit-ticket, .kit-tiktok-grid, .kit-tiktok-card,
  .mock-card, .mock-content, .mock-overlay, .mock-golden-hour,
  .mock-liquid-gold, .mock-art-in-motion, .mock-weekend,
  .mock-grid { background: #fff !important; color: #111 !important; }

  .kit-page { padding: 20px 40px; max-width: none; }
  .no-print, .kit-back, .kit-footer { display: none !important; }

  .kit-header { padding-bottom: 24px; margin-bottom: 24px; border-bottom: 2px solid #111; }
  .kit-logo { filter: invert(1); height: 36px; }
  .kit-presents { color: #333 !important; }
  .kit-header h1 { color: #111 !important; font-size: 36px; }
  .kit-subtitle { color: #555 !important; }
  .kit-meta { color: #888 !important; }

  .kit-section { margin-bottom: 28px; }
  .kit-section-title { color: #111 !important; font-size: 18px; border-bottom: 2px solid #111; margin-bottom: 16px; padding-bottom: 8px; }
  .kit-note { color: #888 !important; }

  .kit-post { background: #fff !important; border: 1px solid #ccc !important; }
  .kit-post-header { border-color: #ddd !important; background: #fff !important; }
  .kit-post-num { color: #333 !important; }
  .kit-post-type { color: #888 !important; }
  .kit-post-visual { color: #888 !important; border-color: #ddd !important; background: #fff !important; }
  .kit-post-caption { background: #fff !important; }
  .kit-post-caption p { color: #333 !important; }
  .kit-caption-label { color: #888 !important; }
  .kit-copy-btn { display: none !important; }
  .kit-caption-header { margin-bottom: 8px; }

  .kit-story-grid { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .kit-story-card { background: #fff !important; border-bottom: 1px solid #eee; }
  .kit-story-num { color: #111 !important; }
  .kit-story-visual { color: #888 !important; }
  .kit-story-text { color: #333 !important; }

  .kit-email { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .kit-email > div { background: #fff !important; border-bottom: 1px solid #eee; }
  .kit-email p { color: #333 !important; }
  .kit-email-subjects p { color: #333 !important; }
  .kit-email-body h3 { color: #111 !important; }

  .kit-ticket { background: #f5f5f5 !important; border: 1px solid #ccc !important; }
  .kit-ticket p { color: #333 !important; }
  .kit-ticket strong { color: #000 !important; }

  .kit-tiktok-grid { background: #fff !important; gap: 0 !important; border: 1px solid #ccc; }
  .kit-tiktok-card { background: #fff !important; border-bottom: 1px solid #eee; }
  .kit-tiktok-title { color: #111 !important; }
  .kit-tiktok-format { color: #888 !important; }
  .kit-tiktok-card p { color: #333 !important; }

  .kit-table th { color: #555 !important; border-color: #ccc !important; }
  .kit-table td { color: #333 !important; border-color: #ddd !important; }

  /* Mockups */
  .mock-card { min-height: auto !important; border: 1px solid #ccc !important; page-break-inside: avoid; }
  .mock-overlay { display: none !important; }
  .mock-area15 { color: #888 !important; }
  .mock-gh-title { color: #111 !important; }
  .mock-gh-sub { color: #333 !important; }
  .mock-gh-time { color: #555 !important; }
  .mock-gh-detail { color: #555 !important; }
  .mock-gh-detail span { color: #333 !important; }
  .mock-gh-rsvp { background: #111 !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .mock-gh-nights { color: #555 !important; }
  .mock-gh-cta { color: #888 !important; }
  .mock-tag-friday { color: #333 !important; }
  .mock-tag-saturday { color: #555 !important; }
  .mock-lg-title, .mock-aim-title { color: #111 !important; }
  .mock-lg-dj, .mock-aim-dj { color: #111 !important; }
  .mock-lg-genre, .mock-aim-genre { color: #555 !important; }
  .mock-lg-golden, .mock-aim-golden { color: #555 !important; border-color: #ddd !important; }
  .mock-lg-golden span, .mock-aim-golden span { color: #333 !important; }
  .mock-lg-venue, .mock-aim-venue { color: #888 !important; }
  .mock-wk-header { color: #111 !important; }
  .mock-wk-golden { color: #333 !important; }
  .mock-wk-divider { background: #ddd !important; }
  .mock-wk-day { color: #555 !important; }
  .mock-wk-name { color: #111 !important; }
  .mock-wk-dj { color: #111 !important; }
  .mock-wk-desc { color: #555 !important; }
  .mock-wk-footer { color: #555 !important; }
  .mock-wk-footer span { color: #888 !important; }
}
`;
