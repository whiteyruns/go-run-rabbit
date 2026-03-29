"use client";

import { useState, useEffect, useCallback } from "react";
import { fmt } from "@/lib/utils";

interface DealPoint {
  type: string;
  venues: string[];
  status: "offered" | "negotiating" | "confirmed" | "active" | "expired";
}

interface Deal {
  id: string;
  brandName: string;
  category: string;
  tier: string;
  status: string;
  value: number | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  venues: string | null;
  dealPoints: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const DEAL_POINT_TYPES = [
  "House / Well Pour",
  "Back Bar Placement",
  "Featured Cocktail / Menu Inclusion",
  "Tap Handle / Draft Line",
  "Bar Rail Signage",
  "LED / Digital Signage",
  "VIP Area Branding",
  "Event Activation / Sampling",
  "Social Media / Content",
  "Staff Training / Brand Ambassador",
  "Glassware / Branded Serveware",
  "Category Exclusivity",
  "Bathroom / Entrance Signage",
];

const DEAL_POINT_STATUSES = [
  { id: "offered", label: "Offered", color: "text-on-surface-variant", bg: "bg-surface-container" },
  { id: "negotiating", label: "Negotiating", color: "text-neon-violet", bg: "bg-neon-violet/10" },
  { id: "confirmed", label: "Confirmed", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { id: "active", label: "Active", color: "text-neon-cyan", bg: "bg-neon-cyan/15" },
  { id: "expired", label: "Expired", color: "text-on-surface-variant/50", bg: "bg-surface-container-low" },
];

const VENUE_OPTIONS = [
  { id: "commonwealth", name: "Commonwealth" },
  { id: "laundry-room", name: "Laundry Room" },
  { id: "we-all-scream", name: "We All Scream" },
  { id: "discopussy", name: "Discopussy" },
  { id: "lucky-day", name: "Lucky Day" },
  { id: "park-on-fremont", name: "Park On Fremont" },
  { id: "cheapshot", name: "Cheapshot" },
  { id: "la-mona-rosa", name: "La Mona Rosa" },
  { id: "doberman", name: "Doberman" },
];

const STATUSES = [
  { id: "prospect", label: "Prospect", color: "text-on-surface-variant", bg: "bg-surface-container" },
  { id: "contacted", label: "Contacted", color: "text-neon-violet", bg: "bg-neon-violet/10" },
  { id: "meeting", label: "Meeting", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { id: "proposal", label: "Proposal", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { id: "negotiation", label: "Negotiation", color: "text-[#ff8eac]", bg: "bg-[#ff6b98]/10" },
  { id: "closed", label: "Closed", color: "text-neon-cyan", bg: "bg-neon-cyan/15" },
  { id: "lost", label: "Lost", color: "text-on-surface-variant/50", bg: "bg-surface-container-low" },
];

const CATEGORIES = [
  "Tequila / Mezcal", "Vodka", "Whiskey / Bourbon", "Rum", "Beer / Hard Seltzer",
  "Energy Drinks", "Non-Alcoholic / Lifestyle", "Tech / POS / Payments",
];

const TIERS = ["presenting", "headline", "supporting", "activation"];

const emptyForm = {
  brandName: "", category: CATEGORIES[0], tier: "supporting", status: "prospect",
  value: "", contactName: "", contactEmail: "", notes: "", nextAction: "", nextActionDate: "",
  dealPoints: [] as DealPoint[],
};

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    const res = await fetch("/api/pipeline");
    const data = await res.json();
    setDeals(data.deals || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editingId ? "PUT" : "POST";
    const submitForm = { ...form, dealPoints: form.dealPoints.length > 0 ? form.dealPoints : null };
    const body = editingId ? { id: editingId, ...submitForm } : submitForm;
    await fetch("/api/pipeline", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchDeals();
  };

  const handleEdit = (deal: Deal) => {
    setEditingId(deal.id);
    let parsedDealPoints: DealPoint[] = [];
    try { parsedDealPoints = deal.dealPoints ? JSON.parse(deal.dealPoints) : []; } catch { /* ignore */ }
    setForm({
      brandName: deal.brandName,
      category: deal.category,
      tier: deal.tier,
      status: deal.status,
      value: deal.value?.toString() || "",
      contactName: deal.contactName || "",
      contactEmail: deal.contactEmail || "",
      notes: deal.notes || "",
      nextAction: deal.nextAction || "",
      nextActionDate: deal.nextActionDate?.split("T")[0] || "",
      dealPoints: parsedDealPoints,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/pipeline", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchDeals();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/pipeline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchDeals();
  };

  const filtered = filterStatus ? deals.filter(d => d.status === filterStatus) : deals;
  const totalValue = deals.filter(d => d.status !== "lost").reduce((s, d) => s + (d.value || 0), 0);
  const closedValue = deals.filter(d => d.status === "closed").reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">PIPELINE</h1>
          <p className="text-on-surface-variant">Sponsorship deal flow and brand relationships</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] px-6 py-2.5 rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          + New Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-high rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Total Deals</p>
          <p className="text-2xl font-extrabold font-mono text-on-surface">{deals.length}</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Pipeline Value</p>
          <p className="text-2xl font-extrabold font-mono text-neon-cyan">{fmt(totalValue)}</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Closed</p>
          <p className="text-2xl font-extrabold font-mono text-neon-cyan">{fmt(closedValue)}</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-2">Win Rate</p>
          <p className="text-2xl font-extrabold font-mono text-on-surface">
            {deals.length > 0 ? `${Math.round(deals.filter(d => d.status === "closed").length / deals.length * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-[0.1em] transition-all ${
            !filterStatus ? "bg-neon-violet/15 text-neon-violet" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All ({deals.length})
        </button>
        {STATUSES.map(s => {
          const count = deals.filter(d => d.status === s.id).length;
          if (count === 0 && s.id !== "prospect") return null;
          return (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                filterStatus === s.id ? `${s.bg} ${s.color}` : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Deal list */}
      {loading ? (
        <div className="bg-surface-container-high rounded-xl p-12 text-center text-on-surface-variant">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-high rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-lg mb-2">
            {deals.length === 0 ? "No deals yet" : "No deals in this stage"}
          </p>
          <p className="text-on-surface-variant/50 text-sm">
            {deals.length === 0 ? "Click \"+ New Deal\" to start tracking sponsorship opportunities" : "Try a different filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(deal => {
            const statusInfo = STATUSES.find(s => s.id === deal.status) || STATUSES[0];
            return (
              <div key={deal.id} className="bg-surface-container-high rounded-xl p-5 hover:bg-surface-bright transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-on-surface font-bold text-lg">{deal.brandName}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">
                        {deal.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <span>{deal.category}</span>
                      {deal.value && <span className="text-neon-cyan font-mono font-bold">{fmt(deal.value)}</span>}
                      {deal.contactName && <span>{deal.contactName}</span>}
                      {deal.contactEmail && <span className="text-on-surface-variant/50">{deal.contactEmail}</span>}
                    </div>
                    {deal.nextAction && (
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-neon-violet font-bold uppercase tracking-[0.1em]">Next:</span>
                        <span className="text-on-surface-variant">{deal.nextAction}</span>
                        {deal.nextActionDate && (
                          <span className="text-on-surface-variant/50">&middot; {new Date(deal.nextActionDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    {deal.notes && <p className="text-on-surface-variant/60 text-xs mt-2 line-clamp-1">{deal.notes}</p>}
                    {deal.dealPoints && (() => {
                      let points: DealPoint[] = [];
                      try { points = JSON.parse(deal.dealPoints); } catch { /* ignore */ }
                      return points.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {points.map((dp, i) => {
                            const dpStatus = DEAL_POINT_STATUSES.find(s => s.id === dp.status);
                            return (
                              <span key={i} className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${dpStatus?.bg || "bg-surface-container"} ${dpStatus?.color || "text-on-surface-variant"}`}>
                                {dp.type.split(" / ")[0]} ({dp.venues.length}v)
                              </span>
                            );
                          })}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Quick status buttons */}
                    {deal.status !== "closed" && deal.status !== "lost" && (
                      <select
                        value={deal.status}
                        onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                        className="bg-surface-container text-on-surface-variant text-xs rounded-md px-2 py-1 border-0 focus:ring-1 focus:ring-neon-violet"
                      >
                        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    )}
                    <a href={`/recap/${deal.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-on-surface-variant hover:text-neon-cyan text-xs px-2 py-1 transition-colors">
                      Recap
                    </a>
                    <button onClick={() => handleEdit(deal)} className="text-on-surface-variant hover:text-neon-violet text-xs px-2 py-1 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(deal.id)} className="text-on-surface-variant hover:text-neon-pink text-xs px-2 py-1 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-surface-container-highest rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold tracking-tight mb-6">{editingId ? "Edit Deal" : "New Deal"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Brand Name</label>
                <input
                  type="text" required value={form.brandName}
                  onChange={e => setForm({ ...form, brandName: e.target.value })}
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                  placeholder="e.g., Casamigos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Tier</label>
                  <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
                    className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                    {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Deal Value ($)</label>
                  <input
                    type="number" value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Contact Name</label>
                  <input
                    type="text" value={form.contactName}
                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                    placeholder="Regional rep name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Contact Email</label>
                  <input
                    type="email" value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                    placeholder="rep@brand.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Next Action</label>
                  <input
                    type="text" value={form.nextAction}
                    onChange={e => setForm({ ...form, nextAction: e.target.value })}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                    placeholder="Send pitch deck"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Action Date</label>
                  <input
                    type="date" value={form.nextActionDate}
                    onChange={e => setForm({ ...form, nextActionDate: e.target.value })}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Notes</label>
                <textarea
                  value={form.notes} rows={3}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all resize-none"
                  placeholder="Internal notes about this deal..."
                />
              </div>

              {/* Deal Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Deal Points</label>
                  <button type="button" onClick={() => setForm({ ...form, dealPoints: [...form.dealPoints, { type: DEAL_POINT_TYPES[0], venues: [], status: "offered" }] })}
                    className="text-neon-violet text-xs font-bold hover:text-neon-cyan transition-colors">+ Add</button>
                </div>
                {form.dealPoints.length === 0 && (
                  <p className="text-on-surface-variant/40 text-xs">No deal points added. Click + Add to specify placement rights.</p>
                )}
                <div className="space-y-3">
                  {form.dealPoints.map((dp, i) => (
                    <div key={i} className="bg-surface-container-low rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <select value={dp.type} onChange={e => {
                          const updated = [...form.dealPoints];
                          updated[i] = { ...dp, type: e.target.value };
                          setForm({ ...form, dealPoints: updated });
                        }} className="bg-surface-container border-0 rounded-md px-3 py-1.5 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet flex-1 mr-2">
                          {DEAL_POINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={dp.status} onChange={e => {
                          const updated = [...form.dealPoints];
                          updated[i] = { ...dp, status: e.target.value as DealPoint["status"] };
                          setForm({ ...form, dealPoints: updated });
                        }} className="bg-surface-container border-0 rounded-md px-3 py-1.5 text-on-surface text-xs focus:ring-1 focus:ring-neon-violet w-32">
                          {DEAL_POINT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setForm({ ...form, dealPoints: form.dealPoints.filter((_, j) => j !== i) })}
                          className="text-on-surface-variant/40 hover:text-neon-pink ml-2 text-sm transition-colors">&times;</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {VENUE_OPTIONS.map(v => (
                          <button key={v.id} type="button" onClick={() => {
                            const updated = [...form.dealPoints];
                            const venues = dp.venues.includes(v.id) ? dp.venues.filter(vid => vid !== v.id) : [...dp.venues, v.id];
                            updated[i] = { ...dp, venues };
                            setForm({ ...form, dealPoints: updated });
                          }} className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full transition-all ${
                            dp.venues.includes(v.id) ? "bg-neon-violet/20 text-neon-violet" : "bg-surface-container text-on-surface-variant/50 hover:text-on-surface-variant"
                          }`}>
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] py-3 rounded-md font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all">
                  {saving ? "Saving..." : editingId ? "Update Deal" : "Create Deal"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
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
