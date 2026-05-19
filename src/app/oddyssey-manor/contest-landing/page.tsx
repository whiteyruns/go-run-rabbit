"use client";

/**
 * Contest landing page — the "enter to win" destination linked from
 * the ContestBand on /oddyssey. Mirrors the gate pattern used on
 * Manor / Noir / Private / Event detail (sessionStorage od-auth) so a
 * visitor who's already in the design preview can walk straight in.
 *
 * Form intentionally lands on a success-state screen for now. Wiring
 * to a real endpoint (Resend mail + log / spreadsheet) is a separate
 * decision — flagged in handleEntry.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { OddysseyTopNav } from "@/components/oddyssey/OddysseyTopNav";
import { FollowBand } from "@/components/oddyssey/FollowBand";

const ACCESS_CODE = "oddyssey2026";

export default function ContestLandingPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("od-auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  function handleGate(e: React.FormEvent) {
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
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#060606", color: "#e8e4dd", fontFamily: "var(--sans)" }}
      >
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="uppercase text-xs mb-2" style={{ color: "#c9a84c", letterSpacing: "4px", fontWeight: 500 }}>Contest · Free Entry</p>
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>Enter Access Code</p>
          <form onSubmit={handleGate} className="space-y-4">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code"
              autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-medium"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px" }}
            />
            {error && <p className="text-xs tracking-widest uppercase" style={{ color: "#c0392b" }}>Invalid access code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase tracking-widest font-medium" style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}>Enter</button>
          </form>
          <p className="mt-16 text-xs uppercase" style={{ color: "#5a5650", letterSpacing: "2px" }}>Presented by Go Run Rabbit</p>
        </div>
      </div>
    );
  }

  return <ContestContent />;
}

interface EntryFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram: string;
}

function ContestContent() {
  const [submitted, setSubmitted] = useState(false);
  const [entry, setEntry] = useState<EntryFields>({
    firstName: "", lastName: "", email: "", phone: "", instagram: "",
  });

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleEntry(e: React.FormEvent) {
    e.preventDefault();
    // TODO wire to a real endpoint. Options:
    //   1. POST /api/oddyssey/contest-entry → Resend mail to ops@ + log
    //   2. Embed an external form (Tally / Typeform / Google Forms)
    // For now we just transition to the success screen so the UX is
    // complete end-to-end and the team can preview the full flow.
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log("[contest-entry] not yet wired to endpoint:", entry);
    }
    setSubmitted(true);
  }

  // Drawing closes at the end of the current month. Easier to maintain
  // than a hardcoded date — winners are picked the 1st of the next.
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const deadlineStr = lastDayOfMonth.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div style={{ background: "#060606", color: "#e8e4dd", minHeight: "100vh", fontFamily: "var(--sans)" }}>
      <OddysseyTopNav
        active="home"
        ctaLabel="Enter to Win"
        ctaAction={() => scrollToId("cl-enter")}
      />
      <style>{contestStyles}</style>

      {/* ═══ HERO ═══ */}
      <section className="cl-hero">
        <div className="cl-hero-glow" />
        <div className="cl-hero-inner">
          <div className="cl-eyebrow">Monthly Drawing · Free Entry</div>
          <h1 className="cl-hero-title">
            Win a Night<br />at Oddyssey
          </h1>
          <p className="cl-hero-tagline">Manor + Noir for you and a plus-one.</p>
          <p className="cl-hero-body">
            Follow, tag, and RSVP. One winner each month takes home a Manor dinner
            and a Noir nightcap — the full Oddyssey weekend on us. AREA15, Las Vegas.
          </p>
          <div className="cl-hero-actions">
            <a className="cl-btn-primary" onClick={() => scrollToId("cl-enter")}>Enter to Win</a>
            <span className="cl-hero-deadline">Closes {deadlineStr} · Winner notified by email</span>
          </div>
        </div>
      </section>

      {/* ═══ STEPS ═══ */}
      <section className="cl-section cl-steps-section">
        <div className="cl-section-head">
          <div className="cl-label">How to Enter</div>
          <h2 className="cl-heading-2">Three Steps</h2>
          <p className="cl-section-sub">Each step is required. We verify entries before the drawing.</p>
        </div>
        <div className="cl-steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.title} className="cl-step">
              <div className="cl-step-num">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="cl-step-title">{s.title}</h3>
              <p className="cl-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FORM ═══ */}
      <section id="cl-enter" className="cl-section cl-form-section">
        <div className="cl-section-head">
          <div className="cl-label">Step 3 · Register</div>
          <h2 className="cl-heading-2">Your Entry</h2>
          <p className="cl-section-sub">
            Real details only. Winners are picked the 1st of each month and
            notified by email — make sure ours doesn&apos;t end up in spam.
          </p>
        </div>

        {submitted ? (
          <div className="cl-success">
            <div className="cl-success-mark">✓</div>
            <h3 className="cl-success-title">You&apos;re in.</h3>
            <p className="cl-success-body">
              Entry received. Drawing closes {deadlineStr}; winners notified by email.
              Make sure you&apos;ve followed @oddysseylv and tagged a friend on the
              contest post — both are verified before we pick.
            </p>
            <Link href="/oddyssey" className="cl-btn-outline">Back to Oddyssey</Link>
          </div>
        ) : (
          <form className="cl-form" onSubmit={handleEntry}>
            <div className="cl-form-row">
              <label className="cl-field">
                <span>First Name</span>
                <input
                  type="text" required
                  value={entry.firstName}
                  onChange={(e) => setEntry({ ...entry, firstName: e.target.value })}
                  placeholder="First"
                />
              </label>
              <label className="cl-field">
                <span>Last Name</span>
                <input
                  type="text" required
                  value={entry.lastName}
                  onChange={(e) => setEntry({ ...entry, lastName: e.target.value })}
                  placeholder="Last"
                />
              </label>
            </div>
            <label className="cl-field">
              <span>Email</span>
              <input
                type="email" required
                value={entry.email}
                onChange={(e) => setEntry({ ...entry, email: e.target.value })}
                placeholder="you@email.com"
              />
            </label>
            <div className="cl-form-row">
              <label className="cl-field">
                <span>Phone (optional)</span>
                <input
                  type="tel"
                  value={entry.phone}
                  onChange={(e) => setEntry({ ...entry, phone: e.target.value })}
                  placeholder="+1 (702) ..."
                />
              </label>
              <label className="cl-field">
                <span>Instagram Handle</span>
                <input
                  type="text" required
                  value={entry.instagram}
                  onChange={(e) => setEntry({ ...entry, instagram: e.target.value })}
                  placeholder="@username"
                />
              </label>
            </div>
            <button type="submit" className="cl-submit">Submit Entry</button>
            <p className="cl-consent">
              By entering, you agree to receive email and SMS communications from
              Oddyssey at AREA15. Unsubscribe anytime. No purchase necessary. 21+ only.
              One entry per person per month. See the rules below.
            </p>
          </form>
        )}
      </section>

      {/* ═══ PRIZE ═══ */}
      <section className="cl-section cl-prizes-section">
        <div className="cl-section-head">
          <div className="cl-label">What You Win</div>
          <h2 className="cl-heading-2">The Full Weekend</h2>
          <p className="cl-section-sub">One winner. One plus-one. Two unforgettable nights at Oddyssey.</p>
        </div>
        <div className="cl-prizes-grid">
          <div className="cl-prize-card">
            <div className="cl-prize-img" style={{ backgroundImage: "url('/oddyssey/dinner-guest.jpg')" }} />
            <div className="cl-prize-overlay" />
            <div className="cl-prize-content">
              <div className="cl-prize-eyebrow">Night One · Manor</div>
              <h3 className="cl-prize-title">Dinner Guest Tier</h3>
              <p className="cl-prize-body">
                The full immersive theatrical dining show — Thursday through Sunday,
                your choice. Five-cocktail tasting, chef-curated bites, and Noir access
                after close.
              </p>
            </div>
          </div>
          <div className="cl-prize-card">
            <div className="cl-prize-img" style={{ backgroundImage: "url('/oddyssey/voyeur-img2.jpg')" }} />
            <div className="cl-prize-overlay" />
            <div className="cl-prize-content">
              <div className="cl-prize-eyebrow">Night Two · Noir</div>
              <h3 className="cl-prize-title">Liquid Gold or Saturday Night</h3>
              <p className="cl-prize-body">
                Friday Liquid Gold open bar + DJ set, or Saturday late-night Oddyssey
                Noir. Doors at 10 PM. Choose the night that fits your weekend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RULES ═══ */}
      <section className="cl-section cl-rules-section">
        <div className="cl-section-head">
          <div className="cl-label">The Fine Print</div>
          <h2 className="cl-heading-2">Rules &amp; Eligibility</h2>
        </div>
        <ul className="cl-rules">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <FollowBand
        instagram="oddysseylv"
        instagramSecondary="oddyssey.noir"
        tiktok="oddysseylv"
        accent="#c9a84c"
        blurb="Followers + taggers enter the monthly drawing. The contest post drops on the 1st."
      />

      <footer className="cl-foot">
        <div>Oddyssey · AREA15 Las Vegas · 3202 W Desert Inn Rd</div>
        <Link href="/oddyssey" className="cl-foot-link">&larr; Back to Oddyssey</Link>
      </footer>
    </div>
  );
}

