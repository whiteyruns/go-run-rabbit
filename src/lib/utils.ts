// ============================================================================
// Formatting utilities and color constants for CBM Dashboard
// ============================================================================

/** Chart color palette */
export const COLORS = [
  "#C49A6C",
  "#D4AA7C",
  "#E8C9A0",
  "#8B7355",
  "#A0522D",
  "#CD853F",
  "#DEB887",
  "#F5DEB3",
] as const;

/** Status badge colors keyed by sponsorship status */
export const STATUS_COLORS: Record<string, string> = {
  "high-potential": "#22c55e",
  "underserved": "#eab308",
  "untapped": "#ef4444",
  "emerging": "#3b82f6",
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

/** Format a number with locale-aware thousand separators */
export const fmtNum = (n: number): string => n.toLocaleString();
