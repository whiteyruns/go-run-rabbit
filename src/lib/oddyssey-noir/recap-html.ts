import type { NoirSummary } from "./pipeline";
import { formatNoirCurrency } from "./pipeline";
import type { NoirWeekOverWeek } from "./history";

export function renderNoirRecapHtml(s: NoirSummary, wow: NoirWeekOverWeek): string {
  const capPct = (s.capacity_percent * 100).toFixed(0);
  const redPct = (s.redemption_rate * 100).toFixed(0);
  const pulledAt = new Date(s.source.pulled_at).toLocaleString("en-US");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Noir Recap · ${escape(s.date_label)}</title></head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
<div style="max-width:640px;margin:0 auto;padding:40px 24px;">

  <div style="border:1px solid rgba(180,110,200,0.3);padding:28px 24px 24px;text-align:center;margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:4px;color:#b46ec8;font-weight:500;text-transform:uppercase;margin-bottom:8px;">Oddyssey Noir · Nightly Recap</div>
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:300;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;color:#e8e4dd;">${escape(s.date_label)}</h1>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
    <tr>
      ${statCell("Tickets Sold", String(s.tickets_sold))}
      ${statCell("Revenue", formatNoirCurrency(s.revenue))}
      ${statCell("Capacity", `${capPct}%`, capacityColor(s.capacity_percent))}
      ${statCell("Redeemed", `${s.redeemed} · ${redPct}%`, "#27ae60")}
    </tr>
  </table>

  ${renderWoW(s, wow)}

  ${section("Ticket Sales by Package", `
    <table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,0.06);">
      <tr style="background:rgba(255,255,255,0.03);">
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#b46ec8;text-transform:uppercase;font-weight:500;">Package</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#b46ec8;text-transform:uppercase;font-weight:500;text-align:right;">Tix</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#b46ec8;text-transform:uppercase;font-weight:500;text-align:right;">Revenue</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#b46ec8;text-transform:uppercase;font-weight:500;text-align:right;">% Mix</td>
      </tr>
      ${s.packages.map((p) => `<tr>
        <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);font-family:Georgia,serif;font-size:15px;color:${p.count > 0 ? "#e8e4dd" : "#5a5650"};">${escape(p.label)}</td>
        <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:18px;color:${p.count > 0 ? "#b46ec8" : "#5a5650"};">${p.count}</td>
        <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:15px;color:${p.count > 0 ? "#e8e4dd" : "#5a5650"};">${formatNoirCurrency(p.revenue)}</td>
        <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-size:12px;color:#9a958d;">${(p.percent * 100).toFixed(1)}%</td>
      </tr>`).join("")}
      <tr>
        <td style="padding:12px 14px;border-top:1px solid #b46ec8;font-size:10px;letter-spacing:2px;color:#5a5650;text-transform:uppercase;font-weight:500;">Total</td>
        <td style="padding:12px 14px;border-top:1px solid #b46ec8;text-align:right;font-family:Georgia,serif;font-size:20px;color:#e8e4dd;">${s.tickets_sold}</td>
        <td style="padding:12px 14px;border-top:1px solid #b46ec8;text-align:right;font-family:Georgia,serif;font-size:20px;color:#e8e4dd;">${formatNoirCurrency(s.revenue)}</td>
        <td style="padding:12px 14px;border-top:1px solid #b46ec8;text-align:right;font-size:12px;color:#5a5650;">${s.tickets_sold}/${s.capacity_total}</td>
      </tr>
    </table>
  `)}

  ${section("Sessions", s.sessions.length === 0 ? `<p style="color:#9a958d;font-size:13px;">No session data.</p>` : s.sessions.map((sess) => {
    const pctCap = (sess.percent * 100).toFixed(0);
    return `<div style="border:1px solid rgba(255,255,255,0.06);padding:16px 18px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
        <div style="font-size:13px;letter-spacing:3px;color:#b46ec8;text-transform:uppercase;font-weight:500;">${escape(sess.time_label)}</div>
        <div style="font-size:11px;color:#5a5650;letter-spacing:1px;text-transform:uppercase;">
          <span style="color:${capacityColor(sess.percent)};font-weight:500;">${sess.admissions}/${sess.capacity} · ${pctCap}%</span>
          ${sess.redeemed > 0 ? `&nbsp;·&nbsp; ${sess.redeemed} redeemed` : ""}
        </div>
      </div>
      ${sess.package_mix.length > 0 ? `<div>
        ${sess.package_mix.map((m) => `<span style="display:inline-block;font-size:10px;letter-spacing:1px;color:#9a958d;padding:3px 8px;border:1px solid rgba(255,255,255,0.08);margin-right:5px;">${escape(m.short_label)} · <strong style="color:#e8e4dd;">${m.count}</strong></span>`).join("")}
      </div>` : ""}
    </div>`;
  }).join(""))}

  ${s.notes.length > 0 ? section("⚠ Guest Notes", s.notes.map((n) => `<div style="padding:8px 12px;background:rgba(192,57,43,0.08);border-left:3px solid #c0392b;margin-bottom:6px;font-size:13px;color:#e8e4dd;">
    <strong>${escape(n.guest)}</strong> · ${escape(n.session)}<br/>
    <span style="color:#9a958d;">${escape(n.note)}</span>
  </div>`).join("")) : ""}

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);font-size:10px;letter-spacing:1px;color:#5a5650;text-transform:uppercase;text-align:center;">
    Source: ${escape(s.source.filename)}<br/>
    Pulled ${escape(pulledAt)}<br/>
    Presented by Go Run Rabbit · <a style="color:#b46ec8;text-decoration:none;" href="https://gorunrabbit.com/oddyssey-manor/admin/noir/summary">View Noir summary</a>
  </div>

