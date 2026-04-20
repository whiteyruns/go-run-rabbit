"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ROLES,
  SKILLS,
  DEPLOY_DATES,
  ROLE_LABELS,
  SKILL_LABELS,
  DATE_BUCKET,
  type Role,
  type Skill,
  type DeployDate,
} from "@/lib/forest-house/constants";
import { RegistrationInputSchema } from "@/lib/forest-house/schema";

type FormState = {
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  preferredRole: Role | "";
  backupRole: Role | "";
  availability: DeployDate[];
  buildCrew: boolean;
  strikeCrew: boolean;
  paradeCrew: boolean;
  skills: Skill[];
  critical: boolean;
  notes: string;
  website: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  roles: [],
  preferredRole: "",
  backupRole: "",
  availability: [],
  buildCrew: false,
  strikeCrew: false,
  paradeCrew: false,
  skills: [],
  critical: false,
  notes: "",
  website: "",
};

function toPayload(s: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: s.name,
    email: s.email,
    phone: s.phone,
    roles: s.roles,
    availability: s.availability,
    buildCrew: s.buildCrew,
    strikeCrew: s.strikeCrew,
    paradeCrew: s.paradeCrew,
    skills: s.skills,
    critical: s.critical,
    website: s.website,
  };
  if (s.preferredRole) payload.preferredRole = s.preferredRole;
  if (s.backupRole) payload.backupRole = s.backupRole;
  if (s.notes.trim().length > 0) payload.notes = s.notes;
  return payload;
}

