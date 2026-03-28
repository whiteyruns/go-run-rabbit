"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    if (data.user.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/client/overview");
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#aea2ff]/5 blur-[150px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-[#00eefc]/5 blur-[150px] rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-[#00eefc]" />
            <span className="text-[#00eefc] text-[10px] font-bold uppercase tracking-[0.2em]">Secure Access</span>
            <span className="w-8 h-[1px] bg-[#00eefc]" />
          </div>
          <h1 className="text-[#f3f0f4] text-2xl font-extrabold tracking-tight">CBM Dashboards</h1>
          <p className="text-[#acaaae] text-sm mt-2">Sponsorship Intelligence Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1f1f23] rounded-xl p-8 space-y-5">
          <div>
            <label className="text-[#acaaae] text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131316] border-0 border-b border-[#48474b]/30 rounded-lg px-4 py-3 text-[#f3f0f4] text-sm focus:outline-none focus:border-[#aea2ff] focus:border-b-2 transition-all placeholder:text-[#48474b]"
              placeholder="you@gorunrabbit.com"
              required
            />
          </div>
          <div>
            <label className="text-[#acaaae] text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131316] border-0 border-b border-[#48474b]/30 rounded-lg px-4 py-3 text-[#f3f0f4] text-sm focus:outline-none focus:border-[#aea2ff] focus:border-b-2 transition-all placeholder:text-[#48474b]"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="text-[#ff6b98] text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#7157ff] to-[#aea2ff] text-[#1f0078] font-bold py-3 rounded-md hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all text-sm tracking-tight"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-[#48474b] text-[10px] text-center mt-6 uppercase tracking-[0.15em] font-bold">
          Go Run Rabbit LLC &middot; Technical Auteur
        </p>
      </div>
    </div>
  );
}
