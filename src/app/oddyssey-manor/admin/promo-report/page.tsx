'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  parsePromoReport,
  type PromoNightTally,
  type PromoReportResult,
} from '@/lib/oddyssey-noir/promo-report-parser';
import {
  renderPromoInvoiceText,
} from '@/lib/oddyssey-noir/promo-report-html';
import { clearState, loadState, saveState } from '@/lib/oddyssey-noir/promo-report-storage';

export default function PromoReportPage() {
  const [result, setResult] = useState<PromoReportResult | null>(null);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = loadState();
    if (cached) {
      setResult(cached.result);
      setSourceFile(cached.result.sourceFile);
      setUploadedAt(cached.uploadedAt);
    }
    // Also check for a server-side pulled snapshot (from cron or manual Pull)
    fetch('/api/oddyssey-noir/audit/pull')
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'ok' && d.snapshot?.result) {
          // Prefer server snapshot only if it's newer than localStorage
          const localAt = cached?.uploadedAt ?? '';
          const serverAt = d.snapshot.persistedAt ?? '';
          if (serverAt > localAt) {
            setResult(d.snapshot.result);
            setSourceFile(d.meta?.filename ?? d.snapshot.result.sourceFile);
            setUploadedAt(serverAt);
            saveState(d.snapshot.result);
          }
        }
      })
      .catch(() => {});
  }, []);

  async function handlePullFromTicketure() {
    setError(null);
    setFlash(null);
    setBusy('pull');
    try {
      const res = await fetch('/api/oddyssey-noir/audit/pull', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.status !== 'ok') {
        const trace = [json.stderr, json.stdout, json.log, json.message].filter(Boolean).join('\n');
        throw new Error(trace.slice(0, 1500) || `Pull failed (${json.stage ?? 'unknown stage'})`);
      }
      const parsed = json.snapshot.result as PromoReportResult;
      saveState(parsed);
      setResult(parsed);
      setSourceFile(json.meta?.filename ?? parsed.sourceFile);
      setUploadedAt(json.snapshot.persistedAt);
      setFlash(`Pulled from Ticketure · ${parsed.totals.promoterRedemptions} promoter redemptions · $${parsed.totals.promoterOwed} owed`);
    } catch (e) {
      setError(`Pull failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setFlash(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = parsePromoReport({ buf, sourceFile: file.name });
      if (parsed.warnings.length > 0 && parsed.promoters.length === 0) {
        setError(parsed.warnings.join('\n'));
        return;
      }
      saveState(parsed);
      setResult(parsed);
      setSourceFile(file.name);
      setUploadedAt(new Date().toISOString());
    } catch (e) {
      setError(`Failed to parse: ${(e as Error).message}`);
    }
  }

  function handleClear() {
    clearState();
    setResult(null);
    setSourceFile(null);
    setUploadedAt(null);
    setError(null);
    setFlash(null);
  }

  async function handlePersist() {
    if (!result) return;
    setBusy('persist');
    setFlash(null);
    try {
      const res = await fetch('/api/oddyssey-noir/promo-report/persist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message ?? 'Persist failed');
      setFlash(`Saved · ${new Date(json.persistedAt).toLocaleString('en-US')}`);
    } catch (e) {
      setError(`Persist failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleSendTest() {
    if (!result) return;
    setBusy('send');
    setFlash(null);
    try {
      const res = await fetch('/api/oddyssey-noir/promo-report/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ result, test: true }),
      });
      const json = await res.json();
      if (json.status !== 'ok') throw new Error(json.message ?? 'Send failed');
      setFlash(`Test email sent to ${(json.recipients ?? []).join(', ')}`);
    } catch (e) {
      setError(`Send failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyInvoice() {
    if (!result) return;
    const text = renderPromoInvoiceText(result);
    try {
      await navigator.clipboard.writeText(text);
      setFlash('Invoice text copied to clipboard.');
    } catch {
      setError('Clipboard write failed. Select the text manually below.');
    }
  }

  return (
    <main style={pageWrap}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/oddyssey-manor/admin" style={breadcrumb}>← Admin</Link>
        </div>

        <header style={{ marginBottom: 36 }}>
          <div style={eyebrow}>Noir · Weekly</div>
          <h1 style={pageTitle}>
            Promo Code <em style={{ color: '#b46ec8' }}>Report.</em>
          </h1>
          <p style={pageSubtitle}>
            Upload the Tixr <code style={code}>ticket_audit</code> xlsx for the weekend.
            The report counts <code style={code}>redeemed</code> + <code style={code}>force_redeemed</code> rows by
            promoter code, joins to <code style={code}>promoter-map.ts</code>, and produces
            an invoice-ready breakdown you can paste straight into iMessage.
          </p>
        </header>

        {/* Upload */}
        <div style={uploadCard}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <div>
            <div style={eyebrowSm}>Drop file</div>
            <div style={{ fontSize: 13, color: '#9a958d', marginTop: 4 }}>
              {sourceFile
                ? <>Loaded: <strong style={{ color: '#e8e4dd' }}>{sourceFile}</strong>{uploadedAt ? <> · {new Date(uploadedAt).toLocaleString('en-US')}</> : null}</>
                : 'No file uploaded yet.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {result && <button onClick={handleClear} style={btnOutline}>Clear</button>}
            <button
              onClick={handlePullFromTicketure}
              disabled={busy === 'pull'}
              style={{ ...btnOutline, opacity: busy === 'pull' ? 0.5 : 1 }}
              title="Run the Playwright script: log into Ticketure, navigate to the Redemption Report, export the xlsx"
            >
              {busy === 'pull' ? 'Pulling… (≈40s)' : 'Pull from Ticketure'}
            </button>
            <button onClick={() => fileInputRef.current?.click()} style={btnPrimary}>
              {result ? 'Replace file' : 'Choose xlsx…'}
            </button>
          </div>
        </div>

        {error && (
          <div style={errorBox}>{error}</div>
        )}
        {flash && (
          <div style={flashBox}>{flash}</div>
        )}

        {result && (
          <>
            {/* Headline */}
            <div style={headlineCard}>
              <div>
                <div style={eyebrowSm}>Weekend</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#e8e4dd', marginTop: 6 }}>
                  {result.weekendLabel}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={eyebrowSm}>Promoter $ owed</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 34, color: '#b46ec8', marginTop: 6 }}>
                  ${result.totals.promoterOwed}
                </div>
                <div style={{ fontSize: 11, color: '#9a958d', marginTop: 4 }}>
                  {result.totals.promoterRedemptions} redemptions
                </div>
              </div>
            </div>

            {/* Per-night promoter tables */}
            <SectionHeader title="Promoter Incentives" accent="#b46ec8" />
            {result.promoters.map((night) => (
              <NightTable key={`promo-${night.date}`} night={night} accent="#b46ec8" showRate />
            ))}
            {result.promoters.every((n) => n.codes.length === 0) && (
              <div style={emptyBox}>No promoter redemptions this weekend.</div>
            )}

            {/* Non-promoter */}
            {result.nonPromoter.some((n) => n.codes.length > 0) && (
              <>
                <SectionHeader title="GM / Guest / Cross-Comp (no incentive)" accent="#9a958d" />
                {result.nonPromoter.map((night) => (
                  night.codes.length > 0 && (
                    <NightTable key={`np-${night.date}`} night={night} accent="#9a958d" showRate={false} />
                  )
                ))}
              </>
            )}

            {/* Unmapped */}
            {result.unmappedCodes.length > 0 && (
              <>
                <SectionHeader title="Unmapped codes" accent="#d4a574" />
                <div style={unmappedBox}>
                  <div style={{ fontSize: 13, color: '#d4a574', marginBottom: 12, lineHeight: 1.5 }}>
                    These codes are in the audit file but missing from{' '}
                    <code style={code}>src/lib/oddyssey-noir/promoter-map.ts</code>. Add
                    them with rate + display name, then re-upload.
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Date</th>
                        <th style={th}>Code</th>
                        <th style={{ ...th, textAlign: 'right' }}>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.unmappedCodes.map((u) => (
                        <tr key={`${u.date}-${u.code}`}>
                          <td style={td}>{shortDate(u.date)}</td>
                          <td style={{ ...td, fontFamily: 'Consolas, monospace' }}>{u.code}</td>
                          <td style={{ ...td, textAlign: 'right', color: '#d4a574' }}>{u.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Invoice text */}
            <SectionHeader title="Invoice-ready text (for iMessage)" accent="#27ae60" />
            <div style={invoiceCard}>
              <pre style={invoicePre}>{renderPromoInvoiceText(result)}</pre>
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={handleCopyInvoice} style={btnPrimary}>Copy to clipboard</button>
                <button
                  onClick={handlePersist}
                  disabled={busy === 'persist'}
                  style={{ ...btnOutline, opacity: busy === 'persist' ? 0.5 : 1 }}
                >
                  {busy === 'persist' ? 'Saving…' : 'Save for Monday email'}
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={busy === 'send'}
                  style={{ ...btnOutline, opacity: busy === 'send' ? 0.5 : 1 }}
                >
                  {busy === 'send' ? 'Sending…' : 'Send test to me'}
                </button>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div style={warningBox}>
                {result.warnings.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Components ──────────────────────────────────────────────────────────

function SectionHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{
      marginTop: 40, marginBottom: 14,
      fontFamily: 'Consolas, monospace', fontSize: 10, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: accent,
    }}>
      {title}
    </div>
  );
}

function NightTable({
  night, accent, showRate,
}: {
  night: PromoNightTally;
  accent: string;
  showRate: boolean;
}) {
  const total = night.codes.reduce((a, c) => a + c.count, 0);
  const owed = night.codes.reduce((a, c) => a + c.owed, 0);
  if (night.codes.length === 0) return null;
  return (
    <div style={{ marginBottom: 18, border: '1px solid rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
      <div style={{
        padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{ fontFamily: 'Consolas, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent }}>
          {night.dayOfWeek === 'fri' ? 'Friday' : 'Saturday'} · {shortDate(night.date)}
        </span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#e8e4dd' }}>
          {total} redemption{total === 1 ? '' : 's'}
          {showRate && owed > 0 && <span style={{ color: accent, marginLeft: 10 }}>${owed}</span>}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Promoter</th>
            <th style={th}>Code</th>
            <th style={{ ...th, textAlign: 'right' }}>Count</th>
            {showRate && <th style={{ ...th, textAlign: 'right' }}>Rate</th>}
            {showRate && <th style={{ ...th, textAlign: 'right' }}>Owed</th>}
          </tr>
        </thead>
        <tbody>
          {night.codes.map((c) => (
            <tr key={c.code}>
              <td style={{ ...td, fontFamily: 'Georgia, serif', fontSize: 15 }}>
                {c.mapped?.displayName ?? c.code}
              </td>
              <td style={{ ...td, fontFamily: 'Consolas, monospace', fontSize: 11, color: '#9a958d' }}>
                {c.code}
              </td>
              <td style={{ ...td, textAlign: 'right', fontFamily: 'Georgia, serif', fontSize: 18, color: accent }}>
                {c.count}
              </td>
              {showRate && (
                <td style={{ ...td, textAlign: 'right', fontSize: 12, color: '#9a958d' }}>
                  ${c.rate}
                </td>
              )}
              {showRate && (
                <td style={{ ...td, textAlign: 'right', fontFamily: 'Georgia, serif', fontSize: 15, color: '#e8e4dd' }}>
                  ${c.owed}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function shortDate(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

// ─── Styles ──────────────────────────────────────────────────────────────

const pageWrap: React.CSSProperties = {
  background: '#060606', color: '#e8e4dd', minHeight: '100vh',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  padding: '48px 24px 96px',
};

const breadcrumb: React.CSSProperties = {
  fontFamily: 'Consolas, monospace', fontSize: 11, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: '#9a958d', textDecoration: 'none',
};

const eyebrow: React.CSSProperties = {
  fontFamily: 'Consolas, monospace', fontSize: 10.5, letterSpacing: '0.22em',
  textTransform: 'uppercase', color: '#b46ec8', marginBottom: 12,
};

const eyebrowSm: React.CSSProperties = {
  fontFamily: 'Consolas, monospace', fontSize: 10, letterSpacing: '0.2em',
  textTransform: 'uppercase', color: '#9a958d',
};

const pageTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 44, fontWeight: 300, lineHeight: 1.1, margin: 0, letterSpacing: 1,
};

const pageSubtitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 17, color: '#9a958d', fontStyle: 'italic',
  marginTop: 14, maxWidth: 640, lineHeight: 1.5,
};

const code: React.CSSProperties = {
  fontFamily: 'Consolas, monospace', fontSize: 13, color: '#c9a84c',
};

const uploadCard: React.CSSProperties = {
  padding: '18px 24px', marginBottom: 24,
  background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  flexWrap: 'wrap', gap: 16,
};

const headlineCard: React.CSSProperties = {
  marginTop: 28, padding: '24px 28px',
  background: '#0d0d0d', border: '1px solid rgba(180,110,200,0.3)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  flexWrap: 'wrap', gap: 24,
};

const invoiceCard: React.CSSProperties = {
  padding: '18px 22px', background: '#0d0d0d',
  border: '1px solid rgba(39,174,96,0.25)',
};

const invoicePre: React.CSSProperties = {
  margin: 0, padding: 0, whiteSpace: 'pre-wrap',
  fontFamily: 'Consolas, monospace', fontSize: 13, lineHeight: 1.6,
  color: '#e8e4dd', userSelect: 'all',
};

const errorBox: React.CSSProperties = {
  margin: '20px 0', padding: '14px 18px', whiteSpace: 'pre-wrap',
  border: '1px solid rgba(192,57,43,0.45)', background: 'rgba(192,57,43,0.06)',
  fontSize: 13, color: '#e07060', fontFamily: 'Consolas, monospace',
};

const flashBox: React.CSSProperties = {
  margin: '20px 0', padding: '14px 18px',
  border: '1px solid rgba(39,174,96,0.45)', background: 'rgba(39,174,96,0.06)',
  fontSize: 13, color: '#5bbf7a',
};

const warningBox: React.CSSProperties = {
  marginTop: 24, padding: '12px 16px',
  border: '1px solid rgba(212,165,116,0.35)', background: 'rgba(212,165,116,0.06)',
  fontSize: 12, color: '#d4a574',
};

const emptyBox: React.CSSProperties = {
  padding: '24px 28px', textAlign: 'center', color: '#9a958d',
  border: '1px dashed rgba(255,255,255,0.1)',
};

const unmappedBox: React.CSSProperties = {
  padding: '18px 22px', background: 'rgba(212,165,116,0.04)',
  border: '1px solid rgba(212,165,116,0.35)',
};

const th: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontFamily: 'Consolas, monospace', fontSize: 9, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: '#5a5650', fontWeight: 500,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const td: React.CSSProperties = {
  padding: '10px 16px',
  borderTop: '1px solid rgba(255,255,255,0.04)',
  color: '#e8e4dd',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-block', padding: '10px 22px', background: '#b46ec8', color: '#060606',
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
  cursor: 'pointer', border: 'none', fontFamily: 'Consolas, monospace',
};

const btnOutline: React.CSSProperties = {
  padding: '10px 22px', background: 'transparent', color: '#9a958d',
  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.18)',
  fontFamily: 'Consolas, monospace',
};
