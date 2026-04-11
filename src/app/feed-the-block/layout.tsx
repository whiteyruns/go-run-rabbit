import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "FEED THE BLOCK — Downtown Las Vegas Street Festival",
  description:
    "Downtown Las Vegas' signature street festival. A free event series on Fremont East. 7 Venues. 1 Block Party. Thousands of People.",
  openGraph: {
    title: "FEED THE BLOCK — Downtown Las Vegas Street Festival",
    description:
      "A free event series on Fremont East. 7 Venues. 1 Block Party. Thousands of People.",
    type: "website",
  },
};

export default function FeedTheBlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      `}</style>
      {children}
    </div>
  );
}
