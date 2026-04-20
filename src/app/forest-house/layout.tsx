import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forest House Crew — May 12–18, 2026",
  description:
    "Crew registration and staffing for the Forest House art-car deployment, May 12–18, 2026.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

export default function ForestHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fh-bg text-fh-text font-fh antialiased">
      <header className="sticky top-0 z-20 bg-fh-bg/90 backdrop-blur border-b border-fh-text/10">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link
            href="/forest-house"
            className="text-sm font-semibold uppercase tracking-[0.3em]"
          >
            Forest <span className="text-fh-accent">House</span>
          </Link>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em]">
            <Link
              href="/forest-house/register"
              className="hover:text-fh-accent transition-colors"
            >
              Register
            </Link>
            <Link
              href="/forest-house/admin"
              className="hover:text-fh-accent transition-colors opacity-70"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-6 py-12 text-xs uppercase tracking-[0.3em] text-fh-text/40 border-t border-fh-text/5 mt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>Forest House · Deployment May 12–18, 2026</span>
          <a
            href="https://foresthou.se"
            className="hover:text-fh-accent transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            foresthou.se
          </a>
        </div>
      </footer>
    </div>
  );
}
