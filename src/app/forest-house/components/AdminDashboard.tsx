"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ROLES,
  DEPLOY_DATES,
  ROLE_LABELS,
  SKILL_LABELS,
  DATE_BUCKET,
  BUCKET_LABELS,
  type Role,
  type DeployDate,
} from "@/lib/forest-house/constants";
import {
  computeRoleCoverage,
  computeDayCoverage,
  filterCrew,
  totalRoleGaps,
  totalDayGaps,
  type CrewFilter,
} from "@/lib/forest-house/coverage";
import type { CrewRecord } from "@/lib/forest-house/schema";

export default function AdminDashboard({ crew }: { crew: CrewRecord[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<CrewFilter>({ role: "all", day: "all" });

  const roleCoverage = useMemo(() => computeRoleCoverage(crew), [crew]);
  const dayCoverage = useMemo(() => computeDayCoverage(crew), [crew]);
  const roleGaps = useMemo(() => totalRoleGaps(roleCoverage), [roleCoverage]);
  const dayGaps = useMemo(() => totalDayGaps(dayCoverage), [dayCoverage]);

  const filtered = useMemo(() => filterCrew(crew, filter), [crew, filter]);
  const grouped = useMemo(() => {
    const byRole = new Map<Role, CrewRecord[]>();
    for (const r of ROLES) byRole.set(r, []);
    for (const c of filtered) byRole.get(c.preferredRole)?.push(c);
    return byRole;
  }, [filtered]);

  async function onLogout() {
    await fetch("/api/forest-house/admin/logout", { method: "POST" });
    router.push("/forest-house/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-12 pt-10 sm:pt-12 pb-16 sm:pb-24 space-y-10 sm:space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-fh-border pb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-4">
            [ Staffing Board ]
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
            Crew
            <br />
            Board
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/forest-house/crew/export"
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-black uppercase tracking-[0.3em] hover:border-fh-accent hover:text-fh-accent transition-colors"
          >
            Export CSV
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="px-5 py-2.5 border border-fh-border/70 text-[11px] font-black uppercase tracking-[0.3em] hover:border-fh-accent hover:text-fh-accent transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Registered" value={crew.length} />
        <StatCard label="Role Gaps" value={roleGaps} alert={roleGaps > 0} />
        <StatCard label="Day Gaps" value={dayGaps} alert={dayGaps > 0} />
      </section>

      <section>
        <SectionHeading>Coverage by Role</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleCoverage.map((rc) => {
            const pct =
              rc.target === 0
                ? 100
                : Math.min(100, Math.round((rc.assigned / rc.target) * 100));
            const short = rc.gap > 0;
            return (
              <div
                key={rc.role}
                className={`p-5 bg-fh-card border ${short ? "border-fh-ember/50" : "border-fh-border"}`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
                    {ROLE_LABELS[rc.role]}
                  </span>
                  {short && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fh-ember">
                      {rc.gap} short
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 mb-2 tabular-nums">
                  <span
                    className={`text-3xl font-black ${short ? "text-fh-ember" : "text-fh-text"}`}
                  >
                    {rc.assigned}
                  </span>
                  <span className="text-sm text-fh-muted">/ {rc.target}</span>
                </div>
                <div className="h-1 bg-fh-border/60 overflow-hidden">
                  <div
                    className={`h-full ${short ? "bg-fh-ember" : "bg-fh-accent"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading>Coverage by Day</SectionHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.3em] text-fh-muted border-b border-fh-border">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Window</th>
                <th className="py-3 pr-4 tabular-nums">Available</th>
                <th className="py-3 pr-4">Roles Present</th>
              </tr>
            </thead>
            <tbody>
              {dayCoverage.map((dc) => (
                <tr
                  key={dc.date}
                  className="border-b border-fh-border/40 last:border-0"
                >
                  <td className="py-3 pr-4 tabular-nums whitespace-nowrap">
                    {formatDate(dc.date)}
                  </td>
                  <td className="py-3 pr-4 text-[10px] uppercase tracking-[0.25em] text-fh-muted whitespace-nowrap">
                    {BUCKET_LABELS[DATE_BUCKET[dc.date]]}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    <span
                      className={
                        dc.gap > 0 ? "text-fh-ember font-bold" : undefined
                      }
                    >
                      {dc.available}
                    </span>
                    <span className="text-fh-muted"> / {dc.target}</span>
                    {dc.gap > 0 && (
                      <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] bg-fh-ember/15 text-fh-ember">
                        {dc.gap} short
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {dc.roles.length === 0 ? (
                        <span className="text-fh-muted text-xs uppercase tracking-[0.2em]">
                          none
                        </span>
                      ) : (
                        dc.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] border border-fh-border text-fh-text/70"
                          >
                            {ROLE_LABELS[r]}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeading>Roster</SectionHeading>
        <div className="mb-6 space-y-4">
          <FilterRow
            label="Role"
            value={filter.role}
            onChange={(v) => setFilter((f) => ({ ...f, role: v }))}
            options={[
              { value: "all", label: "All" },
              ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
            ]}
          />
          <FilterRow
            label="Day"
            value={filter.day}
            onChange={(v) => setFilter((f) => ({ ...f, day: v }))}
            options={[
              { value: "all", label: "All" },
              ...DEPLOY_DATES.map((d) => ({
                value: d,
                label: formatDate(d),
              })),
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-fh-muted text-sm uppercase tracking-[0.25em]">
            No crew match the current filters.
          </p>
        ) : (
          <div className="space-y-10">
            {ROLES.map((role) => {
              const members = grouped.get(role) ?? [];
              if (members.length === 0) return null;
              return (
                <div key={role}>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-fh-accent mb-4">
                    {ROLE_LABELS[role]} · {members.length}
                  </h3>
                  <div className="space-y-3">
                    {members.map((m) => (
                      <RosterRow key={m.id} member={m} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-fh-text/80 mb-5">
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  const isRegistered = label === "Registered";
  const zeroSuccess = value === 0 && !isRegistered;
  const valueClass = alert
    ? "text-fh-ember"
    : zeroSuccess
      ? "text-fh-teal"
      : isRegistered
        ? "bg-fh-rainbow bg-clip-text text-transparent"
        : "text-fh-text";
  return (
    <div
      className={`p-6 bg-fh-card border ${alert ? "border-fh-ember/50" : "border-fh-border"}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-3">
        {label}
      </p>
      <p className={`text-[42px] font-black tabular-nums tracking-[-0.02em] ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-fh-muted mr-2">
        {label}
      </span>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] border transition-colors focus-visible:ring-2 focus-visible:ring-fh-accent/40 focus-visible:outline-none ${
              active
                ? "bg-fh-accent border-fh-accent text-fh-bg"
                : "bg-transparent border-fh-border text-fh-text/70 hover:border-fh-accent/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RosterRow({ member }: { member: CrewRecord }) {
  return (
    <div className="p-4 bg-fh-card border border-fh-border">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-3">
        <div className="flex items-baseline gap-3">
          <h4 className="text-base font-bold">{member.name}</h4>
          {member.critical && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] bg-fh-accent text-fh-bg">
              On-call
            </span>
          )}
          {member.backupRole && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-fh-muted">
              Backup: {ROLE_LABELS[member.backupRole]}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-4 text-xs text-fh-text/60">
          <a
            href={`mailto:${member.email}`}
            className="hover:text-fh-accent transition-colors"
          >
            {member.email}
          </a>
          <a
            href={`tel:${member.phone.replace(/[^+0-9]/g, "")}`}
            className="hover:text-fh-accent transition-colors tabular-nums"
          >
            {member.phone}
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {member.buildCrew && <Badge>Build</Badge>}
        {member.strikeCrew && <Badge>Strike</Badge>}
        {member.cincoDeMayo && <Badge>Cinco de Mayo</Badge>}
        {member.edcParade && <Badge>EDC Parade</Badge>}
        {member.edcFestival && <Badge>EDC Festival</Badge>}
        {member.skills.map((sk) => (
          <Badge key={sk} muted>
            {SKILL_LABELS[sk]}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {member.availability.map((d) => (
          <span
            key={d}
            className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] tabular-nums text-fh-muted border border-fh-border/60"
          >
            {formatDayShort(d)}
          </span>
        ))}
      </div>
      {member.notes && (
        <p className="mt-3 pt-3 border-t border-fh-border/40 text-xs text-fh-text/60 leading-relaxed">
          {member.notes}
        </p>
      )}
    </div>
  );
}

function Badge({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${
        muted
          ? "border border-fh-border text-fh-text/60"
          : "bg-fh-accent/15 text-fh-accent"
      }`}
    >
      {children}
    </span>
  );
}

function formatDate(iso: DeployDate): string {
  const parts = iso.split("-").map(Number);
  const m = parts[1];
  const d = parts[2];
  const date = new Date(Date.UTC(parts[0], m - 1, d));
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  return `${weekday} ${m}/${d}`;
}

function formatDayShort(iso: DeployDate): string {
  const parts = iso.split("-").map(Number);
  return `${parts[1]}/${parts[2]}`;
}
