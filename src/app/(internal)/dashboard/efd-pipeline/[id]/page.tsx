"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  referral_source: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  action: string;
  details: Record<string, string>;
  created_at: string;
}

const STAGES = [
  "new", "qualified", "proposal_draft", "proposal_sent",
  "revision_requested", "accepted", "contract_sent",
  "contract_signed", "confirmed", "completed", "lost",
];

const stageLabel = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const stageColor = (s: string) => {
  if (["confirmed", "completed", "accepted", "contract_signed"].includes(s)) return "#00eefc";
  if (["lost", "cancelled", "revision_requested"].includes(s)) return "#ff6b98";
  return "#aea2ff";
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/efd-leads?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      // API returns array; find single lead
      const found = Array.isArray(data) ? data.find((l: Lead) => l.id === id) : data;
      setLead(found || null);
    }
    setLoading(false);
  }, [id]);

  const fetchActivity = useCallback(async () => {
    const res = await fetch(`/api/efd-leads/activity?lead_id=${id}`);
    if (res.ok) {
      setActivity(await res.json());
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
    fetchActivity();
  }, [fetchLead, fetchActivity]);

  async function updateStatus(newStatus: string) {
    setSaving(true);
    await fetch("/api/efd-leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await fetchLead();
    await fetchActivity();
    setSaving(false);
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    const res = await fetch("/api/efd-leads/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: id,
        action: "note_added",
        details: { note: note.trim() },
      }),
    });
    if (res.ok) {
      setNote("");
      await fetchActivity();
      // Update last_contacted_at
      await fetch("/api/efd-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, last_contacted_at: new Date().toISOString() }),
      });
      await fetchLead();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-neon-pink">Lead not found</p>
        <Link href="/dashboard/efd-pipeline" className="text-neon-cyan text-sm mt-2 block">&larr; Back to pipeline</Link>
      </div>
    );
  }

  const currentIdx = STAGES.indexOf(lead.status);
  const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 2 ? STAGES[currentIdx + 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-2">
        <Link href="/dashboard/efd-pipeline" className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors">
          &larr; EFD Pipeline
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">
            {lead.organization_name || lead.contact_name || lead.email}
          </h1>
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
              style={{ background: `${stageColor(lead.status)}15`, color: stageColor(lead.status) }}
            >
              {stageLabel(lead.status)}
            </span>
            <span className="text-on-surface-variant text-xs">
              Created {new Date(lead.created_at).toLocaleDateString()}
            </span>
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full"
              style={{
                background: lead.source === "website" ? "rgba(0,238,252,0.1)" : "rgba(174,162,255,0.1)",
                color: lead.source === "website" ? "#00eefc" : "#aea2ff",
              }}
            >
              {lead.source}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {nextStage && (
            <button
              onClick={() => updateStatus(nextStage)}
              disabled={saving}
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
            >
              Advance to {stageLabel(nextStage)}
            </button>
          )}
          {!["lost", "completed"].includes(lead.status) && (
            <button
              onClick={() => updateStatus("lost")}
              disabled={saving}
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-pink/15 text-neon-pink hover:bg-neon-pink/25 transition-colors disabled:opacity-40"
            >
              Mark Lost
            </button>
          )}
        </div>
      </div>

      {/* Pipeline progress */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STAGES.filter((s) => s !== "lost" && s !== "cancelled").map((stage) => {
          const isActive = stage === lead.status;
          const isPast = STAGES.indexOf(stage) < currentIdx;
          return (
            <button
              key={stage}
              onClick={() => updateStatus(stage)}
              className={`text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : isPast
                    ? "bg-surface-container-high text-on-surface"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {stageLabel(stage)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Lead details */}
        <div className="col-span-2 space-y-6">
          {/* Contact & Event Info */}
          <div className="bg-surface-container rounded-xl p-6">
            <h3 className="text-on-surface font-bold mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Contact", value: lead.contact_name },
                { label: "Email", value: lead.email },
                { label: "Phone", value: lead.phone },
                { label: "Organization", value: lead.organization_name },
                { label: "Event Type", value: lead.event_type?.replace(/-/g, " ") },
                { label: "Guest Count", value: lead.estimated_guest_count },
                { label: "Budget", value: lead.budget_range },
                { label: "Scope", value: lead.activation_scope },
                { label: "Date Start", value: lead.preferred_date_start ? new Date(lead.preferred_date_start).toLocaleDateString() : null },
                { label: "Date End", value: lead.preferred_date_end ? new Date(lead.preferred_date_end).toLocaleDateString() : null },
                { label: "Referral", value: lead.referral_source },
                { label: "Last Contact", value: lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : "Never" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">{label}</p>
                  <p className="text-on-surface text-sm">{value || "—"}</p>
                </div>
              ))}
            </div>
            {lead.additional_notes && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">Notes</p>
                <p className="text-on-surface text-sm leading-relaxed">{lead.additional_notes}</p>
              </div>
            )}
          </div>

          {/* Add Note */}
          <div className="bg-surface-container rounded-xl p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add a note..."
                className="flex-1 bg-surface-container-high border-0 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-neon-violet/30 placeholder:text-on-surface-variant/40"
              />
              <button
                onClick={addNote}
                disabled={saving || !note.trim()}
                className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-violet/15 text-neon-violet hover:bg-neon-violet/25 transition-colors disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right: Activity timeline */}
        <div>
          <div className="bg-surface-container rounded-xl p-4">
            <h3 className="text-on-surface font-bold mb-4 text-sm">Activity</h3>
            {activity.length === 0 ? (
              <p className="text-on-surface-variant text-xs">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-violet/50 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-on-surface text-xs">
                        {a.action === "status_changed" && (
                          <>
                            Status: <span className="text-on-surface-variant">{a.details.from}</span>
                            {" → "}
                            <span className="text-neon-cyan">{a.details.to}</span>
                          </>
                        )}
                        {a.action === "note_added" && a.details.note}
                        {a.action === "created" && "Lead created"}
                        {!["status_changed", "note_added", "created"].includes(a.action) && stageLabel(a.action)}
                      </p>
                      <p className="text-on-surface-variant text-[10px]">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
