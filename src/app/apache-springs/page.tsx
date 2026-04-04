"use client";

import { useState } from "react";
import ApacheSpringsContent from "./components/Content";

const ACCESS_CODE = "apacheultra";

export default function ApacheSpringsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (typeof window !== "undefined" && !authenticated) {
    const stored = sessionStorage.getItem("as-auth");
    if (stored === "true") {
      setAuthenticated(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("as-auth", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (authenticated) {
    return <ApacheSpringsContent />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "#161310",
        color: "#e9e1dc",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="w-full max-w-md text-center">
        <h1
          className="text-5xl md:text-6xl font-light italic mb-1"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#ffb688",
          }}
        >
          Apache Springs
        </h1>
        <p
          className="uppercase tracking-[0.3em] text-sm mb-12"
          style={{ color: "#a18d81" }}
        >
          Ultramarathon and Retreat
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Enter access code"
            className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${error ? "#ff6b6b" : "#54433a"}`,
              color: "#e9e1dc",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              if (!error)
                e.currentTarget.style.borderBottomColor = "#ffb688";
            }}
            onBlur={(e) => {
              if (!error)
                e.currentTarget.style.borderBottomColor = "#54433a";
            }}
            autoFocus
          />
          {error && (
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "#ff6b6b" }}
            >
              Invalid access code
            </p>
          )}
          <button
            type="submit"
            className="w-full py-4 text-sm uppercase tracking-widest font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #ffb688, #ce7c44)",
              color: "#512400",
              borderRadius: "2px",
            }}
          >
            Enter
          </button>
        </form>

        <p
          className="mt-12 text-xs tracking-[0.2em] uppercase"
          style={{ color: "#54433a" }}
        >
          A Go Run Rabbit Experience
        </p>
      </div>
    </div>
  );
}
