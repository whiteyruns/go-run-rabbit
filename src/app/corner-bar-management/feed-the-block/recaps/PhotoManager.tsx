"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Slot = "hero" | "polaroid" | "portrait" | "gallery";

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

export function PhotoManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Photos;
}) {
  const [photos, setPhotos] = useState<Photos>(initial);
  const router = useRouter();

  const remove = async (slot: Slot, slug?: string) => {
    if (!confirm(`Delete this photo?`)) return;
    const res = await fetch(`/api/ftb-admin/recaps/${eventId}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, slug }),
    });
    if (res.ok) {
      const j = await res.json();
      setPhotos(j.photos);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <SlotBlock
        label="Hero (full-bleed)"
        slot="hero"
        eventId={eventId}
        current={photos.hero}
        onUpload={setPhotos}
        onRemove={() => remove("hero")}
      />
      <SlotBlock
        label="Polaroid (artist spotlight)"
        slot="polaroid"
        eventId={eventId}
        current={photos.polaroid}
        onUpload={setPhotos}
        onRemove={() => remove("polaroid")}
      />
      <SlotBlock
        label="Portrait (optional)"
        slot="portrait"
        eventId={eventId}
        current={photos.portrait}
        onUpload={setPhotos}
        onRemove={() => remove("portrait")}
      />

      <div>
        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
          Gallery ({photos.gallery.length})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {photos.gallery.map((p) => (
            <div
              key={p.slug}
              className="border border-[rgba(174,162,255,0.2)] p-3 text-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/feed-the-block/img/${eventId}/${p.slug}-640.jpg`}
                alt={p.alt}
                className="w-full aspect-[4/3] object-cover mb-2"
              />
              <div className="font-mono text-[10px] opacity-60">{p.slug}</div>
              <div className="opacity-80 truncate">{p.credit}</div>
              <button
                onClick={() => remove("gallery", p.slug)}
                className="mt-2 text-[#ff6b98] text-[10px] uppercase hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <UploadForm
          slot="gallery"
          eventId={eventId}
          onUpload={setPhotos}
          compact
        />
      </div>
    </div>
  );
}

function SlotBlock({
  label,
  slot,
  eventId,
  current,
  onUpload,
  onRemove,
}: {
  label: string;
  slot: Slot;
  eventId: string;
  current?: Photo;
  onUpload: (p: Photos) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
        {label}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-1">
          {current ? (
            <div className="border border-[rgba(174,162,255,0.2)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/feed-the-block/img/${eventId}/${current.slug}-640.jpg`}
                alt={current.alt}
                className="w-full aspect-square object-cover mb-2"
              />
              <div className="text-[10px] font-mono opacity-60">
                {current.slug}
              </div>
              <div className="text-xs opacity-80 truncate">{current.credit}</div>
              <button
                onClick={onRemove}
                className="mt-2 text-[#ff6b98] text-[10px] uppercase hover:underline"
              >
                Replace
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[rgba(174,162,255,0.2)] aspect-square flex items-center justify-center opacity-40 text-xs">
              No {slot} set
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          {!current && (
            <UploadForm slot={slot} eventId={eventId} onUpload={onUpload} />
          )}
        </div>
      </div>
    </div>
  );
}

function UploadForm({
  slot,
  eventId,
  onUpload,
  compact,
}: {
  slot: Slot;
  eventId: string;
  onUpload: (p: Photos) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setErr("Pick a file first");
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", slot);
      fd.append("slug", slug);
      fd.append("alt", alt);
      fd.append("credit", credit);
      if (caption) fd.append("caption", caption);

      const res = await fetch(`/api/ftb-admin/recaps/${eventId}/photos`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? res.statusText);
      }
      const j = await res.json();
      onUpload(j.photos);
      setFile(null);
      setSlug("");
      setAlt("");
      setCredit("");
      setCaption("");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={`space-y-3 ${
        compact ? "" : "bg-[rgba(174,162,255,0.04)] p-4"
      }`}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/heic"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-xs"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (e.g. hero-packed-crowd)"
          required
          className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-xs focus:border-[#aea2ff] outline-none"
        />
        <input
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          placeholder="Credit (e.g. Jesse Hudson)"
          required
          className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-xs focus:border-[#aea2ff] outline-none"
        />
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt text (for a11y)"
          required
          className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-xs focus:border-[#aea2ff] outline-none"
        />
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-xs focus:border-[#aea2ff] outline-none"
        />
      </div>
      {err && <p className="text-xs text-[#ff6b98]">{err}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 bg-[#aea2ff] text-[#1f0078] text-[10px] uppercase tracking-widest font-semibold hover:opacity-85 disabled:opacity-40"
      >
        {uploading ? "Uploading + resizing…" : "Upload"}
      </button>
    </form>
  );
}
