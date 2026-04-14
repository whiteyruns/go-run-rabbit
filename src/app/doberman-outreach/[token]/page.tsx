"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Target {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  category: string | null;
  personalization: Record<string, string | null>;
}

const IMAGES = {
  hero: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/bd139425-77e5-4d2b-ba9d-9aeeb51a78a5/P1641079+%284%29.jpg",
  logo: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/e49dad38-b8a7-4807-981b-2bc70e91654a/Doberman.png",
  anniversary: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/9f5adad2-3672-4329-b278-bb222b260acf/2026-4-15---One-Year-Anniversary---Invitation.jpg",
  moodBoard: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/35196dbf-2466-433a-bc9b-44b3d13cdedc/DB+Anniversary+Party+Mood+Board+2026.JPG",
  menu1: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/1757626809418-WZ1WSX9TAS33SD6M9CCY/2025+-+Doberman+-+Menu+-+Booklet+-+4+-+WEB+-+1.jpg",
  menu2: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/1757626806178-P5DU7PZHQLG89W8H8BK7/2025+-+Doberman+-+Menu+-+Booklet+-+4+-+WEB+-+2.jpg",
  menu3: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/1757626742367-PI8UQJBMJS4TT3QFXCLP/2025+-+Doberman+-+Menu+-+Booklet+-+4+-+WEB+-+3.jpg",
  nibbles: "https://images.squarespace-cdn.com/content/v1/652d9f35798aeb069cef3d93/1757624992913-JO6XM04PVPZSY1Y6K4ZA/2025+-+Doberman+-+Menu+-+Nibbles+-+WEB+-+1.jpg",
};

const PRESS = [
  { pub: "Forbes", quote: "A moody cocktail bar and members club with drinks that taste like dinner and dessert." },
  { pub: "Travel + Leisure", quote: "Named Las Vegas the #1 Nightlife Destination in the World — Doberman featured." },
  { pub: "CNN", quote: "A taxidermy-adorned craft-cocktail bar with zero-proof innovations." },
  { pub: "The Infatuation", quote: "One of the few social clubs in the Arts District — distinctive, surreal, unmistakable." },
  { pub: "Eater Vegas", quote: "A $3,000 optional membership with cocktails like the Tom Kha Fizz and Peter Pepper martini." },
];

const BENEFITS = [
  { title: "Members-Only Concierge", desc: "Priority reservations, personalized service, and direct access to your dedicated host." },
  { title: "Exclusive Events", desc: "Private programming — Doberman Dialogues, Tub Club, curated dinners, and experiences not open to the public." },
  { title: "Rare Spirits & Wine", desc: "Access to a members-only menu of rare and allocated bottles not available to walk-in guests." },
  { title: "Curated Monthly Gift", desc: "A hand-selected gift delivered monthly — spirits, accessories, books, and objects from the Doberman world." },
  { title: "VIP Seating", desc: "Guaranteed premium seating. No waitlists. Your table is always ready." },
  { title: "Guest Passes", desc: "Bring colleagues and clients into the room. Share the experience on your terms." },
  { title: "Complimentary Valet", desc: "Pull up, hand over the keys. Every visit." },
];

const PROGRAMMING = [
  { name: "Keys to Doberman", desc: "Live piano and intimate musical performances" },
  { name: "Doberman Dialogues", desc: "Curated conversations with notable guests" },
  { name: "Tub Club", desc: "Themed immersive experiences" },
  { name: "Backgammon Nights", desc: "Competitive social gaming" },
  { name: "Bohemian Groove", desc: "Eclectic live entertainment" },
  { name: "Sunday Sessions", desc: "Weekend wind-down programming" },
];

