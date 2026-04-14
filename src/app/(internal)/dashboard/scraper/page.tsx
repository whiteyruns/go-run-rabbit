"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ScrapeJob {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  config: Record<string, string>;
  status: string;
  result_count: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

const sourceLabel: Record<string, string> = {
  "dmc-directory": "DMC Directory",
  "ces-exhibitors": "CES Exhibitors",
  "business-directory": "Business Directory",
  "custom-url": "Custom URL",
};

const statusColor = (s: string) => {
  if (s === "completed") return "bg-neon-cyan/15 text-neon-cyan";
  if (s === "running") return "bg-neon-violet/15 text-neon-violet";
  if (s === "failed") return "bg-neon-pink/15 text-neon-pink";
  return "bg-surface-container-high text-on-surface-variant";
};

export default function ScraperPage() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [running, setRunning] = useState(false);

  const fetchJobs = useCallback(async () => {
    const res = await fetch("/api/scraper");
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function runScrape(form: { name: string; source_type: string; config: Record<string, string> }) {
    setRunning(true);
    const res = await fetch("/api/scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchJobs();
      setShowCreate(false);
    }
    setRunning(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">SCRAPER</h1>
          <p className="text-on-surface-variant">
            CBM lead scraping tool — DMCs, exhibitors, local businesses
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors"
        >
          + New Scrape
        </button>
      </div>

      {showCreate && (
        <ScrapeForm onRun={runScrape} onCancel={() => setShowCreate(false)} running={running} />
      )}

      {loading ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-surface-container rounded-xl p-12 text-center">
          <p className="text-on-surface-variant mb-2">No scrape jobs yet</p>
          <p className="text-on-surface-variant text-xs">Create a scrape job to start building target lists</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface-container-high rounded-xl p-6 hover:bg-surface-bright transition-colors"
            >
              <div className="flex items-center justify-between">
                <Link href={`/dashboard/scraper/${job.id}`} className="flex items-center gap-4 flex-1">
                  <h3 className="text-on-surface font-bold text-lg">{job.name}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    {sourceLabel[job.source_type] || job.source_type}
                  </span>
                </Link>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <span>
                    <span className="text-on-surface font-mono font-bold">{job.result_count}</span> results
                  </span>
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete "${job.name}" and all its results?`)) return;
                      await fetch(`/api/scraper?id=${job.id}`, { method: "DELETE" });
                      await fetchJobs();
                    }}
                    className="text-[10px] text-on-surface-variant hover:text-neon-pink transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {job.description && (
                <p className="text-on-surface-variant text-sm mt-2">{job.description}</p>
              )}
              {job.error_message && (
                <p className="text-neon-pink text-xs mt-2">{job.error_message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScrapeForm({
  onRun,
  onCancel,
  running,
}: {
  onRun: (form: { name: string; source_type: string; config: Record<string, string> }) => Promise<void>;
  onCancel: () => void;
  running: boolean;
}) {
  const [sourceType, setSourceType] = useState("dmc-directory");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [zip, setZip] = useState("");
  const [url, setUrl] = useState("");
  const [year, setYear] = useState("2027");

  const inputClass =
    "w-full bg-surface-container border-0 border-b border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-neon-violet transition-all placeholder:text-on-surface-variant/40";

  function buildConfig(): Record<string, string> {
    switch (sourceType) {
      case "dmc-directory":
        return {};
      case "ces-exhibitors":
        return { year, categories: category };
      case "business-directory":
        return { category, zip, city: "Las Vegas", state: "NV" };
      case "custom-url":
        return { url, category };
      default:
        return {};
    }
  }

  function autoName() {
    switch (sourceType) {
      case "dmc-directory": return "Las Vegas DMC Directory";
      case "ces-exhibitors": return `CES ${year} Exhibitors`;
      case "business-directory": return `${category} in ${zip || "Las Vegas"}`;
      case "custom-url": return `Custom: ${url.slice(0, 40)}`;
      default: return "";
    }
  }

  return (
    <div className="bg-surface-container-high rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-on-surface font-bold">New Scrape Job</h3>
        <button onClick={onCancel} className="text-on-surface-variant text-xs hover:text-on-surface">Cancel</button>
      </div>

      {/* Source type */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { key: "dmc-directory", label: "DMC Directory" },
          { key: "ces-exhibitors", label: "CES Exhibitors" },
          { key: "business-directory", label: "Business Directory" },
          { key: "custom-url", label: "Custom URL" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSourceType(t.key)}
            className={`text-xs font-bold uppercase tracking-[0.1em] px-3 py-2 rounded-lg transition-colors ${
              sourceType === t.key
                ? "bg-neon-violet/20 text-neon-violet"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Config fields based on type */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <input className={inputClass} placeholder="Job name" value={name} onChange={(e) => setName(e.target.value)} />

        {sourceType === "ces-exhibitors" && (
          <input className={inputClass} placeholder="Year (e.g. 2027)" value={year} onChange={(e) => setYear(e.target.value)} />
        )}

        {sourceType === "business-directory" && (
          <>
            <input className={inputClass} placeholder="Category (e.g. lawyers, restaurants)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className={inputClass} placeholder="Zip code (e.g. 89101)" value={zip} onChange={(e) => setZip(e.target.value)} />
          </>
        )}

        {sourceType === "custom-url" && (
          <>
            <input className={inputClass} placeholder="URL to scrape" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input className={inputClass} placeholder="Category label" value={category} onChange={(e) => setCategory(e.target.value)} />
          </>
        )}
      </div>

      <button
        onClick={() => onRun({ name: name || autoName(), source_type: sourceType, config: buildConfig() })}
        disabled={running}
        className="text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-lg bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
      >
        {running ? "Scraping..." : "Run Scrape"}
      </button>
    </div>
  );
}
