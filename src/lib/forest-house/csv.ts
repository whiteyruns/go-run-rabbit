import type { CrewRecord } from "./schema";

export const CSV_COLUMNS: ReadonlyArray<{
  key: keyof CrewRecord;
  label: string;
}> = [
  { key: "id", label: "id" },
  { key: "createdAt", label: "createdAt" },
  { key: "updatedAt", label: "updatedAt" },
  { key: "name", label: "name" },
  { key: "email", label: "email" },
  { key: "phone", label: "phone" },
  { key: "preferredRole", label: "preferredRole" },
  { key: "backupRole", label: "backupRole" },
  { key: "roles", label: "roles" },
  { key: "availability", label: "availability" },
  { key: "buildCrew", label: "buildCrew" },
  { key: "strikeCrew", label: "strikeCrew" },
  { key: "cincoDeMayo", label: "cincoDeMayo" },
  { key: "edcParade", label: "edcParade" },
  { key: "edcFestival", label: "edcFestival" },
  { key: "skills", label: "skills" },
  { key: "critical", label: "critical" },
  { key: "notes", label: "notes" },
];

export function escapeCsvField(value: unknown): string {
  if (value === undefined || value === null) return "";
  const str = Array.isArray(value)
    ? value.join("; ")
    : typeof value === "boolean"
      ? value
        ? "true"
        : "false"
      : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function crewToCsv(crew: CrewRecord[]): string {
  const header = CSV_COLUMNS.map((c) => escapeCsvField(c.label)).join(",");
  const rows = crew.map((r) =>
    CSV_COLUMNS.map((c) => escapeCsvField(r[c.key])).join(","),
  );
  return [header, ...rows].join("\r\n") + "\r\n";
}
