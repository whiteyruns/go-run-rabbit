/**
 * Weekend Recap — Monday 8 AM reminder job.
 *
 * What it does:
 *   1. Compute this weekend's Friday anchor using the server's current clock
 *      (America/Los_Angeles is the operating TZ; the rest of the admin uses it).
 *   2. If the weekend file is already on disk, no-op (skip-if-uploaded).
 *   3. Otherwise, send an email to WEEKEND_RECAP_RECIPIENTS (default Keith) via
 *      Resend with a link to /oddyssey-manor/admin/weekend-recap/upload.
 *
 * How Console wires this in (existing repo uses instrumentation.ts for cron):
 *   ```ts
 *   // instrumentation.ts
 *   import { registerCron } from '@/lib/cron'; // or whatever helper exists
 *   import { runMondayReminder } from '@/app/oddyssey-manor/admin/weekend-recap/reminder';
 *
 *   export async function register() {
 *     registerCron('0 8 * * 1', runMondayReminder, { tz: 'America/Los_Angeles' });
 *   }
 *   ```
 *
 *   Or — if the repo prefers an HTTP-triggered cron — expose this from an
 *   /api/cron/weekend-recap-reminder route guarded by the existing CRON_SECRET
 *   and have an upstream scheduler (Cloudflare Cron, GitHub Actions, etc.) POST
 *   to it every Monday at 8 AM PT.
 *
 * Environment variables (all optional except RESEND_API_KEY):
 *   RESEND_API_KEY                  existing key used by Sponsor Recap
 *   WEEKEND_RECAP_FROM              default: "Oddyssey <keith@gorunrabbit.com>"
 *   WEEKEND_RECAP_RECIPIENTS        default: "keith@gorunrabbit.com"
 *   WEEKEND_RECAP_BASE_URL          default: "https://gorunrabbit.com"
 *   WEEKEND_RECAP_FORCE             if "1", send even when file exists (debug)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  formatWeekendLabel,
  mostRecentWeekend,
  weekendHasUpload,
} from './lib';

export interface ReminderResult {
  ran: boolean;               // true = we attempted a send
  sent: boolean;              // true = Resend accepted the message
  skippedReason?: string;     // why we didn't send
  fridayAnchor: string;
  resendId?: string;
  to?: string[];
  error?: string;
}

const LOG_DIR = path.resolve(
  process.cwd(),
  'data',
  'oddyssey',
  'weekend-recap',
  'reminders',
);

/**
 * Entrypoint. Idempotent: calling multiple times on the same Monday is safe —
 * after the GM uploads the weekend file, subsequent runs skip.
 */
export async function runMondayReminder(
  now: Date = new Date(),
): Promise<ReminderResult> {
  const { friday } = mostRecentWeekend(now);
  const force = process.env.WEEKEND_RECAP_FORCE === '1';

  if (!force) {
    const uploaded = await weekendHasUpload(friday);
    if (uploaded) {
      return {
        ran: true,
        sent: false,
        skippedReason: 'Weekend file already uploaded.',
        fridayAnchor: friday,
      };
    }
    // Also skip if we already sent a reminder for this weekend today.
    if (await reminderAlreadySentToday(friday, now)) {
      return {
        ran: true,
        sent: false,
        skippedReason: 'Reminder already sent today for this weekend.',
        fridayAnchor: friday,
      };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ran: true,
      sent: false,
      fridayAnchor: friday,
      error: 'RESEND_API_KEY not set on server.',
    };
  }

  const from = process.env.WEEKEND_RECAP_FROM || 'Oddyssey <keith@gorunrabbit.com>';
  const recipients = (process.env.WEEKEND_RECAP_RECIPIENTS || 'keith@gorunrabbit.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const baseUrl = (process.env.WEEKEND_RECAP_BASE_URL || 'https://gorunrabbit.com').replace(/\/$/, '');
  const uploadUrl = `${baseUrl}/oddyssey-manor/admin/weekend-recap/upload`;

  const subject = `Monday scrum — upload this weekend's workbooks (${friday})`;
  const label = formatWeekendLabel(friday);
  const html = reminderHtml({ label, uploadUrl });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ran: true,
        sent: false,
        fridayAnchor: friday,
        error: `Resend ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    const data = (await res.json()) as { id?: string };

    await logReminder({
      fridayAnchor: friday,
      sentAt: now.toISOString(),
      to: recipients,
      resendId: data.id ?? null,
    });

    return {
      ran: true,
      sent: true,
      fridayAnchor: friday,
      resendId: data.id,
      to: recipients,
    };
  } catch (err) {
    return {
      ran: true,
      sent: false,
      fridayAnchor: friday,
      error: (err as Error).message,
    };
  }
}

// ─── Body HTML ─────────────────────────────────────────────────────────────

function reminderHtml({ label, uploadUrl }: { label: string; uploadUrl: string }): string {
  // Intentionally low-fi — matches the Oddyssey admin aesthetic without
  // shipping the full Cormorant/Inter stack inside an email body.
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#060606;color:#e8e4dd;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;margin:32px auto;padding:28px 32px;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-top:2px solid #c9a84c;">
      <tr><td>
        <div style="font-family:Consolas,monospace;font-size:10.5px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;">
          Monday Scrum · Weekend Recap
        </div>
        <div style="font-size:26px;line-height:1.2;color:#e8e4dd;margin-bottom:14px;">
          Upload this weekend's <em style="color:#c9a84c;">workbooks.</em>
        </div>
        <div style="font-size:15px;line-height:1.55;color:#9a958d;margin-bottom:22px;font-style:italic;">
          ${label}
        </div>
        <div style="font-size:14px;line-height:1.6;color:#e8e4dd;margin-bottom:22px;">
          Drop <code style="font-family:Consolas,monospace;color:#c9a84c;">MANOR P&amp;L.xlsx</code> and
          <code style="font-family:Consolas,monospace;color:#c9a84c;">NOIR Budgets &amp; Reports.xlsx</code>
          so the Monday scrum view refreshes.
        </div>
        <a href="${uploadUrl}"
           style="display:inline-block;padding:14px 26px;background:#c9a84c;color:#060606;text-decoration:none;font-family:Arial,sans-serif;font-weight:600;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">
          Upload xlsx →
        </a>
        <div style="margin-top:26px;font-size:11.5px;color:#5a5650;font-family:Arial,sans-serif;">
          You'll stop getting this once the upload is recorded for ${label}.
          Re-uploading is safe — it overwrites cleanly.
        </div>
      </td></tr>
    </table>
  </body>
</html>`;
}

// ─── Log bookkeeping ───────────────────────────────────────────────────────

interface ReminderLogEntry {
  fridayAnchor: string;
  sentAt: string;
  to: string[];
  resendId: string | null;
}

async function logReminder(entry: ReminderLogEntry): Promise<void> {
  await fs.mkdir(LOG_DIR, { recursive: true });
  const filename = `${entry.sentAt.slice(0, 10)}_${entry.fridayAnchor}.json`;
  await fs.writeFile(path.join(LOG_DIR, filename), JSON.stringify(entry, null, 2), 'utf8');
}

async function reminderAlreadySentToday(friday: string, now: Date): Promise<boolean> {
  try {
    const files = await fs.readdir(LOG_DIR);
    const today = now.toISOString().slice(0, 10);
    return files.some((f) => f.startsWith(today) && f.includes(friday));
  } catch {
    return false;
  }
}
