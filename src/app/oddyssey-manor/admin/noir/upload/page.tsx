"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PullMeta {
  filename: string;
  pulled_at: string;
  date: string;
  size_bytes: number;
}

export default function NoirUploadPage() {
  const [pulling, setPulling] = useState(false);
  const [pullMeta, setPullMeta] = useState<PullMeta | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/oddyssey-noir/pull")
      .then((r) => r.json())
      .then((d) => { if (d.meta) setPullMeta(d.meta); })
      .catch(() => {});
  }, []);

  async function handlePull() {
    setPulling(true);
    setPullError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/oddyssey-noir/pull", { method: "POST", body: "{}" });
      const data = await res.json();
      if (data.status !== "ok") {
        setPullError(data.stderr || data.stdout || data.message || "Pull failed.");
        return;
      }
      setPullMeta(data.meta);
      setStatus(`Pulled ${data.meta.filename} — ${data.meta.size_bytes.toLocaleString()} bytes`);
    } catch (e) {
      setPullError(String(e));
    } finally {
      setPulling(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
          01 · Upload
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
          Pull Noir Attendees
        </h1>
        <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-secondary)", letterSpacing: 0.5, lineHeight: 1.7, maxWidth: 720 }}>
          Click <strong>Pull Now</strong> to log into Ticketure, export today&rsquo;s Noir attendee list, and refresh the Summary.
          The scheduler also runs automatic pulls — this is for ad-hoc refreshes.
        </p>
      </div>

      <div style={{
        padding: "24px 28px",
        background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 4 }}>
            Last Pull
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", letterSpacing: 0.3 }}>
            {pullMeta ? (
              <>
                <strong style={{ color: "var(--text)" }}>{new Date(pullMeta.pulled_at).toLocaleString("en-US")}</strong>
                {" "}· {pullMeta.date} · {pullMeta.size_bytes.toLocaleString()} bytes
              </>
            ) : (
              "No Noir pulls yet."
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handlePull} disabled={pulling} style={{ ...btnPrimary, opacity: pulling ? 0.5 : 1 }}>
            {pulling ? "Pulling…" : "Pull Now"}
          </button>
          <Link href="/oddyssey-manor/admin/noir/summary" style={btnOutline}>View Summary →</Link>
        </div>
      </div>

      {status && (
        <div style={{ marginTop: 16, padding: "12px 16px", border: "1px solid #27ae60", background: "rgba(39,174,96,0.08)", fontSize: 13, color: "#27ae60" }}>
          ✓ {status}
        </div>
      )}

      {pullError && (
        <div style={{ marginTop: 16, padding: "12px 16px", border: "1px solid #c0392b", background: "rgba(192,57,43,0.08)", fontSize: 12, color: "#c0392b", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          {pullError}
        </div>
      )}
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
