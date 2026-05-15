"use client";

import { GMBriefingPanel } from "@/components/oddyssey-sessions/GMBriefingPanel";
import { ChannelMixPanel } from "@/components/oddyssey-sessions/ChannelMix";
import { CompareDatePicker, DatePicker, Delta } from "@/components/oddyssey-sessions/CompareControls";
import { loadStateWithWalkups } from "@/lib/oddyssey-food/build-state";
import type { ManorReportOverlay, WeekOverWeek } from "@/lib/oddyssey-food/history";
import {
  buildSummary,
  formatCurrency,
  type NightSummary,
  type PackageBreakdown,
  type SessionOccupancy,
} from "@/lib/oddyssey-food/summary";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import { computeChannelMix, type TicketGroupReport } from "@/lib/oddyssey-sessions/channel-mix";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SummaryPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [date, setDate] = useState<string>("");
  const [compareDate, setCompareDate] = useState<string>("");
  // All dates with a session report on disk — used by the compare
  // picker so Brandon can pull historical comparisons that aren't
  // currently loaded in the browser's CSV state.
  const [historicalDates, setHistoricalDates] = useState<string[]>([]);
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapResult, setRecapResult] = useState<string | null>(null);
  const [wow, setWow] = useState<WeekOverWeek | null>(null);
  const [report, setReport] = useState<ManorReportOverlay | null>(null);
  const [compareReport, setCompareReport] = useState<ManorReportOverlay | null>(null);
  const [bullets, setBullets] = useState<string[]>([]);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<string | null>(null);

  useEffect(() => {
    setState(loadStateWithWalkups());
    fetch("/api/oddyssey-food/dates")
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "ok" && Array.isArray(d.dates)) setHistoricalDates(d.dates);
      })
      .catch(() => {});
  }, []);

  const summary = useMemo(
    () => (state ? buildSummary(state, date || undefined) : null),
    [state, date]
  );

  // Build a second NightSummary for the comparison date when one is
  // picked. Same data shape as `summary` — every stat tile can read
  // from either to compute a delta.
  const compareSummary = useMemo(
    () => (state && compareDate ? buildSummary(state, compareDate) : null),
    [state, compareDate],
  );

  useEffect(() => {
    if (summary && !date) setDate(summary.date);
  }, [summary, date]);

  // Fetch week-over-week whenever the target date changes
  useEffect(() => {
    if (!summary) return;
    let cancelled = false;
    fetch(`/api/oddyssey-food/wow?date=${summary.date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.status === "ok") {
          setWow(d.wow);
          setReport(d.report ?? null);
        }
      })
      .catch(() => {});
    fetch(`/api/oddyssey-food/briefing?date=${summary.date}&format=json`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.status === "ok") setBullets(d.bullets ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [summary?.date]);

  // Fetch the comparison date's report overlay so each stat tile can
  // read prior totals. We re-use the same /wow endpoint since it returns
  // a `report` field with totals — `wow` itself is ignored here.
  useEffect(() => {
    if (!compareDate) { setCompareReport(null); return; }
    let cancelled = false;
    fetch(`/api/oddyssey-food/wow?date=${compareDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.status === "ok") setCompareReport(d.report ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [compareDate]);

  if (!state) {
    return (
      <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>
          No data loaded.
        </div>
        <Link href="/oddyssey-manor/admin/food/upload" style={btnPrimary}>Upload a CSV</Link>
      </div>
    );
  }
  if (!summary) return null;

  async function pullNow() {
    setPulling(true);
    setPullResult(null);
    try {
      const res = await fetch("/api/oddyssey-food/pull", { method: "POST", body: "{}" });
      const data = await res.json();
      if (data.status !== "ok" || !data.csv) {
        setPullResult(`× ${data.stderr ?? data.message ?? "Pull failed"}`);
        return;
      }
      // Refresh client state from the new CSV + reload overlays
      const mod = await import("@/lib/oddyssey-food/build-state");
      const { state: next } = mod.buildStateFromCsv(data.meta.filename, data.csv);
      const storage = await import("@/lib/oddyssey-food/storage");
      storage.saveState(next);
      setState(next);
      // Refetch WoW + report overlay
      const wowRes = await fetch(`/api/oddyssey-food/wow?date=${next.source.filename ? next.by_date[next.by_date.length - 1]?.session_date : ""}`).then((r) => r.json()).catch(() => null);
      if (wowRes?.status === "ok") {
        setWow(wowRes.wow);
        setReport(wowRes.report ?? null);
      }
      // Refetch bullets
      const brief = await fetch(`/api/oddyssey-food/briefing?date=${next.by_date[next.by_date.length - 1]?.session_date}&format=json`).then((r) => r.json()).catch(() => null);
      if (brief?.status === "ok") setBullets(brief.bullets ?? []);
      setPullResult(`✓ Pulled ${data.meta.filename} · sessions ${data.sessions?.ok ? "ok" : "failed"}`);
    } catch (e) {
      setPullResult(`× ${String(e)}`);
    } finally {
      setPulling(false);
    }
  }

  async function sendRecap(test: boolean) {
    setSendingRecap(true);
    setRecapResult(null);
    try {
      const res = await fetch("/api/oddyssey-food/recap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ test, date }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setRecapResult(`Sent · ${data.subject} → ${(data.recipients ?? []).join(", ")}`);
      } else {
        setRecapResult(`Failed · ${data.message ?? "Unknown error"}`);
      }
    } catch (e) {
      setRecapResult(`Error · ${String(e)}`);
    } finally {
      setSendingRecap(false);
    }
  }

  return (
    <div>
      {/* Header with date picker */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
            05 · Summary
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
            Manor · {summary.date_label}
          </h1>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5 }}>
            Source: {summary.source.filename} · pulled {new Date(summary.source.pulled_at).toLocaleString("en-US")}
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={pullNow} disabled={pulling} style={{
              padding: "8px 18px", background: "var(--accent)", color: "var(--bg)",
              fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500,
              border: "none", cursor: pulling ? "wait" : "pointer", opacity: pulling ? 0.5 : 1,
            }}>
              {pulling ? "Pulling (≈30s)…" : "Pull Now"}
            </button>
            {pullResult && (
              <span style={{ fontSize: 11, color: pullResult.startsWith("✓") ? "#27ae60" : "#c0392b", letterSpacing: 0.3 }}>
                {pullResult}
              </span>
            )}
          </div>
        </div>
        {(historicalDates.length > 0 || summary.available_dates.length > 1) && (() => {
          const allDates = Array.from(
            new Set([...summary.available_dates, ...historicalDates]),
          ).sort();
          return (
            <>
              <DatePicker
                value={date || summary.date}
                onChange={setDate}
                availableDates={allDates}
              />
              <CompareDatePicker
                primary={summary.date}
                value={compareDate}
                onChange={setCompareDate}
                availableDates={allDates}
              />
            </>
          );
        })()}
      </div>

      {/* Headline stats — prefer Ticketure actuals when the session report is on disk */}
      {report?.available && report.totals ? (
        <>
          <div style={{
            marginBottom: 14, padding: "10px 14px", background: "rgba(39,174,96,0.08)",
            borderLeft: "3px solid #27ae60", fontSize: 11, color: "#27ae60",
            letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 500,
          }}>
            ✓ Actuals from Ticketure Summary Report · pulled {report.pulled_at ? new Date(report.pulled_at).toLocaleString("en-US") : ""}
          </div>
          {(() => {
            const ct = report.totals; // current totals
            const pt = compareReport?.available ? compareReport.totals : null;
            const cs = summary;
            const ps = compareSummary;
            const cap = (s: NightSummary | null) =>
              s && s.capacity_total > 0 ? (s.tickets_sold / s.capacity_total) * 100 : null;
            const cmpLbl = compareDate || undefined;
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 16 }}>
                  <HeadlineStat label="Admissions" value={String(cs.tickets_sold)} sub={`butts in seats · Ticketure count: ${ct.reserved}`} compare={{ current: cs.tickets_sold, prior: ps?.tickets_sold ?? null, format: "int", priorLabel: cmpLbl }} />
                  <HeadlineStat label="Gross Revenue" value={formatCurrency(ct.gross_revenue)} sub={`Net ${formatCurrency(ct.net_to_bank)} to bank`} compare={{ current: ct.gross_revenue, prior: pt?.gross_revenue ?? null, format: "money", priorLabel: cmpLbl }} />
                  <HeadlineStat label="Capacity" value={`${((cs.tickets_sold / cs.capacity_total) * 100).toFixed(1)}%`} sub={capacityLabel(cs.tickets_sold / cs.capacity_total)} compare={{ current: cap(cs), prior: cap(ps), format: "percent", priorLabel: cmpLbl }} />
                  <HeadlineStat label="Food to Prep" value={String(cs.food_items)} sub={`${cs.food.by_item.length} menu item${cs.food.by_item.length === 1 ? "" : "s"}`} compare={{ current: cs.food_items, prior: ps?.food_items ?? null, format: "int", priorLabel: cmpLbl }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 16 }}>
                  <HeadlineStat label="Paid" value={String(ct.tickets_paid)} sub="actually paid" compare={{ current: ct.tickets_paid, prior: pt?.tickets_paid ?? null, format: "int", priorLabel: cmpLbl }} />
                  <HeadlineStat label="Free (Comps)" value={String(ct.tickets_free_admissions)} sub="comp admissions · excludes food vouchers" compare={{ current: ct.tickets_free_admissions, prior: pt?.tickets_free_admissions ?? null, format: "int", priorLabel: cmpLbl, upIsGood: false }} />
                  <HeadlineStat label="Orders" value={String(ct.total_orders)} sub="distinct purchases" compare={{ current: ct.total_orders, prior: pt?.total_orders ?? null, format: "int", priorLabel: cmpLbl }} />
                  <HeadlineStat label="Redeemed" value={`${ct.redeemed_admissions} · ${ct.reserved_admissions > 0 ? Math.round(ct.redeemed_admissions / ct.reserved_admissions * 100) : 0}%`} sub="scanned at door" compare={{ current: ct.redeemed_admissions, prior: pt?.redeemed_admissions ?? null, format: "int", priorLabel: cmpLbl }} />
                </div>
              </>
            );
          })()}
          <div style={{
            marginBottom: 40, padding: "10px 14px", background: "rgba(201,168,76,0.06)",
            borderLeft: "3px solid var(--accent)", fontSize: 11, color: "var(--text-muted)",
            letterSpacing: 0.3, lineHeight: 1.6,
          }}>
            <strong style={{ color: "var(--accent)" }}>Note:</strong> Ticketure counts each food inclusion as a separate &ldquo;ticket.&rdquo; The Sessions tab reports {report.totals.reserved} line items total ({summary.tickets_sold} admissions + {report.totals.reserved - summary.tickets_sold} food vouchers).
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 40 }}>
          <HeadlineStat label="Tickets Sold" value={String(summary.tickets_sold)} sub={`of ${summary.capacity_total} capacity`} />
          <HeadlineStat label="Revenue (est.)" value={formatCurrency(summary.revenue)} sub="list price × count" />
          <HeadlineStat label="Capacity" value={`${(summary.capacity_percent * 100).toFixed(0)}%`} sub={capacityLabel(summary.capacity_percent)} />
          <HeadlineStat label="Food to Prep" value={String(summary.food_items)} sub={`${summary.food.by_item.length} menu item${summary.food.by_item.length === 1 ? "" : "s"}`} />
        </div>
      )}

      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; } }`}</style>

      {/* Week over week */}
      {wow && <WoWStrip wow={wow} summary={summary} />}

      {/* Ticket Groups — actuals from Ticketure. Shown when the sessions
          scraper has ticket-group breakdown on disk. */}
      {report?.available && report.ticket_groups && report.ticket_groups.length > 0 && (
        <Section
          title="Ticket Groups"
          subtitle={<span style={{ color: "#27ae60" }}>Actuals · from Ticketure Summary Report</span>}
        >
          <ManorTicketGroupsTable groups={report.ticket_groups} />
        </Section>
      )}

      {/* Channel Mix — direct vs. third-party resellers */}
      {report?.available && report.ticket_groups && (
        <ChannelMixPanel mix={computeChannelMix(report.ticket_groups)} />
      )}

      {/* Package mix */}
      <Section title="Package Mix" subtitle={`${summary.packages.reduce((s, p) => s + p.count, 0)} tickets · ${formatCurrency(summary.revenue)} total`}>
        <PackageTable packages={summary.packages} />
      </Section>

      {/* Session occupancy */}
      <Section title="Session Occupancy" subtitle={`${summary.sessions.length} session${summary.sessions.length === 1 ? "" : "s"} · ${summary.sessions.reduce((s, x) => s + x.admissions, 0)} tickets`}>
        <SessionList sessions={summary.sessions} />
      </Section>

      {/* Food prep quick view */}
      <Section title="Food Prep" subtitle={<Link href="/oddyssey-manor/admin/food/kitchen" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Open Kitchen View →</Link>}>
        <FoodSummary food={summary.food} />
      </Section>

      {/* GM Briefing */}
      <GMBriefingPanel venue="manor" date={summary.date} bullets={bullets} />

      {/* Actions */}
      <div style={{ marginTop: 48, padding: "24px 28px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 14 }}>
          Actions
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: recapResult ? 16 : 0 }}>
          <button onClick={() => sendRecap(true)} disabled={sendingRecap} style={{ ...btnOutline, opacity: sendingRecap ? 0.5 : 1 }}>
            {sendingRecap ? "Sending…" : "Send Test Recap (Keith only)"}
          </button>
          <button onClick={() => sendRecap(false)} disabled={sendingRecap} style={{ ...btnPrimary, opacity: sendingRecap ? 0.5 : 1 }}>
            {sendingRecap ? "Sending…" : "Send Recap to Team"}
          </button>
          <Link href="/api/oddyssey-food/recap" target="_blank" style={btnOutline}>Preview HTML</Link>
        </div>
        {recapResult && (
          <div style={{ fontSize: 12, color: recapResult.startsWith("Sent") ? "#27ae60" : "#c0392b", letterSpacing: 0.3 }}>
            {recapResult}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
function capacityLabel(pct: number): string {
  if (pct >= 0.9) return "Near sold out";
  if (pct >= 0.75) return "Strong night";
  if (pct >= 0.5) return "Healthy";
  if (pct >= 0.25) return "Room to fill";
  return "Light";
}

function WoWStrip({ wow, summary }: { wow: WeekOverWeek; summary: NightSummary }) {
  return (
    <div style={{ marginTop: -8, marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>
          vs. {wow.prior_date_label}
        </div>
        {!wow.available && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.3 }}>
            No snapshot on file — comparison will populate next week
          </div>
        )}
      </div>
      {wow.available && wow.prior ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)" }}>
          <DeltaCard label="Tickets" current={summary.tickets_sold} prior={wow.prior.tickets} delta={wow.deltas.tickets} />
          <DeltaCard label="Revenue" current={formatCurrency(summary.revenue)} prior={formatCurrency(wow.prior.revenue)} delta={wow.deltas.revenue} formatDelta={(n) => (n >= 0 ? `+${formatCurrency(n)}` : `−${formatCurrency(Math.abs(n))}`)} />
          <DeltaCard label="Capacity" current={`${(summary.capacity_percent * 100).toFixed(0)}%`} prior={`${(wow.prior.capacity_percent * 100).toFixed(0)}%`} delta={wow.deltas.capacity_percent} formatDelta={(n) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(0)} pts`} />
          <DeltaCard label="Food Items" current={summary.food_items} prior={wow.prior.food_items} delta={wow.deltas.food_items} />
        </div>
      ) : (
        <div style={{
          padding: "20px 24px", border: "1px dashed var(--border-subtle)",
          background: "var(--bg-elevated)", fontSize: 12, color: "var(--text-muted)",
          letterSpacing: 0.3,
        }}>
          {wow.prior_date_label} has no archived pull. Once the scheduler runs through a full week, this row will show tonight&rsquo;s numbers against last week&rsquo;s same night.
        </div>
      )}
    </div>
  );
}

