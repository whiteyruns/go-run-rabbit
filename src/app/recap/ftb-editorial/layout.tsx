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
          /* @page is the single source of truth for margins.
             1.0in bottom keeps content above the fixed running footer.
             Playwright's page.pdf() margins are set to 0 to avoid
             the double-margin issue in some Chromium versions. */
          @page { margin: 0.6in 0.5in 1.0in 0.5in; size: letter; }

          .editorial-scope {
            background: #fdf9f3 !important;
            color: #1c1c18 !important;
            min-height: auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Force background rendering on all elements (images, dark
             sections, colored bars). */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .recap-no-print { display: none !important; }
          .recap-print-only { display: block !important; }

          /* Break *before* a section. */
          .recap-page-break {
            break-before: page;
            page-break-before: always;
          }

          /* Atomic chunks that must never split across a page boundary.
             We apply these selectively (stat rows, phase cards, photos)
             rather than on every section — large sections that can't fit
             one page get ignored by Chrome when using break-inside on the
             section itself, and split in worse places.

             break-after: auto prevents the cascade where an avoid-break
             block gets pushed to the next page AND the next section's
             break-before:page creates yet another page, leaving a blank
             gap in between. */
          .pdf-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
            break-after: auto;
          }

          /* Keep a subhead welded to the content that follows it. */
          .pdf-keep-with-next { break-after: avoid; page-break-after: avoid; }

          /* Cover page — in print, convert from flex centering to plain
             block layout with padding-based vertical positioning. Flex
             containers with fixed heights + break-before on siblings
             produce a persistent ghost page 2 in Chrome. Blocks don't. */
          .pdf-cover-page {
            display: block !important;
            padding-top: 3.2in !important;
            padding-bottom: 0 !important;
            min-height: 0 !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Scale down the hero headline for print — text-9xl (8rem) at
             1280px viewport wraps to 3 lines; 5rem keeps it to 2. */
          .pdf-cover-page h1 {
            font-size: 5rem !important;
            line-height: 0.95 !important;
          }

          /* Photo gallery — force 3-up for print (Chrome's print viewport
             is narrower than you'd think, so md:grid-cols-3 can fail).
             Ensure images render at full quality in print context. */
          .pdf-photo-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            break-inside: avoid;
          }
          .pdf-photo-grid img {
            max-width: 100%;
            height: auto;
          }

          a { color: inherit !important; text-decoration: none !important; }

          /* ── Print density ──
             Screen padding (py-24 = 6rem, py-32 = 8rem) wastes vertical
             space in print, causing avoid-break blocks to overflow onto
             near-empty pages. Compact everything. */
          .recap-page-break {
            padding-top: 2rem !important;
            padding-bottom: 1rem !important;
          }
          /* Tighten the grid gaps that Tailwind sets at md breakpoint. */
          .editorial-scope .gap-12 { gap: 1.5rem !important; }
          .editorial-scope .gap-16 { gap: 2rem !important; }
          .editorial-scope .gap-20 { gap: 2.5rem !important; }
          .editorial-scope .md\:gap-16 { gap: 2rem !important; }
          .editorial-scope .md\:gap-20 { gap: 2.5rem !important; }

          /* Margins between elements inside sections */
          .editorial-scope .mb-12 { margin-bottom: 1.5rem !important; }
          .editorial-scope .mb-16 { margin-bottom: 2rem !important; }
          .editorial-scope .mb-20 { margin-bottom: 2.5rem !important; }
          .editorial-scope .mt-20 { margin-top: 2.5rem !important; }
          .editorial-scope .mt-28 { margin-top: 3rem !important; }

          /* Running footer repeats on every printed page in Chrome because
             position:fixed elements are re-flowed onto each page.
             White background prevents text collision with page content
             that lands near the bottom of a page. */
          .pdf-running-footer {
            display: block !important;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0.25in;
            padding: 4px 0.5in;
            text-align: center;
            font-size: 8.5px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #7f5700;
            font-family: 'Inter', sans-serif;
            background: #fdf9f3;
            z-index: 100;
          }
        }
        /* Hide the running footer on-screen; only print shows it. */
        .pdf-running-footer { display: none; }
        /* Print-only poster fallback for the hero film — hidden on-screen. */
        .recap-print-only { display: none; }

        /* Screen-only min-height for the cover hero (replaces Tailwind
           min-h-[90vh] which in print evaluated to 9.9in and caused the
           cover section to overflow into a ghost page). */
        @media screen {
          .screen-only-min-h { min-height: 70vh; }
        }
        @media screen and (min-width: 768px) {
          .screen-only-min-h { min-height: 90vh; }
        }
      `}</style>
      {children}
    </div>
  );
}
