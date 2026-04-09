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
              visual: "Dark, moody cocktail shot \u2022 El Bandido bottle visible \u2022 Text overlay: GOLDEN HOUR / OPEN BAR / 10 PM\u2013Midnight",
              caption: `Something new starts this Friday. ✨

Golden Hour. Doors at 10. Open bar till midnight. @elbandidotequila cocktails on us — Palomas, Spicy Margaritas, Tequila Sodas — while supplies last.

RSVP and you're in free. No ticket. No cover. Just show up.

Then Liquid Gold takes over at midnight. You already know. ✨

Every Friday & Saturday | AREA15, Oddyssey | Link in bio`,
            },
            {
              num: "Post 2", type: "Cocktail Feature Carousel",
              visual: "3-slide carousel \u2022 Close-up of each cocktail \u2022 Atmospheric, moody lighting",
              caption: `The Golden Hour menu. All @elbandidotequila. All complimentary. 🖤

Paloma — grapefruit, lime, soda. The one everyone starts with.
Spicy Margarita — lime, agave, jalapeño. The one that finds you.
Tequila Soda — lime, soda. Clean and fast.

10 PM – Midnight. While supplies last. First come, first served.

Save this for later so you know what to order. ✨`,
            },
            {
              num: "Post 3", type: "Saturday Replay",
              visual: "Friday night recap footage \u2022 Crowd energy, cocktails, performers",
              caption: `Friday's Golden Hour ran dry in [XX] minutes. ✨🖤

Saturday's your second chance. Same deal. Open bar. 10 PM – Midnight. @elbandidotequila cocktails on us, while supplies last.

RSVP = free entry. Then Art in Motion takes over at midnight.

Doors at 10. Don't be late this time.

Every Friday & Saturday | AREA15, Oddyssey | Link in bio`,
            },
          ].map((post) => (
            <CopyablePost key={post.num} num={post.num} type={post.type} visual={post.visual} caption={post.caption} />
          ))}
        </div>

        {/* Story Sequence */}
        <div className="kit-section">
          <div className="kit-section-title">Instagram / TikTok Story Sequence</div>
          <p className="kit-note">5-story sequence to run day-of (Friday and Saturday)</p>
          <div className="kit-story-grid">
            {[
              { slide: "1", visual: "Black screen, slow text reveal", text: "Tonight. ✨" },
              { slide: "2", visual: "Cocktail pour, slow-mo, moody", text: "Golden Hour. Open bar. 10 PM." },
              { slide: "3", visual: "Bartender lining up glasses", text: "Paloma. Spicy Marg. Tequila Soda. All @elbandidotequila. All free." },
              { slide: "4", visual: "Venue interior, performers, crowd", text: "Then Liquid Gold / Art in Motion takes over at midnight. 🖤" },
              { slide: "5", visual: "Swipe up / link sticker", text: "RSVP = free entry. Link in bio." },
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
              <p>B: Free entry. Free drinks. This Friday.</p>
              <p>C: Golden Hour starts at 10. RSVP and you&rsquo;re in free.</p>
              <p style={{ color: "#5a5650", fontSize: 11, marginTop: 8 }}>Preview: Open bar 10 PM &ndash; Midnight. El Bandido Tequila cocktails, while supplies last.</p>
            </div>
            <CopyableBlock label="Email Body" text={`GOLDEN HOUR
Open Bar featuring El Bandido Tequila

Something new this Friday and Saturday at Oddyssey. ✨

Golden Hour. Doors at 10. Open bar till midnight. El Bandido Tequila cocktails — Palomas, Spicy Margaritas, Tequila Sodas — on us. While supplies last.

RSVP and you're in free. No ticket. No cover.

The bar runs dry when it runs dry. No extensions. After midnight, the night evolves — Liquid Gold on Fridays, Art in Motion on Saturdays. Two dance floors. Performers in the crowd. DJs through close. 🖤

Show up early. You don't want to miss this one.

Doors: 10 PM | Golden Hour: 10 PM – Midnight | Oddyssey at AREA15 | 21+ only`}>
            <div className="kit-email-body" style={{ padding: 0 }}>
              <h3 style={{ color: "#d4a574", fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>GOLDEN HOUR</h3>
              <p style={{ color: "#5a5650", fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>Open Bar featuring El Bandido Tequila</p>
              <p>Something new this Friday and Saturday at Oddyssey. ✨</p>
              <p>Golden Hour. Doors at 10. Open bar till midnight. El Bandido Tequila cocktails &mdash; Palomas, Spicy Margaritas, Tequila Sodas &mdash; on us. While supplies last.</p>
              <p>RSVP and you&rsquo;re in free. No ticket. No cover.</p>
              <p>The bar runs dry when it runs dry. No extensions. After midnight, the night evolves &mdash; Liquid Gold on Fridays, Art in Motion on Saturdays. Two dance floors. Performers in the crowd. DJs through close. 🖤</p>
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
Free entry with RSVP · Open bar featuring El Bandido Tequila

The night starts with Golden Hour. El Bandido Tequila cocktails — Palomas, Spicy Margaritas, Tequila Sodas — on us from 10 PM to midnight. While supplies last. First come, first served.

RSVP and you're in free. No ticket, no cover.

After midnight, the night keeps going. Liquid Gold on Fridays. Art in Motion on Saturdays. Two dance floors, performers in the crowd, DJs through close. Your ticket gets you both — Golden Hour and the full Noir experience.

Doors: 10 PM · Golden Hour: 10 PM – Midnight · Oddyssey at AREA15 · 21+ only`}>
          <div className="kit-ticket">
            <div className="kit-caption-label" style={{ marginBottom: 8 }}>Event Title</div>
            <p><strong>Golden Hour + Liquid Gold (Fri) / Art in Motion (Sat)</strong></p>
            <p style={{ color: "#5a5650", marginBottom: 16 }}>Free entry with RSVP &bull; Open bar featuring El Bandido Tequila</p>
            <div className="kit-caption-label">Description</div>
            <p>The night starts with Golden Hour. El Bandido Tequila cocktails &mdash; Palomas, Spicy Margaritas, Tequila Sodas &mdash; on us from 10 PM to midnight. While supplies last. First come, first served.</p>
            <p>RSVP and you&rsquo;re in free. No ticket, no cover.</p>
            <p>After midnight, the night keeps going. Liquid Gold on Fridays. Art in Motion on Saturdays. Two dance floors, performers in the crowd, DJs through close. Your ticket gets you both &mdash; Golden Hour and the full Noir experience.</p>
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

.kit-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .kit-page { padding: 24px 20px 60px; }
  .kit-story-grid { grid-template-columns: repeat(3, 1fr); }
  .kit-email, .kit-tiktok-grid { grid-template-columns: 1fr; }
}
@media (max-width: 500px) { .kit-story-grid { grid-template-columns: 1fr 1fr; } }
`;
