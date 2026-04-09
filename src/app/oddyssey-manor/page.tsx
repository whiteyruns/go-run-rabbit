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

const docs = [
  {
    title: "Website Wireframes",
    desc: "Homepage, event calendar, event detail, and private events — built with Oddyssey brand assets.",
    href: "/oddyssey-manor/wireframes",
    tag: "Interactive",
    tagColor: "#c9a84c",
  },
  {
    title: "Website Optimization Audit",
    desc: "10 findings, 8 recommendations, homepage structure, and expected impact analysis.",
    href: "/oddyssey-manor/audit",
    tag: "Report",
    tagColor: "#9a958d",
  },
  {
    title: "Golden Hour Proposal",
    desc: "Brand partnership & traffic catalyst program — executive summary, structure, value exchange, pilot plan.",
    href: "/oddyssey-manor/golden-hour",
    tag: "Proposal",
    tagColor: "#d4a574",
  },
  {
    title: "Competitive Landscape",
    desc: "Direct competitors, market context, AREA15 ecosystem, positioning map, white space analysis.",
    href: "/oddyssey-manor/competitive-landscape",
    tag: "Intelligence",
    tagColor: "#3498db",
  },
  {
    title: "Golden Hour Marketing Kit",
    desc: "Social media posts, story sequences, email blasts, ticket page copy, TikTok concepts, and content calendar.",
    href: "/oddyssey-manor/golden-hour-kit",
    tag: "Marketing",
    tagColor: "#d4a574",
  },
];

function HubContent() {
  return (
    <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh" }}>
      <style>{hubStyles}</style>
      <div className="hub-page">
        <div className="hub-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="hub-logo" />
          <div className="hub-label">Client Portal</div>
          <p className="hub-sub">Prepared by Go Run Rabbit &bull; April 2026</p>
        </div>

        <div className="hub-grid">
          {docs.map((doc) => (
            <Link key={doc.href} href={doc.href} className="hub-card">
              <div className="hub-card-tag" style={{ color: doc.tagColor, borderColor: doc.tagColor }}>{doc.tag}</div>
              <h3>{doc.title}</h3>
              <p>{doc.desc}</p>
              <span className="hub-card-link">View &rarr;</span>
            </Link>
          ))}
        </div>

        <div className="hub-footer">
          <p>Oddyssey Manor & Noir &bull; AREA15 &bull; Las Vegas</p>
        </div>
      </div>
    </div>
  );
}

const hubStyles = `
.hub-page { max-width: 900px; margin: 0 auto; padding: 80px 40px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; }
.hub-header { text-align: center; margin-bottom: 60px; }
.hub-logo { height: 48px; width: auto; margin: 0 auto 24px; display: block; }
.hub-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 8px; }
.hub-sub { font-size: 12px; color: #5a5650; letter-spacing: 1.5px; }

.hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.hub-card {
  background: #060606; padding: 36px; display: flex; flex-direction: column;
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

@media (max-width: 600px) { .hub-grid { grid-template-columns: 1fr; } .hub-page { padding: 40px 20px; } }
`;
