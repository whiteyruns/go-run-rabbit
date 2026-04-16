"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Artist {
  id: string;
  stageName: string;
}
interface Sponsor {
  name: string;
  role: string;
  category: string;
  note?: string;
}
interface Photo {
  slug: string;
  alt: string;
  credit: string;
  caption?: string;
}
interface Photos {
  hero?: Photo;
  polaroid?: Photo;
  portrait?: Photo;
  gallery: Photo[];
}
interface Coverage {
  hourly: boolean;
  duration: boolean;
  demographics: boolean;
  destinations: boolean;
  hotels: boolean;
  originStates: boolean;
  originDMAs: boolean;
}

export interface RecapFormValues {
  eventId: string; // URL-slug
  status: "draft" | "published";
  headliner: string;
  eventDate: string;
  eventDay: string;
  artistId: string | null;
  placerDataText: string; // edited as JSON text
  coverage: Coverage;
  photos: Photos;
  sponsors: Sponsor[];
}

const empty: RecapFormValues = {
  eventId: "",
  status: "draft",
  headliner: "",
  eventDate: "",
  eventDay: "",
  artistId: null,
  placerDataText: JSON.stringify(
    {
      metrics: [],
      hourly: [],
      duration: [],
      demographics: [],
      destinations: [],
      hotels: [],
      originStates: [],
      originDMAs: [],
    },
    null,
    2,
  ),
  coverage: {
    hourly: false,
    duration: false,
    demographics: false,
    destinations: false,
    hotels: false,
    originStates: false,
    originDMAs: false,
  },
  photos: { gallery: [] },
  sponsors: [],
};

interface CloneTemplate {
  id: string;
  label: string;
  placerData: unknown;
  coverage: Coverage;
  sponsors: Sponsor[];
}

