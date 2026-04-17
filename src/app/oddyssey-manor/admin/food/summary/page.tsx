"use client";

import { loadStateWithWalkups } from "@/lib/oddyssey-food/build-state";
import {
  buildSummary,
  formatCurrency,
  type NightSummary,
  type PackageBreakdown,
  type SessionOccupancy,
} from "@/lib/oddyssey-food/summary";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SummaryPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [date, setDate] = useState<string>("");
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapResult, setRecapResult] = useState<string | null>(null);

  useEffect(() => {
    setState(loadStateWithWalkups());
  }, []);

  const summary = useMemo(
    () => (state ? buildSummary(state, date || undefined) : null),
    [state, date]
  );

  useEffect(() => {
    if (summary && !date) setDate(summary.date);
  }, [summary, date]);

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
        </div>
        {summary.available_dates.length > 1 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Date</div>
            <select value={date} onChange={(e) => setDate(e.target.value)} style={selectStyle}>
              {summary.available_dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Headline stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 40 }}>
        <HeadlineStat label="Tickets Sold" value={String(summary.tickets_sold)} sub={`of ${summary.capacity_total} capacity`} />
        <HeadlineStat label="Revenue" value={formatCurrency(summary.revenue)} sub="at list price" />
        <HeadlineStat label="Capacity" value={`${(summary.capacity_percent * 100).toFixed(0)}%`} sub={capacityLabel(summary.capacity_percent)} />
        <HeadlineStat label="Food to Prep" value={String(summary.food_items)} sub={`${summary.food.by_item.length} menu item${summary.food.by_item.length === 1 ? "" : "s"}`} />
      </div>

      <style>{`@media (max-width: 900px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; } }`}</style>

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

function HeadlineStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "28px 24px" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 300, lineHeight: 1, color: "var(--text)", marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5 }}>{sub}</div>}
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

const selectStyle: React.CSSProperties = {
  background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-subtle)",
  padding: "8px 12px", fontSize: 13, letterSpacing: 0.3, outline: "none", fontFamily: "var(--sans)",
};