</div></body></html>`;
}

function renderWoW(s: NoirSummary, w: NoirWeekOverWeek): string {
  if (!w.available || !w.prior) {
    return section(
      `vs. ${escape(w.prior_date_label)}`,
      `<div style="padding:16px 20px;border:1px dashed rgba(255,255,255,0.08);font-size:12px;color:#9a958d;letter-spacing:0.3px;">
        No snapshot available for ${escape(w.prior_date_label)}. Week-over-week will populate once next week's show has data on file.
      </div>`
    );
  }
  const cells = [
    deltaCell("Tickets", s.tickets_sold, w.prior.tickets, w.deltas.tickets),
    deltaCell("Revenue", formatNoirCurrency(s.revenue), formatNoirCurrency(w.prior.revenue), w.deltas.revenue, (n) => (n >= 0 ? `+${formatNoirCurrency(n)}` : `−${formatNoirCurrency(Math.abs(n))}`)),
    deltaCell(
      "Capacity",
      `${(s.capacity_percent * 100).toFixed(0)}%`,
      `${(w.prior.capacity_percent * 100).toFixed(0)}%`,
      w.deltas.capacity_percent,
      (n) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(0)} pts`
    ),
    deltaCell("Redeemed", s.redeemed, w.prior.redeemed, w.deltas.redeemed),
  ];
  return section(`vs. ${escape(w.prior_date_label)}`, `<table style="width:100%;border-collapse:collapse;"><tr>${cells.join("")}</tr></table>`);
}

function deltaCell(label: string, current: string | number, prior: string | number, deltaRaw: number, formatter?: (n: number) => string) {
  const up = deltaRaw > 0, down = deltaRaw < 0;
  const color = up ? "#27ae60" : down ? "#c0392b" : "#9a958d";
  const arrow = up ? "▲" : down ? "▼" : "—";
  const deltaText = formatter ? formatter(deltaRaw) : `${deltaRaw >= 0 ? "+" : ""}${deltaRaw}`;
  return `<td style="padding:0;border:1px solid rgba(255,255,255,0.06);">
    <div style="padding:14px 12px;text-align:center;">
      <div style="font-size:9px;letter-spacing:2px;color:#9a958d;text-transform:uppercase;font-weight:500;margin-bottom:4px;">${escape(label)}</div>
      <div style="font-family:Georgia,serif;font-size:20px;color:#e8e4dd;line-height:1;">${escape(String(current))}</div>
      <div style="font-size:11px;color:${color};margin-top:6px;letter-spacing:0.3px;">${arrow} ${escape(deltaText)}</div>
      <div style="font-size:9px;color:#5a5650;letter-spacing:1px;margin-top:2px;text-transform:uppercase;">was ${escape(String(prior))}</div>
    </div>
  </td>`;
}

function statCell(label: string, value: string, color?: string) {
  return `<td style="padding:0;border:1px solid rgba(255,255,255,0.06);">
    <div style="padding:20px 16px;text-align:center;">
      <div style="font-size:9px;letter-spacing:3px;color:${color ?? "#b46ec8"};text-transform:uppercase;font-weight:500;margin-bottom:6px;">${escape(label)}</div>
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#e8e4dd;line-height:1;">${escape(value)}</div>
    </div>
  </td>`;
}

function section(title: string, body: string) {
  return `<div style="margin-bottom:28px;">
    <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;color:#e8e4dd;border-bottom:1px solid rgba(180,110,200,0.3);padding-bottom:8px;">${escape(title)}</h2>
    ${body}
  </div>`;
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function capacityColor(percent: number) {
  if (percent >= 0.9) return "#c0392b";
  if (percent >= 0.75) return "#d4b85e";
  if (percent >= 0.5) return "#b46ec8";
  return "#9a958d";
}

export function noirRecapSubject(s: NoirSummary): string {
  const date = new Date(s.date + "T00:00:00");
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Noir Recap · ${weekday} ${monthDay} · ${s.tickets_sold} tix · ${formatNoirCurrency(s.revenue)}`;
}
