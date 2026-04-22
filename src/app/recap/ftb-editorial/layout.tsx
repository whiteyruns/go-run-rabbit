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
          /* 1.0in bottom margin keeps content comfortably above the
             fixed running footer (which sits ~0.3in from page edge). */
          @page { margin: 0.6in 0.5in 1.0in 0.5in; size: letter; }
          .editorial-scope {
            background: #fdf9f3 !important;
            color: #1c1c18 !important;
            min-height: auto;
            /* Print colors exactly — don't let Chrome flatten backgrounds. */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .recap-no-print { display: none !important; }

          /* Break *before* a section. */
          .recap-page-break { break-before: page; page-break-before: always; }

          /* Atomic chunks that must never split across a page boundary.
             We apply these selectively (stat rows, phase cards, photos) rather
             than on every section — large sections that can't fit one page get
             ignored by Chrome when using break-inside on the section itself,
             and split in worse places. */
          .pdf-avoid-break { break-inside: avoid; page-break-inside: avoid; }

          /* Keep a subhead welded to the content that follows it. */
          .pdf-keep-with-next { break-after: avoid; page-break-after: avoid; }

          /* Cover page — caps height so content fits on one letter page.
             We *don't* use break-after here; instead the next section
             (id="series") carries recap-page-break (break-before:page),
             which paginates cleanly without producing a ghost blank page. */
          .pdf-cover-page {
            min-height: 9.4in !important;
            max-height: 9.4in !important;
            overflow: hidden !important;
          }

          /* Photo gallery — Tailwind's md:grid-cols-3 sometimes fails to
             apply under print media (Chrome's print viewport is narrower
             than you'd think). Force 3-up explicitly so the photos pack
             into one row instead of one per page. */
          .pdf-photo-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          a { color: inherit !important; text-decoration: none !important; }

          /* Running footer repeats on every printed page in Chrome because
             position:fixed elements are re-flowed onto each page. */
          .pdf-running-footer {
            display: block !important;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0.35in;
            text-align: center;
            font-size: 8.5px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #7f5700;
            font-family: 'Inter', sans-serif;
          }
        }
        /* Hide the running footer on-screen; only print shows it. */
        .pdf-running-footer { display: none; }
      `}</style>
      {children}
    </div>
  );
}
