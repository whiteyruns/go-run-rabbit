"use client";

import { useEffect, useState } from "react";

interface Props {
  venue: "manor" | "noir";
  date: string;
  bullets: string[]; // auto-generated talking points
  accent?: string;
}

interface NotesPayload {
  date: string;
  notes: string;
  updated_at: string | null;
}

export function GMBriefingPanel({ venue, date, bullets, accent = "var(--accent)" }: Props) {
  const [notes, setNotes] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<null | "saving" | "saved" | "error">(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const apiBase = `/api/${venue === "manor" ? "oddyssey-food" : "oddyssey-noir"}`;

  useEffect(() => {
    if (!date) return;
    fetch(`${apiBase}/notes?date=${date}`)
      .then((r) => r.json())
      .then((d: NotesPayload) => {
        setNotes(d.notes ?? "");
        setUpdatedAt(d.updated_at ?? null);
      })
      .catch(() => {});
  }, [apiBase, date]);

  async function saveNotes() {
    setStatus("saving");
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, notes }),
      });
      const d = (await res.json()) as NotesPayload;
      setUpdatedAt(d.updated_at);
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("error");
    }
  }

  async function sendBriefing(test: boolean) {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${apiBase}/briefing`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, test }),
      });
      const d = await res.json();
      if (d.status === "ok") {
        setSendResult(`Sent · ${d.subject} → ${(d.recipients ?? []).join(", ")}`);
      } else {
        setSendResult(`Failed · ${d.message ?? "Unknown"}`);
      }
    } catch (e) {
      setSendResult(`Error · ${String(e)}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
          GM Briefing
        </h2>
        <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5 }}>
          Talking points for the evening — auto-generated from tonight&rsquo;s data, plus your notes. Sent at 5 PM PT and included in the post-show recap.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border-subtle)" }}>
        {/* Auto bullets */}
        <div style={{ background: "var(--bg-elevated)", padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: accent, fontWeight: 500, marginBottom: 16 }}>
            Talking Points (auto)
          </div>
          {bullets.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet — pull the latest CSV.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)", marginBottom: 4, letterSpacing: 0.2 }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Manual notes */}
        <div style={{ background: "var(--bg-elevated)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: accent, fontWeight: 500 }}>
              Evening Notes
            </div>
            {updatedAt && (
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 0.5 }}>
                Saved {new Date(updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="e.g. Bandido open bar 10 PM–12 AM · Photoshoot for Noir · VIP: [name] party of 8 · Press: [outlet]"
            rows={7}
            style={{
              width: "100%", background: "var(--bg)", border: "1px solid var(--border-subtle)",
              padding: "12px 14px", color: "var(--text)", fontFamily: "var(--sans)",
              fontSize: 14, lineHeight: 1.6, outline: "none", resize: "vertical",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Autosaves on blur · Ctrl+S (Tab-out) to force
            </div>
            <div style={{ fontSize: 11, color: status === "saved" ? "#27ae60" : status === "error" ? "#c0392b" : "var(--text-muted)" }}>
              {status === "saving" && "saving…"}
              {status === "saved" && "✓ saved"}
              {status === "error" && "× save failed"}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>

      <div style={{ marginTop: 20, padding: "16px 20px", border: "1px solid var(--border-subtle)", background: "var(--bg)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: 0.3 }}>
          Auto-fires <strong style={{ color: "var(--text)" }}>5:00 PM PT</strong> on show days. Send now to preview or test.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => sendBriefing(true)} disabled={sending} style={btnOutline}>
            {sending ? "Sending…" : "Test (Keith only)"}
          </button>
          <button onClick={() => sendBriefing(false)} disabled={sending} style={btnPrimary}>
            {sending ? "Sending…" : "Send to Team"}
          </button>
          <a href={`${apiBase}/briefing?date=${date}`} target="_blank" rel="noopener" style={btnOutline}>
            Preview HTML
          </a>
        </div>
      </div>
      {sendResult && (
        <div style={{ marginTop: 10, fontSize: 12, color: sendResult.startsWith("Sent") ? "#27ae60" : "#c0392b" }}>
          {sendResult}
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};
const btnOutline: React.CSSProperties = {
  padding: "10px 20px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};
