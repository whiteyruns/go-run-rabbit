/**
 * Sponsor Recap — email template.
 *
 * Renders a SponsorRecapData object into:
 *   - `subject` — short, specific, brand + date range
 *   - `html`    — inline-styled HTML (table layout, works in Gmail + iOS Mail)
 *   - `text`    — plain-text fallback (deliverability + a11y)
 *
 * All styles are inlined. No <style> block, no external CSS, no web fonts —
 * most email clients strip those.
 *
 * This template is intentionally internal-voice: recipients for v1 are the GM
 * and Beverage Director (Tim), not the partner directly. Tone is "here are
 * the numbers from this week" rather than "dear sponsor". If we later add a
 * partner-facing variant it'll be a separate file.
 */
import type { SponsorRecapData } from './lib';
import { formatNightDate, formatRangeLabel } from './lib';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderSponsorRecap(data: SponsorRecapData): RenderedEmail {
  const rangeLabel = formatRangeLabel(data.rangeStart, data.rangeEnd);
  const kindLabel = data.kind === 'tequila' ? 'Tequila' : 'Champagne';
  const unitSingular = data.kind === 'tequila' ? 'pour (1.5 oz)' : 'flute (2 oz)';

  const subject = `${data.brand} · Golden Hour Recap · ${rangeLabel}`;

  const html = buildHtml({ data, rangeLabel, kindLabel, unitSingular });
  const text = buildText({ data, rangeLabel, kindLabel });

  return { subject, html, text };
}

// ─── HTML ──────────────────────────────────────────────────────────────────

function buildHtml(ctx: {
  data: SponsorRecapData;
  rangeLabel: string;
  kindLabel: string;
  unitSingular: string;
}): string {
  const { data, rangeLabel, kindLabel, unitSingular } = ctx;

  const ACCENT = '#c9a84c';
  const BG = '#060606';
  const SURFACE = '#0d0d0d';
  const BORDER = 'rgba(255,255,255,0.08)';
  const TEXT = '#e8e4dd';
  const MUTED = '#9a958d';

  const notesRows = data.nights
    .filter((n) => n.notes && n.notes.trim().length > 0)
    .map((n) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};font-family:Georgia,serif;color:${TEXT};font-size:14px;vertical-align:top;width:120px;">
            <strong style="color:${ACCENT};font-weight:500;">${escapeHtml(formatNightDate(n.date))}</strong>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};font-family:Georgia,serif;font-style:italic;color:${TEXT};font-size:14px;line-height:1.55;vertical-align:top;">
            "${escapeHtml(n.notes ?? '')}"
          </td>
        </tr>`)
    .join('');

  const nightRows = data.nights.map((n) => {
    const attach = n.attachRatePct == null ? '—' : `${n.attachRatePct.toFixed(1)}%`;
    const tickets = n.ticketsSold == null ? '—' : String(n.ticketsSold);
    return `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid ${BORDER};font-family:Georgia,serif;color:${TEXT};font-size:14px;">
            <div style="font-weight:500;">${escapeHtml(formatNightDate(n.date))}</div>
            <div style="color:${MUTED};font-size:12px;font-style:italic;margin-top:2px;">${escapeHtml(n.themeLabel)}</div>
          </td>
          <td align="right" style="padding:12px 14px;border-bottom:1px solid ${BORDER};font-family:'Courier New',monospace;color:${TEXT};font-size:14px;">${n.bottlesConsumed.toFixed(1)}</td>
          <td align="right" style="padding:12px 14px;border-bottom:1px solid ${BORDER};font-family:'Courier New',monospace;color:${TEXT};font-size:14px;">${n.estimatedPours}</td>
          <td align="right" style="padding:12px 14px;border-bottom:1px solid ${BORDER};font-family:'Courier New',monospace;color:${MUTED};font-size:14px;">${tickets}</td>
          <td align="right" style="padding:12px 14px;border-bottom:1px solid ${BORDER};font-family:'Courier New',monospace;color:${ACCENT};font-size:14px;font-weight:500;">${attach}</td>
        </tr>`;
  }).join('');

  const totalAttach =
    data.totals.attachRatePct == null
      ? '—'
      : `${data.totals.attachRatePct.toFixed(1)}%`;
  const totalTickets =
    data.totals.tickets == null ? '—' : data.totals.tickets.toString();

  const ticketCaveat =
    data.totals.tickets == null
      ? `<tr><td colspan="5" style="padding:10px 14px;font-family:Georgia,serif;font-style:italic;color:${MUTED};font-size:12px;border-bottom:1px solid ${BORDER};">Ticket counts pending for one or more nights — attach rate shown only for nights with confirmed data.</td></tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(data.brand)} · Golden Hour Recap · ${escapeHtml(rangeLabel)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};color:${TEXT};font-family:Georgia,serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${SURFACE};border:1px solid ${BORDER};border-top:2px solid ${ACCENT};">

          <!-- Header -->
          <tr>
            <td style="padding:28px 28px 20px;border-bottom:1px solid ${BORDER};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${ACCENT};font-weight:600;margin-bottom:10px;">
                Oddyssey · Golden Hour · Sponsor Recap
              </div>
              <div style="font-family:Georgia,serif;font-weight:400;font-size:28px;color:${TEXT};line-height:1.2;">
                ${escapeHtml(data.brand)} · <em style="color:${ACCENT};">${escapeHtml(rangeLabel)}</em>
              </div>
              <div style="font-family:Georgia,serif;font-style:italic;color:${MUTED};font-size:14px;margin-top:6px;">
                ${kindLabel} sponsor · ${data.totals.activations} activation${data.totals.activations === 1 ? '' : 's'} this week
              </div>
            </td>
          </tr>

          <!-- Summary tiles -->
          <tr>
            <td style="padding:24px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${tile({ label: 'Bottles consumed', value: data.totals.bottles.toFixed(1), accent: ACCENT, muted: MUTED, border: BORDER })}
                  ${tile({ label: `Estimated ${unitSingular}s`, value: data.totals.pours.toString(), accent: ACCENT, muted: MUTED, border: BORDER })}
                  ${tile({ label: 'Tickets sold', value: totalTickets, accent: ACCENT, muted: MUTED, border: BORDER })}
                  ${tile({ label: 'Attach rate', value: totalAttach, accent: ACCENT, muted: MUTED, border: BORDER, last: true })}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Nightly breakdown -->
          <tr>
            <td style="padding:20px 28px 8px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:${ACCENT};font-weight:600;margin-bottom:10px;">
                Nightly breakdown
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};">
                <tr>
                  <th align="left"  style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};font-weight:500;border-bottom:1px solid ${BORDER};">Night</th>
                  <th align="right" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};font-weight:500;border-bottom:1px solid ${BORDER};">Btl</th>
                  <th align="right" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};font-weight:500;border-bottom:1px solid ${BORDER};">Pours</th>
                  <th align="right" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};font-weight:500;border-bottom:1px solid ${BORDER};">Tix</th>
                  <th align="right" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};font-weight:500;border-bottom:1px solid ${BORDER};">Attach</th>
                </tr>
                ${nightRows || `<tr><td colspan="5" style="padding:20px 14px;font-family:Georgia,serif;font-style:italic;color:${MUTED};text-align:center;">No activations recorded this week.</td></tr>`}
                ${ticketCaveat}
              </table>
            </td>
          </tr>

          ${notesRows ? `
          <!-- Notes -->
          <tr>
            <td style="padding:20px 28px 8px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:${ACCENT};font-weight:600;margin-bottom:10px;">
                Notes from the floor
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};">
                ${notesRows}
              </table>
            </td>
          </tr>` : ''}

          <!-- Methodology -->
          <tr>
            <td style="padding:20px 28px;border-top:1px solid ${BORDER};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:${MUTED};font-weight:500;margin-bottom:8px;">
                How this was measured
              </div>
              <div style="font-family:Georgia,serif;font-style:italic;color:${MUTED};font-size:13px;line-height:1.6;">
                Bottles consumed = bottles opened minus bottles left at close, logged by the GM at the end of each Golden Hour service.
                Pours estimated at ${data.kind === 'tequila' ? '1.5 oz per pour' : '2 oz per flute'} (≈${data.kind === 'tequila' ? '16.9' : '12.7'} per 750 ml bottle).
                Attach rate = estimated pours ÷ tickets sold that night, from Ticketure admin.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${BORDER};background:${BG};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};line-height:1.55;">
                Oddyssey Manor · AREA15 Las Vegas<br/>
                Filed from the unified dashboard · Questions → <a href="mailto:keith@gorunrabbit.com" style="color:${ACCENT};text-decoration:none;">keith@gorunrabbit.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function tile(opts: {
  label: string;
  value: string;
  accent: string;
  muted: string;
  border: string;
  last?: boolean;
}): string {
  const rightBorder = opts.last ? '' : `border-right:1px solid ${opts.border};`;
  return `
  <td width="25%" valign="top" align="center" style="padding:14px 10px;${rightBorder}">
    <div style="font-family:'Courier New',monospace;font-size:22px;color:${opts.accent};font-weight:500;line-height:1.2;">${escapeHtml(opts.value)}</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:${opts.muted};margin-top:6px;">${escapeHtml(opts.label)}</div>
  </td>`;
}

