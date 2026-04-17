"use client";

import { CsvDropzone } from "@/components/oddyssey-food/CsvDropzone";
import { PreviewTable } from "@/components/oddyssey-food/PreviewTable";
import { buildStateFromCsv, type AutoAssignmentSummary } from "@/lib/oddyssey-food/build-state";
import { getTicketTypes } from "@/lib/oddyssey-food/roster";
import { clearState, loadState, saveState } from "@/lib/oddyssey-food/storage";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PullMeta {
  filename: string;
  pulled_at: string;
  date: string;
  size_bytes: number;
}

export default function UploadPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [autoAssign, setAutoAssign] = useState<AutoAssignmentSummary | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullMeta, setPullMeta] = useState<PullMeta | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    fetch("/api/oddyssey-food/pull")
      .then((r) => r.json())
      .then((d) => { if (d.meta) setPullMeta(d.meta); })
      .catch(() => {});
  }, []);

  function handleFile(filename: string, text: string) {
    const { state: next, warnings: w, autoAssign: aa } = buildStateFromCsv(filename, text);
    saveState(next);
    setState(next);
    setWarnings(w);
    setAutoAssign(aa ?? null);
  }

  function handleClear() {
    clearState();
    setState(null);
    setWarnings([]);
    setAutoAssign(null);
  }

  async function handlePullFromTicketure() {
    setPulling(true);
    setPullError(null);
    try {
      const res = await fetch("/api/oddyssey-food/pull", { method: "POST", body: "{}" });
      const data = await res.json();
      if (data.status !== "ok" || !data.csv) {
        setPullError(data.stderr || data.stdout || "Pull failed — check server logs.");
        return;
      }
      setPullMeta(data.meta);
      handleFile(data.meta.filename, data.csv);
    } catch (e) {
      setPullError(String(e));
    } finally {
      setPulling(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="01 · Upload"
        title="Drop the Ticketure Attendees CSV"
        description={`Use the "All Ticket Groups" attendee export from Ticketure — the full unfiltered CSV lets the dashboard auto-derive each guest's package TYPE and suggest a LOCATION based on party size. An Inclusions-only export still works but leaves those fields blank.`}
      />

      <div style={{
        padding: "18px 24px", marginBottom: 24,
        background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 4 }}>
            Auto-Pull from Ticketure
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", letterSpacing: 0.3 }}>
            {pullMeta ? (
              <>Last pulled: <strong style={{ color: "var(--text)" }}>{new Date(pullMeta.pulled_at).toLocaleString("en-US")}</strong> · {pullMeta.date}</>
            ) : (
              "No pulls yet. Server will log into Ticketure and download today's attendee list."
            )}
          </div>
        </div>
        <button
          onClick={handlePullFromTicketure}
          disabled={pulling}
          style={{ ...btnPrimary, opacity: pulling ? 0.5 : 1 }}
        >
          {pulling ? "Pulling…" : "Pull Now"}
        </button>
      </div>

      {pullError && (
        <div style={{ padding: 16, marginBottom: 24, border: "1px solid #c0392b", background: "rgba(192,57,43,0.08)", fontSize: 12, color: "#c0392b", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          {pullError}
        </div>
      )}

      <CsvDropzone onFile={handleFile} />

      {warnings.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, border: "1px solid var(--warning)", background: "rgba(212,165,116,0.06)" }}>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--warning)", letterSpacing: 0.5 }}>{w}</div>
          ))}
        </div>
      )}

      {autoAssign && <AutoAssignCard summary={autoAssign} />}

      {state && (
        <>
          <div style={{
            marginTop: 48, marginBottom: 24, display: "flex", justifyContent: "space-between",
            alignItems: "baseline", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
                Loaded
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400, letterSpacing: 1 }}>
                {state.source.filename}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.5 }}>
                {state.source.row_count} rows · uploaded {new Date(state.source.uploaded_at).toLocaleString("en-US")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleClear} style={btnOutline}>Clear</button>
              <Link href="/oddyssey-manor/admin/food/validation" style={btnPrimary}>
                Continue to Validation →
              </Link>
            </div>
          </div>

          <PreviewTable rows={state.raw_rows} limit={10} />
        </>
      )}
    </div>
  );
}

function AutoAssignCard({ summary }: { summary: AutoAssignmentSummary }) {
  const ticketTypes = getTicketTypes();
  const detected = Object.entries(summary.detected_packages)
    .map(([type, count]) => {
      const t = ticketTypes.find((x) => x.package_type === type);
      return { label: t?.short_label ?? type.toUpperCase(), count };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{
      marginTop: 32, padding: "24px 28px",
      border: "1px solid rgba(39,174,96,0.35)",
      background: "rgba(39,174,96,0.06)",
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
        color: "#27ae60", fontWeight: 500, marginBottom: 12,
      }}>
        ✓ Full Attendees Export Detected
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", marginBottom: 18, lineHeight: 1.3 }}>
        Auto-populated <strong style={{ color: "#27ae60" }}>{summary.types_assigned}</strong> package type{summary.types_assigned === 1 ? "" : "s"} and{" "}
        <strong style={{ color: "#27ae60" }}>{summary.locations_assigned}</strong> location{summary.locations_assigned === 1 ? "" : "s"}
        {" "}of <strong>{summary.group_total}</strong> guest group{summary.group_total === 1 ? "" : "s"}.
      </div>
      {detected.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          {detected.map((d) => (
            <div key={d.label} style={{
              padding: "6px 14px", border: "1px solid var(--border-subtle)",
              fontSize: 11, letterSpacing: 1.5, color: "var(--text-secondary)",
            }}>
              {d.label} · <strong style={{ color: "var(--accent)" }}>{d.count}</strong>
            </div>
          ))}
        </div>
      )}
      {summary.skipped_existing > 0 && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5 }}>
          Preserved {summary.skipped_existing} existing manual assignment{summary.skipped_existing === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 48, maxWidth: 720 }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
        {title}
      </h1>
      {description && (
        <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-secondary)", letterSpacing: 0.5, lineHeight: 1.7 }}>
          {description}
        </p>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  padding: "12px 24px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};
