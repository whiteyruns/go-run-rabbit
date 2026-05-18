"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { OddysseyTopNav } from "@/components/oddyssey/OddysseyTopNav";
import { FollowBand } from "@/components/oddyssey/FollowBand";

const ACCESS_CODE = "oddyssey2026";

export default function ManorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("od-auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

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
          <p className="uppercase text-xs mb-2" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>Manor — Handoff Build</p>
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "2px" }}>Developer Reference</p>
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

  return <ManorContent />;
}

function ManorContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <style>{manorStyles}</style>

      <OddysseyTopNav
        active="manor"
        pageItems={[
          { label: "Gallery", scrollTo: "m-gallery" },
          { label: "FAQ", scrollTo: "m-faq" },
        ]}
        ctaAction={() => scrollToId("m-tickets")}
      />

      {/* ═══ HERO ═══ */}
      <section className="m-hero">
        <video
          className="m-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/oddyssey/gal17.webp"
          aria-hidden="true"
        >
          <source src="/oddyssey/oddy-manor-2026.webm" type="video/webm" />
        </video>
        <div className="m-hero-scrim" />
        <div className="m-hero-texture" />
        <div className="m-hero-ambient" />
        <div className="m-hero-content">
          <div className="m-hero-eyebrow">Every Thursday — Sunday Evening</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/manor-logo.png" alt="Oddyssey Manor" className="m-hero-logo" />
          <h1>Surreal<br />Cocktail Theatre</h1>
          <p className="m-hero-sub">An immersive birthday party · Rotating performance · Secrets in equal measure</p>
          <div className="m-hero-actions">
            <a className="m-btn-primary" onClick={() => scrollToId("m-tickets")}>Get Tickets</a>
            <a className="m-btn-outline" onClick={() => scrollToId("m-rooms")}>Explore the Manor</a>
          </div>
        </div>
        <div className="m-hero-scroll">
          <span>Enter</span>
          <div className="m-scroll-line" />
        </div>
      </section>

      {/* ═══ TICKET TIERS ═══ */}
      <section className="m-section-pad m-tickets" id="m-tickets">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>Reserve Your Evening</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>Choose Your<br />Experience</h2>
          <p className="m-section-sub">Every tier includes entry, theatrical programming, and Friday/Saturday access to Oddyssey Noir after close.</p>
        </div>

        <div className="m-ticket-grid">
          {TICKET_TIERS.map((tier) => (
            <div key={tier.name} className={`m-ticket-card ${tier.featured ? "featured" : ""}`}>
              {tier.featured && <div className="m-ticket-tag">Most Popular</div>}
              <div className="m-ticket-name">{tier.name}</div>
              <div className="m-ticket-price">
                <span className="m-ticket-currency">$</span>{tier.price}
              </div>
              <div className="m-ticket-noir">+ Noir Access Included</div>
              <ul className="m-ticket-features">
                {tier.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a className={tier.featured ? "m-btn-primary" : "m-btn-outline"} style={{ width: "100%", textAlign: "center" }}>
                Book {tier.name.split(" ").slice(-1)[0]}
              </a>
            </div>
          ))}
        </div>

        <p className="m-ticket-note">
          Walk-up tickets subject to capacity &middot; Online reservations strongly recommended &middot; 21+ only
        </p>
      </section>

      {/* ═══ CRAFT MENU (Cocktails + Bites merged per live site) ═══ */}
      <section className="m-section-pad m-craftmenu">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>The Bar &amp; Kitchen</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>Craft Menu</h2>
          <p className="m-section-sub">Cocktails crafted to character &mdash; each drink belongs to a resident &mdash; alongside chef-curated bites that appear throughout the evening.</p>
        </div>

        <div className="m-craft-subhead">Cocktails</div>
        <div className="m-menu-grid">
          {COCKTAILS.map((c) => (
            <div key={c.name} className="m-menu-item">
              <div className="m-menu-item-head">
                <h4>{c.name}</h4>
                <span className="m-menu-item-owner">{c.character}</span>
              </div>
              <p className="m-menu-item-desc">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="m-craft-subhead">Bites</div>
        <div className="m-food-grid">
          {FOOD.map((f) => (
            <div key={f.name} className="m-food-item">
              <h4>{f.name}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="m-ticket-note" style={{ marginTop: 32 }}>
          Cocktail tastings included with every ticket &middot; Bites included with Explorer &amp; Dinner Guest tiers
        </p>
      </section>

      {/* ═══ FLOOR PLAN ═══ */}
      {/* Floor plan moved BEFORE How to Play so visitors see the
          venue layout first and the guiding tips land in context. */}
      <section className="m-section-pad m-floorplan" id="m-rooms">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>Inside the Manor</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>The Grand Oddyssey<br />Manor Theatre</h2>
          <p className="m-section-sub">Ten rooms, multiple bars, one labyrinth. Wander freely — every space rewards the curious.</p>
        </div>
        <div className="m-floorplan-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/oddyssey/manor-floor-plan.png"
            alt="Floor plan of Oddyssey Manor — Foyer, Main Street, Garden, Bath Tub, Dressing Room Bar, Felix's Apartment, Athena's Boudoir, Chapel, Main Stage, Full Bar"
            className="m-floorplan-img"
          />
        </div>
      </section>

      {/* ═══ HOW TO PLAY ═══ */}
      <section className="m-section-pad m-play">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>How It Works</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>How to Play</h2>
          <p className="m-section-sub">The Manor rewards the curious. A few guiding principles.</p>
        </div>
        <div className="m-play-grid">
          {PLAY_GUIDE.map((p, i) => (
            <div key={p.title} className="m-play-item">
              <div className="m-play-num">{String(i + 1).padStart(2, "0")}</div>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE PLAYERS ═══ */}
      <section className="m-section-pad m-players">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>Meet</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>The Players</h2>
          <p className="m-section-sub">The Manor is populated by characters who&rsquo;ll become part of your night.</p>
        </div>
        <div className="m-players-grid">
          {PLAYERS.map((p) => (
            <div key={p.label} className="m-player-card">
              <div className="m-player-label">{p.label}</div>
              <div className="m-player-card-inner">
                <div className="m-player-names">{p.names}</div>
                <p
                  className="m-player-desc"
                  dangerouslySetInnerHTML={{ __html: p.desc }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="m-section-pad m-gallery-section" id="m-gallery">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>The Space</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>Inside the Manor</h2>
        </div>
        <div className="m-gallery-grid">
          {[6, 15, 17, 5, 11, 16, 7, 14, 12].map((n, i) => (
            <div key={i} className="m-gallery-cell">
              <div className="m-gallery-cell-inner" style={{ backgroundImage: `url('/oddyssey/gal${n}.webp')` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ VENUE INFO ═══ */}
      <section className="m-section-pad m-venue">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>Plan Your Visit</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>Before You Arrive</h2>
        </div>
        <div className="m-venue-grid">
          <div className="m-venue-item">
            <h4>Location</h4>
            <p>3202 W Desert Inn Rd<br />Las Vegas, NV 89102<br /><span>Inside AREA15</span></p>
          </div>
          <div className="m-venue-item">
            <h4>Hours</h4>
            <p>Thursday &mdash; Sunday<br />Sessions 6:30 PM &ndash; 8:30 PM<br /><span>~80 minutes per cycle</span></p>
          </div>
          <div className="m-venue-item">
            <h4>Dress Code</h4>
            <p>Cocktail attire<br />with a twist<br /><span>Dress to be seen</span></p>
          </div>
          <div className="m-venue-item">
            <h4>Age</h4>
            <p>21+ only<br />Valid ID required<br /><span>No exceptions</span></p>
          </div>
          <div className="m-venue-item">
            <h4>Accessibility</h4>
            <p>Full ADA compliance<br />On-site parking<br /><span>Let us know in advance</span></p>
          </div>
          <div className="m-venue-item">
            <h4>Sensory Notice</h4>
            <p>Concert-level sound<br />Strobes &middot; theatrical haze<br /><span>Discretion advised</span></p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="m-section-pad m-faq" id="m-faq">
        <div className="m-section-head">
          <div className="m-label" style={{ textAlign: "center" }}>Questions</div>
          <h2 className="m-heading-2" style={{ textAlign: "center" }}>Frequently Asked</h2>
        </div>
        <div className="m-faq-list">
          {FAQ.map((item, i) => (
            <div key={i} className={`m-faq-item ${openFaq === i ? "open" : ""}`}>
              <button className="m-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.q}</span>
                <span className="m-faq-icon">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <div className="m-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Email capture moved off the flagship — visitor's closing CTA
          is the FollowBand below + footer. Keeps the bottom of the
          page from triple-stacking "stay connected" asks. */}

      <FollowBand
        instagram="oddyssey.manor"
        instagramSecondary="oddysseylv"
        tiktok="oddysseylv"
        accent="#c9a84c"
        blurb="The Manor cast, weekly bookings, behind-the-curtain — first on Instagram."
      />

      {/* ═══ FOOTER ═══ */}
      <footer className="m-footer">
        <div className="m-footer-top">
          <div className="m-footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
            <p>A surreal cocktail theatre at AREA15 Las Vegas.</p>
          </div>
          <div className="m-footer-cols">
            <div className="m-footer-col">
              <h6>Experiences</h6>
              <a>Manor</a>
              <Link href="/oddyssey-manor/noir">Noir</Link>
              <a>Private Events</a>
            </div>
            <div className="m-footer-col">
              <h6>Visit</h6>
              <a>Location</a>
              <a>FAQ</a>
              <a>Accessibility</a>
            </div>
            <div className="m-footer-col">
              <h6>Connect</h6>
              <a href="https://www.instagram.com/oddyssey.manor/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@oddysseylv" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a>Contact</a>
            </div>
          </div>
        </div>
        <div className="m-footer-legal">
          <p>&copy; 2026 Oddyssey. Part of AREA15 Las Vegas. All rights reserved.</p>
          <div className="m-footer-legal-links">
            <a>Privacy</a>
            <a>Terms</a>
            <a>CA Privacy Notice</a>
          </div>
        </div>
      </footer>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════

// Live ticket tiers from oddysseylv.com/manor (May 2026 update).
// Explorer dropped from $149 → $99 and is no longer flagged as
// "featured" on the live cards. Noir-access bullet now carries the
// "after-dark party of a sensual, living-room maze" descriptor.
// `featured?: boolean` stays optional in the type so we can re-add a
// "Most Popular" tag later without retyping the array.
const TICKET_TIERS: { name: string; price: number; featured?: boolean; features: string[] }[] = [
  {
    name: "The Taster",
    price: 49,
    features: [
      "Entry to Oddyssey Manor at a reserved time, with access to linger as long as desired.",
      "Includes Five (5) 1oz Specialty Craft Cocktail/Mocktail Tastings.",
      "Friday/Saturday access to Oddyssey NOIR (the after-dark party of a sensual, living-room maze centered by a pulsing dance floor).",
      "Additional beverages available for purchase.",
      "Small-bite offerings available for purchase.",
    ],
  },
  {
    name: "The Voyeur",
    price: 79,
    features: [
      "Entry to Oddyssey Manor at a reserved time, with access to linger as long as desired.",
      "Includes Five (5) 1oz Specialty Craft Cocktail/Mocktail Tastings & Two (2) Crafted Cocktails/Mocktails.",
      "Friday/Saturday access to Oddyssey NOIR (the after-dark party of a sensual, living-room maze centered by a pulsing dance floor).",
      "Additional beverages available for purchase.",
      "Small-bite offerings available for purchase.",
    ],
  },
  {
    name: "The Explorer",
    price: 99,
    features: [
      "Entry to Oddyssey Manor at a reserved time, with access to linger as long as desired.",
      "Includes Five (5) 1oz Specialty Craft Cocktail/Mocktail Tastings & Two (2) Crafted Cocktails/Mocktails.",
      "Your choice of One (1) small-bite offering.",
      "Friday/Saturday access to Oddyssey NOIR (the after-dark party of a sensual, living-room maze centered by a pulsing dance floor).",
      "Additional beverages available for purchase.",
      "Small-bite offerings available for purchase.",
    ],
  },
  {
    name: "The Dinner Guest",
    price: 149,
    features: [
      "Entry to Oddyssey Manor at a reserved time, with access to linger as long as desired.",
      "Includes Five (5) 1oz Specialty Craft Cocktail/Mocktail Tastings & Two (2) Crafted Cocktails/Mocktails.",
      "Your choice of Three (3) small-bite offerings.",
      "Friday/Saturday access to Oddyssey NOIR (the after-dark party of a sensual, living-room maze centered by a pulsing dance floor).",
      "Additional beverages available for purchase.",
      "Additional small-bite offerings available for purchase.",
    ],
  },
];

const COCKTAILS = [
  { name: "The Sirens Song", character: "The Sirens", desc: "A bittersweet call to the deep — mezcal, passionfruit, and smoked sea salt." },
  { name: "Felix's Nightcap", character: "Felix", desc: "Our host's preferred toast — aged rum, walnut bitters, and a vanilla pear finish." },
  { name: "Penelope's Love Letter", character: "Penelope", desc: "An elegant pour — gin, elderflower, rose, and a whisper of champagne." },
  { name: "Welcome Tea", character: "The House", desc: "The first drink of the evening — a warm herbal infusion served with theatrical flourish." },
  { name: "Henry's Nightgown", character: "Henry", desc: "Rye, spiced honey, amaro, and orange peel — worn loosely, never buttoned." },
  { name: "Cici's Remedy", character: "Cici", desc: "Cures what ails you — tequila, ginger, lime, and a crushed-berry finish." },
  { name: "Athena's Disguise", character: "Athena", desc: "Never what it first appears — clear spirit, herbal bitters, and a slow-shifting color." },
  { name: "Three Sip Chalice", character: "The Manor", desc: "A shared pour, meant to be passed. Composition changes with the evening." },
];

const FOOD = [
  { name: "Charcuterie", desc: "Cured meats, aged cheese, and house accompaniments." },
  { name: "Spare Ribs", desc: "Slow-braised, glazed, and served warm." },
  { name: "Shrimp Ceviche", desc: "Citrus-cured, tossed with chili and herbs." },
  { name: "Ube Cheesecake", desc: "A bite of something sweet — purple, smooth, and unexpected." },
];

// Mirrors the live oddysseylv.com/manor "Engagement Guide" — five
// tips, title case, in the same order as the live page.
const PLAY_GUIDE = [
  { title: "Wander Freely", desc: "No set path. Every room holds something." },
  { title: "Engage the Characters", desc: "Ask questions. Accept invitations. They&rsquo;re expecting you." },
  { title: "Visit All the Bars", desc: "Each has its own personality &mdash; and its own drink." },
  { title: "Follow the Energy", desc: "When something shifts, move toward it." },
  { title: "Play Along", desc: "The story bends toward guests who lean in." },
];

// "The Players" — 4 tarot-style cards mirroring the live oddysseylv.com
// /manor page structure. Each card represents a tier of the cast
// (Hosts / Residents / Performers / Special Guests).
const PLAYERS = [
  {
    label: "Hosts",
    names: "Felix & Penelope",
    desc: "The husband-and-wife proprietors of Oddyssey Manor. Gracious to all performers, true keepers of its legacy. This reopening is their grand return, equal parts celebration, séance, and love letter to the theatre&rsquo;s past.",
  },
  {
    label: "The Residents",
    names: "Athena, Felix, Cici, and Henry",
    desc: "Within the Manor&rsquo;s walls live Athena, Felix&rsquo;s poised and capable right hand; Cici, the spirited heartbeat of the house whose warmth and mischief keep theatre alive (and rumors swirling about her and Athena); and Henry, the absent jester and leer whose laughter still echoes through the rafters.",
  },
  {
    label: "The Performers",
    names: "The Sirens",
    desc: "A troupe of alluring performers, all sharing the name Sirena. Each embodies a different side of seduction and spectacle. Their performances appear without warning — follow the sound and let them lead you deeper.",
  },
  {
    label: "Special Guests",
    names: "Mysterious Visitors",
    desc: "Mysterious visitors drift through the Manor&rsquo;s doors, bringing new stories, strange talents, and moments of magic.",
  },
];


const FAQ = [
  {
    q: "The experience is on a cycle — does it repeat?",
    a: "The overall shape repeats every 80 minutes, but specific scenes, cocktails, and interactions change nightly and even within the same evening. No two cycles feel the same.",
  },
  {
    q: "Can I buy tickets at the door?",
    a: "Walk-ups are welcome subject to capacity, but Oddyssey Manor frequently sells out. Online reservations are strongly recommended, especially Friday and Saturday.",
  },
  {
    q: "What should I wear?",
    a: "Cocktail attire with a twist. Dress to be part of the world. No athletic wear or beach attire — we reserve the right to refuse entry based on dress code.",
  },
  {
    q: "Can I take photos?",
    a: "Discreet photography is welcome. No flash, no tripods, and please don&rsquo;t interrupt a scene to capture it. Videography for commercial use requires advance permission.",
  },
  {
    q: "Is the experience wheelchair accessible?",
    a: "Yes. The Manor is fully ADA-compliant. If you have specific access needs, contact us 48 hours before your visit so we can prepare.",
  },
  {
    q: "I&rsquo;m sensitive to strobes or loud sound — should I come?",
    a: "The experience includes concert-level sound, theatrical haze, and occasional strobes. If you&rsquo;re sensitive, reach out and we&rsquo;ll advise on the best times or tiers.",
  },
  {
    q: "What&rsquo;s included with Noir access?",
    a: "Every Manor ticket tier on Friday and Saturday includes entry to Oddyssey Noir — the after-dark party of a sensual, living-room maze centered by a pulsing dance floor. Doors at 10 PM, runs late.",
  },
  {
    q: "Can I host a private event at the Manor?",
    a: "Absolutely. Full buyouts and sectional reservations are available for corporate events, brand activations, birthdays, and more. Contact our events team for details.",
  },
];

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════

const manorStyles = `
/* ═══ SHARED TOKENS (inherited from layout, re-declared for handoff portability) ═══ */
.m-nav, .m-hero, .m-section-pad, .m-footer, .m-mobile-nav, .page-pill-nav {
  --bg: #060606;
  --bg-elevated: #0d0d0d;
  --bg-card: #111111;
  --border: rgba(201, 168, 76, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --accent: #c9a84c;
  --accent-hover: #d4b85e;
  --accent-dim: rgba(201, 168, 76, 0.08);
  --text: #e8e4dd;
  --text-secondary: #9a958d;
  --text-muted: #5a5650;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Inter', -apple-system, sans-serif;
}

/* ═══ NAV ═══ */
.m-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 clamp(20px, 4vw, 60px); height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.6s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.6s;
}
.m-nav.scrolled {
  background: rgba(6,6,6,0.85);
  backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid var(--border-subtle);
}
.m-nav-logo { cursor: pointer; display: flex; align-items: center; transition: opacity 0.3s; }
.m-nav-logo:hover { opacity: 0.7; }
.m-nav-logo img { height: 32px; width: auto; }
.m-nav-links { display: flex; align-items: center; gap: 36px; list-style: none; margin: 0; padding: 0; }
.m-nav-links a {
  font-size: 11px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--text-secondary); cursor: pointer; transition: color 0.3s; position: relative;
  text-decoration: none;
}
.m-nav-links a.active { color: var(--accent); }
.m-nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px;
  background: var(--accent); transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
}
.m-nav-links a.active::after { width: 100%; }
.m-nav-links a:hover { color: var(--text); }
.m-nav-links a:hover::after { width: 100%; }
.m-nav-cta {
  font-size: 10px !important; font-weight: 500 !important; letter-spacing: 3px !important;
  color: var(--bg) !important; background: var(--accent); padding: 10px 24px;
  transition: background 0.3s, transform 0.3s;
}
.m-nav-cta::after { display: none !important; }
.m-nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }
.m-hamburger {
  display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 1001;
}
.m-hamburger span { display: block; width: 24px; height: 1px; background: var(--text); transition: transform 0.4s, opacity 0.3s; }
.m-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
.m-hamburger.open span:nth-child(2) { opacity: 0; }
.m-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
.m-mobile-nav {
  position: fixed; inset: 0; background: var(--bg); z-index: 999;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 32px;
}
.m-mobile-nav a {
  font-family: var(--serif); font-size: 32px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; color: var(--text-secondary); cursor: pointer; transition: color 0.3s;
  text-decoration: none;
}
.m-mobile-nav a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .m-nav-links { display: none; }
  .m-hamburger { display: flex; }
}

/* ═══ FLOATING PAGE PILL NAV ═══ */
.page-pill-nav {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 900;
  display: flex; gap: 2px; background: rgba(6,6,6,0.9); backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle); padding: 6px;
}
.page-pill-nav a {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); padding: 10px 20px; transition: all 0.3s; cursor: pointer;
  text-decoration: none;
}
.page-pill-nav a:hover { color: var(--text); }
.page-pill-nav a.active { background: var(--accent); color: var(--bg); }
@media (max-width: 600px) {
  .page-pill-nav { bottom: 12px; padding: 3px; left: 8px; right: 8px; transform: none; justify-content: center; }
  .page-pill-nav a { padding: 8px 12px; font-size: 8px; letter-spacing: 1px; flex: 1; text-align: center; }
}

/* ═══ SHARED PRIMITIVES ═══ */
.m-label {
  font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px;
}
.m-section-pad { padding: clamp(80px,12vw,160px) clamp(20px,6vw,120px); }
.m-section-head { max-width: 720px; margin: 0 auto 64px; text-align: center; }
.m-section-sub {
  font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--text-secondary);
  letter-spacing: 0.5px; margin-top: 20px;
}
.m-heading-2 {
  font-family: var(--serif); font-size: clamp(28px,4vw,48px); font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; line-height: 1.1;
}
.m-btn-primary {
  display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 3px;
  text-transform: uppercase; color: var(--bg); background: var(--accent);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  border: none; text-decoration: none;
}
.m-btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.2); }
.m-btn-outline {
  display: inline-block; font-size: 10px; font-weight: 400; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-secondary); border: 1px solid var(--border);
  padding: 14px 36px; cursor: pointer; transition: all 0.4s;
  background: transparent; text-decoration: none;
}
.m-btn-outline:hover { color: var(--text); border-color: var(--accent); background: var(--accent-dim); }

/* ═══ HERO ═══ */
.m-hero {
  position: relative; height: 100vh; min-height: 720px;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(40px,8vw,120px); overflow: hidden;
}
.m-hero-video {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%; object-fit: cover;
  pointer-events: none;
}
.m-hero-scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(13,8,18,0.6) 0%, transparent 50%),
    linear-gradient(180deg, rgba(6,6,6,0.30) 0%, rgba(6,6,6,0.55) 50%, rgba(6,6,6,0.92) 100%);
}
.m-hero-texture {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px);
}
.m-hero-ambient {
  position: absolute; inset: 0; z-index: 1;
  background:
    conic-gradient(from 200deg at 30% 70%, transparent 0deg, rgba(201,168,76,0.05) 40deg, transparent 80deg),
    conic-gradient(from 60deg at 75% 35%, transparent 0deg, rgba(80,40,100,0.06) 30deg, transparent 60deg);
  animation: mAmbient 20s ease-in-out infinite alternate;
}
@keyframes mAmbient { 0% { opacity: 0.6; } 100% { opacity: 1; } }
.m-hero-content { position: relative; z-index: 10; max-width: 960px; }
.m-hero-eyebrow {
  font-size: 11px; font-weight: 400; letter-spacing: 5px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 32px;
  opacity: 0; transform: translateY(20px); animation: mFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
}
.m-hero-logo {
  height: 80px; width: auto; margin-bottom: 36px; filter: brightness(1.1);
  opacity: 0; transform: translateY(20px); animation: mFadeUp 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
}
.m-hero h1 {
  font-family: var(--serif); font-size: clamp(40px,7vw,88px); font-weight: 300;
  line-height: 1.05; letter-spacing: clamp(2px,0.6vw,7px); text-transform: uppercase; margin-bottom: 24px;
  opacity: 0; transform: translateY(30px); animation: mFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.7s forwards;
}
.m-hero-sub {
  font-size: clamp(12px,1.4vw,15px); font-weight: 300; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-secondary); margin-bottom: 48px; max-width: 620px;
  opacity: 0; transform: translateY(20px); animation: mFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.9s forwards;
}
.m-hero-actions {
  display: flex; gap: 16px; flex-wrap: wrap;
  opacity: 0; transform: translateY(20px); animation: mFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards;
}
@keyframes mFadeUp { to { opacity: 1; transform: translateY(0); } }
.m-hero-scroll {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0; animation: mFadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.5s forwards;
}
.m-hero-scroll span { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-muted); }
.m-scroll-line {
  width: 1px; height: 40px; background: linear-gradient(to bottom, var(--accent), transparent);
  animation: mScrollPulse 2s ease-in-out infinite;
}
@keyframes mScrollPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

/* ═══ TICKETS ═══ */
.m-tickets { background: var(--bg); border-top: 1px solid var(--border-subtle); }
.m-ticket-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1400px; margin: 0 auto;
}
.m-ticket-card {
  background: var(--bg); padding: clamp(28px,3vw,40px);
  display: flex; flex-direction: column; position: relative; transition: background 0.4s;
}
.m-ticket-card:hover { background: var(--bg-elevated); }
.m-ticket-card.featured { background: var(--bg-card); }
.m-ticket-card.featured::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent);
}
.m-ticket-tag {
  position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
  background: var(--accent); color: var(--bg); padding: 6px 14px;
}
.m-ticket-name {
  font-family: var(--serif); font-size: 22px; font-weight: 400; letter-spacing: 2px;
  text-transform: uppercase; margin-bottom: 12px; line-height: 1.2;
}
.m-ticket-price {
  font-family: var(--serif); font-size: 52px; font-weight: 300; color: var(--accent);
  line-height: 1; margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;
}
.m-ticket-currency { font-size: 22px; margin-top: 8px; opacity: 0.7; }
.m-ticket-noir {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
  padding: 8px 0; margin-bottom: 20px; border-bottom: 1px solid var(--border);
}
.m-ticket-features { list-style: none; margin: 0 0 28px; padding: 0; flex: 1; }
.m-ticket-features li {
  font-size: 13px; color: var(--text-secondary); padding: 9px 0;
  border-bottom: 1px solid var(--border-subtle); letter-spacing: 0.3px; line-height: 1.4;
  position: relative; padding-left: 18px;
}
.m-ticket-features li::before {
  content: ''; position: absolute; left: 0; top: 15px;
  width: 5px; height: 5px; border: 1px solid var(--accent); transform: rotate(45deg);
}
.m-ticket-features li:last-child { border-bottom: none; }
.m-ticket-note {
  text-align: center; margin-top: 40px; font-size: 11px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--text-muted);
}
@media (max-width: 1100px) { .m-ticket-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .m-ticket-grid { grid-template-columns: 1fr; } }

/* ═══ CRAFT MENU (cocktails + bites merged) ═══ */
.m-craftmenu {
  background: var(--bg-elevated); border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}
.m-craft-subhead {
  max-width: 1100px; margin: 36px auto 18px;
  font-family: var(--mono, monospace); font-size: 10px;
  letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); text-align: center;
}
.m-craft-subhead:first-of-type { margin-top: 0; }
.m-menu-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--border-subtle); max-width: 1100px; margin: 0 auto;
}
.m-menu-item { background: var(--bg-elevated); padding: 28px 32px; transition: background 0.4s; }
.m-menu-item:hover { background: var(--bg-card); }
.m-menu-item-head {
  display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
  margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--border-subtle);
}
.m-menu-item-head h4 {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  letter-spacing: 1px; color: var(--text); margin: 0;
}
.m-menu-item-owner {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; white-space: nowrap;
}
.m-menu-item-desc {
  font-size: 13px; font-weight: 300; line-height: 1.6; color: var(--text-secondary);
  letter-spacing: 0.3px;
}
@media (max-width: 768px) { .m-menu-grid { grid-template-columns: 1fr; } }

/* ═══ FOOD ═══ */
.m-food { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.m-food-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1100px; margin: 0 auto;
}
.m-food-item { background: var(--bg); padding: 32px 24px; text-align: center; transition: background 0.4s; }
.m-food-item:hover { background: var(--bg-elevated); }
.m-food-item h4 {
  font-family: var(--serif); font-size: 20px; font-weight: 400; letter-spacing: 1.5px;
  color: var(--accent); margin: 0 0 12px;
}
.m-food-item p {
  font-size: 12px; font-weight: 300; line-height: 1.6; color: var(--text-secondary);
  letter-spacing: 0.3px;
}
@media (max-width: 768px) { .m-food-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .m-food-grid { grid-template-columns: 1fr; } }

/* ═══ HOW TO PLAY ═══ */
.m-play { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.m-play-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1400px; margin: 0 auto;
}
.m-play-item { background: var(--bg-elevated); padding: 36px 24px; transition: background 0.4s; }
.m-play-item:hover { background: var(--bg-card); }
.m-play-num {
  font-family: var(--serif); font-size: 32px; font-weight: 300;
  color: rgba(201,168,76,0.35); margin-bottom: 16px; line-height: 1;
}
.m-play-item h4 {
  font-family: var(--serif); font-size: 18px; font-weight: 400; letter-spacing: 1.5px;
  text-transform: uppercase; margin: 0 0 10px; color: var(--text);
}
.m-play-item p {
  font-size: 13px; font-weight: 300; line-height: 1.6; color: var(--text-secondary);
}
@media (max-width: 1100px) { .m-play-grid { grid-template-columns: 1fr 1fr 1fr; } }
@media (max-width: 700px) { .m-play-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .m-play-grid { grid-template-columns: 1fr; } }

/* ═══ FLOOR PLAN ═══ */
.m-floorplan { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.m-floorplan-wrap {
  max-width: 1100px; margin: 0 auto;
  padding: 32px clamp(8px, 3vw, 32px);
  background: rgba(232,228,221,0.03);
  border: 1px solid rgba(201,168,76,0.18);
  position: relative;
}
.m-floorplan-wrap::before,
.m-floorplan-wrap::after {
  content: ''; position: absolute; width: 22px; height: 22px;
  border: 1px solid rgba(201,168,76,0.4); pointer-events: none;
}
.m-floorplan-wrap::before { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.m-floorplan-wrap::after  { bottom: 10px; right: 10px; border-left:  none; border-top:    none; }
.m-floorplan-img {
  display: block; width: 100%; height: auto;
  filter: brightness(1.05) contrast(1.05);
}

/* ═══ THE PLAYERS ═══ */
.m-players { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.m-players-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  max-width: 1200px; margin: 0 auto;
}
.m-player-card {
  display: flex; flex-direction: column;
}
.m-player-label {
  align-self: flex-start;
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500;
  padding: 6px 14px;
  border: 1px solid rgba(201,168,76,0.5);
  border-bottom: none;
  background: rgba(232,228,221,0.02);
}
.m-player-card-inner {
  flex: 1;
  background: rgba(232,228,221,0.04);
  border: 1px solid rgba(201,168,76,0.25);
  padding: 28px 22px;
  display: flex; flex-direction: column; gap: 14px;
  position: relative;
}
.m-player-card-inner::before,
.m-player-card-inner::after {
  content: ''; position: absolute;
  width: 18px; height: 18px;
  border: 1px solid rgba(201,168,76,0.35);
  pointer-events: none;
}
.m-player-card-inner::before { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.m-player-card-inner::after  { bottom: 8px; right: 8px; border-left:  none; border-top:    none; }
.m-player-names {
  font-family: var(--serif); font-size: 16px; font-weight: 500;
  letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.3;
  color: var(--text); padding-top: 12px; text-align: center;
  border-top: 1px solid rgba(201,168,76,0.15);
}
.m-player-desc {
  font-size: 12.5px; font-weight: 300; line-height: 1.7;
  color: var(--text-secondary); margin: 0;
}
@media (max-width: 1000px) { .m-players-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .m-players-grid { grid-template-columns: 1fr; } }

/* ═══ GALLERY ═══ */
.m-gallery-section { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.m-gallery-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
  max-width: 1300px; margin: 0 auto;
}
.m-gallery-cell { aspect-ratio: 4/3; overflow: hidden; position: relative; cursor: pointer; }
.m-gallery-cell-inner {
  position: absolute; inset: 0; background-position: center; background-size: cover;
  transition: transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.m-gallery-cell:hover .m-gallery-cell-inner { transform: scale(1.06); }
@media (max-width: 600px) { .m-gallery-grid { grid-template-columns: 1fr 1fr; } }

/* ═══ VENUE ═══ */
.m-venue { background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle); }
.m-venue-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--border-subtle); max-width: 1200px; margin: 0 auto;
}
.m-venue-item { background: var(--bg-elevated); padding: 36px 28px; text-align: center; transition: background 0.4s; }
.m-venue-item:hover { background: var(--bg-card); }
.m-venue-item h4 {
  font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 16px;
}
.m-venue-item p {
  font-family: var(--serif); font-size: 17px; font-weight: 300;
  letter-spacing: 1px; color: var(--text); line-height: 1.6;
}
.m-venue-item p span {
  display: block; margin-top: 6px; font-family: var(--sans); font-size: 11px;
  letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 400;
}
@media (max-width: 900px) { .m-venue-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .m-venue-grid { grid-template-columns: 1fr; } }

/* ═══ FAQ ═══ */
.m-faq { background: var(--bg); border-bottom: 1px solid var(--border-subtle); }
.m-faq-list { max-width: 820px; margin: 0 auto; }
.m-faq-item {
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.3s;
}
.m-faq-item.open { background: var(--bg-elevated); }
.m-faq-q {
  width: 100%; text-align: left; padding: 24px 20px;
  display: flex; justify-content: space-between; align-items: center; gap: 24px;
  background: transparent; border: none; cursor: pointer;
  font-family: var(--serif); font-size: clamp(15px, 1.6vw, 18px); font-weight: 400;
  letter-spacing: 0.5px; color: var(--text); transition: color 0.3s;
}
.m-faq-q:hover { color: var(--accent); }
.m-faq-icon {
  font-size: 20px; color: var(--accent); font-weight: 300; min-width: 20px; text-align: center;
}
.m-faq-a {
  padding: 0 20px 24px; font-size: 14px; font-weight: 300;
  line-height: 1.7; color: var(--text-secondary); max-width: 680px;
}


/* ═══ FOOTER ═══ */
.m-footer {
  padding: 80px clamp(20px,6vw,120px) 40px; border-top: 1px solid var(--border-subtle);
  background: var(--bg);
}
.m-footer-top {
  display: grid; grid-template-columns: 1.2fr 2fr; gap: 60px;
  padding-bottom: 60px; border-bottom: 1px solid var(--border-subtle);
}
.m-footer-brand img { height: 28px; width: auto; margin-bottom: 20px; opacity: 0.7; }
.m-footer-brand p {
  font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--text-muted);
  letter-spacing: 0.5px; max-width: 320px;
}
.m-footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.m-footer-col { display: flex; flex-direction: column; gap: 12px; }
.m-footer-col h6 {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin: 0 0 4px;
}
.m-footer-col a {
  font-size: 12px; letter-spacing: 1px; color: var(--text-secondary);
  cursor: pointer; transition: color 0.3s; text-decoration: none;
}
.m-footer-col a:hover { color: var(--text); }
.m-footer-legal {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
  padding-top: 40px;
}
.m-footer-legal p {
  font-size: 11px; letter-spacing: 1px; color: var(--text-muted);
}
.m-footer-legal-links { display: flex; gap: 24px; }
.m-footer-legal-links a {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); cursor: pointer; transition: color 0.3s; text-decoration: none;
}
.m-footer-legal-links a:hover { color: var(--accent); }
@media (max-width: 900px) {
  .m-footer-top { grid-template-columns: 1fr; gap: 40px; }
  .m-footer-cols { grid-template-columns: 1fr 1fr 1fr; }
}
@media (max-width: 600px) {
  .m-footer-cols { grid-template-columns: 1fr 1fr; }
}
`;
