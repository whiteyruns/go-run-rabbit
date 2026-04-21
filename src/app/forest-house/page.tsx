import Image from "next/image";
import Link from "next/link";
import {
  DEPLOY_DATES,
  ROLES,
  EDC_PARADE_DATE,
  EDC_FESTIVAL_DATES,
  BUILD_DATES,
  EVENT_DATES,
  STRIKE_DATES,
} from "@/lib/forest-house/constants";

function formatMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function formatRange(dates: readonly string[]): string {
  if (dates.length === 0) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? formatMd(first) : `${formatMd(first)}–${formatMd(last)}`;
}

export default function ForestHouseLanding() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-6 sm:px-12 pt-20 pb-24 min-h-[calc(100vh-5rem)] flex flex-col justify-end">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.7) 80%, rgba(10,10,10,1) 100%), linear-gradient(135deg, #1a0a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
          }}
        />
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <Image
              src="/forest-house/logo.png"
              alt="ForestHouse"
              width={159}
              height={126}
              className="h-20 w-auto mb-8 opacity-90"
              priority
            />
          </div>
          <SectionLabel>Mobile Art Installation · Crew Portal</SectionLabel>
          <h1 className="mt-6 font-black uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,9vw,7rem)]">
            Forest
            <br />
            House
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-[1.7] text-fh-text-secondary">
            A two-story art car built at Black Rock City — 30,000 LEDs, ten
            Class&nbsp;4 lasers, 25 feet tall. For&nbsp;May 8–20, 2026 we roll
            again: <span className="text-fh-text">Prodigal Swan</span> joins
            the EDC Parade Thu&nbsp;{formatMd(EDC_PARADE_DATE)}, and{" "}
            <span className="text-fh-text">ForestHouse</span> is at the EDC
            Festival Fri–Sun&nbsp;{formatRange(EDC_FESTIVAL_DATES)}. Crew
            list is open.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/forest-house/register"
              className="inline-flex items-center bg-fh-text text-fh-bg px-10 py-4 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-fh-teal hover:text-fh-bg transition-colors"
            >
              Sign On → Crew
            </Link>
            <Link
              href="/forest-house/admin"
              className="inline-flex items-center border border-fh-border px-10 py-4 text-[11px] font-bold uppercase tracking-[0.4em] text-fh-text-secondary hover:text-fh-text hover:border-fh-text transition-colors"
            >
              Staffing Board
            </Link>
          </div>
        </div>
      </section>

      <div className="h-[3px] bg-fh-rainbow" />

      {/* WHAT WE NEED */}
      <section className="px-6 sm:px-12 py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <SectionLabel>What We Need</SectionLabel>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[1.1] tracking-[-0.02em]">
              Hands on
              <br />
              The Bus
            </h2>
            <div className="mt-8 space-y-5 text-[17px] font-light leading-[1.8] text-fh-text-secondary">
              <p>
                Six roles across a thirteen-day window. Build crew in early to
                assemble on the playa. Event crew runs{" "}
                <span className="text-fh-text">Prodigal Swan</span> through
                the EDC Parade, then pivots to{" "}
                <span className="text-fh-text">ForestHouse</span> on the
                festival floor. Strike crew stays late to tear it all down.
              </p>
              <p>
                Re-submit the form with the same email any time before May 12
                to update your availability. If you&apos;re on-call or
                bringing critical gear, flag it — we track it.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 content-start">
            <Stat number={String(DEPLOY_DATES.length)} label="Days on Site" />
            <Stat number={String(ROLES.length)} label="Crew Roles" />
            <Stat
              number={formatMd(EDC_PARADE_DATE)}
              label="EDC Parade"
              size="sm"
            />
            <Stat
              number={formatRange(EDC_FESTIVAL_DATES)}
              label="EDC Festival"
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* BUILD / EVENT / STRIKE */}
      <section className="bg-fh-surface px-6 sm:px-12 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Deployment Windows</SectionLabel>
          <div className="mt-5 mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[1.1] tracking-[-0.02em]">
              Thirteen Days
              <br />
              On The Floor
            </h2>
            <Link
              href="/forest-house/register"
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted border-b border-fh-muted hover:text-fh-text hover:border-fh-text transition-colors pb-0.5"
            >
              Register →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SpecCard
              label="Build"
              highlight={formatRange(BUILD_DATES)}
              body="Pre-deploy assembly on the playa. Forklift, lift, and electrical hands especially welcome."
            />
            <SpecCard
              label="Event"
              highlight={formatRange(EVENT_DATES)}
              body={`Prodigal Swan in the EDC Parade Thu ${formatMd(EDC_PARADE_DATE)}. ForestHouse on the festival floor Fri–Sun ${formatRange(EDC_FESTIVAL_DATES)}. Lighting, drivers, support, safety.`}
              accent
            />
            <SpecCard
              label="Strike"
              highlight={formatRange(STRIKE_DATES)}
              body="Two-day teardown. Anyone who stays through strike has our undying love."
            />
          </div>
        </div>
      </section>

      <div className="h-[3px] bg-fh-rainbow" />

      {/* CTA */}
      <section className="px-6 sm:px-12 py-32 text-center">
        <SectionLabel>Ready?</SectionLabel>
        <h2 className="mt-5 mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-[1] tracking-[-0.03em]">
          Sign On
          <br />
          The Line
        </h2>
        <p className="mt-7 mx-auto max-w-md text-[17px] font-light leading-[1.7] text-fh-text-secondary">
          Tell us what you can do, when you can do it, and what you bring.
          You&apos;re on the crew list as soon as you submit.
        </p>
        <Link
          href="/forest-house/register"
          className="mt-10 inline-flex items-center bg-fh-text text-fh-bg px-10 py-4 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-fh-teal transition-colors"
        >
          Register Now
        </Link>
      </section>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted">
      [ {children} ]
    </p>
  );
}

function Stat({
  number,
  label,
  size = "md",
}: {
  number: string;
  label: string;
  size?: "md" | "sm";
}) {
  const numberClass =
    size === "sm"
      ? "text-[clamp(1.5rem,3vw,2.25rem)]"
      : "text-[clamp(2rem,4vw,2.75rem)]";
  return (
    <div className="border-t border-fh-border pt-7 pb-1">
      <div
        className={`${numberClass} font-black tracking-[-0.02em] bg-fh-rainbow bg-clip-text text-transparent`}
      >
        {number}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted">
        {label}
      </div>
    </div>
  );
}

function SpecCard({
  label,
  highlight,
  body,
  accent = false,
}: {
  label: string;
  highlight: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-fh-card p-10 border transition-colors hover:border-fh-border ${accent ? "border-fh-teal/40" : "border-fh-border"}`}
    >
      <h3 className="text-[13px] font-bold uppercase tracking-[0.35em] text-fh-text-secondary">
        {label}
      </h3>
      <p
        className={`mt-4 text-[28px] font-extrabold tracking-[-0.01em] tabular-nums ${accent ? "bg-fh-rainbow bg-clip-text text-transparent" : "text-fh-text"}`}
      >
        {highlight}
      </p>
      <p className="mt-3 text-[15px] font-light leading-[1.7] text-fh-text-secondary">
        {body}
      </p>
    </div>
  );
}
