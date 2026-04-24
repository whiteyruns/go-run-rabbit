// Server-only. Builds the Monday "update these cells" email Brandon
// uses when the xlsx has to be hand-fed. Reads the live scrapes and
// formats a paste-ready block for each tab he'll touch.

import fs from 'fs';
import path from 'path';
import { loadSessionReport, sumSessionReport } from './loader';

type Venue = 'manor' | 'noir';

interface SquareScrape {
  net_sales: number | null;
  gross_sales: number | null;
  top_items?: { name: string; gross: number }[];
}

function loadSquare(venue: Venue, dateISO: string): SquareScrape | null {
  try {
    const file = path.resolve(process.cwd(), 'data', 'oddyssey-square', venue, `${dateISO}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as SquareScrape;
  } catch {
    return null;
  }
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

function dowShort(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleString('en-US', { timeZone: 'UTC', weekday: 'short' });
}

function monthShort(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' });
}

function mdFormat(dateISO: string): string {
  // Noir tab names use "M.D" (e.g., "LG 4.17 Report" = Liber Gigante April 17)
  const [, m, d] = dateISO.split('-').map(Number);
  return `${m}.${d}`;
}

/** ISO add days */
function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

interface NightRow {
  date: string;
  venue: Venue;
  ticketsIssued: number | null;
  ticketsRedeemed: number | null;
  ticketsPaid: number | null;
  ticketsFree: number | null;
  netTicketRev: number | null;
  barNet: number | null;
}

function buildNightRow(venue: Venue, dateISO: string): NightRow | null {
  const session = loadSessionReport(venue, dateISO);
  const square = loadSquare(venue, dateISO);
  if (!session && !square) return null;
  const totals = session ? sumSessionReport(session) : null;
  return {
    date: dateISO,
    venue,
    ticketsIssued: totals?.reserved ?? null,
    ticketsRedeemed: totals?.redeemed ?? null,
    ticketsPaid: totals?.tickets_paid ?? null,
    ticketsFree: totals?.tickets_free ?? null,
    netTicketRev: totals?.net_to_bank ?? null,
    barNet: square?.net_sales ?? null,
  };
}

/**
 * Produce the weekend's rows: Manor Thu-Sun + Noir Fri-Sat anchored
 * on the given Friday. `anchorFri` = YYYY-MM-DD of the Friday.
 */
export function buildWeekendRows(anchorFri: string): NightRow[] {
  const rows: NightRow[] = [];
  // Manor: Thu, Fri, Sat, Sun
  for (let offset = -1; offset <= 2; offset++) {
    const date = addDays(anchorFri, offset);
    const r = buildNightRow('manor', date);
    if (r) rows.push(r);
  }
  // Noir: Fri, Sat
  for (let offset = 0; offset <= 1; offset++) {
    const date = addDays(anchorFri, offset);
    const r = buildNightRow('noir', date);
    if (r) rows.push(r);
  }
  return rows;
}

export interface XlsxUpdateEmail {
  subject: string;
  html: string;
  text: string;
  anchor: string;
}

export function renderXlsxUpdateEmail(anchorFri: string): XlsxUpdateEmail {
  const rows = buildWeekendRows(anchorFri);
  const manor = rows.filter((r) => r.venue === 'manor');
  const noir = rows.filter((r) => r.venue === 'noir');

  const fri = anchorFri;
  const sat = addDays(fri, 1);
  const weekendLabel = `${monthShort(fri)} ${fri.split('-')[2]}–${sat.split('-')[2]}`;

  const subject = `[Oddyssey] Paste-ready numbers · ${weekendLabel}`;

  // Plain-text — primary format; most paste-targets want plain cells.
  const textLines: string[] = [];
  textLines.push(`Brandon — here's everything to paste into the weekend spreadsheets.`);
  textLines.push(`All numbers are pulled live from Ticketure + Square. Reporting day = 8 AM → 8 AM next day.`);
  textLines.push(``);
  textLines.push(`══════════════════════════════════════════════════════════════`);
  textLines.push(`  MANOR P&L.xlsx  →  "${monthShort(fri).toUpperCase()} Rev" tab`);
  textLines.push(`══════════════════════════════════════════════════════════════`);
  textLines.push(``);
  textLines.push(`Update the per-night rows:`);
  textLines.push(``);
  textLines.push(`  DATE         T-Issued  T-Redeemed   T-NET         SQUARE NET`);
  textLines.push(`  ───────────  ────────  ──────────   ───────────   ──────────`);
  for (const r of manor) {
    const label = `${dowShort(r.date).padEnd(4)} ${r.date}`.padEnd(13);
    textLines.push(
      `  ${label}  ` +
        `${fmtInt(r.ticketsIssued).padStart(8)}  ` +
        `${fmtInt(r.ticketsRedeemed).padStart(10)}   ` +
        `${fmtMoney(r.netTicketRev).padStart(11)}   ` +
        `${fmtMoney(r.barNet).padStart(10)}`,
    );
  }
  textLines.push(``);
  textLines.push(`══════════════════════════════════════════════════════════════`);
  textLines.push(`  NOIR Budgets & Reports.xlsx`);
  textLines.push(`══════════════════════════════════════════════════════════════`);
  textLines.push(``);
  for (const r of noir) {
    const dow = dowShort(r.date);
    const tabPrefix = dow === 'Fri' ? 'LG' : 'NOIR';
    const tabName = `${tabPrefix} ${mdFormat(r.date)} Report`;
    textLines.push(`  Tab: "${tabName}"`);
    textLines.push(`    Tickets Reserved:          ${fmtInt(r.ticketsIssued)}`);
    textLines.push(`    Tickets Redeemed:          ${fmtInt(r.ticketsRedeemed)}`);
    textLines.push(`    Tickets PAID:              ${fmtInt(r.ticketsPaid)}`);
    textLines.push(`    Net Ticket Rev:            ${fmtMoney(r.netTicketRev)}`);
    textLines.push(`    Net POS Beverage (Square): ${fmtMoney(r.barNet)}`);
    textLines.push(``);
  }
  textLines.push(`──────────────────────────────────────────────────────────────`);
  textLines.push(`Dashboard: https://gorunrabbit.com/oddyssey-manor/admin/weekend-recap?weekend=${anchorFri}`);
  textLines.push(`Questions: keith@gorunrabbit.com`);
  const text = textLines.join('\n');

  // HTML — mirror of the plain-text but with a table for the Manor block.
  const manorTableRows = manor
    .map(
      (r) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);">${dowShort(r.date)} ${r.date}</td>
          <td style="padding:8px 12px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${fmtInt(r.ticketsIssued)}</td>
          <td style="padding:8px 12px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${fmtInt(r.ticketsRedeemed)}</td>
          <td style="padding:8px 12px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);font-family:monospace;">${fmtMoney(r.netTicketRev)}</td>
          <td style="padding:8px 12px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);font-family:monospace;">${fmtMoney(r.barNet)}</td>
        </tr>`,
    )
    .join('');
  const noirBlocks = noir
    .map((r) => {
      const dow = dowShort(r.date);
      const tabPrefix = dow === 'Fri' ? 'LG' : 'NOIR';
      const tabName = `${tabPrefix} ${mdFormat(r.date)} Report`;
      return `
        <div style="margin-bottom:20px;padding:14px 18px;border:1px solid rgba(180,110,200,0.25);border-left:3px solid #b46ec8;background:rgba(180,110,200,0.04);">
          <div style="font-family:Consolas,monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#b46ec8;margin-bottom:10px;">Tab: "${tabName}"</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:4px 0;color:#9a958d;">Tickets Reserved:</td><td style="text-align:right;font-family:monospace;color:#e8e4dd;">${fmtInt(r.ticketsIssued)}</td></tr>
            <tr><td style="padding:4px 0;color:#9a958d;">Tickets Redeemed:</td><td style="text-align:right;font-family:monospace;color:#e8e4dd;">${fmtInt(r.ticketsRedeemed)}</td></tr>
            <tr><td style="padding:4px 0;color:#9a958d;">Tickets PAID:</td><td style="text-align:right;font-family:monospace;color:#e8e4dd;">${fmtInt(r.ticketsPaid)}</td></tr>
            <tr><td style="padding:4px 0;color:#9a958d;">Net Ticket Rev:</td><td style="text-align:right;font-family:monospace;color:#e8e4dd;">${fmtMoney(r.netTicketRev)}</td></tr>
            <tr><td style="padding:4px 0;color:#9a958d;">Net POS Beverage (Square):</td><td style="text-align:right;font-family:monospace;color:#e8e4dd;">${fmtMoney(r.barNet)}</td></tr>
          </table>
        </div>`;
    })
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
<div style="max-width:720px;margin:0 auto;padding:32px 24px;">
  <div style="border:1px solid rgba(201,168,76,0.3);padding:22px 24px 18px;text-align:center;margin-bottom:26px;">
    <div style="font-size:10px;letter-spacing:4px;color:#c9a84c;font-weight:500;text-transform:uppercase;margin-bottom:8px;">Oddyssey · Weekly xlsx Update</div>
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;letter-spacing:1.5px;text-transform:uppercase;margin:4px 0 0;">${weekendLabel}</h1>
  </div>
  <p style="font-size:14px;line-height:1.6;color:#c9c5bd;">
    Morning Brandon — paste these into the weekend spreadsheets.
    All numbers pulled live from Ticketure + Square. Square uses 8 AM → 8 AM reporting day.
  </p>

  <h2 style="font-family:Georgia,serif;font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;border-bottom:1px solid rgba(201,168,76,0.3);padding-bottom:8px;margin-top:32px;">
    MANOR P&amp;L.xlsx → <span style="font-family:Consolas,monospace;font-size:14px;">"${monthShort(fri).toUpperCase()} Rev"</span> tab
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
    <tr style="background:rgba(201,168,76,0.08);">
      <th style="padding:10px 12px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:10px;color:#c9a84c;">Date</th>
      <th style="padding:10px 12px;text-align:right;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:10px;color:#c9a84c;">T-Issued</th>
      <th style="padding:10px 12px;text-align:right;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:10px;color:#c9a84c;">T-Redeemed</th>
      <th style="padding:10px 12px;text-align:right;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:10px;color:#c9a84c;">T-NET</th>
      <th style="padding:10px 12px;text-align:right;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:10px;color:#c9a84c;">Square NET</th>
    </tr>
    ${manorTableRows}
  </table>

  <h2 style="font-family:Georgia,serif;font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#b46ec8;border-bottom:1px solid rgba(180,110,200,0.3);padding-bottom:8px;margin-top:36px;">
    NOIR Budgets &amp; Reports.xlsx
  </h2>
  ${noirBlocks}

  <div style="margin-top:32px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#9a958d;line-height:1.6;">
    Full dashboard: <a href="https://gorunrabbit.com/oddyssey-manor/admin/weekend-recap?weekend=${anchorFri}" style="color:#c9a84c;">gorunrabbit.com/…/weekend-recap</a><br/>
    Questions → <a href="mailto:keith@gorunrabbit.com" style="color:#c9a84c;">keith@gorunrabbit.com</a>
  </div>
</div>
</body></html>`;

  return { subject, html, text, anchor: anchorFri };
}