function DeltaCard({
  label,
  current,
  prior,
  delta,
  formatDelta,
}: {
  label: string;
  current: string | number;
  prior: string | number;
  delta: number;
  formatDelta?: (n: number) => string;
}) {
  const color = delta > 0 ? "#27ae60" : delta < 0 ? "#c0392b" : "var(--text-muted)";
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const deltaText = formatDelta ? formatDelta(delta) : `${delta >= 0 ? "+" : ""}${delta}`;
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "16px 18px" }}>
      <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", lineHeight: 1 }}>{current}</div>
        <div style={{ fontSize: 12, color, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
          {arrow} {deltaText}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>
        was {prior}
      </div>
    </div>
  );
}

function HeadlineStat({
  label, value, sub, compare,
}: {
  label: string;
  value: string;
  sub?: string;
  // When both `current` and `prior` are set, renders a small delta chip
  // below the value. `priorLabel` shows the date being compared against.
  compare?: {
    current: number | null;
    prior: number | null;
    format?: "int" | "money" | "percent" | "raw";
    priorLabel?: string;
    upIsGood?: boolean;
  };
}) {
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "28px 24px" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, lineHeight: 1, color: "var(--text)", marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5 }}>{sub}</div>}
      {compare && (
        <Delta
          current={compare.current}
          prior={compare.prior}
          format={compare.format}
          priorLabel={compare.priorLabel}
          upIsGood={compare.upIsGood}
        />
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{title}</h2>
        {subtitle && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ManorTicketGroupsTable({ groups }: { groups: TicketGroupReport[] }) {
  // Sort highest-grossing first so third-party and revenue leaders pop.
  const sorted = [...groups].sort((a, b) => (b.gross_revenue ?? 0) - (a.gross_revenue ?? 0));
  const totalGross = sorted.reduce((s, g) => s + (g.gross_revenue ?? 0), 0);
  const totalReserved = sorted.reduce((s, g) => s + (g.reserved ?? 0), 0);
  const totalRedeemed = sorted.reduce((s, g) => s + (g.redeemed ?? 0), 0);
  const isThirdParty = (name: string) => /third[\s-]?party|commission/i.test(name);
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1fr 1.2fr",
        padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
        color: "var(--accent)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)", gap: 8,
      }}>
        <div>Ticket Group</div>
        <div style={{ textAlign: "right" }}>Reserved</div>
        <div style={{ textAlign: "right" }}>Redeemed</div>
        <div style={{ textAlign: "right" }}>Gross (actual)</div>
      </div>
      {sorted.map((g) => {
        const tp = isThirdParty(g.ticket_group_name);
        const redemptionPct = g.reserved && g.reserved > 0
          ? Math.round((g.redeemed ?? 0) / g.reserved * 100)
          : 0;
        return (
          <div key={g.ticket_group_name} style={{
            display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1fr 1.2fr",
            padding: "14px 20px", fontSize: 13, alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)", gap: 8,
          }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>
              {g.ticket_group_name}
              {tp && (
                <span style={{
                  marginLeft: 10, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "#8b6fb0", padding: "2px 8px", border: "1px solid rgba(139,111,176,0.4)",
                  verticalAlign: "middle",
                }}>
                  Third-party
                </span>
              )}
            </div>
            <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)" }}>
              {g.reserved ?? "—"}
            </div>
            <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text-secondary)" }}>
              {g.redeemed ?? "—"}
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}> · {redemptionPct}%</span>
            </div>
            <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: (g.gross_revenue ?? 0) > 0 ? "#27ae60" : "var(--text-muted)" }}>
              {formatCurrency(g.gross_revenue ?? 0)}
            </div>
          </div>
        );
      })}
      <div style={{
        display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1fr 1.2fr",
        padding: "14px 20px", gap: 8, background: "var(--bg-elevated)",
        fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500,
      }}>
        <div>Total</div>
        <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>{totalReserved}</div>
        <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>{totalRedeemed}</div>
        <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "#27ae60" }}>{formatCurrency(totalGross)}</div>
      </div>
    </div>
  );
}

