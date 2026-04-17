"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import type { MenuTotals } from "@/lib/oddyssey-food/types";

interface Props {
  totals: MenuTotals;
  title?: string;
  showLabels?: boolean;
}

export function TotalsTable({ totals, title, showLabels = true }: Props) {
  const catalog = getMenuCatalog();
  // Build full row list — known items in catalog order, then unknowns at the end.
  const rows = catalog.map((item) => ({
    id: item.id,
    label: item.label,
    count: totals[item.id] ?? 0,
  }));
  const unknown = totals["__unknown__"] ?? 0;
  if (unknown > 0) {
    rows.push({ id: "__unknown__", label: "Unknown / Unmapped", count: unknown });
  }
  const grand = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      {title && (
        <div style={{
          fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
          color: "var(--accent)", fontWeight: 500, marginBottom: 16,
        }}>{title}</div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {showLabels && (
                <td style={{
                  padding: "14px 0", fontFamily: "var(--serif)", fontSize: 18, fontWeight: 400,
                  letterSpacing: 1, color: r.id === "__unknown__" ? "var(--danger)" : "var(--text)",
                }}>
                  {r.label}
                </td>
              )}
              <td style={{
                padding: "14px 0", textAlign: "right",
                fontFamily: "var(--serif)", fontSize: 24, fontWeight: 300, color: "var(--accent)",
              }}>
                {r.count}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: "1px solid var(--accent)" }}>
            <td style={{
              padding: "16px 0", fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
              color: "var(--text-muted)", fontWeight: 500,
            }}>Total</td>
            <td style={{
              padding: "16px 0", textAlign: "right",
              fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, color: "var(--text)",
            }}>{grand}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
