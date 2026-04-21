"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type RunOption = {
  slug: string;
  label: string;
  fullName: string;
};

export default function RunsDropdown({ runs }: { runs: RunOption[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on any route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeSlug = runs.find((r) =>
    pathname?.startsWith(`/forest-house/admin/run-of-show/${r.slug}`),
  )?.slug;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] transition-colors ${
          activeSlug
            ? "text-fh-accent"
            : "text-fh-text-secondary hover:text-fh-text"
        }`}
      >
        Runs
        <span
          aria-hidden
          className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 min-w-[220px] bg-fh-card border border-fh-border py-2 shadow-2xl shadow-black/60"
        >
          {runs.map((r) => {
            const active = r.slug === activeSlug;
            return (
              <Link
                key={r.slug}
                href={`/forest-house/admin/run-of-show/${r.slug}`}
                role="menuitem"
                className={`block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                  active
                    ? "text-fh-accent bg-fh-accent/5"
                    : "text-fh-text-secondary hover:text-fh-text hover:bg-fh-bg/60"
                }`}
                onClick={() => setOpen(false)}
              >
                {r.fullName}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