export default function DobermanOutreachPage() {
  const params = useParams();
  const token = params.token as string;
  const [target, setTarget] = useState<Target | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/doberman-outreach/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action: "viewed" }),
        });
        if (res.ok) {
          const data = await res.json();
          setTarget(data.target || null);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }
    load();
  }, [token]);

  if (!loaded) {
    return <div style={{ background: "#0a0f1a", minHeight: "100vh" }} />;
  }

  const firstName = target?.contact_name?.split(" ")[0] || "";
  const category = target?.category || "";

  function trackClick() {
    fetch("/api/doberman-outreach/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "clicked" }),
    });
  }

  return (
    <div style={{ background: "#0a0f1a", color: "#e8e4dd", minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style>{styles}</style>

      {/* Hero Image */}
      <div className="dob-hero-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMAGES.hero} alt="Doberman Drawing Room" />
        <div className="dob-hero-overlay" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMAGES.logo} alt="Doberman" className="dob-hero-logo" />
      </div>

      {/* Hero */}
      <section className="dob-hero">
        <p className="dob-eyebrow">A Private Invitation</p>
        <h1 className="dob-title">
          {firstName ? `${firstName}, you're invited` : "You're invited"} to join<br />
          <span className="dob-accent">Doberman Drawing Room</span>
        </h1>
        <p className="dob-sub">
          A social club for the intellectually curious — handcrafted cocktails,
          intimate conversation, and a membership designed for professionals
          {category ? ` in ${category.toLowerCase()}` : ""} who value substance over spectacle.
        </p>
      </section>

      {/* What Is Doberman */}
      <section className="dob-section">
        <p className="dob-eyebrow">The Room</p>
        <h2 className="dob-h2">Not a nightclub. Not a bar.<br />A drawing room.</h2>
        <div className="dob-detail-grid">
          <div className="dob-detail">
            <p className="dob-detail-label">Location</p>
            <p>1025 South 1st Street<br />Las Vegas Arts District, 89101</p>
          </div>
          <div className="dob-detail">
            <p className="dob-detail-label">Hours</p>
            <p>Monday – Sunday<br />5 PM – 2 AM</p>
          </div>
          <div className="dob-detail">
            <p className="dob-detail-label">Dress</p>
            <p>Dressy casual<br />No athletic wear, no flip-flops</p>
          </div>
          <div className="dob-detail">
            <p className="dob-detail-label">Policy</p>
            <p>No phones. No cameras.<br />Be present.</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="dob-section">
        <div className="dob-gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.menu1} alt="Doberman cocktail menu" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.menu3} alt="Doberman interior" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.nibbles} alt="Doberman nibbles" />
        </div>
      </section>

      {/* Membership */}
      <section className="dob-section dob-membership">
        <p className="dob-eyebrow">Membership</p>
        <h2 className="dob-h2">Your key to the room</h2>
        <div className="dob-pricing">
          <div className="dob-price-card">
            <p className="dob-price-label">Annual Membership</p>
            <p className="dob-price">$3,000<span className="dob-price-per">/year</span></p>
            <p className="dob-price-note">+ $750 one-time initiation</p>
          </div>
        </div>
        <div className="dob-benefits">
          {BENEFITS.map((b) => (
            <div key={b.title} className="dob-benefit">
              <h4>{b.title}</h4>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programming */}
      <section className="dob-section">
        <p className="dob-eyebrow">Programming</p>
        <h2 className="dob-h2">What happens inside</h2>
        <div className="dob-prog-grid">
          {PROGRAMMING.map((p) => (
            <div key={p.name} className="dob-prog-card">
              <h4>{p.name}</h4>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Press */}
      <section className="dob-section">
        <p className="dob-eyebrow">Press</p>
        <h2 className="dob-h2">What they&apos;re saying</h2>
        <div className="dob-press">
          {PRESS.map((p) => (
            <div key={p.pub} className="dob-press-card">
              <p className="dob-press-pub">{p.pub}</p>
              <p className="dob-press-quote">&ldquo;{p.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="dob-cta">
        <h2 className="dob-h2">Apply for Membership</h2>
        <p className="dob-sub" style={{ maxWidth: 500, margin: "0 auto 32px" }}>
          Membership is by application only. Share your details and our team will
          reach out to schedule a private tour.
        </p>
        <div className="dob-cta-buttons">
          <a
            href="https://apply.dobermandtlv.com/become-a-member"
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackClick}
            className="dob-btn-primary"
          >
            Apply Now
          </a>
          <a
            href="https://www.dobermandtlv.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackClick}
            className="dob-btn-secondary"
          >
            Explore Doberman
          </a>
        </div>
        <p className="dob-footer-note">
          Doberman Drawing Room &bull; 1025 S 1st St &bull; Las Vegas Arts District
        </p>
      </section>
    </div>
  );
}

const styles = `
  .dob-hero-img { position: relative; width: 100%; height: 400px; overflow: hidden; }
  .dob-hero-img img:first-child { width: 100%; height: 100%; object-fit: cover; }
  .dob-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(12,10,8,0.3) 0%, rgba(12,10,8,0.9) 100%); }
  .dob-hero-logo { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); width: 140px; height: auto; z-index: 1; }

  .dob-gallery { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; border-radius: 12px; overflow: hidden; }
  .dob-gallery img { width: 100%; height: 280px; object-fit: cover; }

  .dob-hero { max-width: 700px; margin: 0 auto; padding: 48px 24px 60px; text-align: center; }
  .dob-eyebrow { color: #c9a84c; font-size: 11px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; font-family: -apple-system, sans-serif; }
  .dob-title { font-size: clamp(28px, 5vw, 44px); font-weight: 400; line-height: 1.2; letter-spacing: 0.01em; margin-bottom: 20px; }
  .dob-accent { color: #c9a84c; }
  .dob-sub { color: #9a958d; font-size: 16px; line-height: 1.7; font-style: italic; }
  .dob-h2 { font-size: 28px; font-weight: 400; letter-spacing: 0.01em; margin-bottom: 32px; line-height: 1.3; }

  .dob-section { max-width: 800px; margin: 0 auto; padding: 48px 24px; }

  .dob-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .dob-detail { padding: 24px; border-left: 1px solid #c9a84c30; }
  .dob-detail-label { color: #c9a84c; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-family: -apple-system, sans-serif; font-weight: 600; }
  .dob-detail p { color: #9a958d; font-size: 14px; line-height: 1.6; }

  .dob-membership { background: #0d1322; border-radius: 16px; padding: 48px; margin-top: 24px; }
  .dob-pricing { text-align: center; margin-bottom: 40px; }
  .dob-price-card { display: inline-block; }
  .dob-price-label { color: #c9a84c; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-family: -apple-system, sans-serif; }
  .dob-price { font-size: 48px; font-weight: 300; color: #e8e4dd; letter-spacing: -0.02em; }
  .dob-price-per { font-size: 16px; color: #9a958d; margin-left: 4px; }
  .dob-price-note { color: #5a5650; font-size: 13px; margin-top: 4px; font-family: -apple-system, sans-serif; }

  .dob-benefits { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .dob-benefit { padding: 20px; border: 1px solid #1a2035; border-radius: 10px; }
  .dob-benefit h4 { font-size: 15px; font-weight: 400; margin-bottom: 6px; color: #e8e4dd; }
  .dob-benefit p { color: #9a958d; font-size: 13px; line-height: 1.5; font-family: -apple-system, sans-serif; }

  .dob-prog-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .dob-prog-card { padding: 20px; border-left: 1px solid #c9a84c20; }
  .dob-prog-card h4 { font-size: 15px; font-weight: 400; color: #c9a84c; margin-bottom: 4px; }
  .dob-prog-card p { color: #9a958d; font-size: 12px; font-family: -apple-system, sans-serif; }

  .dob-press { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .dob-press-card { padding: 20px; border-bottom: 1px solid #1a2035; }
  .dob-press-pub { color: #c9a84c; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-family: -apple-system, sans-serif; font-weight: 600; }
  .dob-press-quote { color: #9a958d; font-size: 15px; line-height: 1.6; font-style: italic; }

  .dob-cta { max-width: 600px; margin: 0 auto; padding: 64px 24px 80px; text-align: center; }
  .dob-cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .dob-btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 16px 32px; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    background: #c9a84c; color: #0a0f1a; text-decoration: none; border-radius: 4px;
    font-family: -apple-system, sans-serif; transition: opacity 0.2s;
  }
  .dob-btn-primary:hover { opacity: 0.85; }
  .dob-btn-secondary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 16px 32px; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    border: 1px solid #2a3050; color: #e8e4dd; text-decoration: none; border-radius: 4px;
    font-family: -apple-system, sans-serif; transition: border-color 0.2s;
  }
  .dob-btn-secondary:hover { border-color: #c9a84c; }
  .dob-footer-note { color: #5a5650; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 48px; font-family: -apple-system, sans-serif; }

  @media (max-width: 600px) {
    .dob-detail-grid, .dob-benefits { grid-template-columns: 1fr; }
    .dob-prog-grid { grid-template-columns: 1fr 1fr; }
  }
`;
