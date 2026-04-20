import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Mutex } from "async-mutex";
import {
  CrewFileSchema,
  type CrewRecord,
  type RegistrationInput,
} from "./schema";

export interface CrewStorage {
  readAllCrew: () => Promise<CrewRecord[]>;
  upsertCrew: (
    input: RegistrationInput,
  ) => Promise<{ record: CrewRecord; created: boolean }>;
  removeCrew: (id: string) => Promise<boolean>;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export function createCrewStorage(dataDir: string): CrewStorage {
  const crewPath = path.join(dataDir, "crew.json");
  const seedPath = path.join(dataDir, "seed.json");
  const mutex = new Mutex();

  async function ensureCrewFile(): Promise<void> {
    if (await fileExists(crewPath)) return;
    await fs.mkdir(dataDir, { recursive: true });
    if (await fileExists(seedPath)) {
      const seed = await fs.readFile(seedPath, "utf8");
      await fs.writeFile(crewPath, seed, "utf8");
    } else {
      await fs.writeFile(
        crewPath,
        `${JSON.stringify({ crew: [] }, null, 2)}\n`,
        "utf8",
      );
    }
  }

  async function readUnlocked(): Promise<CrewRecord[]> {
    await ensureCrewFile();
    const raw = await fs.readFile(crewPath, "utf8");
    const parsed = CrewFileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Invalid crew.json: ${parsed.error.message}`);
    }
    return parsed.data.crew;
  }

  async function writeAtomic(crew: CrewRecord[]): Promise<void> {
    await fs.mkdir(dataDir, { recursive: true });
    const tmp = `${crewPath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify({ crew }, null, 2)}\n`, "utf8");
    await fs.rename(tmp, crewPath);
  }

  return {
    readAllCrew: () => mutex.runExclusive(readUnlocked),

    upsertCrew: (input) =>
      mutex.runExclusive(async () => {
        const crew = await readUnlocked();
        const now = new Date().toISOString();
        const email = input.email.trim().toLowerCase();
        const idx = crew.findIndex((c) => c.email === email);

        if (idx >= 0) {
          const existing = crew[idx];
          const updated: CrewRecord = {
            ...existing,
            ...input,
            email,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: now,
          };
          crew[idx] = updated;
          await writeAtomic(crew);
          return { record: updated, created: false };
        }

        const record: CrewRecord = {
          ...input,
          email,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        crew.push(record);
        await writeAtomic(crew);
        return { record, created: true };
      }),

    removeCrew: (id) =>
      mutex.runExclusive(async () => {
        const crew = await readUnlocked();
        const next = crew.filter((c) => c.id !== id);
        if (next.length === crew.length) return false;
        await writeAtomic(next);
        return true;
      }),
  };
}

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data", "forest-house");
const defaultStorage = createCrewStorage(DEFAULT_DATA_DIR);

export const readAllCrew = defaultStorage.readAllCrew;
export const upsertCrew = defaultStorage.upsertCrew;
export const removeCrew = defaultStorage.removeCrew;