function formatDayLabel(iso: DeployDate): string {
  const parts = iso.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  return `${weekday.toUpperCase()} ${m}/${d}`;
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export default function RegistrationForm() {
  const [state, setState] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{
    name: string;
    id: string;
    updated: boolean;
  } | null>(null);

  const parsed = useMemo(
    () => RegistrationInputSchema.safeParse(toPayload(state)),
    [state],
  );
  const isValid = parsed.success;

  const onToggleRole = (r: Role) => {
    setState((s) => {
      const roles = toggle(s.roles, r);
      let preferredRole: Role | "" = s.preferredRole;
      if (preferredRole && !roles.includes(preferredRole)) preferredRole = "";
      if (!preferredRole && roles.length === 1) preferredRole = roles[0];
      let backupRole: Role | "" = s.backupRole;
      if (backupRole && !roles.includes(backupRole)) backupRole = "";
      if (backupRole && backupRole === preferredRole) backupRole = "";
      return { ...s, roles, preferredRole, backupRole };
    });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/forest-house/crew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(state)),
      });
      const data = (await res.json()) as {
        ok: boolean;
        record?: { id: string; name: string };
        issues?: Array<{ path: (string | number)[]; message: string }>;
        error?: string;
      };
      if (!res.ok) {
        if (data.issues && data.issues.length > 0) {
          const first = data.issues[0];
          const field = String(first.path[0] ?? "_form");
          setErrors({ [field]: first.message });
        } else {
          setErrors({ _form: data.error ?? "Submission failed" });
        }
        setSubmitting(false);
        return;
      }
      setSubmitted({
        name: data.record?.name ?? state.name,
        id: data.record?.id ?? "",
        updated: res.status === 200,
      });
    } catch (err) {
      setErrors({
        _form: err instanceof Error ? err.message : "Network error",
      });
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-fh-card border border-fh-accent/40 p-8 max-w-2xl"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-fh-accent mb-4">
          {submitted.updated ? "Registration Updated" : "Registration Confirmed"}
        </p>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          Thanks, {submitted.name}.
        </h2>
        <p className="text-fh-text/80 mb-6 leading-relaxed">
          You&apos;re on the crew list. We&apos;ll reach out a week before
          deployment with load-in details. If anything changes, re-submit the
          form with the same email and we&apos;ll update your record.
        </p>
        <p className="text-xs text-fh-text/40 font-mono">
          Record ID: {submitted.id}
        </p>
      </div>
    );
  }

  const availableBackupRoles = state.roles.filter(
    (r) => r !== state.preferredRole,
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10 max-w-3xl" noValidate>
      <FieldGroup label="Contact" error={errors.name || errors.email || errors.phone}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            id="fh-name"
            label="Name"
            value={state.name}
            onChange={(v) => setState((s) => ({ ...s, name: v }))}
            error={errors.name}
            required
          />
          <TextInput
            id="fh-email"
            label="Email"
            type="email"
            value={state.email}
            onChange={(v) => setState((s) => ({ ...s, email: v }))}
            error={errors.email}
            required
          />
          <TextInput
            id="fh-phone"
            label="Phone"
            type="tel"
            value={state.phone}
            onChange={(v) => setState((s) => ({ ...s, phone: v }))}
            error={errors.phone}
            required
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Roles you can fill"
        hint="Pick all that apply"
        error={errors.roles}
      >
        <ChipRow>
          {ROLES.map((r) => (
            <Chip
              key={r}
              selected={state.roles.includes(r)}
              onClick={() => onToggleRole(r)}
              label={ROLE_LABELS[r]}
            />
          ))}
        </ChipRow>
      </FieldGroup>

      <FieldGroup
        label="Preferred role"
        hint="Your first-choice assignment"
        error={errors.preferredRole}
      >
        {state.roles.length === 0 ? (
          <p className="text-xs text-fh-text/40 uppercase tracking-[0.2em]">
            Select roles above first
          </p>
        ) : (
          <ChipRow>
            {state.roles.map((r) => (
              <Chip
                key={r}
                selected={state.preferredRole === r}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    preferredRole: r,
                    backupRole: s.backupRole === r ? "" : s.backupRole,
                  }))
                }
                label={ROLE_LABELS[r]}
              />
            ))}
          </ChipRow>
        )}
      </FieldGroup>

      <FieldGroup
        label="Backup role"
        hint="Optional — different from preferred"
        error={errors.backupRole}
      >
        {availableBackupRoles.length === 0 ? (
          <p className="text-xs text-fh-text/40 uppercase tracking-[0.2em]">
            Pick at least two roles to set a backup
          </p>
        ) : (
          <ChipRow>
            {availableBackupRoles.map((r) => (
              <Chip
                key={r}
                selected={state.backupRole === r}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    backupRole: s.backupRole === r ? "" : r,
                  }))
                }
                label={ROLE_LABELS[r]}
              />
            ))}
          </ChipRow>
        )}
      </FieldGroup>

      <FieldGroup
        label="Availability"
        hint="May 8–20, 2026 · pick every day you can be on site"
        error={errors.availability}
      >
        <DayGrid
          selected={state.availability}
          onToggle={(d) =>
            setState((s) => ({ ...s, availability: toggle(s.availability, d) }))
          }
        />
      </FieldGroup>

      <FieldGroup label="Crew commitments">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Toggle
            label="Build Crew"
            hint="Pre-deploy assembly"
            checked={state.buildCrew}
            onChange={(v) => setState((s) => ({ ...s, buildCrew: v }))}
          />
          <Toggle
            label="Strike Crew"
            hint="Post-event teardown"
            checked={state.strikeCrew}
            onChange={(v) => setState((s) => ({ ...s, strikeCrew: v }))}
          />
          <Toggle
            label="Parade Crew"
            hint="Wednesday 5/16"
            checked={state.paradeCrew}
            onChange={(v) => setState((s) => ({ ...s, paradeCrew: v }))}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Skills and certifications"
        hint="Optional — helps us match to tasks"
      >
        <ChipRow>
          {SKILLS.map((sk) => (
            <Chip
              key={sk}
              selected={state.skills.includes(sk)}
              onClick={() =>
                setState((s) => ({ ...s, skills: toggle(s.skills, sk) }))
              }
              label={SKILL_LABELS[sk]}
            />
          ))}
        </ChipRow>
      </FieldGroup>

      <FieldGroup label="Critical">
        <Toggle
          label="On-call / critical role"
          hint="Check if you're a key dependency — we'll treat your availability as load-bearing."
          checked={state.critical}
          onChange={(v) => setState((s) => ({ ...s, critical: v }))}
        />
      </FieldGroup>

      <FieldGroup label="Notes" hint="Optional — constraints, gear, context">
        <label htmlFor="fh-notes" className="sr-only">
          Notes
        </label>
        <textarea
          id="fh-notes"
          value={state.notes}
          onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
          maxLength={1000}
          rows={4}
          className="w-full bg-fh-bg border border-fh-text/20 focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text p-3 text-sm leading-relaxed"
        />
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-fh-text/40">
          {state.notes.length}/1000
        </p>
      </FieldGroup>

      {/* Honeypot — hidden from humans, bots fill it. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="fh-website">Website</label>
        <input
          id="fh-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={state.website}
          onChange={(e) => setState((s) => ({ ...s, website: e.target.value }))}
        />
      </div>

      <div aria-live="polite" className="sr-only">
        {Object.values(errors).find((m) => m) ?? ""}
      </div>

      {errors._form && (
        <p className="text-fh-accent text-sm" role="alert">
          {errors._form}
        </p>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-fh-text/10">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="inline-flex items-center gap-3 bg-fh-accent text-fh-bg px-10 py-4 text-sm font-bold uppercase tracking-[0.25em] hover:brightness-110 active:scale-[0.98] transition-all disabled:bg-fh-text/10 disabled:text-fh-text/30 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Registration"}
        </button>
        {!isValid && (
          <p className="text-xs uppercase tracking-[0.2em] text-fh-text/40">
            Fill required fields to enable
          </p>
        )}
      </div>
    </form>
  );
}

// ──────────────── helpers ────────────────

function FieldGroup({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-fh-text/80">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-fh-text/40">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-2 text-xs text-fh-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-[0.25em] text-fh-text/60 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        className="w-full bg-fh-bg border border-fh-text/20 focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text px-3 py-2.5 text-sm"
      />
    </div>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
        selected
          ? "bg-fh-accent border-fh-accent text-fh-bg"
          : "bg-transparent border-fh-text/20 text-fh-text/80 hover:border-fh-text/50"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex flex-col items-start text-left p-4 border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
        checked
          ? "bg-fh-accent/10 border-fh-accent"
          : "bg-fh-card border-fh-text/10 hover:border-fh-text/30"
      }`}
    >
      <span
        className={`text-xs font-bold uppercase tracking-[0.25em] ${
          checked ? "text-fh-accent" : "text-fh-text"
        }`}
      >
        {label}
      </span>
      {hint && (
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-fh-text/40">
          {hint}
        </span>
      )}
    </button>
  );
}

function DayGrid({
  selected,
  onToggle,
}: {
  selected: DeployDate[];
  onToggle: (d: DeployDate) => void;
}) {
  const grouped: Record<"build" | "event" | "strike", DeployDate[]> = {
    build: [],
    event: [],
    strike: [],
  };
  for (const d of DEPLOY_DATES) grouped[DATE_BUCKET[d]].push(d);

  return (
    <div className="space-y-4">
      {(["build", "event", "strike"] as const).map((bucket) => (
        <div key={bucket}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-fh-text/40 mb-2">
            {bucket}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={bucket}>
            {grouped[bucket].map((d) => {
              const isSelected = selected.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(d)}
                  className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] tabular-nums border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
                    isSelected
                      ? "bg-fh-accent border-fh-accent text-fh-bg"
                      : "bg-transparent border-fh-text/20 text-fh-text/70 hover:border-fh-text/50"
                  }`}
                >
                  {formatDayLabel(d)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
