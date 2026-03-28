"use client";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent ? "text-amber-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
