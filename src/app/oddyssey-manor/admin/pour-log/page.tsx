import type { Metadata } from 'next';
import Link from 'next/link';
import PourLogForm, { type PourLogDefaults } from './PourLogForm';
import { defaultThemeForDate, defaultTequilaForTheme, readEntry } from './lib';
import styles from './pour-log.module.css';

export const metadata: Metadata = {
  title: 'Pour Log · Oddyssey',
  description: 'Golden Hour pour log capture.',
};

// Always render fresh — we want the latest saved entry reflected.
export const dynamic = 'force-dynamic';

function todayInLasVegas(): string {
  // America/Los_Angeles covers Las Vegas year-round.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function PourLogPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const dateParam = searchParams?.date;
  const targetDate = dateParam && DATE_RE.test(dateParam) ? dateParam : todayInLasVegas();
  const theme = defaultThemeForDate(targetDate) ?? 'LG';
  const existing = await readEntry(targetDate);

  const defaults: PourLogDefaults = {
    date: targetDate,
    nightTheme: existing?.nightTheme ?? theme,
    featuredTequila: existing?.featuredTequila ?? defaultTequilaForTheme(theme),
    champagne: existing?.champagne ?? 'KU',
    filedBy: existing?.filedBy ?? '',
    tequilaOpened: existing ? String(existing.tequila.opened) : undefined,
    tequilaLeftAtClose: existing ? String(existing.tequila.leftAtClose) : undefined,
    champagneOpened: existing ? String(existing.champagneBottles.opened) : undefined,
    champagneLeftAtClose: existing ? String(existing.champagneBottles.leftAtClose) : undefined,
    cocktails: existing?.cocktails,
    notes: existing?.notes,
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/oddyssey-manor/admin">← Admin</Link>
          <Link href="/oddyssey-manor/admin/pour-log/entries">Past entries →</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Golden Hour · Pour Log</div>
          <h1 className={styles.title}>
            Log tonight&apos;s <em>pours.</em>
          </h1>
          <p className={styles.sub}>
            Three quick groups, one submit. Bottle counts drive the sponsor recap.
          </p>
        </header>

        {existing && (
          <div className={styles.status} role="status">
            Existing entry found for <strong>{targetDate}</strong>. Edits below will overwrite it.
          </div>
        )}

        <PourLogForm defaults={defaults} />

        <div className={styles.notes}>
          <div className={styles.noteLabel}>Where this goes</div>
          Submissions write to <strong>data/oddyssey/pour-log/{`{date}`}.json</strong> on the server and
          feed the Sponsor Recap view. Photos (optional) land under
          <strong> data/oddyssey/pour-log/photos/</strong>. Drafts autosave to this device until submit.
        </div>
      </div>
    </main>
  );
}
