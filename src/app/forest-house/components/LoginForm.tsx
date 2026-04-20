"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/forest-house/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Login failed");
        setSubmitting(false);
        return;
      }
      router.push("/forest-house/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm">
      <div>
        <label
          htmlFor="fh-admin-pw"
          className="block text-[10px] uppercase tracking-[0.3em] text-fh-text/60 mb-2"
        >
          Admin Password
        </label>
        <input
          id="fh-admin-pw"
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="w-full bg-fh-bg border border-fh-border focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text px-3 py-2.5 text-sm tracking-wider"
        />
      </div>
      {error && (
        <p className="text-xs text-fh-ember" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="inline-flex items-center gap-3 bg-fh-accent text-fh-bg px-8 py-3 text-sm font-bold uppercase tracking-[0.25em] hover:brightness-110 active:scale-[0.98] transition-all disabled:bg-fh-text/10 disabled:text-fh-text/30 disabled:cursor-not-allowed"
      >
        {submitting ? "Verifying…" : "Enter"}
      </button>
    </form>
  );
}
