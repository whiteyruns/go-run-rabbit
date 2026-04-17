"use client";

import { LOCATIONS, updateAssignment } from "@/lib/oddyssey-food/assignments";
import { getMenuCatalog } from "@/lib/oddyssey-food/normalizer";
import { getTicketTypes } from "@/lib/oddyssey-food/roster";
import type { DashboardState } from "@/lib/oddyssey-food/types";
import { addWalkup, newWalkupId, type Walkup } from "@/lib/oddyssey-food/walkups";
import { useMemo, useState } from "react";

interface Props {
  state: DashboardState | null;
  onClose: () => void;
  onSaved: () => void;
}

export function WalkupForm({ state, onClose, onSaved }: Props) {
  const catalog = getMenuCatalog();
  const ticketTypes = getTicketTypes();

  // Manor runs 9 fixed session times every show night. Build the dropdown
  // from the full grid (for each loaded date) so walk-ups can be assigned
  // to any slot, even ones with zero CSV rows yet.
  const sessionOptions = useMemo(() => {
    const SLOTS = [
      { h: 18, m: 30 }, { h: 18, m: 45 },
      { h: 19, m: 0 },  { h: 19, m: 15 }, { h: 19, m: 30 }, { h: 19, m: 45 },
      { h: 20, m: 0 },  { h: 20, m: 15 }, { h: 20, m: 30 },
    ];
    const dates = state
      ? Array.from(new Set(state.by_date.map((d) => d.session_date))).sort()
      : [];
    // If no CSV loaded, default to today so the form still works for
    // standalone walk-up entry.
    if (dates.length === 0) {
      const now = new Date();
      const today =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      dates.push(today);
    }
    const opts: { iso: string; label: string }[] = [];
    for (const date of dates) {
      const d = new Date(date + "T00:00:00");
      const dayLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        : date;
      for (const slot of SLOTS) {
        const hh = String(slot.h).padStart(2, "0");
        const mm = String(slot.m).padStart(2, "0");
        const iso = `${date}T${hh}:${mm}:00`;
        const d2 = new Date(iso);
        const time = !isNaN(d2.getTime())
          ? d2.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
          : `${hh}:${mm}`;
        opts.push({ iso, label: `${dayLabel} · ${time}` });
      }
    }
    return opts;
  }, [state]);

  const [session_iso, setSessionIso] = useState(sessionOptions[0]?.iso ?? "");
  const [buyer_name, setBuyerName] = useState("");
  const [buyer_email, setBuyerEmail] = useState("");
  const [package_type, setPackageType] = useState("general_admission");
  const [location, setLocation] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tt = ticketTypes.find((t) => t.package_type === package_type);
  const maxItems = tt?.included_items ?? 0;

  function toggleItem(id: string) {
    setItems((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxItems) {
        // Replace oldest to keep count at max (nicer than refusing)
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!session_iso) return setError("Pick a session.");
    if (!buyer_name.trim()) return setError("Name required.");
    if (!buyer_email.trim()) return setError("Email required.");
    if (items.length !== maxItems) {
      return setError(
        `This package includes ${maxItems} item${maxItems === 1 ? "" : "s"}. You selected ${items.length}.`
      );
    }

    const walkup: Walkup = {
      id: newWalkupId(),
      created_at: new Date().toISOString(),
      session_iso,
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.trim().toLowerCase(),
      package_type,
      location: location || undefined,
      items,
      note: note.trim() || undefined,
    };
    addWalkup(walkup);
    // Mirror into assignments so the Roster picks up TYPE/LOCATION the same way
    updateAssignment(walkup.buyer_email, walkup.session_iso, {
      location: walkup.location,
      package_type: walkup.package_type,
    });
    onSaved();
  }

  return (
    <div className="wf-overlay" onClick={onClose}>
      <div className="wf-modal" onClick={(e) => e.stopPropagation()}>
        <style>{walkupStyles}</style>

        <div className="wf-head">
          <div>
            <div className="wf-eyebrow">Walk-Up</div>
            <h2>Add Guest</h2>
          </div>
          <button onClick={onClose} className="wf-close">×</button>
        </div>

        <form onSubmit={handleSave} className="wf-body">
          <div className="wf-row">
            <label>Session</label>
            {sessionOptions.length > 0 ? (
              <select value={session_iso} onChange={(e) => setSessionIso(e.target.value)}>
                {sessionOptions.map((s) => (
                  <option key={s.iso} value={s.iso}>{s.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="datetime-local"
                value={session_iso.slice(0, 16)}
                onChange={(e) => setSessionIso(e.target.value + ":00")}
              />
            )}
          </div>

          <div className="wf-grid-2">
            <div className="wf-row">
              <label>Name</label>
              <input type="text" value={buyer_name} onChange={(e) => setBuyerName(e.target.value)} placeholder="Guest name" autoFocus />
            </div>
            <div className="wf-row">
              <label>Email</label>
              <input type="email" value={buyer_email} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="guest@email.com" />
            </div>
          </div>

          <div className="wf-grid-2">
            <div className="wf-row">
              <label>Type</label>
              <select value={package_type} onChange={(e) => { setPackageType(e.target.value); setItems([]); }}>
                {ticketTypes.map((t) => (
                  <option key={t.package_type} value={t.package_type}>
                    {t.package_label} ({t.included_items} bite{t.included_items === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </div>
            <div className="wf-row">
              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">— Unassigned —</option>
                {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          {maxItems > 0 && (
            <div className="wf-row">
              <label>
                Food items
                <span className="wf-counter">{items.length}/{maxItems}</span>
              </label>
              <div className="wf-items">
                {catalog.map((c) => {
                  const selected = items.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      className={`wf-item ${selected ? "selected" : ""}`}
                      onClick={() => toggleItem(c.id)}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="wf-row">
            <label>Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Allergies, preferences, special requests…"
            />
          </div>

          {error && <div className="wf-error">{error}</div>}

          <div className="wf-actions">
            <button type="button" onClick={onClose} className="wf-btn-ghost">Cancel</button>
            <button type="submit" className="wf-btn-primary">Add Walk-Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const walkupStyles = `
.wf-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  z-index: 2000; display: flex; align-items: flex-start; justify-content: center;
  padding: 40px 20px; overflow-y: auto;
}
.wf-modal {
  background: var(--bg-elevated); border: 1px solid var(--border);
  width: 100%; max-width: 620px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.wf-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 28px 32px; border-bottom: 1px solid var(--border-subtle);
}
.wf-eyebrow {
  font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500; margin-bottom: 6px;
}
.wf-head h2 {
  font-family: var(--serif); font-size: 28px; font-weight: 300;
  letter-spacing: 2px; text-transform: uppercase; margin: 0;
}
.wf-close {
  background: transparent; border: none; color: var(--text-secondary);
  font-size: 32px; cursor: pointer; padding: 0 8px; line-height: 1;
}
.wf-close:hover { color: var(--text); }

.wf-body { padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 20px; }
.wf-row { display: flex; flex-direction: column; gap: 6px; }
.wf-row label {
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--accent); font-weight: 500;
  display: flex; justify-content: space-between; align-items: baseline;
}
.wf-counter {
  font-family: var(--serif); font-size: 14px; color: var(--text-muted); letter-spacing: 1px;
  font-weight: 400;
}
.wf-row input, .wf-row select, .wf-row textarea {
  background: var(--bg); border: 1px solid var(--border-subtle);
  padding: 12px 14px; color: var(--text); font-family: var(--sans);
  font-size: 14px; letter-spacing: 0.3px; outline: none; transition: border 0.3s;
  width: 100%; resize: vertical;
}
.wf-row input:focus, .wf-row select:focus, .wf-row textarea:focus { border-color: var(--accent); }

.wf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 480px) { .wf-grid-2 { grid-template-columns: 1fr; } }

.wf-items { display: flex; flex-wrap: wrap; gap: 8px; }
.wf-item {
  background: var(--bg); border: 1px solid var(--border-subtle);
  padding: 10px 16px; color: var(--text-secondary);
  font-size: 12px; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s;
}
.wf-item:hover { border-color: var(--accent); color: var(--text); }
.wf-item.selected {
  background: var(--accent); color: var(--bg); border-color: var(--accent);
  font-weight: 500;
}

.wf-error {
  background: rgba(192,57,43,0.12); border: 1px solid rgba(192,57,43,0.4);
  padding: 10px 14px; color: #c0392b; font-size: 13px; letter-spacing: 0.3px;
}

.wf-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 8px; padding-top: 8px;
}
.wf-btn-ghost, .wf-btn-primary {
  padding: 12px 28px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  font-weight: 500; cursor: pointer; border: none;
}
.wf-btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.wf-btn-primary { background: var(--accent); color: var(--bg); }
.wf-btn-primary:hover { background: var(--accent-hover); }
`;
