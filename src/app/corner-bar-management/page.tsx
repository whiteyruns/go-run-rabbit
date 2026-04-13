"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ACCESS_CODE = "cbm2026";

export default function CbmHubPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("cbm-auth");
    if (stored === "true") setAuthenticated(true);
    setChecked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === ACCESS_CODE) {
      sessionStorage.setItem("cbm-auth", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  if (!authenticated) {
    return (
      <>
        <style>{loginStyles}</style>
        <div className="cbm-login">
          <div className="cbm-login-card">
            <div className="cbm-login-accent">
              <span className="cbm-login-line" />
              <span className="cbm-login-badge">Secure Access</span>
              <span className="cbm-login-line" />
            </div>
            <h1 className="cbm-login-title">Corner Bar Management</h1>
            <p className="cbm-login-sub">Strategy Hub</p>
            <form onSubmit={handleSubmit} className="cbm-login-form">
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                placeholder="Enter access code"
                autoFocus
                className="cbm-login-input"
                style={{ borderBottomColor: error ? "#ff6b98" : "rgba(174,162,255,0.2)" }}
              />
              {error && <p className="cbm-login-error">Invalid access code</p>}
              <button type="submit" className="cbm-login-btn">Enter</button>
            </form>
            <p className="cbm-login-footer">Presented by Go Run Rabbit</p>
          </div>
        </div>
      </>
    );
  }

  return <HubContent />;
}

function HubContent() {
  return (
    <div style={{ background: "#0e0e11", color: "#f3f0f4", minHeight: "100vh" }}>
      <style>{hubStyles}</style>
      <div className="cbm-hub-page">
        <div className="cbm-hub-header">
          <div className="cbm-hub-live">
            <span className="cbm-hub-dot" />
            <span>Live</span>
          </div>
          <h1 className="cbm-hub-title">Corner Bar Management</h1>
          <div className="cbm-hub-label">Strategy Hub</div>
          <p className="cbm-hub-sub">Go Run Rabbit &bull; April 2026</p>
        </div>

        {/* 01 — Strategy & Intelligence */}
        <div className="cbm-hub-group">
          <div className="cbm-hub-group-header">
            <div className="cbm-hub-group-num">01</div>
            <div>
              <h2>Strategy &amp; Intelligence</h2>
              <p>Competitive positioning, market analysis, and strategic context</p>
            </div>
          </div>
          <div className="cbm-hub-grid">
            <Link href="/corner-bar-management/competitive-landscape" className="cbm-hub-card cbm-hub-card-featured">
              <div className="cbm-hub-card-tag" style={{ color: "#00eefc", borderColor: "#00eefc" }}>Intelligence</div>
              <h3>Competitive Landscape</h3>
              <p>
                Bain-style report &mdash; 7 Vegas competitors, 8 national players, positioning matrix,
                white space analysis, threat assessments, $55.5B market overview.
              </p>
              <span className="cbm-hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* 02 — Events */}
        <div className="cbm-hub-group">
          <div className="cbm-hub-group-header">
            <div className="cbm-hub-group-num">02</div>
            <div>
              <h2>Events</h2>
              <p>Event concepts, wireframes, and sponsorship strategy</p>
            </div>
          </div>
          <div className="cbm-hub-grid cbm-hub-grid-2">
            <Link href="/corner-bar-management/feed-the-block" className="cbm-hub-card">
              <div className="cbm-hub-card-tag" style={{ color: "#aea2ff", borderColor: "#aea2ff" }}>Wireframe</div>
              <h3>Feed the Block</h3>
              <p>
                Free open-air block party series at 6th &amp; Fremont &mdash; Wynn Nightlife x CBM.
                40K+ attendance in 2025, expanding to 10 events in 2026.
              </p>
              <span className="cbm-hub-card-link">View &rarr;</span>
            </Link>
            <Link href="/dashboard/block-party" className="cbm-hub-card">
              <div className="cbm-hub-card-tag" style={{ color: "#ff6b98", borderColor: "#ff6b98" }}>Dashboard</div>
              <h3>FTB Sponsorship</h3>
              <p>
                2025 actuals, 2026 projections, confirmed sponsors, audience profile,
                social metrics, sponsorship tiers, $1.46M revenue potential.
              </p>
              <span className="cbm-hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        {/* 03 — Operations */}
        <div className="cbm-hub-group">
          <div className="cbm-hub-group-header">
            <div className="cbm-hub-group-num">03</div>
            <div>
              <h2>Operations</h2>
              <p>Executive dashboards, POS analytics, pipeline, and venue intelligence</p>
            </div>
          </div>
          <div className="cbm-hub-grid">
            <Link href="/dashboard" className="cbm-hub-card cbm-hub-card-featured">
              <div className="cbm-hub-card-tag" style={{ color: "#00eefc", borderColor: "#00eefc" }}>Live</div>
              <h3>Portfolio Intelligence</h3>
              <p>
                Live portfolio metrics &mdash; 16 venues, revenue projections, sponsorship categories,
                capture rates, and the full addressable opportunity.
              </p>
              <span className="cbm-hub-card-link">View &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="cbm-hub-footer">
          <p>Corner Bar Management &bull; East Fremont District &bull; Las Vegas</p>
        </div>
      </div>
    </div>
  );
}

const loginStyles = `
@keyframes cbmFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.cbm-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #0e0e11; }
.cbm-login-card { width: 100%; max-width: 400px; text-align: center; animation: cbmFadeIn 1s ease-out; }
.cbm-login-accent { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; }
.cbm-login-line { width: 32px; height: 1px; background: #00eefc; }
.cbm-login-badge { color: #00eefc; font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; }
.cbm-login-title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #f3f0f4; margin-bottom: 8px; }
.cbm-login-sub { color: #acaaae; font-size: 14px; margin-bottom: 48px; }
.cbm-login-form { display: flex; flex-direction: column; gap: 16px; }
.cbm-login-input {
  width: 100%; padding: 16px 24px; text-align: center; font-size: 12px; letter-spacing: 3px;
  text-transform: uppercase; font-weight: 500; background: #1a1a1f; border: none;
  border-bottom: 1px solid rgba(174,162,255,0.2); border-radius: 8px; color: #f3f0f4; outline: none;
  box-sizing: border-box;
}
.cbm-login-input::placeholder { color: #48474b; }
.cbm-login-error { color: #ff6b98; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
.cbm-login-btn {
  width: 100%; padding: 16px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
  font-weight: 700; background: linear-gradient(135deg, #7157ff, #aea2ff); color: #0e0e11;
  border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s;
}
.cbm-login-btn:hover { opacity: 0.9; }
.cbm-login-footer { color: #48474b; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 64px; }
`;

const hubStyles = `
.cbm-hub-page { max-width: 960px; margin: 0 auto; padding: 80px 40px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; }
.cbm-hub-header { text-align: center; margin-bottom: 72px; }
.cbm-hub-live { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #acaaae; font-weight: 700; }
.cbm-hub-dot { width: 6px; height: 6px; border-radius: 50%; background: #00eefc; animation: cbmPulse 2s ease-in-out infinite; }
@keyframes cbmPulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,238,252,0.4); } 50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(0,238,252,0); } }
.cbm-hub-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
.cbm-hub-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #aea2ff; font-weight: 700; margin-bottom: 8px; }
.cbm-hub-sub { font-size: 12px; color: #48474b; letter-spacing: 1.5px; }

.cbm-hub-group { margin-bottom: 56px; }
.cbm-hub-group-header { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
.cbm-hub-group-num { font-size: 32px; font-weight: 200; color: rgba(174,162,255,0.3); line-height: 1; min-width: 36px; font-variant-numeric: tabular-nums; }
.cbm-hub-group-header h2 { font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
.cbm-hub-group-header p { font-size: 12px; color: #48474b; letter-spacing: 1px; }

.cbm-hub-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: rgba(255,255,255,0.04); border-radius: 12px; overflow: hidden; }
.cbm-hub-grid-2 { grid-template-columns: 1fr 1fr; }
.cbm-hub-card {
  background: #1a1a1f; padding: 32px; display: flex; flex-direction: column;
  text-decoration: none; color: #f3f0f4; transition: background 0.4s cubic-bezier(0.16,1,0.3,1);
  position: relative; cursor: pointer;
}
.cbm-hub-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, #7157ff, #00eefc); transform: scaleX(0); transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
}
.cbm-hub-card:hover { background: #1f1f23; }
.cbm-hub-card:hover::before { transform: scaleX(1); }
.cbm-hub-card-tag {
  font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 700;
  border: 1px solid; padding: 4px 12px; align-self: flex-start; margin-bottom: 16px; border-radius: 4px;
}
.cbm-hub-card h3 {
  font-size: 20px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px;
}
.cbm-hub-card p { font-size: 13px; color: #acaaae; line-height: 1.6; flex: 1; margin-bottom: 20px; }
.cbm-hub-card-link { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #00eefc; font-weight: 700; }

.cbm-hub-footer { margin-top: 60px; text-align: center; }
.cbm-hub-footer p { font-size: 10px; color: #48474b; letter-spacing: 2px; text-transform: uppercase; }

@media (max-width: 600px) {
  .cbm-hub-grid-2 { grid-template-columns: 1fr; }
  .cbm-hub-page { padding: 40px 20px; }
  .cbm-hub-group-num { display: none; }
}
`;
