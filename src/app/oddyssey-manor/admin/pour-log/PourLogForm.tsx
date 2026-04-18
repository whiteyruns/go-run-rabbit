'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { submitPourLog, type SubmitResult } from './actions';
import styles from './pour-log.module.css';

// Keep client-safe labels inlined — avoid pulling lib.ts (server-only) into this file.
const NIGHT_THEME_OPTIONS = [
  { value: 'LG', label: 'Liquid Gold (Friday)' },
  { value: 'AIM', label: 'Art in Motion (Saturday)' },
] as const;

const TEQUILA_OPTIONS = ['El Bandido', 'Telsen'] as const;

type Cocktails = { paloma: number; spicyMargarita: number; tequilaSoda: number };

export type PourLogDefaults = {
  date: string;
  nightTheme: 'LG' | 'AIM';
  featuredTequila: string;
  champagne: string;
  filedBy: string;
  tequilaOpened?: string;
  tequilaLeftAtClose?: string;
  champagneOpened?: string;
  champagneLeftAtClose?: string;
  cocktails?: Cocktails;
  notes?: string;
};

type FormState = {
  date: string;
  nightTheme: 'LG' | 'AIM';
  featuredTequila: string;
  champagne: string;
  tequilaOpened: string;
  tequilaLeftAtClose: string;
  champagneOpened: string;
  champagneLeftAtClose: string;
  cocktails: Cocktails;
  notes: string;
  filedBy: string;
};

