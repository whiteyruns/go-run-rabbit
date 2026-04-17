"use client";

import type { InclusionRow } from "@/lib/oddyssey-food/types";

interface Props {
  rows: InclusionRow[];
  limit?: number;
}

export function PreviewTable({ rows, limit = 10 }: Props) {
  const shown = rows.slice(0, limit);
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "var(--bg-elevated)" }}>
            {["Session", "Buyer", "Email", "Group", "Item", "Scan", "State"].map((h) => (
              <th key={h} style={{
                padding: "12px 14px", textAlign: "left", fontSize: 9,
                letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)",
                fontWeight: 500, borderBottom: "1px solid var(--border-subtle)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={cellStyle}>{r.session_time}</td>
              <td style={cellStyle}>{r.identity_name}</td>
              <td style={{ ...cellStyle, color: "var(--text-muted)" }}>{r.identity_email}</td>
              <td style={cellStyle}>{r.ticket_group_name}</td>
              <td style={{ ...cellStyle, color: "var(--accent)" }}>{r.ticket_type_name}</td>
              <td style={{ ...cellStyle, color: "var(--text-muted)", fontFamily: "monospace" }}>{r.scan_code}</td>
              <td style={cellStyle}>{r.ticket_state}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit && (
        <div style={{
          padding: "10px 14px", fontSize: 11, letterSpacing: 1, color: "var(--text-muted)",
          background: "var(--bg-elevated)", textAlign: "center",
        }}>
          + {rows.length - limit} more rows
        </div>
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "10px 14px",
  color: "var(--text-secondary)",
  letterSpacing: 0.3,
};
