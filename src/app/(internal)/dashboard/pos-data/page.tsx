"use client";

import { useState, useRef } from "react";

export default function PosDataPage() {
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const pmixFileRef = useRef<HTMLInputElement>(null);
  const srFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Import Controls */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-800/40 rounded-xl p-8">
          <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
            Data Pipeline
          </p>
          <h2 className="text-3xl font-bold text-white mb-3">
            Import POS &amp; Reservation Data
          </h2>
          <p className="text-gray-400 max-w-2xl mb-6">
            Upload Toast PMIX exports and SevenRooms reservation data to replace
            estimates with real numbers. Or load the demo dataset to see what
            this dashboard can do with actual data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-white font-bold text-sm mb-2">
                Toast PMIX Export
              </p>
              <p className="text-gray-500 text-xs mb-3">
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
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg w-full transition-colors"
              >
                Upload CSV
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-white font-bold text-sm mb-2">
                SevenRooms Export
              </p>
              <p className="text-gray-500 text-xs mb-3">
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
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg w-full transition-colors"
              >
                Upload CSV
              </button>
            </div>
            <div className="bg-gray-900 border border-emerald-800/40 rounded-xl p-5">
              <p className="text-emerald-400 font-bold text-sm mb-2">
                Load Demo Data
              </p>
              <p className="text-gray-500 text-xs mb-3">
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
                className="bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg w-full transition-colors font-semibold"
              >
                {dataLoading ? "Loading..." : "Load Sample Data"}
              </button>
            </div>
          </div>
          {dataError && (
            <p className="text-red-400 text-sm">{dataError}</p>
          )}
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">&#9432;</span>
              <div>
                <h4 className="text-blue-400 font-bold text-sm mb-1">
                  How to get the data from Toast
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-gray-600 text-5xl mb-4">&#128202;</div>
          <h3 className="text-white font-bold text-xl mb-2">
            POS Data Analysis Coming Soon
          </h3>
          <p className="text-gray-500 max-w-lg mx-auto">
            Once the CSV upload pipeline is wired, this page will show real-time
            analysis including top sellers, venue breakdowns, category splits,
            day-of-week revenue patterns, and estimated vs. actual comparisons.
          </p>
        </div>
      </div>
    </div>
  );
}
