"use client";

// At-a-glance snapshot for the /oddyssey-manor/admin control room.
// Picks a date (and optionally a compare date) once, then shows Manor +
// Noir headline tiles side by side with delta chips. For deep dives
// Brandon still clicks into each venue's summary page — this is the
// one-stop "how did this date compare?" view.

import { useEffect, useMemo, useState } from "react";
import { CompareDatePicker, DatePicker, Delta } from "./CompareControls";

interface FoodWowReport {
  available?: boolean;
  totals?: {
    reserved: number;
    reserved_admissions: number;
    redeemed_admissions: number;
    capacity: number;
    capacity_percent: number;
    gross_revenue: number;
    net_to_bank: number;
    tickets_paid: number;
    tickets_free_admissions: number;
  };
}

interface NoirWowReport {
  available?: boolean;
  totals?: {
    reserved: number;
    redeemed: number;
    capacity: number;
    capacity_percent: number;
    gross_revenue: number;
    net_to_bank: number;
    tickets_paid: number;
    tickets_free: number;
  };
}

interface VenueData {
  reservedOrAdmissions: number | null;
  capacityPct: number | null;
  gross: number | null;
  net: number | null;
  paid: number | null;
  free: number | null;
}

function asManor(r: FoodWowReport | null): VenueData {
  if (!r?.available || !r.totals) {
    return { reservedOrAdmissions: null, capacityPct: null, gross: null, net: null, paid: null, free: null };
  }
  const t = r.totals;
  return {
    reservedOrAdmissions: t.reserved_admissions,
    capacityPct: t.capacity > 0 ? (t.reserved_admissions / t.capacity) * 100 : null,
    gross: t.gross_revenue,
    net: t.net_to_bank,
    paid: t.tickets_paid,
    free: t.tickets_free_admissions,
  };
}
function asNoir(r: NoirWowReport | null): VenueData {
  if (!r?.available || !r.totals) {
    return { reservedOrAdmissions: null, capacityPct: null, gross: null, net: null, paid: null, free: null };
  }
  const t = r.totals;
  return {
    reservedOrAdmissions: t.reserved,
    capacityPct: t.capacity_percent * 100,
    gross: t.gross_revenue,
    net: t.net_to_bank,
    paid: t.tickets_paid,
    free: t.tickets_free,
  };
}

