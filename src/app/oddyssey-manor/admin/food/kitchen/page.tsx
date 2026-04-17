"use client";

import { ItemBarChart } from "@/components/oddyssey-food/ItemBarChart";
import { PrintLayout } from "@/components/oddyssey-food/PrintLayout";
import { SessionBarChart } from "@/components/oddyssey-food/SessionBarChart";
import { SessionBreakdown } from "@/components/oddyssey-food/SessionBreakdown";
import { TotalsTable } from "@/components/oddyssey-food/TotalsTable";
import { loadState } from "@/lib/oddyssey-food/storage";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function KitchenPage() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) {
    return (
      <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>
          No data loaded.
        </div>
        <Link href="/oddyssey-manor/admin/food/upload" style={btnPrimary}>Upload a CSV</Link>
      </div>
    );
  }

  return (
    <>
      <div className="admin-not-print">
        <Header
          eyebrow="04 · Kitchen"
          title="Prep Summary"
          description={`${state.allocations.length} items across ${state.by_session.length} session${state.by_session.length === 1 ? "" : "s"} · for screen review`}
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
          <Link href="/oddyssey-manor/admin/food/roster" style={btnPrimary}>Back to Roster (Printable) →</Link>
          <Link href="/oddyssey-manor/admin/food/validation" style={btnOutline}>← Validation</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 56 }}>
          <Card title="Item Totals">
            <TotalsTable totals={state.totals} />
          </Card>
          <Card title="At a Glance">
            <ItemBarChart totals={state.totals} height={240} />
          </Card>
        </div>

        <Card title="Items by Session" wide>
          <SessionBarChart sessions={state.by_session} height={260} />
        </Card>

        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
            Session Breakdown
          </h2>
          <SessionBreakdown byDate={state.by_date} />
        </div>

        <style>{`
          @media (max-width: 800px) {
            div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      <PrintLayout state={state} />
    </>
  );
}

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>{eyebrow}</div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>{title}</h1>
      {description && <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", letterSpacing: 0.5 }}>{description}</p>}
    </div>
  );
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
      padding: 28, gridColumn: wide ? "1 / -1" : undefined,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block", padding: "12px 28px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-block", padding: "12px 28px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};
