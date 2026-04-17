"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import type { DateAggregate } from "@/lib/oddyssey-food/types";
import { TotalsTable } from "./TotalsTable";

interface Props {
  byDate: DateAggregate[];
}

export function SessionBreakdown({ byDate }: Props) {
  const catalog = getMenuCatalog();
  const itemIds = catalog.map((c) => c.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
      {byDate.map((d) => (
        <div key={d.session_date}>
          <div style={{
            paddingBottom: 12, marginBottom: 24,
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            flexWrap: "wrap", gap: 8,
          }}>
            <h3 style={{
              fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400,
              letterSpacing: 2, textTransform: "uppercase", color: "var(--text)",
              margin: 0,
            }}>{d.date_label}</h3>
            <div style={{
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              {d.total_items} items · {d.sessions.length} sessions
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "var(--border-subtle)" }}>
            {d.sessions.map((s) => (
              <div key={s.session_iso} style={{ background: "var(--bg-elevated)", padding: 28 }}>
                <div style={{
                  fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
                  color: "var(--accent)", fontWeight: 500, marginBottom: 4,
                }}>
                  {s.session_label.split(" · ")[1] ?? s.session_label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16, letterSpacing: 1 }}>
                  {s.group_count} group{s.group_count === 1 ? "" : "s"} · {s.total_items} items
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {itemIds.map((id) => {
                      const count = s.totals[id] ?? 0;
                      const item = catalog.find((c) => c.id === id);
                      if (count === 0) return null;
                      return (
                        <tr key={id}>
                          <td style={{
                            padding: "6px 0", fontSize: 13, color: "var(--text-secondary)",
                          }}>{item?.label}</td>
                          <td style={{
                            padding: "6px 0", textAlign: "right",
                            fontFamily: "var(--serif)", fontSize: 18, fontWeight: 400, color: "var(--accent)",
                          }}>{count}</td>
                        </tr>
                      );
                    })}
                    {s.totals["__unknown__"] && (
                      <tr>
                        <td style={{ padding: "6px 0", fontSize: 13, color: "var(--danger)" }}>Unknown</td>
                        <td style={{
                          padding: "6px 0", textAlign: "right",
                          fontFamily: "var(--serif)", fontSize: 18, color: "var(--danger)",
                        }}>{s.totals["__unknown__"]}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Suppress unused warning when consumers don't pass TotalsTable here */}
      <div style={{ display: "none" }}><TotalsTable totals={{}} /></div>
    </div>
  );
}
