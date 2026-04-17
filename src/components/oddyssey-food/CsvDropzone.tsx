"use client";

import { useRef, useState } from "react";

interface Props {
  onFile: (filename: string, text: string) => void;
}

export function CsvDropzone({ onFile }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please drop a .csv file.");
      return;
    }
    const text = await file.text();
    onFile(file.name, text);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
        background: dragging ? "var(--accent-dim)" : "var(--bg-elevated)",
        padding: "80px 32px", textAlign: "center", cursor: "pointer",
        transition: "all 0.3s",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300, letterSpacing: 2, marginBottom: 12 }}>
        Drop Ticketure CSV here
      </div>
      <div style={{ fontSize: 12, letterSpacing: 1.5, color: "var(--text-muted)", textTransform: "uppercase" }}>
        or click to choose a file
      </div>
      {error && (
        <div style={{ marginTop: 24, fontSize: 12, color: "var(--danger)", letterSpacing: 1 }}>
          {error}
        </div>
      )}
    </div>
  );
}
