'use server';

/**
 * Sponsor Recap — server actions.
 *
 * sendRecap(formData) — generates the email from live Pour Log data, sends
 * through Resend to the internal distribution list (GM + Tim), writes a
 * small JSON log of what went out so we can audit later.
 *
 * Recipients and sender identity are driven by env vars so Console can
 * configure without touching code:
 *
 *   SPONSOR_RECAP_FROM         e.g. "Oddyssey <keith@gorunrabbit.com>"
 *   SPONSOR_RECAP_RECIPIENTS   comma-separated, e.g. "gm@area15.com,tim@area15.com"
 *   RESEND_API_KEY             existing key already used by the repo
 *
 * If any env var is missing the action returns a structured error instead
 * of throwing — the UI surfaces it verbatim so Console can diagnose.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { recapForBrand, isValidDate, type SponsorKind } from './lib';
import { renderSponsorRecap } from './email-template';

type SendResult =
  | { ok: true; to: string[]; subject: string; id?: string }
  | { ok: false; error: string };

const SENT_LOG_DIR = path.resolve(
  process.cwd(),
  'data',
  'oddyssey',
  'sponsor-recap',
  'sent',
);

export async function sendRecap(formData: FormData): Promise<SendResult> {
  const brand = String(formData.get('brand') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim() as SponsorKind;
  const from = String(formData.get('from') ?? '').trim();
  const to = String(formData.get('to') ?? '').trim();

  if (!brand) return { ok: false, error: 'Missing brand.' };
  if (kind !== 'tequila' && kind !== 'champagne') {
    return { ok: false, error: `Invalid sponsor kind "${kind}".` };
  }
  if (!isValidDate(from) || !isValidDate(to) || from > to) {
    return { ok: false, error: 'Invalid date range.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SPONSOR_RECAP_FROM;
  const recipientsRaw = process.env.SPONSOR_RECAP_RECIPIENTS;

  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not set on server.' };
  if (!fromAddress) {
    return {
      ok: false,
      error: 'SPONSOR_RECAP_FROM not set. Example: "Oddyssey <keith@gorunrabbit.com>".',
    };
  }
  if (!recipientsRaw) {
    return {
      ok: false,
      error:
        'SPONSOR_RECAP_RECIPIENTS not set. Comma-separated list of internal recipients (GM + Tim).',
    };
  }

  const recipients = recipientsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, error: 'SPONSOR_RECAP_RECIPIENTS has no valid addresses.' };
  }

  // Rebuild the recap from live Pour Log data — do NOT trust form body
  // for the numbers, only for the slice (brand/kind/range).
  const recap = await recapForBrand({ brand, kind, rangeStart: from, rangeEnd: to });
  if (recap.nights.length === 0) {
    return {
      ok: false,
      error: `No activations for ${brand} between ${from} and ${to}. Nothing to send.`,
    };
  }

  const email = renderSponsorRecap(recap);

  // Call Resend HTTP API directly — avoids adding a dep if the repo's
  // existing usage already imports the SDK. Resend's REST endpoint is stable.
  let resendId: string | undefined;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend responded ${res.status}: ${body.slice(0, 400)}` };
    }
    const json: unknown = await res.json().catch(() => null);
    if (json && typeof json === 'object' && 'id' in json) {
      resendId = String((json as { id: unknown }).id);
    }
  } catch (err) {
    return {
      ok: false,
      error: `Resend send failed: ${(err as Error).message ?? String(err)}`,
    };
  }

  // Append to sent-log (best-effort — don't fail the send if log write fails).
  try {
    await fs.mkdir(SENT_LOG_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = `${kind}-${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const logPath = path.join(SENT_LOG_DIR, `${stamp}_${slug}.json`);
    await fs.writeFile(
      logPath,
      JSON.stringify(
        {
          sentAt: new Date().toISOString(),
          brand,
          kind,
          rangeStart: from,
          rangeEnd: to,
          recipients,
          fromAddress,
          subject: email.subject,
          resendId: resendId ?? null,
          totals: recap.totals,
        },
        null,
        2,
      ),
      'utf8',
    );
  } catch {
    // swallow — send succeeded, log is secondary
  }

  revalidatePath('/oddyssey-manor/admin/sponsor-recap');
  revalidatePath(`/oddyssey-manor/admin/sponsor-recap/draft`);

  return { ok: true, to: recipients, subject: email.subject, id: resendId };
}
