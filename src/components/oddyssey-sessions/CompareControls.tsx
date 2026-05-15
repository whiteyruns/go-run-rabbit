"use client";

// Date controls + delta chip used by Manor Food and Noir summary pages
// (and the control room) so Brandon can pull historical comparisons
// (Sat vs Sat, etc).
//
// All controls are presentational. Pages own the date state and the
// data fetch — these just render the picker UI and the small
// "+12.4% vs Apr 25" delta strip below each headline value.

import { useMemo } from "react";

// Shared <input type="date"> styling so primary + compare match.
const dateInputStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  padding: "6px 10px",
  fontSize: 12,
  fontFamily: "var(--sans)",
  outline: "none",
  cursor: "pointer",
  colorScheme: "dark",
};

const presetButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-muted)",
  padding: "5px 9px",
  fontSize: 10,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  cursor: "pointer",
};

// ─── Primary date picker ──────────────────────────────────────────────────

export interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  // Sorted ascending list of dates we have data for. Used to derive
  // min/max on the native input and to render a "no data" hint when
  // the picked date is outside the set.
  availableDates: string[];
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  availableDates,
  label = "Date",
}: DatePickerProps) {
  const min = availableDates[0];
  const max = availableDates[availableDates.length - 1];
  const inSet = !value || availableDates.includes(value);
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        style={dateInputStyle}
      />
      {!inSet && value && (
        <div style={{ fontSize: 10, color: "#d4a574", marginTop: 4 }}>
          No data for {value}
        </div>
      )}
    </div>
  );
}

export interface CompareDatePickerProps {
  // The "primary" selected date — used to derive the "Same day last week"
  // suggestion (-7d) and to exclude it from the compare dropdown.
  primary: string;
  // Currently selected compare date ("" = no comparison).
  value: string;
  onChange: (date: string) => void;
  // All dates we have data for. Comparison dropdown filters out the
  // primary itself and anything later than it (apples-to-apples = past).
  availableDates: string[];
  // Optional inline label override (defaults to "Compare to").
  label?: string;
}

export function CompareDatePicker({
  primary,
  value,
  onChange,
  availableDates,
  label = "Compare to",
}: CompareDatePickerProps) {
  // Quick presets: same weekday N days back. Each only renders as a
  // button when the resulting date actually has data on disk, so we
  // don't dangle a useless button.
  const presets = useMemo(() => {
    if (!primary) return [] as { label: string; date: string }[];
    const [y, m, d] = primary.split("-").map(Number);
    const out: { label: string; date: string }[] = [];
    for (const [lbl, days] of [
      ["−1w", 7],
      ["−2w", 14],
      ["−4w", 28],
    ] as const) {
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() - days);
      out.push({ label: lbl, date: dt.toISOString().slice(0, 10) });
    }
    return out.filter((p) => availableDates.includes(p.date));
  }, [primary, availableDates]);

  // Bound the native date input to the historical range. Compare must
  // be strictly before primary — apples to apples = past.
  const min = availableDates[0];
  const max = primary;
  const inSet = !value || availableDates.includes(value);

  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          style={dateInputStyle}
        />
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.date)}
            title={`Same weekday — ${p.date}`}
            style={{
              ...presetButtonStyle,
              ...(value === p.date
                ? { borderColor: "var(--accent)", color: "var(--accent)" }
                : null),
            }}
          >
            {p.label}
          </button>
        ))}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Clear comparison"
            style={presetButtonStyle}
          >
            ✕
          </button>
        )}
      </div>
      {!inSet && value && (
        <div style={{ fontSize: 10, color: "#d4a574", marginTop: 4 }}>
          No data for {value}
        </div>
      )}
    </div>
  );
}

// ─── Delta chip ───────────────────────────────────────────────────────────

export type DeltaFormat = "int" | "money" | "percent" | "raw";

export interface DeltaProps {
  // Current and prior numeric values. Either may be null (no data) —
  // chip just returns null in that case.
  current: number | null | undefined;
  prior: number | null | undefined;
  format?: DeltaFormat;
  // The label of the date we're comparing against (shown in caption).
  priorLabel?: string;
  // Most stats: up = good (green), down = bad (red). For inverse stats
  // (refunds, comp%) the caller can flip this so up shows red.
  upIsGood?: boolean;
}

function formatDelta(raw: number, fmt: DeltaFormat): string {
  const sign = raw > 0 ? "+" : raw < 0 ? "−" : "";
  const abs = Math.abs(raw);
  switch (fmt) {
    case "money":
      return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent":
      return `${sign}${abs.toFixed(1)}pp`;
    case "int":
      return `${sign}${Math.round(abs).toLocaleString("en-US")}`;
    case "raw":
    default:
      return `${sign}${abs.toLocaleString("en-US")}`;
  }
}

export function Delta({
  current,
  prior,
  format = "int",
  priorLabel,
  upIsGood = true,
}: DeltaProps) {
  if (current == null || prior == null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(prior)) return null;
  const diff = current - prior;
  const pct = prior !== 0 ? (diff / prior) * 100 : null;
  const isUp = diff > 0;
  const isFlat = diff === 0;
  const tone = isFlat
    ? "var(--text-muted)"
    : (isUp === upIsGood)
      ? "#27ae60"
      : "#c0392b";
  const arrow = isFlat ? "·" : isUp ? "↑" : "↓";
  return (
    <div
      style={{
        marginTop: 4,
        fontSize: 10,
        letterSpacing: 0.4,
        color: tone,
        display: "flex",
        gap: 6,
        alignItems: "baseline",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: 600 }}>
        {arrow} {formatDelta(diff, format)}
        {pct != null && (
          <span style={{ marginLeft: 4, opacity: 0.85 }}>
            ({pct >= 0 ? "+" : ""}
            {pct.toFixed(1)}%)
          </span>
        )}
      </span>
      {priorLabel && (
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          vs {priorLabel}
        </span>
      )}
    </div>
  );
}
