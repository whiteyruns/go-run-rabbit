import type { Metadata } from "next";

// Page-specific OG metadata for the Private Events flagship.

export const metadata: Metadata = {
  title: { absolute: "Private Events at Oddyssey — Manor + Noir, AREA15 Las Vegas" },
  description:
    "Host your private event at Oddyssey. Full Manor buyouts, Noir takeovers, hybrid packages. AREA15, Las Vegas.",
  openGraph: {
    title: "Private Events at Oddyssey — Manor + Noir",
    description: "Buyouts and takeovers at AREA15. Manor immersive dinners, Noir late-night.",
    type: "website",
    siteName: "Oddyssey",
    images: [{ url: "/oddyssey/og-private.png", width: 1200, height: 630, alt: "Private Events at Oddyssey" }],
  },
  twitter: { card: "summary_large_image", images: ["/oddyssey/og-private.png"] },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
