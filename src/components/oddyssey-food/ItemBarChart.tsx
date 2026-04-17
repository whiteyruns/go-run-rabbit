"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import type { MenuTotals } from "@/lib/oddyssey-food/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  totals: MenuTotals;
  height?: number;
}

export function ItemBarChart({ totals, height = 280 }: Props) {
  const catalog = getMenuCatalog();
  const data = catalog.map((c) => ({
    name: c.label,
    count: totals[c.id] ?? 0,
  }));
  if ((totals["__unknown__"] ?? 0) > 0) {
    data.push({ name: "Unknown", count: totals["__unknown__"] });
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9a958d", fontSize: 11, letterSpacing: 1 }}
            axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#5a5650", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(201,168,76,0.06)" }}
            contentStyle={{
              background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 0, color: "#e8e4dd", fontSize: 12,
            }}
            labelStyle={{ color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase", fontSize: 10 }}
          />
          <Bar dataKey="count" fill="#c9a84c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
