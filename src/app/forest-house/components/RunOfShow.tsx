import Image from "next/image";
import {
  AUDIO_GEAR,
  LASER_GEAR,
  POWER_REQUIREMENTS,
  VEHICLE_SPECS,
  getCoreLeadsForEvent,
  isCoreForEvent,
  type RunOfShowData,
  type TeamMember,
} from "@/lib/forest-house/run-of-show-data";
import { ROLE_LABELS, SKILL_LABELS } from "@/lib/forest-house/constants";
import type { CrewRecord } from "@/lib/forest-house/schema";

// Server component — renders a run-of-show page from event-specific data.
// Gating happens at the page layer.
export default function RunOfShow({
  data,
  slug,
  registeredCrew = [],
  publicView = false,
}: {
  data: RunOfShowData;
  slug?: string;
  registeredCrew?: CrewRecord[];
  publicView?: boolean;
}) {
  const coreLeads = getCoreLeadsForEvent(slug);
  const registered = registeredCrew.filter(
    (c) => !isCoreForEvent(c.email, slug),
  );
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-12 pb-20">
      {/* Hero */}
      <header className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-fh-border">
        <div className="flex items-start gap-5 mb-8">
          <Image
            src="/forest-house/logo.png"
            alt="ForestHouse"
            width={120}
            height={95}
            className="h-14 sm:h-16 w-auto opacity-95"
            priority
          />
          <div className="flex-1 flex flex-col items-end text-right">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted">
              ForestHouse Art Car
            </span>
            <a
              href="https://www.foresthou.se"
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-fh-muted hover:text-fh-accent transition-colors"
            >
              foresthou.se
            </a>
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted">
          [ Run of Show · {data.eventName} ]
        </p>
        <h1 className="mt-4 text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          Run
          <br />
          Of
          <br />
          Show
        </h1>
        {data.eventSubtitle && (
          <p className="mt-6 text-lg sm:text-xl font-light text-fh-text-secondary">
            {data.eventSubtitle}
          </p>
        )}
        <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-fh-muted">
          * schedule may change · last updated {data.lastUpdated}
        </p>
      </header>

      {/* Event Details */}
      <Section label="Event Details">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted mb-1">
              Location
            </dt>
            <dd className="text-base text-fh-text">{data.location}</dd>
          </div>
          {data.dates.map((d) => (
            <div key={d.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted mb-1">
                {d.label}
              </dt>
              <dd className="text-base text-fh-text tabular-nums">
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
        {data.talent && data.talent.length > 0 && (
          <div className="mt-7 pt-5 border-t border-fh-border/60">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted mb-2">
              Talent
            </p>
            <p className="text-xl sm:text-2xl font-extrabold tracking-[-0.01em] bg-fh-rainbow bg-clip-text text-transparent">
              {data.talent.join(" · ")}
            </p>
          </div>
        )}
      </Section>

      {/* Schedule */}
      <Section label="Schedule">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.3em] text-fh-muted border-b border-fh-border">
                <th className="py-3 pr-4 whitespace-nowrap">Item</th>
                <th className="py-3 pr-4 whitespace-nowrap">Date</th>
                <th className="py-3 pr-4 whitespace-nowrap">Time</th>
                <th className="py-3 pr-4 whitespace-nowrap">Duration</th>
                <th className="py-3 pr-4">Notes</th>
                <th className="py-3 pr-4 whitespace-nowrap">Lead</th>
              </tr>
            </thead>
            <tbody>
              {data.schedule.map((row, i) => (
                <tr
                  key={`${row.date}-${row.item}-${i}`}
                  className="border-b border-fh-border/40 last:border-0"
                >
                  <td className="py-3 pr-4 font-semibold">{row.item}</td>
                  <td className="py-3 pr-4 tabular-nums whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 pr-4 tabular-nums whitespace-nowrap text-fh-text-secondary">
                    {row.time ?? "—"}
                  </td>
                  <td className="py-3 pr-4 tabular-nums whitespace-nowrap text-fh-text-secondary">
                    {row.duration ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-fh-text-secondary">
                    {row.notes ?? "—"}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-fh-text-secondary">
                    {row.lead ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Vehicle + Gear two-column */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <SectionHeading>Vehicle Specifications</SectionHeading>
          <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {data.vehicleSpecs ? (
              data.vehicleSpecs.map((row, i) => {
                const last = i === data.vehicleSpecs!.length - 1;
                const odd = data.vehicleSpecs!.length % 2 === 1;
                const wide = row.value.length > 32;
                const node = <SpecRow label={row.label} value={row.value} />;
                return wide || (last && odd) ? (
                  <div key={`${row.label}-${i}`} className="col-span-2">
                    {node}
                  </div>
                ) : (
                  <div key={`${row.label}-${i}`} className="contents">
                    {node}
                  </div>
                );
              })
            ) : (
              <>
                <SpecRow label="Chassis" value={VEHICLE_SPECS.chassis} />
                <SpecRow label="Engine" value={VEHICLE_SPECS.engine} />
                <SpecRow label="Height" value={VEHICLE_SPECS.height} />
                <SpecRow label="Width" value={VEHICLE_SPECS.width} />
                <SpecRow label="Length" value={VEHICLE_SPECS.length} />
                <SpecRow label="Weight" value={VEHICLE_SPECS.weight} />
                <div className="col-span-2">
                  <SpecRow
                    label="Stabilizers"
                    value={VEHICLE_SPECS.stabilizers}
                  />
                </div>
              </>
            )}
          </dl>

          <SectionHeading className="mt-12">Power Requirements</SectionHeading>
          {data.power ? (
            <>
              <p className="mt-4 text-sm text-fh-text">
                {data.power.summary}
              </p>
              {data.power.details && data.power.details.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-fh-text-secondary">
                  {data.power.details.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className="mt-4 text-sm text-fh-text-secondary">
                Shore Power — {POWER_REQUIREMENTS.shorePower}
              </p>
              <ul className="mt-4 space-y-2">
                {POWER_REQUIREMENTS.camLock.map((c) => (
                  <li
                    key={c.color}
                    className="flex items-center gap-3 text-sm tabular-nums"
                  >
                    <span
                      className="inline-block h-4 w-6 border border-fh-border/60"
                      style={{ backgroundColor: c.swatch }}
                      aria-hidden
                    />
                    <span className="font-semibold w-16">{c.color}</span>
                    <span className="text-fh-text-secondary">{c.label}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <SectionHeading>Audio & Lighting</SectionHeading>
          <div className="mt-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted mb-2">
              Audio
            </h4>
            <ul className="space-y-1 text-sm">
              {AUDIO_GEAR.map((g) => (
                <li key={g} className="text-fh-text-secondary">
                  • {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fh-muted mb-2">
              Lasers
            </h4>
            <ul className="space-y-1 text-sm">
              {LASER_GEAR.map((g) => (
                <li key={g} className="text-fh-text-secondary">
                  • {g}
                </li>
              ))}
            </ul>
          </div>

          <SectionHeading className="mt-12">
            Heavy Equipment Required
          </SectionHeading>
          <ul className="mt-5 space-y-1 text-sm">
            {data.heavyEquipment.map((item) => (
              <li key={item} className="text-fh-text-secondary">
                • {item}
              </li>
            ))}
          </ul>

          {data.addOns && data.addOns.length > 0 && (
            <>
              <SectionHeading className="mt-12">
                Effects & Add-Ons
              </SectionHeading>
              <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-fh-muted">
                Optional · priced separately
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {data.addOns.map((item) => (
                  <li
                    key={item}
                    className="text-fh-text-secondary flex gap-3"
                  >
                    <span className="text-fh-accent mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Client Responsibilities */}
      <Section label="Client Responsibilities">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
          {data.clientResponsibilities.map((item) => (
            <li key={item} className="text-fh-text-secondary flex gap-3">
              <span className="text-fh-accent mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Core Leads — always present */}
      <Section label="Core Leads">
        <p className="text-sm text-fh-text-secondary leading-relaxed mb-8 max-w-3xl">
          Sound, lighting, and event production leadership for the
          ForestHouse Art Car.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {coreLeads.map((m) => (
            <TeamCard key={m.email} member={m} publicView={publicView} />
          ))}
        </div>
      </Section>

      {/* Registered Crew — pulled from the crew sign-up form */}
      <Section label={`Registered Crew · ${registered.length}`}>
        {registered.length === 0 ? (
          <p className="text-sm text-fh-text-secondary max-w-3xl">
            No crew registered for this event yet. Share the registration
            link to populate this section.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {registered.map((c) => (
              <RegisteredCrewCard
                key={c.id}
                member={c}
                publicView={publicView}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <SectionHeading>{label}</SectionHeading>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted ${className}`}
    >
      [ {children} ]
    </h2>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fh-muted self-center">
        {label}
      </dt>
      <dd className="text-fh-text tabular-nums">{value}</dd>
    </>
  );
}

function TeamCard({
  member,
  publicView,
}: {
  member: TeamMember;
  publicView: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-bold">{member.name}</h3>
        {member.company && (
          <span className="text-xs text-fh-accent font-semibold tracking-wide">
            ({member.company})
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted mt-0.5">
        {member.role}
      </p>
      {!publicView && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href={`tel:${member.phone.replace(/[^+0-9]/g, "")}`}
            className="tabular-nums text-fh-text-secondary hover:text-fh-accent transition-colors"
          >
            m. {member.phone}
          </a>
          <a
            href={`mailto:${member.email}`}
            className="text-fh-text-secondary hover:text-fh-accent transition-colors break-all"
          >
            e. {member.email}
          </a>
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-fh-text-secondary">
        {member.responsibilities}
      </p>
    </div>
  );
}

function RegisteredCrewCard({
  member,
  publicView,
}: {
  member: CrewRecord;
  publicView: boolean;
}) {
  const roleLine = member.backupRole
    ? `${ROLE_LABELS[member.preferredRole]} · Backup ${ROLE_LABELS[member.backupRole]}`
    : ROLE_LABELS[member.preferredRole];
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-bold">{member.name}</h3>
        {member.critical && (
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-fh-ember">
            On-call
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted mt-0.5">
        {roleLine}
      </p>
      {!publicView && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href={`tel:${member.phone.replace(/[^+0-9]/g, "")}`}
            className="tabular-nums text-fh-text-secondary hover:text-fh-accent transition-colors"
          >
            m. {member.phone}
          </a>
          <a
            href={`mailto:${member.email}`}
            className="text-fh-text-secondary hover:text-fh-accent transition-colors break-all"
          >
            e. {member.email}
          </a>
        </div>
      )}
      {member.skills.length > 0 && (
        <p className="mt-2 text-xs text-fh-text-secondary">
          Skills: {member.skills.map((s) => SKILL_LABELS[s]).join(", ")}
        </p>
      )}
    </div>
  );
}
