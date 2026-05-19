import type { Metadata } from "next";

// Page-specific OG metadata for the Noir flagship.

export const metadata: Metadata = {
  title: { absolute: "Oddyssey Noir — Late Night at AREA15 Las Vegas" },
  description:
    "Oddyssey Noir at AREA15: Friday Liquid Gold, Saturday late-night, weekly DJ lineups, bottle service, and reservations.",
  // Purple Noir mark — overrides parent oddyssey-manor's gold mark.
  icons: { icon: [{ url: "/oddyssey-manor/noir/icon.svg", type: "image/svg+xml" }] },
  openGraph: {
    title: "Oddyssey Noir — Late Night at AREA15 Las Vegas",
    description: "Fri Liquid Gold + Sat Oddyssey Noir. Doors at 10 PM. AREA15, Las Vegas.",
    type: "website",
    siteName: "Oddyssey",
    images: [{ url: "/oddyssey/og-noir.png", width: 1200, height: 630, alt: "Oddyssey Noir" }],
  },
  twitter: { card: "summary_large_image", images: ["/oddyssey/og-noir.png"] },
};

export default function NoirLayout({ children }: { children: React.ReactNode }) {
  return children;
}
