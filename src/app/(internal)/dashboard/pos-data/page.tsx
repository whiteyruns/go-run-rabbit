"use client";

import { useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { MetricCard } from "@/components/ui/metric-card";
import { parseCSV } from "@/lib/csv-parser";
import { analyzePMIXData } from "@/lib/pmix-analyzer";
import { analyzeReservationData } from "@/lib/reservation-analyzer";
import { fmt, fmtNum, COLORS } from "@/lib/utils";

type PMIXAnalysis = ReturnType<typeof analyzePMIXData>;
type SRAnalysis = ReturnType<typeof analyzeReservationData>;

export default function PosDataPage() {
  const [pmixAnalysis, setPmixAnalysis] = useState<PMIXAnalysis>(null);
  const [srAnalysis, setSrAnalysis] = useState<SRAnalysis>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [posView, setPosView] = useState("overview");
  const [rawPmixCount, setRawPmixCount] = useState(0);
  const [rawSrCount, setRawSrCount] = useState(0);
  const pmixFileRef = useRef<HTMLInputElement>(null);
  const srFileRef = useRef<HTMLInputElement>(null);

  const loadDemoData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [pmixResp, srResp] = await Promise.all([
        fetch("/data/toast-pmix.csv"),
        fetch("/data/sevenrooms-reservations.csv"),
      ]);
      if (!pmixResp.ok) throw new Error(`Could not load sample data (${pmixResp.status})`);
      const pmixText = await pmixResp.text();
      const srText = srResp.ok ? await srResp.text() : "";
      const pmixRows = parseCSV(pmixText);
      const srRows = srText ? parseCSV(srText) : [];
      setRawPmixCount(pmixRows.length);
      setRawSrCount(srRows.length);
      setPmixAnalysis(analyzePMIXData(pmixRows));
      if (srRows.length) setSrAnalysis(analyzeReservationData(srRows));
    } catch (e) {
      setDataError((e as Error).message);
    }
    setDataLoading(false);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: "pmix" | "sr") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      if (type === "pmix") {
        setRawPmixCount(rows.length);
        setPmixAnalysis(analyzePMIXData(rows));
      } else {
        setRawSrCount(rows.length);
        setSrAnalysis(analyzeReservationData(rows));
      }
    };
    reader.readAsText(file);
  }, []);

  const clearData = () => {
    setPmixAnalysis(null);
    setSrAnalysis(null);
    setPosView("overview");
    setRawPmixCount(0);
    setRawSrCount(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">POS DATA</h1>
      <p className="text-on-surface-variant mb-10">Import and analyze Toast PMIX and SevenRooms reservation data</p>

      {/* Import UI — show when no data loaded */}
      {!pmixAnalysis && (
        <div className="space-y-8">
          <div className="bg-surface-container rounded-xl p-8">
            <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Data Pipeline</p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3">Import POS & Reservation Data</h2>
            <p className="text-on-surface-variant max-w-2xl mb-8">
              Upload Toast PMIX exports and SevenRooms data, or load the demo dataset with 58K drink sales across 9 venues.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-surface-container-high rounded-xl p-6">
                <p className="text-on-surface font-bold text-sm mb-2">Toast PMIX Export</p>
                <p className="text-on-surface-variant text-xs mb-4">Product mix report from Toast Back Office</p>
                <input ref={pmixFileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, "pmix")} />
                <button onClick={() => pmixFileRef.current?.click()}
                  className="bg-surface-container hover:bg-surface-bright text-on-surface text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2.5 rounded-lg w-full transition-colors">
                  Upload CSV
                </button>
              </div>
              <div className="bg-surface-container-high rounded-xl p-6">
                <p className="text-on-surface font-bold text-sm mb-2">SevenRooms Export</p>
                <p className="text-on-surface-variant text-xs mb-4">Reservation data with guest profiles</p>
                <input ref={srFileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, "sr")} />
                <button onClick={() => srFileRef.current?.click()}
                  className="bg-surface-container hover:bg-surface-bright text-on-surface text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2.5 rounded-lg w-full transition-colors">
                  Upload CSV
                </button>
              </div>
              <div className="bg-surface-container-high rounded-xl p-6 ring-1 ring-neon-cyan/20">
                <p className="text-neon-cyan font-bold text-sm mb-2">Load Demo Data</p>
                <p className="text-on-surface-variant text-xs mb-4">58K drink sales + 20K reservations (6 months)</p>
                <button onClick={loadDemoData} disabled={dataLoading}
                  className="bg-neon-cyan/20 hover:bg-neon-cyan/30 disabled:opacity-40 text-neon-cyan text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2.5 rounded-lg w-full transition-colors">
                  {dataLoading ? "Loading..." : "Load Sample Data"}
                </button>
              </div>
            </div>
            {dataError && <p className="text-neon-pink text-sm">{dataError}</p>}
          </div>
        </div>
      )}

      {/* Data loaded — show analysis */}
      {pmixAnalysis && (
        <div className="space-y-8">
          {/* Status + view switcher */}
          <div className="bg-surface-container rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-2.5 h-2.5 bg-neon-cyan rounded-full animate-pulse" />
              <div>
                <p className="text-neon-cyan font-bold text-sm">POS Data Loaded</p>
                <p className="text-on-surface-variant text-xs">
                  {fmtNum(rawPmixCount)} PMIX rows &middot; {pmixAnalysis.totalDays} days &middot; {pmixAnalysis.venueBreakdown.length} venues
                  {srAnalysis ? ` · ${fmtNum(rawSrCount)} reservations` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {["overview", "topsellers", "venues", "categories", "reservations"].map(v => (
                <button key={v} onClick={() => setPosView(v)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-md transition-all ${
                    posView === v ? "bg-neon-violet/15 text-neon-violet" : "text-on-surface-variant hover:text-on-surface"
                  }`}>
                  {v === "overview" ? "Overview" : v === "topsellers" ? "Top Sellers" : v === "venues" ? "By Venue" : v === "categories" ? "Categories" : "Reservations"}
                </button>
              ))}
              <button onClick={clearData} className="text-on-surface-variant/40 hover:text-neon-pink text-[10px] font-bold uppercase tracking-[0.15em] ml-2 transition-colors">Clear</button>
            </div>
          </div>

          {/* OVERVIEW */}
          {posView === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total Drinks Sold" value={fmtNum(pmixAnalysis.totalQty)} sub={`${pmixAnalysis.totalDays} days (${fmtNum(Math.round(pmixAnalysis.avgDailyDrinks))}/day)`} accent />
                <MetricCard label="Gross Revenue" value={fmt(pmixAnalysis.totalGross)} sub={`${fmt(Math.round(pmixAnalysis.avgDailyRevenue))}/day avg`} />
                <MetricCard label="Pour Cost" value={`${(pmixAnalysis.overallPourCost * 100).toFixed(1)}%`} sub={`${fmt(Math.round(pmixAnalysis.totalCost))} total COGS`} />
                <MetricCard label="Voids + Comps" value={fmtNum(pmixAnalysis.totalVoids + pmixAnalysis.totalComps)} sub={`${((pmixAnalysis.totalVoids + pmixAnalysis.totalComps) / pmixAnalysis.totalQty * 100).toFixed(2)}% of volume`} />
              </div>

              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Average Daily Revenue by Day of Week</h3>
                <p className="text-on-surface-variant text-sm mb-6">All venues combined</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(dow => ({
                    name: dow,
                    revenue: pmixAnalysis.dayOfWeekSales[dow] ? Math.round(pmixAnalysis.dayOfWeekSales[dow].gross / Math.max(pmixAnalysis.dayOfWeekSales[dow].days, 1)) : 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
                    <XAxis dataKey="name" tick={{ fill: "#acaaae", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="revenue" fill="#00eefc" name="Avg Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Monthly Revenue Trend</h3>
                <p className="text-on-surface-variant text-sm mb-6">Actual revenue — shows tentpole and seasonal impact</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={Object.entries(pmixAnalysis.monthSales).sort(([a],[b]) => a.localeCompare(b)).map(([month, d]) => ({
                    month: month.slice(2), revenue: Math.round(d.gross),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
                    <XAxis dataKey="month" tick={{ fill: "#acaaae", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} formatter={(v) => fmt(Number(v))} />
                    <Line type="monotone" dataKey="revenue" stroke="#aea2ff" strokeWidth={2} name="Monthly Revenue" dot={{ r: 4, fill: "#aea2ff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TOP SELLERS */}
          {posView === "topsellers" && (
            <div className="space-y-6">
              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Top 20 Drinks by Volume</h3>
                <p className="text-on-surface-variant text-sm mb-6">Across all venues — {pmixAnalysis.totalDays} days</p>
                <ResponsiveContainer width="100%" height={520}>
                  <BarChart data={pmixAnalysis.topSellers.slice(0, 20).map(d => ({
                    name: d.name.length > 22 ? d.name.slice(0,20) + "..." : d.name, qty: d.qty,
                  }))} layout="vertical" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
                    <XAxis type="number" tick={{ fill: "#acaaae", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={160} tick={{ fill: "#acaaae", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} />
                    <Bar dataKey="qty" fill="#aea2ff" name="Units Sold" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-on-surface font-extrabold text-lg">Top 30 — Detailed</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-highest">
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">#</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">Item</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">Category</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] text-right">Qty</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] text-right">Revenue</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] text-right">Pour Cost</th>
                        <th className="py-3 px-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pmixAnalysis.topSellers.slice(0, 30).map((item, i) => (
                        <tr key={item.name} className="border-t border-outline-variant/10 hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 text-on-surface-variant text-sm font-mono">{i + 1}</td>
                          <td className="py-3 px-4 text-on-surface text-sm font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-on-surface-variant text-xs">{item.spiritCat || item.group}</td>
                          <td className="py-3 px-4 text-neon-cyan text-sm font-mono text-right">{fmtNum(item.qty)}</td>
                          <td className="py-3 px-4 text-neon-cyan text-sm font-mono text-right">{fmt(Math.round(item.gross))}</td>
                          <td className="py-3 px-4 text-sm font-mono text-right">
                            <span className={item.pourCost > 0.25 ? "text-neon-pink" : item.pourCost > 0.20 ? "text-neon-violet" : "text-neon-cyan"}>
                              {(item.pourCost * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neon-cyan text-sm font-mono font-bold text-right">{fmt(Math.round(item.gross - item.cost))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BY VENUE */}
          {posView === "venues" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pmixAnalysis.venueBreakdown.map(v => (
                  <div key={v.name} className="bg-surface-container-high rounded-xl p-5 hover:bg-surface-bright transition-colors">
                    <p className="text-on-surface font-bold text-sm mb-1">{v.name}</p>
                    <p className="text-neon-cyan font-mono text-xl font-bold">{fmt(Math.round(v.gross))}</p>
                    <p className="text-on-surface-variant text-xs">{fmtNum(v.qty)} drinks &middot; {(v.pourCost * 100).toFixed(1)}% pour cost</p>
                    <div className="mt-3 pt-3 border-t border-outline-variant/10">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Annualized</p>
                      <p className="text-neon-violet font-mono font-bold">{fmt(Math.round(v.gross * 365 / pmixAnalysis.totalDays))}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-6">Revenue by Venue</h3>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={pmixAnalysis.venueBreakdown.map(v => ({
                    name: v.name.length > 16 ? v.name.slice(0,14) + "..." : v.name,
                    profit: Math.round(v.gross - v.cost), cost: Math.round(v.cost),
                  }))} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
                    <XAxis dataKey="name" tick={{ fill: "#acaaae", fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Bar dataKey="profit" stackId="a" fill="#00eefc" name="Gross Profit" />
                    <Bar dataKey="cost" stackId="a" fill="#ff6b98" name="COGS" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {posView === "categories" && (
            <div className="space-y-6">
              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Revenue by Menu Group</h3>
                <p className="text-on-surface-variant text-sm mb-6">Actual category split from POS data</p>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={pmixAnalysis.categoryBreakdown.map(c => ({
                    name: c.name.split(" - ")[0].split(" (")[0], revenue: Math.round(c.gross),
                  }))} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252a" />
                    <XAxis dataKey="name" tick={{ fill: "#acaaae", fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
                    <YAxis tick={{ fill: "#acaaae", fontSize: 11 }} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="revenue" fill="#aea2ff" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface-container-high rounded-xl p-8">
                <h3 className="text-on-surface font-extrabold text-lg mb-1">Spirit Category Breakdown</h3>
                <p className="text-on-surface-variant text-sm mb-6">Real volume data for brand pitches</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(pmixAnalysis.spiritCategoryCases).sort(([,a],[,b]) => b.qty - a.qty).map(([cat, d]) => {
                    const annualDrinks = Math.round(d.qty * 365 / pmixAnalysis.totalDays);
                    const estCases = Math.round(annualDrinks / 204);
                    const colors: Record<string,string> = { "Tequila / Mezcal": "#00eefc", "Vodka": "#aea2ff", "Whiskey / Bourbon": "#7157ff", "Rum": "#ff6b98", "Gin": "#00deec", "Other Spirits": "#acaaae" };
                    return (
                      <div key={cat} className="bg-surface-container rounded-lg p-4">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">{cat}</p>
                        <p className="font-mono font-bold text-xl" style={{ color: colors[cat] || "#aea2ff" }}>{fmtNum(d.qty)}</p>
                        <p className="text-on-surface-variant text-xs">drinks ({pmixAnalysis.totalDays}d)</p>
                        <div className="mt-2 pt-2 border-t border-outline-variant/10">
                          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">Est. Annual Cases</p>
                          <p className="text-neon-cyan font-mono font-bold text-sm">{fmtNum(estCases)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RESERVATIONS */}
          {posView === "reservations" && srAnalysis && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total Reservations" value={fmtNum(srAnalysis.totalRes)} sub={`${srAnalysis.totalDays} days`} accent />
                <MetricCard label="Total Covers" value={fmtNum(srAnalysis.totalCovers)} sub={`${srAnalysis.avgPartySize.toFixed(1)} avg party`} />
                <MetricCard label="No-Show Rate" value={`${(srAnalysis.noShowRate * 100).toFixed(1)}%`} sub={`${fmtNum(srAnalysis.totalNoShows)} no-shows`} />
                <MetricCard label="Avg Lifetime Spend" value={`$${Math.round(srAnalysis.avgLifetimeSpend)}`} sub="Per guest" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-high rounded-xl p-6">
                  <h3 className="text-on-surface font-extrabold text-lg mb-4">By Venue</h3>
                  <div className="space-y-3">
                    {srAnalysis.venueTotals.map(v => (
                      <div key={v.name} className="flex items-center justify-between bg-surface-container rounded-lg p-3">
                        <div>
                          <p className="text-on-surface text-sm font-medium">{v.name}</p>
                          <p className="text-on-surface-variant text-xs">{fmtNum(v.covers)} covers &middot; {(v.noShows / v.res * 100).toFixed(1)}% no-show</p>
                        </div>
                        <div className="text-right">
                          <p className="text-neon-cyan font-mono font-bold">{fmtNum(v.res)}</p>
                          <p className="text-on-surface-variant text-xs">${fmtNum(v.avgSpend)} avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-surface-container-high rounded-xl p-6">
                    <h3 className="text-on-surface font-extrabold text-lg mb-4">Booking Source</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={srAnalysis.sourceTotals.slice(0, 6)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {srAnalysis.sourceTotals.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1f1f23", border: "none", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-surface-container-high rounded-xl p-6">
                    <h3 className="text-on-surface font-extrabold text-lg mb-3">Guest Segments</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-container rounded-lg p-3 text-center">
                        <p className="text-neon-violet font-mono text-xl font-bold">{fmtNum(srAnalysis.repeatVisitors.first)}</p>
                        <p className="text-on-surface-variant text-xs">First Timers</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3 text-center">
                        <p className="text-neon-cyan font-mono text-xl font-bold">{fmtNum(srAnalysis.repeatVisitors.returning)}</p>
                        <p className="text-on-surface-variant text-xs">Returning</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3 text-center">
                        <p className="text-neon-cyan font-mono text-xl font-bold">{fmtNum(srAnalysis.repeatVisitors.regular)}</p>
                        <p className="text-on-surface-variant text-xs">Regulars</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {posView === "reservations" && !srAnalysis && (
            <div className="bg-surface-container-high rounded-xl p-12 text-center">
              <p className="text-on-surface-variant mb-4">No SevenRooms data loaded</p>
              <button onClick={() => srFileRef.current?.click()}
                className="bg-surface-container hover:bg-surface-bright text-on-surface text-sm px-4 py-2 rounded-lg transition-colors">
                Upload SevenRooms CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
