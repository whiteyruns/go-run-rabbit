// Unified briefing email template used by both Manor and Noir. Accent
// color is passed in so Manor gets gold, Noir gets magenta.

import type { SessionReportTotals } from "./loader";

export interface BriefingEmailInput {
  venue: "manor" | "noir";
  date_label: string;
  bullets: string[];
  notes: string; // free-text GM notes (may be empty)
  notes_updated_at: string | null;
  totals?: SessionReportTotals;
  fallback_tickets?: number;
  fallback_revenue?: number;
  dashboard_url: string;
  pulled_at: string; // when the data was refreshed
}

export function renderBriefingHtml(input: BriefingEmailInput): string {
  const accent = input.venue === "manor" ? "#c9a84c" : "#b46ec8";
  const venueName = input.venue === "manor" ? "Oddyssey Manor" : "Oddyssey Noir";

  const reserved = input.totals?.reserved ?? input.fallback_tickets ?? 0;
  const gross = input.totals?.gross_revenue ?? input.fallback_revenue ?? 0;
  const paid = input.totals?.tickets_paid ?? null;
  const free = input.totals?.tickets_free ?? null;
  const cap = input.totals?.capacity ?? 0;
  const capPct = input.totals?.capacity_percent ?? 0;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>${venueName} Briefing · ${esc(input.date_label)}</title></head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
<div style="max-width:640px;margin:0 auto;padding:40px 24px;">

  <div style="border:1px solid ${alpha(accent, 0.3)};padding:28px 24px 24px;text-align:center;margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:4px;color:${accent};font-weight:500;text-transform:uppercase;margin-bottom:8px;">${venueName} · Evening Briefing</div>
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:300;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;color:#e8e4dd;">${esc(input.date_label)}</h1>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
    <tr>
      ${tile("Tickets Sold", `${reserved}${cap > 0 ? ` / ${cap}` : ""}`, accent)}
      ${tile("Gross", formatMoney(gross), accent)}
      ${tile("Capacity", `${(capPct * 100).toFixed(0)}%`, accent)}
      ${tile("Paid vs Comp", paid != null && free != null ? `${paid} / ${free}` : "—", accent)}
    </tr>
  </table>

  <div style="margin-bottom:28px;">
    <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;color:#e8e4dd;border-bottom:1px solid ${alpha(accent, 0.25)};padding-bottom:8px;">GM Talking Points</h2>
    ${input.bullets.length === 0
      ? `<p style="color:#9a958d;font-size:13px;">Data still loading — pull the latest CSV before the show.</p>`
      : `<ul style="padding-left:18px;margin:0;">${input.bullets.map((b) => `<li style="font-size:14px;color:#e8e4dd;line-height:1.7;margin-bottom:4px;">${esc(b)}</li>`).join("")}</ul>`
    }
  </div>

  ${input.notes.trim().length > 0 ? `
    <div style="margin-bottom:28px;">
      <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;color:#e8e4dd;border-bottom:1px solid ${alpha(accent, 0.25)};padding-bottom:8px;">Evening Notes</h2>
      <div style="padding:16px 20px;background:${alpha(accent, 0.06)};border-left:3px solid ${accent};font-size:14px;color:#e8e4dd;line-height:1.7;">${escMultiline(input.notes)}</div>
      ${input.notes_updated_at ? `<div style="margin-top:6px;font-size:10px;color:#5a5650;letter-spacing:1px;text-transform:uppercase;">Last edited ${esc(new Date(input.notes_updated_at).toLocaleString("en-US"))}</div>` : ""}
    </div>
  ` : ""}

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);font-size:10px;letter-spacing:1px;color:#5a5650;text-transform:uppercase;text-align:center;">
    Snapshot: ${esc(new Date(input.pulled_at).toLocaleString("en-US"))}<br/>
    Presented by Go Run Rabbit · <a style="color:${accent};text-decoration:none;" href="${input.dashboard_url}">Open dashboard</a>
  </div>

</div></body></html>`;
}

export function briefingSubject(input: BriefingEmailInput): string {
  const date = input.date_label;
  const reserved = input.totals?.reserved ?? input.fallback_tickets ?? 0;
  const gross = input.totals?.gross_revenue ?? input.fallback_revenue ?? 0;
  const venue = input.venue === "manor" ? "Manor" : "Noir";
  return `${venue} Briefing · ${date} · ${reserved} tix · ${formatMoney(gross)}`;
}

function tile(label: string, value: string, accent: string): string {
  return `<td style="padding:0;border:1px solid rgba(255,255,255,0.06);">
    <div style="padding:20px 16px;text-align:center;">
      <div style="font-size:9px;letter-spacing:3px;color:${accent};text-transform:uppercase;font-weight:500;margin-bottom:6px;">${esc(label)}</div>
      <div style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#e8e4dd;line-height:1;">${esc(value)}</div>
    </div>
  </td>`;
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
// Escape + convert real newlines to <br> so line breaks survive in
// email clients that strip `white-space: pre-wrap`. Collapses runs of
// 3+ blank lines to a single paragraph break.
function escMultiline(s: string): string {
  return esc(s)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n/g, "<br>");
}
function alpha(hex: string, a: number): string {
  // hex like #c9a84c → rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
