"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  title: string;
  feature?: string;
  peak?: string;
  released?: string;
}
interface Reach {
  platform: string;
  metric: string;
  label: string;
}

export interface ArtistFormValues {
  id?: string;
  stageName: string;
  realName: string;
  born: string;
  nationality: string;
  yearsActive: string;
  signature: string;
  bio: string;
  genres: string[];
  hits: Hit[];
  milestones: string[];
  reach: Reach[];
}

const empty: ArtistFormValues = {
  stageName: "",
  realName: "",
  born: "",
  nationality: "",
  yearsActive: "",
  signature: "",
  bio: "",
  genres: [],
  hits: [],
  milestones: [],
  reach: [],
};

export function ArtistForm({ initial }: { initial?: Partial<ArtistFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<ArtistFormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ArtistFormValues>(
    key: K,
    v: ArtistFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = values.id
      ? `/api/ftb-admin/artists/${values.id}`
      : "/api/ftb-admin/artists";
    const method = values.id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      router.push("/corner-bar-management/feed-the-block/artists");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!values.id) return;
    if (!confirm(`Delete ${values.stageName}? This cannot be undone.`)) return;
    const res = await fetch(`/api/ftb-admin/artists/${values.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/corner-bar-management/feed-the-block/artists");
      router.refresh();
    } else {
      alert("Delete failed — artist may still be linked to a recap.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Stage Name *"
          value={values.stageName}
          onChange={(v) => set("stageName", v)}
          required
        />
        <TextField
          label="Real Name *"
          value={values.realName}
          onChange={(v) => set("realName", v)}
          required
        />
        <TextField
          label="Born (e.g. 'May 19, 1992 · Philadelphia, PA')"
          value={values.born}
          onChange={(v) => set("born", v)}
        />
        <TextField
          label="Nationality *"
          value={values.nationality}
          onChange={(v) => set("nationality", v)}
          required
        />
        <TextField
          label="Years Active *"
          value={values.yearsActive}
          onChange={(v) => set("yearsActive", v)}
          placeholder="2015–present"
          required
        />
        <TextField
          label="Signature / Visual Identity"
          value={values.signature}
          onChange={(v) => set("signature", v)}
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-widest opacity-70 mb-2">
          Bio *
        </label>
        <textarea
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          required
          rows={6}
          className="w-full bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-sm focus:border-[#aea2ff] outline-none"
        />
      </div>

      <StringRows
        label="Genres"
        values={values.genres}
        onChange={(v) => set("genres", v)}
        placeholder="e.g. Future Bass"
      />

      <HitRows hits={values.hits} onChange={(v) => set("hits", v)} />

      <StringRows
        label="Milestones"
        values={values.milestones}
        onChange={(v) => set("milestones", v)}
        placeholder="e.g. Headlined Fortnite's 2019 in-game concert — 10M+ concurrent players"
        multiline
      />

      <ReachRows reach={values.reach} onChange={(v) => set("reach", v)} />

      {error && (
        <div className="bg-[rgba(255,107,152,0.1)] border border-[#ff6b98] px-4 py-3 text-sm text-[#ff6b98]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[rgba(174,162,255,0.12)]">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85 disabled:opacity-40"
        >
          {saving ? "Saving…" : values.id ? "Save Changes" : "Create Artist"}
        </button>
        {values.id && (
          <button
            type="button"
            onClick={remove}
            className="px-4 py-3 text-xs uppercase tracking-widest text-[#ff6b98] hover:underline"
          >
            Delete Artist
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
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
        className="w-full bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-sm focus:border-[#aea2ff] outline-none"
      />
    </div>
  );
}

function StringRows({
  label,
  values,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-widest opacity-70">
          {label}
        </label>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            {multiline ? (
              <textarea
                value={v}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                rows={2}
                className="flex-1 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
            ) : (
              <input
                value={v}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                className="flex-1 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-2 text-sm focus:border-[#aea2ff] outline-none"
              />
            )}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="px-3 text-[#ff6b98] text-xs hover:underline"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HitRows({
  hits,
  onChange,
}: {
  hits: Hit[];
  onChange: (v: Hit[]) => void;
}) {
  const update = (i: number, patch: Partial<Hit>) => {
    const next = [...hits];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-widest opacity-70">
          Notable Hits
        </label>
        <button
          type="button"
          onClick={() => onChange([...hits, { title: "" }])}
          className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
        >
          + Add Hit
        </button>
      </div>
      <div className="space-y-2">
        {hits.map((h, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input
              value={h.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Title"
              className="md:col-span-4 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <input
              value={h.feature ?? ""}
              onChange={(e) => update(i, { feature: e.target.value })}
              placeholder="Feature (optional)"
              className="md:col-span-3 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <input
              value={h.peak ?? ""}
              onChange={(e) => update(i, { peak: e.target.value })}
              placeholder="Peak chart (optional)"
              className="md:col-span-3 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <input
              value={h.released ?? ""}
              onChange={(e) => update(i, { released: e.target.value })}
              placeholder="Released"
              className="md:col-span-1 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(hits.filter((_, j) => j !== i))}
              className="md:col-span-1 text-[#ff6b98] text-xs hover:underline"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReachRows({
  reach,
  onChange,
}: {
  reach: Reach[];
  onChange: (v: Reach[]) => void;
}) {
  const update = (i: number, patch: Partial<Reach>) => {
    const next = [...reach];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-widest opacity-70">
          Social / Platform Reach
        </label>
        <button
          type="button"
          onClick={() =>
            onChange([...reach, { platform: "", metric: "", label: "" }])
          }
          className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
        >
          + Add Metric
        </button>
      </div>
      <div className="space-y-2">
        {reach.map((r, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input
              value={r.platform}
              onChange={(e) => update(i, { platform: e.target.value })}
              placeholder="Platform (YouTube, Spotify…)"
              className="md:col-span-4 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <input
              value={r.metric}
              onChange={(e) => update(i, { metric: e.target.value })}
              placeholder="Number (58.4M)"
              className="md:col-span-3 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <input
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (subscribers)"
              className="md:col-span-4 bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-sm focus:border-[#aea2ff] outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(reach.filter((_, j) => j !== i))}
              className="md:col-span-1 text-[#ff6b98] text-xs hover:underline"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
