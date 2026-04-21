import type { RunOfShowData } from "./run-of-show-data";

// Renders the run-of-show HTML for email. Inline CSS + table layouts
// because email clients are hostile to modern CSS.
export function renderRunOfShowEmailHtml({
  data,
  slug,
  baseUrl,
  senderName,
}: {
  data: RunOfShowData;
  slug: string;
  baseUrl: string;
  senderName?: string;
}): string {
  const link = `${baseUrl}/forest-house/admin/run-of-show/${slug}`;
  const rainbow =
    "linear-gradient(90deg,#e63946,#f4845f,#f7b731,#7bc67e,#2ec4b6,#48cae4)";

  const datesRow = data.dates
    .map(
      (d) =>
        `<tr><td style="padding:6px 0;color:#666666;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;width:140px;vertical-align:top;">${escapeHtml(d.label)}</td><td style="padding:6px 0;color:#111111;font-size:14px;">${escapeHtml(d.value)}</td></tr>`,
    )
    .join("");

  const scheduleRows = data.schedule
    .map(
      (row) => `
<tr>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:14px;font-weight:700;color:#111111;vertical-align:top;">${escapeHtml(row.item)}</td>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:13px;color:#333333;white-space:nowrap;vertical-align:top;">${escapeHtml(row.date)}</td>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:13px;color:#666666;white-space:nowrap;vertical-align:top;">${escapeHtml(row.time ?? "—")}</td>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:13px;color:#666666;white-space:nowrap;vertical-align:top;">${escapeHtml(row.duration ?? "—")}</td>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:13px;color:#444444;vertical-align:top;">${escapeHtml(row.notes ?? "—")}</td>
  <td style="padding:12px 10px;border-top:1px solid #eeeeee;font-size:13px;color:#444444;white-space:nowrap;vertical-align:top;">${escapeHtml(row.lead ?? "—")}</td>
</tr>`,
    )
    .join("");

  const talentBlock =
    data.talent && data.talent.length > 0
      ? `
<tr>
  <td style="padding:24px 32px 0;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">Talent</div>
    <div style="margin-top:6px;font-size:20px;font-weight:800;color:#111111;">${escapeHtml(data.talent.join(" · "))}</div>
  </td>
</tr>`
      : "";

  const clientRespBlock =
    data.clientResponsibilities.length > 0
      ? `
<tr>
  <td style="padding:24px 32px 0;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">[ Client Responsibilities ]</div>
    <ul style="margin:12px 0 0;padding-left:20px;font-size:14px;color:#333333;line-height:1.6;">
      ${data.clientResponsibilities.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
    </ul>
  </td>
</tr>`
      : "";

  const powerBlock = data.power
    ? `
<tr>
  <td style="padding:24px 32px 0;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">[ Power ]</div>
    <p style="margin:10px 0 0;font-size:14px;color:#111111;">${escapeHtml(data.power.summary)}</p>
    ${
      data.power.details && data.power.details.length > 0
        ? `<ul style="margin:6px 0 0;padding-left:20px;font-size:13px;color:#666666;line-height:1.6;">${data.power.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
        : ""
    }
  </td>
</tr>`
    : "";

  const addOnsBlock =
    data.addOns && data.addOns.length > 0
      ? `
<tr>
  <td style="padding:24px 32px 0;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">[ Effects & Add-Ons ]</div>
    <ul style="margin:12px 0 0;padding-left:20px;font-size:14px;color:#333333;line-height:1.6;">
      ${data.addOns.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
    </ul>
  </td>
</tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:720px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="height:6px;padding:0;background:${rainbow};line-height:0;font-size:0;">&nbsp;</td>
    </tr>
    <tr>
      <td style="padding:28px 32px;background:#0a0a0a;color:#ffffff;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.4em;text-transform:uppercase;color:#999999;">Foresthouse · Run of Show</div>
        <h1 style="margin:10px 0 6px;font-size:28px;font-weight:900;letter-spacing:-0.02em;color:#ffffff;">${escapeHtml(data.eventName)}</h1>
        ${data.eventSubtitle ? `<p style="margin:0;color:#d4dce5;font-size:14px;">${escapeHtml(data.eventSubtitle)}</p>` : ""}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px 8px;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;margin-bottom:10px;">[ Event Details ]</div>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding:6px 0;color:#666666;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;width:140px;vertical-align:top;">Location</td>
            <td style="padding:6px 0;color:#111111;font-size:14px;">${escapeHtml(data.location)}</td>
          </tr>
          ${datesRow}
        </table>
      </td>
    </tr>
    ${talentBlock}
    <tr>
      <td style="padding:28px 32px 0;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#666666;margin-bottom:12px;">[ Schedule ]</div>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Item</th>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Date</th>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Time</th>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Duration</th>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Notes</th>
              <th style="padding:10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888888;border-bottom:2px solid #111111;">Lead</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
      </td>
    </tr>
    ${powerBlock}
    ${addOnsBlock}
    ${clientRespBlock}
    <tr>
      <td style="padding:32px;">
        <a href="${link}" style="display:inline-block;padding:14px 26px;background:#111111;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;">View full run of show →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 28px;font-size:11px;color:#888888;letter-spacing:0.15em;text-transform:uppercase;">
        Sent by ${escapeHtml(senderName ?? "Foresthouse Crew Portal")} · ${escapeHtml(data.lastUpdated)}
      </td>
    </tr>
    <tr>
      <td style="height:4px;padding:0;background:${rainbow};line-height:0;font-size:0;">&nbsp;</td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
