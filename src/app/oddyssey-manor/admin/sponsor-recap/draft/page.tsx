import type { Metadata } from 'next';
import Link from 'next/link';
import {
  recapForBrand,
  isValidDate,
  formatRangeLabel,
  type SponsorKind,
} from '../lib';
import { renderSponsorRecap } from '../email-template';
import styles from '../sponsor-recap.module.css';
import SendPanel from './SendPanel';
import EmailFrame from './EmailFrame';

export const metadata: Metadata = {
  title: 'Sponsor Recap · Draft · Oddyssey',
};

export const dynamic = 'force-dynamic';

function isKind(v: unknown): v is SponsorKind {
  return v === 'tequila' || v === 'champagne';
}

export default async function DraftPage({
  searchParams,
}: {
  searchParams: { brand?: string; kind?: string; from?: string; to?: string };
}) {
  const brand = (searchParams?.brand ?? '').trim();
  const kindRaw = searchParams?.kind ?? '';
  const from = searchParams?.from ?? '';
  const to = searchParams?.to ?? '';

  if (!brand || !isKind(kindRaw) || !isValidDate(from) || !isValidDate(to) || from > to) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.navRow}>
            <Link href="/oddyssey-manor/admin/sponsor-recap">← Sponsor Recap</Link>
          </div>
          <div className={`${styles.status} ${styles.error}`}>
            Missing or invalid parameters. Expected <code>brand</code>, <code>kind</code>{' '}
            (tequila or champagne), <code>from</code>, and <code>to</code> (YYYY-MM-DD).
          </div>
        </div>
      </main>
    );
  }

  const kind: SponsorKind = kindRaw;
  const recap = await recapForBrand({ brand, kind, rangeStart: from, rangeEnd: to });
  const email = renderSponsorRecap(recap);
  const rangeLabel = formatRangeLabel(from, to);

  const hasActivations = recap.nights.length > 0;
  const recipientsHint = process.env.SPONSOR_RECAP_RECIPIENTS ?? 'not configured';

  return (
    <main className={styles.page}>
      <div className={styles.container} style={{ maxWidth: 880 }}>
        <div className={styles.navRow}>
          <Link href={`/oddyssey-manor/admin/sponsor-recap?week=${from}`}>← Sponsor Recap</Link>
          <Link href="/oddyssey-manor/admin/pour-log/entries">Pour log entries →</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Draft recap · {kind === 'tequila' ? 'Tequila' : 'Champagne'}</div>
          <h1 className={styles.title}>
            {brand} · <em>{rangeLabel}</em>
          </h1>
          <p className={styles.sub}>
            Preview below mirrors exactly what recipients will see. Send when you&apos;re ready.
          </p>
        </header>

        {/* Summary strip — quick eyeball before reading the full email */}
        <div className={styles.summaryStrip}>
          <div className={styles.summaryTile}>
            <div className={styles.summaryVal}>{recap.totals.activations}</div>
            <div className={styles.summaryLbl}>Activations</div>
          </div>
          <div className={styles.summaryTile}>
            <div className={styles.summaryVal}>{recap.totals.bottles.toFixed(1)}</div>
            <div className={styles.summaryLbl}>Bottles</div>
          </div>
          <div className={styles.summaryTile}>
            <div className={styles.summaryVal}>{recap.totals.pours}</div>
            <div className={styles.summaryLbl}>Pours</div>
          </div>
          <div className={styles.summaryTile}>
            <div className={styles.summaryVal}>
              {recap.totals.tickets == null ? '—' : recap.totals.tickets}
            </div>
            <div className={styles.summaryLbl}>Tickets</div>
          </div>
          <div className={styles.summaryTile}>
            <div className={styles.summaryVal}>
              {recap.totals.attachRatePct == null
                ? '—'
                : `${recap.totals.attachRatePct.toFixed(1)}%`}
            </div>
            <div className={styles.summaryLbl}>Attach rate</div>
          </div>
        </div>

        {recap.totals.tickets == null && hasActivations && (
          <div className={`${styles.status}`} role="status">
            Ticket counts are unavailable for one or more nights — recap will note this to
            recipients. Wire <code>readTicketCount()</code> in <code>lib.ts</code> once Console
            confirms the Ticketure data file path.
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectLabel}>Subject line</div>
          <div className={styles.subjectRow}>{email.subject}</div>
        </div>

        <div className={styles.section} style={{ padding: 0, overflow: 'hidden' }}>
          <div className={styles.sectLabel} style={{ padding: '16px 20px 0' }}>Email preview</div>
          <div className={styles.emailPreview}>
            <EmailFrame html={email.html} />
          </div>
        </div>

        <SendPanel
          brand={brand}
          kind={kind}
          from={from}
          to={to}
          recipientsHint={recipientsHint}
          disabled={!hasActivations}
          disabledReason={hasActivations ? undefined : 'No activations in this range — nothing to send.'}
        />

        <div className={styles.notes}>
          <div className={styles.noteLabel}>What the send does</div>
          Calls Resend with the HTML above, sends to the addresses in{' '}
          <strong>SPONSOR_RECAP_RECIPIENTS</strong>, and writes a log entry under{' '}
          <strong>data/oddyssey/sponsor-recap/sent/</strong> for audit. Numbers are re-read
          from Pour Log at send time so late edits to the entries are reflected.
        </div>
      </div>
    </main>
  );
}
