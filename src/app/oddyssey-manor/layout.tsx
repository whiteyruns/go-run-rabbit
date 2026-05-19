import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { absolute: "Oddyssey — Immersive Nightlife at AREA15 Las Vegas" },
  description:
    "Oddyssey at AREA15 Las Vegas. Manor delivers an immersive dining show; Noir takes over for late-night nightlife.",
  // Override the root layout's icons (the Go Run Rabbit favicon) with
  // the Oddyssey wordmark-O. File-convention icon.svg alone wasn't
  // winning the cascade because the root metadata explicitly declares
  // `icons.icon`. Setting it here (and on each child route layout)
  // makes Oddyssey's mark the one that ships in <link rel="icon">.
  icons: { icon: [{ url: "/oddyssey-manor/icon.svg", type: "image/svg+xml", sizes: "any" }] },
  openGraph: {
    title: "Oddyssey — Immersive Nightlife at AREA15 Las Vegas",
    description: "Two destinations. One Oddyssey. Inside AREA15, Las Vegas.",
    type: "website",
    siteName: "Oddyssey",
    images: [{ url: "/oddyssey/og-brand.png", width: 1200, height: 630, alt: "Oddyssey at AREA15" }],
  },
  twitter: { card: "summary_large_image", images: ["/oddyssey/og-brand.png"] },
};

export default function OddysseyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${cormorant.variable} oddyssey-scope`}
      style={{ background: "#060606", color: "#e8e4dd" }}
    >
      <style>{`
        .oddyssey-scope {
          --bg: #060606;
          --bg-elevated: #0d0d0d;
          --bg-card: #111111;
          --border: rgba(201, 168, 76, 0.12);
          --border-subtle: rgba(255, 255, 255, 0.06);
          --accent: #c9a84c;
          --accent-hover: #d4b85e;
          --accent-dim: rgba(201, 168, 76, 0.08);
          --text: #e8e4dd;
          --text-secondary: #9a958d;
          --text-muted: #5a5650;
          --serif: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
          --sans: var(--font-inter), 'Inter', -apple-system, sans-serif;
        }
        .oddyssey-scope * {
          border-radius: 0 !important;
        }
        .oddyssey-scope ::selection {
          background: var(--accent);
          color: var(--bg);
        }
        .oddyssey-scope ::-webkit-scrollbar { width: 4px; }
        .oddyssey-scope ::-webkit-scrollbar-track { background: var(--bg); }
        .oddyssey-scope ::-webkit-scrollbar-thumb { background: var(--accent); }
        .grain-overlay-od {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>
      {children}
      <div className="grain-overlay-od" />
    </div>
  );
}
