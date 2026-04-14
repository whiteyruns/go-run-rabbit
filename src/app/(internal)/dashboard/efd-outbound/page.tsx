"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  target_type: string | null;
  status: string;
  created_at: string;
  efd_outbound_targets: { count: number }[];
}

const statusColor = (s: string) => {
  if (s === "active") return "bg-neon-cyan/15 text-neon-cyan";
  if (s === "completed") return "bg-neon-violet/15 text-neon-violet";
  if (s === "paused") return "bg-neon-pink/15 text-neon-pink";
  return "bg-surface-container-high text-on-surface-variant";
};

const typeLabel = (t: string | null) => {
  if (!t) return "";
  return { dmc: "DMC", corporate: "Corporate", convention: "Convention", agency: "Agency" }[t] || t;
};

export default function EfdOutboundPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch("/api/efd-outbound/campaigns");
    if (res.ok) setCampaigns(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function createCampaign(form: { name: string; description: string; target_type: string; outreach_template: string }) {
    const res = await fetch("/api/efd-outbound/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchCampaigns();
      setShowCreate(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">EFD OUTBOUND</h1>
          <p className="text-on-surface-variant">
            {campaigns.length} campaigns &middot; Target DMCs, corporate planners, and convention exhibitors
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateCampaignForm
          onSave={createCampaign}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Campaign List */}
      {loading ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface-container rounded-xl p-12 text-center">
          <p className="text-on-surface-variant mb-4">No campaigns yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-lg bg-neon-violet/15 text-neon-violet hover:bg-neon-violet/25 transition-colors"
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const targetCount = c.efd_outbound_targets?.[0]?.count || 0;
            return (
              <Link
                key={c.id}
                href={`/dashboard/efd-outbound/${c.id}`}
                className="block bg-surface-container-high rounded-xl p-6 hover:bg-surface-bright transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-on-surface font-bold text-lg">{c.name}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                    {c.target_type && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                        {typeLabel(c.target_type)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-on-surface-variant">
                    <span><span className="text-on-surface font-mono font-bold">{targetCount}</span> targets</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {c.description && (
                  <p className="text-on-surface-variant text-sm mt-2">{c.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateCampaignForm({
  onSave,
  onCancel,
}: {
  onSave: (form: { name: string; description: string; target_type: string; outreach_template: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ name: "", description: "", target_type: "", outreach_template: "efd" });
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full bg-surface-container border-0 border-b border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-neon-violet transition-all placeholder:text-on-surface-variant/40";

  return (
    <div className="bg-surface-container-high rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-on-surface font-bold">New Campaign</h3>
        <button onClick={onCancel} className="text-on-surface-variant text-xs hover:text-on-surface">Cancel</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        <input className={inputClass} placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className={inputClass} value={form.target_type} onChange={(e) => setForm({ ...form, target_type: e.target.value })}>
          <option value="">Target Type</option>
          <option value="dmc">DMC</option>
          <option value="corporate">Corporate Event Teams</option>
          <option value="convention">Convention Adjacent</option>
          <option value="agency">Agency</option>
        </select>
        <select className={inputClass} value={form.outreach_template} onChange={(e) => setForm({ ...form, outreach_template: e.target.value })}>
          <option value="efd">EFD — District Activation</option>
          <option value="doberman">Doberman — Membership</option>
        </select>
      </div>
      <button
        onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
        disabled={saving || !form.name}
        className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
      >
        {saving ? "Creating..." : "Create Campaign"}
      </button>
    </div>
  );
}
