"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import RunOfShow from "./RunOfShow";
import SendRosDialog, { type Recipient } from "./SendRosDialog";
import {
  getCoreLeadsForEvent,
  isCoreForEvent,
  type RunOfShowData,
  type ScheduleItem,
} from "@/lib/forest-house/run-of-show-data";
import { ROLE_LABELS } from "@/lib/forest-house/constants";
import type { CrewRecord } from "@/lib/forest-house/schema";

type Mode = "view" | "edit";

export default function RunOfShowClient({
  slug,
  initial,
  registeredCrew = [],
}: {
  slug: string;
  initial: RunOfShowData;
  registeredCrew?: CrewRecord[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState<RunOfShowData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  const allRecipients = useMemo<Recipient[]>(() => {
    const coreLeads = getCoreLeadsForEvent(slug).map<Recipient>((m) => ({
      email: m.email,
      name: m.name,
      role: m.role,
      group: "core",
    }));
    const crewPeople = registeredCrew
      .filter((c) => !isCoreForEvent(c.email, slug))
      .map<Recipient>((c) => ({
        email: c.email,
        name: c.name,
        role: ROLE_LABELS[c.preferredRole],
        group: "crew",
      }));
    return [...coreLeads, ...crewPeople];
  }, [registeredCrew, slug]);

  // Keep draft in sync with server data when we're not actively editing.
  useEffect(() => {
    if (mode === "view") setDraft(initial);
  }, [initial, mode]);

  function startEdit() {
    setDraft(initial);
    setError(null);
    setMode("edit");
  }

  function cancelEdit() {
    setDraft(initial);
    setError(null);
    setMode("view");
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    // Drop empty power override so the default (shore + CamLock) renders
    // instead of trying to validate an empty summary.
    const trimmedAddOns = draft.addOns
      ?.map((s) => s.trim())
      .filter((s) => s.length > 0);
    const trimmedTalent = draft.talent
      ?.map((s) => s.trim())
      .filter((s) => s.length > 0);
    const payload: RunOfShowData = {
      ...draft,
      talent:
        trimmedTalent && trimmedTalent.length > 0 ? trimmedTalent : undefined,
      addOns:
        trimmedAddOns && trimmedAddOns.length > 0 ? trimmedAddOns : undefined,
      power:
        draft.power && draft.power.summary.trim().length > 0
          ? {
              summary: draft.power.summary.trim(),
              details: draft.power.details?.filter(
                (d) => d.trim().length > 0,
              ),
            }
          : undefined,
    };
    try {
      const res = await fetch(
        `/api/forest-house/admin/run-of-show/${slug}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = (await res.json()) as {
        ok: boolean;
        error?: string;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok || !body.ok) {
        const msg = body.issues?.[0]
          ? `${body.issues[0].path.join(".")}: ${body.issues[0].message}`
          : (body.error ?? "Save failed");
        setError(msg);
        setSaving(false);
        return;
      }
      setMode("view");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (mode === "view") {
    return (
      <>
        <div className="mx-auto max-w-5xl px-6 sm:px-12 pt-8 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => openWhatsAppReminder(slug, initial)}
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-accent hover:text-fh-accent transition-colors"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setSendOpen(true)}
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-accent hover:text-fh-accent transition-colors"
          >
            Send to Team
          </button>
          <button
            type="button"
            onClick={startEdit}
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-accent hover:text-fh-accent transition-colors"
          >
            Edit
          </button>
        </div>
        <RunOfShow
          data={initial}
          slug={slug}
          registeredCrew={registeredCrew}
        />
        <SendRosDialog
          slug={slug}
          eventName={initial.eventName}
          recipients={allRecipients}
          open={sendOpen}
          onClose={() => setSendOpen(false)}
        />
      </>
    );
  }

  return (
    <Editor
      draft={draft}
      setDraft={setDraft}
      onSave={onSave}
      onCancel={cancelEdit}
      saving={saving}
      error={error}
    />
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  error,
}: {
  draft: RunOfShowData;
  setDraft: React.Dispatch<React.SetStateAction<RunOfShowData>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-12 py-10 space-y-12">
      {/* Sticky save bar */}
      <div className="sticky top-20 z-10 -mx-2 px-2 py-3 bg-fh-bg/90 backdrop-blur border-b border-fh-border flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-accent">
          [ Editing · {draft.eventName} ]
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-text hover:text-fh-text transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 bg-fh-accent text-fh-bg text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-fh-ember border border-fh-ember/50 p-3 -mt-4"
        >
          {error}
        </p>
      )}

      <FieldBlock label="Event">
        <TextInput
          value={draft.eventName}
          onChange={(v) => setDraft((d) => ({ ...d, eventName: v }))}
          placeholder="Event name"
        />
        <TextInput
          value={draft.eventSubtitle ?? ""}
          onChange={(v) =>
            setDraft((d) => ({ ...d, eventSubtitle: v || undefined }))
          }
          placeholder="Subtitle (optional)"
        />
        <TextInput
          value={draft.location}
          onChange={(v) => setDraft((d) => ({ ...d, location: v }))}
          placeholder="Location"
        />
      </FieldBlock>

      <FieldBlock label="Talent">
        <StringList
          items={draft.talent ?? []}
          onChange={(next) =>
            setDraft((s) => ({
              ...s,
              talent: next.length > 0 ? next : undefined,
            }))
          }
          placeholder="e.g. Dillon Francis"
          addLabel="Add talent"
        />
      </FieldBlock>

      <FieldBlock label="Dates">
        <div className="space-y-3">
          {draft.dates.map((d, i) => (
            <div key={i} className="grid grid-cols-[1fr,1fr,auto] gap-2">
              <TextInput
                value={d.label}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    dates: s.dates.map((x, j) =>
                      j === i ? { ...x, label: v } : x,
                    ),
                  }))
                }
                placeholder="Label"
              />
              <TextInput
                value={d.value}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    dates: s.dates.map((x, j) =>
                      j === i ? { ...x, value: v } : x,
                    ),
                  }))
                }
                placeholder="Value"
              />
              <RemoveButton
                onClick={() =>
                  setDraft((s) => ({
                    ...s,
                    dates: s.dates.filter((_, j) => j !== i),
                  }))
                }
              />
            </div>
          ))}
          <AddButton
            label="Add date"
            onClick={() =>
              setDraft((s) => ({
                ...s,
                dates: [...s.dates, { label: "", value: "" }],
              }))
            }
          />
        </div>
      </FieldBlock>

      <FieldBlock label="Schedule">
        <div className="space-y-4">
          {draft.schedule.map((row, i) => (
            <ScheduleRowEditor
              key={i}
              row={row}
              onChange={(next) =>
                setDraft((s) => ({
                  ...s,
                  schedule: s.schedule.map((r, j) => (j === i ? next : r)),
                }))
              }
              onRemove={() =>
                setDraft((s) => ({
                  ...s,
                  schedule: s.schedule.filter((_, j) => j !== i),
                }))
              }
              onMove={(dir) =>
                setDraft((s) => {
                  const next = [...s.schedule];
                  const j = i + dir;
                  if (j < 0 || j >= next.length) return s;
                  [next[i], next[j]] = [next[j], next[i]];
                  return { ...s, schedule: next };
                })
              }
              first={i === 0}
              last={i === draft.schedule.length - 1}
            />
          ))}
          <AddButton
            label="Add schedule row"
            onClick={() =>
              setDraft((s) => ({
                ...s,
                schedule: [
                  ...s.schedule,
                  { item: "", date: "", time: "", duration: "", notes: "", lead: "" },
                ],
              }))
            }
          />
        </div>
      </FieldBlock>

      <FieldBlock label="Power">
        <p className="text-xs text-fh-muted mb-3">
          Leave summary blank to fall back to the default Shore Power +
          CamLock guide. Set a summary to override for this event (e.g.
          on-board generator, mains tie-in, etc.).
        </p>
        <div className="space-y-3">
          <TextInput
            value={draft.power?.summary ?? ""}
            onChange={(v) =>
              setDraft((s) => ({
                ...s,
                power: v
                  ? { summary: v, details: s.power?.details }
                  : undefined,
              }))
            }
            placeholder="e.g. On-board generator — no shore power required"
          />
          {draft.power && (
            <StringList
              items={draft.power.details ?? []}
              onChange={(next) =>
                setDraft((s) =>
                  s.power
                    ? {
                        ...s,
                        power: {
                          ...s.power,
                          details: next.length > 0 ? next : undefined,
                        },
                      }
                    : s,
                )
              }
              placeholder="Additional power detail (e.g. generator model)"
              addLabel="Add power detail"
            />
          )}
        </div>
      </FieldBlock>

      <FieldBlock label="Client Responsibilities">
        <StringList
          items={draft.clientResponsibilities}
          onChange={(next) =>
            setDraft((s) => ({ ...s, clientResponsibilities: next }))
          }
          placeholder="Client responsibility"
          addLabel="Add responsibility"
        />
      </FieldBlock>

      <FieldBlock label="Heavy Equipment">
        <StringList
          items={draft.heavyEquipment}
          onChange={(next) =>
            setDraft((s) => ({ ...s, heavyEquipment: next }))
          }
          placeholder="e.g. (1) 40' Boom Lift"
          addLabel="Add equipment"
        />
      </FieldBlock>

      <FieldBlock label="Effects & Add-Ons">
        <p className="text-xs text-fh-muted mb-3">
          Optional extras with pricing. Formatting suggestion:{" "}
          <code className="text-fh-text-secondary">
            Item (qty) · base price + per-shot price
          </code>
        </p>
        <StringList
          items={draft.addOns ?? []}
          onChange={(next) =>
            setDraft((s) => ({
              ...s,
              addOns: next.length > 0 ? next : undefined,
            }))
          }
          placeholder="e.g. Large confetti cannon · $400 + $200 per shot"
          addLabel="Add effect / add-on"
        />
      </FieldBlock>

      {/* Duplicated save bar at bottom for long forms */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-6 border-t border-fh-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-fh-text hover:text-fh-text transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 bg-fh-accent text-fh-bg text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// Opens WhatsApp (native or web) with a pre-filled reminder message. User
// picks the group/contact to send to — no Meta Business setup required.
function openWhatsAppReminder(slug: string, data: RunOfShowData) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const lines: string[] = [];
  lines.push(`Forest House · ${data.eventName}`);
  if (data.eventSubtitle) lines.push(data.eventSubtitle);
  lines.push(`Location: ${data.location}`);
  if (data.talent && data.talent.length > 0) {
    lines.push("");
    lines.push(`Talent: ${data.talent.join(" · ")}`);
  }
  if (data.schedule.length > 0) {
    lines.push("");
    lines.push("Schedule:");
    for (const row of data.schedule) {
      const time =
        row.time && row.time.toUpperCase() !== "TBD" ? ` ${row.time}` : "";
      lines.push(`· ${row.date}${time} — ${row.item}`);
    }
  }
  lines.push("");
  lines.push(
    `Full ROS: ${origin}/forest-house/admin/run-of-show/${slug}`,
  );
  const text = lines.join("\n");
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function ScheduleRowEditor({
  row,
  onChange,
  onRemove,
  onMove,
  first,
  last,
}: {
  row: ScheduleItem;
  onChange: (next: ScheduleItem) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  return (
    <div className="p-4 bg-fh-card border border-fh-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <LabeledInput
          label="Item"
          value={row.item}
          onChange={(v) => onChange({ ...row, item: v })}
        />
        <LabeledInput
          label="Date"
          value={row.date}
          onChange={(v) => onChange({ ...row, date: v })}
          placeholder="Mon 5/4"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <LabeledInput
          label="Time"
          value={row.time ?? ""}
          onChange={(v) => onChange({ ...row, time: v || undefined })}
          placeholder="10:00a"
        />
        <LabeledInput
          label="Duration"
          value={row.duration ?? ""}
          onChange={(v) => onChange({ ...row, duration: v || undefined })}
          placeholder="7:00"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-3 mb-4">
        <LabeledInput
          label="Notes"
          value={row.notes ?? ""}
          onChange={(v) => onChange({ ...row, notes: v || undefined })}
        />
        <LabeledInput
          label="Lead"
          value={row.lead ?? ""}
          onChange={(v) => onChange({ ...row, lead: v || undefined })}
          placeholder="Keith White"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <SmallButton onClick={() => onMove(-1)} disabled={first}>
            ↑
          </SmallButton>
          <SmallButton onClick={() => onMove(1)} disabled={last}>
            ↓
          </SmallButton>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fh-ember hover:brightness-125 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function StringList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr,auto] gap-2">
          <TextInput
            value={s}
            onChange={(v) =>
              onChange(items.map((x, j) => (j === i ? v : x)))
            }
            placeholder={placeholder}
          />
          <RemoveButton
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <AddButton label={addLabel} onClick={() => onChange([...items, ""])} />
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-4">
        [ {label} ]
      </h3>
      {children}
    </section>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-fh-bg border border-fh-border focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text px-3 py-2.5 text-sm"
    />
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-fh-muted mb-1">
        {label}
      </span>
      <TextInput value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] font-bold uppercase tracking-[0.3em] text-fh-muted hover:text-fh-accent transition-colors border border-dashed border-fh-border/70 hover:border-fh-accent px-4 py-3 w-full"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="px-3 text-fh-muted hover:text-fh-ember transition-colors border border-fh-border/70 hover:border-fh-ember"
    >
      ×
    </button>
  );
}

function SmallButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 border border-fh-border/70 text-fh-muted hover:text-fh-accent hover:border-fh-accent disabled:opacity-30 disabled:hover:border-fh-border/70 disabled:hover:text-fh-muted transition-colors"
    >
      {children}
    </button>
  );
}
