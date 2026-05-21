"use client";

import { RosterPrint } from "@/components/oddyssey-food/RosterPrint";
import { RosterTable } from "@/components/oddyssey-food/RosterTable";
import { WalkupForm } from "@/components/oddyssey-food/WalkupForm";
import { loadAssignments, type AssignmentsMap } from "@/lib/oddyssey-food/assignments";
import { loadStateWithWalkups } from "@/lib/oddyssey-food/build-state";
import { buildRoster } from "@/lib/oddyssey-food/roster";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import { loadWalkups } from "@/lib/oddyssey-food/walkups";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function RosterPage() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [assignments, setAssignments] = useState<AssignmentsMap>({});
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showWalkup, setShowWalkup] = useState(false);
  const [walkupCount, setWalkupCount] = useState(0);

  const refresh = useCallback(() => {
    setState(loadStateWithWalkups());
    setAssignments(loadAssignments());
    setWalkupCount(loadWalkups().length);
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);
    // Bootstrap: mirror current localStorage assignments to the server
    // so the nightly roster-pdf cron sees them even if no edit happens
    // before 2:35 PM PT. saveAssignments() also mirrors on every change.
    const map = loadAssignments();
    if (Object.keys(map).length > 0) {
      void fetch("/api/oddyssey-food/assignments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ map }),
      }).catch(() => { /* non-fatal */ });
    }
  }, [refresh]);

  const sections = useMemo(() => {
    if (!state) return [];
    return buildRoster(state, assignments);
  }, [state, assignments]);

  if (!loaded) return null;

  if (!state) {
    return (
      <>
        <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--border)" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 24, color: "var(--text-secondary)" }}>
            No data loaded.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/oddyssey-manor/admin/food/upload" style={btnPrimary}>Upload a CSV</Link>
            <button onClick={() => setShowWalkup(true)} style={btnOutline}>+ Add Walk-Up</button>
          </div>
        </div>
        {showWalkup && (
          <WalkupForm
            state={state}
            onClose={() => setShowWalkup(false)}
            onSaved={() => { setShowWalkup(false); refresh(); }}
          />
        )}
      </>
    );
  }

  // Count assignment progress for header info
  const guestKeys = new Set(state.groups.map((g) => `${g.buyer_email}::${g.session_iso}`));
  const assignedLocations = Array.from(guestKeys).filter((k) => assignments[k]?.location).length;
  const assignedTypes = Array.from(guestKeys).filter((k) => assignments[k]?.package_type).length;
  // Count guests with notes + VIPs for the summary line
  const guestsWithNotes = state.groups.filter((g) => (g.customer_note ?? "").length > 0).length;
  const vipGuests = state.groups.filter(
    (g) =>
      (g.derived_package_types ?? []).includes("ultimate") ||
      assignments[`${g.buyer_email}::${g.session_iso}`]?.package_type === "ultimate"
  ).length;

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
          flexWrap: "wrap", gap: 16, marginBottom: 16,
          padding: "18px 24px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <ProgressStat label="Locations" value={`${assignedLocations}/${guestKeys.size}`} />
            <ProgressStat label="Types" value={`${assignedTypes}/${guestKeys.size}`} />
            {vipGuests > 0 && <ProgressStat label="⭐ VIP" value={String(vipGuests)} color="#d4b85e" />}
            {guestsWithNotes > 0 && <ProgressStat label="⚠ Notes" value={String(guestsWithNotes)} color="#c0392b" />}
            {walkupCount > 0 && <ProgressStat label="Walk-ups" value={String(walkupCount)} color="#27ae60" />}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setShowWalkup(true)} style={btnOutline}>+ Add Walk-Up</button>
            <button onClick={() => window.print()} style={btnPrimary}>Print Roster</button>
            <Link href="/oddyssey-manor/admin/food/kitchen" style={btnOutline}>View Totals &amp; Charts →</Link>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 28, position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests by name, email, location, type…"
            style={{
              width: "100%", padding: "14px 48px 14px 20px",
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              color: "var(--text)", fontSize: 14, letterSpacing: 0.3,
              outline: "none", fontFamily: "var(--sans)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", color: "var(--text-muted)",
                fontSize: 18, cursor: "pointer", padding: "4px 8px",
              }}
            >×</button>
          )}
        </div>

        <div style={{
          padding: "14px 20px", fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5,
          border: "1px solid var(--border-subtle)", borderLeft: "3px solid var(--accent)",
          marginBottom: 40, lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent)" }}>Tips:</strong> If you uploaded the full
          &ldquo;All Ticket Groups&rdquo; attendees export, <em>Type</em> and <em>Location</em> are auto-populated for every
          guest — just override any you want to change. Otherwise pick <em>Location</em> and <em>Type</em> manually
          (first row only — the rest inherit). Your assignments auto-save. Orders close at 2:30 PM — upload the final CSV after that for the most accurate sheet.
        </div>

        {sections.map((section) => (
          <RosterTable
            key={section.session_date}
            section={section}
            assignments={assignments}
            onAssignmentsChange={setAssignments}
            searchTerm={search}
          />
        ))}
      </div>

      <RosterPrint sections={sections} snapshotAt={state.source.uploaded_at} />

      {showWalkup && (
        <WalkupForm
          state={state}
          onClose={() => setShowWalkup(false)}
          onSaved={() => { setShowWalkup(false); refresh(); }}
        />
      )}
    </>
  );
}

function ProgressStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: color ?? "var(--accent)", fontWeight: 500, marginBottom: 4 }}>
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
