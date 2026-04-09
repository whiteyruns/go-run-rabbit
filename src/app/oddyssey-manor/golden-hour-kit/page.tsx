"use client";

import { useState } from "react";
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

          <div className="kit-post">
            <div className="kit-post-header">
              <span className="kit-post-num">Post 1</span>
              <span className="kit-post-type">Launch Announcement</span>
            </div>
            <div className="kit-post-visual">Dark, moody cocktail shot &bull; El Bandido bottle visible &bull; Text overlay: GOLDEN HOUR / OPEN BAR / 10 PM&ndash;Midnight</div>
            <div className="kit-post-caption">
              <div className="kit-caption-label">Caption</div>
              <p>GOLDEN HOUR. This Friday at Liquid Gold.</p>
              <p>RSVP and get in free. Then we&rsquo;re opening the bar at 10PM with complimentary El Bandido Tequila cocktails &mdash; Palomas, Spicy Margaritas, and Tequila Sodas &mdash; while supplies last.</p>
              <p>Free entry. Free drinks. 10 PM &ndash; Midnight. Then Liquid Gold takes over.</p>
              <p style={{ color: "#5a5650", fontSize: 11 }}>Doors: 10:00 PM &bull; Golden Hour: 10 PM &ndash; Midnight &bull; Paid Bar: Midnight &ndash; Late</p>
              <p style={{ color: "#5a5650", fontSize: 11 }}>#OddysseyLV #GoldenHour #OpenBar #LasVegasNightlife #AREA15 #ElBandidoTequila</p>
            </div>
          </div>

          <div className="kit-post">
            <div className="kit-post-header">
              <span className="kit-post-num">Post 2</span>
              <span className="kit-post-type">Cocktail Feature Carousel</span>
            </div>
            <div className="kit-post-visual">3-slide carousel &bull; Close-up of each cocktail &bull; Atmospheric, stylized</div>
            <div className="kit-post-caption">
              <div className="kit-caption-label">Caption</div>
              <p>The Golden Hour menu, powered by El Bandido Tequila:</p>
              <p>Paloma &mdash; grapefruit, lime, soda<br />Spicy Margarita &mdash; lime, agave, jalape&ntilde;o<br />Tequila Soda &mdash; lime, soda, simplicity</p>
              <p>All complimentary. 10 PM &ndash; Midnight. While supplies last. Don&rsquo;t be late.</p>
            </div>
          </div>

          <div className="kit-post">
            <div className="kit-post-header">
              <span className="kit-post-num">Post 3</span>
              <span className="kit-post-type">Saturday FOMO</span>
            </div>
            <div className="kit-post-visual">Recap photo/video from Friday night &bull; Urgency tone</div>
            <div className="kit-post-caption">
              <div className="kit-caption-label">Caption</div>
              <p>Friday&rsquo;s Golden Hour sold through in [XX] minutes.</p>
              <p>Saturday&rsquo;s your second chance. Open bar. 10 PM &ndash; Midnight. El Bandido Tequila cocktails on us, while supplies last.</p>
              <p>RSVP = free entry. Then Art in Motion takes over at midnight. Doors at 10. Don&rsquo;t sleep.</p>
            </div>
          </div>
        </div>

        {/* Story Sequence */}
        <div className="kit-section">
          <div className="kit-section-title">Instagram / TikTok Story Sequence</div>
          <p className="kit-note">5-story sequence to run day-of (Friday and Saturday)</p>
          <div className="kit-story-grid">
            {[
              { slide: "1", visual: "Black screen, slow text reveal", text: "Tonight." },
              { slide: "2", visual: "Cocktail pour (slow-mo)", text: "GOLDEN HOUR / Open Bar / 10 PM–Midnight" },
              { slide: "3", visual: "Menu card or bartender prep", text: "Paloma · Spicy Marg · Tequila Soda / While supplies last" },
              { slide: "4", visual: "Venue interior / moody lighting", text: "Then Liquid Gold (Fri) / Art in Motion (Sat) takes over" },
              { slide: "5", visual: "Swipe up / link sticker", text: "RSVP for free entry / Link in bio" },
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
              <p>A: Golden Hour this Friday. Open bar featuring El Bandido Tequila.</p>
              <p>B: Free entry + free cocktails. RSVP for Golden Hour.</p>
              <p>C: Oddyssey just opened the bar.</p>
              <p style={{ color: "#5a5650", fontSize: 11, marginTop: 8 }}>Preview: Complimentary El Bandido Tequila cocktails, 10 PM &ndash; Midnight, while supplies last.</p>
            </div>
            <div className="kit-email-body">
              <div className="kit-caption-label">Email Body</div>
              <h3 style={{ color: "#d4a574", fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>GOLDEN HOUR</h3>
              <p style={{ color: "#5a5650", fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>Open Bar featuring El Bandido Tequila</p>
              <p>We&rsquo;re starting the weekend early. And if you RSVP, you&rsquo;re in free.</p>
              <p>This Friday and Saturday, Oddyssey is kicking off Golden Hour at 10 PM &mdash; complimentary El Bandido Tequila cocktails including Palomas, Spicy Margaritas, and Tequila Sodas, served while supplies last.</p>
              <p>RSVP now and entry is on us. Show up early. The bar runs dry when it runs dry. No extensions, no exceptions.</p>
              <p>After midnight, the night evolves into Liquid Gold (Fridays) or Art in Motion (Saturdays) with paid bar service &mdash; two dance floors, live performers, and DJs through close.</p>
              <div style={{ background: "#0d0d0d", padding: 20, marginTop: 16, fontSize: 12, color: "#9a958d" }}>
                Doors: 10:00 PM<br />Golden Hour: 10:00 PM &ndash; Midnight<br />Where: Oddyssey at AREA15<br />Age: 21+ only
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Page */}
        <div className="kit-section">
          <div className="kit-section-title">Ticket Page Copy</div>
          <div className="kit-ticket">
            <div className="kit-caption-label">Event Title</div>
            <p><strong>Golden Hour + Liquid Gold (Fri) / Art in Motion (Sat)</strong></p>
            <p style={{ color: "#5a5650", marginBottom: 16 }}>Complimentary Entry with RSVP + Open Bar featuring El Bandido Tequila</p>
            <div className="kit-caption-label">Description</div>
            <p>The night starts with Golden Hour &mdash; complimentary El Bandido Tequila cocktails from 10 PM &ndash; Midnight, served while supplies last. Choose from Palomas, Spicy Margaritas, or Tequila Sodas at the featured bar.</p>
            <p>Doors open at 10:00 PM. First come, first served. After midnight, the night evolves into Liquid Gold (Fridays) or Art in Motion (Saturdays) with paid bar service &mdash; two dance floors, roaming performers, and DJs through close.</p>
          </div>
        </div>

        {/* TikTok */}
        <div className="kit-section">
          <div className="kit-section-title">TikTok Video Concepts</div>
          <div className="kit-tiktok-grid">
            {[
              { title: "Announcement", format: "15–30 sec", hook: "POV: You just found out about free entry AND free El Bandido Tequila cocktails in Vegas this Friday", visual: "Quick cuts of cocktail prep, venue lighting, bartender shake, pour" },
              { title: "Day-Of Hype", format: "10–15 sec", hook: "Golden Hour starts tonight at 10. Open bar till midnight.", visual: "Countdown-style: bartender lining up glasses, bottles, doors opening" },
              { title: "Post-Event Recap", format: "15–30 sec", hook: "Golden Hour lasted [XX] minutes last night", visual: "Crowd shots, cocktail close-ups, vibes. End: 'Saturday. Same deal.'" },
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
          <span>Claymore & Colt &bull; April 2026</span>
        </div>
      </div>
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
.kit-caption-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; font-weight: 500; margin-bottom: 8px; }
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

.kit-footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .kit-page { padding: 24px 20px 60px; }
  .kit-story-grid { grid-template-columns: repeat(3, 1fr); }
  .kit-email, .kit-tiktok-grid { grid-template-columns: 1fr; }
}
@media (max-width: 500px) { .kit-story-grid { grid-template-columns: 1fr 1fr; } }
`;
