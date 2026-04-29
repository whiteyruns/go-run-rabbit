"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RosGateForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/forest-house/run-of-show/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Access failed");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-12 pt-14 sm:pt-28 pb-16 sm:pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-5 sm:mb-6">
        [ Run of Show · {slug.replace(/-/g, " ")} ]
      </p>
      <h1 className="text-[clamp(2.25rem,7vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.03em] mb-5 sm:mb-6">
        Crew
        <br />
        Access
      </h1>
      <p className="max-w-md text-base sm:text-[17px] font-light leading-[1.7] text-fh-text-secondary mb-10 sm:mb-14">
        Enter the event access code to view the run of show.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm">
        <div>
          <label
            htmlFor="fh-ros-pw"
            className="block text-[10px] uppercase tracking-[0.3em] text-fh-text/60 mb-2"
          >
            Access Code
          </label>
          <input
            id="fh-ros-pw"
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
          className="inline-flex items-center justify-center gap-3 bg-fh-accent text-fh-bg px-8 py-3.5 text-sm font-bold uppercase tracking-[0.25em] hover:brightness-110 active:scale-[0.98] transition-all disabled:bg-fh-text/10 disabled:text-fh-text/30 disabled:cursor-not-allowed"
        >
          {submitting ? "Verifying…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
