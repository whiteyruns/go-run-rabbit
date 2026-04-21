"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ROLES,
  SKILLS,
  ROLE_LABELS,
  SKILL_LABELS,
  CINCO_ALL_DATES,
  CINCO_BUILD_DATES,
  CINCO_EVENT_DATE,
  CINCO_STRIKE_DATE,
  EDC_ALL_DATES,
  PLAZA_BUILD_DATES,
  SITE_BUILD_DATES,
  STRIKE_DATES,
  EDC_PARADE_DATE,
  EDC_FESTIVAL_DATES,
  JUNE_ALL_DATES,
  JUNE_BUILD_DATE,
  JUNE_EVENT_DATE,
  JUNE_STRIKE_DATE,
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
  cincoDeMayo: boolean;
  edcParade: boolean;
  edcFestival: boolean;
  juneBlockParty: boolean;
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
  cincoDeMayo: false,
  edcParade: false,
  edcFestival: false,
  juneBlockParty: false,
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
    cincoDeMayo: s.cincoDeMayo,
    edcParade: s.edcParade,
    edcFestival: s.edcFestival,
    juneBlockParty: s.juneBlockParty,
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

function formatMd(iso: DeployDate): string {
  const parts = iso.split("-").map(Number);
  return `${parts[1]}/${parts[2]}`;
}

