"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────────────── */

interface Lead {
  id: string;
  source: string;
  status: string;
  organization_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  event_type: string | null;
  estimated_guest_count: string | null;
  preferred_date_start: string | null;
  preferred_date_end: string | null;
  budget_range: string | null;
  activation_scope: string | null;
  additional_notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Pipeline Config ──────────────────────────────────────────────── */

const STAGES = [
  { key: "new", label: "New", color: "#00eefc" },
  { key: "qualified", label: "Qualified", color: "#aea2ff" },
  { key: "proposal_draft", label: "Proposal Draft", color: "#aea2ff" },
  { key: "proposal_sent", label: "Proposal Sent", color: "#7157ff" },
  { key: "revision_requested", label: "Revision", color: "#ff6b98" },
  { key: "accepted", label: "Accepted", color: "#00eefc" },
  { key: "contract_sent", label: "Contract Sent", color: "#7157ff" },
  { key: "contract_signed", label: "Signed", color: "#00eefc" },
  { key: "confirmed", label: "Confirmed", color: "#00eefc" },
  { key: "completed", label: "Completed", color: "#00deec" },
  { key: "lost", label: "Lost", color: "#ff6b98" },
];

const ACTIVE_STAGES = STAGES.filter(
  (s) => !["completed", "lost", "cancelled"].includes(s.key)
);

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function coldIndicator(lead: Lead): string | null {
  const days = daysSince(lead.last_contacted_at || lead.created_at);
  if (days === null) return null;
  if (days >= 7) return "cold";
  if (days >= 3) return "warm";
  return null;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EfdPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragLead, setDragLead] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/efd-leads");
    if (res.ok) {
      const data = await res.json();
      setLeads(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateLeadStatus(leadId: string, newStatus: string) {
    await fetch("/api/efd-leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  }

  function handleDragStart(leadId: string) {
    setDragLead(leadId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(stageKey: string) {
    if (dragLead) {
      updateLeadStatus(dragLead, stageKey);
      setDragLead(null);
    }
  }

  const leadsInStage = (stageKey: string) =>
    leads.filter((l) => l.status === stageKey);

  const totalValue = leads.filter(
    (l) => !["lost", "cancelled", "completed"].includes(l.status)
  ).length;

  if (loading) {
    return (
      <div className="max-w-full mx-auto px-8 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">EFD PIPELINE</h1>
        <p className="text-on-surface-variant">Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">EFD PIPELINE</h1>
          <p className="text-on-surface-variant">
            {leads.length} total leads &middot; {totalValue} active
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors"
        >
          + Add Lead
        </button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <AddLeadForm
          onSave={async (lead) => {
            const res = await fetch("/api/efd-leads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lead),
            });
            if (res.ok) {
              await fetchLeads();
              setShowAddForm(false);
            }
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
        {ACTIVE_STAGES.map((stage) => {
          const stageLeads = leadsInStage(stage.key);
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-[260px] bg-surface-container rounded-xl p-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.key)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                    {stage.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {stageLeads.map((lead) => {
                  const cold = coldIndicator(lead);
                  return (
                    <Link
                      key={lead.id}
                      href={`/dashboard/efd-pipeline/${lead.id}`}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      className={`block bg-surface-container-high rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-surface-bright transition-colors ${
                        cold === "cold"
                          ? "ring-1 ring-neon-pink/30"
                          : cold === "warm"
                            ? "ring-1 ring-neon-violet/20"
                            : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-on-surface font-bold text-sm leading-tight">
                          {lead.organization_name || lead.contact_name || lead.email}
                        </p>
                        {cold && (
                          <span
                            className={`text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full ${
                              cold === "cold"
                                ? "bg-neon-pink/15 text-neon-pink"
                                : "bg-neon-violet/15 text-neon-violet"
                            }`}
                          >
                            {cold === "cold" ? "7d+" : "3d+"}
                          </span>
                        )}
                      </div>
                      {lead.event_type && (
                        <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.1em] mb-1">
                          {lead.event_type.replace(/-/g, " ")}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                        {lead.estimated_guest_count && (
                          <span>{lead.estimated_guest_count} guests</span>
                        )}
                        {lead.budget_range && (
                          <span className="text-neon-cyan">
                            {lead.budget_range}
                          </span>
                        )}
                      </div>
                      {lead.preferred_date_start && (
                        <p className="text-[10px] text-on-surface-variant mt-1">
                          {new Date(lead.preferred_date_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {lead.preferred_date_end && (
                            <> &ndash; {new Date(lead.preferred_date_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                          )}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: lead.source === "website" ? "rgba(0,238,252,0.1)" : lead.source === "outbound" ? "rgba(174,162,255,0.1)" : "rgba(255,107,152,0.1)",
                            color: lead.source === "website" ? "#00eefc" : lead.source === "outbound" ? "#aea2ff" : "#ff6b98",
                          }}
                        >
                          {lead.source}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closed section */}
      {(leadsInStage("completed").length > 0 || leadsInStage("lost").length > 0) && (
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">
            Closed ({leadsInStage("completed").length + leadsInStage("lost").length})
          </p>
          <div className="flex gap-3">
            {["completed", "lost"].map((key) => {
              const stage = STAGES.find((s) => s.key === key)!;
              const stageLeads = leadsInStage(key);
              if (stageLeads.length === 0) return null;
              return (
                <div key={key} className="bg-surface-container rounded-xl p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">{stage.label}</span>
                    <span className="text-[10px] text-on-surface-variant">{stageLeads.length}</span>
                  </div>
                  {stageLeads.map((lead) => (
                    <Link key={lead.id} href={`/dashboard/efd-pipeline/${lead.id}`} className="block text-on-surface-variant text-xs py-1 hover:text-on-surface transition-colors">
                      {lead.organization_name || lead.email}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add Lead Form ────────────────────────────────────────────────── */

function AddLeadForm({
  onSave,
  onCancel,
}: {
  onSave: (lead: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    phone: "",
    event_type: "",
    estimated_guest_count: "",
    budget_range: "",
    source: "website",
    additional_notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, status: "new" });
    setSaving(false);
  }

  const inputClass =
    "w-full bg-surface-container border-0 border-b border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-neon-violet transition-all placeholder:text-on-surface-variant/40";

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-high rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-on-surface font-bold">Add New Lead</h3>
        <button type="button" onClick={onCancel} className="text-on-surface-variant text-xs hover:text-on-surface">Cancel</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <input className={inputClass} placeholder="Organization" value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} />
        <input className={inputClass} placeholder="Contact Name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
        <input className={inputClass} placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <select className={inputClass} value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
          <option value="">Event Type</option>
          <option value="corporate">Corporate</option>
          <option value="convention">Convention</option>
          <option value="brand-activation">Brand Activation</option>
          <option value="private">Private</option>
          <option value="other">Other</option>
        </select>
        <select className={inputClass} value={form.estimated_guest_count} onChange={(e) => setForm({ ...form, estimated_guest_count: e.target.value })}>
          <option value="">Guest Count</option>
          <option value="under-200">Under 200</option>
          <option value="200-500">200-500</option>
          <option value="500-1000">500-1,000</option>
          <option value="1000-2500">1,000-2,500</option>
          <option value="2500-5000">2,500-5,000</option>
          <option value="5000-plus">5,000+</option>
        </select>
        <select className={inputClass} value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })}>
          <option value="">Budget</option>
          <option value="under-25k">Under $25K</option>
          <option value="25k-75k">$25K-$75K</option>
          <option value="75k-150k">$75K-$150K</option>
          <option value="150k-500k">$150K-$500K</option>
          <option value="500k-plus">$500K+</option>
        </select>
        <select className={inputClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option value="website">Website</option>
          <option value="outbound">Outbound</option>
          <option value="referral">Referral</option>
          <option value="deck-download">Deck Download</option>
        </select>
      </div>
      <div className="flex gap-3">
        <input className={`${inputClass} flex-1`} placeholder="Notes" value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} />
        <button
          type="submit"
          disabled={saving}
          className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Lead"}
        </button>
      </div>
    </form>
  );
}
