/**
 * Client-side localStorage cache for the last-uploaded promo report.
 * Lets Brandon refresh the page without re-uploading the file.
 */

import type { PromoReportResult } from './promo-report-parser';

const KEY = 'noir.promoReport.v1';

interface StoredState {
  result: PromoReportResult;
  uploadedAt: string;
}

export function saveState(result: PromoReportResult): void {
  if (typeof window === 'undefined') return;
  try {
    const stored: StoredState = { result, uploadedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch (e) {
    console.error('Failed to save promo report state:', e);
  }
}

export function loadState(): StoredState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch (e) {
    console.error('Failed to load promo report state:', e);
    return null;
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
