"use client";

import { useState, useEffect, type ReactNode } from "react";

const ACCESS_CODE = "trk2026";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("tsp-trk-auth") === "true") setAuthed(true);
  }, []);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase().trim() === ACCESS_CODE.toUpperCase()) {
      sessionStorage.setItem("tsp-trk-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div className="gate">
      <div className="gate-bg" />
      <div className="gate-inner">
        <img
          src="/tsp-trk/tsp_logo-white.png"
          alt="The Speed Project"
          className="gate-logo"
        />
        <div className="eyebrow">
          TSP TRK <span className="dot" /> 2026 <span className="dot" /> Team Portal
        </div>
        <h1 className="display gate-title">
          Restricted.<span>Team Only.</span>
        </h1>
        <p className="gate-desc">
          This portal is for invited team members and crew. Enter the access key to continue.
        </p>
        <form onSubmit={handleSubmit} className="gate-form">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access Key"
            autoFocus
            aria-label="Access Key"
            className="gate-input"
          />
          <button type="submit" className="gate-btn">
            Enter
          </button>
        </form>
        <div className={`gate-err ${error ? "show" : ""}`}>
          Invalid Key. Try Again.
        </div>
      </div>
      <div className="gate-footnote">Internal &middot; Not For Public Distribution</div>
    </div>
  );
}
