"use client";

import { CsvDropzone } from "@/components/oddyssey-food/CsvDropzone";
import { PreviewTable } from "@/components/oddyssey-food/PreviewTable";
import { buildStateFromCsv } from "@/lib/oddyssey-food/build-state";
import { clearState, loadState, saveState } from "@/lib/oddyssey-food/storage";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    setState(loadState());
  }, []);

  function handleFile(filename: string, text: string) {
    const { state: next, warnings: w } = buildStateFromCsv(filename, text);
    saveState(next);
    setState(next);
    setWarnings(w);
  }

  function handleClear() {
    clearState();
    setState(null);
    setWarnings([]);
  }

  return (
    <div>
      <PageHeader
        eyebrow="01 · Upload"
        title="Drop the Ticketure Inclusions CSV"
        description="The dashboard will parse the file, normalize items against the menu catalog, and stage everything for review on the next step."
      />

      <CsvDropzone onFile={handleFile} />

      {warnings.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, border: "1px solid var(--warning)", background: "rgba(212,165,116,0.06)" }}>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: "var(--warning)", letterSpacing: 0.5 }}>{w}</div>
          ))}
        </div>
      )}

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
