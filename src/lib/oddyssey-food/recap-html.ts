import type { RecapData } from "./recap";
import { formatCurrency } from "./summary";

// Produces a standalone HTML email body. Styled with noir palette, inlined
// CSS (email-client compatible), no external dependencies.
export function renderRecapHtml(r: RecapData): string {
  const pct = (r.stats.redemption_rate * 100).toFixed(0);
  const capPct = (r.stats.capacity_percent * 100).toFixed(0);
  const pulledAt = new Date(r.source_pulled_at).toLocaleString("en-US");
  const hasPackages = r.packages.some((p) => p.count > 0);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Manor Recap · ${escape(r.date_label)}</title>
</head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e4dd;">
<div style="max-width:640px;margin:0 auto;padding:40px 24px;">

  <div style="border:1px solid rgba(201,168,76,0.25);padding:28px 24px 24px;text-align:center;margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:4px;color:#c9a84c;font-weight:500;text-transform:uppercase;margin-bottom:8px;">Oddyssey Manor · Nightly Recap</div>
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:300;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;color:#e8e4dd;">${escape(r.date_label)}</h1>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
    <tr>
      ${statCell("Tickets Sold", String(r.stats.admission_tickets))}
      ${statCell("Revenue", formatCurrency(r.stats.revenue))}
      ${statCell("Capacity", `${capPct}%`, capacityColor(r.stats.capacity_percent))}
      ${statCell("Parties", String(r.stats.parties))}
    </tr>
    <tr>
      ${statCell("Food Items", String(r.stats.food_items))}
      ${statCell("Redeemed", `${r.stats.redeemed} · ${pct}%`, "#27ae60")}
      ${statCell("VIPs", String(r.stats.vip_parties), "#d4b85e")}
      ${statCell("Notes", String(r.stats.note_parties), "#c0392b")}
    </tr>
  </table>

  ${hasPackages ? section("Ticket Sales by Package", `
    <table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,0.06);">
      <tr style="background:rgba(255,255,255,0.03);">
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#c9a84c;text-transform:uppercase;font-weight:500;">Package</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#c9a84c;text-transform:uppercase;font-weight:500;text-align:right;">Tix</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#c9a84c;text-transform:uppercase;font-weight:500;text-align:right;">Revenue</td>
        <td style="padding:10px 14px;font-size:9px;letter-spacing:2px;color:#c9a84c;text-transform:uppercase;font-weight:500;text-align:right;">% Mix</td>
      </tr>
      ${r.packages
        .map(
          (p) => `<tr>
            <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);font-family:Georgia,serif;font-size:15px;color:${p.count > 0 ? "#e8e4dd" : "#5a5650"};">${escape(p.label)}</td>
            <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:18px;color:${p.count > 0 ? "#c9a84c" : "#5a5650"};">${p.count}</td>
            <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:15px;color:${p.count > 0 ? "#e8e4dd" : "#5a5650"};">${formatCurrency(p.revenue)}</td>
            <td style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);text-align:right;font-size:12px;color:#9a958d;">${(p.percent * 100).toFixed(1)}%</td>
          </tr>`
        )
        .join("")}
      <tr>
        <td style="padding:12px 14px;border-top:1px solid #c9a84c;font-size:10px;letter-spacing:2px;color:#5a5650;text-transform:uppercase;font-weight:500;">Total</td>
        <td style="padding:12px 14px;border-top:1px solid #c9a84c;text-align:right;font-family:Georgia,serif;font-size:20px;color:#e8e4dd;">${r.stats.admission_tickets}</td>
        <td style="padding:12px 14px;border-top:1px solid #c9a84c;text-align:right;font-family:Georgia,serif;font-size:20px;color:#e8e4dd;">${formatCurrency(r.stats.revenue)}</td>
        <td style="padding:12px 14px;border-top:1px solid #c9a84c;text-align:right;font-size:12px;color:#5a5650;">${r.stats.admission_tickets}/${r.stats.capacity_total}</td>
      </tr>
    </table>
  `) : ""}

  ${r.item_totals.length > 0 ? section("Item Totals", `
    <table style="width:100%;border-collapse:collapse;">
      ${r.item_totals
        .map(
          (t) => `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:Georgia,serif;font-size:16px;color:${t.id === "__unknown__" ? "#c0392b" : "#e8e4dd"};">${escape(t.label)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;font-family:Georgia,serif;font-size:20px;color:#c9a84c;">${t.count}</td>
          </tr>`
        )
        .join("")}
    </table>
  `) : ""}

  ${section("Sessions", r.sessions.length === 0 ? `<p style="color:#9a958d;font-size:13px;">No sessions.</p>` : r.sessions
    .map(
      (s) => {
        const pctCap = (s.percent * 100).toFixed(0);
        const capColor = capacityColor(s.percent);
        return `
      <div style="border:1px solid rgba(255,255,255,0.06);padding:16px 18px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div style="font-size:13px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;font-weight:500;">${escape(s.time)}</div>
          <div style="font-size:11px;color:#5a5650;letter-spacing:1px;text-transform:uppercase;">
            <span style="color:${capColor};font-weight:500;">${s.admissions}/${s.capacity} · ${pctCap}%</span>
            &nbsp;·&nbsp; ${s.items} items
          </div>
        </div>
        ${s.package_mix.length > 0 ? `<div style="margin-bottom:10px;">
          ${s.package_mix.map((m) => `<span style="display:inline-block;font-size:10px;letter-spacing:1px;color:#9a958d;padding:3px 8px;border:1px solid rgba(255,255,255,0.08);margin-right:5px;">${escape(m.short_label)} · <strong style="color:#e8e4dd;">${m.count}</strong></span>`).join("")}
        </div>` : ""}
        ${s.breakdown
          .map(
            (b) => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;color:#9a958d;">
              <span>${escape(b.label)}</span><span style="color:#c9a84c;">${b.count}</span>
            </div>`
          )
          .join("")}
      </div>`;
      }
    )
    .join("")
  )}

  ${r.vips.length > 0 ? section("⭐ VIP Parties", r.vips
    .map(
      (v) => `<div style="padding:8px 12px;background:rgba(212,184,94,0.08);border-left:3px solid #d4b85e;margin-bottom:6px;font-size:13px;color:#e8e4dd;">
        <strong>${escape(v.guest)}</strong> · ${escape(v.session)} · party of ${v.party_size}
      </div>`
    )
    .join("")) : ""}

  ${r.notes.length > 0 ? section("⚠ Guest Notes & Allergies", r.notes
    .map(
      (n) => `<div style="padding:8px 12px;background:rgba(192,57,43,0.08);border-left:3px solid #c0392b;margin-bottom:6px;font-size:13px;color:#e8e4dd;">
        <strong>${escape(n.guest)}</strong> · ${escape(n.session)}<br/>
        <span style="color:#9a958d;">${escape(n.note)}</span>
      </div>`
    )
    .join("")) : ""}

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);font-size:10px;letter-spacing:1px;color:#5a5650;text-transform:uppercase;text-align:center;">
    Source: ${escape(r.source_filename)}<br/>
    Pulled ${escape(pulledAt)}<br/>
    Presented by Go Run Rabbit · <a style="color:#c9a84c;text-decoration:none;" href="https://gorunrabbit.com/oddyssey-manor/admin/food/roster">View full roster</a>
  </div>

</div>
</body>
</html>`;
}

function statCell(label: string, value: string, color?: string): string {
  return `<td style="padding:0;border:1px solid rgba(255,255,255,0.06);">
    <div style="padding:20px 16px;text-align:center;">
      <div style="font-size:9px;letter-spacing:3px;color:${color ?? "#c9a84c"};text-transform:uppercase;font-weight:500;margin-bottom:6px;">${escape(label)}</div>
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#e8e4dd;line-height:1;">${escape(value)}</div>
    </div>
  </td>`;
}

function section(title: string, body: string): string {
  return `<div style="margin-bottom:28px;">
    <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;color:#e8e4dd;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:8px;">${escape(title)}</h2>
    ${body}
  </div>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function capacityColor(percent: number): string {
  if (percent >= 0.9) return "#c0392b"; // near sold out
  if (percent >= 0.75) return "#d4b85e"; // strong
  if (percent >= 0.5) return "#c9a84c"; // healthy
  return "#9a958d"; // light
}

export function recapSubject(r: RecapData): string {
  const date = new Date(r.date + "T00:00:00");
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Manor Recap · ${weekday} ${monthDay} · ${r.stats.admission_tickets} tix · ${formatCurrency(r.stats.revenue)} · ${r.stats.food_items} items`;
}
