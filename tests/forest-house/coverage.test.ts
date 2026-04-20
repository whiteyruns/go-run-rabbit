import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  computeRoleCoverage,
  computeDayCoverage,
  filterCrew,
  totalRoleGaps,
  totalDayGaps,
} from "@/lib/forest-house/coverage";
import { createCrewStorage } from "@/lib/forest-house/storage";
import { crewToCsv, escapeCsvField } from "@/lib/forest-house/csv";
import type { CrewRecord } from "@/lib/forest-house/schema";
import type { RegistrationInput } from "@/lib/forest-house/schema";
import {
  ROLE_TARGETS,
  DAY_TARGET,
  type DeployDate,
} from "@/lib/forest-house/constants";

function makeCrew(overrides: Partial<CrewRecord>): CrewRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? "Test Person",
    email: overrides.email ?? "test@example.org",
    phone: overrides.phone ?? "+1 702 555 0100",
    roles: overrides.roles ?? ["support"],
    preferredRole: overrides.preferredRole ?? "support",
    backupRole: overrides.backupRole,
    availability: overrides.availability ?? ["2026-05-12"],
    buildCrew: overrides.buildCrew ?? false,
    strikeCrew: overrides.strikeCrew ?? false,
    paradeCrew: overrides.paradeCrew ?? false,
    skills: overrides.skills ?? [],
    critical: overrides.critical ?? false,
    notes: overrides.notes,
    createdAt: overrides.createdAt ?? "2026-04-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-01T00:00:00.000Z",
  };
}

describe("computeRoleCoverage", () => {
  it("counts only preferredRole; backup and secondary roles do not count", () => {
    const crew: CrewRecord[] = [
      makeCrew({
        email: "a@x.org",
        roles: ["support", "lighting"],
        preferredRole: "support",
        backupRole: "lighting",
      }),
      makeCrew({
        email: "b@x.org",
        roles: ["support", "lighting"],
        preferredRole: "lighting",
        backupRole: "support",
      }),
      makeCrew({
        email: "c@x.org",
        roles: ["driver", "support"],
        preferredRole: "driver",
      }),
    ];
    const coverage = computeRoleCoverage(crew);
    const support = coverage.find((r) => r.role === "support");
    const lighting = coverage.find((r) => r.role === "lighting");
    const driver = coverage.find((r) => r.role === "driver");
    expect(support?.assigned).toBe(1);
    expect(lighting?.assigned).toBe(1);
    expect(driver?.assigned).toBe(1);
  });

  it("reflects ROLE_TARGETS: bumping lighting target to 99 yields gap of 99 - assigned", () => {
    const crew: CrewRecord[] = [
      makeCrew({ email: "a@x.org", preferredRole: "lighting" }),
      makeCrew({ email: "b@x.org", preferredRole: "lighting" }),
    ];
    const original = ROLE_TARGETS.lighting;
    ROLE_TARGETS.lighting = 99;
    try {
      const coverage = computeRoleCoverage(crew);
      const lighting = coverage.find((r) => r.role === "lighting");
      expect(lighting?.assigned).toBe(2);
      expect(lighting?.target).toBe(99);
      expect(lighting?.gap).toBe(97);
    } finally {
      ROLE_TARGETS.lighting = original;
    }
  });
});

describe("computeDayCoverage", () => {
  it("counts crew whose availability includes the date", () => {
    const d1: DeployDate = "2026-05-12";
    const d2: DeployDate = "2026-05-13";
    const crew: CrewRecord[] = [
      makeCrew({ email: "a@x.org", availability: [d1] }),
      makeCrew({ email: "b@x.org", availability: [d1, d2] }),
      makeCrew({ email: "c@x.org", availability: [d2] }),
    ];
    const coverage = computeDayCoverage(crew);
    const day12 = coverage.find((d) => d.date === d1);
    const day13 = coverage.find((d) => d.date === d2);
    expect(day12?.available).toBe(2);
    expect(day13?.available).toBe(2);
    expect(day12?.gap).toBe(Math.max(0, DAY_TARGET - 2));
  });

  it("lists the preferred roles present each day", () => {
    const d: DeployDate = "2026-05-14";
    const crew: CrewRecord[] = [
      makeCrew({
        email: "a@x.org",
        preferredRole: "support",
        availability: [d],
      }),
      makeCrew({
        email: "b@x.org",
        preferredRole: "lighting",
        availability: [d],
      }),
    ];
    const coverage = computeDayCoverage(crew);
    const day = coverage.find((x) => x.date === d);
    expect(day?.roles).toEqual(["lighting", "support"]);
  });
});

