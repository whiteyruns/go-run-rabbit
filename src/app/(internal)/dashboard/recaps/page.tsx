"use client";

import { useState, useEffect, useCallback } from "react";

interface Deal {
  id: string;
  brandName: string;
  category: string;
  status: string;
}

interface RecapLog {
  id: string;
  type: string;
  sentTo: string;
  sentAt: string;
  data: string | null;
}

const RECAP_TYPES = [
  { id: "post-event", label: "Post-Event Recap", desc: "Performance summary after a Feed the Block event" },
  { id: "quarterly", label: "Quarterly Review", desc: "Quarterly partnership performance across the portfolio" },
  { id: "annual", label: "Annual Report", desc: "Comprehensive year-end partnership summary" },
];

export default function RecapsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [logs, setLogs] = useState<RecapLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState("");
  const [selectedType, setSelectedType] = useState("quarterly");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [dealsRes, logsRes] = await Promise.all([
      fetch("/api/pipeline"),
      fetch("/api/recaps"),
    ]);
    const dealsData = await dealsRes.json();
    const logsData = await logsRes.json();
    setDeals((dealsData.deals || []).filter((d: Deal) => d.status !== "lost"));
    setLogs(logsData.logs || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    setSending(true);
    setLastResult(null);

    const res = await fetch("/api/recaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dealId: selectedDeal,
        type: selectedType,
        recipientEmail: recipientEmail || null,
      }),
    });
    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setLastResult(data.recapUrl);
      setShowForm(false);
      fetchData();
    }
  };

  const copyLink = (dealId: string, type: string) => {
    const url = `${window.location.origin}/recap/brand/${dealId}/${type}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">RECAPS</h1>
          <p className="text-on-surface-variant">Generate and send brand partnership recaps</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] px-6 py-2.5 rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
          + Generate Recap
        </button>
      </div>

      {lastResult && (
        <div className="bg-neon-cyan/10 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-neon-cyan text-sm">Recap generated successfully</p>
          <a href={lastResult} target="_blank" rel="noopener noreferrer" className="text-neon-cyan text-xs font-bold hover:underline">
            View Recap &rarr;
          </a>
        </div>
      )}

      {/* Quick generate for each active deal */}
      {!loading && (
        <div className="space-y-3 mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">Active Partnerships</p>
          {deals.filter(d => d.status === "closed").map(deal => (
            <div key={deal.id} className="bg-surface-container-high rounded-xl p-5 flex items-center justify-between hover:bg-surface-bright transition-colors">
              <div>
                <h3 className="text-on-surface font-bold">{deal.brandName}</h3>
                <p className="text-on-surface-variant text-xs">{deal.category}</p>
              </div>
              <div className="flex gap-2">
                {RECAP_TYPES.map(rt => (
                  <a key={rt.id} href={`/recap/brand/${deal.id}/${rt.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-md bg-surface-container text-on-surface-variant hover:text-neon-violet hover:bg-neon-violet/10 transition-all">
                    {rt.label.split(" ")[0]}
                  </a>
                ))}
              </div>
            </div>
          ))}
          {deals.filter(d => d.status === "closed").length === 0 && (
            <p className="text-on-surface-variant/50 text-sm">No closed deals yet — recaps are available for active partnerships.</p>
          )}
        </div>
      )}

      {/* Recent recap log */}
      {logs.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">Recent Recaps</p>
          <div className="space-y-2">
            {logs.map(log => {
              let parsed: { brandName?: string; dealId?: string } = {};
              try { parsed = log.data ? JSON.parse(log.data) : {}; } catch { /* */ }
              return (
                <div key={log.id} className="bg-surface-container rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-on-surface text-sm font-medium">{parsed.brandName || "Unknown"} — {log.type}</p>
                    <p className="text-on-surface-variant text-xs">
                      {new Date(log.sentAt).toLocaleDateString()} &middot; {log.sentTo === "link-only" ? "Link generated" : `Sent to ${log.sentTo}`}
                    </p>
                  </div>
                  {parsed.dealId && (
                    <button onClick={() => copyLink(parsed.dealId!, log.type)}
                      className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-md bg-surface-container-high text-on-surface-variant hover:text-neon-cyan transition-all">
                      Copy Link
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-surface-container-highest rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold tracking-tight mb-6">Generate Recap</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Brand / Deal</label>
                <select value={selectedDeal} onChange={e => setSelectedDeal(e.target.value)} required
                  className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                  <option value="">Select a deal...</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.brandName} ({d.category})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">Recap Type</label>
                <div className="space-y-2">
                  {RECAP_TYPES.map(rt => (
                    <button key={rt.id} type="button" onClick={() => setSelectedType(rt.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedType === rt.id ? "bg-neon-violet/10 ring-1 ring-neon-violet/30" : "bg-surface-container hover:bg-surface-container-high"
                      }`}>
                      <p className={`text-sm font-bold ${selectedType === rt.id ? "text-neon-violet" : "text-on-surface"}`}>{rt.label}</p>
                      <p className="text-on-surface-variant text-xs">{rt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Email Recipient (optional)</label>
                <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                  placeholder="Leave blank for link only" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={sending || !selectedDeal}
                  className="flex-1 bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] py-3 rounded-md font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all">
                  {sending ? "Generating..." : recipientEmail ? "Generate & Send" : "Generate Link"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-outline-variant/20 rounded-md text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
