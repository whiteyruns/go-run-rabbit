"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "The Mission", href: "/canyon-expedition" },
  { label: "The Routes", href: "/canyon-expedition/routes" },
  { label: "The Basecamp", href: "/canyon-expedition/basecamp" },
  { label: "The Lore", href: "/canyon-expedition/lore" },
  { label: "The Gallery", href: "/canyon-expedition/gallery" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50"
      style={{
        background: "rgba(20, 19, 18, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Link
        href="/canyon-expedition"
        className="text-xl font-headline font-black uppercase tracking-tighter text-ce-on-surface"
      >
        Apache Springs Retreat
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        {links.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`font-label text-xs uppercase tracking-widest transition-colors ${
                active
                  ? "text-ce-primary-container border-b-2 border-ce-primary-container pb-1"
                  : "text-ce-on-surface hover:text-ce-secondary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/canyon-expedition#register"
        className="bg-ce-primary-container text-ce-on-primary-fixed px-6 py-2 font-label text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all active:scale-95"
      >
        Secure Spot
      </Link>
    </header>
  );
}