function formatFestivalRange(): string {
  const first = EDC_FESTIVAL_DATES[0];
  const last = EDC_FESTIVAL_DATES[EDC_FESTIVAL_DATES.length - 1];
  return `Fri–Sun ${formatMd(first)}–${formatMd(last)}`;
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

  // When an event is unchecked, drop any availability days scoped to it —
  // otherwise the registrant ends up with "phantom" days they can't see.
  useEffect(() => {
    setState((s) => {
      const edcOn = s.edcParade || s.edcFestival;
      const next = s.availability.filter((d) => {
        if (CINCO_ALL_DATES.includes(d) && !s.cincoDeMayo) return false;
        if (EDC_ALL_DATES.includes(d) && !edcOn) return false;
        if (JUNE_ALL_DATES.includes(d) && !s.juneBlockParty) return false;
        return true;
      });
      if (next.length === s.availability.length) return s;
      return { ...s, availability: next };
    });
  }, [state.cincoDeMayo, state.edcParade, state.edcFestival, state.juneBlockParty]);

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

      <FieldGroup label="Which events?" hint="Pick any combination">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Toggle
            label="Cinco de Mayo"
            hint={`East Fremont · Tue ${formatMd(CINCO_EVENT_DATE)}`}
            checked={state.cincoDeMayo}
            onChange={(v) => setState((s) => ({ ...s, cincoDeMayo: v }))}
          />
          <Toggle
            label="EDC Parade"
            hint={`The Strip · Prodigal Swan · Thu ${formatMd(EDC_PARADE_DATE)}`}
            checked={state.edcParade}
            onChange={(v) => setState((s) => ({ ...s, edcParade: v }))}
          />
          <Toggle
            label="EDC Festival"
            hint={`Speedway · ForestHouse · ${formatFestivalRange()}`}
            checked={state.edcFestival}
            onChange={(v) => setState((s) => ({ ...s, edcFestival: v }))}
          />
          <Toggle
            label="June Block Party"
            hint={`East Fremont · Thu ${formatMd(JUNE_EVENT_DATE)}`}
            checked={state.juneBlockParty}
            onChange={(v) =>
              setState((s) => ({ ...s, juneBlockParty: v }))
            }
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="Availability"
        hint="Pick every day you can be on site"
        error={errors.availability}
      >
        {!state.cincoDeMayo &&
        !state.edcParade &&
        !state.edcFestival &&
        !state.juneBlockParty ? (
          <p className="text-xs uppercase tracking-[0.25em] text-fh-muted">
            Pick at least one event above to choose your days
          </p>
        ) : (
          <DayGrid
            showCinco={state.cincoDeMayo}
            showEdcParade={state.edcParade}
            showEdcFestival={state.edcFestival}
            showJune={state.juneBlockParty}
            selected={state.availability}
            onToggle={(d) =>
              setState((s) => ({ ...s, availability: toggle(s.availability, d) }))
            }
          />
        )}
      </FieldGroup>

      <FieldGroup label="Crew commitments" hint="Build / Strike windows">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          className="w-full bg-fh-bg border border-fh-border focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text p-3 text-sm leading-relaxed"
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
        <p className="text-fh-ember text-sm" role="alert">
          {errors._form}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 pt-4 border-t border-fh-border/60">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="inline-flex items-center justify-center gap-3 bg-fh-accent text-fh-bg px-8 sm:px-10 py-4 text-sm font-bold uppercase tracking-[0.25em] hover:brightness-110 active:scale-[0.98] transition-all disabled:bg-fh-text/10 disabled:text-fh-text/30 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Registration"}
        </button>
        {!isValid && (
          <p className="text-xs uppercase tracking-[0.2em] text-fh-text/40 text-center sm:text-left">
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
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-3">
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
        <p className="mt-2 text-xs text-fh-ember" role="alert">
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
        className="w-full bg-fh-bg border border-fh-border focus:border-fh-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fh-accent/40 text-fh-text px-3 py-2.5 text-sm"
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
      className={`min-h-[44px] sm:min-h-0 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
        selected
          ? "bg-fh-accent border-fh-accent text-fh-bg"
          : "bg-transparent border-fh-border text-fh-text/80 hover:border-fh-accent/60"
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
          : "bg-fh-card border-fh-border/60 hover:border-fh-text/30"
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

type DayGroup = {
  label: string;
  subtitle: string;
  dates: readonly DeployDate[];
  scope: "cinco" | "edc-any" | "edc-parade" | "edc-festival" | "june";
};

const DAY_GROUPS: readonly DayGroup[] = [
  {
    label: "Cinco de Mayo",
    subtitle: `East Fremont · Build ${formatMd(CINCO_BUILD_DATES[0])}–${formatMd(CINCO_BUILD_DATES[CINCO_BUILD_DATES.length - 1])} · Party Tue ${formatMd(CINCO_EVENT_DATE)} · Strike Wed ${formatMd(CINCO_STRIKE_DATE)}`,
    dates: [...CINCO_BUILD_DATES, CINCO_EVENT_DATE, CINCO_STRIKE_DATE],
    scope: "cinco",
  },
  {
    label: "Plaza Build",
    subtitle: `Off-site staging · ${formatMd(PLAZA_BUILD_DATES[0])}–${formatMd(PLAZA_BUILD_DATES[PLAZA_BUILD_DATES.length - 1])}`,
    dates: PLAZA_BUILD_DATES,
    scope: "edc-any",
  },
  {
    label: "Site Build",
    subtitle: `Speedway load-in · ${formatMd(SITE_BUILD_DATES[0])}–${formatMd(SITE_BUILD_DATES[SITE_BUILD_DATES.length - 1])}`,
    dates: SITE_BUILD_DATES,
    scope: "edc-any",
  },
  {
    label: "EDC Parade",
    subtitle: `The Strip · Prodigal Swan · Thu ${formatMd(EDC_PARADE_DATE)}`,
    dates: [EDC_PARADE_DATE],
    scope: "edc-parade",
  },
  {
    label: "EDC Festival",
    subtitle: `Speedway · ForestHouse · Fri–Sun ${formatMd(EDC_FESTIVAL_DATES[0])}–${formatMd(EDC_FESTIVAL_DATES[EDC_FESTIVAL_DATES.length - 1])}`,
    dates: EDC_FESTIVAL_DATES,
    scope: "edc-festival",
  },
  {
    label: "EDC Strike",
    subtitle: `Teardown · ${formatMd(STRIKE_DATES[0])}–${formatMd(STRIKE_DATES[STRIKE_DATES.length - 1])}`,
    dates: STRIKE_DATES,
    scope: "edc-any",
  },
  {
    label: "June Block Party",
    subtitle: `East Fremont · Build Wed ${formatMd(JUNE_BUILD_DATE)} · Party Thu ${formatMd(JUNE_EVENT_DATE)} · Strike Fri ${formatMd(JUNE_STRIKE_DATE)}`,
    dates: JUNE_ALL_DATES,
    scope: "june",
  },
];

function DayGrid({
  showCinco,
  showEdcParade,
  showEdcFestival,
  showJune,
  selected,
  onToggle,
}: {
  showCinco: boolean;
  showEdcParade: boolean;
  showEdcFestival: boolean;
  showJune: boolean;
  selected: DeployDate[];
  onToggle: (d: DeployDate) => void;
}) {
  const showEdcAny = showEdcParade || showEdcFestival;
  const visible = DAY_GROUPS.filter((g) => {
    if (g.scope === "cinco") return showCinco;
    if (g.scope === "edc-any") return showEdcAny;
    if (g.scope === "edc-parade") return showEdcParade;
    if (g.scope === "edc-festival") return showEdcFestival;
    if (g.scope === "june") return showJune;
    return false;
  });
  return (
    <div className="space-y-6">
      {visible.map((group) => (
        <div key={group.label}>
          <div className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-text/80">
              {group.label}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-fh-muted">
              {group.subtitle}
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={group.label}
          >
            {group.dates.map((d) => {
              const isSelected = selected.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(d)}
                  className={`min-h-[44px] sm:min-h-0 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] tabular-nums border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
                    isSelected
                      ? "bg-fh-accent border-fh-accent text-fh-bg"
                      : "bg-transparent border-fh-border text-fh-text/70 hover:border-fh-accent/60"
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
