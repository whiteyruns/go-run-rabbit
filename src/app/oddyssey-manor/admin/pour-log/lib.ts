/**
 * Pour Log — data types + filesystem persistence.
 *
 * Storage model: one JSON file per night, keyed by date.
 *   data/oddyssey/pour-log/2026-04-18.json
 *
 * Photos (optional) live alongside:
 *   data/oddyssey/pour-log/photos/2026-04-18_<id>.<ext>
 *
 * This module is server-only. Do not import from client components.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type NightTheme = 'LG' | 'AIM';

export const NIGHT_THEME_LABEL: Record<NightTheme, string> = {
  LG: 'Liquid Gold (Fri)',
  AIM: 'Art in Motion (Sat)',
};

/** Known featured tequila sponsors. Free-text allowed for future rotations. */
export const FEATURED_TEQUILAS = ['El Bandido', 'Telsen'] as const;

/** Known champagne sponsor. Editable for future rotations. */
export const CHAMPAGNE_BRANDS = ['KU'] as const;

export type BottleCount = {
  opened: number;
  leftAtClose: number;
  /** Computed at save: opened - leftAtClose, floored at 0. */
  consumed: number;
};

export type CocktailTally = {
  paloma: number;
  spicyMargarita: number;
  tequilaSoda: number;
};

export type PourLogEntry = {
  id: string;
  date: string;              // YYYY-MM-DD
  nightTheme: NightTheme;
  featuredTequila: string;
  champagne: string;
  tequila: BottleCount;
  champagneBottles: BottleCount;
  cocktails?: CocktailTally;
  notes?: string;
  filedBy?: string;
  filedAt: string;           // ISO timestamp
  photoPath?: string;        // path relative to DATA_ROOT
};

// ─────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────

const DATA_ROOT = path.resolve(process.cwd(), 'data', 'oddyssey', 'pour-log');
const PHOTOS_ROOT = path.join(DATA_ROOT, 'photos');

async function ensureDirs(): Promise<void> {
  await fs.mkdir(PHOTOS_ROOT, { recursive: true });
}

function filePathForDate(date: string): string {
  return path.join(DATA_ROOT, `${date}.json`);
}

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class PourLogValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'PourLogValidationError';
  }
}

function clampBottle(raw: Partial<BottleCount> | undefined): BottleCount {
  const opened = Math.max(0, Number(raw?.opened ?? 0));
  const leftAtClose = Math.max(0, Number(raw?.leftAtClose ?? 0));
  const consumed = Math.max(0, Math.round((opened - leftAtClose) * 10) / 10);
  return { opened, leftAtClose, consumed };
}

function normalizeCocktails(
  raw: Partial<CocktailTally> | undefined,
): CocktailTally | undefined {
  if (!raw) return undefined;
  const paloma = Math.max(0, Math.floor(Number(raw.paloma ?? 0)));
  const spicyMargarita = Math.max(0, Math.floor(Number(raw.spicyMargarita ?? 0)));
  const tequilaSoda = Math.max(0, Math.floor(Number(raw.tequilaSoda ?? 0)));
  if (paloma === 0 && spicyMargarita === 0 && tequilaSoda === 0) return undefined;
  return { paloma, spicyMargarita, tequilaSoda };
}

export type PourLogInput = Omit<
  PourLogEntry,
  'id' | 'filedAt' | 'tequila' | 'champagneBottles' | 'cocktails' | 'photoPath'
> & {
  tequila: Partial<BottleCount>;
  champagneBottles: Partial<BottleCount>;
  cocktails?: Partial<CocktailTally>;
};

export function validateInput(input: PourLogInput): void {
  if (!DATE_RE.test(input.date)) {
    throw new PourLogValidationError('Date must be YYYY-MM-DD', 'date');
  }
  if (input.nightTheme !== 'LG' && input.nightTheme !== 'AIM') {
    throw new PourLogValidationError('Night theme must be LG or AIM', 'nightTheme');
  }
  if (!input.featuredTequila?.trim()) {
    throw new PourLogValidationError('Featured tequila is required', 'featuredTequila');
  }
  if (!input.champagne?.trim()) {
    throw new PourLogValidationError('Champagne is required', 'champagne');
  }
  // Soft sanity: tequila opened should exceed leftAtClose in almost all cases,
  // but we don't error — negative consumed is clamped to 0 above and the GM
  // can re-open and fix if needed.
}

