"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import type { RosterSection } from "@/lib/oddyssey-food/roster";

interface Props {
  sections: RosterSection[];
  snapshotAt?: string;
}

// Print-only roster view. Matches the SharePoint sheet format:
// date banner → totals block → main table with Location/#/Type/Time/Name/Food/Email
// B&W with thick borders for ticket separation (no color needed on paper).
export function RosterPrint({ sections, snapshotAt }: Props) {
  const catalog = getMenuCatalog();

  return (
    <div className="roster-print">
      <style>{printStyles}</style>
      {sections.map((section, si) => {
        const totalsByItem = catalog.map((c) => ({
          label: c.label,
          count: section.totals.find((t) => t.id === c.id)?.count ?? 0,
        })).filter((t) => t.count > 0);
        const unknown = section.totals.find((t) => t.id === "__unknown__")?.count ?? 0;
        if (unknown > 0) totalsByItem.push({ label: "Unknown", count: unknown });

        return (
          <section key={section.session_date} className={`rp-section ${si > 0 ? "rp-break" : ""}`}>
            <div className="rp-banner"><h1>{section.date_header}</h1></div>

            {/* Totals block */}
            <table className="rp-totals">
              <tbody>
                {totalsByItem.map((t) => (
                  <tr key={t.label}>
                    <td className="rp-t-label">{t.label}</td>
                    <td className="rp-t-count">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Main table */}
            <table className="rp-main">
              <thead>
                <tr>
                  <th>LOCATION</th>
                  <th>#</th>
                  <th>TYPE</th>
                  <th>TIME</th>
                  <th>NAME</th>
                  <th>FOOD</th>
                  <th>EMAIL</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => {
                  const isFirst = row.is_guest_first;
                  const last = row.is_guest_last ? " rp-guest-last" : "";
                  const ticketFirst = row.is_ticket_first ? " rp-ticket-first" : "";
                  const vipClass = row.is_vip ? " rp-vip" : "";
                  const noteClass = row.customer_note ? " rp-has-note" : "";
                  return (
                    <tr key={`${row.scan_code}-${i}`} className={`rp-row${last}${ticketFirst}${vipClass}${noteClass}`}>
                      <td>{isFirst ? (row.location || "") : ""}</td>
                      <td className="rp-c-num">{row.ticket_number ?? ""}</td>
                      <td>
                        {isFirst ? (
                          <>
                            {row.is_vip && <span className="rp-vip-tag">★ VIP</span>}
                            {row.type_label}
                          </>
                        ) : ""}
                      </td>
                      <td>{isFirst ? row.time_label : ""}</td>
                      <td>
                        {isFirst ? (
                          <>
                            <div>{row.name}</div>
                            {row.customer_note && (
                              <div className="rp-note">⚠ {row.customer_note}</div>
                            )}
                          </>
                        ) : ""}
                      </td>
                      <td>{row.food}</td>
                      <td>{isFirst ? row.email : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <footer className="rp-foot">
              <span>Oddyssey Manor · Food Inclusions · Internal Use</span>
              {snapshotAt && <span>Snapshot: {new Date(snapshotAt).toLocaleString("en-US")}</span>}
            </footer>
          </section>
        );
      })}
    </div>
  );
}

const printStyles = `
.roster-print { display: none; }

@media print {
  @page { size: letter landscape; margin: 0.4in 0.4in; }
  .roster-print {
    display: block !important;
    background: #fff; color: #000;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
  }
  .rp-section { padding: 0; }
  .rp-break { page-break-before: always; }

  .rp-banner {
    border: 2px solid #000; padding: 10px 12px; margin-bottom: 10px;
    text-align: center;
  }
  .rp-banner h1 {
    font-size: 20px; font-weight: 700; letter-spacing: 2px;
    margin: 0; color: #000;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }

  .rp-totals {
    border: 1.5px solid #000; border-collapse: collapse;
    margin-bottom: 10px; width: 220px;
  }
  .rp-totals td {
    padding: 6px 10px; border: 1px solid #000;
    font-size: 13px; font-weight: 600;
  }
  .rp-t-label { width: 140px; text-align: left; }
  .rp-t-count { text-align: center; font-size: 15px; width: 40px; font-weight: 700; }

  .rp-main {
    width: 100%; border-collapse: collapse;
    border: 1.5px solid #000;
  }
  .rp-main thead th {
    background: #000 !important; color: #fff !important;
    padding: 6px 8px; text-align: left;
    font-size: 10px; letter-spacing: 1.5px; font-weight: 700;
    border: 1px solid #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .rp-main tbody td {
    padding: 4px 8px; border: 1px solid #000;
    font-size: 11px; line-height: 1.35;
    color: #000;
  }
  .rp-c-num { text-align: center; font-weight: 700; font-size: 12px; }

  /* Thicker bottom border ends each guest — no color banding needed on paper */
  .rp-guest-last td { border-bottom: 2px solid #000 !important; }
  /* Separator above a new ticket within a guest */
  .rp-ticket-first:not(.rp-row:first-child) td { border-top: 0.5px solid #555; }
  /* VIP: solid left edge */
  .rp-vip td:first-child { border-left: 3px solid #000 !important; }
  /* Has note: stripe left edge with heavy weight */
  .rp-has-note td:first-child { border-left: 3px double #000 !important; }
  .rp-has-note td { background: #f0f0f0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .rp-vip-tag {
    display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 1px;
    border: 1.5px solid #000; padding: 1px 5px; margin-right: 6px;
  }
  .rp-note {
    font-size: 10px; font-weight: 700; margin-top: 3px; padding: 2px 6px;
    border: 1.5px solid #000; letter-spacing: 0.3px;
  }

  .rp-foot {
    margin-top: 12px; padding-top: 6px; border-top: 1px solid #000;
    display: flex; justify-content: space-between;
    font-size: 9px; letter-spacing: 0.5px; color: #555;
  }

  /* Hide all admin chrome */
  .admin-header, .admin-tabs, .admin-not-print { display: none !important; }
}
`;
