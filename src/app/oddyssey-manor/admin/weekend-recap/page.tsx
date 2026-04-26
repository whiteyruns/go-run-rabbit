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
import HighlightsEditor from './HighlightsEditor';
import {
  buildWoWSeries,
  champagnePoursFromBottles,
  CHANNEL_PACKAGE_KEYS,
  computeSquareDepletions,
  detectRepItem,
  enrichWeekend,
  formatInt,
  formatMoney,
  formatWeekendLabel,
  isValidDate,
  listRecentWeekends,
  loadBrandDeltaEstimate,
  loadPourLogForWeekend,
  mostRecentWeekend,
  PACKAGE_LABEL,
  readWeekendJSON,
  readYTDRollup,
  tequilaPoursFromBottles,
  type BrandDeltaEstimate,
  type ChannelBreakdown,
  type PackageKey,
  type PourLogWeekend,
  type VenueNight,
  type WoWPoint,
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

  const [rawRecap, manorYTD, noirYTD, recentList, pourLog, manorWoW, noirWoW] = await Promise.all([
    readWeekendJSON(friday),
    readYTDRollup('manor', 2026),
    readYTDRollup('noir', 2026),
    listRecentWeekends(16),
    loadPourLogForWeekend(friday),
    buildWoWSeries('manor', friday, 8),
    buildWoWSeries('noir', friday, 8),
  ]);
  const recap = await enrichWeekend(rawRecap);

  // Pull a historical (Pour Log − Square) delta per brand so the
  // Square-only Open Bar fallback can render an estimated depletion
  // check for nights where the Pour Log wasn't filed.
  const knownBrands = ['El Bandido', 'Telsen', 'KU'];
  const brandEstimateEntries = await Promise.all(
    knownBrands.map(async (b) => [b, await loadBrandDeltaEstimate(b, friday)] as const),
  );
  const brandEstimates: Record<string, BrandDeltaEstimate> =
    Object.fromEntries(brandEstimateEntries);

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

        <div className={styles.masthead}>
          <Link href="/oddyssey-manor" aria-label="Oddyssey home" className={styles.mastheadLogoLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/oddyssey/oddyssey-logo.svg"
              alt="Oddyssey"
              className={styles.mastheadLogo}
            />
          </Link>
          <div className={styles.mastheadRule} />
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

        <HighlightsEditor
          weekendOf={friday}
          initial={recap.highlights ?? ''}
          updatedAt={recap.highlightsUpdatedAt ?? null}
        />

        {hasAnyData && (
          <ExecutiveSummary
            recap={recap}
            manorWoW={manorWoW}
            noirWoW={noirWoW}
            pourLog={pourLog}
          />
        )}

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
            <ManorVenueCard manor={recap.manor} wow={manorWoW} />
            <NoirVenueCard noir={recap.noir} wow={noirWoW} />
          </div>
        )}

        <OpenBarPanel pourLog={pourLog} recap={recap} brandEstimates={brandEstimates} />

        <ChannelBreakdownPanel recap={recap} />

        <YTDStrip manor={manorYTD} noir={noirYTD} />
        <YTDChart manor={manorYTD} noir={noirYTD} />

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
  wow,
}: {
  manor: { thu: VenueNight | null; fri: VenueNight | null; sat: VenueNight | null; sun: VenueNight | null };
  wow: WoWPoint[];
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
      <WoWSparkline wow={wow} accent="var(--accent)" />

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
  wow,
}: {
  noir: { fri: VenueNight | null; sat: VenueNight | null };
  wow: WoWPoint[];
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
      <WoWSparkline wow={wow} accent="#b46ec8" />

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
      <StatRow
        label="Bar NET"
        value={formatMoney(night.barNet)}
        badge={night.barNetSource === 'live' ? 'live' : undefined}
        badgeTooltip={
          night.barNetSource === 'live' && night.xlsxBarNet != null
            ? `Square actual; xlsx said ${formatMoney(night.xlsxBarNet)}`
            : night.barNetSource === 'live'
              ? 'Live Square Sales Summary'
              : undefined
        }
      />

      <div className={styles.costGroup}>
        <div className={styles.costGroupLbl}>
          {venue === 'manor' ? 'Per-night cost lines' : 'Per-night cost lines'}
        </div>
        {costs.map(([key, label]) => {
          const projected = night.costSources?.[key] === 'projected';
          return (
            <StatRow
              key={key}
              label={projected ? `${label} (projected)` : label}
              value={formatMoney(night.costs[key] ?? null)}
              tone={night.costs[key] != null && night.costs[key]! < 0 ? 'bad' : 'default'}
            />
          );
        })}
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

// ─── Executive summary ────────────────────────────────────────────────────

function ExecutiveSummary({
  recap,
  manorWoW,
  noirWoW,
  pourLog,
}: {
  recap: WeekendRecap;
  manorWoW: WoWPoint[];
  noirWoW: WoWPoint[];
  pourLog: PourLogWeekend;
}) {
  // Aggregate this weekend per venue
  const manorSlots = [recap.manor.thu, recap.manor.fri, recap.manor.sat, recap.manor.sun];
  const noirSlots = [recap.noir.fri, recap.noir.sat];
  const agg = (slots: (VenueNight | null)[]) => {
    let rev = 0, red = 0, any = false, anyRed = false;
    for (const n of slots) {
      if (!n) continue;
      if (n.netTicketRev != null) { rev += n.netTicketRev; any = true; }
      if (n.ticketsRedeemed != null) { red += n.ticketsRedeemed; anyRed = true; }
    }
    return { rev: any ? rev : null, red: anyRed ? red : null };
  };
  const manor = agg(manorSlots);
  const noir = agg(noirSlots);
  const total = (manor.rev ?? 0) + (noir.rev ?? 0);
  const totalRed = (manor.red ?? 0) + (noir.red ?? 0);

  // WoW deltas — compare current point (last) to prior point (second-to-last).
  const deltaFor = (series: WoWPoint[]): number | null => {
    if (series.length < 2) return null;
    const cur = series[series.length - 1]?.netRev;
    const pri = series[series.length - 2]?.netRev;
    if (cur == null || pri == null) return null;
    return cur - pri;
  };
  const manorDelta = deltaFor(manorWoW);
  const noirDelta = deltaFor(noirWoW);

  // Pour Log stats
  const tequilaBtls = (pourLog.fri?.tequila.consumed ?? 0) + (pourLog.sat?.tequila.consumed ?? 0);
  const champBtls = (pourLog.fri?.champagneBottles.consumed ?? 0) + (pourLog.sat?.champagneBottles.consumed ?? 0);
  const tequilaPours = tequilaPoursFromBottles(tequilaBtls);
  const champPours = champagnePoursFromBottles(champBtls);
  // Detect any rep activations across the weekend (Friday + Saturday
  // Noir are the usual Golden Hour nights where a rep would show).
  const repActivations: { date: string; item: { name: string; gross: number } }[] = [];
  for (const n of [...noirSlots, ...manorSlots]) {
    const rep = detectRepItem(n?.squareTopItems);
    if (rep && n) repActivations.push({ date: n.date, item: rep });
  }

  const poursDenom = noir.red ?? 0;
  const poursPerGuest = poursDenom > 0 ? tequilaPours / poursDenom : null;
  const sponsorValue = (tequilaPours + champPours) * COCKTAIL_RETAIL_PRICE;
  const featuredTequila = pourLog.fri?.featuredTequila ?? pourLog.sat?.featuredTequila ?? null;
  const featuredChampagne = pourLog.fri?.champagne ?? pourLog.sat?.champagne ?? null;
  const tequilaCost = (costPerBottle(featuredTequila) ?? 0) * tequilaBtls;
  const champCost = (costPerBottle(featuredChampagne) ?? 0) * champBtls;
  const totalCost = tequilaCost + champCost;
  const multiplier = totalCost > 0 ? sponsorValue / totalCost : null;

  const deltaBadge = (delta: number | null, label: string) => {
    if (delta == null) return null;
    const up = delta > 0;
    const color = up ? 'var(--up)' : delta < 0 ? 'var(--down)' : 'var(--text-muted)';
    const arrow = up ? '▲' : delta < 0 ? '▼' : '—';
    return (
      <span style={{ color, whiteSpace: 'nowrap' }}>
        {label} {arrow} {formatMoney(Math.abs(delta))}
      </span>
    );
  };

  return (
    <div className={styles.execSummary}>
      <div className={styles.execEyebrow}>Executive Summary</div>
      <div className={styles.execHeadline}>
        {formatInt(totalRed)} <span className={styles.execMuted}>admissions</span> ·{' '}
        <span className={styles.execMoney}>{formatMoney(total)}</span>{' '}
        <span className={styles.execMuted}>net ticket rev</span>
      </div>
      <div className={styles.execRow}>
        <span>
          <strong>Manor</strong> {formatInt(manor.red)} admits · {formatMoney(manor.rev)}{' '}
          {deltaBadge(manorDelta, 'vs prior')}
        </span>
        <span>
          <strong>Noir</strong> {formatInt(noir.red)} admits · {formatMoney(noir.rev)}{' '}
          {deltaBadge(noirDelta, 'vs prior')}
        </span>
      </div>
      {repActivations.length > 0 && (
        <div className={styles.execRow}>
          <span>
            🤝 <strong>Brand Rep Activation</strong>
            {repActivations.map((r, i) => (
              <span key={r.date}>
                {i === 0 ? ' · ' : ' · '}
                <strong>{r.item.name}</strong> {formatMoney(r.item.gross)}{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  ({new Date(`${r.date}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })})
                </span>
              </span>
            ))}
          </span>
        </div>
      )}
      {(tequilaBtls > 0 || champBtls > 0) && (
        <div className={styles.execRow}>
          <span>
            <strong>Golden Hour</strong>
            {featuredTequila && ` · ${featuredTequila}`}
            {tequilaBtls > 0 && (
              <> · <strong>{tequilaBtls.toFixed(1)}</strong> btl tequila ({tequilaPours} pours)</>
            )}
            {champBtls > 0 && (
              <> · <strong>{champBtls.toFixed(1)}</strong> btl champagne ({champPours} flutes)</>
            )}
            {poursPerGuest != null && (
              <> · <strong>{poursPerGuest.toFixed(1)}×</strong> pours/guest</>
            )}
            {sponsorValue > 0 && (
              <>
                {' '}· <strong>{formatMoney(sponsorValue)}</strong> retail value
                {totalCost > 0 && (
                  <> on <strong>{formatMoney(totalCost)}</strong> product cost{' '}
                    {multiplier != null && (
                      <span style={{ color: 'var(--up)' }}>
                        (<strong>{multiplier.toFixed(1)}×</strong> multiplier)
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// Retail price per open-bar pour (tequila cocktail OR champagne flute).
// Used to estimate guest-experience / sponsor activation value.
const COCKTAIL_RETAIL_PRICE = 14;

// Venue's actual wholesale cost per 750ml bottle. Drives COGS + sponsor
// multiplier math (retail equivalent / product cost). Update as new
// brands come on or prices change.
const BRAND_COST_PER_BOTTLE: Record<string, number> = {
  'El Bandido': 38.30,
  'Telsen': 39.49,
  'Telson': 39.49, // tolerate the alt spelling from the form
  'KU': 28.83,
};

function costPerBottle(brand: string | undefined | null): number | null {
  if (!brand) return null;
  const trimmed = brand.trim();
  return BRAND_COST_PER_BOTTLE[trimmed] ?? null;
}

// ─── WoW sparkline ────────────────────────────────────────────────────────

function WoWSparkline({ wow, accent }: { wow: WoWPoint[]; accent: string }) {
  const values = wow.map((p) => p.netRev ?? 0);
  const max = Math.max(...values, 1);
  const width = 100;
  const height = 28;
  const barWidth = width / wow.length;
  return (
    <div className={styles.sparkline}>
      <div className={styles.sparkLabel}>Net rev · last {wow.length} weekends</div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={44}>
        {wow.map((p, i) => {
          const h = p.netRev == null ? 0 : Math.max(1, (p.netRev / max) * height);
          const x = i * barWidth + 0.4;
          const y = height - h;
          const w = barWidth - 0.8;
          const isLast = i === wow.length - 1;
          return (
            <rect
              key={p.fridayAnchor}
              x={x} y={y} width={w} height={h}
              fill={isLast ? accent : 'rgba(255,255,255,0.25)'}
              opacity={p.netRev == null ? 0.2 : 1}
            >
              <title>{p.label}: {formatMoney(p.netRev)} · {formatInt(p.redeemed)} redeemed</title>
            </rect>
          );
        })}
      </svg>
      <div className={styles.sparkAxis}>
        <span>{wow[0]?.label ?? ''}</span>
        <span>{wow[wow.length - 1]?.label ?? ''}</span>
      </div>
    </div>
  );
}

// ─── Open Bar panel ───────────────────────────────────────────────────────

function OpenBarPanel({
  pourLog,
  recap,
  brandEstimates,
}: {
  pourLog: PourLogWeekend;
  recap: WeekendRecap;
  brandEstimates: Record<string, BrandDeltaEstimate>;
}) {
  const hasFri = !!pourLog.fri;
  const hasSat = !!pourLog.sat;
  // A night counts as "shown" when either the Pour Log is filed OR
  // Square's depletion data has at least one open-bar brand we recognize.
  const friSquareDeps = computeSquareDepletions(recap.noir.fri?.squareTopItems);
  const satSquareDeps = computeSquareDepletions(recap.noir.sat?.squareTopItems);
  const friSquareOnly = !hasFri && friSquareDeps.length > 0;
  const satSquareOnly = !hasSat && satSquareDeps.length > 0;
  if (!hasFri && !hasSat && !friSquareOnly && !satSquareOnly) {
    return (
      <div className={styles.openBar}>
        <div className={styles.openBarHeader}>
          <div className={styles.openBarEyebrow}>Golden Hour · Open Bar</div>
          <div className={styles.openBarMeta}>Pour Log not filed for this weekend</div>
        </div>
        <div className={styles.openBarEmpty}>
          <Link href="/oddyssey-manor/admin/pour-log">Open Pour Log →</Link>
        </div>
      </div>
    );
  }
  // Square-only fallback: same look as the Pour Log line but every
  // bottle/cost number is sourced from Square depletion data, with no
  // Pour Log delta row. Surfaces a "Pour Log not filed" eyebrow so it's
  // clear the manager hasn't recorded the night yet.
  const squareOnlyLine = (nightLabel: string, noirNight: VenueNight | null) => {
    const allNight = computeSquareDepletions(noirNight?.squareTopItems);
    const openBar = computeSquareDepletions(noirNight?.squareOpenBarWindow?.items);
    if (allNight.length === 0) {
      return (
        <div className={styles.openBarNight}>
          <div className={styles.openBarNightLbl}>{nightLabel}</div>
          <div className={styles.openBarNightEmpty}>Not filed</div>
        </div>
      );
    }
    const isTequila = (b: string) => /bandido|telsen/i.test(b);
    const obByBrand = new Map(openBar.map((d) => [d.brand, d]));
    let totalCost = 0;
    let totalWindowCost = 0;
    let totalRetailDrinks = 0;
    let anyMissingCost = false;
    allNight.forEach((d) => {
      const cpb = costPerBottle(d.brand);
      if (cpb == null) { anyMissingCost = true; return; }
      totalCost += cpb * d.bottles;
      const ob = obByBrand.get(d.brand);
      if (ob) totalWindowCost += cpb * ob.bottles;
      totalRetailDrinks += d.totalUnits;
    });
    const totalRetail = totalRetailDrinks * COCKTAIL_RETAIL_PRICE;
    const mult = totalCost > 0 ? totalRetail / totalCost : null;
    const red = noirNight?.ticketsRedeemed;
    const tequilaUnits = allNight
      .filter((d) => isTequila(d.brand))
      .reduce((s, d) => s + d.totalUnits, 0);
    const ppg = red && red > 0 && tequilaUnits > 0 ? tequilaUnits / red : null;
    return (
      <div className={styles.openBarNight}>
        <div className={styles.openBarNightLbl}>
          {nightLabel} <span className={styles.openBarMuted}>· Pour Log not filed — Square only</span>
        </div>
        {allNight.map((d) => (
          <div key={d.brand} className={styles.openBarRow}>
            <span className={styles.openBarK}>{isTequila(d.brand) ? 'Tequila' : 'Champagne'}</span>
            <span>
              <strong>{d.brand}</strong> · {d.bottles.toFixed(1)} btl ({d.totalUnits} {d.unitLabel}{d.totalUnits === 1 ? '' : 's'})
            </span>
          </div>
        ))}
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Pours / Guest</span>
          <span>
            {ppg != null ? <strong>{ppg.toFixed(1)}×</strong> : <em>—</em>}{' '}
            {red != null && <span className={styles.openBarMuted}>({tequilaUnits} tequila / {red} guests)</span>}
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Product Cost</span>
          <span>
            <strong>{formatMoney(totalCost)}</strong>
            {totalWindowCost > 0 && (
              <span className={styles.openBarMuted}> · window {formatMoney(totalWindowCost)}</span>
            )}
            {anyMissingCost && (
              <span className={styles.openBarMuted}> · partial</span>
            )}
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Retail Value</span>
          <span>
            <strong>{formatMoney(totalRetail)}</strong>{' '}
            <span className={styles.openBarMuted}>({totalRetailDrinks} drinks × ${COCKTAIL_RETAIL_PRICE})</span>
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Multiplier</span>
          <span style={{ color: mult && mult >= 3 ? 'var(--up)' : 'var(--text)' }}>
            {mult != null ? <strong>{mult.toFixed(1)}×</strong> : <em>—</em>}{' '}
            <span className={styles.openBarMuted}>retail / cost</span>
          </span>
        </div>
        {noirNight?.squareTopItems && noirNight.squareTopItems.length > 0 && (
          <div className={styles.openBarItems}>
            <div className={styles.openBarItemsLbl}>Top items (Square)</div>
            {noirNight.squareTopItems.slice(0, 5).map((item) => {
              const isRep = /\b(rep|repo|yankee|ambassador)\b/i.test(item.name);
              return (
                <div key={item.name} className={styles.openBarItemRow}>
                  <span>
                    {isRep && <span style={{ color: '#d4a574', marginRight: 4 }}>🤝</span>}
                    {item.name}
                  </span>
                  <span style={{ color: isRep ? '#d4a574' : 'var(--text)' }}>
                    {formatMoney(item.gross)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {(() => {
          // Estimated depletion check — same shape as the Pour Log
          // version but the "Pour Log" column is synthesized from the
          // historical (Pour Log − Square) delta per brand. When we
          // have no history, fall back to a 10% shrinkage cushion.
          const obByBrand = new Map(openBar.map((d) => [d.brand, d]));
          let totalEstPourLog = 0;
          let totalSquare = 0;
          let totalCostEst = 0;
          let totalCostSquare = 0;
          let anyMissingCost = false;
          const rows = allNight.map((d) => {
            const est = brandEstimates[d.brand];
            const delta = est?.avgDelta ?? null;
            const sampleCount = est?.sampleCount ?? 0;
            // If we have a sample, est = Square + avgDelta. Else apply
            // the default shrinkage percentage as a rough placeholder.
            const estPourLog =
              delta != null
                ? Math.max(0, d.bottles + delta)
                : d.bottles * (1 + (est?.defaultShrinkagePct ?? 0.10));
            const cpb = costPerBottle(d.brand);
            const obMatch = obByBrand.get(d.brand);
            if (cpb != null) {
              totalCostEst += cpb * estPourLog;
              totalCostSquare += cpb * d.bottles;
            } else {
              anyMissingCost = true;
            }
            totalEstPourLog += estPourLog;
            totalSquare += d.bottles;
            return { d, estPourLog, delta, sampleCount, cpb, obMatch };
          });
          return (
            <div className={styles.openBarItems}>
              <div className={styles.openBarItemsLbl}>
                Depletion check · Estimated{' '}
                <span className={styles.openBarMuted}>
                  (no Pour Log; Square + avg shrinkage from prior weekends)
                </span>
              </div>
              {rows.map(({ d, estPourLog, delta, sampleCount, cpb, obMatch }) => (
                <div key={d.brand} style={{ paddingTop: 4, paddingBottom: 4 }}>
                  <div className={styles.openBarItemRow}>
                    <span>
                      <strong>{d.brand}</strong>
                      <span className={styles.openBarMuted}>
                        {' '}all night · {d.totalUnits} {d.unitLabel}{d.totalUnits === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span>
                      <strong>{d.bottles.toFixed(1)} btl</strong>{' '}
                      <span className={styles.openBarMuted}>
                        (est Pour Log <strong style={{ color: 'var(--text)' }}>{estPourLog.toFixed(1)}</strong>{' '}
                        ·{' '}
                        {delta != null ? (
                          <>
                            avg <span style={{ color: '#d4a574' }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</span>{' '}
                            from {sampleCount} {sampleCount === 1 ? 'night' : 'nights'}
                          </>
                        ) : (
                          <>+10% default shrinkage</>
                        )}
                        )
                      </span>
                    </span>
                  </div>
                  {cpb != null && (
                    <div className={styles.openBarItemRow} style={{ paddingLeft: 16, fontSize: 11 }}>
                      <span className={styles.openBarMuted}>↳ cost @ ${cpb.toFixed(2)}/btl</span>
                      <span style={{ color: 'var(--text)' }}>
                        <strong>{formatMoney(cpb * d.bottles)}</strong>{' '}
                        <span className={styles.openBarMuted}>
                          · est {formatMoney(cpb * estPourLog)}
                        </span>
                      </span>
                    </div>
                  )}
                  {obMatch && (
                    <div className={styles.openBarItemRow} style={{ paddingLeft: 16, fontSize: 11 }}>
                      <span className={styles.openBarMuted}>
                        ↳ window 10pm–12am · {obMatch.totalUnits} {obMatch.unitLabel}{obMatch.totalUnits === 1 ? '' : 's'}
                      </span>
                      <span className={styles.openBarMuted}>
                        {obMatch.bottles.toFixed(1)} btl
                        {' · '}
                        {((obMatch.totalUnits / Math.max(d.totalUnits, 1)) * 100).toFixed(0)}% in window
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {totalCostSquare > 0 && (
                <div
                  className={styles.openBarItemRow}
                  style={{ paddingTop: 6, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span><strong>Total product cost (Square / est)</strong></span>
                  <span>
                    <strong>{formatMoney(totalCostSquare)}</strong>
                    <span className={styles.openBarMuted}>
                      {' '}· est {formatMoney(totalCostEst)}
                    </span>
                    {anyMissingCost && (
                      <span className={styles.openBarMuted}> · partial</span>
                    )}
                  </span>
                </div>
              )}
              <div
                className={styles.openBarItemRow}
                style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}
              >
                <span>—</span>
                <span>
                  est total Pour Log {totalEstPourLog.toFixed(1)} btl vs Square {totalSquare.toFixed(1)} btl
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };
  const line = (entry: PourLogWeekend['fri'], nightLabel: string, noirNight: VenueNight | null) => {
    if (!entry) {
      const sqDeps = computeSquareDepletions(noirNight?.squareTopItems);
      if (sqDeps.length > 0) return squareOnlyLine(nightLabel, noirNight);
      return (
        <div className={styles.openBarNight}>
          <div className={styles.openBarNightLbl}>{nightLabel}</div>
          <div className={styles.openBarNightEmpty}>Not filed</div>
        </div>
      );
    }
    const tPours = tequilaPoursFromBottles(entry.tequila.consumed);
    const cPours = champagnePoursFromBottles(entry.champagneBottles.consumed);
    const red = noirNight?.ticketsRedeemed;
    const ppg = red && red > 0 ? tPours / red : null;
    const tCost = (costPerBottle(entry.featuredTequila) ?? 0) * entry.tequila.consumed;
    const cCost = (costPerBottle(entry.champagne) ?? 0) * entry.champagneBottles.consumed;
    const nightCost = tCost + cCost;
    const nightRetail = (tPours + cPours) * COCKTAIL_RETAIL_PRICE;
    const nightMult = nightCost > 0 ? nightRetail / nightCost : null;
    return (
      <div className={styles.openBarNight}>
        <div className={styles.openBarNightLbl}>{nightLabel}</div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Tequila</span>
          <span>
            <strong>{entry.featuredTequila}</strong> · {entry.tequila.consumed.toFixed(1)} btl ({tPours} pours)
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Champagne</span>
          <span>
            <strong>{entry.champagne}</strong> · {entry.champagneBottles.consumed.toFixed(1)} btl ({cPours} flutes)
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Pours / Guest</span>
          <span>
            {ppg != null ? <strong>{ppg.toFixed(1)}×</strong> : <em>—</em>}{' '}
            {red != null && <span className={styles.openBarMuted}>({tPours} tequila / {red} guests)</span>}
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Product Cost</span>
          <span>
            <strong>{formatMoney(nightCost)}</strong>{' '}
            <span className={styles.openBarMuted}>
              (tequila {formatMoney(tCost)} + champ {formatMoney(cCost)})
            </span>
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Retail Value</span>
          <span>
            <strong>{formatMoney(nightRetail)}</strong>{' '}
            <span className={styles.openBarMuted}>({tPours + cPours} drinks × ${COCKTAIL_RETAIL_PRICE})</span>
          </span>
        </div>
        <div className={styles.openBarRow}>
          <span className={styles.openBarK}>Multiplier</span>
          <span style={{ color: nightMult && nightMult >= 3 ? 'var(--up)' : 'var(--text)' }}>
            {nightMult != null ? <strong>{nightMult.toFixed(1)}×</strong> : <em>—</em>}{' '}
            <span className={styles.openBarMuted}>retail / cost</span>
          </span>
        </div>
        {noirNight?.squareTopItems && noirNight.squareTopItems.length > 0 && (
          <div className={styles.openBarItems}>
            <div className={styles.openBarItemsLbl}>Top items (Square)</div>
            {noirNight.squareTopItems.slice(0, 5).map((item) => {
              const isRep = /\b(rep|repo|yankee|ambassador)\b/i.test(item.name);
              return (
                <div key={item.name} className={styles.openBarItemRow}>
                  <span>
                    {isRep && <span style={{ color: '#d4a574', marginRight: 4 }}>🤝</span>}
                    {item.name}
                  </span>
                  <span style={{ color: isRep ? '#d4a574' : 'var(--text)' }}>
                    {formatMoney(item.gross)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {(() => {
          const allNight = computeSquareDepletions(noirNight?.squareTopItems);
          const openBar = computeSquareDepletions(noirNight?.squareOpenBarWindow?.items);
          if (allNight.length === 0) return null;
          const isTequila = (b: string) => /bandido|telsen/i.test(b);
          const obByBrand = new Map(openBar.map((d) => [d.brand, d]));
          let totalAllNightCost = 0;
          let totalWindowCost = 0;
          let anyMissingCost = false;
          allNight.forEach((d) => {
            const cpb = costPerBottle(d.brand);
            if (cpb == null) { anyMissingCost = true; return; }
            totalAllNightCost += cpb * d.bottles;
            const ob = obByBrand.get(d.brand);
            if (ob) totalWindowCost += cpb * ob.bottles;
          });
          return (
            <div className={styles.openBarItems}>
              <div className={styles.openBarItemsLbl}>Depletion check · Pour Log ↔ Square</div>
              {allNight.map((d) => {
                const reported = isTequila(d.brand)
                  ? entry.tequila.consumed
                  : entry.champagneBottles.consumed;
                const delta = (reported ?? 0) - d.bottles;
                const ob = obByBrand.get(d.brand);
                const cpb = costPerBottle(d.brand);
                const allNightCost = cpb != null ? cpb * d.bottles : null;
                const windowCost = cpb != null && ob ? cpb * ob.bottles : null;
                return (
                  <div key={d.brand} style={{ paddingTop: 4, paddingBottom: 4 }}>
                    <div className={styles.openBarItemRow}>
                      <span>
                        <strong>{d.brand}</strong>
                        <span className={styles.openBarMuted}>
                          {' '}all night · {d.totalUnits} {d.unitLabel}{d.totalUnits === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span>
                        <strong>{d.bottles.toFixed(1)} btl</strong>{' '}
                        <span className={styles.openBarMuted}>
                          (Pour Log {(reported ?? 0).toFixed(1)} ·{' '}
                          <span style={{ color: delta > 0 ? '#d4a574' : delta < 0 ? '#27ae60' : 'inherit' }}>
                            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
                          </span>)
                        </span>
                      </span>
                    </div>
                    {allNightCost != null && (
                      <div className={styles.openBarItemRow} style={{ paddingLeft: 16, fontSize: 11 }}>
                        <span className={styles.openBarMuted}>
                          ↳ cost @ ${cpb!.toFixed(2)}/btl
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          <strong>{formatMoney(allNightCost)}</strong>
                          {windowCost != null && (
                            <span className={styles.openBarMuted}>
                              {' '}· window {formatMoney(windowCost)}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {ob && (
                      <div className={styles.openBarItemRow} style={{ paddingLeft: 16, fontSize: 11 }}>
                        <span className={styles.openBarMuted}>
                          ↳ window 10pm–12am · {ob.totalUnits} {ob.unitLabel}{ob.totalUnits === 1 ? '' : 's'}
                        </span>
                        <span className={styles.openBarMuted}>
                          {ob.bottles.toFixed(1)} btl
                          {' · '}
                          {((ob.totalUnits / Math.max(d.totalUnits, 1)) * 100).toFixed(0)}% in window
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {totalAllNightCost > 0 && (
                <div
                  className={styles.openBarItemRow}
                  style={{ paddingTop: 6, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span><strong>Total product cost (Square)</strong></span>
                  <span>
                    <strong>{formatMoney(totalAllNightCost)}</strong>
                    {totalWindowCost > 0 && (
                      <span className={styles.openBarMuted}>
                        {' '}· window {formatMoney(totalWindowCost)}
                      </span>
                    )}
                    {anyMissingCost && (
                      <span className={styles.openBarMuted}> · partial (cost missing for some brands)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })()}
        {entry.notes && <div className={styles.openBarNotes}>&ldquo;{entry.notes}&rdquo;</div>}
      </div>
    );
  };
  return (
    <div className={styles.openBar}>
      <div className={styles.openBarHeader}>
        <div className={styles.openBarEyebrow}>Golden Hour · Open Bar</div>
        <div className={styles.openBarMeta}>Pour Log · pours per guest · sponsor value</div>
      </div>
      <div className={styles.openBarGrid}>
        {line(pourLog.fri, 'Friday', recap.noir.fri)}
        {line(pourLog.sat, 'Saturday', recap.noir.sat)}
      </div>
    </div>
  );
}

// ─── Channel × Package panel ──────────────────────────────────────────────

interface ChannelTableRow {
  label: string;                       // e.g., "Friday · Direct"
  packages: Record<PackageKey, number>;
  total: number;
  isTotal?: boolean;                   // bottom weekend-total row
  isSeparator?: boolean;               // visual separator between nights
}

function emptyPackageCounts(): Record<PackageKey, number> {
  return { general_admission: 0, explorer: 0, dinner_guest: 0, ultimate: 0, unknown: 0 };
}

function buildChannelRows(
  nights: { label: string; breakdown: ChannelBreakdown | null | undefined }[],
): ChannelTableRow[] {
  const rows: ChannelTableRow[] = [];
  const grand = emptyPackageCounts();
  let grandTotal = 0;

  nights.forEach((n, idx) => {
    if (!n.breakdown || n.breakdown.total_tickets === 0) return;
    if (idx > 0 && rows.length > 0) rows.push({ label: '', packages: emptyPackageCounts(), total: 0, isSeparator: true });
    for (const r of n.breakdown.rows) {
      rows.push({
        label: `${n.label} · ${r.channel_label}`,
        packages: r.packages,
        total: r.total,
      });
      for (const k of Object.keys(r.packages) as PackageKey[]) {
        grand[k] += r.packages[k];
      }
      grandTotal += r.total;
    }
  });

  if (rows.length > 0) {
    rows.push({ label: '', packages: emptyPackageCounts(), total: 0, isSeparator: true });
    rows.push({ label: 'Weekend total', packages: grand, total: grandTotal, isTotal: true });
  }
  return rows;
}

function VenueChannelTable({
  venueLabel,
  nights,
}: {
  venueLabel: string;
  nights: { label: string; breakdown: ChannelBreakdown | null | undefined }[];
}) {
  const rows = buildChannelRows(nights);
  if (rows.length === 0) {
    return (
      <div className={styles.channelVenue}>
        <div className={styles.channelVenueTitle}>{venueLabel}</div>
        <div className={styles.channelEmpty}>No attendee CSV pulled for this weekend yet.</div>
      </div>
    );
  }
  return (
    <div className={styles.channelVenue}>
      <div className={styles.channelVenueTitle}>{venueLabel}</div>
      <table className={styles.channelTable}>
        <thead>
          <tr>
            <th className={styles.channelLabelCol}>Night · Channel</th>
            {CHANNEL_PACKAGE_KEYS.map((k) => (
              <th key={k}>{PACKAGE_LABEL[k]}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            if (r.isSeparator) {
              return (
                <tr key={`sep-${i}`} className={styles.channelSep}>
                  <td colSpan={CHANNEL_PACKAGE_KEYS.length + 2} />
                </tr>
              );
            }
            return (
              <tr key={`${r.label}-${i}`} className={r.isTotal ? styles.channelTotalRow : ''}>
                <td className={styles.channelLabelCol}>{r.label}</td>
                {CHANNEL_PACKAGE_KEYS.map((k) => (
                  <td key={k} className={styles.channelNum}>
                    {r.packages[k] > 0 ? r.packages[k] : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                ))}
                <td className={styles.channelNum}><strong>{r.total}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChannelBreakdownPanel({ recap }: { recap: WeekendRecap }) {
  // Manor runs Thu–Sun (four nights); Noir runs Fri–Sat. Show all
  // available nights per venue side-by-side.
  const manorNights = [
    { label: 'Thu', breakdown: recap.manor.thu?.channelBreakdown },
    { label: 'Fri', breakdown: recap.manor.fri?.channelBreakdown },
    { label: 'Sat', breakdown: recap.manor.sat?.channelBreakdown },
    { label: 'Sun', breakdown: recap.manor.sun?.channelBreakdown },
  ];
  const noirNights = [
    { label: 'Fri', breakdown: recap.noir.fri?.channelBreakdown },
    { label: 'Sat', breakdown: recap.noir.sat?.channelBreakdown },
  ];
  const anyData =
    manorNights.some((n) => n.breakdown && n.breakdown.total_tickets > 0) ||
    noirNights.some((n) => n.breakdown && n.breakdown.total_tickets > 0);
  if (!anyData) return null;
  return (
    <div className={styles.channelPanel}>
      <div className={styles.channelHeader}>
        <div className={styles.channelEyebrow}>Channel × Package</div>
        <div className={styles.channelMeta}>
          Per-night ticket counts by channel and package, with weekend totals
        </div>
      </div>
      <div className={styles.channelGrid}>
        <VenueChannelTable venueLabel="Manor" nights={manorNights} />
        <VenueChannelTable venueLabel="Noir" nights={noirNights} />
      </div>
    </div>
  );
}

// ─── YTD chart ────────────────────────────────────────────────────────────

function YTDChart({ manor, noir }: { manor: YTDRollup; noir: YTDRollup }) {
  // Show months Jan–Dec. Per month: two slim bars per venue (actual Net +
  // budget Net). Axis is centered on 0 since both go negative.
  const rows = manor.rows.map((m, i) => ({
    month: m.month,
    monthLabel: new Date(`${m.month}-01T00:00:00Z`).toLocaleString('en-US', {
      timeZone: 'UTC', month: 'short',
    }),
    manorActual: m.actualNet ?? null,
    manorBudget: m.budgetNet ?? null,
    noirActual: noir.rows[i]?.actualNet ?? null,
    noirBudget: noir.rows[i]?.budgetNet ?? null,
  }));
  const allValues = rows.flatMap((r) => [r.manorActual, r.manorBudget, r.noirActual, r.noirBudget])
    .filter((v): v is number => v != null);
  if (allValues.length === 0) return null;
  const maxAbs = Math.max(...allValues.map((v) => Math.abs(v)), 1);
  const height = 120;
  const midY = height / 2;
  const scale = (v: number) => (v / maxAbs) * (midY - 6);

  const barW = 3;
  const slotW = 4 * barW + 6; // 4 bars + gap between months
  const width = rows.length * slotW;

  return (
    <div className={styles.ytdChart}>
      <div className={styles.ytdChartLabel}>Actual vs Budget · Net — monthly</div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
        <line x1="0" y1={midY} x2={width} y2={midY} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {rows.map((r, i) => {
          const baseX = i * slotW + 1;
          const bar = (v: number | null, x: number, fill: string) => {
            if (v == null) return null;
            const h = scale(v);
            const y = h >= 0 ? midY - h : midY;
            return (
              <rect key={x} x={x} y={y} width={barW - 0.5} height={Math.abs(h)} fill={fill}>
                <title>{r.monthLabel}: {formatMoney(v)}</title>
              </rect>
            );
          };
          return (
            <g key={r.month}>
              {bar(r.manorActual, baseX, 'var(--accent)')}
              {bar(r.manorBudget, baseX + barW, 'rgba(201,168,76,0.35)')}
              {bar(r.noirActual, baseX + barW * 2, '#b46ec8')}
              {bar(r.noirBudget, baseX + barW * 3, 'rgba(180,110,200,0.35)')}
            </g>
          );
        })}
      </svg>
      <div className={styles.ytdChartAxis}>
        {rows.map((r) => <span key={r.month}>{r.monthLabel}</span>)}
      </div>
      <div className={styles.ytdChartLegend}>
        <span><span className={styles.swatchAccent} /> Manor actual</span>
        <span><span className={styles.swatchAccentDim} /> Manor budget</span>
        <span><span className={styles.swatchNoir} /> Noir actual</span>
        <span><span className={styles.swatchNoirDim} /> Noir budget</span>
      </div>
    </div>
  );
}
