import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Feed The Block — Event Recap",
  description: "Post-event performance recap — Feed The Block series",
  robots: { index: false, follow: false },
};

export default function FtbRecapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ftb-scope`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap');
        .ftb-scope {
          background: #0e0e0e;
          color: #ffffff;
          font-family: 'Inter', var(--font-inter), sans-serif;
          min-height: 100vh;
        }
        .ftb-headline {
          font-family: 'Epilogue', sans-serif;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: -0.03em;
        }
        .ftb-gradient {
          background: linear-gradient(to right, #ffe792, #ff68a7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ftb-glass {
          background: rgba(38, 38, 38, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .ftb-glow:hover {
          box-shadow: 0 0 30px rgba(255, 107, 0, 0.15);
        }
        /* Print stylesheet — drives the "Save as PDF" flow */
        @media print {
          @page { margin: 0.4in; size: letter; }
          .ftb-scope { background: #0e0e0e !important; color: #fff !important; min-height: auto; }
          .recap-no-print { display: none !important; }
          .recap-page-break { break-before: page; page-break-before: always; }
          .ftb-glass { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: rgba(38, 38, 38, 0.8) !important; }
          a { color: inherit !important; text-decoration: none !important; }
          section { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      {children}
    </div>
  );
}
