"use client";

import { RosterPrint } from "@/components/oddyssey-food/RosterPrint";
import { RosterTable } from "@/components/oddyssey-food/RosterTable";
import { loadAssignments, type AssignmentsMap } from "@/lib/oddyssey-food/assignments";
import { buildRoster } from "@/lib/oddyssey-food/roster";
import { loadState } from "@/lib/oddyssey-food/storage";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function RosterPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [assignments, setAssignments] = useState<AssignmentsMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadState());
    setAssignments(loadAssignments());
    setLoaded(true);
  }, []);

  const sections = useMemo(() => {
    if (!state) return [];
    return buildRoster(state, assignments);
  }, [state, assignments]);

  if (!loaded) return null;

  if (!state) {
    return (
      <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>
          No data loaded.
        </div>
        <Link href="/oddyssey-manor/admin/food/upload" style={btnPrimary}>Upload a CSV</Link>
      </div>
    );
  }

  // Count assignment progress for header info
  const guestKeys = new Set(state.groups.map((g) => `${g.buyer_email}::${g.session_iso}`));
  const assignedLocations = Array.from(guestKeys).filter((k) => assignments[k]?.location).length;
  const assignedTypes = Array.from(guestKeys).filter((k) => assignments[k]?.package_type).length;

  return (
    <>
      <div className="admin-not-print">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 12 }}>
            03 · Roster
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.1 }}>
            Manor Nightly Food Allocations
          </h1>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", letterSpacing: 0.5 }}>
            {state.allocations.length} items · {state.groups.length} guest group{state.groups.length === 1 ? "" : "s"} · {sections.length} date{sections.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Assignment progress + actions */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16, marginBottom: 32,
          padding: "18px 24px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <ProgressStat label="Locations Assigned" value={`${assignedLocations}/${guestKeys.size}`} />
            <ProgressStat label="Types Assigned" value={`${assignedTypes}/${guestKeys.size}`} />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => window.print()} style={btnPrimary}>Print Roster</button>
            <Link href="/oddyssey-manor/admin/food/kitchen" style={btnOutline}>View Totals &amp; Charts →</Link>
          </div>
        </div>

        <div style={{
          padding: "14px 20px", fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5,
          border: "1px solid var(--border-subtle)", borderLeft: "3px solid var(--accent)",
          marginBottom: 40, lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent)" }}>Tips:</strong> Pick a <em>Location</em> and <em>Type</em> for each guest
          (first row only — the rest inherit). Setting <em>Type</em> to Dinner / Ultimate groups their food items into a single ticket #.
          Your assignments auto-save. Orders close at 2:30 PM — upload the final CSV after that for the most accurate sheet.
        </div>

        {sections.map((section) => (
          <RosterTable
            key={section.session_date}
            section={section}
            assignments={assignments}
            onAssignmentsChange={setAssignments}
          />
        ))}
      </div>

      <RosterPrint sections={sections} snapshotAt={state.source.uploaded_at} />
    </>
  );
}

function ProgressStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400, color: "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block", padding: "12px 28px", background: "var(--accent)", color: "var(--bg)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
  border: "none", textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-block", padding: "12px 28px", background: "transparent", color: "var(--text-secondary)",
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  border: "1px solid var(--border)", textDecoration: "none",
};
