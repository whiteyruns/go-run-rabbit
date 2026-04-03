import type { Metadata } from "next";
import { Inter, Epilogue } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Basin & Range — A Desert Ultra Concept | Go Run Rabbit",
  description:
    "A 100-mile point-to-point desert ultramarathon concept from Red Rock Canyon to Boulder City, Nevada.",
  openGraph: {
    title: "Basin & Range — A Desert Ultra Concept",
    description:
      "Red Rock Canyon → Henderson → Boulder City. 100 miles through Southern Nevada's basin & range.",
    type: "website",
  },
};

export default function BasinRangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${epilogue.variable} basin-range-scope`}>
      <style>{`
        .basin-range-scope {
          --color-bg: #12110f;
          --color-surface: #12110f;
          --color-surface-lowest: #0c0b09;
          --color-surface-low: #1a1815;
          --color-surface-container: #252219;
          --color-surface-high: #332e24;
          --color-surface-highest: #3d3730;
          --color-surface-bright: #4a4238;
          --color-primary: #e5c276;
          --color-primary-container: #c4a35a;
          --color-on-primary: #3f2e00;
          --color-secondary: #d5c5a9;
          --color-tertiary: #d3c4b2;
          --color-on-surface: #e6e1e1;
          --color-on-surface-variant: #d0c5b4;
          --color-outline: #9a9182;
          --color-outline-variant: #584e3e;
        }
        .basin-range-scope * {
          border-radius: 0 !important;
        }
        .basin-range-scope ::selection {
          background: var(--color-primary);
          color: var(--color-on-primary);
        }
        .grain-overlay-br {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>
      {children}
      <div className="grain-overlay-br" />
    </div>
  );
}