export function RecapForm({
  initial,
  artists,
  cloneTemplates = [],
  isNew,
}: {
  initial?: Partial<RecapFormValues>;
  artists: Artist[];
  cloneTemplates?: CloneTemplate[];
  isNew: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RecapFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const set = <K extends keyof RecapFormValues>(k: K, v: RecapFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const parsePlacerOrThrow = () => {
    try {
      const parsed = JSON.parse(values.placerDataText);
      setJsonError(null);
      return parsed;
    } catch (e) {
      setJsonError(`Invalid JSON: ${(e as Error).message}`);
      throw e;
    }
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    let placerData;
    try {
      placerData = parsePlacerOrThrow();
    } catch {
      setSaving(false);
      return;
    }
    const payload = {
      eventId: values.eventId,
      headliner: values.headliner,
      eventDate: values.eventDate,
      eventDay: values.eventDay,
      artistId: values.artistId,
      placerData,
      coverage: values.coverage,
      photos: values.photos,
      sponsors: values.sponsors,
    };
    try {
      const url = isNew
        ? "/api/ftb-admin/recaps"
        : `/api/ftb-admin/recaps/${values.eventId}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      if (isNew) {
        router.push(
          `/corner-bar-management/feed-the-block/recaps/${values.eventId}/edit`,
        );
      } else {
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ftb-admin/recaps/${values.eventId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: values.status === "published" ? "unpublish" : "publish",
          }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      const j = await res.json();
      set("status", j.recap.status);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete recap for ${values.headliner}? This cannot be undone.`))
      return;
    const res = await fetch(`/api/ftb-admin/recaps/${values.eventId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/corner-bar-management/feed-the-block/recaps");
      router.refresh();
    }
  };

  const loadTemplate = (id: string) => {
    const tpl = cloneTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setValues((prev) => ({
      ...prev,
      placerDataText: JSON.stringify(tpl.placerData, null, 2),
      coverage: tpl.coverage,
      sponsors: tpl.sponsors.length > 0 ? tpl.sponsors : prev.sponsors,
    }));
  };

  return (
    <form onSubmit={save} className="space-y-8">
      {/* Basics */}
      <fieldset className="space-y-6">
        <legend className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
          Event Basics
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Event ID (URL slug) *"
            value={values.eventId}
            onChange={(v) => set("eventId", v)}
            placeholder="marshmello-apr2-2026"
            required
            disabled={!isNew}
          />
          <TextField
            label="Headliner *"
            value={values.headliner}
            onChange={(v) => set("headliner", v)}
            placeholder="Marshmello"
            required
          />
          <TextField
            label="Event Date *"
            value={values.eventDate}
            onChange={(v) => set("eventDate", v)}
            placeholder="April 2, 2026"
            required
          />
          <TextField
            label="Day of Week *"
            value={values.eventDay}
            onChange={(v) => set("eventDay", v)}
            placeholder="Wednesday"
            required
          />
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-70 mb-2">
              Artist
            </label>
            <select
              value={values.artistId ?? ""}
              onChange={(e) => set("artistId", e.target.value || null)}
              className="w-full bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-sm focus:border-[#aea2ff] outline-none"
            >
              <option value="">— no artist yet —</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.stageName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Placer data */}
      <fieldset>
        <div className="flex items-center justify-between mb-2">
          <legend className="text-[10px] uppercase tracking-widest opacity-60">
            Placer.ai Data (JSON)
          </legend>
          {cloneTemplates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest opacity-50">
                Clone structure from:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) loadTemplate(e.target.value);
                  e.currentTarget.value = "";
                }}
                className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-1 text-xs"
              >
                <option value="">Pick event…</option>
                {cloneTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <textarea
          value={values.placerDataText}
          onChange={(e) => set("placerDataText", e.target.value)}
          rows={16}
          className="w-full bg-[#0e0e11] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-xs font-mono focus:border-[#aea2ff] outline-none"
        />
        {jsonError && (
          <p className="text-[#ff6b98] text-xs mt-2">{jsonError}</p>
        )}
        <p className="text-[10px] opacity-50 mt-2">
          Shape: {`{ metrics[], hourly[], duration[], demographics[], destinations[], hotels[], originStates[], originDMAs[] }`}. Use &ldquo;Clone structure from&rdquo; above for a filled-in template.
        </p>
      </fieldset>

      {/* Coverage */}
      <fieldset>
        <legend className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
          Data Coverage
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              "hourly",
              "duration",
              "demographics",
              "destinations",
              "hotels",
              "originStates",
              "originDMAs",
            ] as const
          ).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.coverage[k]}
                onChange={(e) =>
                  set("coverage", { ...values.coverage, [k]: e.target.checked })
                }
              />
              <span className="opacity-80">{k}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Sponsors */}
      <fieldset>
        <div className="flex items-center justify-between mb-2">
          <legend className="text-[10px] uppercase tracking-widest opacity-60">
            Sponsors (per-event)
          </legend>
          <button
            type="button"
            onClick={() =>
              set("sponsors", [
                ...values.sponsors,
                { name: "", role: "", category: "" },
              ])
            }
            className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
          >
            + Add Sponsor
          </button>
        </div>
        <div className="space-y-2">
          {values.sponsors.map((s, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <input
                value={s.name}
                onChange={(e) => {
                  const next = [...values.sponsors];
                  next[i] = { ...next[i], name: e.target.value };
                  set("sponsors", next);
                }}
                placeholder="Name"
                className="md:col-span-3 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
              <input
                value={s.role}
                onChange={(e) => {
                  const next = [...values.sponsors];
                  next[i] = { ...next[i], role: e.target.value };
                  set("sponsors", next);
                }}
                placeholder="Role (e.g. Founding Municipal Partner)"
                className="md:col-span-4 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
              <input
                value={s.category}
                onChange={(e) => {
                  const next = [...values.sponsors];
                  next[i] = { ...next[i], category: e.target.value };
                  set("sponsors", next);
                }}
                placeholder="Category"
                className="md:col-span-2 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
              <input
                value={s.note ?? ""}
                onChange={(e) => {
                  const next = [...values.sponsors];
                  next[i] = { ...next[i], note: e.target.value };
                  set("sponsors", next);
                }}
                placeholder="Note (optional)"
                className="md:col-span-2 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "sponsors",
                    values.sponsors.filter((_, j) => j !== i),
                  )
                }
                className="md:col-span-1 text-[#ff6b98] text-xs hover:underline"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {error && (
        <div className="bg-[rgba(255,107,152,0.1)] border border-[#ff6b98] px-4 py-3 text-sm text-[#ff6b98]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[rgba(174,162,255,0.12)]">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85 disabled:opacity-40"
          >
            {saving ? "Saving…" : isNew ? "Create Draft" : "Save Changes"}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={togglePublish}
              disabled={publishing}
              className={`px-6 py-3 text-xs uppercase tracking-widest font-semibold border hover:opacity-85 disabled:opacity-40 ${
                values.status === "published"
                  ? "border-[#c9912b] text-[#c9912b]"
                  : "border-[#00eefc] text-[#00eefc] hover:bg-[#00eefc] hover:text-[#0e0e11]"
              }`}
            >
              {publishing
                ? "…"
                : values.status === "published"
                  ? "Unpublish"
                  : "Publish"}
            </button>
          )}
          {!isNew && values.status === "draft" && (
            <a
              href={`/recap/ftb-editorial/${values.eventId}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 text-xs uppercase tracking-widest font-semibold border border-[rgba(174,162,255,0.3)] hover:bg-[rgba(174,162,255,0.08)]"
            >
              Preview Draft
            </a>
          )}
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={remove}
            className="px-4 py-3 text-xs uppercase tracking-widest text-[#ff6b98] hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest opacity-70 mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-sm focus:border-[#aea2ff] outline-none disabled:opacity-50"
      />
    </div>
  );
}
