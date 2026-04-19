import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../weekend-recap.module.css';
import UploadForm from './UploadForm';

export const metadata: Metadata = {
  title: 'Upload Weekly Workbooks · Weekend Recap',
};

export const dynamic = 'force-dynamic';

export default function UploadPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/oddyssey-manor/admin/weekend-recap">← Weekend Recap</Link>
          <Link href="/oddyssey-manor/admin">Admin</Link>
        </div>

        <header className={styles.header}>
          <div className={styles.eyebrow}>Weekend Recap · Upload</div>
          <h1 className={styles.title}>
            Drop the <em>weekly workbooks.</em>
          </h1>
          <p className={styles.sub}>
            Download <code>MANOR P&amp;L.xlsx</code> and{' '}
            <code>NOIR Budgets &amp; Reports.xlsx</code> from SharePoint, then
            drop them here. Server detects which is which and refreshes the
            Monday scrum view.
          </p>
        </header>

        <div className={styles.uploadCard}>
          <UploadForm />
        </div>

        <div className={styles.notes}>
          <div className={styles.noteLabel}>What gets parsed</div>
          <strong>Manor:</strong> every per-night row in the <code>… Rev</code>{' '}
          sheets (Fri + Sat only), plus the monthly P&amp;L tabs for the YTD
          strip. <strong>Noir:</strong> every <code>LG …</code> Report (Fri) and{' '}
          <code>NOIR …</code> Report (Sat) sheet, plus the <code>YTD REPORT</code>{' '}
          sheet for Actual vs Budget. Upload is idempotent — re-upload anytime to
          refresh.
        </div>
      </div>
    </main>
  );
}
