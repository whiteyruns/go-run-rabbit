"use client";

import type { ValidationFinding } from "@/lib/oddyssey-food/types";

interface Props {
  findings: ValidationFinding[];
}

const SEV_COLORS = {
  error: { color: "#c0392b", label: "Error" },
  warning: { color: "#d4a574", label: "Warning" },
  info: { color: "#6c8fb3", label: "Info" },
};

export function ErrorList({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <div style={{
        padding: 32, border: "1px solid var(--border-subtle)", textAlign: "center",
        color: "var(--text-muted)", fontSize: 13, letterSpacing: 0.5,
      }}>
        No validation findings.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)" }}>
      {findings.map((f) => {
        const sev = SEV_COLORS[f.severity];
        return (
          <div key={f.id} style={{
            background: "var(--bg-elevated)", padding: "20px 24px",
            display: "grid", gridTemplateColumns: "100px 1fr", gap: 24, alignItems: "start",
          }}>
            <div style={{
              fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500,
              color: sev.color, paddingTop: 2,
            }}>
              {sev.label}
            </div>
            <div>
              <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{f.message}</div>
              {f.details && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {f.details}
                </div>
              )}
              {f.session_label && (
                <div style={{
                  fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "var(--accent)", marginTop: 6,
                }}>
                  {f.session_label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
