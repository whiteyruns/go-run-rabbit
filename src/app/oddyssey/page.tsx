"use client";

/**
 * Oddyssey — brand wireframe homepage.
 *
 * Renders the full multi-view wireframe (Home / Events / Event Detail
 * / Private Events) via the shared OddysseyContent component. From
 * the home view, the "Two Experiences" section's Manor + Noir cards
 * link out to the polished flagship builds at /oddyssey-manor/manor
 * and /oddyssey-manor/noir respectively.
 *
 * Same od-auth sessionStorage gate as the rest of the wireframe tree.
 * The old /oddyssey-manor/wireframes URL redirects up to here so
 * there's one canonical entry point.
 */

import { useState } from "react";
import OddysseyContent from "../oddyssey-manor/components/Content";

const ACCESS_CODE = "oddyssey2026";

export default function OddysseyHome() {
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

  if (authenticated) {
    return <OddysseyContent />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#060606", color: "#e8e4dd", fontFamily: "var(--sans)" }}
    >
      <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
        <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
        <p className="uppercase tracking-[0.3em] text-xs mb-12" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: "4px" }}>
          Brand Wireframe
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter access code"
            autoFocus
            className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-medium"
            style={{
              background: "#0d0d0d", border: "none",
              borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`,
              color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px",
            }}
          />
          {error && <p className="text-xs tracking-widest uppercase" style={{ color: "#c0392b" }}>Invalid access code</p>}
          <button
            type="submit"
            className="w-full py-4 text-xs uppercase tracking-widest font-medium"
            style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}
          >
            Enter
          </button>
        </form>
        <p className="mt-16 text-xs uppercase" style={{ color: "#5a5650", letterSpacing: "2px" }}>
          Presented by Go Run Rabbit
        </p>
      </div>
    </div>
  );
}
