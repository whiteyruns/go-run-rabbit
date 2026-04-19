'use client';

import { useState, useTransition } from 'react';
import { sendRecap } from '../actions';
import styles from '../sponsor-recap.module.css';

interface Props {
  brand: string;
  kind: 'tequila' | 'champagne';
  from: string;
  to: string;
  recipientsHint?: string;  // rendered as "Will send to: ..." copy for transparency
  disabled?: boolean;       // e.g. zero activations
  disabledReason?: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; to: string[]; subject: string; id?: string }
  | { kind: 'error'; message: string };

export default function SendPanel(props: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const confirmMsg = `Send "${props.brand}" recap for ${props.from} → ${props.to} to the internal distribution list?`;
    if (!window.confirm(confirmMsg)) return;

    const fd = new FormData();
    fd.set('brand', props.brand);
    fd.set('kind', props.kind);
    fd.set('from', props.from);
    fd.set('to', props.to);

    startTransition(async () => {
      const result = await sendRecap(fd);
      if (result.ok) {
        setStatus({ kind: 'success', to: result.to, subject: result.subject, id: result.id });
      } else {
        setStatus({ kind: 'error', message: result.error });
      }
    });
  }

  return (
    <div className={styles.sendPanel}>
      {status.kind === 'success' && (
        <div className={`${styles.status} ${styles.success}`} role="status">
          Sent. <strong>{status.subject}</strong> → {status.to.join(', ')}
          {status.id ? <span className={styles.resendId}> · Resend id {status.id}</span> : null}
        </div>
      )}
      {status.kind === 'error' && (
        <div className={`${styles.status} ${styles.error}`} role="alert">
          <strong>Couldn&apos;t send.</strong> {status.message}
        </div>
      )}

      {props.recipientsHint && status.kind !== 'success' && (
        <div className={styles.sendHint}>
          Sending to <strong>{props.recipientsHint}</strong> (set by server env{' '}
          <code>SPONSOR_RECAP_RECIPIENTS</code>).
        </div>
      )}

      <button
        type="button"
        className={styles.submit}
        onClick={handleSend}
        disabled={isPending || status.kind === 'success' || props.disabled}
      >
        {isPending
          ? 'Sending…'
          : status.kind === 'success'
            ? 'Sent ✓'
            : 'Send to internal distribution'}
      </button>

      {props.disabled && props.disabledReason && (
        <div className={styles.saveNote}>{props.disabledReason}</div>
      )}
    </div>
  );
}
