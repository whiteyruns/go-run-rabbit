"use client";

import { useMemo, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { feedTheBlock } from "@/data/feed-the-block";
import {
  marshmelloApr2,
  metric,
  demographicsByGroup,
} from "@/data/feed-the-block/marshmello-apr2";
import { fmt, fmtNum } from "@/lib/utils";

type Tab = "analytics" | "sponsorship";

export default function BlockPartyPage() {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-2">
            Corner Bar Management · Wynn Nightlife
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">FEED THE BLOCK</h1>
          <p className="text-on-surface-variant mt-1">
            Free open-air block party series at 6th &amp; Fremont · 2026 season
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-surface-container p-1 self-start">
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>
            Event Analytics
          </TabButton>
          <TabButton active={tab === "sponsorship"} onClick={() => setTab("sponsorship")}>
            Sponsorship
          </TabButton>
        </div>
      </div>

      {tab === "analytics" ? <AnalyticsTab /> : <SponsorshipTab />}
    </div>
  );
}

// ============================================================================
// Analytics Tab — Placer.ai location-intelligence data, single event
// ============================================================================

function AnalyticsTab() {
  return (
    <div className="space-y-8">
      {/* Event header */}
      <div className="bg-surface-container p-8 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
              Event · {metric("Event Day")}, {metric("Event Date")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
              {metric("Headliner")}
            </h2>
            <p className="text-on-surface-variant max-w-xl mb-4">
              Placer.ai measured foot-traffic analytics from the single-night performance.
              Additional event datasets forthcoming.
            </p>
            <div className="flex flex-wrap gap-2">
              <DataBadge label="Placer.ai measured" />
              <DataBadge label={`${metric("Hotel Casino Properties Tracked")} properties tracked`} />
              <DataBadge label={`${metric("DMAs Represented")} DMAs`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-[320px]">
            <MetricCard
              label="Measured Visits"
              value={fmtNum(parseInt(metric("Total Visits")))}
              sub="Placer.ai device-level count"
              accent
            />
            <MetricCard
              label="Visits YoY"
              value={metric("Visits YoY")}
              sub={`Yo2Y ${metric("Visits Yo2Y")}`}
            />
            <MetricCard
              label="Avg Dwell"
              value={`${metric("Avg Dwell Time Min")} min`}
              sub={`Peak ${metric("Peak Hour")}`}
              accent
            />
            <MetricCard
              label="Peak Concurrent"
              value={fmtNum(parseInt(metric("Peak Visits")))}
              sub="9:00 PM show moment"
            />
          </div>
        </div>
      </div>

      {/* Growth strip */}
      <GrowthStrip />

      {/* Origin & Reach */}
      <OriginSection />

      {/* Hotel Attribution — critical for CBM */}
      <HotelSection />

      {/* District Spillover */}
      <SpilloverSection />

      {/* Hourly curve + Dwell distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HourlySection />
        <DwellSection />
      </div>

      {/* Demographics */}
      <DemographicsSection />

      {/* Source footer */}
      <div className="text-center text-on-surface-variant text-xs pt-4">
        Data source · Placer.ai location intelligence · Single-event dataset for Marshmello
        (Apr 2, 2026). More events to be added as datasets become available.
      </div>
    </div>
  );
}

function GrowthStrip() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <GrowthCard label="Visits YoY" value={metric("Visits YoY")} tone="cyan" />
      <GrowthCard label="Yo2Y" value={metric("Visits Yo2Y")} tone="violet" />
      <GrowthCard label="Yo3Y" value={metric("Visits Yo3Y")} tone="pink" />
    </div>
  );
}

