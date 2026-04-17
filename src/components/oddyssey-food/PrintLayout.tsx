"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import type { DashboardState } from "@/lib/oddyssey-food/types";

interface Props {
  state: DashboardState;
}

// Print-only kitchen sheet — black/white, paper-friendly.
export function PrintLayout({ state }: Props) {
  const catalog = getMenuCatalog();
  const dates = state.by_date;

  return (
    <div className="print-only">
      <style>{printStyles}</style>
      <header className="ps-header">
        <div className="ps-brand">ODDYSSEY MANOR</div>
        <div className="ps-title">Food Prep Summary</div>
        <div className="ps-meta">
          {dates.length === 0
            ? new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
            : dates.map((d) => d.date_label).join(" · ")}
        </div>
        <div className="ps-meta-sub">
          Source: {state.source.filename} · {state.source.row_count} rows · Generated {new Date().toLocaleString("en-US")}
        </div>
      </header>

      <section className="ps-section">
        <h2 className="ps-h2">Item Totals</h2>
        <table className="ps-table">
          <tbody>
            {catalog.map((c) => (
              <tr key={c.id}>
                <td className="ps-label">{c.label}</td>
                <td className="ps-count">{state.totals[c.id] ?? 0}</td>
              </tr>
            ))}
            {(state.totals["__unknown__"] ?? 0) > 0 && (
              <tr>
                <td className="ps-label">Unknown / Unmapped</td>
                <td className="ps-count">{state.totals["__unknown__"]}</td>
              </tr>
            )}
            <tr className="ps-total-row">
              <td className="ps-label">Total Items</td>
              <td className="ps-count">{state.allocations.length}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {dates.map((d) => (
        <section key={d.session_date} className="ps-section">
          <h2 className="ps-h2">{d.date_label}</h2>
          {d.sessions.map((s) => (
            <div key={s.session_iso} className="ps-session">
              <h3 className="ps-h3">
                {s.session_label.split(" · ")[1] ?? s.session_label}
                <span className="ps-session-meta">
                  {s.group_count} group{s.group_count === 1 ? "" : "s"} · {s.total_items} items
                </span>
              </h3>
              <table className="ps-table">
                <tbody>
                  {catalog.map((c) => {
                    const count = s.totals[c.id] ?? 0;
                    if (count === 0) return null;
                    return (
                      <tr key={c.id}>
                        <td className="ps-label">{c.label}</td>
                        <td className="ps-count">{count}</td>
                      </tr>
                    );
                  })}
                  {(s.totals["__unknown__"] ?? 0) > 0 && (
                    <tr>
                      <td className="ps-label">Unknown</td>
                      <td className="ps-count">{s.totals["__unknown__"]}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}

      <footer className="ps-footer">
        <div>Oddyssey Manor · Food Inclusions · Internal Use Only</div>
      </footer>
    </div>
  );
}

const printStyles = `
.print-only { display: none; }
@media print {
  .print-only { display: block !important; color: #000; background: #fff; padding: 32px 40px; font-family: Georgia, 'Times New Roman', serif; }
  .ps-header { border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 28px; }
  .ps-brand { font-size: 11px; letter-spacing: 5px; color: #000; margin-bottom: 6px; }
  .ps-title { font-size: 32px; font-weight: 400; letter-spacing: 2px; margin-bottom: 8px; }
  .ps-meta { font-size: 14px; color: #000; margin-bottom: 4px; }
  .ps-meta-sub { font-size: 10px; color: #555; letter-spacing: 0.5px; }
  .ps-section { margin-bottom: 32px; page-break-inside: avoid; }
  .ps-h2 { font-size: 20px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 16px; }
  .ps-h3 { font-size: 14px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 16px 0 8px; display: flex; justify-content: space-between; align-items: baseline; }
  .ps-session { margin-bottom: 18px; }
  .ps-session-meta { font-size: 10px; font-weight: 400; letter-spacing: 0.5px; color: #555; text-transform: none; }
  .ps-table { width: 100%; border-collapse: collapse; }
  .ps-table td { padding: 6px 0; border-bottom: 1px dotted #999; font-size: 14px; }
  .ps-label { font-weight: 400; }
  .ps-count { text-align: right; font-weight: 700; font-family: Georgia, serif; min-width: 60px; }
  .ps-total-row td { border-top: 2px solid #000; border-bottom: none; padding-top: 10px; font-weight: 700; }
  .ps-footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #000; font-size: 10px; color: #555; text-align: center; letter-spacing: 1px; }
  /* Hide non-print UI when printing */
  .admin-header, .admin-tabs, .admin-not-print { display: none !important; }
}
`;