function PackageTable({ packages }: { packages: PackageBreakdown[] }) {
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.5fr 1fr", padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div>Package</div>
        <div style={{ textAlign: "right" }}>Tickets</div>
        <div style={{ textAlign: "right" }}>Revenue</div>
        <div>Mix</div>
        <div style={{ textAlign: "right" }}>% of Total</div>
      </div>
      {packages.map((p) => (
        <div key={p.type} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.5fr 1fr", padding: "14px 20px", fontSize: 13, alignItems: "center", borderBottom: "1px solid var(--border-subtle)", color: p.count === 0 ? "var(--text-muted)" : "var(--text)" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{p.label}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: p.count > 0 ? "var(--accent)" : "var(--text-muted)" }}>{p.count}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16 }}>{formatCurrency(p.revenue)}</div>
          <div>
            <div style={{ height: 6, background: "var(--border-subtle)", position: "relative" }}>
              <div style={{ height: "100%", width: `${p.percent * 100}%`, background: "var(--accent)", transition: "width 0.4s" }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.3 }}>
            {(p.percent * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionList({ sessions }: { sessions: SessionOccupancy[] }) {
  if (sessions.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", fontSize: 13 }}>No session data yet.</div>;
  }
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      {sessions.map((s, i) => (
        <div key={s.iso} style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 2fr 60px 80px", padding: "14px 20px", alignItems: "center", fontSize: 13, borderBottom: i < sessions.length - 1 ? "1px solid var(--border-subtle)" : "none", gap: 16 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--accent)" }}>{s.time_label}</div>
          <div>
            <div style={{ height: 6, background: "var(--border-subtle)", position: "relative" }}>
              <div style={{ height: "100%", width: `${Math.min(100, s.percent * 100)}%`, background: s.percent >= 0.9 ? "#c0392b" : s.percent >= 0.75 ? "#d4b85e" : "var(--accent)" }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16 }}>
            {s.admissions}<span style={{ color: "var(--text-muted)" }}>/{s.capacity}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-start" }}>
            {s.package_mix.map((m) => (
              <span key={m.type} style={{ fontSize: 10, letterSpacing: 1, color: "var(--text-muted)", padding: "3px 8px", border: "1px solid var(--border-subtle)" }}>
                {m.short_label} · <strong style={{ color: "var(--text)" }}>{m.count}</strong>
              </span>
            ))}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.3 }}>
            {s.food_items} items
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: s.percent >= 0.9 ? "#c0392b" : s.percent >= 0.75 ? "#d4b85e" : "var(--text-muted)" }}>
            {(s.percent * 100).toFixed(0)}%
          </div>
        </div>
      ))}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 90px 1fr 90px 2fr 60px 80px"] {
            grid-template-columns: 70px 1fr 70px !important;
          }
          div[style*="grid-template-columns: 70px 1fr 70px"] > div:nth-child(n+4) { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function FoodSummary({ food }: { food: NightSummary["food"] }) {
  const flags = [
    food.vip_parties > 0 && { label: "⭐ VIP", value: food.vip_parties, color: "#d4b85e" },
    food.note_parties > 0 && { label: "⚠ Notes", value: food.note_parties, color: "#c0392b" },
    food.walkups > 0 && { label: "Walk-ups", value: food.walkups, color: "#4caf7a" },
    food.redeemed > 0 && { label: "Redeemed", value: `${food.redeemed} · ${(food.redemption_rate * 100).toFixed(0)}%`, color: "#27ae60" },
  ].filter(Boolean) as { label: string; value: number | string; color: string }[];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 1, background: "var(--border-subtle)" }}>
      <div style={{ background: "var(--bg-elevated)", padding: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 16 }}>Item Totals</div>
        {food.by_item.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No food items sold yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {food.by_item.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 0", fontFamily: "var(--serif)", fontSize: 16 }}>{t.label}</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)" }}>{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ background: "var(--bg-elevated)", padding: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 16 }}>Flags</div>
        {flags.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No flags for this night.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {flags.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
                <span style={{ fontSize: 12, letterSpacing: 1, color: f.color, textTransform: "uppercase", fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)" }}>{f.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@media (max-width: 800px) { div[style*="grid-template-columns: 1.5fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};

