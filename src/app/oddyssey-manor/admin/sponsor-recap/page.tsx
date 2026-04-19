import type { Metadata } from 'next';
import Link from 'next/link';
import {
  brandActivationsInRange,
  formatRangeLabel,
  isValidDate,
  sponsorWeekContaining,
} from './lib';
import styles from './sponsor-recap.module.css';

export const metadata: Metadata = {
  title: 'Sponsor Recap · Oddyssey',
  description: 'Weekly partner recap drafts from the pour log.',
};

export const dynamic = 'force-dynamic';

function todayInLasVegas(): string {
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

/**
 * Previous and next Friday anchors from a given week start.
 * Friday-to-Thursday weeks — shift by 7 days.
 */
function shiftWeek(start: string, days: number): string {
  const [y, m, d] = start.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export default async function SponsorRecapIndexPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const weekAnchor =
    searchParams?.week && isValidDate(searchParams.week)
      ? searchParams.week
      : todayInLasVegas();
  const { start, end } = sponsorWeekContaining(weekAnchor);
  const rangeLabel = formatRangeLabel(start, end);

  const activations = await brandActivationsInRange(start, end);

  const prevWeek = shiftWeek(start, -7);
  const nextWeek = shiftWeek(start, 7);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/oddyssey-manor/admin">← Admin</Link>
          <Link href="/oddyssey-manor/admin/pour-log/entries">Pour log entries →</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Golden Hour · Sponsor Recap</div>
          <h1 className={styles.title}>
            Weekly partner <em>recaps.</em>
          </h1>
          <p className={styles.sub}>
            Pick a brand to generate this week&apos;s recap. Drafts first — you review,
            then send to the GM and Tim.
          </p>
        </header>

        <div className={styles.weekPicker}>
          <Link href={`/oddyssey-manor/admin/sponsor-recap?week=${prevWeek}`} className={styles.weekNav}>
            ← Prev week
          </Link>
          <div className={styles.weekLabel}>
            <div className={styles.weekLabelEyebrow}>Week of</div>
            <div className={styles.weekLabelRange}>{rangeLabel}</div>
            <div className={styles.weekLabelDates}>Fri {start} → Thu {end}</div>
          </div>
          <Link href={`/oddyssey-manor/admin/sponsor-recap?week=${nextWeek}`} className={styles.weekNav}>
            Next week →
          </Link>
        </div>

        {activations.length === 0 ? (
          <div className={`${styles.section} ${styles.emptyState}`}>
            No pour log entries in this week. Once the GM files Golden Hour nights, brand
            activations will appear here.
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.sectLabel}>Activations this week</div>
            <div className={styles.activationGrid}>
              {activations.map((a) => {
                const href = `/oddyssey-manor/admin/sponsor-recap/draft?brand=${encodeURIComponent(a.brand)}&kind=${a.kind}&from=${start}&to=${end}`;
                return (
                  <Link href={href} key={`${a.kind}:${a.brand}`} className={styles.activationCard}>
                    <div className={`${styles.activationKind} ${a.kind === 'tequila' ? styles.kindTequila : styles.kindChampagne}`}>
                      {a.kind === 'tequila' ? 'Tequila sponsor' : 'Champagne sponsor'}
                    </div>
                    <div className={styles.activationBrand}>{a.brand}</div>
                    <div className={styles.activationMeta}>
                      {a.nightCount} night{a.nightCount === 1 ? '' : 's'} · Generate draft →
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.notes}>
          <div className={styles.noteLabel}>How recaps move</div>
          Drafts are generated on demand — no auto-sending. Click a brand above to preview
          the email, then send it to the internal distribution list (GM + Tim). Partner-facing
          recaps are a follow-up iteration.
        </div>
      </div>
    </main>
  );
}
