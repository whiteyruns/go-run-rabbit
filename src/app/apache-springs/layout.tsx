import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Apache Springs Ultramarathon and Retreat | Go Run Rabbit",
  description:
    "An invite-only ultramarathon and retreat in the Santa Rita Mountains of Southern Arizona. Three days. Twenty runners. One hundred sixty acres.",
  openGraph: {
    title: "Apache Springs Ultramarathon and Retreat",
    description:
      "An invite-only ultramarathon and retreat in the Santa Rita Mountains of Southern Arizona.",
    type: "website",
    images: [{ url: "/images/apache-springs/og-default.png" }],
  },
};

export default function ApacheSpringsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${notoSerif.variable} apache-springs-scope`}
      style={{ background: "#161310", color: "#e9e1dc" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <style>{`
        .apache-springs-scope {
          --color-surface: #161310;
          --color-surface-low: #1e1b18;
          --color-surface-container: #221f1c;
          --color-surface-high: #2d2926;
          --color-primary: #ffb688;
          --color-primary-container: #ce7c44;
          --color-on-primary: #512400;
          --color-secondary: #f5bd64;
          --color-tertiary: #d5c5a9;
          --color-on-surface: #e9e1dc;
          --color-on-surface-variant: #d9c2b5;
          --color-outline: #a18d81;
          --color-outline-variant: #54433a;
          --font-serif: var(--font-noto-serif), Georgia, serif;
          --font-body: var(--font-inter), system-ui, sans-serif;
        }
        .apache-springs-scope ::selection {
          background: var(--color-primary);
          color: var(--color-on-primary);
        }
        .text-glow {
          text-shadow: 0 0 80px rgba(255, 182, 136, 0.3), 0 0 40px rgba(255, 182, 136, 0.15);
        }
        .glass-effect {
          background: rgba(22, 19, 16, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .grain-overlay-as {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>
      {children}
      <div className="grain-overlay-as" />
    </div>
  );
}
