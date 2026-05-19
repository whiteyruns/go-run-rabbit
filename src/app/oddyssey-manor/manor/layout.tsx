import type { Metadata } from "next";

// Page-specific OG metadata for the Manor flagship. Inherits the
// .oddyssey-scope wrapper and Inter+Cormorant fonts from
// /oddyssey-manor/layout.tsx. Title is `absolute` so the root
// "%s | Go Run Rabbit" template doesn't leak into share previews.

export const metadata: Metadata = {
  title: { absolute: "Oddyssey Manor — Immersive Dining at AREA15 Las Vegas" },
  description:
    "Oddyssey Manor at AREA15: an immersive theatrical dining show. Tickets, floor plan, and what to expect.",
  icons: { icon: [{ url: "/oddyssey-manor/icon.svg", type: "image/svg+xml" }] },
  openGraph: {
    title: "Oddyssey Manor — Immersive Dining at AREA15 Las Vegas",
    description: "An immersive theatrical dining show inside AREA15. Five rooms. One night. Many secrets.",
    type: "website",
    siteName: "Oddyssey",
    images: [{ url: "/oddyssey/og-manor.png", width: 1200, height: 630, alt: "Oddyssey Manor" }],
  },
  twitter: { card: "summary_large_image", images: ["/oddyssey/og-manor.png"] },
};

export default function ManorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
