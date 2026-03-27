// ============================================================================
// CSV parsing utilities
// ============================================================================

/** A single parsed CSV row — keys are header names, values are trimmed strings */
export type CSVRow = Record<string, string>;

/**
 * Parse a full CSV string (with header row) into an array of objects.
 * Each object is keyed by the header column names.
 */
export function parseCSV(text: string): CSVRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const obj: CSVRow = {};
    headers.forEach((h, i) => (obj[h.trim()] = vals[i]?.trim() || ""));
    return obj;
  });
}

/**
 * Parse a single CSV line, handling quoted fields that may contain commas.
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}
