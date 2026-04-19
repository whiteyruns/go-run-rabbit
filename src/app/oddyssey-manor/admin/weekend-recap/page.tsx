/**
 * Weekend Recap — Monday scrum view.
 *
 * Top: Fri + Sat snapshot per venue (Manor | Noir).
 * Bottom: YTD strip — month-over-month trajectory, Actual vs Budget, per venue.
 *
 * `?weekend=YYYY-MM-DD` picks a specific Friday anchor; default = most recent.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './weekend-recap.module.css';
import {
  enrichWeekend,
  formatInt,
  formatMoney,
  formatWeekendLabel,
  isValidDate,
  listRecentWeekends,
  mostRecentWeekend,
  readWeekendJSON,
  readYTDRollup,
  type VenueNight,
  type YTDRollup,
  type WeekendRecap,
} from './lib';

export const metadata: Metadata = {
  title: 'Weekend Recap · Oddyssey',
  description: 'Monday-scrum snapshot: Fri + Sat per venue, plus YTD trajectory.',
};

export const dynamic = 'force-dynamic';

export default async function WeekendRecapPage({
  searchParams,
}: {
  searchParams: { weekend?: string };
}) {
  const friday =
    searchParams?.weekend && isValidDate(searchParams.weekend)
      ? searchParams.weekend
      : mostRecentWeekend().friday;

  const [rawRecap, manorYTD, noirYTD, recentList] = await Promise.all([
    readWeekendJSON(friday),
    readYTDRollup('manor', 2026),
    readYTDRollup('noir', 2026),
    listRecentWeekends(16),
  ]);
  const recap = await enrichWeekend(rawRecap);

  const prev = shiftFriday(friday, -7);
  const next = shiftFriday(friday, 7);
  const label = formatWeekendLabel(friday);

  const lastUpload = recap.lastUploadedAt
    ? new Date(recap.lastUploadedAt).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const hasAnyData =
    recap.manor.thu || recap.manor.fri || recap.manor.sat || recap.manor.sun ||
    recap.noir.fri || recap.noir.sat;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/oddyssey-manor/admin">← Admin</Link>
          <Link href="/oddyssey-manor/admin/weekend-recap/upload">Upload xlsx →</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Monday Scrum · Weekend Recap</div>
          <h1 className={styles.title}>
            How did the weekend <em>land?</em>
          </h1>
          <p className={styles.sub}>
            Manor Thu–Sun + Noir Fri–Sat, plus YTD trajectory. Ticket revenue
            auto-fills from Ticketure; drop the GM&apos;s xlsx files Monday for
            bar and per-night cost lines.
          </p>
        </header>

        <div className={styles.weekPicker}>
          <Link
            href={`/oddyssey-manor/admin/weekend-recap?weekend=${prev}`}
            className={styles.weekNav}
          >
            ← Prev weekend
          </Link>
          <div className={styles.weekLabel}>
            <div className={styles.weekLabelEyebrow}>Weekend of</div>
            <div className={styles.weekLabelRange}>{label}</div>
            <div className={styles.weekLabelDates}>
              {lastUpload ? `Uploaded ${lastUpload}` : 'Not yet uploaded'}
            </div>
          </div>
          <Link
            href={`/oddyssey-manor/admin/weekend-recap?weekend=${next}`}
            className={styles.weekNav}
          >
            Next weekend →
          </Link>
        </div>

        {!hasAnyData ? (
          <div className={`${styles.section} ${styles.emptyState}`}>
            No data yet for this weekend.
            <br />
            <Link href="/oddyssey-manor/admin/weekend-recap/upload">
              Upload the Manor P&amp;L + Noir Budgets &amp; Reports xlsx files →
            </Link>
          </div>
        ) : (
          <div className={styles.venueGrid}>
            <ManorVenueCard manor={recap.manor} />
            <NoirVenueCard noir={recap.noir} />
          </div>
        )}

        <YTDStrip manor={manorYTD} noir={noirYTD} />

        <div className={styles.ytdCaveat}>
          YTD reflects closed periods (from the GM&apos;s P&amp;L tabs).
          Current-month actuals lag Ticketure totals until the month closes.
        </div>

        <RecentWeekends list={recentList} current={friday} />

        <div className={styles.notes}>
          <div className={styles.noteLabel}>Data lineage</div>
          Tickets come from the Ticketure nightly scrape. Bar and per-night cost
          lines come from the GM&apos;s weekly <code>MANOR P&amp;L.xlsx</code> +{' '}
          <code>NOIR Budgets &amp; Reports.xlsx</code> uploads. YTD rollup
          matches the P&amp;L tabs (Manor) and the YTD REPORT sheet (Noir).
          SharePoint auto-fetch lands once the GoDaddy → Microsoft 365 migration
          completes.
        </div>
      </div>
    </main>
  );
}

// ─── Venue cards ───────────────────────────────────────────────────────────

function ManorVenueCard({
  manor,
}: {
  manor: { thu: VenueNight | null; fri: VenueNight | null; sat: VenueNight | null; sun: VenueNight | null };
}) {
  const any = manor.thu || manor.fri || manor.sat || manor.sun;
  return (
    <div className={styles.venueCard}>
      <div className={styles.venueCardHeader}>
        <div className={styles.venueName}>
          <em>Manor</em>
        </div>
        <div className={styles.venueMeta}>Thu → Sun</div>
      </div>
      {!any ? (
        <div className={styles.nightEmpty}>No data yet for this weekend.</div>
      ) : (
        <div className={`${styles.nightPair} ${styles.nightGrid4}`}>
          <NightColumn label="Thursday" night={manor.thu} venue="manor" />
          <NightColumn label="Friday" night={manor.fri} venue="manor" />
          <NightColumn label="Saturday" night={manor.sat} venue="manor" />
          <NightColumn label="Sunday" night={manor.sun} venue="manor" />
        </div>
      )}
    </div>
  );
}

function NoirVenueCard({
  noir,
}: {
  noir: { fri: VenueNight | null; sat: VenueNight | null };
}) {
  const any = noir.fri || noir.sat;
  return (
    <div className={styles.venueCard}>
      <div className={styles.venueCardHeader}>
        <div className={styles.venueName}>
          <em>Noir</em>
        </div>
        <div className={styles.venueMeta}>Liber Gigante · Fri + Sat</div>
      </div>
      {!any ? (
        <div className={styles.nightEmpty}>No data yet for this weekend.</div>
      ) : (
        <div className={styles.nightPair}>
          <NightColumn label="Friday" night={noir.fri} venue="noir" />
          <NightColumn label="Saturday" night={noir.sat} venue="noir" />
        </div>
      )}
    </div>
  );
}

function NightColumn({
  label,
  night,
  venue,
}: {
  label: string;
  night: VenueNight | null;
  venue: 'manor' | 'noir';
}) {
  if (!night) {
    return (
      <div className={styles.nightCol}>
        <div className={styles.nightLabel}>{label}</div>
        <div className={styles.nightEmpty}>No {label.toLowerCase()} data</div>
      </div>
    );
  }

  const dayLabel = new Date(`${night.date}T00:00:00Z`).toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

  const costs = venue === 'manor' ? MANOR_COSTS : NOIR_COSTS;

  return (
    <div className={styles.nightCol}>
      <div className={styles.nightLabel}>{label}</div>
      <div className={styles.nightDate}>{dayLabel}</div>

      <StatRow
        label="Tickets Sold"
        value={formatInt(night.ticketsIssued)}
        badge={night.ticketCountSource === 'live' ? 'live' : undefined}
        badgeTooltip={night.ticketCountSource === 'live' ? 'From Ticketure (xlsx blank)' : undefined}
      />
      <StatRow
        label="Redeemed"
        value={formatInt(night.ticketsRedeemed)}
        badge={night.ticketCountSource === 'live' ? 'live' : undefined}
        badgeTooltip={night.ticketCountSource === 'live' ? 'From Ticketure (xlsx blank)' : undefined}
      />
      <StatRow
        label="Net Rev"
        value={formatMoney(night.netTicketRev)}
        badge={night.netTicketRevSource === 'live' ? 'live' : undefined}
        badgeTooltip={
          night.netTicketRevSource === 'live' && night.xlsxNetTicketRev != null
            ? `Ticketure actual; xlsx said ${formatMoney(night.xlsxNetTicketRev)}`
            : night.netTicketRevSource === 'live'
              ? 'Live Ticketure Summary Report'
              : undefined
        }
      />
      <StatRow label="Bar NET" value={formatMoney(night.barNet)} />

      <div className={styles.costGroup}>
        <div className={styles.costGroupLbl}>
          {venue === 'manor' ? 'Per-night cost lines' : 'Per-night cost lines'}
        </div>
        {costs.map(([key, label]) => (
          <StatRow
            key={key}
            label={label}
            value={formatMoney(night.costs[key] ?? null)}
            tone={night.costs[key] != null && night.costs[key]! < 0 ? 'bad' : 'default'}
          />
        ))}
        {venue === 'noir' && night.totalNet != null && (
          <StatRow
            label="Total Net"
            value={formatMoney(night.totalNet)}
            tone={night.totalNet < 0 ? 'bad' : 'good'}
          />
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  tone = 'default',
  badge,
  badgeTooltip,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'bad' | 'muted';
  badge?: 'live';
  badgeTooltip?: string;
}) {
  const cls =
    tone === 'good' ? styles.good : tone === 'bad' ? styles.bad : tone === 'muted' ? styles.muted : '';
  return (
    <div className={styles.statRow}>
      <div className={styles.statLbl}>{label}</div>
      <div className={`${styles.statVal} ${cls}`} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        {badge === 'live' && (
          <span
            title={badgeTooltip}
            aria-label={badgeTooltip ?? 'Live from Ticketure'}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#27ae60',
              boxShadow: '0 0 0 2px rgba(39,174,96,0.15)',
              flexShrink: 0,
              cursor: badgeTooltip ? 'help' : 'default',
              display: 'inline-block',
            }}
          />
        )}
        <span>{value}</span>
      </div>
    </div>
  );
}

const MANOR_COSTS: [string, string][] = [
  ['cast', 'Cast'],
  ['rehearsals', 'Rehearsals'],
  ['rigger', 'Rigger'],
];

const NOIR_COSTS: [string, string][] = [
  ['staciaTalent', 'Stacia Talent'],
  ['dj', 'DJ'],
  ['totalStaffing', 'Total Staffing'],
  ['houseTab', 'House Tab'],
  ['incentives', 'Incentives'],
];

// ─── YTD strip ─────────────────────────────────────────────────────────────

function YTDStrip({ manor, noir }: { manor: YTDRollup; noir: YTDRollup }) {
  // Only show months that have any data (actual or budget) in either venue.
  const relevant = manor.rows
    .map((mRow, i) => ({
      i,
      m: mRow,
      n: noir.rows[i],
    }))
    .filter(
      ({ m, n }) =>
        hasAny(m) || hasAny(n),
    );

  if (relevant.length === 0) {
    return (
      <div className={styles.ytdStrip}>
        <div className={styles.sectLabel}>YTD 2026 <span className={styles.sectLabelMeta}>(upload to populate)</span></div>
        <div className={styles.emptyState}>
          No YTD data yet. Upload the Manor P&amp;L + Noir YTD Report to populate.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ytdStrip}>
      <div className={styles.sectLabel}>
        YTD 2026 <span className={styles.sectLabelMeta}>— Actual vs Budget</span>
      </div>
      <div className={styles.ytdScroll}>
        <table className={styles.ytdTable}>
          <thead>
            <tr>
              <th>Venue · Line</th>
              {relevant.map(({ m }) => (
                <th key={m.month} className={styles.month}>
                  {shortMonth(m.month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className={styles.ytdRowVenue}>
              <td colSpan={relevant.length + 1}>Manor</td>
            </tr>
            <tr>
              <td>Actual Rev</td>
              {relevant.map(({ m }) => (
                <td key={`mrev-${m.month}`}>{formatMoney(m.actualRev, { compact: true })}</td>
              ))}
            </tr>
            <tr>
              <td>Actual Net</td>
              {relevant.map(({ m }) => (
                <td
                  key={`mnet-${m.month}`}
                  className={netTone(m.actualNet)}
                >
                  {formatMoney(m.actualNet, { compact: true })}
                </td>
              ))}
            </tr>
            <tr className={styles.rowBudget}>
              <td>Budget Net</td>
              {relevant.map(({ m }) => (
                <td key={`mbnet-${m.month}`}>{formatMoney(m.budgetNet, { compact: true })}</td>
              ))}
            </tr>

            <tr className={styles.ytdRowVenue}>
              <td colSpan={relevant.length + 1}>Noir</td>
            </tr>
            <tr>
              <td>Actual Rev</td>
              {relevant.map(({ n }) => (
                <td key={`nrev-${n.month}`}>{formatMoney(n.actualRev, { compact: true })}</td>
              ))}
            </tr>
            <tr>
              <td>Actual Net</td>
              {relevant.map(({ n }) => (
                <td key={`nnet-${n.month}`} className={netTone(n.actualNet)}>
                  {formatMoney(n.actualNet, { compact: true })}
                </td>
              ))}
            </tr>
            <tr className={styles.rowBudget}>
              <td>Budget Net</td>
              {relevant.map(({ n }) => (
                <td key={`nbnet-${n.month}`}>{formatMoney(n.budgetNet, { compact: true })}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function hasAny(row: { actualRev: number | null; actualNet: number | null; budgetRev: number | null; budgetNet: number | null }): boolean {
  return row.actualRev != null || row.actualNet != null || row.budgetRev != null || row.budgetNet != null;
}

function netTone(n: number | null): string {
  if (n == null) return '';
  return n < 0 ? styles.bad : styles.good;
}

function shortMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'short',
  });
}

// ─── Recent weekends nav ───────────────────────────────────────────────────

function RecentWeekends({ list, current }: { list: string[]; current: string }) {
  if (list.length === 0) return null;
  return (
    <div className={styles.section}>
      <div className={styles.sectLabel}>Recent uploads</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((friday) => {
          const isCurrent = friday === current;
          return (
            <Link
              key={friday}
              href={`/oddyssey-manor/admin/weekend-recap?weekend=${friday}`}
              className={styles.weekNav}
              style={
                isCurrent
                  ? {
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                    }
                  : undefined
              }
            >
              {friday}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Date helpers ──────────────────────────────────────────────────────────

function shiftFriday(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// unused export stub so tsc is happy with WeekendRecap import (actual consumer: recap arg)
export type _WR = WeekendRecap;
