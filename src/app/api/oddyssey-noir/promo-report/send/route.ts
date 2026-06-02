/**
 * Send the promo report as a standalone Resend email. Mirrors the recap
 * route's auth + Resend boilerplate. Defaults to test-mode (only sends to
 * the operator) unless body.recipients is provided OR body.confirmProd=true.
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  renderPromoReportStandalone,
  renderPromoInvoiceText,
} from '@/lib/oddyssey-noir/promo-report-html';
import type { PromoReportResult } from '@/lib/oddyssey-noir/promo-report-parser';

export const runtime = 'nodejs';

const OPERATOR = 'kwhite@consultant.area15.com';
const BRANDON = 'bpereyda@area15.com';
const LATEST_JSON = path.resolve(process.cwd(), 'data/oddyssey-noir/audit/latest.json');

interface PersistedSnapshot {
  result: PromoReportResult;
  persistedAt: string;
}

async function loadPersistedResult(): Promise<PromoReportResult | null> {
  try {
    const raw = await fs.readFile(LATEST_JSON, 'utf-8');
    const snapshot = JSON.parse(raw) as PersistedSnapshot;
    return snapshot.result ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: { result?: PromoReportResult; recipients?: string[]; test?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'error', message: 'Bad JSON.' }, { status: 400 });
  }
  // Body result takes precedence; fall back to persisted snapshot (for cron jobs).
  const result = body.result ?? (await loadPersistedResult());
  if (!result || !Array.isArray(result.promoters)) {
    return NextResponse.json(
      { status: 'error', message: 'No promo report available — upload or pull first.' },
      { status: 400 },
    );
  }

  const recipients = body.recipients ?? (body.test === false ? [BRANDON, OPERATOR] : [OPERATOR]);
  const subject = body.test === false
    ? `Noir Promo Report · ${result.weekendLabel}`
    : `[TEST] Noir Promo Report · ${result.weekendLabel}`;

  const html = renderPromoReportStandalone(result);
  const text = renderPromoInvoiceText(result);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      status: 'error',
      message: 'RESEND_API_KEY missing',
      subject,
      recipients,
    }, { status: 500 });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error, data } = await resend.emails.send({
      from: 'Keith @ Go Run Rabbit <keith@gorunrabbit.com>',
      to: recipients,
      subject,
      html,
      text,
    });
    if (error) {
      return NextResponse.json({ status: 'error', message: error.message, recipients }, { status: 500 });
    }
    return NextResponse.json({
      status: 'ok',
      resend_id: data?.id,
      subject,
      recipients,
      weekend: result.weekendLabel,
      stats: result.totals,
    });
  } catch (e) {
    return NextResponse.json({ status: 'error', message: String(e) }, { status: 500 });
  }
}
