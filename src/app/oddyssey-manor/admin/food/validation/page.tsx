"use client";

import { ErrorList } from "@/components/oddyssey-food/ErrorList";
import { ItemBarChart } from "@/components/oddyssey-food/ItemBarChart";
import { SummaryCards } from "@/components/oddyssey-food/SummaryCards";
import { loadStateWithWalkups } from "@/lib/oddyssey-food/build-state";
import type { DashboardState, ValidationFinding } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ValidationPage() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    setState(loadStateWithWalkups());
  }, []);

  if (!state) {
    return (
      <EmptyState
        message="No data loaded."
        cta="Upload a CSV"
        href="/oddyssey-manor/admin/food/upload"
      />
    );
  }

  const errors = state.findings.filter((f) => f.severity === "error");
  const warnings = state.findings.filter((f) => f.severity === "warning");
  const infos = state.findings.filter((f) => f.severity === "info");

  return (
    <div>
      <Header
        eyebrow="02 · Validation"
        title="Review the Numbers"
        description={`Source: ${state.source.filename} · ${state.source.row_count} rows`}
      />

      <SummaryCards state={state} />

      <Section title="Item Distribution">
        <div style={{ background: "var(--bg-elevated)", padding: 24, border: "1px solid var(--border-subtle)" }}>
          <ItemBarChart totals={state.totals} />
        </div>
      </Section>

      <Section title={`Findings · ${state.findings.length}`} subtitle={`${errors.length} error${errors.length === 1 ? "" : "s"} · ${warnings.length} warning${warnings.length === 1 ? "" : "s"} · ${infos.length} info`}>
        <FindingsGroup label="Errors" items={errors} />
        <FindingsGroup label="Warnings" items={warnings} />
        <FindingsGroup label="Info" items={infos} />
      </Section>

      <div style={{ marginTop: 64, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <Link href="/oddyssey-manor/admin/food/upload" style={btnOutline}>← Back to Upload</Link>
        <Link href="/oddyssey-manor/admin/food/roster" style={btnPrimary}>Continue to Roster →</Link>
      </div>
    </div>
  );
}

function FindingsGroup({ label, items }: { label: string; items: ValidationFinding[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 }}>
        {label} · {items.length}
      </div>
      <ErrorList findings={items} />
    </div>
  );
}

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>{eyebrow}</div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>{title}</h1>
      {description && <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", letterSpacing: 0.5 }}>{description}</p>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 56 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>{message}</div>
      <Link href={href} style={btnPrimary}>{cta}</Link>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};
