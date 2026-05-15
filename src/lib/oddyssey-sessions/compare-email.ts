// Build the "Oddyssey · date vs compareDate" email body. Mirrors the
// at-a-glance tiles from the control-room snapshot so Brandon (or any
// recipient) sees the same Manor + Noir comparison numbers without
// opening the dashboard.
//
// Pulls data from the on-disk session-summary JSONs via the same
// loader the dashboards use, so the email and the screen never drift.

import { loadSessionReport, sumSessionReport, type SessionReportTotals } from "./loader";

export interface CompareEmailInput {
  date: string;
  compareDate?: string;
  // Optional override for the "view in dashboard" URL in the footer.
  baseUrl?: string;
}

export interface CompareEmailOutput {
  subject: string;
  html: string;
  text: string;
}

interface VenueRow {
  label: string;
  current: number | null;
  prior: number | null;
  format: "int" | "money" | "percent";
  upIsGood?: boolean;
}

function fmtMoney(n: number | null): string {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtInt(n: number | null): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("en-US");
}
function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}
function fmtValue(n: number | null, fmt: VenueRow["format"]): string {
  switch (fmt) {
    case "money": return fmtMoney(n);
    case "percent": return fmtPct(n);
    default: return fmtInt(n);
  }
}

function manorRows(totals: SessionReportTotals | null, prior: SessionReportTotals | null): VenueRow[] {
  return [
    {
      label: "Admissions",
      current: totals?.reserved_admissions ?? null,
      prior: prior?.reserved_admissions ?? null,
      format: "int",
    },
    {
      label: "Capacity",
      current:
        totals && totals.capacity > 0
          ? (totals.reserved_admissions / totals.capacity) * 100
          : null,
      prior:
        prior && prior.capacity > 0
          ? (prior.reserved_admissions / prior.capacity) * 100
          : null,
      format: "percent",
    },
    { label: "Gross", current: totals?.gross_revenue ?? null, prior: prior?.gross_revenue ?? null, format: "money" },
    { label: "Net to Bank", current: totals?.net_to_bank ?? null, prior: prior?.net_to_bank ?? null, format: "money" },
    { label: "Paid", current: totals?.tickets_paid ?? null, prior: prior?.tickets_paid ?? null, format: "int" },
    {
      label: "Free (Comps)",
      current: totals?.tickets_free_admissions ?? null,
      prior: prior?.tickets_free_admissions ?? null,
      format: "int",
      upIsGood: false,
    },
  ];
}

function noirRows(totals: SessionReportTotals | null, prior: SessionReportTotals | null): VenueRow[] {
  return [
    { label: "Tickets Sold", current: totals?.reserved ?? null, prior: prior?.reserved ?? null, format: "int" },
    {
      label: "Capacity",
      current: totals ? totals.capacity_percent * 100 : null,
      prior: prior ? prior.capacity_percent * 100 : null,
      format: "percent",
    },
    { label: "Gross", current: totals?.gross_revenue ?? null, prior: prior?.gross_revenue ?? null, format: "money" },
    { label: "Net to Bank", current: totals?.net_to_bank ?? null, prior: prior?.net_to_bank ?? null, format: "money" },
    { label: "Paid", current: totals?.tickets_paid ?? null, prior: prior?.tickets_paid ?? null, format: "int" },
    { label: "Free (Comps)", current: totals?.tickets_free ?? null, prior: prior?.tickets_free ?? null, format: "int", upIsGood: false },
  ];
}

function loadTotals(venue: "manor" | "noir", date: string): SessionReportTotals | null {
  const report = loadSessionReport(venue, date);
  return report ? sumSessionReport(report) : null;
}

