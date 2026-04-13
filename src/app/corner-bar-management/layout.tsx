import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Corner Bar Management — Strategy Hub",
  description:
    "Strategic intelligence hub for Corner Bar Management — competitive landscape, event strategy, and operational dashboards.",
  openGraph: {
    title: "Corner Bar Management — Strategy Hub",
    description:
      "CBM strategic intelligence and project hub.",
    type: "website",
  },
};

export default function CbmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} cbm-scope`}
      style={{ background: "#0e0e11", color: "#f3f0f4", minHeight: "100vh" }}
    >
      <style>{`
        .cbm-scope {
          --bg: #0e0e11;
          --bg-elevated: #1a1a1f;
          --bg-card: #1f1f23;
          --bg-card-high: #28282e;
          --border: rgba(174, 162, 255, 0.12);
          --border-subtle: rgba(255, 255, 255, 0.06);
          --cyan: #00eefc;
          --violet: #aea2ff;
          --pink: #ff6b98;
          --text: #f3f0f4;
          --text-secondary: #acaaae;
          --text-muted: #48474b;
          --sans: var(--font-inter), 'Inter', -apple-system, sans-serif;
          font-family: var(--sans);
          min-height: 100vh;
        }
        .cbm-scope ::selection {
          background: var(--cyan);
          color: var(--bg);
        }
        .cbm-scope ::-webkit-scrollbar { width: 4px; }
        .cbm-scope ::-webkit-scrollbar-track { background: var(--bg); }
        .cbm-scope ::-webkit-scrollbar-thumb { background: var(--violet); }
      `}</style>
      {children}
    </div>
  );
}