function toNum(raw: string): number {
  if (raw === '' || raw == null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function computeConsumed(opened: string, leftAtClose: string): string {
  const diff = toNum(opened) - toNum(leftAtClose);
  if (!Number.isFinite(diff) || diff <= 0) return '0';
  const rounded = Math.round(diff * 10) / 10;
  return rounded.toString();
}

const AUTOSAVE_KEY = 'oddyssey:pour-log:draft';

export default function PourLogForm({ defaults }: { defaults: PourLogDefaults }) {
  const [state, setState] = useState<FormState>({
    date: defaults.date,
    nightTheme: defaults.nightTheme,
    featuredTequila: defaults.featuredTequila,
    champagne: defaults.champagne,
    tequilaOpened: defaults.tequilaOpened ?? '',
    tequilaLeftAtClose: defaults.tequilaLeftAtClose ?? '',
    champagneOpened: defaults.champagneOpened ?? '',
    champagneLeftAtClose: defaults.champagneLeftAtClose ?? '',
    cocktails: defaults.cocktails ?? { paloma: 0, spicyMargarita: 0, tequilaSoda: 0 },
    notes: defaults.notes ?? '',
    filedBy: defaults.filedBy,
  });
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Restore draft on mount — only if we're not editing an existing server-saved entry
  // (server entry should always win; otherwise stale drafts could clobber correct data).
  // Drafts are scoped by date so navigating between dates doesn't cross-contaminate.
  const isEditingExisting = Boolean(defaults.tequilaOpened || defaults.champagneOpened);
  useEffect(() => {
    if (typeof window === 'undefined' || isEditingExisting) return;
    try {
      const raw = window.localStorage.getItem(`${AUTOSAVE_KEY}:${defaults.date}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<FormState>;
      setState((prev) => ({ ...prev, ...saved }));
    } catch {
      // ignore corrupted drafts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults.date, isEditingExisting]);

  // Autosave draft on change (client-only, photo excluded, scoped by date)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${AUTOSAVE_KEY}:${state.date}`, JSON.stringify(state));
    } catch {
      // storage full / disabled — non-fatal
    }
  }, [state]);

  const tequilaConsumed = useMemo(
    () => computeConsumed(state.tequilaOpened, state.tequilaLeftAtClose),
    [state.tequilaOpened, state.tequilaLeftAtClose],
  );
  const champagneConsumed = useMemo(
    () => computeConsumed(state.champagneOpened, state.champagneLeftAtClose),
    [state.champagneOpened, state.champagneLeftAtClose],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function bumpCocktail(key: keyof Cocktails, delta: number) {
    setState((prev) => ({
      ...prev,
      cocktails: {
        ...prev.cocktails,
        [key]: Math.max(0, prev.cocktails[key] + delta),
      },
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoName(file ? file.name : null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Inject computed cocktail counts (they're managed in state, not form fields)
    formData.set('cocktailPaloma', String(state.cocktails.paloma));
    formData.set('cocktailSpicyMargarita', String(state.cocktails.spicyMargarita));
    formData.set('cocktailTequilaSoda', String(state.cocktails.tequilaSoda));

    startTransition(async () => {
      const result = await submitPourLog(formData);
      setStatus(result);
      if (result.ok) {
        // Clear draft + photo on success; leave typed values visible for edit-after-submit.
        try { window.localStorage.removeItem(`${AUTOSAVE_KEY}:${state.date}`); } catch {}
        if (photoRef.current) photoRef.current.value = '';
        setPhotoName(null);
        // Scroll the status banner into view
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  return (
    <form ref={formRef} className={styles.fieldGrid} onSubmit={onSubmit} encType="multipart/form-data">
      {status && (
        <div className={`${styles.status} ${status.ok ? styles.success : styles.error}`} role="status" aria-live="polite">
          {status.ok ? (
            <>
              <strong>Saved.</strong>{' '}
              Logged {status.entry.tequila.consumed} btl {status.entry.featuredTequila} ·{' '}
              {status.entry.champagneBottles.consumed} btl {status.entry.champagne} for{' '}
              {status.entry.date} ({status.entry.nightTheme}).
            </>
          ) : (
            <>
              <strong>Couldn&apos;t save.</strong> {status.error}
              {status.field ? ` (field: ${status.field})` : ''}
            </>
          )}
        </div>
      )}

      {/* ─── Night setup ─── */}
      <section className={styles.section}>
        <div className={styles.sectLabel}>Night Setup</div>
        <div className={styles.fieldGrid}>
          <div className={`${styles.fieldRow} ${styles.two}`}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="date">
                Date <span className={styles.req}>*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className={styles.input}
                value={state.date}
                onChange={(e) => update('date', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nightTheme">
                Night Theme <span className={styles.req}>*</span>
              </label>
              <select
                id="nightTheme"
                name="nightTheme"
                className={styles.select}
                value={state.nightTheme}
                onChange={(e) => update('nightTheme', e.target.value as 'LG' | 'AIM')}
                required
              >
                {NIGHT_THEME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`${styles.fieldRow} ${styles.two}`}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="featuredTequila">
                Featured Tequila <span className={styles.req}>*</span>
              </label>
              <select
                id="featuredTequila"
                name="featuredTequila"
                className={styles.select}
                value={state.featuredTequila}
                onChange={(e) => update('featuredTequila', e.target.value)}
                required
              >
                {TEQUILA_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                {state.featuredTequila && !TEQUILA_OPTIONS.some((t) => t === state.featuredTequila) && (
                  <option value={state.featuredTequila}>{state.featuredTequila}</option>
                )}
              </select>
              <span className={styles.hint}>Rotates by night · 1.5oz pour spec</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="champagne">Champagne</label>
              <input
                id="champagne"
                name="champagne"
                type="text"
                className={styles.input}
                value={state.champagne}
                onChange={(e) => update('champagne', e.target.value)}
              />
              <span className={styles.hint}>2oz pour spec</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tequila bottles ─── */}
      <section className={styles.section}>
        <div className={styles.sectLabel}>Tequila · Bottles</div>
        <div className={`${styles.fieldRow} ${styles.three}`}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tequilaOpened">Opened</label>
            <input
              id="tequilaOpened"
              name="tequilaOpened"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={styles.input}
              value={state.tequilaOpened}
              onChange={(e) => update('tequilaOpened', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tequilaLeftAtClose">Left at Close</label>
            <input
              id="tequilaLeftAtClose"
              name="tequilaLeftAtClose"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={styles.input}
              value={state.tequilaLeftAtClose}
              onChange={(e) => update('tequilaLeftAtClose', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Consumed (auto)</label>
            <input
              type="text"
              className={`${styles.input} ${styles.computed}`}
              value={`${tequilaConsumed} btl`}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          </div>
        </div>
      </section>

      {/* ─── Champagne bottles ─── */}
      <section className={styles.section}>
        <div className={styles.sectLabel}>Champagne · Bottles</div>
        <div className={`${styles.fieldRow} ${styles.three}`}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="champagneOpened">Opened</label>
            <input
              id="champagneOpened"
              name="champagneOpened"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={styles.input}
              value={state.champagneOpened}
              onChange={(e) => update('champagneOpened', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="champagneLeftAtClose">Left at Close</label>
            <input
              id="champagneLeftAtClose"
              name="champagneLeftAtClose"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={styles.input}
              value={state.champagneLeftAtClose}
              onChange={(e) => update('champagneLeftAtClose', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Consumed (auto)</label>
            <input
              type="text"
              className={`${styles.input} ${styles.computed}`}
              value={`${champagneConsumed} btl`}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          </div>
        </div>
      </section>

      {/* ─── Cocktail counters ─── */}
      <section className={styles.section}>
        <div className={styles.sectLabel}>Featured Cocktails (optional)</div>
        <div className={styles.cocktailList}>
          <CocktailCounter
            name="Paloma"
            spec="1.5oz tequila + grapefruit + soda"
            value={state.cocktails.paloma}
            onStep={(d) => bumpCocktail('paloma', d)}
          />
          <CocktailCounter
            name="Spicy Margarita"
            spec="1.5oz tequila + jalapeño + lime"
            value={state.cocktails.spicyMargarita}
            onStep={(d) => bumpCocktail('spicyMargarita', d)}
          />
          <CocktailCounter
            name="Tequila Soda"
            spec="1.5oz tequila + soda"
            value={state.cocktails.tequilaSoda}
            onStep={(d) => bumpCocktail('tequilaSoda', d)}
          />
        </div>
        <div className={styles.hint} style={{ marginTop: 10 }}>
          Skippable. Bottle counts above are what drive the sponsor recap.
        </div>
      </section>

      {/* ─── Notes + photo + filer ─── */}
      <section className={styles.section}>
        <div className={styles.sectLabel}>Night Notes</div>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="notes">Quick read on the night</label>
            <textarea
              id="notes"
              name="notes"
              className={styles.textarea}
              rows={3}
              value={state.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Crowd feel, pour pace, signage or staffing issues, sponsor rep walk-through…"
            />
          </div>
          <div className={`${styles.fieldRow} ${styles.two}`}>
            <div className={styles.photoField}>
              <label className={styles.label} htmlFor="photo">Photo — bar / signage (optional)</label>
              <input
                ref={photoRef}
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                className={styles.photoInput}
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo" className={`${styles.photoLabel} ${photoName ? styles.hasFile : ''}`}>
                {photoName ?? 'Tap to take / upload photo'}
              </label>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="filedBy">Filed by</label>
              <input
                id="filedBy"
                name="filedBy"
                type="text"
                className={styles.input}
                value={state.filedBy}
                onChange={(e) => update('filedBy', e.target.value)}
                placeholder="e.g. Alex · GM"
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.submitRow}>
        <span className={styles.saveNote}>
          Draft autosaves to this device. Submitting writes to the server and refreshes the sponsor recap.
        </span>
        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit Night'}
        </button>
      </div>
    </form>
  );
}

function CocktailCounter({
  name,
  spec,
  value,
  onStep,
}: {
  name: string;
  spec: string;
  value: number;
  onStep: (delta: number) => void;
}) {
  return (
    <div className={styles.cocktailRow}>
      <div>
        <div className={styles.cocktailName}>{name}</div>
        <span className={styles.cocktailSpec}>{spec}</span>
      </div>
      <button
        type="button"
        className={styles.step}
        onClick={() => onStep(-1)}
        disabled={value === 0}
        aria-label={`Decrease ${name}`}
      >
        −
      </button>
      <div className={styles.stepVal} aria-live="polite" aria-atomic="true">
        {value}
      </div>
      <button
        type="button"
        className={styles.step}
        onClick={() => onStep(1)}
        aria-label={`Increase ${name}`}
      >
        +
      </button>
    </div>
  );
}
