"use client";

import { useMemo, useState } from "react";

interface Props {
  onClose: () => void;
}

interface Preset {
  label: string;
  email: string;
  defaultOn: boolean;
}

const PRESETS: Preset[] = [
  { label: "LV Events Management", email: "LV_EventsManagement@area15.com", defaultOn: true },
  { label: "Brandon Pereyda", email: "bpereyda@area15.com", defaultOn: true },
  { label: "Keith White", email: "keith@gorunrabbit.com", defaultOn: true },
];

function todayInPT(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

export function EmailRosterForm({ onClose }: Props) {
  const today = useMemo(() => todayInPT(), []);

  // Preset on/off state, keyed by email.
  const [presetOn, setPresetOn] = useState<Record<string, boolean>>(
    () => Object.fromEntries(PRESETS.map((p) => [p.email, p.defaultOn])),
  );
  const [extraTo, setExtraTo] = useState("");
  const [extraCc, setExtraCc] = useState("");
  const [scope, setScope] = useState<"today" | "all">("today");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const toRecipients = useMemo(() => {
    const fromPresets = PRESETS.filter((p) => presetOn[p.email]).map((p) => p.email);
    return Array.from(new Set([...fromPresets, ...parseEmails(extraTo)]));
  }, [presetOn, extraTo]);

  const ccRecipients = useMemo(() => parseEmails(extraCc), [extraCc]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (toRecipients.length === 0) {
      setResult({ ok: false, message: "Pick at least one recipient." });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/oddyssey-food/roster-pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipients: toRecipients,
          cc: ccRecipients,
          date: scope === "today" ? today : undefined,
          all: scope === "all",
        }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setResult({
          ok: true,
          message: `Sent to ${toRecipients.join(", ")}${ccRecipients.length ? ` (cc: ${ccRecipients.join(", ")})` : ""}.`,
        });
      } else {
        setResult({ ok: false, message: data.message ?? "Send failed." });
      }
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ef-overlay" onClick={onClose}>
      <style>{emailStyles}</style>
      <div className="ef-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ef-head">
          <div>
            <div className="ef-eyebrow">Email Roster</div>
            <div className="ef-title">Send Food Allocations PDF</div>
          </div>
          <button type="button" onClick={onClose} className="ef-close" aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSend} className="ef-body">
          <div className="ef-row">
            <label>Recipients</label>
            <div className="ef-presets">
              {PRESETS.map((p) => (
                <label key={p.email} className="ef-preset">
                  <input
                    type="checkbox"
                    checked={presetOn[p.email] ?? false}
                    onChange={(e) =>
                      setPresetOn((prev) => ({ ...prev, [p.email]: e.target.checked }))
                    }
                  />
                  <span className="ef-preset-label">{p.label}</span>
                  <span className="ef-preset-email">{p.email}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ef-row">
            <label>Additional To (comma- or space-separated)</label>
            <input
              type="text"
              value={extraTo}
              onChange={(e) => setExtraTo(e.target.value)}
              placeholder="chef@area15.com, gm@area15.com"
            />
          </div>

          <div className="ef-row">
            <label>CC (optional)</label>
            <input
              type="text"
              value={extraCc}
              onChange={(e) => setExtraCc(e.target.value)}
              placeholder="manager@area15.com"
            />
          </div>

          <div className="ef-row">
            <label>Date scope</label>
            <div className="ef-scope">
              <label className={`ef-scope-opt ${scope === "today" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "today"}
                  onChange={() => setScope("today")}
                />
                <span>Today ({today})</span>
              </label>
              <label className={`ef-scope-opt ${scope === "all" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                <span>All dates in roster</span>
              </label>
            </div>
          </div>

          {result && (
            <div className={`ef-result ${result.ok ? "ok" : "err"}`}>{result.message}</div>
          )}

          <div className="ef-summary">
            Will send to: <strong>{toRecipients.length > 0 ? toRecipients.join(", ") : "—"}</strong>
            {ccRecipients.length > 0 && (
              <>
                <br />CC: <strong>{ccRecipients.join(", ")}</strong>
              </>
            )}
          </div>

          <div className="ef-actions">
            <button type="button" onClick={onClose} className="ef-btn-ghost" disabled={sending}>
              Cancel
            </button>
            <button
              type="submit"
              className="ef-btn-primary"
              disabled={sending || toRecipients.length === 0}
            >
              {sending ? "Sending… (10–30s)" : "Send Roster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const emailStyles = `
.ef-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  z-index: 2000; display: flex; align-items: flex-start; justify-content: center;
  padding: 40px 20px; overflow-y: auto;
}
.ef-modal {
  background: var(--bg-elevated); border: 1px solid var(--border);
  width: 100%; max-width: 620px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.ef-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px; border-bottom: 1px solid var(--border-subtle);
}
.ef-eyebrow {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin-bottom: 6px;
}
.ef-title {
  font-family: var(--serif); font-size: 22px; font-weight: 300;
  letter-spacing: 1px; color: var(--text);
}
.ef-close {
  background: transparent; border: none; color: var(--text-muted);
  font-size: 28px; cursor: pointer; padding: 0 4px; line-height: 1;
}
.ef-body { padding: 24px 28px 28px; }
.ef-row { margin-bottom: 20px; }
.ef-row > label {
  display: block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 8px; font-weight: 500;
}
.ef-presets {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px 14px; background: var(--bg); border: 1px solid var(--border-subtle);
}
.ef-preset {
  display: grid; grid-template-columns: auto 1fr auto; gap: 10px;
  align-items: center; cursor: pointer; font-size: 13px;
}
.ef-preset input[type="checkbox"] { accent-color: var(--accent); cursor: pointer; }
.ef-preset-label { color: var(--text); }
.ef-preset-email { color: var(--text-muted); font-size: 11px; font-family: ui-monospace, monospace; }
.ef-row input[type="text"] {
  width: 100%; padding: 12px 14px;
  background: var(--bg); border: 1px solid var(--border-subtle);
  color: var(--text); font-size: 13px; font-family: var(--sans);
  outline: none;
}
.ef-row input[type="text"]:focus { border-color: var(--accent); }
.ef-scope { display: flex; gap: 12px; flex-wrap: wrap; }
.ef-scope-opt {
  flex: 1; min-width: 180px; display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; background: var(--bg); border: 1px solid var(--border-subtle);
  cursor: pointer; font-size: 13px; color: var(--text-secondary);
}
.ef-scope-opt.selected { border-color: var(--accent); color: var(--text); }
.ef-scope-opt input[type="radio"] { accent-color: var(--accent); cursor: pointer; }
.ef-summary {
  margin: 12px 0 20px; padding: 12px 14px;
  background: var(--bg); border-left: 3px solid var(--accent);
  font-size: 12px; color: var(--text-muted); line-height: 1.5;
  word-break: break-all;
}
.ef-summary strong { color: var(--text); font-weight: 500; }
.ef-result {
  padding: 12px 14px; margin-bottom: 16px; font-size: 13px;
  border: 1px solid var(--border-subtle);
}
.ef-result.ok { border-color: #27ae60; color: #27ae60; }
.ef-result.err { border-color: #c0392b; color: #c0392b; }
.ef-actions { display: flex; justify-content: flex-end; gap: 12px; }
.ef-btn-ghost, .ef-btn-primary {
  padding: 12px 28px; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; cursor: pointer; border: none;
}
.ef-btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.ef-btn-primary { background: var(--accent); color: var(--bg); font-weight: 500; }
.ef-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
`;
