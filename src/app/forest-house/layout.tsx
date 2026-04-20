import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ForestHouse Crew — May 12–18, 2026",
  description:
    "Crew registration for the ForestHouse deployment, May 12–18, 2026.",
};

export const viewport: Viewport = {
  themeColor: "#0b0a15",
};

export default function ForestHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lato.variable} min-h-screen bg-fh-bg text-fh-text font-fh antialiased`}
    >
      <header className="sticky top-0 z-20 bg-fh-bg/90 backdrop-blur border-b border-fh-border">
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-5">
          <Link href="/forest-house" className="flex items-baseline gap-2">
            <span className="text-sm font-black uppercase tracking-[0.35em] text-fh-text">
              Forest
            </span>
            <span className="text-sm font-black uppercase tracking-[0.35em] text-fh-accent">
              House
            </span>
          </Link>
          <div className="flex items-center gap-7 text-[11px] font-bold uppercase tracking-[0.3em]">
            <Link
              href="/forest-house/register"
              className="hover:text-fh-accent transition-colors"
            >
              Register
            </Link>
            <Link
              href="/forest-house/admin"
              className="text-fh-muted hover:text-fh-accent transition-colors"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-6 py-10 mt-16 text-[10px] font-bold uppercase tracking-[0.35em] text-fh-muted border-t border-fh-border/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>ForestHouse · Deployment May 12–18, 2026</span>
          <a
            href="https://www.foresthou.se"
            className="hover:text-fh-accent transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            foresthou.se ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
