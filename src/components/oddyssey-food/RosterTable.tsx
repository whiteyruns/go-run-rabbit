"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import {
  LOCATIONS,
  type AssignmentsMap,
  type PackageAssignment,
  assignmentKey,
  updateAssignment,
} from "@/lib/oddyssey-food/assignments";
import { getTicketTypes } from "@/lib/oddyssey-food/roster";
import type { RosterSection } from "@/lib/oddyssey-food/roster";
import type { TicketType } from "@/lib/oddyssey-food/types";

interface Props {
  section: RosterSection;
  assignments: AssignmentsMap;
  onAssignmentsChange: (m: AssignmentsMap) => void;
  searchTerm?: string;
}

export function RosterTable({ section, assignments, onAssignmentsChange, searchTerm = "" }: Props) {
  const catalog = getMenuCatalog();
  const ticketTypes = getTicketTypes();

  // Enrich totals with catalog labels
  const enrichedTotals = catalog.map((c) => ({
    id: c.id,
    label: c.label,
    count: section.totals.find((t) => t.id === c.id)?.count ?? 0,
  }));
  const unknownCount = section.totals.find((t) => t.id === "__unknown__")?.count ?? 0;
  if (unknownCount > 0) {
    enrichedTotals.push({ id: "__unknown__", label: "Unknown", count: unknownCount });
  }

  function updateLocation(buyerEmail: string, sessionIso: string, loc: string) {
    const next = updateAssignment(buyerEmail, sessionIso, { location: loc || undefined });
    onAssignmentsChange(next);
  }

  function updatePackage(buyerEmail: string, sessionIso: string, pkg: string) {
    // Clear any multi-type override when picking a single type — the
    // single dropdown is the source of truth in that mode.
    const next = updateAssignment(buyerEmail, sessionIso, {
      package_type: pkg || undefined,
      package_types: undefined,
    });
    onAssignmentsChange(next);
  }

  function updatePackageTypes(
    buyerEmail: string,
    sessionIso: string,
    types: PackageAssignment[] | undefined,
  ) {
    const next = updateAssignment(buyerEmail, sessionIso, {
      package_types: types && types.length > 0 ? types : undefined,
      // Clear legacy single field so there's only one source of truth.
      package_type: undefined,
    });
    onAssignmentsChange(next);
  }

  // Reorder food items WITHIN a single ticket via drag-and-drop. The
  // resulting scan_code list goes into assignment.itemOrder keyed by
  // the ticket's index inside the guest, which the roster builder
  // re-applies after slicing tickets.
  function reorderTicketItems(
    buyerEmail: string,
    sessionIso: string,
    ticketIndex: number,
    sourceScanCode: string,
    targetScanCode: string,
    currentScanCodes: string[],
  ) {
    if (sourceScanCode === targetScanCode) return;
    const k = assignmentKey(buyerEmail, sessionIso);
    const cur = assignments[k] ?? {};
    // Start from whatever order the row currently displays — applies
    // any saved override on top of the default delivery sort already.
    const base = currentScanCodes.slice();
    const fromIdx = base.indexOf(sourceScanCode);
    if (fromIdx < 0) return;
    const [picked] = base.splice(fromIdx, 1);
    const toIdx = base.indexOf(targetScanCode);
    base.splice(toIdx >= 0 ? toIdx : base.length, 0, picked);
    const itemOrder = { ...(cur.itemOrder ?? {}), [String(ticketIndex)]: base };
    const next = updateAssignment(buyerEmail, sessionIso, { itemOrder });
    onAssignmentsChange(next);
  }

  // Count allocations per (buyer, session) so the editor can show a
  // "X used / Y total" hint and validate the split.
  const totalItemsByGuest = new Map<string, number>();
  for (const r of section.rows) {
    const k = assignmentKey(r.buyer_email, r.session_iso);
    totalItemsByGuest.set(k, (totalItemsByGuest.get(k) ?? 0) + 1);
  }

  // Pre-compute which rows should be visible under the search filter.
  // Rule: a guest-first row matches if any of its displayed fields do;
  // continuation rows inherit the guest's visibility.
  const term = searchTerm.trim().toLowerCase();
  const visibility = new Array<boolean>(section.rows.length);
  let lastGuestVisible = true;
  for (let i = 0; i < section.rows.length; i++) {
    const row = section.rows[i];
    if (row.is_guest_first) {
      if (!term) {
        lastGuestVisible = true;
      } else {
        const haystack = [
          row.name, row.email, row.location, row.type_label,
          row.customer_note, row.time_label, row.food,
        ].join(" ").toLowerCase();
        lastGuestVisible = haystack.includes(term);
      }
    }
    visibility[i] = lastGuestVisible;
  }
  const hasAnyVisible = visibility.some(Boolean);

  return (
    <div className="roster-section">
      <style>{rosterStyles}</style>

      {/* Date banner */}
      <div className="roster-date-banner">
        <h2>{section.date_header}</h2>
      </div>

      {/* Totals block */}
      <table className="roster-totals">
        <tbody>
          {enrichedTotals.filter((t) => t.count > 0).map((t) => (
            <tr key={t.id}>
              <td className="rt-label">{t.label}</td>
              <td className="rt-count">{t.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Main roster table */}
      <table className="roster-main">
        <thead>
          <tr>
            <th style={{ width: "13%" }}>Location</th>
            <th style={{ width: "4%" }}>#</th>
            <th style={{ width: "17%" }}>Type</th>
            <th style={{ width: "8%" }}>Time</th>
            <th style={{ width: "18%" }}>Name</th>
            <th style={{ width: "14%" }}>Food</th>
            <th style={{ width: "26%" }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, i) => {
            if (!visibility[i]) return null;
            const key = assignmentKey(row.buyer_email, row.session_iso);
            const a = assignments[key] ?? {};
            // Only render editors on is_guest_first row; continuation rows inherit
            const isFirst = row.is_guest_first;
            const vipClass = row.is_vip ? " rr-vip" : "";
            const hasNote = row.customer_note.length > 0;
            const noteClass = hasNote ? " rr-has-note" : "";
            const rowClass = `rr rr-${row.banding}${row.is_guest_last ? " rr-guest-last" : ""}${isFirst ? " rr-guest-first" : ""}${vipClass}${noteClass}`;

            return (
              <tr key={`${row.scan_code}-${i}`} className={rowClass}>
                <td className="rc-location">
                  {isFirst ? (
                    <select
                      value={a.location ?? ""}
                      onChange={(e) => updateLocation(row.buyer_email, row.session_iso, e.target.value)}
                      className="rr-select"
                    >
                      <option value="">—</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : null}
                </td>
                <td className="rc-num">{row.ticket_number ?? ""}</td>
                <td className="rc-type">
                  {isFirst ? (
                    <PackageEditor
                      assignment={a}
                      ticketTypes={ticketTypes}
                      totalItems={totalItemsByGuest.get(key) ?? 0}
                      onSetSingle={(pkg) => updatePackage(row.buyer_email, row.session_iso, pkg)}
                      onSetMulti={(list) => updatePackageTypes(row.buyer_email, row.session_iso, list)}
                    />
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>{row.type_label}</span>
                  )}
                </td>
                <td className="rc-time">{isFirst ? row.time_label : ""}</td>
                <td className="rc-name">
                  {isFirst ? (
                    <div className="rc-name-wrap">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {row.is_walkup && <span className="rc-walkup-tag">WALK-UP</span>}
                        {row.is_vip && <span className="rc-vip-star" title="VIP · Ultimate Party Guest">★ VIP</span>}
                      </div>
                      <span>{row.name}</span>
                      {hasNote && (
                        <span className="rc-note-badge" title={row.customer_note}>
                          ⚠ {row.customer_note}
                        </span>
                      )}
                    </div>
                  ) : ""}
                </td>
                <td
                  className="rc-food rc-food-drag"
                  draggable={row.ticket_scan_codes.length > 1}
                  onDragStart={(e) => {
                    if (row.ticket_scan_codes.length <= 1) return;
                    const payload = JSON.stringify({
                      buyerEmail: row.buyer_email,
                      sessionIso: row.session_iso,
                      ticketIndex: row.ticket_index_in_guest,
                      scanCode: row.scan_code,
                    });
                    // Firefox requires text/plain to be set or drags
                    // never initiate; both MIME types carry the same
                    // payload so drop reads either.
                    e.dataTransfer.setData("text/plain", payload);
                    e.dataTransfer.setData("application/x-roster-item", payload);
                    e.dataTransfer.effectAllowed = "move";
                    (e.currentTarget as HTMLElement).classList.add("rc-food-dragging");
                  }}
                  onDragEnd={(e) => {
                    (e.currentTarget as HTMLElement).classList.remove("rc-food-dragging");
                  }}
                  onDragOver={(e) => {
                    if (row.ticket_scan_codes.length <= 1) return;
                    // Always allow drop while we're hovering over a food
                    // cell — we validate same-ticket on drop. preventDefault
                    // is required for onDrop to fire.
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    (e.currentTarget as HTMLElement).classList.add("rc-food-drop-over");
                  }}
                  onDragLeave={(e) => {
                    (e.currentTarget as HTMLElement).classList.remove("rc-food-drop-over");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).classList.remove("rc-food-drop-over");
                    const raw =
                      e.dataTransfer.getData("application/x-roster-item") ||
                      e.dataTransfer.getData("text/plain");
                    if (!raw) return;
                    let payload: { buyerEmail: string; sessionIso: string; ticketIndex: number; scanCode: string };
                    try { payload = JSON.parse(raw); } catch { return; }
                    if (
                      payload.buyerEmail !== row.buyer_email ||
                      payload.sessionIso !== row.session_iso ||
                      payload.ticketIndex !== row.ticket_index_in_guest
                    ) return;
                    reorderTicketItems(
                      row.buyer_email,
                      row.session_iso,
                      row.ticket_index_in_guest,
                      payload.scanCode,
                      row.scan_code,
                      row.ticket_scan_codes,
                    );
                  }}
                  title={row.ticket_scan_codes.length > 1 ? "Drag to reorder within ticket" : undefined}
                >
                  {row.ticket_scan_codes.length > 1 && (
                    <span className="rc-drag-handle" aria-hidden="true">⋮⋮</span>
                  )}
                  <span className="rc-food-label">{row.food}</span>
                </td>
                <td className="rc-email">{isFirst ? row.email : ""}</td>
              </tr>
            );
          })}
          {!hasAnyVisible && (
            <tr>
              <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No matches for &ldquo;{searchTerm}&rdquo; on this date.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Package editor (single dropdown ↔ multi-type split) ─────────────────

interface PackageEditorProps {
  assignment: { package_type?: string; package_types?: PackageAssignment[] };
  ticketTypes: TicketType[];
  totalItems: number;
  onSetSingle: (packageType: string) => void;
  onSetMulti: (list: PackageAssignment[] | undefined) => void;
}

function itemsRequired(list: PackageAssignment[], byType: Record<string, TicketType>): number {
  return list.reduce((sum, p) => {
    const tt = byType[p.type];
    return sum + (tt?.included_items ?? 1) * Math.max(0, p.count);
  }, 0);
}

function PackageEditor({
  assignment,
  ticketTypes,
  totalItems,
  onSetSingle,
  onSetMulti,
}: PackageEditorProps) {
  const byType: Record<string, TicketType> = Object.fromEntries(
    ticketTypes.map((t) => [t.package_type, t]),
  );
  const list = assignment.package_types ?? [];
  const isMulti = list.length > 0;

  if (!isMulti) {
    // Single dropdown + a small "split" link for the multi-experience case.
    return (
      <div className="pe-wrap">
        <select
          value={assignment.package_type ?? ""}
          onChange={(e) => onSetSingle(e.target.value)}
          className="rr-select"
        >
          <option value="">—</option>
          {ticketTypes.map((t) => (
            <option key={t.package_type} value={t.package_type}>{t.short_label}</option>
          ))}
        </select>
        <button
          type="button"
          className="pe-link"
          onClick={() => {
            // Seed the multi list from current single value (or first ticket
            // type) so the editor opens with one row already populated.
            const seedType = assignment.package_type ?? ticketTypes[0]?.package_type ?? "";
            const seedTT = seedType ? byType[seedType] : undefined;
            const per = seedTT?.included_items ?? 1;
            const seedCount = per > 0 ? Math.max(1, Math.floor(totalItems / per)) : 1;
            onSetMulti([{ type: seedType, count: seedCount }]);
          }}
        >
          + split
        </button>
      </div>
    );
  }

  const used = itemsRequired(list, byType);
  const ok = used === totalItems;

  function setRow(i: number, patch: Partial<PackageAssignment>) {
    const next = list.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onSetMulti(next);
  }
  function removeRow(i: number) {
    const next = list.filter((_, idx) => idx !== i);
    onSetMulti(next.length > 0 ? next : undefined);
  }
  function addRow() {
    const remaining = Math.max(0, totalItems - used);
    // Pick a sensible default for the new row based on what fits.
    const fit = ticketTypes.find((t) => t.included_items > 0 && t.included_items <= Math.max(1, remaining));
    const seed = fit?.package_type ?? ticketTypes[0]?.package_type ?? "";
    const per = byType[seed]?.included_items ?? 1;
    const seedCount = per > 0 && remaining >= per ? Math.floor(remaining / per) : 1;
    onSetMulti([...list, { type: seed, count: seedCount }]);
  }
  function collapseToSingle() {
    // Drop multi mode entirely. Pick the first row's type as the new
    // single value so we don't lose context.
    const first = list[0];
    onSetMulti(undefined);
    if (first?.type) onSetSingle(first.type);
  }

  return (
    <div className="pe-wrap pe-multi">
      {list.map((p, i) => (
        <div key={i} className="pe-row">
          <select
            value={p.type}
            onChange={(e) => setRow(i, { type: e.target.value })}
            className="rr-select pe-row-type"
          >
            <option value="">—</option>
            {ticketTypes.map((t) => (
              <option key={t.package_type} value={t.package_type}>{t.short_label}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={p.count}
            onChange={(e) => setRow(i, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="pe-row-count"
            aria-label="Tickets of this type"
          />
          <button type="button" className="pe-link pe-row-x" onClick={() => removeRow(i)} title="Remove">
            ✕
          </button>
        </div>
      ))}
      <div className="pe-foot">
        <button type="button" className="pe-link" onClick={addRow}>+ add</button>
        <span className={`pe-stat ${ok ? "pe-stat-ok" : "pe-stat-warn"}`}>
          {used}/{totalItems}
        </span>
        <button type="button" className="pe-link pe-link-muted" onClick={collapseToSingle}>
          single
        </button>
      </div>
    </div>
  );
}

const rosterStyles = `
.roster-section { margin-bottom: 64px; }
.roster-date-banner {
  border: 1px solid var(--border); padding: 18px 24px; margin-bottom: 12px;
  background: var(--bg-elevated);
}
.roster-date-banner h2 {
  font-family: var(--serif); font-size: clamp(22px, 2.6vw, 32px); font-weight: 400;
  letter-spacing: 3px; text-transform: uppercase; margin: 0; color: var(--text);
  text-align: center;
}
.roster-totals {
  width: 260px; border-collapse: collapse; margin-bottom: 20px;
  border: 1px solid var(--border-subtle);
}
.roster-totals td { padding: 8px 14px; font-size: 13px; }
.roster-totals tr { border-bottom: 1px solid var(--border-subtle); }
.roster-totals tr:last-child { border-bottom: none; }
.roster-totals .rt-label { color: var(--text); }
.roster-totals .rt-count {
  text-align: right; font-family: var(--serif); font-size: 18px; font-weight: 400;
  color: var(--accent); width: 60px;
}

.roster-main { width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid var(--border-subtle); }
.roster-main thead th {
  background: #1b5e20; color: #fff; padding: 10px 12px; text-align: left;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.roster-main thead th:last-child { border-right: none; }
.roster-main tbody td {
  padding: 8px 12px; border-bottom: 1px solid var(--border-subtle);
  border-right: 1px solid var(--border-subtle); color: var(--text);
}
.roster-main tbody td:last-child { border-right: none; }

/* Banding */
.rr-a { background: rgba(255, 231, 102, 0.08); }
.rr-b { background: rgba(255, 159, 67, 0.08); }
.rr-guest-last td { border-bottom: 3px solid rgba(255,255,255,0.08); }

.rr-select {
  background: transparent; color: var(--text);
  border: 1px solid var(--border-subtle);
  padding: 4px 6px; font-size: 12px; font-family: var(--sans);
  letter-spacing: 0.3px; outline: none; width: 100%;
  cursor: pointer;
}
.rr-select:focus { border-color: var(--accent); }
.rr-select:hover { border-color: var(--accent); }

.rc-num { font-family: var(--serif); font-size: 16px; color: var(--accent); text-align: center; }
.rc-time, .rc-name, .rc-food, .rc-email { letter-spacing: 0.3px; }
.rc-food { font-weight: 500; }
.rc-food-drag[draggable="true"] {
  cursor: grab; user-select: none; -webkit-user-select: none;
}
.rc-food-drag[draggable="true"]:active { cursor: grabbing; }
.rc-food-drag[draggable="true"]:hover { background: rgba(255,255,255,0.04); }
.rc-food-drag.rc-food-drop-over {
  background: rgba(76, 175, 122, 0.10) !important;
  box-shadow: inset 0 -3px 0 var(--accent);
}
.rc-food-drag.rc-food-dragging { opacity: 0.4; }
.rc-food-label { user-select: none; -webkit-user-select: none; pointer-events: none; }
.rc-drag-handle {
  display: inline-block; margin-right: 8px; color: var(--text-muted);
  font-family: var(--mono); font-size: 12px; letter-spacing: -2px;
  user-select: none; pointer-events: none;
}
.rc-email { color: var(--text-muted); font-size: 12px; }

.rc-name-wrap { display: flex; flex-direction: column; gap: 4px; }
.rc-walkup-tag {
  display: inline-flex; align-items: center;
  font-size: 9px; letter-spacing: 2px; font-weight: 600; color: #060606;
  background: #4caf7a; padding: 2px 8px;
}
.rc-vip-star {
  display: inline-flex; align-items: center;
  font-size: 9px; letter-spacing: 2px; font-weight: 600; color: #060606;
  background: #d4b85e; padding: 2px 8px;
}
.rc-note-badge {
  display: inline-flex; align-items: center; align-self: flex-start;
  font-size: 11px; color: #c0392b; font-weight: 500;
  background: rgba(192,57,43,0.12); padding: 3px 8px;
  border-left: 2px solid #c0392b; letter-spacing: 0.3px;
  max-width: 100%; word-break: break-word;
}
.rr-vip { box-shadow: inset 3px 0 0 #d4b85e; }
.rr-has-note { box-shadow: inset 3px 0 0 #c0392b; }
.rr-vip.rr-has-note { box-shadow: inset 3px 0 0 #c0392b, inset 6px 0 0 #d4b85e; }

.pe-wrap { display: flex; flex-direction: column; gap: 4px; }
.pe-multi { gap: 3px; }
.pe-row { display: flex; gap: 4px; align-items: center; }
.pe-row-type { flex: 1 1 auto; min-width: 0; }
.pe-row-count {
  width: 44px; padding: 4px 6px; font-size: 12px; font-family: var(--sans);
  background: transparent; color: var(--text);
  border: 1px solid var(--border-subtle); outline: none; text-align: center;
}
.pe-row-count:focus { border-color: var(--accent); }
.pe-row-x {
  background: transparent; border: none; color: var(--text-muted);
  cursor: pointer; font-size: 11px; padding: 2px 6px;
}
.pe-row-x:hover { color: #c0392b; }
.pe-foot {
  display: flex; gap: 6px; align-items: center; justify-content: space-between;
  font-size: 10px; letter-spacing: 0.3px; flex-wrap: nowrap; min-width: 0;
}
.pe-link {
  background: transparent; border: none; padding: 2px 0;
  color: var(--text-muted); cursor: pointer; font-size: 10px;
  letter-spacing: 0.4px; text-transform: uppercase;
}
.pe-link:hover { color: var(--accent); }
.pe-link-muted { color: var(--text-muted); opacity: 0.6; }
.pe-stat { font-family: var(--sans); }
.pe-stat-ok { color: #4caf7a; }
.pe-stat-warn { color: #d4b85e; }

@media (max-width: 900px) {
  .roster-main { font-size: 11px; }
  .roster-main thead th { font-size: 9px; padding: 8px 6px; }
  .roster-main tbody td { padding: 6px 6px; }
  .rc-email { display: none; }
  .roster-main thead th:last-child { display: none; }
}
`;
