/**
 * Persist a parsed PromoReportResult to disk so the Monday cron recap can
 * include it without re-parsing the source xlsx. PII (names, emails, phones
 * from cols G/H/AK of the audit) is NOT in the parsed result — only codes
 * and counts — so this file is safe to ship to the email job.
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { PromoReportResult } from '@/lib/oddyssey-noir/promo-report-parser';

export const runtime = 'nodejs';

const AUDIT_DIR = path.resolve(process.cwd(), 'data/oddyssey-noir/audit');
const LATEST_PATH = path.join(AUDIT_DIR, 'latest.json');

interface PersistedSnapshot {
  result: PromoReportResult;
  persistedAt: string;
}

export async function POST(request: Request) {
  let result: PromoReportResult;
  try {
    const body = await request.json();
    result = body.result as PromoReportResult;
    if (!result || typeof result !== 'object' || !Array.isArray(result.promoters)) {
      return NextResponse.json({ status: 'error', message: 'Invalid result payload.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ status: 'error', message: 'Bad JSON.' }, { status: 400 });
  }

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const snapshot: PersistedSnapshot = { result, persistedAt: new Date().toISOString() };
  fs.writeFileSync(LATEST_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');
  return NextResponse.json({
    status: 'ok',
    persistedAt: snapshot.persistedAt,
    weekendStart: result.weekendStart,
    weekendEnd: result.weekendEnd,
    path: LATEST_PATH,
  });
}

export async function GET() {
  try {
    const raw = fs.readFileSync(LATEST_PATH, 'utf-8');
    const snapshot = JSON.parse(raw) as PersistedSnapshot;
    return NextResponse.json({ status: 'ok', ...snapshot });
  } catch {
    return NextResponse.json({ status: 'empty', message: 'No persisted promo report yet.' }, { status: 404 });
  }
}
