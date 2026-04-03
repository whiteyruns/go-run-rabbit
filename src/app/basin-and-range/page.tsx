"use client";

import { useState } from "react";
import BasinRangeContent from "./components/Content";

const ACCESS_CODE = "basinrange100";

export default function BasinAndRangePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  // Check sessionStorage on mount
  if (typeof window !== "undefined" && !authenticated) {
    const stored = sessionStorage.getItem("br-auth");
    if (stored === "true") {
      setAuthenticated(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("br-auth", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (authenticated) {
    return <BasinRangeContent />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "#12110f",
        color: "#e6e1e1",
        fontFamily: "var(--font-epilogue), system-ui, sans-serif",
      }}
    >
      <div className="w-full max-w-md text-center">
        <h1
          className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2"
          style={{ fontFamily: "var(--font-epilogue), system-ui, sans-serif" }}
        >
          Basin
          <br />
          <span style={{ color: "#e5c276" }}>&amp; Range</span>
        </h1>
        <p
          className="uppercase tracking-[0.3em] text-sm mb-12"
          style={{ color: "#9a9182" }}
        >
          100 Mile Desert Ultra Concept
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
            className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest font-bold"
            style={{
              background: "#252219",
              border: "none",
              borderBottom: `2px solid ${error ? "#ff6b6b" : "#584e3e"}`,
              color: "#e6e1e1",
              outline: "none",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
            onFocus={(e) => {
              if (!error)
                e.currentTarget.style.borderBottomColor = "#e5c276";
            }}
            onBlur={(e) => {
              if (!error)
                e.currentTarget.style.borderBottomColor = "#584e3e";
            }}
            autoFocus
          />
          {error && (
            <p className="text-xs tracking-widest uppercase" style={{ color: "#ff6b6b" }}>
              Invalid access code
            </p>
          )}
          <button
            type="submit"
            className="w-full py-4 text-sm uppercase tracking-widest font-black transition-all"
            style={{
              background: "#e5c276",
              color: "#3f2e00",
            }}
          >
            Enter
          </button>
        </form>

        <p
          className="mt-12 text-xs tracking-[0.2em] uppercase"
          style={{ color: "#584e3e" }}
        >
          A Go Run Rabbit concept
        </p>
      </div>
    </div>
  );
}
