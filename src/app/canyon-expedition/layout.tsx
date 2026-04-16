import type { Metadata } from "next";
import { Inter, Newsreader, Space_Grotesk } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["200", "300", "400", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Apache Springs Retreat | The Technical Frontier",
  description:
    "An invite-only ultramarathon and retreat in the Santa Rita Mountains of Southern Arizona.",
  openGraph: {
    title: "Apache Springs Retreat | The Technical Frontier",
    description:
      "A technical outpost for elite explorers. Precision navigation in the high desert.",
    type: "website",
  },
};

export default function CanyonExpeditionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${newsreader.variable} ${spaceGrotesk.variable} canyon-expedition-scope`}
      style={{ background: "#141312", color: "#e6e1df" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style>{`
        .canyon-expedition-scope {
          --color-surface: #141312;
          --color-surface-low: #1d1b1a;
          --color-surface-container: #211f1e;
          --color-surface-high: #2b2a28;
          --color-surface-highest: #363433;
          --color-surface-lowest: #0f0e0d;
          --color-surface-bright: #3b3937;
          --color-primary: #ffb598;
          --color-primary-container: #f7600c;
          --color-on-primary: #591c00;
          --color-on-primary-fixed: #370e00;
          --color-secondary: #f5bd64;
          --color-secondary-container: #825901;
          --color-on-surface: #e6e1df;
          --color-on-surface-variant: #e3bfb2;
          --color-outline: #aa8a7e;
          --color-outline-variant: #5a4137;
          --color-tertiary: #d0c4bc;
          --font-headline: var(--font-newsreader), 'Newsreader', serif;
          --font-body: var(--font-inter), 'Inter', sans-serif;
          --font-label: var(--font-space-grotesk), 'Space Grotesk', monospace;
        }
        .canyon-expedition-scope * {
          border-radius: 0 !important;
        }
        .canyon-expedition-scope ::selection {
          background: var(--color-primary-container);
          color: var(--color-on-primary-fixed);
        }
        .font-headline { font-family: var(--font-headline); }
        .font-body { font-family: var(--font-body); }
        .font-label { font-family: var(--font-label); }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .grain-overlay-ce {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .topo-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' stroke='%23363433' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0 150 Q 100 100 200 150 T 400 150' stroke='%23363433' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0 200 Q 100 150 200 200 T 400 200' stroke='%23363433' fill='none' stroke-width='0.5'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>
      {children}
      <div className="grain-overlay-ce" />
    </div>
  );
}
