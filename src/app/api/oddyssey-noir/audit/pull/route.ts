/**
 * Runs scripts/oddyssey-audit-pull.ts to download the Ticketure Redemption
 * Report xlsx, then parses it via parsePromoReport and persists the parsed
 * result to data/oddyssey-noir/audit/latest.json (the same path the manual
 * upload writes to, so the Monday email reads one source of truth).
 *
 * GET — return metadata + parsed result from the most recent pull
 * POST — trigger a fresh pull. Body: { from?, until? } (YYYY-MM-DD)
 */

import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { parsePromoReport, type PromoReportResult } from '@/lib/oddyssey-noir/promo-report-parser';

export const runtime = 'nodejs';

const AUDIT_DIR = path.resolve(process.cwd(), 'data/oddyssey-noir/audit');
const LATEST_XLSX = path.join(AUDIT_DIR, 'latest.xlsx');
const LATEST_META = path.join(AUDIT_DIR, 'latest-meta.json');
const LATEST_JSON = path.join(AUDIT_DIR, 'latest.json');

interface PullMeta {
  filename: string;
  path: string;
  suggestedFilename: string;
  pulled_at: string;
  from: string;
  until: string;
  size_bytes: number;
}

interface PersistedSnapshot {
  result: PromoReportResult;
  persistedAt: string;
}

function runScript(scriptPath: string, args: string[]) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const proc = spawn('npx', ['tsx', scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function GET() {
  try {
    const metaRaw = await fs.readFile(LATEST_META, 'utf-8').catch(() => null);
    const snapshotRaw = await fs.readFile(LATEST_JSON, 'utf-8').catch(() => null);
    return NextResponse.json({
      status: snapshotRaw ? 'ok' : 'empty',
      meta: metaRaw ? (JSON.parse(metaRaw) as PullMeta) : null,
      snapshot: snapshotRaw ? (JSON.parse(snapshotRaw) as PersistedSnapshot) : null,
    });
  } catch (e) {
    return NextResponse.json({ status: 'error', message: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const from: string | undefined = body?.from;
  const until: string | undefined = body?.until;

  const args: string[] = [];
  if (from) args.push(`--from=${from}`);
  if (until) args.push(`--until=${until}`);

  console.log(`[audit-pull-route] starting script with args: ${args.join(' ') || '(none)'}`);
  const result = await runScript('scripts/oddyssey-audit-pull.ts', args);
  if (result.code !== 0) {
    return NextResponse.json(
      {
        status: 'error',
        stage: 'pull-script',
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      },
      { status: 500 },
    );
  }

  // Parse the downloaded xlsx
  let xlsxBuf: Buffer;
  try {
    xlsxBuf = await fs.readFile(LATEST_XLSX);
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        stage: 'read-xlsx',
        message: `Script reported success but ${LATEST_XLSX} not found`,
        log: result.stdout,
      },
      { status: 500 },
    );
  }

  let meta: PullMeta | null = null;
  try {
    meta = JSON.parse(await fs.readFile(LATEST_META, 'utf-8')) as PullMeta;
  } catch {
    // Non-fatal — proceed without meta
  }

  let parsed: PromoReportResult;
  try {
    parsed = parsePromoReport({
      buf: xlsxBuf,
      sourceFile: meta?.filename ?? 'latest.xlsx',
    });
  } catch (e) {
    return NextResponse.json(
      { status: 'error', stage: 'parse', message: String(e) },
      { status: 500 },
    );
  }

  // Persist to the same path the manual upload uses
  const snapshot: PersistedSnapshot = {
    result: parsed,
    persistedAt: new Date().toISOString(),
  };
  await fs.writeFile(LATEST_JSON, JSON.stringify(snapshot, null, 2), 'utf-8');

  return NextResponse.json({
    status: 'ok',
    meta,
    snapshot,
    log: result.stdout,
  });
}
