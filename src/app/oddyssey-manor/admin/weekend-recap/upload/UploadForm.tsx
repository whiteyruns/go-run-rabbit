'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { uploadWorkbooks, type UploadOutcome } from '../actions';
import styles from '../weekend-recap.module.css';

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await uploadWorkbooks(fd);
      setOutcome(result);
    });
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.dropZone}>
          <div className={styles.dropHint}>
            Drop one or both xlsx workbooks.
            <br />
            <code>MANOR P&amp;L.xlsx</code> · <code>NOIR Budgets &amp; Reports.xlsx</code>
          </div>
          <input
            type="file"
            name="files"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            required
          />
        </div>

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? 'Parsing…' : 'Upload & parse'}
        </button>
      </form>

      {outcome && <OutcomePanel outcome={outcome} />}
    </>
  );
}

function OutcomePanel({ outcome }: { outcome: UploadOutcome }) {
  if (!outcome.ok) {
    return (
      <div className={`${styles.status} ${styles.error}`} style={{ marginTop: 18 }}>
        <strong>Upload failed.</strong> {outcome.error}
      </div>
    );
  }
  if (!outcome.summary || outcome.summary.length === 0) {
    return (
      <div className={`${styles.status}`} style={{ marginTop: 18 }}>
        No files detected in upload.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div className={`${styles.status} ${styles.success}`}>
        <strong>Parsed {outcome.summary.length} file{outcome.summary.length === 1 ? '' : 's'}.</strong>{' '}
        <Link href="/oddyssey-manor/admin/weekend-recap">View Monday scrum →</Link>
      </div>

      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Nights</th>
            <th>YTD months</th>
            <th>Weekends touched</th>
          </tr>
        </thead>
        <tbody>
          {outcome.summary.map((s) => (
            <tr key={s.filename}>
              <td>{s.filename}</td>
              <td>{s.workbookType}</td>
              <td>{s.nightsWritten}</td>
              <td>{s.ytdMonthsPopulated}</td>
              <td>{s.weekendsTouched.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {outcome.summary.flatMap((s) =>
        s.warnings.map((w, i) => (
          <div key={`${s.filename}-${i}`} className={styles.warning}>
            ⚠ <strong>{s.filename}:</strong> {w}
          </div>
        )),
      )}
    </div>
  );
}
