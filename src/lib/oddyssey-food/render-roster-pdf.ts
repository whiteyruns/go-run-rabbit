import { chromium } from "playwright";

interface RenderOpts {
  /** Origin where the running Next.js server can be reached. */
  baseUrl: string;
  /** Date to render (YYYY-MM-DD). Defaults to today (PT) inside the page. */
  date?: string;
  /** Render every date in the CSV instead of just today. */
  all?: boolean;
  /** Override the printed CSS @page size. Default: letter landscape. */
  format?: "Letter";
  landscape?: boolean;
}

export interface RenderedPdf {
  buffer: Buffer;
  url: string;
}

/**
 * Render the server-side roster print view to a PDF.
 * Mirrors scripts/capture-recap-pdf.ts: emulate print media so the
 * RosterPrint @media print styles activate, then page.pdf() with
 * margin:0 so the @page rule is the single source of truth.
 */
export async function renderRosterPdf(opts: RenderOpts): Promise<RenderedPdf> {
  const url = buildUrl(opts);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
    const page = await ctx.newPage();
    // Pre-set the AdminShell's session flag before any page script runs.
    // /oddyssey-manor/admin/food/* is gated by an access-code form in
    // AdminShell.tsx that checks sessionStorage.od-auth on mount; a
    // clean Playwright context has empty storage and would render the
    // login screen instead of the roster.
    await page.addInitScript(() => {
      try { sessionStorage.setItem("od-auth", "true"); } catch { /* */ }
    });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

    // Wait for fonts so the printed layout is stable.
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: opts.format ?? "Letter",
      landscape: opts.landscape ?? true,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });
    return { buffer: pdf, url };
  } finally {
    await browser.close();
  }
}

function buildUrl(opts: RenderOpts): string {
  const u = new URL("/oddyssey-manor/admin/food/roster/print-view", opts.baseUrl);
  if (opts.date) u.searchParams.set("date", opts.date);
  if (opts.all) u.searchParams.set("all", "1");
  return u.toString();
}
