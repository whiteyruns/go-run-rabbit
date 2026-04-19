// Shared email-safe Channel Mix block for the nightly recap emails.
// Kept in the cross-venue sessions lib because both Manor and Noir
// recaps now render this section when third-party activity is present.

import { computeChannelMix, type TicketGroupReport } from "./channel-mix";

interface Palette {
  accent: string; // venue accent (gold for Manor, purple for Noir)
  thirdParty: string; // third-party accent — consistent across venues
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Renders the Channel Mix section for nightly recap emails. Returns an
 * empty string when there's no third-party activity (most nights), so
 * callers can concatenate unconditionally.
 */
export function renderChannelMixHtml(
  groups: TicketGroupReport[] | null | undefined,
  palette: Palette = { accent: "#c9a84c", thirdParty: "#8b6fb0" },
): string {
  if (!groups || groups.length === 0) return "";
  const mix = computeChannelMix(groups);
  if (mix.third_party_gross <= 0) return ""; // skip when no third-party activity
  const directPct = (1 - mix.third_party_pct) * 100;
  const thirdPct = mix.third_party_pct * 100;

  const statCell = (label: string, value: string, color: string, sub?: string) => `
    <td style="padding:0;border:1px solid rgba(255,255,255,0.06);">
      <div style="padding:18px 16px;text-align:center;">
        <div style="font-size:9px;letter-spacing:3px;color:${color};text-transform:uppercase;font-weight:500;margin-bottom:6px;">${esc(label)}</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:#e8e4dd;line-height:1;">${esc(value)}</div>
        ${sub ? `<div style="font-size:10px;color:#9a958d;letter-spacing:0.3px;margin-top:6px;">${esc(sub)}</div>` : ""}
      </div>
    </td>
  `;

  const lineRow = (l: (typeof mix.third_party_lines)[number]) => `
    <tr>
      <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);font-family:Georgia,serif;font-size:14px;color:#e8e4dd;">${esc(l.name)}</td>
      <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:14px;color:#e8e4dd;">${fmt(l.gross)}</td>
      <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-size:12px;color:#9a958d;">${l.rate != null ? (l.rate * 100).toFixed(0) + "%" : "—"}</td>
      <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:14px;color:#c0392b;">−${fmt(l.commission)}</td>
      <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:14px;color:#27ae60;">${fmt(l.net)}</td>
    </tr>
  `;

  return `
  <div style="margin-bottom:28px;">
    <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;color:#e8e4dd;border-bottom:1px solid ${palette.thirdParty}40;padding-bottom:8px;">Channel Mix</h2>

    <!-- Stacked bar (table-based for email client support) -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr style="height:28px;">
        <td style="width:${directPct.toFixed(1)}%;background:${palette.accent};color:#060606;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;text-align:center;padding:0 8px;">${directPct >= 14 ? `Direct ${directPct.toFixed(0)}%` : ""}</td>
        <td style="width:${thirdPct.toFixed(1)}%;background:${palette.thirdParty};color:#fff;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;text-align:center;padding:0 8px;">${thirdPct >= 10 ? `Third-party ${thirdPct.toFixed(0)}%` : ""}</td>
      </tr>
    </table>

    <!-- Three headline stats -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr>
        ${statCell("Direct Gross", fmt(mix.direct_gross), palette.accent, `${directPct.toFixed(1)}% of night`)}
        ${statCell("Third-Party Gross", fmt(mix.third_party_gross), palette.thirdParty, mix.commission_rate != null ? `${(mix.commission_rate * 100).toFixed(0)}% commission` : "")}
        ${statCell("Net to Oddyssey", fmt(mix.net_to_oddyssey), "#27ae60", mix.commission_amount > 0 ? `after ${fmt(mix.commission_amount)} commission` : "")}
      </tr>
    </table>

    <!-- Third-party line detail -->
    <table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,0.06);">
      <tr style="background:rgba(255,255,255,0.03);">
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:${palette.thirdParty};text-transform:uppercase;font-weight:500;">Third-Party Line</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:${palette.thirdParty};text-transform:uppercase;font-weight:500;text-align:right;">Gross</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:${palette.thirdParty};text-transform:uppercase;font-weight:500;text-align:right;">Rate</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:${palette.thirdParty};text-transform:uppercase;font-weight:500;text-align:right;">Commission</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:${palette.thirdParty};text-transform:uppercase;font-weight:500;text-align:right;">Net</td>
      </tr>
      ${mix.third_party_lines.map(lineRow).join("")}
    </table>

    <div style="margin-top:10px;padding:8px 14px;background:rgba(139,111,176,0.06);border-left:3px solid ${palette.thirdParty};font-size:10px;color:#9a958d;line-height:1.6;">
      <strong style="color:${palette.thirdParty};">Third-party</strong> = resold through an OTA (hotel concierge, TixTrack, Fever, etc.). Commission rate is parsed from the group name. Ticketure's Net-to-Bank already subtracts this.
    </div>
  </div>
  `;
}
