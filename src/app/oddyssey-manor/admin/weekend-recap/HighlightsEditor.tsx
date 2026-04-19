"use client";

/**
 * Inline editor for the per-weekend "Highlights" note — qualitative
 * context that the numbers don't capture (photo shoots, media visits,
 * celeb drop-ins, etc.). Renders the current value in read mode; click
 * Edit to open a textarea, Save to POST to the highlights API.
 */

import { useState } from "react";
import styles from "./weekend-recap.module.css";

export default function HighlightsEditor({
  weekendOf,
  initial,
  updatedAt,
}: {
  weekendOf: string;       // Friday ISO
  initial: string;         // empty string if no highlights yet
  updatedAt: string | null;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(initial.length === 0 ? false : false);
  const [busy, setBusy] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(updatedAt);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/oddyssey-weekend-recap/highlights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ weekendOf, highlights: draft }),
      });
      const data = await res.json();
      if (data.status !== "ok") {
        setErr(data.message ?? "Save failed");
        return;
      }
      setSaved(draft);
      setEditing(false);
      setLastSaved(new Date().toISOString());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const timeLabel = lastSaved
    ? new Date(lastSaved).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div className={styles.highlights}>
      <div className={styles.highlightsHeader}>
        <div className={styles.highlightsEyebrow}>Weekend Highlights</div>
        <div className={styles.highlightsMeta}>
          {timeLabel ? `Saved ${timeLabel}` : "Qualitative · media, VIPs, moments"}
        </div>
      </div>

      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={styles.highlightsTextarea}
            rows={4}
            maxLength={4000}
            placeholder="Photo + video shoot Fri + Sat · Marcus on-site Saturday · Fever group of 14 walked up at 11:30…"
            autoFocus
          />
          <div className={styles.highlightsActions}>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className={styles.highlightsSave}
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => { setDraft(saved); setEditing(false); setErr(null); }}
              disabled={busy}
              className={styles.highlightsCancel}
            >
              Cancel
            </button>
            {err && <span className={styles.highlightsErr}>{err}</span>}
          </div>
        </>
      ) : saved.length > 0 ? (
        <>
          <div className={styles.highlightsBody}>{saved}</div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={styles.highlightsEdit}
          >
            Edit
          </button>
        </>
      ) : (
        <>
          <div className={styles.highlightsEmpty}>
            No highlights yet for this weekend.
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={styles.highlightsEdit}
          >
            Add highlights →
          </button>
        </>
      )}
    </div>
  );
}
