/**
 * Renderers for the Promo Report — invoice-ready plain text (for Brandon to
 * copy/paste into iMessage) and an HTML email block (for the Monday recap).
 *
 * Visual style mirrors recap-html.ts: dark palette, purple Noir accent,
 * Georgia for figures, monospace for eyebrows.
 */

import type { PromoNightCode, PromoReportResult } from './promo-report-parser';

/**
 * Plain-text invoice block, matching the format Brandon already uses in his
 * iMessage thread:
 *
 *   5/30 Incentives
 *   Tyler Anthony: $25 — 5 redemptions
 *   Christina D: $10 — 2 redemptions
 *   ...
 */
export function renderPromoInvoiceText(result: PromoReportResult): string {
  if (result.promoters.length === 0) {
    return '(no promoter redemptions)';
  }
  const blocks: string[] = [];
  for (const night of result.promoters) {
    if (night.codes.length === 0) continue;
    const total = night.codes.reduce((a, c) => a + c.owed, 0);
    const header = `${shortDate(night.date)} Incentives`;
    const lines = night.codes.map(
      (c) => `${c.mapped?.displayName ?? c.code}: $${c.owed} — ${c.count} redemption${c.count === 1 ? '' : 's'}`,
    );
    blocks.push(`${header}\n${lines.join('\n')}\nNight total: $${total}`);
  }
  blocks.push(`Weekend total: $${result.totals.promoterOwed}`);
  return blocks.join('\n\n');
}

/**
 * HTML email block. Designed to be inserted INTO an existing email body,
 * not stand alone — so no <html>/<head> wrapper.
 */
export function renderPromoReportHtmlBlock(result: PromoReportResult): string {
  const accent = '#b46ec8';
  const text = '#e8e4dd';
  const muted = '#9a958d';
  const dim = '#5a5650';
  const bg = '#0d0d0d';
  const border = 'rgba(255,255,255,0.06)';

  const sections: string[] = [];

  // Header
  sections.push(`
    <div style="margin-top:36px;padding-top:24px;border-top:1px solid ${accent};">
      <div style="font-family:Consolas,monospace;font-size:10px;letter-spacing:4px;color:${accent};text-transform:uppercase;font-weight:500;margin-bottom:8px;">
        Noir · Promo Redemptions
      </div>
      <div style="font-family:Georgia,serif;font-size:24px;font-weight:300;letter-spacing:1px;color:${text};margin-bottom:6px;">
        ${escape(result.weekendLabel)}
      </div>
      <div style="font-size:12px;color:${muted};letter-spacing:0.5px;">
        ${result.totals.promoterRedemptions} promoter redemptions · <strong style="color:${text};">$${result.totals.promoterOwed}</strong> owed
        ${result.totals.nonPromoterRedemptions > 0 ? ` · ${result.totals.nonPromoterRedemptions} non-promoter` : ''}
        ${result.totals.unmappedRedemptions > 0 ? ` · ${result.totals.unmappedRedemptions} unmapped` : ''}
      </div>
    </div>
  `);

  // Promoter table (per-night blocks)
  for (const night of result.promoters) {
    if (night.codes.length === 0) continue;
    const nightTotal = night.codes.reduce((a, c) => a + c.owed, 0);
    sections.push(`
      <div style="margin-top:24px;background:${bg};border:1px solid ${border};">
        <div style="padding:12px 16px;background:rgba(180,110,200,0.06);border-bottom:1px solid ${border};">
          <span style="font-family:Consolas,monospace;font-size:10px;letter-spacing:2px;color:${accent};text-transform:uppercase;font-weight:500;">
            ${night.dayOfWeek === 'fri' ? 'Friday' : 'Saturday'} · ${shortDate(night.date)}
          </span>
          <span style="float:right;font-family:Georgia,serif;font-size:16px;color:${text};">$${nightTotal}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${night.codes.map((c) => renderPromoRow(c, accent, text, muted)).join('')}
        </table>
      </div>
    `);
  }

  // Non-promoter block (collapsed visual weight)
  const anyNonPromoter = result.nonPromoter.some((n) => n.codes.length > 0);
  if (anyNonPromoter) {
    sections.push(`
      <div style="margin-top:20px;padding:14px 16px;border:1px solid ${border};">
        <div style="font-family:Consolas,monospace;font-size:10px;letter-spacing:2px;color:${dim};text-transform:uppercase;margin-bottom:8px;">
          GM / Guest / Cross-Comp (no incentive)
        </div>
        ${result.nonPromoter.map((night) => {
          if (night.codes.length === 0) return '';
          return `<div style="font-size:12px;color:${muted};margin-bottom:4px;">
            <strong style="color:${text};">${shortDate(night.date)}:</strong>
            ${night.codes.map((c) => `${c.mapped?.displayName ?? c.code} (${c.count})`).join(' · ')}
          </div>`;
        }).join('')}
      </div>
    `);
  }

  if (result.unmappedCodes.length > 0) {
    sections.push(`
      <div style="margin-top:20px;padding:14px 16px;border:1px solid rgba(212,165,116,0.35);background:rgba(212,165,116,0.06);">
        <div style="font-family:Consolas,monospace;font-size:10px;letter-spacing:2px;color:#d4a574;text-transform:uppercase;margin-bottom:8px;">
          Unmapped codes — add to promoter-map.ts
        </div>
        ${result.unmappedCodes.map((u) => `<div style="font-size:12px;color:${muted};">
          <strong style="color:${text};">${shortDate(u.date)}:</strong> ${escape(u.code)} (${u.count})
        </div>`).join('')}
      </div>
    `);
  }

  return sections.join('');
}

function renderPromoRow(c: PromoNightCode, accent: string, text: string, muted: string): string {
  return `<tr>
    <td style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04);font-family:Georgia,serif;font-size:15px;color:${text};">
      ${escape(c.mapped?.displayName ?? c.code)}
    </td>
    <td style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04);font-family:Consolas,monospace;font-size:11px;color:${muted};letter-spacing:1px;">
      ${escape(c.code)}
    </td>
    <td style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04);text-align:right;font-family:Georgia,serif;font-size:18px;color:${accent};">
      ${c.count}
    </td>
    <td style="padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04);text-align:right;font-family:Georgia,serif;font-size:15px;color:${text};">
      $${c.owed}
    </td>
  </tr>`;
}

function shortDate(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Standalone HTML page (used by the "View" link to preview the email body).
 */
export function renderPromoReportStandalone(result: PromoReportResult): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Promo Report · ${escape(result.weekendLabel)}</title></head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
<div style="max-width:640px;margin:0 auto;padding:40px 24px;">
  ${renderPromoReportHtmlBlock(result)}
</div>
</body></html>`;
}
