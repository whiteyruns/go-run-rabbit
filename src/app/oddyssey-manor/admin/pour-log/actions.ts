'use server';

/**
 * Server actions for the Pour Log form.
 *
 * Submission flow:
 *   1. Client posts FormData (multipart, may include a photo file)
 *   2. We parse, validate, save to disk
 *   3. Return a typed result the client uses to show success/error
 *   4. revalidatePath() so the entries list re-fetches
 */

import { revalidatePath } from 'next/cache';
import {
  saveEntry,
  PourLogValidationError,
  type NightTheme,
  type PourLogEntry,
} from './lib';

export type SubmitResult =
  | { ok: true; entry: PourLogEntry }
  | { ok: false; error: string; field?: string };

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  if (raw === null || raw === '') return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function str(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === 'string' ? raw : '';
}

export async function submitPourLog(formData: FormData): Promise<SubmitResult> {
  try {
    const date = str(formData, 'date');
    const themeRaw = str(formData, 'nightTheme');
    if (themeRaw !== 'LG' && themeRaw !== 'AIM') {
      return { ok: false, error: 'Night theme must be LG or AIM', field: 'nightTheme' };
    }
    const nightTheme = themeRaw as NightTheme;

    // Photo (optional)
    let photo: { data: Buffer; ext: string } | null = null;
    const photoField = formData.get('photo');
    if (photoField && typeof photoField !== 'string' && photoField.size > 0) {
      const file = photoField as File;
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const buf = Buffer.from(await file.arrayBuffer());
      photo = { data: buf, ext };
    }

    const entry = await saveEntry(
      {
        date,
        nightTheme,
        featuredTequila: str(formData, 'featuredTequila'),
        champagne: str(formData, 'champagne'),
        tequila: {
          opened: num(formData, 'tequilaOpened'),
          leftAtClose: num(formData, 'tequilaLeftAtClose'),
        },
        champagneBottles: {
          opened: num(formData, 'champagneOpened'),
          leftAtClose: num(formData, 'champagneLeftAtClose'),
        },
        cocktails: {
          paloma: num(formData, 'cocktailPaloma'),
          spicyMargarita: num(formData, 'cocktailSpicyMargarita'),
          tequilaSoda: num(formData, 'cocktailTequilaSoda'),
        },
        notes: str(formData, 'notes'),
        filedBy: str(formData, 'filedBy'),
      },
      photo,
    );

    revalidatePath('/oddyssey-manor/admin/pour-log/entries');
    revalidatePath('/oddyssey-manor/admin/pour-log');

    return { ok: true, entry };
  } catch (err) {
    if (err instanceof PourLogValidationError) {
      return { ok: false, error: err.message, field: err.field };
    }
    console.error('[pour-log] submit failed', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error saving pour log',
    };
  }
}
