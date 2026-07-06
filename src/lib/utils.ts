// ============================================================================
// Formatting utilities and color constants for CBM Dashboard
// ============================================================================

/** Chart color palette — Technical Vitality neon system */
export const COLORS = [
  "#aea2ff", // violet
  "#00eefc", // cyan
  "#ff6b98", // pink
  "#7157ff", // violet-dim
  "#00deec", // cyan-dim
  "#e4006c", // pink-dim
  "#9282ff", // primary-fixed-dim
  "#ff8eac", // tertiary-fixed
] as const;

/** Status badge colors keyed by sponsorship status */
export const STATUS_COLORS: Record<string, string> = {
  "high-potential": "#00eefc",
  "underserved": "#aea2ff",
  "untapped": "#ff6b98",
  "emerging": "#7157ff",
};

/**
 * Format a number as a compact dollar string.
 * - >= 1M  -> "$1.2M"
 * - >= 1K  -> "$42K"
 * - else   -> "$123"
 */
export const fmt = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

/**
 * Format a number with thousand separators. Locale is pinned to en-US so the
 * server (Node) and browser render identical text — a bare toLocaleString()
 * uses each runtime's default locale and triggers React hydration mismatches.
 */
export const fmtNum = (n: number): string => n.toLocaleString("en-US");
