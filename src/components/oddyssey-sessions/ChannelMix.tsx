"use client";

import type { ChannelMix as ChannelMixData } from "@/lib/oddyssey-sessions/loader";

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

/**
 * Visual breakdown of direct vs. third-party revenue for a night, with
 * commission owed. Used on both Manor and Noir summary pages. Renders
 * nothing when there's no gross revenue at all.
 */
export function ChannelMixPanel({ mix }: { mix: ChannelMixData }) {
  if (mix.total_gross <= 0) return null;
  const thirdPct = mix.third_party_pct * 100;
  const directPct = 100 - thirdPct;

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
          Channel Mix
        </h2>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Direct box office vs. third-party resellers
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ height: 36, display: "flex", border: "1px solid var(--border-subtle)", marginBottom: 16, overflow: "hidden" }}>
        <div style={{
          width: `${directPct}%`, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "var(--bg)", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
        }}>
          {directPct >= 12 && `Direct ${directPct.toFixed(0)}%`}
        </div>
        <div style={{
          width: `${thirdPct}%`, background: "#8b6fb0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
        }}>
          {thirdPct >= 8 && `Third-party ${thirdPct.toFixed(0)}%`}
        </div>
      </div>

      {/* Three headline stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border-subtle)", marginBottom: 16 }}>
        <Stat
          label="Direct Gross"
          value={fmtUsd(mix.direct_gross)}
          sub={`${directPct.toFixed(1)}% of total`}
          accent="var(--accent)"
        />
        <Stat
          label="Third-Party Gross"
          value={fmtUsd(mix.third_party_gross)}
          sub={mix.commission_rate != null
            ? `${(mix.commission_rate * 100).toFixed(0)}% commission rate`
            : "no rate parsed"}
          accent="#8b6fb0"
        />
        <Stat
          label="Net to Oddyssey"
          value={fmtUsd(mix.net_to_oddyssey)}
          sub={mix.commission_amount > 0
            ? `after ${fmtUsd(mix.commission_amount)} commission`
            : "no commission owed"}
          accent="#27ae60"
        />
      </div>
      <style>{`@media (max-width: 800px) { div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>

      {/* Third-party line detail */}
      {mix.third_party_lines.length > 0 && (
        <div style={{ border: "1px solid var(--border-subtle)" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2.2fr 1fr 0.9fr 1.1fr 1.1fr",
            padding: "12px 20px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
            color: "#8b6fb0", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)", gap: 8,
          }}>
            <div>Third-Party Line</div>
            <div style={{ textAlign: "right" }}>Gross</div>
            <div style={{ textAlign: "right" }}>Rate</div>
            <div style={{ textAlign: "right" }}>Commission</div>
            <div style={{ textAlign: "right" }}>Net</div>
          </div>
          {mix.third_party_lines.map((l) => (
            <div key={l.name} style={{
              display: "grid", gridTemplateColumns: "2.2fr 1fr 0.9fr 1.1fr 1.1fr",
              padding: "14px 20px", fontSize: 13, alignItems: "center",
              borderBottom: "1px solid var(--border-subtle)", gap: 8,
            }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--text)" }}>{l.name}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "var(--text)" }}>
                {fmtUsd(l.gross)}
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "var(--text-muted)" }}>
                {l.rate != null ? `${(l.rate * 100).toFixed(0)}%` : "—"}
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "#c0392b" }}>
                −{fmtUsd(l.commission)}
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: 16, color: "#27ae60" }}>
                {fmtUsd(l.net)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 12, padding: "10px 14px", background: "rgba(139,111,176,0.06)",
        borderLeft: "3px solid #8b6fb0", fontSize: 12, color: "var(--text-muted)",
        letterSpacing: 0.3, lineHeight: 1.5,
      }}>
        <strong style={{ color: "#8b6fb0" }}>Third-party = resold through an OTA</strong> (hotel concierge, TixTrack,
        Fever, etc.). Commission rate is parsed from the group name (e.g., &ldquo;Third Party Sales - 20% Commission&rdquo;).
        Ticketure&rsquo;s Net-to-Bank already subtracts this, so the number on the headline card is authoritative — this section just
        shows the split.
      </div>
    </div>
  );
}

function Stat({
  label, value, sub, accent,
}: {
  label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <div style={{ background: "var(--bg-elevated)", padding: "22px 20px" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: accent, fontWeight: 500, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 300, lineHeight: 1, color: "var(--text)", marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.4 }}>{sub}</div>}
    </div>
  );
}
