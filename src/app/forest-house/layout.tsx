import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ForestHouse Crew — May 12–18, 2026",
  description:
    "Crew registration for the ForestHouse deployment, May 12–18, 2026.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function ForestHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fh-bg text-fh-text font-fh antialiased selection:bg-fh-teal/30">
      <header className="sticky top-0 z-20 bg-fh-bg/85 backdrop-blur-xl border-b border-fh-border">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 sm:px-12 h-20">
          <Link href="/forest-house" className="flex items-center gap-3">
            <Image
              src="/forest-house/logo.png"
              alt="ForestHouse"
              width={40}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="hidden sm:inline text-[13px] font-black uppercase tracking-[0.4em]">
              Foresthouse
            </span>
          </Link>
          <div className="flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.3em]">
            <Link
              href="/forest-house/register"
              className="text-fh-text-secondary hover:text-fh-text transition-colors"
            >
              Register
            </Link>
            <Link
              href="/forest-house/admin"
              className="text-fh-muted hover:text-fh-text transition-colors"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <div className="h-[3px] bg-fh-rainbow" />
      <footer className="px-6 sm:px-12 py-12">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-[13px] font-black uppercase tracking-[0.4em]">
            Foresthouse
          </span>
          <div className="flex items-center gap-6 text-[11px] font-medium uppercase tracking-[0.25em] text-fh-muted">
            <Link
              href="/forest-house/register"
              className="hover:text-fh-text transition-colors"
            >
              Register
            </Link>
            <a
              href="https://www.foresthou.se"
              target="_blank"
              rel="noreferrer"
              className="hover:text-fh-text transition-colors"
            >
              foresthou.se ↗
            </a>
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] tracking-[0.2em] text-fh-muted">
          © 2026 ForestHouse · Crew Portal by Go Run Rabbit
        </p>
      </footer>
    </div>
  );
}
