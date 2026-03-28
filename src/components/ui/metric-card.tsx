"use client";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  trend?: string;
}

export function MetricCard({ label, value, sub, accent, trend }: MetricCardProps) {
  return (
    <div className="bg-surface-container-high rounded-xl p-5 hover:bg-surface-bright transition-colors">
      <p className="text-on-surface-variant text-[10px] font-bold tracking-[0.15em] uppercase mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-extrabold font-mono tracking-tight ${accent ? "text-neon-cyan" : "text-on-surface"}`}>{value}</p>
        {trend && (
          <span className={`text-xs font-bold ${trend.startsWith("+") ? "text-neon-cyan" : "text-neon-pink"}`}>{trend}</span>
        )}
      </div>
      {sub && <p className="text-on-surface-variant text-xs mt-1.5">{sub}</p>}
    </div>
  );
}
