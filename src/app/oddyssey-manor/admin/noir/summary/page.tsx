"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GMBriefingPanel } from "@/components/oddyssey-sessions/GMBriefingPanel";
import {
  formatNoirCurrency,
  type NoirSummary,
  type NoirPackageBreakdown,
  type NoirSessionOccupancy,
  type NoirTicketGroupRow,
} from "@/lib/oddyssey-noir/pipeline";
import type { NoirWeekOverWeek, NoirReportOverlay } from "@/lib/oddyssey-noir/history";
import { computeChannelMix, type TicketGroupReport } from "@/lib/oddyssey-sessions/loader";
import { ChannelMixPanel } from "@/components/oddyssey-sessions/ChannelMix";

export default function NoirSummaryPage() {
  const [summary, setSummary] = useState<NoirSummary | null>(null);
  const [wow, setWow] = useState<NoirWeekOverWeek | null>(null);
  const [report, setReport] = useState<NoirReportOverlay | null>(null);
  const [bullets, setBullets] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [recapStatus, setRecapStatus] = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState<string | null>(null);

  function loadForDate(d?: string) {
    setLoading(true);
    fetch(`/api/oddyssey-noir/wow${d ? `?date=${d}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "ok") {
          setSummary(data.summary);
          setWow(data.wow);
          setReport(data.report ?? null);
          if (!date) setDate(data.summary.date);
          // fetch auto talking points
          fetch(`/api/oddyssey-noir/briefing?date=${data.summary.date}&format=json`)
            .then((r) => r.json())
            .then((b) => { if (b.status === "ok") setBullets(b.bullets ?? []); })
            .catch(() => {});
        } else {
          setError(data.message);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadForDate(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { if (date) loadForDate(date); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [date]);

  async function pullNow() {
    setPulling(true);
    setPullStatus(null);
    try {
      const res = await fetch("/api/oddyssey-noir/pull", { method: "POST", body: "{}" });
      const data = await res.json();
      if (data.status !== "ok") {
        setPullStatus(`× ${data.stderr ?? data.message ?? "Pull failed"}`);
        return;
      }
      // After pull, re-fetch the summary + overlay
      loadForDate(date || undefined);
      setPullStatus(`✓ Pulled ${data.meta?.filename ?? "CSV"} · sessions ${data.sessions?.ok ? "ok" : "failed"}`);
    } catch (e) {
      setPullStatus(`× ${String(e)}`);
    } finally {
      setPulling(false);
    }
  }

  async function sendRecap(test: boolean) {
    if (!summary) return;
    setSending(true);
    setRecapStatus(null);
    try {
      const res = await fetch("/api/oddyssey-noir/recap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ test, date: summary.date }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setRecapStatus(`Sent · ${data.subject} → ${(data.recipients ?? []).join(", ")}`);
      } else {
        setRecapStatus(`Failed · ${data.message ?? "Unknown"}`);
      }
    } catch (e) {
      setRecapStatus(`Error · ${String(e)}`);
    } finally {
      setSending(false);
    }
  }

  if (loading && !summary) return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading…</div>;

  if (error || !summary) {
    return (
      <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>
          {error ?? "No data."}
        </div>
        <Link href="/oddyssey-manor/admin/noir/upload" style={btnPrimary}>Pull Noir data</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
            02 · Summary
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
            Noir · {summary.date_label}
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
            {pullStatus && (
              <span style={{ fontSize: 11, color: pullStatus.startsWith("✓") ? "#27ae60" : "#c0392b", letterSpacing: 0.3 }}>
                {pullStatus}
              </span>
            )}
          </div>
        </div>
        {summary.available_dates.length > 1 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Date</div>
            <select value={date} onChange={(e) => setDate(e.target.value)} style={selectStyle}>
              {summary.available_dates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Headline — prefer report actuals when available */}
      {report?.available && report.totals ? (
        <>
          <div style={{
            marginBottom: 14, padding: "10px 14px", background: "rgba(39,174,96,0.08)",
            borderLeft: "3px solid #27ae60", fontSize: 11, color: "#27ae60",
            letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 500,
          }}>
            ✓ Showing actuals from Ticketure Summary Report · pulled {report.pulled_at ? new Date(report.pulled_at).toLocaleString("en-US") : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 16 }}>
            <HeadlineStat label="Tickets Sold" value={String(report.totals.reserved)} sub={`of ${report.totals.capacity} capacity`} />
            <HeadlineStat label="Gross Revenue" value={formatNoirCurrency(report.totals.gross_revenue)} sub={`Net $${report.totals.net_to_bank.toFixed(0)} to bank`} />
            <HeadlineStat label="Capacity" value={`${(report.totals.capacity_percent * 100).toFixed(1)}%`} sub={capacityLabel(report.totals.capacity_percent)} />
            <HeadlineStat label="Redeemed" value={`${report.totals.redeemed} · ${report.totals.reserved > 0 ? Math.round(report.totals.redeemed / report.totals.reserved * 100) : 0}%`} sub={`${report.totals.total_orders} orders`} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 40 }}>
            <HeadlineStat label="Paid" value={String(report.totals.tickets_paid)} sub="actually paid" />
            <HeadlineStat label="Free (Comps)" value={String(report.totals.tickets_free)} sub="$0 tickets" />
            <HeadlineStat label="Held" value={String(report.totals.tickets_held)} sub="not yet sold" />
            <HeadlineStat label="Refunded" value={formatNoirCurrency(report.totals.revenue_refunded)} sub={`${report.totals.tickets_refunded} tix`} />
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 40 }}>
          <HeadlineStat label="Tickets Sold" value={String(summary.tickets_sold)} sub={`of ${summary.capacity_total} capacity`} />
          <HeadlineStat label="Revenue (est.)" value={formatNoirCurrency(summary.revenue)} sub="list price × count" />
          <HeadlineStat label="Capacity" value={`${(summary.capacity_percent * 100).toFixed(0)}%`} sub={capacityLabel(summary.capacity_percent)} />
          <HeadlineStat label="Redeemed" value={`${summary.redeemed} · ${(summary.redemption_rate * 100).toFixed(0)}%`} sub="ticket_state=redeemed" />
        </div>
      )}
      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; } }`}</style>

      {/* WoW */}
      {wow && <WoWStrip wow={wow} summary={summary} />}

      {/* Ticket Groups — actuals from Ticketure's Summary Report when
          available; falls back to CSV list-price estimate otherwise. */}
      {report?.available && report.ticket_groups && report.ticket_groups.length > 0 ? (
        <Section
          title="Ticket Groups"
          subtitle={<span style={{ color: "#27ae60" }}>Actuals · from Ticketure Summary Report</span>}
        >
          <TicketGroupsActualsTable groups={report.ticket_groups} csvGroups={summary.ticket_groups} />
        </Section>
      ) : (
        <Section
          title="Ticket Groups"
          subtitle={<span style={{ color: "var(--text-muted)" }}>From attendees CSV · list-price estimate</span>}
        >
          <TicketGroupsTable groups={summary.ticket_groups} />
          <div style={{
            marginTop: 12, padding: "10px 14px", background: "rgba(180,110,200,0.06)",
            borderLeft: "3px solid var(--accent)", fontSize: 12, color: "var(--text-muted)",
            letterSpacing: 0.3, lineHeight: 1.5,
          }}>
            <strong style={{ color: "var(--accent)" }}>Revenue is list-price × ticket count.</strong>{" "}
            Ticketure&rsquo;s Summary Report shows actual paid-vs-free breakdown and net-to-bank.
            Run <em>Pull Now</em> to refresh actuals.
          </div>
        </Section>
      )}

      {/* Channel Mix — direct vs. third-party resellers */}
      {report?.available && report.ticket_groups && (
        <ChannelMixPanel mix={computeChannelMix(report.ticket_groups)} />
      )}

      {/* Packages (seeded types only) */}
      {summary.packages.some((p) => p.count > 0) && (
        <Section title="Package Mix" subtitle={`${summary.packages.reduce((s, p) => s + p.count, 0)} tickets · ${formatNoirCurrency(summary.revenue)} total`}>
          <PackageTable packages={summary.packages} />
        </Section>
      )}

      {/* Sessions */}
      <Section title="Session Occupancy" subtitle={`${summary.sessions.length} session${summary.sessions.length === 1 ? "" : "s"}`}>
        <SessionList sessions={summary.sessions} />
      </Section>

      {/* Notes */}
      {summary.notes.length > 0 && (
        <Section title="Guest Notes">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {summary.notes.map((n, i) => (
              <div key={i} style={{ padding: "10px 14px", background: "rgba(192,57,43,0.08)", borderLeft: "3px solid #c0392b", fontSize: 13 }}>
                <strong>{n.guest}</strong> · {n.session}
                <div style={{ color: "var(--text-muted)", marginTop: 3 }}>{n.note}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* GM Briefing */}
      <GMBriefingPanel venue="noir" date={summary.date} bullets={bullets} />

      {/* Actions */}
      <div style={{ marginTop: 48, padding: "24px 28px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 14 }}>Actions</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: recapStatus ? 16 : 0 }}>
          <button onClick={() => sendRecap(true)} disabled={sending} style={{ ...btnOutline, opacity: sending ? 0.5 : 1 }}>
            {sending ? "Sending…" : "Send Test Recap (Keith only)"}
          </button>
          <button onClick={() => sendRecap(false)} disabled={sending} style={{ ...btnPrimary, opacity: sending ? 0.5 : 1 }}>
            {sending ? "Sending…" : "Send Recap to Team"}
          </button>
          <Link href="/api/oddyssey-noir/recap" target="_blank" style={btnOutline}>Preview HTML</Link>
        </div>
        {recapStatus && (
          <div style={{ fontSize: 12, color: recapStatus.startsWith("Sent") ? "#27ae60" : "#c0392b" }}>
            {recapStatus}
          </div>
        )}
      </div>
    </div>
  );
}

function capacityLabel(pct: number): string {
  if (pct >= 0.9) return "Near sold out";
  if (pct >= 0.75) return "Strong night";
  if (pct >= 0.5) return "Healthy";
  if (pct >= 0.25) return "Room to fill";
  return "Light";
}

function HeadlineStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "28px 24px" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, lineHeight: 1, color: "var(--text)", marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function TicketGroupsTable({ groups }: { groups: NoirTicketGroupRow[] }) {
  if (groups.length === 0) return <div style={{ padding: 24, color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)" }}>No ticket groups in this pull.</div>;
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.3fr", padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div>Ticket Group</div>
        <div style={{ textAlign: "right" }}>Reserved</div>
        <div style={{ textAlign: "right" }}>Redeemed</div>
        <div style={{ textAlign: "right" }}>Revenue (est.)</div>
      </div>
      {groups.map((g) => (
        <div key={g.ticket_group_name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.3fr", padding: "14px 20px", fontSize: 13, alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>
            {g.ticket_group_name}
            {!g.price_known && (
              <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#d4a574", padding: "2px 6px", border: "1px solid rgba(212,165,116,0.3)", verticalAlign: "middle" }}>
                No price seeded
              </span>
            )}
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)" }}>{g.reserved}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text-secondary)" }}>
            {g.redeemed} <span style={{ color: "var(--text-muted)", fontSize: 11 }}>· {(g.redemption_rate * 100).toFixed(0)}%</span>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: g.price_known ? "var(--text)" : "var(--text-muted)" }}>
            {g.price_known ? formatNoirCurrency(g.revenue_estimate) : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TicketGroupsActualsTable({
  groups,
  csvGroups,
}: {
  groups: TicketGroupReport[];
  csvGroups: NoirTicketGroupRow[];
}) {
  // Ticketure's Summary Report exposes Reserved / Redeemed / Gross per
  // group. Paid/Free/Net are session totals only. For context we also
  // show the CSV's list-price estimate alongside actual gross so the
  // comp spread is legible at a glance.
  const csvByName = new Map(csvGroups.map((g) => [g.ticket_group_name.toLowerCase(), g]));
  const totalActual = groups.reduce((s, g) => s + (g.gross_revenue ?? 0), 0);
  return (
    <>
      <div style={{ border: "1px solid var(--border-subtle)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 0.9fr 1fr 1.1fr 1.1fr",
          padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
          color: "var(--accent)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)", gap: 8,
        }}>
          <div>Ticket Group</div>
          <div style={{ textAlign: "right" }}>Reserved</div>
          <div style={{ textAlign: "right" }}>Redeemed</div>
          <div style={{ textAlign: "right" }}>List-price est.</div>
          <div style={{ textAlign: "right" }}>Gross (actual)</div>
        </div>
        {groups.map((g) => {
          const csv = csvByName.get(g.ticket_group_name.toLowerCase());
          const listEst = csv?.revenue_estimate ?? 0;
          const actual = g.gross_revenue ?? 0;
          const redemptionPct = g.reserved && g.reserved > 0
            ? Math.round((g.redeemed ?? 0) / g.reserved * 100)
            : 0;
          return (
            <div key={g.ticket_group_name} style={{
              display: "grid",
              gridTemplateColumns: "2fr 0.9fr 1fr 1.1fr 1.1fr",
              padding: "14px 20px", fontSize: 13, alignItems: "center",
              borderBottom: "1px solid var(--border-subtle)", gap: 8,
            }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>
                {g.ticket_group_name}
                {csv && !csv.price_known && (
                  <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#d4a574", padding: "2px 6px", border: "1px solid rgba(212,165,116,0.3)", verticalAlign: "middle" }}>
                    No price seeded
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)" }}>
                {g.reserved ?? "—"}
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text-secondary)" }}>
                {g.redeemed ?? "—"} <span style={{ color: "var(--text-muted)", fontSize: 11 }}>· {redemptionPct}%</span>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text-muted)" }}>
                {csv && csv.price_known ? formatNoirCurrency(listEst) : "—"}
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: actual > 0 ? "#27ae60" : "var(--text-muted)" }}>
                {formatNoirCurrency(actual)}
              </div>
            </div>
          );
        })}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 0.9fr 1fr 1.1fr 1.1fr",
          padding: "14px 20px", gap: 8, background: "var(--bg-elevated)",
          fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500,
        }}>
          <div>Total</div>
          <div />
          <div />
          <div />
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "#27ae60" }}>
            {formatNoirCurrency(totalActual)}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, padding: "10px 14px", background: "rgba(39,174,96,0.06)",
        borderLeft: "3px solid #27ae60", fontSize: 12, color: "var(--text-muted)",
        letterSpacing: 0.3, lineHeight: 1.5,
      }}>
        <strong style={{ color: "#27ae60" }}>Gross = money actually collected</strong> (from Ticketure&rsquo;s per-group
        Summary Report). The List-price estimate column shows what each group <em>would</em> have
        grossed if every reserved ticket paid list price — the gap is comps, promoters, and guest list.
      </div>
    </>
  );
}

function PackageTable({ packages }: { packages: NoirPackageBreakdown[] }) {
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.5fr 1fr", padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div>Package</div>
        <div style={{ textAlign: "right" }}>Tickets</div>
        <div style={{ textAlign: "right" }}>Revenue</div>
        <div>Mix</div>
        <div style={{ textAlign: "right" }}>% Total</div>
      </div>
      {packages.map((p) => (
        <div key={p.type} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.5fr 1fr", padding: "14px 20px", fontSize: 13, alignItems: "center", borderBottom: "1px solid var(--border-subtle)", color: p.count === 0 ? "var(--text-muted)" : "var(--text)" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{p.label}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 20, color: p.count > 0 ? "var(--accent)" : "var(--text-muted)" }}>{p.count}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16 }}>{formatNoirCurrency(p.revenue)}</div>
          <div>
            <div style={{ height: 6, background: "var(--border-subtle)" }}>
              <div style={{ height: "100%", width: `${p.percent * 100}%`, background: "var(--accent)" }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>{(p.percent * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

function SessionList({ sessions }: { sessions: NoirSessionOccupancy[] }) {
  if (sessions.length === 0) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", fontSize: 13 }}>No session data yet.</div>;
  return (
    <div style={{ border: "1px solid var(--border-subtle)" }}>
      {sessions.map((s, i) => (
        <div key={s.iso} style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 2fr 80px", padding: "14px 20px", alignItems: "center", fontSize: 13, borderBottom: i < sessions.length - 1 ? "1px solid var(--border-subtle)" : "none", gap: 16 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--accent)" }}>{s.time_label}</div>
          <div>
            <div style={{ height: 6, background: "var(--border-subtle)" }}>
              <div style={{ height: "100%", width: `${Math.min(100, s.percent * 100)}%`, background: s.percent >= 0.9 ? "#c0392b" : s.percent >= 0.75 ? "#d4b85e" : "var(--accent)" }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16 }}>
            {s.admissions}<span style={{ color: "var(--text-muted)" }}>/{s.capacity}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {s.package_mix.map((m) => (
              <span key={m.type} style={{ fontSize: 10, letterSpacing: 1, color: "var(--text-muted)", padding: "3px 8px", border: "1px solid var(--border-subtle)" }}>
                {m.short_label} · <strong style={{ color: "var(--text)" }}>{m.count}</strong>
              </span>
            ))}
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: s.percent >= 0.9 ? "#c0392b" : s.percent >= 0.75 ? "#d4b85e" : "var(--text-muted)" }}>
            {(s.percent * 100).toFixed(0)}%
          </div>
        </div>
      ))}
    </div>
  );
}

function WoWStrip({ wow, summary }: { wow: NoirWeekOverWeek; summary: NoirSummary }) {
  return (
    <div style={{ marginTop: -8, marginBottom: 40 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500, marginBottom: 12 }}>
        vs. {wow.prior_date_label}
      </div>
      {wow.available && wow.prior ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)" }}>
          <DeltaCard label="Tickets" current={summary.tickets_sold} prior={wow.prior.tickets} delta={wow.deltas.tickets} />
          <DeltaCard label="Revenue" current={formatNoirCurrency(summary.revenue)} prior={formatNoirCurrency(wow.prior.revenue)} delta={wow.deltas.revenue} formatDelta={(n) => (n >= 0 ? `+${formatNoirCurrency(n)}` : `−${formatNoirCurrency(Math.abs(n))}`)} />
          <DeltaCard label="Capacity" current={`${(summary.capacity_percent * 100).toFixed(0)}%`} prior={`${(wow.prior.capacity_percent * 100).toFixed(0)}%`} delta={wow.deltas.capacity_percent} formatDelta={(n) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(0)} pts`} />
          <DeltaCard label="Redeemed" current={summary.redeemed} prior={wow.prior.redeemed} delta={wow.deltas.redeemed} />
        </div>
      ) : (
        <div style={{ padding: "20px 24px", border: "1px dashed var(--border-subtle)", background: "var(--bg-elevated)", fontSize: 12, color: "var(--text-muted)" }}>
          {wow.prior_date_label} has no archived pull yet. WoW will populate once the scheduler has run through a full week.
        </div>
      )}
    </div>
  );
}

function DeltaCard({ label, current, prior, delta, formatDelta }: { label: string; current: string | number; prior: string | number; delta: number; formatDelta?: (n: number) => string }) {
  const color = delta > 0 ? "#27ae60" : delta < 0 ? "#c0392b" : "var(--text-muted)";
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const deltaText = formatDelta ? formatDelta(delta) : `${delta >= 0 ? "+" : ""}${delta}`;
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "16px 18px" }}>
      <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", lineHeight: 1 }}>{current}</div>
        <div style={{ fontSize: 12, color, whiteSpace: "nowrap" }}>{arrow} {deltaText}</div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>was {prior}</div>
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
const selectStyle: React.CSSProperties = {
  background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-subtle)",
  padding: "8px 12px", fontSize: 13, letterSpacing: 0.3, outline: "none", fontFamily: "var(--sans)",
};
