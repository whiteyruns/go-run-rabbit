import type { InclusionRow } from "./types";

// RFC 4180-aware CSV split: respects quoted fields with embedded commas/quotes.
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

export interface ParseResult {
  rows: InclusionRow[];
  warnings: string[];
}

const REQUIRED_HEADERS = [
  "session_time",
  "ticket_group_name",
  "ticket_type_name",
  "admit_email",
  "scan_code",
];

export function parseCSV(text: string): ParseResult {
  const warnings: string[] = [];
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], warnings: ["File contains no data rows."] };
  }

  const headers = splitLine(lines[0]).map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    warnings.push(
      `CSV is missing required columns: ${missing.join(", ")}. Parsed what we could.`
    );
  }

  const rows: InclusionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.every((c) => c.trim() === "")) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });

    rows.push({
      event_name: row.event_name ?? "",
      session_time: row.session_time ?? "",
      identity_name: row.identity_name ?? "",
      identity_email: row.identity_email ?? "",
      ticket_group_name: row.ticket_group_name ?? "",
      ticket_type_name: row.ticket_type_name ?? "",
      admit_name: row.admit_name ?? row.identity_name ?? "",
      admit_email: row.admit_email ?? row.identity_email ?? "",
      scan_code: row.scan_code ?? "",
      ticket_state: row.ticket_state ?? "",
      identity_customer_note: row.identity_customer_note ?? "",
      identity_customer_note_two: row.identity_customer_note_two ?? "",
    });
  }

  return { rows, warnings };
}
