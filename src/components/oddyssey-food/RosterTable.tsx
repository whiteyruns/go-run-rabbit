"use client";

import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import { LOCATIONS, type AssignmentsMap, assignmentKey, updateAssignment } from "@/lib/oddyssey-food/assignments";
import { getTicketTypes } from "@/lib/oddyssey-food/roster";
import type { RosterSection } from "@/lib/oddyssey-food/roster";

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
    const next = updateAssignment(buyerEmail, sessionIso, { package_type: pkg || undefined });
    onAssignmentsChange(next);
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
            <th style={{ width: "14%" }}>Location</th>
            <th style={{ width: "4%" }}>#</th>
            <th style={{ width: "10%" }}>Type</th>
            <th style={{ width: "9%" }}>Time</th>
            <th style={{ width: "20%" }}>Name</th>
            <th style={{ width: "15%" }}>Food</th>
            <th style={{ width: "28%" }}>Email</th>
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
                    <select
                      value={a.package_type ?? ""}
                      onChange={(e) => updatePackage(row.buyer_email, row.session_iso, e.target.value)}
                      className="rr-select"
                    >
                      <option value="">—</option>
                      {ticketTypes.map((t) => (
                        <option key={t.package_type} value={t.package_type}>{t.short_label}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>{row.type_label}</span>
                  )}
                </td>
                <td className="rc-time">{isFirst ? row.time_label : ""}</td>
                <td className="rc-name">
                  {isFirst ? (
                    <div className="rc-name-wrap">
                      {row.is_vip && <span className="rc-vip-star" title="VIP · Ultimate Party Guest">★ VIP</span>}
                      <span>{row.name}</span>
                      {hasNote && (
                        <span className="rc-note-badge" title={row.customer_note}>
                          ⚠ {row.customer_note}
                        </span>
                      )}
                    </div>
                  ) : ""}
                </td>
                <td className="rc-food">{row.food}</td>
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
.rc-email { color: var(--text-muted); font-size: 12px; }

.rc-name-wrap { display: flex; flex-direction: column; gap: 4px; }
.rc-vip-star {
  display: inline-flex; align-items: center; align-self: flex-start;
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

@media (max-width: 900px) {
  .roster-main { font-size: 11px; }
  .roster-main thead th { font-size: 9px; padding: 8px 6px; }
  .roster-main tbody td { padding: 6px 6px; }
  .rc-email { display: none; }
  .roster-main thead th:last-child { display: none; }
}
`;