// ─────────────────────────────────────────────────────────────
// Read / write
// ─────────────────────────────────────────────────────────────

export async function saveEntry(
  input: PourLogInput,
  photo?: { data: Buffer; ext: string } | null,
): Promise<PourLogEntry> {
  validateInput(input);
  await ensureDirs();

  // Preserve id on re-submit for the same date (overwrite model).
  const existing = await readEntry(input.date).catch(() => null);
  const id = existing?.id ?? randomUUID();

  let photoPath: string | undefined = existing?.photoPath;
  if (photo && photo.data.length > 0) {
    const safeExt = photo.ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
    const rel = path.join('photos', `${input.date}_${id}.${safeExt}`);
    const abs = path.join(DATA_ROOT, rel);
    await fs.writeFile(abs, photo.data);
    photoPath = rel;
  }

  const entry: PourLogEntry = {
    id,
    date: input.date,
    nightTheme: input.nightTheme,
    featuredTequila: input.featuredTequila.trim(),
    champagne: input.champagne.trim(),
    tequila: clampBottle(input.tequila),
    champagneBottles: clampBottle(input.champagneBottles),
    cocktails: normalizeCocktails(input.cocktails),
    notes: input.notes?.trim() || undefined,
    filedBy: input.filedBy?.trim() || undefined,
    filedAt: new Date().toISOString(),
    photoPath,
  };

  await fs.writeFile(filePathForDate(entry.date), JSON.stringify(entry, null, 2), 'utf8');
  return entry;
}

export async function readEntry(date: string): Promise<PourLogEntry | null> {
  if (!DATE_RE.test(date)) return null;
  try {
    const raw = await fs.readFile(filePathForDate(date), 'utf8');
    return JSON.parse(raw) as PourLogEntry;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * List entries, most-recent first. Reads all files in the data dir and parses.
 * Fine for the foreseeable scale (4 nights/week × years = hundreds of files).
 */
export async function listEntries(limit?: number): Promise<PourLogEntry[]> {
  await ensureDirs();
  const names = await fs.readdir(DATA_ROOT).catch(() => [] as string[]);
  const jsonFiles = names
    .filter((n) => n.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a));

  const slice = typeof limit === 'number' ? jsonFiles.slice(0, limit) : jsonFiles;
  const entries = await Promise.all(
    slice.map(async (name) => {
      const raw = await fs.readFile(path.join(DATA_ROOT, name), 'utf8');
      return JSON.parse(raw) as PourLogEntry;
    }),
  );
  return entries;
}

// ─────────────────────────────────────────────────────────────
// Pure helpers — safe to import from client code if wrapped
// ─────────────────────────────────────────────────────────────

/** Given a date string, return the expected Golden Hour theme (LG on Fri, AIM on Sat). */
export function defaultThemeForDate(date: string): NightTheme | null {
  if (!DATE_RE.test(date)) return null;
  // Parse as local date to avoid UTC shift.
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0 Sun..6 Sat
  if (dow === 5) return 'LG';
  if (dow === 6) return 'AIM';
  return null;
}

/** Pairing default: Friday Liquid Gold → El Bandido, Saturday Art in Motion → Telsen. */
export function defaultTequilaForTheme(theme: NightTheme): string {
  return theme === 'LG' ? 'El Bandido' : 'Telsen';
}

/** 750ml bottle @ 1.5oz pour = 16.9 pours/bottle. Round to whole pours. */
export function tequilaPoursFromBottles(bottles: number): number {
  return Math.round(bottles * (750 / 29.5735) / 1.5);
}

/** 750ml bottle @ 2oz pour = 12.68 pours/bottle. */
export function champagnePoursFromBottles(bottles: number): number {
  return Math.round(bottles * (750 / 29.5735) / 2);
}