// ─── Plain text fallback ───────────────────────────────────────────────────

function buildText(ctx: {
  data: SponsorRecapData;
  rangeLabel: string;
  kindLabel: string;
}): string {
  const { data, rangeLabel, kindLabel } = ctx;
  const lines: string[] = [];
  lines.push(`${data.brand} · Golden Hour Recap · ${rangeLabel}`);
  lines.push(`${kindLabel} sponsor · ${data.totals.activations} activation${data.totals.activations === 1 ? '' : 's'} this week`);
  lines.push('');
  lines.push(`Bottles consumed:   ${data.totals.bottles.toFixed(1)}`);
  lines.push(`Estimated pours:    ${data.totals.pours}`);
  lines.push(`Tickets sold:       ${data.totals.tickets ?? '—'}`);
  lines.push(`Attach rate:        ${data.totals.attachRatePct == null ? '—' : data.totals.attachRatePct.toFixed(1) + '%'}`);
  lines.push('');
  lines.push('Nightly breakdown');
  lines.push('-----------------');
  for (const n of data.nights) {
    const attach = n.attachRatePct == null ? '—' : `${n.attachRatePct.toFixed(1)}%`;
    const tix = n.ticketsSold ?? '—';
    lines.push(`${formatNightDate(n.date)} · ${n.themeLabel} · ${n.bottlesConsumed.toFixed(1)} btl · ${n.estimatedPours} pours · ${tix} tix · ${attach}`);
    if (n.notes && n.notes.trim()) lines.push(`  "${n.notes.trim()}"`);
  }
  lines.push('');
  lines.push('Methodology: bottles opened minus left at close, logged by GM at end of service.');
  lines.push(`Pours estimated at ${data.kind === 'tequila' ? '1.5 oz' : '2 oz'} per serve (≈${data.kind === 'tequila' ? '16.9' : '12.7'}/bottle).`);
  lines.push('Attach rate = pours ÷ tickets sold that night.');
  lines.push('');
  lines.push('Oddyssey Manor · AREA15 Las Vegas · keith@gorunrabbit.com');
  return lines.join('\n');
}

// ─── Utils ─────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
