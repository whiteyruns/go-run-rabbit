"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ScrapeJob {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  status: string;
  result_count: number;
  created_at: string;
}

interface ScrapeResult {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  email_status: string | null;
  email_method: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  category: string | null;
  source_url: string | null;
  exported: boolean;
}

interface Campaign {
  id: string;
  name: string;
}

export default function ScrapeJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<ScrapeJob | null>(null);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<string | null>(null);
  const [deduping, setDeduping] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [pipelineEmails, setPipelineEmails] = useState<Record<string, string>>({}); // email -> status

  const fetchData = useCallback(async () => {
    const [jobRes, resultsRes, campaignsRes, leadsRes] = await Promise.all([
      fetch("/api/scraper"),
      fetch(`/api/scraper/results?job_id=${jobId}`),
      fetch("/api/efd-outbound/campaigns"),
      fetch("/api/efd-leads"),
    ]);

    if (jobRes.ok) {
      const allJobs = await jobRes.json();
      setJob(allJobs.find((j: ScrapeJob) => j.id === jobId) || null);
    }
    if (resultsRes.ok) setResults(await resultsRes.json());
    if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
    if (leadsRes.ok) {
      const leads = await leadsRes.json();
      const emailMap: Record<string, string> = {};
      for (const l of leads) {
        if (l.email) emailMap[l.email.toLowerCase()] = l.status;
      }
      setPipelineEmails(emailMap);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function exportToCampaign() {
    if (!selectedCampaign) return;
    setExporting(true);
    const res = await fetch("/api/scraper/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, campaign_id: selectedCampaign }),
    });
    if (res.ok) {
      const data = await res.json();
      setExportResult(`Exported ${data.exported} targets to campaign`);
      await fetchData();
    }
    setExporting(false);
  }

  async function enrichResults() {
    setEnriching(true);
    setEnrichResult("Enriching batch 1...");
    let totalFound = 0;
    let totalProcessed = 0;
    let remaining = 1;
    let batch = 1;

    try {
      // Run in batches until no more remain
      while (remaining > 0 && batch <= 20) {
        const res = await fetch("/api/scraper/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: jobId, batch_size: 3 }),
        });
        if (!res.ok) {
          const err = await res.json();
          setEnrichResult(`Batch ${batch} error: ${err.error || "failed"} — ${totalFound} emails found so far`);
          break;
        }
        const data = await res.json();
        totalFound += data.emails_found || 0;
        totalProcessed += data.processed || 0;
        remaining = data.remaining || 0;

        const cleaned = data.generics_cleaned ? ` (${data.generics_cleaned} generics removed)` : "";
        setEnrichResult(`Batch ${batch}: ${totalFound} emails found across ${totalProcessed} results${cleaned}${remaining > 0 ? ` — ${remaining} remaining...` : ""}`);
        await fetchData();
        batch++;
      }
      setEnrichResult(`Done: ${totalFound} personal emails found across ${totalProcessed} results`);
      await fetchData();
    } catch {
      setEnrichResult("Enrichment request failed");
    }
    setEnriching(false);
  }

  function downloadCSV() {
    const headers = ["company_name", "contact_name", "email", "phone", "website", "address", "category"];
    const rows = results.map((r) =>
      headers.map((h) => {
        const val = r[h as keyof ScrapeResult];
        return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : "";
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job?.name || "scrape"}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10">
        <p className="text-neon-pink">Job not found</p>
        <Link href="/dashboard/scraper" className="text-neon-cyan text-sm">&larr; Back</Link>
      </div>
    );
  }

  const unexported = results.filter((r) => !r.exported).length;
  const withEmail = results.filter((r) => r.email).length;
  const withPhone = results.filter((r) => r.phone).length;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-2">
        <Link href="/dashboard/scraper" className="text-on-surface-variant text-xs hover:text-neon-cyan transition-colors">
          &larr; Scraper
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">{job.name}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
              job.status === "completed" ? "bg-neon-cyan/15 text-neon-cyan" : "bg-neon-pink/15 text-neon-pink"
            }`}>
              {job.status}
            </span>
            <span className="text-on-surface-variant text-xs">
              {new Date(job.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={enrichResults}
            disabled={enriching}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-violet/15 text-neon-violet hover:bg-neon-violet/25 transition-colors disabled:opacity-40"
            title="Runs all 4 strategies: website scrape → Google dork → business listing → pattern guess"
          >
            {enriching ? "Enriching..." : "Deep Enrich"}
          </button>
          <button
            onClick={async () => {
              setDeduping(true);
              const res = await fetch("/api/scraper/dedup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId }),
              });
              if (res.ok) {
                const data = await res.json();
                setEnrichResult(`Removed ${data.duplicates} duplicates — ${data.remaining} remaining`);
                await fetchData();
              }
              setDeduping(false);
            }}
            disabled={deduping}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-pink/15 text-neon-pink hover:bg-neon-pink/25 transition-colors disabled:opacity-40"
          >
            {deduping ? "Deduping..." : "Remove Duplicates"}
          </button>
          <button
            onClick={async () => {
              setVerifying(true);
              setEnrichResult("Verifying emails...");
              let totalValid = 0;
              let totalInvalid = 0;
              let remaining = 1;
              let batch = 1;
              while (remaining > 0 && batch <= 10) {
                const res = await fetch("/api/scraper/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ job_id: jobId, batch_size: 20 }),
                });
                if (!res.ok) break;
                const data = await res.json();
                totalValid += data.mx_valid || 0;
                totalInvalid += data.invalid || 0;
                remaining = data.remaining || 0;
                setEnrichResult(`Batch ${batch}: ${totalValid} valid, ${totalInvalid} invalid${remaining > 0 ? ` — ${remaining} remaining...` : ""}`);
                await fetchData();
                batch++;
              }
              setEnrichResult(`Verification done: ${totalValid} valid, ${totalInvalid} invalid domains`);
              setVerifying(false);
            }}
            disabled={verifying}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
          >
            {verifying ? "Verifying..." : "Verify Emails"}
          </button>
          <button
            onClick={async () => {
              setResolving(true);
              setEnrichResult("Resolving Google Maps URLs...");
              let totalResolved = 0;
              let remaining = 1;
              let batch = 1;
              while (remaining > 0 && batch <= 20) {
                const res = await fetch("/api/scraper/resolve-urls", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ job_id: jobId, batch_size: 5 }),
                });
                if (!res.ok) break;
                const data = await res.json();
                totalResolved += data.resolved || 0;
                remaining = data.remaining || 0;
                setEnrichResult(`Batch ${batch}: ${totalResolved} resolved, ${remaining} remaining`);
                await fetchData();
                batch++;
                if ((data.resolved || 0) === 0 && remaining > 0) break;
              }
              setEnrichResult(`Done: ${totalResolved} URLs resolved to real websites`);
              setResolving(false);
            }}
            disabled={resolving}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-colors disabled:opacity-40"
          >
            {resolving ? "Resolving..." : "Resolve URLs"}
          </button>
          <button
            onClick={downloadCSV}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-colors"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-surface-container-high rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold font-mono text-on-surface">{results.length}</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Total Results</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold font-mono text-neon-cyan">{withEmail}</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">With Email</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold font-mono text-neon-violet">{withPhone}</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">With Phone</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold font-mono text-on-surface">{unexported}</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Not Exported</p>
        </div>
      </div>

      {/* Export to campaign */}
      <div className="bg-surface-container rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-on-surface-variant text-sm">Export to campaign:</span>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="bg-surface-container-high border-0 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none"
        >
          <option value="">Select campaign...</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={exportToCampaign}
          disabled={!selectedCampaign || exporting || unexported === 0}
          className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
        >
          {exporting ? "Exporting..." : `Export ${unexported} to Campaign`}
        </button>
        {exportResult && (
          <span className="text-neon-cyan text-xs">{exportResult}</span>
        )}
      </div>

      {/* Enrich result */}
      {enrichResult && (
        <div className="bg-surface-container rounded-xl p-4 mb-6">
          <p className="text-neon-violet text-sm">{enrichResult}</p>
        </div>
      )}

      {/* Results table */}
      <div className="bg-surface-container rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant border-b border-outline-variant/20">
              <th className="text-left py-3 px-4">Company</th>
              <th className="text-left py-3 px-3">Contact</th>
              <th className="text-left py-3 px-3">Email</th>
              <th className="text-left py-3 px-3">Phone</th>
              <th className="text-left py-3 px-3">Category</th>
              <th className="text-left py-3 px-3">Pipeline</th>
              <th className="text-left py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-on-surface font-medium">{r.company_name || "—"}</p>
                    {r.website && (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-neon-cyan text-[10px] hover:underline">
                        {r.website.replace(/^https?:\/\//, "").slice(0, 30)}
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-on-surface-variant">{r.contact_name || "—"}</td>
                <td className="py-3 px-3">
                  {r.email ? (
                    <div>
                      <span className="text-on-surface-variant text-xs">{r.email}</span>
                      {r.email_status && (
                        <span className={`ml-2 text-[8px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full ${
                          r.email_status === "mx-valid" ? "bg-neon-cyan/15 text-neon-cyan"
                          : r.email_status === "verified" ? "bg-neon-cyan/20 text-neon-cyan"
                          : r.email_status === "pattern-guess" ? "bg-neon-violet/15 text-neon-violet"
                          : r.email_status === "invalid" ? "bg-neon-pink/15 text-neon-pink"
                          : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {r.email_status}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-on-surface-variant text-xs">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-on-surface-variant text-xs">{r.phone || "—"}</td>
                <td className="py-3 px-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                    {r.category || "—"}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {r.email && pipelineEmails[r.email.toLowerCase()] ? (
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full ${
                      ["confirmed", "completed", "contract_signed", "accepted"].includes(pipelineEmails[r.email.toLowerCase()])
                        ? "bg-neon-cyan/15 text-neon-cyan"
                        : ["lost", "cancelled"].includes(pipelineEmails[r.email.toLowerCase()])
                          ? "bg-neon-pink/15 text-neon-pink"
                          : "bg-neon-violet/15 text-neon-violet"
                    }`}>
                      {pipelineEmails[r.email.toLowerCase()].replace(/_/g, " ")}
                    </span>
                  ) : (
                    <span className="text-[9px] text-on-surface-variant">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  {r.exported ? (
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-neon-cyan">Exported</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Ready</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
