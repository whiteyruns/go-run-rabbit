"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  target_type: string | null;
  status: string;
  created_at: string;
}

interface Target {
  id: string;
  campaign_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  magic_link_token: string;
  magic_link_url: string;
  status: string;
  personalization: Record<string, string | null>;
  sent_at: string | null;
  viewed_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

const targetStatusColor = (s: string) => {
  if (s === "converted" || s === "inquired") return "bg-neon-cyan/15 text-neon-cyan";
  if (s === "clicked") return "bg-neon-violet/15 text-neon-violet";
  if (s === "viewed") return "bg-neon-violet/10 text-neon-violet";
  if (s === "sent") return "bg-surface-container-high text-on-surface-variant";
  return "bg-surface-container text-on-surface-variant";
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const fetchCampaign = useCallback(async () => {
    const res = await fetch("/api/efd-outbound/campaigns");
    if (res.ok) {
      const all = await res.json();
      const found = all.find((c: Campaign) => c.id === campaignId);
      setCampaign(found || null);
    }
  }, [campaignId]);

  const fetchTargets = useCallback(async () => {
    const res = await fetch(`/api/efd-outbound/targets?campaign_id=${campaignId}`);
    if (res.ok) setTargets(await res.json());
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
    fetchTargets();
  }, [fetchCampaign, fetchTargets]);

  async function addTarget(form: { company_name: string; contact_name: string; email: string }) {
    await fetch("/api/efd-outbound/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, campaign_id: campaignId }),
    });
    await fetchTargets();
    setShowAddTarget(false);
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) { setImporting(false); return; }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      return row;
    }).filter((r) => r.company_name || r.company || r.Company);

    if (rows.length > 0) {
      await fetch("/api/efd-outbound/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId, targets: rows }),
      });
      await fetchTargets();
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendOutreach() {
    setSending(true);
    setSendResult("Sending...");
    let totalSent = 0;
    let totalFailed = 0;
    let batch = 1;

    // Send in batches until no more pending targets with emails
    while (batch <= 10) {
      const res = await fetch("/api/efd-outbound/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      if (!res.ok) {
        setSendResult(`Batch ${batch} failed — ${totalSent} sent so far`);
        break;
      }
      const data = await res.json();
      totalSent += data.sent || 0;
      totalFailed += data.failed || 0;
      if ((data.sent || 0) === 0) break; // No more to send
      setSendResult(`Batch ${batch}: ${totalSent} sent, ${totalFailed} failed`);
      await fetchTargets();
      batch++;
    }
    setSendResult(`Done: ${totalSent} emails sent${totalFailed > 0 ? `, ${totalFailed} failed` : ""}`);
    await fetchTargets();
    setSending(false);
  }

  async function updateCampaignStatus(status: string) {
    await fetch("/api/efd-outbound/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: campaignId, status }),
    });
    await fetchCampaign();
  }

  async function markAsSent(targetId: string) {
    await fetch("/api/efd-outbound/targets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: targetId, status: "sent", sent_at: new Date().toISOString() }),
    });
    await fetchTargets();
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-neon-pink">Campaign not found</p>
        <Link href="/dashboard/efd-outbound" className="text-neon-cyan text-sm">&larr; Back</Link>
      </div>
    );
  }

  const stats = {
    total: targets.length,
    pending: targets.filter((t) => t.status === "pending").length,
    sent: targets.filter((t) => t.status === "sent").length,
    viewed: targets.filter((t) => t.status === "viewed").length,
    clicked: targets.filter((t) => t.status === "clicked").length,
    inquired: targets.filter((t) => ["inquired", "converted"].includes(t.status)).length,
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-2">
        <Link href="/dashboard/efd-outbound" className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors">
          &larr; Outbound Campaigns
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">
            {campaign.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
              campaign.status === "active" ? "bg-neon-cyan/15 text-neon-cyan" : "bg-surface-container-high text-on-surface-variant"
            }`}>
              {campaign.status}
            </span>
            {campaign.description && (
              <span className="text-on-surface-variant text-sm">{campaign.description}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === "draft" && (
            <button
              onClick={() => updateCampaignStatus("active")}
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors"
            >
              Activate
            </button>
          )}
          {campaign.status === "active" && (
            <button
              onClick={() => updateCampaignStatus("paused")}
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-pink/15 text-neon-pink hover:bg-neon-pink/25 transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={sendOutreach}
            disabled={sending || stats.pending === 0}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-violet/15 text-neon-violet hover:bg-neon-violet/25 transition-colors disabled:opacity-40"
          >
            {sending ? "Sending..." : `Send Outreach (${targets.filter(t => t.status === "pending" && t.email).length} ready)`}
          </button>
        </div>
      </div>

      {/* Send result */}
      {sendResult && (
        <div className="bg-surface-container rounded-xl p-4 mb-4">
          <p className="text-neon-violet text-sm">{sendResult}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Pending", value: stats.pending, color: "" },
          { label: "Sent", value: stats.sent, color: "" },
          { label: "Viewed", value: stats.viewed, color: "text-neon-violet" },
          { label: "Clicked", value: stats.clicked, color: "text-neon-violet" },
          { label: "Inquired", value: stats.inquired, color: "text-neon-cyan" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-high rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold font-mono ${s.color || "text-on-surface"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddTarget(!showAddTarget)}
          className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-violet/15 text-neon-violet hover:bg-neon-violet/25 transition-colors"
        >
          + Add Target
        </button>
        <label className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-colors cursor-pointer">
          {importing ? "Importing..." : "Import CSV"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
            disabled={importing}
          />
        </label>
      </div>

      {/* Add Target Form */}
      {showAddTarget && (
        <AddTargetForm onSave={addTarget} onCancel={() => setShowAddTarget(false)} />
      )}

      {/* Target List */}
      {targets.length === 0 ? (
        <div className="bg-surface-container rounded-xl p-12 text-center">
          <p className="text-on-surface-variant mb-2">No targets yet</p>
          <p className="text-on-surface-variant text-xs">Add targets manually or import a CSV with columns: company_name, contact_name, email</p>
        </div>
      ) : (
        <div className="bg-surface-container rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant border-b border-outline-variant/20">
                <th className="text-left py-3 px-4">Company</th>
                <th className="text-left py-3 px-3">Contact</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Magic Link</th>
                <th className="text-left py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                  <td className="py-3 px-4 text-on-surface font-medium">{t.company_name}</td>
                  <td className="py-3 px-3 text-on-surface-variant">{t.contact_name || "—"}</td>
                  <td className="py-3 px-3 text-on-surface-variant text-xs">{t.email || "—"}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${targetStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(t.magic_link_url)}
                      className="text-neon-cyan text-xs hover:underline font-mono"
                      title={t.magic_link_url}
                    >
                      Copy Link
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    {t.status === "pending" && (
                      <button
                        onClick={() => markAsSent(t.id)}
                        className="text-xs text-on-surface-variant hover:text-neon-violet transition-colors"
                      >
                        Mark Sent
                      </button>
                    )}
                    {t.viewed_at && (
                      <span className="text-[10px] text-on-surface-variant">
                        Viewed {new Date(t.viewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddTargetForm({
  onSave,
  onCancel,
}: {
  onSave: (form: { company_name: string; contact_name: string; email: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ company_name: "", contact_name: "", email: "" });
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full bg-surface-container border-0 border-b border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-neon-violet transition-all placeholder:text-on-surface-variant/40";

  return (
    <div className="bg-surface-container-high rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-on-surface font-bold text-sm">Add Target</h3>
        <button onClick={onCancel} className="text-on-surface-variant text-xs hover:text-on-surface">Cancel</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <input className={inputClass} placeholder="Company name" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        <input className={inputClass} placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
        <input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <button
        onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
        disabled={saving || !form.company_name}
        className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
      >
        {saving ? "Adding..." : "Add Target"}
      </button>
    </div>
  );
}