function deltaText(row: VenueRow): { text: string; color: string } {
  if (row.current == null || row.prior == null) {
    return { text: "—", color: "#9a958d" };
  }
  const diff = row.current - row.prior;
  const pct = row.prior !== 0 ? (diff / row.prior) * 100 : null;
  const isFlat = diff === 0;
  const isUp = diff > 0;
  const upIsGood = row.upIsGood ?? true;
  const color = isFlat
    ? "#9a958d"
    : isUp === upIsGood
      ? "#27ae60"
      : "#c0392b";
  const arrow = isFlat ? "·" : isUp ? "↑" : "↓";
  const sign = isUp ? "+" : isFlat ? "" : "−";
  const abs = Math.abs(diff);
  let absStr: string;
  switch (row.format) {
    case "money":
      absStr = `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      break;
    case "percent":
      absStr = `${abs.toFixed(1)}pp`;
      break;
    default:
      absStr = Math.round(abs).toLocaleString("en-US");
  }
  const pctStr =
    pct != null
      ? ` (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`
      : "";
  return { text: `${arrow} ${sign}${absStr}${pctStr}`, color };
}

function renderVenueTable(
  title: string,
  accent: string,
  rows: VenueRow[],
  showCompare: boolean,
  compareLabel: string,
): string {
  const cellPad = "padding:10px 12px;";
  const headerStyle =
    `background:#0d0d0d;color:${accent};font:600 10px/1.2 'Consolas',monospace;letter-spacing:0.22em;text-transform:uppercase;` +
    cellPad +
    "border-bottom:1px solid rgba(255,255,255,0.08);";
  const labelCell =
    "background:#0a0a0a;color:#9a958d;font:600 10px/1.4 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.18em;text-transform:uppercase;" +
    cellPad +
    "width:38%;border-bottom:1px solid rgba(255,255,255,0.05);";
  const valueCell =
    "background:#0a0a0a;color:#e8e4dd;font:300 22px/1.1 'Cormorant Garamond',Georgia,serif;" +
    cellPad +
    "border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;";
  const deltaCell =
    "background:#0a0a0a;font:600 11px/1.2 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.4px;" +
    cellPad +
    "border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;white-space:nowrap;";

  const rowsHtml = rows
    .map((r) => {
      const d = deltaText(r);
      const compareCol = showCompare
        ? `<td style="${deltaCell}color:${d.color};">${d.text}</td>`
        : "";
      return `<tr><td style="${labelCell}">${r.label}</td><td style="${valueCell}">${fmtValue(r.current, r.format)}</td>${compareCol}</tr>`;
    })
    .join("");

  const headerCols = showCompare ? 3 : 2;
  return `
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="border:1px solid ${accent}33;background:#0a0a0a;margin-bottom:18px;">
      <tr>
        <td colspan="${headerCols}" style="${headerStyle}">${title}${showCompare ? ` <span style="color:#9a958d;font-weight:400;">vs ${compareLabel}</span>` : ""}</td>
      </tr>
      ${rowsHtml}
    </table>
  `;
}

export function buildCompareEmail(input: CompareEmailInput): CompareEmailOutput {
  const { date, compareDate, baseUrl = "https://gorunrabbit.com" } = input;
  const manorCur = loadTotals("manor", date);
  const noirCur = loadTotals("noir", date);
  const manorPri = compareDate ? loadTotals("manor", compareDate) : null;
  const noirPri = compareDate ? loadTotals("noir", compareDate) : null;
  const showCompare = Boolean(compareDate);

  const subject = showCompare
    ? `[Oddyssey] Snapshot · ${date} vs ${compareDate}`
    : `[Oddyssey] Snapshot · ${date}`;

  const manorTable = renderVenueTable(
    "Oddyssey Manor",
    "#c9a84c",
    manorRows(manorCur, manorPri),
    showCompare,
    compareDate ?? "",
  );
  const noirTable = renderVenueTable(
    "Oddyssey Noir",
    "#b46ec8",
    noirRows(noirCur, noirPri),
    showCompare,
    compareDate ?? "",
  );

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
  <div style="max-width:680px;margin:0 auto;padding:40px 24px 56px;">
    <div style="border:1px solid rgba(255,255,255,0.08);padding:24px 22px;margin-bottom:24px;text-align:center;">
      <div style="font:500 10px/1.2 'Consolas',monospace;letter-spacing:0.24em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">Oddyssey · Snapshot</div>
      <div style="font:300 30px/1.1 'Cormorant Garamond',Georgia,serif;letter-spacing:1px;">${date}${showCompare ? ` <span style="color:#9a958d;font-size:18px;">vs ${compareDate}</span>` : ""}</div>
    </div>
    ${manorTable}
    ${noirTable}
    <div style="margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);font:400 11px/1.5 'Helvetica Neue',Arial,sans-serif;color:#9a958d;letter-spacing:0.3px;">
      Source: Ticketure Session Summary Report · admissions excludes food-voucher line items.
    </div>
    <div style="margin-top:18px;font:600 11px/1.2 'Helvetica Neue',Arial,sans-serif;letter-spacing:0.4px;">
      <a href="${baseUrl}/oddyssey-manor/admin" style="color:#c9a84c;text-decoration:none;">Open control room →</a>
    </div>
  </div>
</body></html>`;

  const venueText = (title: string, rows: VenueRow[]) =>
    `${title}\n` +
    rows
      .map((r) => {
        const d = showCompare ? `  ${deltaText(r).text}` : "";
        return `  ${r.label.padEnd(14)} ${fmtValue(r.current, r.format).padStart(14)}${d}`;
      })
      .join("\n");

  const text =
    `Oddyssey · Snapshot · ${date}${showCompare ? ` vs ${compareDate}` : ""}\n\n` +
    venueText("MANOR", manorRows(manorCur, manorPri)) +
    "\n\n" +
    venueText("NOIR", noirRows(noirCur, noirPri)) +
    `\n\nSource: Ticketure Session Summary Report (admissions excludes food vouchers)\n` +
    `Open control room: ${baseUrl}/oddyssey-manor/admin\n`;

  return { subject, html, text };
}
