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
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-fh-accent mb-10">
        Crew Call · May 2026
      </p>
      <h1 className="font-fh text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-[-0.02em] leading-[0.9]">
        Forest
        <br />
        <span className="text-fh-accent">House</span>
      </h1>
      <p className="mt-10 max-w-xl text-fh-text/80 leading-relaxed">
        From its Burning Man roots to festivals across the U.S., ForestHouse
        rolls on — ever-evolving, ever-inspiring. For May&nbsp;12–18 the bus
        is on the floor again. Build starts {formatRange(BUILD_DATES)}, event
        window {formatRange(EVENT_DATES)}, strike {formatRange(STRIKE_DATES)}.
        Pick your role, your days, and tell us what you bring.
      </p>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/forest-house/register"
          className="inline-flex items-center gap-3 bg-fh-accent text-fh-bg px-8 py-4 text-xs font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Sign On → Crew
        </Link>
        <Link
          href="/forest-house/admin"
          className="inline-flex items-center gap-3 border border-fh-border px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-fh-text/80 hover:border-fh-accent hover:text-fh-accent transition-colors"
        >
          Staffing Board
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-px bg-fh-border">
        <CalloutCard
          label="Build"
          range={formatRange(BUILD_DATES)}
          body="Pre-deploy assembly on the playa. Forklift, lift, and electrical hands especially welcome."
        />
        <CalloutCard
          label="Event"
          range={formatRange(EVENT_DATES)}
          body="Seven nights on the road. Lighting, drivers, support, safety. Parade pass 5/16."
          accent
        />
        <CalloutCard
          label="Strike"
          range={formatRange(STRIKE_DATES)}
          body="Two-day teardown. Anyone who stays through strike has our undying love."
        />
      </div>

      <p className="mt-16 text-[11px] font-bold uppercase tracking-[0.3em] text-fh-muted max-w-lg leading-relaxed">
        It&apos;s not just an art car. It&apos;s a living piece of the
        community it was built to serve.
      </p>
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
    <div className="p-8 bg-fh-card">
      <div className="flex items-baseline justify-between mb-5">
        <span
          className={`text-[11px] font-black uppercase tracking-[0.35em] ${accent ? "text-fh-accent" : "text-fh-muted"}`}
        >
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-fh-muted">{range}</span>
      </div>
      <p className="text-sm leading-relaxed text-fh-text/80">{body}</p>
    </div>
  );
}
