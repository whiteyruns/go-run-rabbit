import Link from "next/link";
import {
  BUILD_DATES,
  EVENT_DATES,
  STRIKE_DATES,
} from "@/lib/forest-house/constants";

function formatRange(dates: readonly string[]): string {
  if (dates.length === 0) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(m)}/${Number(d)}`;
  };
  return first === last ? fmt(first) : `${fmt(first)} – ${fmt(last)}`;
}

export default function ForestHouseLanding() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
      <p className="text-xs uppercase tracking-[0.4em] text-fh-accent mb-8">
        Crew Call · May 2026
      </p>
      <h1 className="font-fh text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.95]">
        Forest
        <br />
        <span className="text-fh-accent">House</span>
      </h1>
      <p className="mt-10 max-w-xl text-fh-text/80 leading-relaxed">
        A thirteen-day deployment on the desert floor. Build starts{" "}
        {formatRange(BUILD_DATES)}, event window {formatRange(EVENT_DATES)},
        strike {formatRange(STRIKE_DATES)}. We need crew for sound, lighting,
        laser, drivers, build, strike, support, and safety. Register below —
        you can update your registration any time before the 12th.
      </p>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/forest-house/register"
          className="inline-flex items-center gap-3 bg-fh-accent text-fh-bg px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Register → Crew
        </Link>
        <Link
          href="/forest-house/admin"
          className="inline-flex items-center gap-3 border border-fh-text/20 px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] hover:border-fh-accent hover:text-fh-accent transition-colors"
        >
          Staffing Dashboard
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CalloutCard
          label="Build"
          range={formatRange(BUILD_DATES)}
          body="Pre-deploy assembly on the playa. Forklift, electrical, and rigging help especially needed."
        />
        <CalloutCard
          label="Event"
          range={formatRange(EVENT_DATES)}
          body="Seven nights on the road. Sound, lights, laser ops, drivers, safety. Parade pass 5/16."
          accent
        />
        <CalloutCard
          label="Strike"
          range={formatRange(STRIKE_DATES)}
          body="Two-day teardown. Anyone who stays through strike has our undying love."
        />
      </div>
    </div>
  );
}

function CalloutCard({
  label,
  range,
  body,
  accent = false,
}: {
  label: string;
  range: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-6 bg-fh-card border ${accent ? "border-fh-accent/40" : "border-fh-text/10"}`}
    >
      <div className="flex items-baseline justify-between mb-4">
        <span
          className={`text-xs font-bold uppercase tracking-[0.3em] ${accent ? "text-fh-accent" : "text-fh-text/60"}`}
        >
          {label}
        </span>
        <span className="text-xs tabular-nums text-fh-text/60">{range}</span>
      </div>
      <p className="text-sm leading-relaxed text-fh-text/80">{body}</p>
    </div>
  );
}
