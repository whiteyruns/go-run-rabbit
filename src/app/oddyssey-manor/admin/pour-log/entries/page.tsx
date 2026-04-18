import type { Metadata } from 'next';
import Link from 'next/link';
import { listEntries, NIGHT_THEME_LABEL } from '../lib';
import styles from '../pour-log.module.css';

export const metadata: Metadata = {
  title: 'Pour Log · Entries · Oddyssey',
};

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  // iso is YYYY-MM-DD; format as "Fri Apr 17"
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function EntriesPage() {
  const entries = await listEntries(60);

  return (
    <main className={styles.page}>
      <div className={styles.container} style={{ maxWidth: 920 }}>
        <div className={styles.navRow}>
          <Link href="/oddyssey-manor/admin/pour-log">← New entry</Link>
          <Link href="/oddyssey-manor/admin">Admin home →</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Golden Hour · Past Entries</div>
          <h1 className={styles.title}>
            Pour Log <em>history.</em>
          </h1>
          <p className={styles.sub}>
            Most recent first. Tap a date to edit that night.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className={`${styles.section} ${styles.emptyState}`}>
            No pour logs yet. Submit one from the form to populate this view.
          </div>
        ) : (
          <div className={styles.section}>
            <table className={styles.entriesTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Theme</th>
                  <th>Sponsor</th>
                  <th className="num">Tequila btl</th>
                  <th className="num">Champagne btl</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className={e.nightTheme === 'LG' ? styles.themeLg : styles.themeAim}>
                    <td>
                      <Link href={`/oddyssey-manor/admin/pour-log?date=${e.date}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {formatDate(e.date)}
                      </Link>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${e.nightTheme === 'LG' ? styles.lg : styles.aim}`}>
                        {NIGHT_THEME_LABEL[e.nightTheme]}
                      </span>
                    </td>
                    <td>{e.featuredTequila} · {e.champagne}</td>
                    <td className="num">{e.tequila.consumed.toFixed(1)}</td>
                    <td className="num">{e.champagneBottles.consumed.toFixed(1)}</td>
                    <td>{e.filedBy ? `${e.filedBy} · ${formatTime(e.filedAt)}` : formatTime(e.filedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.notes}>
          <div className={styles.noteLabel}>Read-only for now</div>
          The edit link reuses the form with that date prefilled (overwrite save). Future enhancement:
          inline edit + per-row sponsor recap link.
        </div>
      </div>
    </main>
  );
}
