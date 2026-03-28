"use client";

import { useState, useRef } from "react";

export default function PosDataPage() {
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const pmixFileRef = useRef<HTMLInputElement>(null);
  const srFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        POS Data Pipeline
      </h1>
      <p className="text-on-surface-variant mb-10">
        Import Toast PMIX exports and SevenRooms reservation data to replace
        estimates with real numbers.
      </p>

      <div className="space-y-8">
        {/* Import Controls */}
        <div className="bg-surface-container p-8 rounded-xl">
          <p className="text-neon-cyan text-[10px] font-bold tracking-[0.15em] uppercase mb-3">
            Data Pipeline
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">
            Import POS &amp; Reservation Data
          </h2>
          <p className="text-on-surface-variant max-w-2xl mb-8">
            Upload Toast PMIX exports and SevenRooms reservation data to replace
            estimates with real numbers. Or load the demo dataset to see what
            this dashboard can do with actual data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-high rounded-xl p-6">
              <p className="text-on-surface font-bold text-sm mb-2">
                Toast PMIX Export
              </p>
              <p className="text-on-surface-variant text-xs mb-4">
                Product mix report from Toast Back Office
              </p>
              <input
                ref={pmixFileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={() => {
                  /* CSV upload pipeline coming soon */
                }}
              />
              <button
                onClick={() => pmixFileRef.current?.click()}
                className="bg-surface-container hover:bg-surface-bright text-on-surface text-sm px-4 py-2.5 rounded-lg w-full transition-colors font-bold uppercase tracking-[0.15em] text-[10px]"
              >
                Upload CSV
              </button>
            </div>
            <div className="bg-surface-container-high rounded-xl p-6">
              <p className="text-on-surface font-bold text-sm mb-2">
                SevenRooms Export
              </p>
              <p className="text-on-surface-variant text-xs mb-4">
                Reservation data with guest profiles
              </p>
              <input
                ref={srFileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={() => {
                  /* CSV upload pipeline coming soon */
                }}
              />
              <button
                onClick={() => srFileRef.current?.click()}
                className="bg-surface-container hover:bg-surface-bright text-on-surface text-sm px-4 py-2.5 rounded-lg w-full transition-colors font-bold uppercase tracking-[0.15em] text-[10px]"
              >
                Upload CSV
              </button>
            </div>
            <div className="bg-surface-container-high rounded-xl p-6 ring-1 ring-neon-cyan/20">
              <p className="text-neon-cyan font-bold text-sm mb-2">
                Load Demo Data
              </p>
              <p className="text-on-surface-variant text-xs mb-4">
                58K drink sales + 20K reservations (6 months)
              </p>
              <button
                onClick={() => {
                  setDataLoading(true);
                  setDataError(
                    "Demo data pipeline not yet connected. Coming soon."
                  );
                  setDataLoading(false);
                }}
                disabled={dataLoading}
                className="bg-neon-cyan/20 hover:bg-neon-cyan/30 disabled:bg-surface-container text-neon-cyan text-sm px-4 py-2.5 rounded-lg w-full transition-colors font-bold uppercase tracking-[0.15em] text-[10px]"
              >
                {dataLoading ? "Loading..." : "Load Sample Data"}
              </button>
            </div>
          </div>
          {dataError && (
            <p className="text-neon-pink text-sm mb-6">{dataError}</p>
          )}
          <div className="bg-surface-container-high rounded-xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-neon-violet text-lg">&#9432;</span>
              <div>
                <h4 className="text-neon-violet font-bold text-sm mb-1">
                  How to get the data from Toast
                </h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Toast Back Office &rarr; Reports &rarr; Sales &rarr; Product
                  Mix (PMIX). Select date range, all venues, export as CSV. The
                  file should contain columns for: Location, Business Date, Menu
                  Group, Menu Item, Qty Sold, Gross Sales, Item Cost, Net Sales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for loaded data views */}
        <div className="bg-surface-container-high rounded-xl p-12 text-center">
          <div className="text-on-surface-variant text-5xl mb-4">&#128202;</div>
          <h3 className="text-on-surface font-bold text-xl mb-2">
            POS Data Analysis Coming Soon
          </h3>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            Once the CSV upload pipeline is wired, this page will show real-time
            analysis including top sellers, venue breakdowns, category splits,
            day-of-week revenue patterns, and estimated vs. actual comparisons.
          </p>
        </div>
      </div>
    </div>
  );
}
