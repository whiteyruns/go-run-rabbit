"use client";

import type { DashboardState } from "@/lib/oddyssey-food/types";

interface Props {
  state: DashboardState;
}

export function SummaryCards({ state }: Props) {
  const dates = new Set(state.allocations.map((a) => a.session_date)).size;
  const sessions = state.by_session.length;
  const groups = state.groups.length;

  const cards = [
    { label: "Total Items", value: state.allocations.length },
    { label: "Order Groups", value: groups },
    { label: "Sessions", value: sessions },
    { label: "Dates", value: dates },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
      background: "var(--border-subtle)",
    }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background: "var(--bg-elevated)", padding: "28px 24px",
        }}>
          <div style={{
            fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
            color: "var(--accent)", fontWeight: 500, marginBottom: 12,
          }}>{c.label}</div>
          <div style={{
            fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, color: "var(--text)",
            lineHeight: 1,
          }}>{c.value}</div>
        </div>
      ))}
      <style>{`@media (max-width: 700px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
