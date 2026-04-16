"use client";

import { useState, useEffect, type ReactNode } from "react";

const ACCESS_CODE = "canyonexp";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("ce-auth") === "true") setAuthed(true);
  }, []);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("ce-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#141312" }}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 px-6">
        <h1
          className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#e6e1df]"
          style={{ fontFamily: "'Newsreader', serif" }}
        >
          Apache Springs Retreat
        </h1>
        <p
          className="text-xs uppercase tracking-[0.3em] text-[#f5bd64]"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          Access Required
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter access code"
          autoFocus
          className="w-72 bg-transparent border-b-2 py-3 text-center text-lg tracking-widest outline-none transition-colors"
          style={{
            fontFamily: "'Space Grotesk', monospace",
            borderColor: error ? "#ff4444" : focused ? "#f7600c" : "#5a4137",
            color: "#e6e1df",
          }}
        />
        <button
          type="submit"
          className="px-12 py-3 text-xs uppercase tracking-widest font-bold transition-all hover:brightness-110 active:scale-95"
          style={{
            fontFamily: "'Space Grotesk', monospace",
            background: "#f7600c",
            color: "#370e00",
          }}
        >
          Enter
        </button>
        {error && (
          <p className="text-xs uppercase tracking-widest" style={{ color: "#ff4444", fontFamily: "'Space Grotesk', monospace" }}>
            Invalid access code
          </p>
        )}
      </form>
    </div>
  );
}