function GrowthCard({ label, value, tone }: { label: string; value: string; tone: "cyan" | "violet" | "pink" }) {
  const color =
    tone === "cyan" ? "text-neon-cyan" : tone === "violet" ? "text-neon-violet" : "text-neon-pink";
  return (
    <div className="bg-surface-container-high rounded-xl p-5">
      <p className="text-on-surface-variant text-[10px] font-bold tracking-[0.15em] uppercase mb-2">
        {label}
      </p>
      <p className={`text-3xl font-extrabold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function OriginSection() {
  const states = marshmelloApr2.originStates.slice(0, 10);
  const dmas = marshmelloApr2.originDMAs.slice(0, 10);
  const maxState = states[0]?.visitors ?? 1;
  const maxDma = dmas[0]?.visitors ?? 1;

  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight">Origin &amp; Reach</h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Where attendees traveled from · {metric("States Represented")} states · {metric("DMAs Represented")} DMAs
          </p>
        </div>
        <div className="flex gap-3">
          <SplitChip label="In-Market" pct={metric("In Market Estimate Pct") + "%"} tone="cyan" />
          <SplitChip label="Out-of-State" pct={metric("Out Of State Pct") + "%"} tone="violet" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-4">
            Top 10 States (by visitors)
          </p>
          <div className="space-y-2">
            {states.map((s) => (
              <BarRow
                key={s.id}
                label={s.stateName}
                value={`${fmtNum(s.visitors)} · ${s.percentage.toFixed(1)}%`}
                pct={(s.visitors / maxState) * 100}
                rightChip={<YoYChip pct={s.yoyChangePct} />}
                color="cyan"
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-4">
            Top 10 DMAs
          </p>
          <div className="space-y-2">
            {dmas.map((d) => (
              <BarRow
                key={d.id}
                label={`${d.dmaName}`}
                sub={d.state}
                value={`${fmtNum(d.visitors)} · ${d.percentage.toFixed(1)}%`}
                pct={(d.visitors / maxDma) * 100}
                rightChip={<YoYChip pct={d.yoyChangePct} />}
                color="violet"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelSection() {
  const sorted = [...marshmelloApr2.hotels].sort((a, b) => b.visitors - a.visitors);
  const elCortez = sorted.find((h) => h.name.toLowerCase().includes("el cortez"));
  const rest = sorted.filter((h) => h !== elCortez).slice(0, 14);
  const maxRest = rest[0]?.visitors ?? 1;

  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight">Hotel Attribution</h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Where overnight attendees stayed · {metric("Hotel Casino Properties Tracked")} properties tracked
          </p>
        </div>
      </div>

      {elCortez && (
        <div className="bg-surface-container rounded-xl p-6 mb-6 ring-1 ring-neon-cyan/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-2">
                CBM Anchor Property · #1 Origin
              </p>
              <h4 className="text-on-surface font-extrabold text-2xl">{elCortez.name}</h4>
              <p className="text-on-surface-variant text-sm mt-1">
                {elCortez.address}, {elCortez.city} · {elCortez.distance} mi from event
              </p>
            </div>
            <div className="text-right">
              <p className="text-neon-cyan font-mono font-extrabold text-4xl">
                {elCortez.percentage}%
              </p>
              <p className="text-on-surface-variant text-sm">
                {fmtNum(elCortez.visitors)} attendees stayed here
              </p>
              <p className="text-on-surface-variant text-xs mt-1">
                Journey origin · {metric("El Cortez Origin Pct")} of visitors
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-3">
        Next 14 hotels by attendee stays
      </p>
      <div className="space-y-2">
        {rest.map((h) => (
          <BarRow
            key={h.id}
            label={h.name}
            sub={`${h.distance} mi`}
            value={`${fmtNum(h.visitors)} · ${h.percentage}%`}
            pct={(h.visitors / maxRest) * 100}
            color="pink"
          />
        ))}
      </div>
    </div>
  );
}

function SpilloverSection() {
  const dests = [...marshmelloApr2.destinations].sort((a, b) => b.visitors - a.visitors).slice(0, 10);
  const max = dests[0]?.visitors ?? 1;
  const totalSpillover = dests.reduce((s, d) => s + d.visitors, 0);

  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight">
            District Spillover
          </h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Nearby venues visited by event attendees — the district-lift story for sponsors
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
            Top-10 spillover
          </p>
          <p className="text-neon-violet font-mono font-extrabold text-2xl">
            {fmtNum(totalSpillover)}
          </p>
          <p className="text-on-surface-variant text-xs">visits to neighboring businesses</p>
        </div>
      </div>

      <div className="space-y-2">
        {dests.map((d) => (
          <BarRow
            key={d.id}
            label={d.name}
            sub={`${d.subCategory} · ${d.distance ?? 0} mi`}
            value={`${fmtNum(d.visitors)} · ${d.percentage}`}
            pct={(d.visitors / max) * 100}
            color="violet"
          />
        ))}
      </div>
    </div>
  );
}

function HourlySection() {
  const hours = [...marshmelloApr2.hourly].sort((a, b) => a.hourIndex - b.hourIndex);
  const max = Math.max(...hours.map((h) => h.visits));
  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-1">
        Hourly Traffic Curve
      </h3>
      <p className="text-on-surface-variant text-sm mb-6">
        Peak {metric("Peak Hour")} · {fmtNum(parseInt(metric("Peak Visits")))} concurrent
      </p>
      <div className="flex items-end gap-[3px] h-48">
        {hours.map((h) => {
          const pct = (h.visits / max) * 100;
          const isPeak = h.visits === max;
          return (
            <div key={h.id} className="flex-1 flex flex-col justify-end" title={`${h.hour} — ${fmtNum(h.visits)}`}>
              <div
                className={`rounded-t ${isPeak ? "bg-neon-cyan" : "bg-neon-cyan/40"}`}
                style={{ height: `${pct}%`, minHeight: h.visits > 0 ? "2px" : "0px" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-2 font-mono">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>12a</span>
      </div>
    </div>
  );
}

function DwellSection() {
  const buckets = [...marshmelloApr2.duration].sort((a, b) => a.sortOrder - b.sortOrder);
  const max = Math.max(...buckets.map((b) => b.visits));
  const plus150 = buckets.find((b) => b.durationRange.startsWith("150"));
  const total = buckets.reduce((s, b) => s + b.visits, 0);
  const plus150Pct = plus150 && total ? Math.round((plus150.visits / total) * 100) : 0;

  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-1">
        Dwell Time Distribution
      </h3>
      <p className="text-on-surface-variant text-sm mb-6">
        {plus150Pct}% of attendees stayed 2.5+ hours
      </p>
      <div className="flex items-end gap-[3px] h-48">
        {buckets.map((b) => {
          const pct = (b.visits / max) * 100;
          const isTop = b.visits === max;
          return (
            <div key={b.id} className="flex-1 flex flex-col justify-end" title={`${b.durationRange} — ${fmtNum(b.visits)}`}>
              <div
                className={`rounded-t ${isTop ? "bg-neon-violet" : "bg-neon-violet/40"}`}
                style={{ height: `${pct}%`, minHeight: b.visits > 0 ? "2px" : "0px" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-2 font-mono">
        <span>&lt;5m</span>
        <span>30m</span>
        <span>60m</span>
        <span>90m</span>
        <span>120m</span>
        <span>150m+</span>
      </div>
    </div>
  );
}

function DemographicsSection() {
  const groups = ["Age", "Ethnicity", "Income", "Household"];
  return (
    <div className="bg-surface-container-high rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-on-surface font-extrabold text-xl tracking-tight">Demographics</h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Event audience (cyan) vs. Nevada baseline (muted) · Median age {metric("Median Age")} ·
            Median HHI {metric("Median Household Income")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <DemographicGroup key={g} name={g} />
        ))}
      </div>
    </div>
  );
}

function DemographicGroup({ name }: { name: string }) {
  const bins = useMemo(() => demographicsByGroup(name), [name]);
  const max = useMemo(
    () => Math.max(...bins.flatMap((b) => [b.eventValue, b.stateValue]), 1),
    [bins]
  );
  return (
    <div className="bg-surface-container rounded-xl p-5">
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-4">
        {name}
      </p>
      <div className="space-y-3">
        {bins.map((b) => (
          <div key={b.id}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-on-surface">{b.binLabel}</span>
              <span className="font-mono text-on-surface-variant">
                <span className="text-neon-cyan">{b.eventValue.toFixed(1)}%</span>
                <span className="mx-1">vs</span>
                <span>{b.stateValue.toFixed(1)}%</span>
              </span>
            </div>
            <div className="relative h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-on-surface-variant/30"
                style={{ width: `${(b.stateValue / max) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-neon-cyan"
                style={{ width: `${(b.eventValue / max) * 100}%`, mixBlendMode: "screen" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Sponsorship Tab — existing season narrative
// ============================================================================

function SponsorshipTab() {
  const ftb = feedTheBlock;
  return (
    <div className="space-y-8">
      {/* Event series overview */}
      <div className="bg-surface-container p-8 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
              Event Series
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
              Feed the Block 2026
            </h2>
            <p className="text-on-surface-variant max-w-xl">
              Free open-air block party series at 6th &amp; Fremont, presented by Wynn Nightlife
              &amp; Corner Bar Management. 10-event series expanding from 3 proven debut shows
              in 2025.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-[280px]">
            <MetricCard label="2026 Events" value="10" sub="Every 6 weeks" accent />
            <MetricCard label="Per Event" value="10K+" sub="Projected attendance" />
            <MetricCard
              label="2025 Proven"
              value={fmtNum(ftb.year2025.totalAttendance) + "+"}
              sub="Across 3 shows"
              accent
            />
            <MetricCard
              label="Total Signups"
              value={fmtNum(ftb.year2025.totalSignups)}
              sub="Confirmed demand"
            />
          </div>
        </div>
      </div>

      {/* Confirmed Sponsors */}
      <div className="bg-surface-container-low rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-on-surface font-extrabold text-xl tracking-tight">
              Confirmed 2026 Sponsorship Revenue
            </h3>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neon-cyan mt-1">
              Both deals closed
            </p>
          </div>
          <span className="text-neon-cyan font-mono text-3xl font-extrabold">
            {fmt(ftb.confirmedTotal)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {ftb.confirmedSponsors.map((s) => (
            <div
              key={s.name}
              className="bg-surface-container-high rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-on-surface font-bold">{s.name}</p>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan">
                    Closed
                  </span>
                </div>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold mt-1">
                  {s.type}
                </p>
              </div>
              <p className="text-neon-cyan font-mono font-bold text-xl">{fmt(s.amount)}</p>
            </div>
          ))}
        </div>
        <p className="text-on-surface-variant text-sm">
          Municipal sponsors secured. Beverage, energy, lifestyle, and tech categories remain
          wide open.
        </p>
      </div>

      {/* 2025 performance */}
      <div className="bg-surface-container-high rounded-xl p-8">
        <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">
          2025 Season — Actual Performance
        </h3>
        <p className="text-on-surface-variant text-sm mb-6">
          Real attendance, signup, and crossover data from all 3 events
        </p>
        <div className="space-y-4 mb-6">
          {ftb.year2025.events.map((event) => (
            <div key={event.headliner} className="bg-surface-container rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-on-surface font-bold text-lg">{event.headliner}</h4>
                  <span className="text-on-surface-variant text-xs">{event.date}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    Attendance
                  </p>
                  <p className="text-neon-cyan font-mono font-bold">{event.attendance}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    Signups
                  </p>
                  <p className="text-neon-violet font-mono font-bold">{fmtNum(event.signups)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    Casino Crossover
                  </p>
                  <p className="text-on-surface font-mono font-bold">{event.casinoCrossover}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface-container rounded-xl p-5">
          <p className="text-neon-cyan font-bold">
            {fmtNum(ftb.year2025.totalAttendance)}+ total fans across 3 events — all free admission.
          </p>
          <p className="text-on-surface-variant text-sm mt-1">
            2026 expands to 10 events with Marshmello kicking off April 2nd atop the Forest House
            Art Car.
          </p>
        </div>
      </div>

      {/* Sponsorship tiers */}
      <div>
        <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-6">
          Sponsorship Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ftb.sponsorshipTiers.map((tier, i) => (
            <div
              key={tier.tier}
              className={`bg-surface-container-high rounded-xl p-6 hover:bg-surface-bright transition-all ${
                i === 0 ? "ring-1 ring-neon-violet/30" : ""
              }`}
            >
              {i === 0 && (
                <p className="text-neon-violet text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
                  Flagship
                </p>
              )}
              <h4 className="text-on-surface font-bold text-lg mb-1">{tier.tier}</h4>
              <p className="text-neon-cyan font-mono text-2xl font-bold mb-4">{tier.price}</p>
              <ul className="space-y-2">
                {tier.benefits.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="text-neon-cyan mt-0.5">&#10003;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue potential */}
      <div className="bg-surface-container-low rounded-xl p-8">
        <h3 className="text-on-surface font-extrabold text-xl tracking-tight mb-2">
          Revenue Potential
        </h3>
        <p className="text-on-surface-variant text-sm mb-6">
          Fully sold: Presenting + 2 Headline + 3 Supporting + 4 Activation ={" "}
          <span className="text-neon-cyan font-bold">$1.46M</span> from events alone
        </p>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "1x Presenting", value: "$500K" },
            { label: "2x Headline", value: "$500K" },
            { label: "3x Supporting", value: "$300K" },
            { label: "4x Activation", value: "$160K" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container rounded-xl p-5 text-center">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                {label}
              </p>
              <p className="text-neon-violet font-mono font-bold text-xl mt-2">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Small reusable UI pieces
// ============================================================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors ${
        active
          ? "bg-surface-container-high text-on-surface"
          : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function DataBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
      {label}
    </span>
  );
}

function SplitChip({
  label,
  pct,
  tone,
}: {
  label: string;
  pct: string;
  tone: "cyan" | "violet";
}) {
  const color = tone === "cyan" ? "text-neon-cyan" : "text-neon-violet";
  return (
    <div className="bg-surface-container rounded-xl px-4 py-2">
      <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
        {label}
      </p>
      <p className={`font-mono font-extrabold text-lg ${color}`}>{pct}</p>
    </div>
  );
}

function YoYChip({ pct }: { pct: number }) {
  const positive = pct >= 0;
  const color = positive ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-pink bg-neon-pink/10";
  const sign = positive ? "+" : "";
  const display = Math.abs(pct) >= 1000 ? `${(pct / 100).toFixed(1)}x` : `${sign}${pct.toFixed(0)}%`;
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${color}`}>
      YoY {display}
    </span>
  );
}

function BarRow({
  label,
  sub,
  value,
  pct,
  rightChip,
  color,
}: {
  label: string;
  sub?: string;
  value: string;
  pct: number;
  rightChip?: React.ReactNode;
  color: "cyan" | "violet" | "pink";
}) {
  const bar =
    color === "cyan"
      ? "bg-neon-cyan/70"
      : color === "violet"
      ? "bg-neon-violet/70"
      : "bg-neon-pink/70";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-on-surface text-sm truncate">{label}</p>
          {sub && <p className="text-on-surface-variant text-[10px] truncate">· {sub}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-on-surface-variant text-xs font-mono">{value}</p>
          {rightChip}
        </div>
      </div>
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}
