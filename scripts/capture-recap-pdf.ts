/**
 * Capture the Marshmello recap as a PDF exactly like Cmd-P → Save as PDF
 * would produce, so we can inspect formatting without round-tripping Chrome.
 *
 * Usage: npx tsx scripts/capture-recap-pdf.ts
 */
import { chromium } from "playwright";

const URL =
  process.env.RECAP_URL ??
  "https://www.gorunrabbit.com/recap/ftb-editorial/marshmello-apr2-2026";
const ACCESS_CODE = "feed2026";
const OUT = process.env.OUT ?? "/tmp/marshmello-recap.pdf";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  const page = await ctx.newPage();

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

  // AuthGate — enter access code.
  const pwd = page.locator('input[type="password"]');
  if (await pwd.count()) {
    await pwd.fill(ACCESS_CODE);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle", { timeout: 30_000 });
  }

  // Wait for lazy images + fonts.
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((i) =>
        i.complete ? Promise.resolve() : new Promise((r) => (i.onload = i.onerror = r)),
      ),
    );
  });
  await page.waitForTimeout(1500);

  // Inject print-density overrides so we don't need a deploy cycle.
  //
  // IMPORTANT: Only add rules the deployed layout.tsx doesn't already have.
  // The deployed site handles: @page margins, recap-page-break, pdf-avoid-break,
  // pdf-cover-page, pdf-photo-grid, gap/margin overrides, pdf-running-footer.
  // Duplicating those here (especially gap/padding wildcards) causes specificity
  // conflicts that can ADD pages instead of saving them.
  await page.addStyleTag({
    content: `
      @media print {
        /* ── Base compaction ── */
        .recap-page-break {
          padding-top: 1.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        .pdf-cover-page { padding-top: 3.2in !important; }
        .pdf-cover-page h1 { font-size: 5rem !important; line-height: 0.95 !important; }
        #headliner h2 { font-size: 5rem !important; line-height: 0.9 !important; }
        #event figure { height: 320px !important; }

        /* ── Stats grid: let wrapper split across pages ── */
        #series .pdf-avoid-break {
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
        .hairline-gold { break-inside: avoid; }
        #series .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1rem 2rem !important;
        }
        .hairline-gold .serif { font-size: 2rem !important; }

        /* ── Headliner: single-column, polaroid row ── */
        #headliner .grid {
          grid-template-columns: 1fr !important;
        }
        #headliner .md\\:col-span-7,
        #headliner .md\\:col-span-4,
        #headliner .md\\:col-start-9 {
          grid-column: 1 / -1 !important;
        }
        #headliner .md\\:col-start-9 {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1rem !important;
          align-items: start !important;
        }
        #headliner .md\\:col-start-9 .bg-white {
          max-width: 200px !important;
          transform: rotate(0deg) !important;
        }
        #headliner .md\\:col-start-9 .aspect-square {
          max-height: 180px !important;
        }
        /* Polaroid caption + credit: scale to match shrunk photo */
        #headliner .md\\:col-start-9 .bg-white .pt-4 {
          font-size: 10px !important;
          padding-top: 6px !important;
          line-height: 1.3 !important;
        }
        #headliner .md\\:col-start-9 .bg-white p {
          font-size: 6px !important;
        }
        #headliner .md\\:col-start-9 .serif {
          font-size: 2.5rem !important;
        }
        #headliner ul li {
          font-size: 14px !important;
          line-height: 1.45 !important;
        }
        #headliner .mb-10 { margin-bottom: 0.5rem !important; }

        /* ── Event: tighter spacing ── */
        #event { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        #event .mt-12 { margin-top: 0.75rem !important; }
        #event .pdf-avoid-break {
          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        /* ── Tail sections ── */
        #broadcast { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        #contact { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        #sponsors { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
      }
    `,
  });

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: OUT,
    format: "Letter",
    printBackground: true,
    // Let the CSS @page rule be the single source of truth for margins.
    // Setting Playwright margins to 0 prevents the double-margin issue
    // where Chromium adds Playwright's margins ON TOP of @page margins.
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });

  console.log("Saved:", OUT);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