const STEPS = [
  {
    title: "Follow @oddysseylv",
    desc: "Follow Oddyssey on Instagram. We verify follows at the time of the drawing.",
  },
  {
    title: "Tag a Friend",
    desc: "Tag the friend you'd bring on the official contest post. Each tag expands our reach.",
  },
  {
    title: "RSVP Below",
    desc: "Complete the form with your real details. This is the entry of record.",
  },
];

const RULES = [
  "Open to Las Vegas residents 21+ with valid government ID.",
  "One entry per person per month. Duplicate entries are disqualified.",
  "Must be following @oddysseylv at the time of the drawing.",
  "Must have tagged at least one friend on the official monthly contest post.",
  "Prize is non-transferable, has no cash value, and must be redeemed within 90 days.",
  "Winner picked the 1st of the following month and notified by email — check your spam.",
  "If the winner does not respond within 7 days, a new winner is drawn.",
  "Void where prohibited. Oddyssey at AREA15 reserves the right to verify eligibility.",
];

const contestStyles = `
.cl-hero {
  position: relative; padding: clamp(120px, 18vw, 200px) clamp(20px, 6vw, 80px) clamp(72px, 10vw, 120px);
  overflow: hidden;
}
.cl-hero-glow {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse at 30% 80%, rgba(201,168,76,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(230,126,34,0.10) 0%, transparent 60%);
}
.cl-hero-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; text-align: center; }
.cl-eyebrow {
  font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500;
  letter-spacing: 0.32em; text-transform: uppercase; color: #c9a84c;
  margin-bottom: 18px;
}
.cl-hero-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(44px, 8vw, 96px); font-weight: 300;
  letter-spacing: 0.04em; line-height: 1.0; margin: 0;
  color: #e8e4dd;
}
.cl-hero-tagline {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-size: clamp(20px, 2.4vw, 26px);
  color: rgba(232,228,221,0.82); margin: 22px 0 18px;
}
.cl-hero-body {
  font-size: 15px; line-height: 1.8; color: #c9c4bd;
  max-width: 580px; margin: 0 auto 32px; letter-spacing: 0.3px;
}
.cl-hero-actions {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.cl-btn-primary {
  display: inline-block; padding: 16px 36px; background: #c9a84c; color: #060606;
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
  letter-spacing: 0.28em; text-transform: uppercase; text-decoration: none; cursor: pointer;
  transition: filter 0.3s, transform 0.3s;
}
.cl-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
.cl-btn-outline {
  display: inline-block; padding: 14px 28px; background: transparent;
  border: 1px solid rgba(232,228,221,0.3); color: #e8e4dd; text-decoration: none;
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
  letter-spacing: 0.28em; text-transform: uppercase;
  transition: border-color 0.3s, color 0.3s;
}
.cl-btn-outline:hover { border-color: #e8e4dd; }
.cl-hero-deadline {
  font-family: 'Consolas', monospace; font-size: 11px;
  letter-spacing: 0.22em; text-transform: uppercase; color: #9a958d;
}

.cl-section {
  padding: clamp(64px, 9vw, 120px) clamp(20px, 6vw, 80px);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.cl-section-head { text-align: center; max-width: 720px; margin: 0 auto 48px; }
.cl-label {
  font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500;
  letter-spacing: 0.32em; text-transform: uppercase; color: #c9a84c;
  margin-bottom: 14px;
}
.cl-heading-2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 4vw, 44px); font-weight: 300;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #e8e4dd; margin: 0 0 16px;
}
.cl-section-sub {
  font-size: 14px; line-height: 1.7; color: #9a958d;
  letter-spacing: 0.3px; margin: 0;
}

/* Steps */
.cl-steps-section { background: #0a0a0a; }
.cl-steps-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: rgba(255,255,255,0.06); max-width: 1100px; margin: 0 auto;
}
.cl-step {
  background: #0a0a0a; padding: 40px 32px; text-align: center;
}
.cl-step-num {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 48px; font-weight: 300; font-style: italic;
  color: #c9a84c; line-height: 1; margin-bottom: 18px;
}
.cl-step-title {
  font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
  letter-spacing: 0.28em; text-transform: uppercase; color: #e8e4dd;
  margin: 0 0 10px;
}
.cl-step-desc {
  font-size: 13px; line-height: 1.7; color: #9a958d;
  letter-spacing: 0.3px; margin: 0;
}
@media (max-width: 760px) { .cl-steps-grid { grid-template-columns: 1fr; } }

/* Form */
.cl-form-section { background: #060606; }
.cl-form {
  max-width: 640px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 28px;
}
.cl-form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
}
.cl-field { display: flex; flex-direction: column; gap: 10px; }
.cl-field > span {
  font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500;
  letter-spacing: 0.28em; text-transform: uppercase; color: #c9a84c;
}
.cl-field input {
  width: 100%; background: transparent; border: none;
  border-bottom: 1px solid rgba(201,168,76,0.25);
  padding: 12px 0; font-family: 'Inter', sans-serif; font-size: 14px;
  font-weight: 300; color: #e8e4dd; outline: none;
  transition: border-color 0.3s;
}
.cl-field input:focus { border-color: #c9a84c; }
.cl-field input::placeholder { color: #5a5650; }
.cl-submit {
  margin-top: 12px; padding: 18px;
  background: #c9a84c; color: #060606; border: none;
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
  letter-spacing: 0.28em; text-transform: uppercase; cursor: pointer;
  transition: filter 0.3s;
}
.cl-submit:hover { filter: brightness(1.08); }
.cl-consent {
  font-size: 11px; line-height: 1.7; color: #5a5650;
  letter-spacing: 0.3px; text-align: center; margin: 0;
}
@media (max-width: 600px) { .cl-form-row { grid-template-columns: 1fr; } }

/* Success */
.cl-success {
  max-width: 560px; margin: 0 auto; text-align: center;
  padding: 60px 32px; background: #0a0a0a;
  border: 1px solid rgba(201,168,76,0.18);
}
.cl-success-mark {
  width: 56px; height: 56px; margin: 0 auto 24px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #c9a84c; color: #c9a84c;
  font-family: 'Cormorant Garamond', serif; font-size: 28px;
}
.cl-success-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 36px; font-weight: 300; letter-spacing: 0.04em;
  color: #e8e4dd; margin: 0 0 16px;
}
.cl-success-body {
  font-size: 14px; line-height: 1.8; color: #9a958d;
  max-width: 440px; margin: 0 auto 28px;
}

/* Prizes */
.cl-prizes-section { background: #0a0a0a; }
.cl-prizes-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  max-width: 1100px; margin: 0 auto;
}
.cl-prize-card {
  position: relative; aspect-ratio: 4 / 5; overflow: hidden;
  background: #060606; border: 1px solid rgba(255,255,255,0.06);
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.4s;
}
.cl-prize-card:hover { transform: translateY(-3px); border-color: rgba(201,168,76,0.25); }
.cl-prize-img {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  filter: brightness(0.7) saturate(0.92);
  transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.5s;
}
.cl-prize-card:hover .cl-prize-img { transform: scale(1.04); filter: brightness(0.8) saturate(1); }
.cl-prize-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(6,6,6,0.95) 0%, rgba(6,6,6,0.5) 50%, transparent 90%);
}
.cl-prize-content {
  position: absolute; bottom: 36px; left: 36px; right: 36px; z-index: 1;
}
.cl-prize-eyebrow {
  font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500;
  letter-spacing: 0.3em; text-transform: uppercase; color: #c9a84c;
  margin-bottom: 10px;
}
.cl-prize-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(24px, 3vw, 32px); font-weight: 400;
  letter-spacing: 0.04em; color: #e8e4dd; margin: 0 0 12px;
}
.cl-prize-body {
  font-size: 13px; line-height: 1.65; color: rgba(232,228,221,0.78);
  margin: 0;
}
@media (max-width: 760px) { .cl-prizes-grid { grid-template-columns: 1fr; } }

/* Rules */
.cl-rules-section { background: #060606; }
.cl-rules {
  list-style: none; padding: 0; margin: 0; max-width: 720px;
  margin-left: auto; margin-right: auto;
}
.cl-rules li {
  font-size: 13px; line-height: 1.7; color: #9a958d;
  letter-spacing: 0.3px; padding: 14px 0 14px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative;
}
.cl-rules li::before {
  content: ''; position: absolute; left: 0; top: 22px;
  width: 6px; height: 6px; border: 1px solid #c9a84c;
  transform: rotate(45deg);
}
.cl-rules li:last-child { border-bottom: none; }

/* Footer */
.cl-foot {
  padding: 32px clamp(20px, 6vw, 80px);
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: #5a5650;
}
.cl-foot-link { color: #5a5650; text-decoration: none; }
.cl-foot-link:hover { color: #c9a84c; }
`;
