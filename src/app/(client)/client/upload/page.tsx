"use client";

import { useState, useRef } from "react";

interface UploadResult {
  type: string;
  fileName: string;
  imported: number;
  total: number;
  timestamp: string;
}

export default function ClientUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);
  const pmixRef = useRef<HTMLInputElement>(null);
  const srRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "pmix" | "reservations") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/pos-data/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResults(prev => [{
        type: type === "pmix" ? "Toast PMIX" : "SevenRooms",
        fileName: file.name,
        imported: data.imported,
        total: data.total,
        timestamp: new Date().toLocaleString(),
      }, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    }

    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">Upload Data</h1>
      <p className="text-gray-400 mb-10">Upload your Toast PMIX exports and SevenRooms reservation data</p>

      <div className="space-y-6">
        {/* Toast PMIX */}
        <div className="bg-gray-900/50 rounded-xl p-8">
          <h3 className="text-white font-bold text-lg mb-2">Toast PMIX Export</h3>
          <p className="text-gray-400 text-sm mb-4">
            Product mix report from Toast Back Office. Go to Reports &rarr; Sales &rarr; Product Mix (PMIX), select all venues, export as CSV.
          </p>
          <input ref={pmixRef} type="file" accept=".csv" className="hidden" onChange={e => handleUpload(e, "pmix")} />
          <button onClick={() => pmixRef.current?.click()} disabled={uploading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-sm px-6 py-3 rounded-lg transition-colors font-bold">
            {uploading ? "Uploading..." : "Upload Toast CSV"}
          </button>
        </div>

        {/* SevenRooms */}
        <div className="bg-gray-900/50 rounded-xl p-8">
          <h3 className="text-white font-bold text-lg mb-2">SevenRooms Reservations</h3>
          <p className="text-gray-400 text-sm mb-4">
            Reservation export with guest profiles. Include columns: Venue, Date, Time, Party Size, Status, Source, Guest Name, Visit Count.
          </p>
          <input ref={srRef} type="file" accept=".csv" className="hidden" onChange={e => handleUpload(e, "reservations")} />
          <button onClick={() => srRef.current?.click()} disabled={uploading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-sm px-6 py-3 rounded-lg transition-colors font-bold">
            {uploading ? "Uploading..." : "Upload SevenRooms CSV"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload history */}
        {results.length > 0 && (
          <div className="bg-gray-900/50 rounded-xl p-8">
            <h3 className="text-white font-bold text-lg mb-4">Upload History</h3>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <div>
                    <p className="text-white text-sm font-medium">{r.type}: {r.fileName}</p>
                    <p className="text-gray-500 text-xs">{r.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-mono font-bold">{r.imported.toLocaleString()} imported</p>
                    <p className="text-gray-500 text-xs">of {r.total.toLocaleString()} rows</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
