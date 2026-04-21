"use client";

import { useEffect, useMemo, useState } from "react";

export type Recipient = {
  email: string;
  name: string;
  role: string;
  group: "core" | "crew";
};

export default function SendRosDialog({
  slug,
  eventName,
  recipients,
  open,
  onClose,
}: {
  slug: string;
  eventName: string;
  recipients: Recipient[];
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(recipients.map((r) => r.email.toLowerCase())),
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    | { kind: "ok"; count: number }
    | { kind: "error"; message: string }
    | null
  >(null);

  // Reset state when the dialog opens
  useEffect(() => {
    if (open) {
      setSelected(new Set(recipients.map((r) => r.email.toLowerCase())));
      setResult(null);
      setSending(false);
    }
  }, [open, recipients]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !sending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sending, onClose]);

  const core = useMemo(
    () => recipients.filter((r) => r.group === "core"),
    [recipients],
  );
  const crew = useMemo(
    () => recipients.filter((r) => r.group === "crew"),
    [recipients],
  );

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = email.toLowerCase();
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function setAll(list: Recipient[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of list) {
        const key = r.email.toLowerCase();
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  async function onSend() {
    if (selected.size === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/forest-house/admin/run-of-show/${slug}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipients: Array.from(selected) }),
        },
      );
      const body = (await res.json()) as {
        ok: boolean;
        sent?: number;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        setResult({
          kind: "error",
          message: body.error ?? "Send failed",
        });
        setSending(false);
        return;
      }
      setResult({ kind: "ok", count: body.sent ?? selected.size });
      setSending(false);
      // Auto-close after a moment so user sees the confirmation
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setResult({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Send ${eventName} Run of Show`}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !sending && onClose()}
      />
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-fh-card border border-fh-border">
        <header className="px-6 py-5 border-b border-fh-border flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-fh-accent mb-1">
              Send ROS
            </p>
            <h2 className="text-xl font-black uppercase tracking-[-0.01em]">
              {eventName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="text-fh-muted hover:text-fh-text transition-colors disabled:opacity-40 text-xl leading-none px-2"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {core.length > 0 && (
            <RecipientGroup
              label="Core Leads"
              list={core}
              selected={selected}
              onToggle={toggle}
              onSetAll={(checked) => setAll(core, checked)}
              sending={sending}
            />
          )}
          <RecipientGroup
            label={`Registered Crew${crew.length > 0 ? "" : " · None yet"}`}
            list={crew}
            selected={selected}
            onToggle={toggle}
            onSetAll={(checked) => setAll(crew, checked)}
            sending={sending}
          />
        </div>

        {result?.kind === "error" && (
          <p
            role="alert"
            className="mx-6 mb-2 text-sm text-fh-ember border border-fh-ember/50 p-3"
          >
            {result.message}
          </p>
        )}
        {result?.kind === "ok" && (
          <p
            role="status"
            className="mx-6 mb-2 text-sm text-fh-accent border border-fh-accent/50 p-3"
          >
            Sent to {result.count} {result.count === 1 ? "recipient" : "recipients"}.
          </p>
        )}

        <footer className="px-6 py-4 border-t border-fh-border flex flex-wrap items-center justify-between gap-3 bg-fh-bg/40">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-text hover:text-fh-text transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={sending || selected.size === 0}
              className="px-6 py-2.5 bg-fh-accent text-fh-bg text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {sending ? "Sending…" : `Send to ${selected.size}`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function RecipientGroup({
  label,
  list,
  selected,
  onToggle,
  onSetAll,
  sending,
}: {
  label: string;
  list: Recipient[];
  selected: Set<string>;
  onToggle: (email: string) => void;
  onSetAll: (checked: boolean) => void;
  sending: boolean;
}) {
  const allChecked =
    list.length > 0 && list.every((r) => selected.has(r.email.toLowerCase()));
  const someChecked = list.some((r) => selected.has(r.email.toLowerCase()));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted">
          {label} {list.length > 0 && `· ${list.length}`}
        </span>
        {list.length > 0 && (
          <button
            type="button"
            disabled={sending}
            onClick={() => onSetAll(!allChecked)}
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fh-muted hover:text-fh-accent transition-colors disabled:opacity-40"
          >
            {allChecked ? "Clear all" : someChecked ? "Select all" : "Select all"}
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-xs text-fh-muted italic">
          No one in this group yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {list.map((r) => {
            const checked = selected.has(r.email.toLowerCase());
            return (
              <li key={r.email}>
                <label
                  className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                    checked
                      ? "bg-fh-accent/5 border-fh-accent/40"
                      : "bg-transparent border-fh-border/60 hover:border-fh-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(r.email)}
                    disabled={sending}
                    className="mt-1 accent-fh-accent"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm font-bold text-fh-text truncate">
                        {r.name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fh-muted">
                        {r.role}
                      </span>
                    </div>
                    <span className="text-xs text-fh-text-secondary break-all">
                      {r.email}
                    </span>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