function fmtMoney(n: number | null): string {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtInt(n: number | null): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("en-US");
}
function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${n.toFixed(1)}%`;
}

export function ControlRoomSnapshot() {
  const [manorDates, setManorDates] = useState<string[]>([]);
  const [noirDates, setNoirDates] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [compareDate, setCompareDate] = useState<string>("");
  const [manorPrimary, setManorPrimary] = useState<FoodWowReport | null>(null);
  const [noirPrimary, setNoirPrimary] = useState<NoirWowReport | null>(null);
  const [manorCompare, setManorCompare] = useState<FoodWowReport | null>(null);
  const [noirCompare, setNoirCompare] = useState<NoirWowReport | null>(null);
  // Send flow state. `sending` blocks double-clicks; `sendResult` is a
  // one-shot status string ("✓ sent to ..." / "× error").
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // Load both dates lists on mount, default to the most recent date
  // either venue has a report for.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/oddyssey-food/dates").then((r) => r.json()).catch(() => ({ dates: [] })),
      fetch("/api/oddyssey-noir/dates").then((r) => r.json()).catch(() => ({ dates: [] })),
    ]).then(([m, n]) => {
      if (cancelled) return;
      const mDates: string[] = Array.isArray(m.dates) ? m.dates : [];
      const nDates: string[] = Array.isArray(n.dates) ? n.dates : [];
      setManorDates(mDates);
      setNoirDates(nDates);
      const union = Array.from(new Set([...mDates, ...nDates])).sort();
      if (union.length > 0) setDate(union[union.length - 1]);
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch primary date data for both venues
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    fetch(`/api/oddyssey-food/wow?date=${date}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.status === "ok") setManorPrimary(d.report ?? null); })
      .catch(() => {});
    fetch(`/api/oddyssey-noir/wow?date=${date}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.status === "ok") setNoirPrimary(d.report ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [date]);

  // Fetch compare date data
  useEffect(() => {
    if (!compareDate) { setManorCompare(null); setNoirCompare(null); return; }
    let cancelled = false;
    fetch(`/api/oddyssey-food/wow?date=${compareDate}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.status === "ok") setManorCompare(d.report ?? null); })
      .catch(() => {});
    fetch(`/api/oddyssey-noir/wow?date=${compareDate}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.status === "ok") setNoirCompare(d.report ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [compareDate]);

  const availableDates = useMemo(
    () => Array.from(new Set([...manorDates, ...noirDates])).sort(),
    [manorDates, noirDates],
  );

  const manor = useMemo(() => asManor(manorPrimary), [manorPrimary]);
  const noir = useMemo(() => asNoir(noirPrimary), [noirPrimary]);
  const manorPrior = useMemo(() => asManor(manorCompare), [manorCompare]);
  const noirPrior = useMemo(() => asNoir(noirCompare), [noirCompare]);

  if (availableDates.length === 0) return null;

  async function sendEmail(opts: { test?: boolean } = {}) {
    if (!date || sending) return;
    setSending(true);
    setSendResult(null);
    try {
      const body: { date: string; compareDate?: string; test?: boolean } = { date };
      if (compareDate) body.compareDate = compareDate;
      if (opts.test) body.test = true;
      const res = await fetch("/api/oddyssey-sessions/compare-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setSendResult(`✓ Sent to ${(data.recipients ?? []).join(", ")}`);
      } else {
        setSendResult(`× ${data.message ?? "send failed"}`);
      }
    } catch (e) {
      setSendResult(`× ${String(e)}`);
    } finally {
      setSending(false);
      setTimeout(() => setSendResult(null), 8000);
    }
  }

  return (
    <section
      style={{
        background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 28px 28px",
        marginBottom: 32,
      }}
      className="control-room-snapshot"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Consolas, monospace",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c9a84c",
              marginBottom: 8,
            }}
          >
            Tonight at a glance
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26,
              fontWeight: 300,
              letterSpacing: 1,
            }}
          >
            {date || "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <DatePicker
            value={date}
            onChange={setDate}
            availableDates={availableDates}
          />
          <CompareDatePicker
            primary={date}
            value={compareDate}
            onChange={setCompareDate}
            availableDates={availableDates}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <VenueColumn
          title="Manor"
          accent="#c9a84c"
          d={manor}
          prior={manorPrior}
          priorLabel={compareDate || undefined}
        />
        <VenueColumn
          title="Noir"
          accent="#b46ec8"
          d={noir}
          prior={noirPrior}
          priorLabel={compareDate || undefined}
        />
      </div>

      <div
        className="snapshot-actions"
        style={{
          marginTop: 18,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => window.print()}
          style={actionBtnStyle}
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => sendEmail()}
          disabled={sending}
          style={{ ...actionBtnStyle, opacity: sending ? 0.5 : 1 }}
        >
          {sending ? "Sending…" : "Send via email"}
        </button>
        <a
          href={`/api/oddyssey-sessions/compare-email?date=${date}${compareDate ? `&compareDate=${compareDate}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...actionBtnStyle, textDecoration: "none", display: "inline-block" }}
        >
          Preview email
        </a>
        {sendResult && (
          <span
            style={{
              fontSize: 11,
              letterSpacing: 0.4,
              color: sendResult.startsWith("✓") ? "#27ae60" : "#c0392b",
            }}
          >
            {sendResult}
          </span>
        )}
      </div>

      <style>{`
        @media print {
          @page { margin: 0.4in; }
          body { background: #fff !important; color: #000 !important; }
          /* Hide everything except the snapshot */
          body * { visibility: hidden; }
          .control-room-snapshot, .control-room-snapshot * { visibility: visible; }
          .control-room-snapshot { position: absolute; left: 0; top: 0; width: 100%;
            background: #fff !important; color: #000 !important;
            border: 1px solid #000 !important; padding: 16px !important; margin: 0 !important; }
          .control-room-snapshot * { background: #fff !important; color: #000 !important;
            border-color: #555 !important; box-shadow: none !important; }
          .snapshot-actions { display: none !important; }
        }
      `}</style>
    </section>
  );
}

const actionBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#e8e4dd",
  padding: "7px 14px",
  fontSize: 10,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  fontFamily: "'Helvetica Neue',Arial,sans-serif",
  cursor: "pointer",
};

function VenueColumn({
  title,
  accent,
  d,
  prior,
  priorLabel,
}: {
  title: string;
  accent: string;
  d: VenueData;
  prior: VenueData;
  priorLabel?: string;
}) {
  return (
    <div style={{ background: "#0d0d0d", padding: "20px 24px" }}>
      <div
        style={{
          fontFamily: "Consolas, monospace",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: 14,
          borderBottom: `1px solid ${accent}33`,
          paddingBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px 20px",
        }}
      >
        <Cell
          label={title === "Manor" ? "Admissions" : "Tickets Sold"}
          value={fmtInt(d.reservedOrAdmissions)}
          current={d.reservedOrAdmissions}
          prior={prior.reservedOrAdmissions}
          priorLabel={priorLabel}
          format="int"
        />
        <Cell
          label="Capacity"
          value={fmtPct(d.capacityPct)}
          current={d.capacityPct}
          prior={prior.capacityPct}
          priorLabel={priorLabel}
          format="percent"
        />
        <Cell
          label="Gross"
          value={fmtMoney(d.gross)}
          current={d.gross}
          prior={prior.gross}
          priorLabel={priorLabel}
          format="money"
        />
        <Cell
          label="Net to Bank"
          value={fmtMoney(d.net)}
          current={d.net}
          prior={prior.net}
          priorLabel={priorLabel}
          format="money"
        />
        <Cell
          label="Paid"
          value={fmtInt(d.paid)}
          current={d.paid}
          prior={prior.paid}
          priorLabel={priorLabel}
          format="int"
        />
        <Cell
          label="Free (Comps)"
          value={fmtInt(d.free)}
          current={d.free}
          prior={prior.free}
          priorLabel={priorLabel}
          format="int"
          upIsGood={false}
        />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  current,
  prior,
  priorLabel,
  format,
  upIsGood = true,
}: {
  label: string;
  value: string;
  current: number | null;
  prior: number | null;
  priorLabel?: string;
  format: "int" | "money" | "percent" | "raw";
  upIsGood?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#9a958d",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 24,
          fontWeight: 300,
          lineHeight: 1.1,
          color: "#e8e4dd",
        }}
      >
        {value}
      </div>
      <Delta
        current={current}
        prior={prior}
        format={format}
        priorLabel={priorLabel}
        upIsGood={upIsGood}
      />
    </div>
  );
}

