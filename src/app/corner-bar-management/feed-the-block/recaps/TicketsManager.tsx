"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketsAggregate } from "@/lib/tickets-aggregator";

export function TicketsManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: TicketsAggregate | null;
}) {
  const router = useRouter();
  const [agg, setAgg] = useState<TicketsAggregate | null>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/ftb-admin/recaps/${eventId}/tickets`, {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setAgg(j.tickets);
      setFile(null);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Remove ticket data from this recap?")) return;
    const res = await fetch(`/api/ftb-admin/recaps/${eventId}/tickets`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAgg(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {agg ? (
        <div className="border border-[rgba(174,162,255,0.12)] p-5 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Orders" value={agg.totalOrders.toLocaleString()} />
            <Stat
              label="Event Day"
              value={agg.eventDay ?? "—"}
            />
            <Stat
              label="ZIPs Analyzed"
              value={`${agg.geographic.zipsAnalyzed.toLocaleString()} (${pct(
                agg.geographic.zipsAnalyzed,
                agg.totalOrders,
              )})`}
            />
            <Stat
              label="Nevada Share"
              value={pct(agg.geographic.nevadaCount, agg.geographic.zipsAnalyzed)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs opacity-70">
            <div>
              <span className="opacity-60 uppercase tracking-widest text-[9px]">Gender provided</span>
              <div>{agg.gender.n.toLocaleString()} ({pct(agg.gender.n, agg.totalOrders)})</div>
            </div>
            <div>
              <span className="opacity-60 uppercase tracking-widest text-[9px]">Age provided</span>
              <div>{agg.age.n.toLocaleString()} ({pct(agg.age.n, agg.totalOrders)}) · median {agg.age.median}</div>
            </div>
            <div>
              <span className="opacity-60 uppercase tracking-widest text-[9px]">Top state</span>
              <div>{agg.geographic.topStates[0]?.state ?? "—"}</div>
            </div>
          </div>
          <div className="text-[10px] opacity-50 pt-2 border-t border-[rgba(174,162,255,0.08)]">
            Uploaded {new Date(agg.uploadedAt).toLocaleString()} · {agg.source}
          </div>
          <button
            onClick={remove}
            className="text-[10px] uppercase tracking-widest text-[#ff6b98] hover:underline"
          >
            Remove tickets data
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-[rgba(174,162,255,0.2)] p-6 text-center text-xs opacity-60">
          No ticket data uploaded yet.
        </div>
      )}

      <form onSubmit={upload} className="bg-[rgba(174,162,255,0.04)] p-4 space-y-3">
        <div className="text-[10px] uppercase tracking-widest opacity-70">
          {agg ? "Replace ticket data" : "Upload ticket data"}
        </div>
        <p className="text-xs opacity-60">
          BLOCKPARTY.VEGAS Orders CSV. Names, DOB, and phone are aggregated then
          discarded — only counts and bins persist.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-xs"
        />
        {err && <p className="text-xs text-[#ff6b98]">{err}</p>}
        <button
          type="submit"
          disabled={busy || !file}
          className="px-4 py-2 bg-[#aea2ff] text-[#1f0078] text-[10px] uppercase tracking-widest font-semibold hover:opacity-85 disabled:opacity-30"
        >
          {busy ? "Aggregating…" : "Upload &amp; Aggregate"}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="serif text-2xl font-bold">{value}</div>
    </div>
  );
}

function pct(num: number, denom: number): string {
  if (!denom) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
}
