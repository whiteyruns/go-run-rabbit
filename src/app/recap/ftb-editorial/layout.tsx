import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed The Block — Event Recap · Editorial",
  description: "Post-event performance recap — Feed The Block series",
  robots: { index: false, follow: false },
};

export default function EditorialRecapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="editorial-scope">
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .editorial-scope {
          background-color: #fdf9f3;
          color: #1c1c18;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }
        .editorial-scope .serif {
          font-family: 'Noto Serif', 'Times New Roman', serif;
        }
        .editorial-scope .hairline-gold {
          border-top: 0.5px solid #c9912b;
        }
        .editorial-scope .drop-cap::first-letter {
          float: left;
          font-family: 'Noto Serif', serif;
          font-size: 5rem;
          line-height: 0.8;
          padding-right: 12px;
          padding-top: 4px;
          color: #7f5700;
          font-weight: 700;
        }
        @media print {
          @page { margin: 0.5in; size: letter; }
          .editorial-scope { background: #fdf9f3 !important; color: #1c1c18 !important; min-height: auto; }
          .recap-no-print { display: none !important; }
          .recap-page-break { break-before: page; page-break-before: always; }
          a { color: inherit !important; text-decoration: none !important; }
          section { break-inside: avoid; page-break-inside: avoid; }
          img { filter: grayscale(100%); }
        }
      `}</style>
      {children}
    </div>
  );
}