describe("filterCrew", () => {
  const crew: CrewRecord[] = [
    makeCrew({
      email: "support-mon@x.org",
      preferredRole: "support",
      availability: ["2026-05-12"],
    }),
    makeCrew({
      email: "support-tue@x.org",
      preferredRole: "support",
      availability: ["2026-05-13"],
    }),
    makeCrew({
      email: "lighting-mon@x.org",
      preferredRole: "lighting",
      availability: ["2026-05-12"],
    }),
  ];

  it("AND-combines role and day filters", () => {
    expect(filterCrew(crew, { role: "all", day: "all" })).toHaveLength(3);
    expect(filterCrew(crew, { role: "support", day: "all" })).toHaveLength(2);
    expect(
      filterCrew(crew, { role: "all", day: "2026-05-12" }),
    ).toHaveLength(2);
    const supportOnMon = filterCrew(crew, {
      role: "support",
      day: "2026-05-12",
    });
    expect(supportOnMon).toHaveLength(1);
    expect(supportOnMon[0]?.email).toBe("support-mon@x.org");
  });
});

describe("totals", () => {
  it("sum role and day gaps", () => {
    const crew: CrewRecord[] = [];
    expect(totalRoleGaps(computeRoleCoverage(crew))).toBeGreaterThan(0);
    expect(totalDayGaps(computeDayCoverage(crew))).toBeGreaterThan(0);
  });
});

describe("CSV export", () => {
  it("escapes fields containing commas, quotes, and newlines per RFC 4180", () => {
    expect(escapeCsvField("plain")).toBe("plain");
    expect(escapeCsvField("a, b")).toBe('"a, b"');
    expect(escapeCsvField('a, "b"')).toBe('"a, ""b"""');
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvField(["x", "y"])).toBe("x; y");
    expect(escapeCsvField(true)).toBe("true");
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("round-trips a field containing a, \"b\" through crewToCsv", () => {
    const crew: CrewRecord[] = [
      makeCrew({ email: "commas@x.org", notes: 'a, "b"' }),
    ];
    const csv = crewToCsv(crew);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("notes");
    expect(lines[1]).toContain('"a, ""b"""');
    const parsed = parseCsvRow(lines[1] ?? "");
    const headers = parseCsvRow(lines[0] ?? "");
    const notesIdx = headers.indexOf("notes");
    expect(parsed[notesIdx]).toBe('a, "b"');
  });

  it("uses \\r\\n line endings", () => {
    const csv = crewToCsv([makeCrew({ email: "le@x.org" })]);
    expect(csv.includes("\r\n")).toBe(true);
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

describe("upsertCrew", () => {
  let tmpDir: string;
  let storage: ReturnType<typeof createCrewStorage>;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "fh-storage-"));
    storage = createCrewStorage(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const input: RegistrationInput = {
    name: "Upsert Test",
    email: "upsert@example.org",
    phone: "+1 555 0000",
    roles: ["support"],
    preferredRole: "support",
    availability: ["2026-05-12"],
    buildCrew: false,
    strikeCrew: false,
    paradeCrew: false,
    skills: [],
    critical: false,
  };

  it("called twice with the same email keeps the list length constant", async () => {
    const first = await storage.upsertCrew(input);
    expect(first.created).toBe(true);

    const second = await storage.upsertCrew({
      ...input,
      name: "Upsert Test (Updated)",
      phone: "+1 555 9999",
    });
    expect(second.created).toBe(false);
    expect(second.record.id).toBe(first.record.id);
    expect(second.record.createdAt).toBe(first.record.createdAt);
    expect(second.record.name).toBe("Upsert Test (Updated)");
    expect(second.record.phone).toBe("+1 555 9999");

    const all = await storage.readAllCrew();
    expect(all).toHaveLength(1);
  });

  it("normalizes email to lowercase for dedup", async () => {
    await storage.upsertCrew({ ...input, email: "Mixed@Example.ORG" });
    const dup = await storage.upsertCrew({
      ...input,
      email: "mixed@example.org",
    });
    expect(dup.created).toBe(false);
    const all = await storage.readAllCrew();
    expect(all).toHaveLength(1);
    expect(all[0]?.email).toBe("mixed@example.org");
  });
});
