import Image from "next/image";
import Link from "next/link";
import {
  DEPLOY_DATES,
  EDC_PARADE_DATE,
  EDC_FESTIVAL_DATES,
  PLAZA_BUILD_DATES,
  SITE_BUILD_DATES,
  EVENT_DATES,
  STRIKE_DATES,
  CINCO_BUILD_DATES,
  CINCO_EVENT_DATE,
  CINCO_STRIKE_DATE,
} from "@/lib/forest-house/constants";

function formatRange(dates: readonly string[]): string {
  if (dates.length === 0) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? formatMd(first) : `${formatMd(first)}–${formatMd(last)}`;
}

function formatMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function ForestHouseLanding() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-6 sm:px-12 pt-12 sm:pt-20 pb-14 sm:pb-24 sm:min-h-[calc(100vh-5rem)] flex flex-col justify-end">
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
              className="h-14 sm:h-20 w-auto mb-6 sm:mb-8 opacity-90"
              priority
            />
          </div>
          <SectionLabel>Mobile Art Installation · Crew Portal</SectionLabel>
          <h1 className="mt-6 font-black uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,9vw,7rem)]">
            Forest
            <br />
            House
          </h1>
          <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg font-light leading-[1.7] text-fh-text-secondary">
            Three weeks in May, two events back-to-back. The{" "}
            <span className="text-fh-text">Cinco de Mayo Block Party</span> on
            East Fremont Tue&nbsp;{formatMd(CINCO_EVENT_DATE)}, then EDC —{" "}
            <span className="text-fh-text">Prodigal Swan</span> on the Strip
            for the Parade Thu&nbsp;{formatMd(EDC_PARADE_DATE)}, then{" "}
            <span className="text-fh-text">ForestHouse</span> at the Speedway
            for the Festival Fri–Sun&nbsp;{formatRange(EDC_FESTIVAL_DATES)}.
            Crew list is open.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/forest-house/register"
              className="inline-flex items-center justify-center bg-fh-text text-fh-bg px-8 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.4em] hover:bg-fh-teal hover:text-fh-bg transition-colors"
            >
              Sign On → Crew
            </Link>
            <Link
              href="/forest-house/admin"
              className="inline-flex items-center justify-center border border-fh-border px-8 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.4em] text-fh-text-secondary hover:text-fh-text hover:border-fh-text transition-colors"
            >
              Staffing Board
            </Link>
          </div>
        </div>
      </section>

      <div className="h-[3px] bg-fh-rainbow" />

      {/* WHAT WE NEED */}
      <section className="px-6 sm:px-12 py-14 sm:py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <SectionLabel>What We Need</SectionLabel>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[1.1] tracking-[-0.02em]">
              Hands on
              <br />
              The Bus
            </h2>
            <div className="mt-8 space-y-5 text-[17px] font-light leading-[1.8] text-fh-text-secondary">
              <p>
                Six roles across two events in May.{" "}
                <span className="text-fh-text">Cinco de Mayo</span> rolls onto
                East Fremont {formatRange(CINCO_BUILD_DATES)} build, Tue{" "}
                {formatMd(CINCO_EVENT_DATE)} event, Wed{" "}
                {formatMd(CINCO_STRIKE_DATE)} strike.
              </p>
              <p>
                A week later, <span className="text-fh-text">EDC</span> kicks
                off. Build crew starts at the Plaza{" "}
                {formatRange(PLAZA_BUILD_DATES)}, moves to Speedway load-in{" "}
                {formatRange(SITE_BUILD_DATES)}.{" "}
                <span className="text-fh-text">Prodigal Swan</span> rolls
                down the Strip for the Parade Thu{" "}
                {formatMd(EDC_PARADE_DATE)}, then{" "}
                <span className="text-fh-text">ForestHouse</span> plants on
                the Speedway floor Fri–Sun {formatRange(EDC_FESTIVAL_DATES)}.
                Strike {formatRange(STRIKE_DATES)}.
              </p>
              <p>
                Re-submit the form with the same email any time to update your
                availability. If you&apos;re on-call or bringing critical
                gear, flag it — we track it.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 content-start">
            <Stat number={String(DEPLOY_DATES.length)} label="Days on Site" />
            <Stat number={formatMd(CINCO_EVENT_DATE)} label="Cinco Block Party" size="sm" />
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

      {/* DEPLOYMENT WINDOWS */}
      <section className="bg-fh-surface px-6 sm:px-12 py-14 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Deployment Windows</SectionLabel>
          <div className="mt-5 mb-10 sm:mb-14 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[1.1] tracking-[-0.02em]">
              Two Events
              <br />
              Three Weeks
            </h2>
            <Link
              href="/forest-house/register"
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fh-muted border-b border-fh-muted hover:text-fh-text hover:border-fh-text transition-colors pb-0.5"
            >
              Register →
            </Link>
          </div>

          {/* Cinco de Mayo */}
          <EventHeading
            name="Cinco de Mayo"
            subtitle="East Fremont Block Party"
            range="5/3–6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            <SpecCard
              label="Build"
              highlight={formatRange(CINCO_BUILD_DATES)}
              body="Two-day build on East Fremont. Tight window, fast hands."
            />
            <SpecCard
              label="Block Party"
              highlight={`Tue ${formatMd(CINCO_EVENT_DATE)}`}
              body="One-night event on Fremont. Lighting, drivers, support, safety."
              accent
            />
            <SpecCard
              label="Strike"
              highlight={`Wed ${formatMd(CINCO_STRIKE_DATE)}`}
              body="Single-day teardown. Clear East Fremont before dawn if we can."
            />
          </div>

          {/* EDC Vegas */}
          <EventHeading
            name="EDC Vegas"
            subtitle="Prodigal Swan + ForestHouse"
            range="5/8–20"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <SpecCard
              label="Plaza Build"
              highlight={formatRange(PLAZA_BUILD_DATES)}
              body="Off-site staging at the Plaza. Forklift, lift, and electrical hands especially welcome."
            />
            <SpecCard
              label="Site Build"
              highlight={formatRange(SITE_BUILD_DATES)}
              body="Speedway load-in. Fast, hot, hands-on — set the stage for Parade day."
            />
            <SpecCard
              label="Event"
              highlight={formatRange(EVENT_DATES)}
              body={`Prodigal Swan on the Strip for the Parade Thu ${formatMd(EDC_PARADE_DATE)}. ForestHouse at the Speedway for the Festival Fri–Sun ${formatRange(EDC_FESTIVAL_DATES)}.`}
              accent
            />
            <SpecCard
              label="Strike"
              highlight={formatRange(STRIKE_DATES)}
              body="Three-day teardown starting Monday after the festival. Anyone who stays through strike has our undying love."
            />
          </div>
        </div>
      </section>

      <div className="h-[3px] bg-fh-rainbow" />

      {/* CTA */}
      <section className="px-6 sm:px-12 py-16 sm:py-32 text-center">
        <SectionLabel>Ready?</SectionLabel>
        <h2 className="mt-5 mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-[1] tracking-[-0.03em]">
          Sign On
          <br />
          The Line
        </h2>
        <p className="mt-6 sm:mt-7 mx-auto max-w-md text-base sm:text-[17px] font-light leading-[1.7] text-fh-text-secondary">
          Tell us what you can do, when you can do it, and what you bring.
          You&apos;re on the crew list as soon as you submit.
        </p>
        <Link
          href="/forest-house/register"
          className="mt-8 sm:mt-10 inline-flex items-center justify-center bg-fh-text text-fh-bg px-8 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.4em] hover:bg-fh-teal transition-colors"
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

function EventHeading({
  name,
  subtitle,
  range,
}: {
  name: string;
  subtitle: string;
  range: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5 pb-3 border-b border-fh-border">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.35em] bg-fh-rainbow bg-clip-text text-transparent">
          {name}
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-fh-muted">
          {subtitle}
        </span>
      </div>
      <span className="text-[11px] font-bold tabular-nums text-fh-muted">
        {range}
      </span>
    </div>
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
      className={`bg-fh-card p-6 sm:p-10 border transition-colors hover:border-fh-border ${accent ? "border-fh-teal/40" : "border-fh-border"}`}
    >
      <h3 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-fh-text-secondary">
        {label}
      </h3>
      <p
        className={`mt-3 sm:mt-4 text-[24px] sm:text-[28px] font-extrabold tracking-[-0.01em] tabular-nums ${accent ? "bg-fh-rainbow bg-clip-text text-transparent" : "text-fh-text"}`}
      >
        {highlight}
      </p>
      <p className="mt-2.5 sm:mt-3 text-sm sm:text-[15px] font-light leading-[1.65] sm:leading-[1.7] text-fh-text-secondary">
        {body}
      </p>
    </div>
  );
}
