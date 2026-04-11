"use client";

import { useState, useEffect, type ReactNode } from "react";

const ACCESS_CODE = "feedtheblock";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("ftb-auth") === "true") setAuthed(true);
  }, []);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("ftb-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0e0e0e" }}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 px-6">
        <img src="/feed-the-block/img/logo-nav.png" alt="Feed The Block" className="h-16 mb-2" />
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Epilogue', sans-serif", color: "#ff68a7" }}
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
            fontFamily: "'Epilogue', sans-serif",
            borderColor: error ? "#ff4444" : focused ? "#ffd709" : "#494847",
            color: "#ffffff",
          }}
        />
        <button
          type="submit"
          className="px-12 py-3 text-xs uppercase tracking-widest font-bold transition-all hover:brightness-110 active:scale-95 rounded-full"
          style={{
            fontFamily: "'Epilogue', sans-serif",
            background: "linear-gradient(to right, #ffd709, #fc0d90)",
            color: "#0e0e0e",
          }}
        >
          Enter
        </button>
        {error && (
          <p className="text-xs uppercase tracking-widest" style={{ color: "#ff4444", fontFamily: "'Epilogue', sans-serif" }}>
            Invalid access code
          </p>
        )}
      </form>
    </div>
  );
}
