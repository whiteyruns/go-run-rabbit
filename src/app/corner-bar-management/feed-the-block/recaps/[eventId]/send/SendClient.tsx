"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecipientInput {
  email: string;
  name?: string;
  group?: string;
}

interface Group {
  id: string;
  name: string;
  emails: RecipientInput[];
}

interface HistoryRow {
  id: string;
  email: string;
  name: string | null;
  group: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
}

export function SendClient({
  eventId,
  canSend,
  groups: initialGroups,
  history,
}: {
  eventId: string;
  canSend: boolean;
  groups: Group[];
  history: HistoryRow[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [pasteText, setPasteText] = useState("");
  const [groupTag, setGroupTag] = useState("");
  const [sending, setSending] = useState(false);
  const [sendLog, setSendLog] = useState<
    { email: string; ok: boolean; error?: string }[]
  >([]);
  const [saveGroupName, setSaveGroupName] = useState("");

  const parsed = parseRecipients(pasteText);

  const applyGroup = (g: Group) => {
    const lines = g.emails.map((e) => (e.name ? `${e.name} <${e.email}>` : e.email));
    setPasteText((prev) => {
      const combined = prev.trim() ? `${prev}\n${lines.join("\n")}` : lines.join("\n");
      return combined;
    });
    setGroupTag(g.name);
  };

  const send = async () => {
    if (parsed.length === 0) return;
    if (!confirm(`Send to ${parsed.length} recipient${parsed.length === 1 ? "" : "s"}?`))
      return;
    setSending(true);
    setSendLog([]);
    try {
      const res = await fetch(`/api/ftb-admin/recaps/${eventId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: parsed.map((p) => ({
            email: p.email,
            name: p.name,
            group: groupTag || undefined,
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setSendLog(j.sent);
      setPasteText("");
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const saveAsGroup = async () => {
    if (!saveGroupName.trim() || parsed.length === 0) return;
    const res = await fetch("/api/ftb-admin/recipient-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: saveGroupName.trim(), emails: parsed }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Save failed");
      return;
    }
    const { group } = await res.json();
    setGroups((prev) => [
      ...prev,
      { id: group.id, name: group.name, emails: JSON.parse(group.emails) },
    ]);
    setSaveGroupName("");
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    const res = await fetch(`/api/ftb-admin/recipient-groups/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
          Compose
        </h2>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={
            "one per line, any of:\n" +
            "jane@example.com\n" +
            "Jane Doe <jane@example.com>\n" +
            "Jane Doe, jane@example.com"
          }
          rows={8}
          className="w-full bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-4 py-3 text-sm font-mono focus:border-[#aea2ff] outline-none"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs opacity-60">
            {parsed.length} valid recipient{parsed.length === 1 ? "" : "s"}
            {groupTag && (
              <>
                {" "}
                · tagged{" "}
                <span className="text-[#aea2ff]">{groupTag}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              value={groupTag}
              onChange={(e) => setGroupTag(e.target.value)}
              placeholder="group tag (optional)"
              className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-1 text-xs focus:border-[#aea2ff] outline-none"
            />
            <button
              disabled={!canSend || sending || parsed.length === 0}
              onClick={send}
              className="px-6 py-2 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85 disabled:opacity-30"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {parsed.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <input
              value={saveGroupName}
              onChange={(e) => setSaveGroupName(e.target.value)}
              placeholder="Save current list as group…"
              className="bg-[#1a1a1f] border border-[rgba(174,162,255,0.2)] px-3 py-2 text-xs w-64 focus:border-[#aea2ff] outline-none"
            />
            <button
              onClick={saveAsGroup}
              disabled={!saveGroupName.trim()}
              className="text-xs uppercase tracking-widest text-[#00eefc] hover:underline disabled:opacity-30"
            >
              Save Group
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
          Saved Groups
        </h2>
        {groups.length === 0 ? (
          <div className="text-xs opacity-50">None yet. Save current list above.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-2 border border-[rgba(174,162,255,0.2)] pl-3"
              >
                <button
                  onClick={() => applyGroup(g)}
                  className="text-xs py-2 hover:text-[#00eefc]"
                >
                  {g.name}{" "}
                  <span className="opacity-50">({g.emails.length})</span>
                </button>
                <button
                  onClick={() => deleteGroup(g.id)}
                  className="px-2 py-2 text-[#ff6b98] text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {sendLog.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
            Send Results
          </h2>
          <div className="border border-[rgba(174,162,255,0.12)]">
            {sendLog.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2 text-xs ${
                  i > 0 ? "border-t border-[rgba(174,162,255,0.08)]" : ""
                }`}
              >
                <span>{r.email}</span>
                <span className={r.ok ? "text-[#00eefc]" : "text-[#ff6b98]"}>
                  {r.ok ? "Sent" : `Failed: ${r.error}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
          Send History
        </h2>
        {history.length === 0 ? (
          <div className="text-xs opacity-50">No sends yet.</div>
        ) : (
          <div className="border border-[rgba(174,162,255,0.12)]">
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-widest opacity-60 border-b border-[rgba(174,162,255,0.08)]">
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Group</div>
              <div className="col-span-2">Sent</div>
              <div className="col-span-2">Delivered</div>
              <div className="col-span-2">Opened</div>
            </div>
            {history.map((h) => (
              <div
                key={h.id}
                className="grid grid-cols-12 px-4 py-2 text-xs border-t border-[rgba(174,162,255,0.04)]"
              >
                <div className="col-span-4 truncate">
                  {h.name ? `${h.name} <${h.email}>` : h.email}
                </div>
                <div className="col-span-2 opacity-70">{h.group ?? "—"}</div>
                <div className="col-span-2 opacity-70">{fmt(h.sentAt)}</div>
                <div className="col-span-2 opacity-70">{fmt(h.deliveredAt)}</div>
                <div
                  className={`col-span-2 ${h.openedAt ? "text-[#00eefc]" : "opacity-40"}`}
                >
                  {fmt(h.openedAt) || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Parses free-form paste text into recipient records.
 * Accepts "Name <email>", "Name, email", or "email" per line.
 */
function parseRecipients(raw: string): RecipientInput[] {
  const out: RecipientInput[] = [];
  const emailRe = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s) continue;
    const emailMatch = s.match(emailRe);
    if (!emailMatch) continue;
    const email = emailMatch[0].toLowerCase();

    const angleMatch = s.match(/^(.+?)\s*<([^>]+)>\s*$/);
    let name: string | undefined;
    if (angleMatch) {
      name = angleMatch[1].trim().replace(/^"+|"+$/g, "");
    } else {
      const withoutEmail = s.replace(email, "").replace(/[,<>]/g, "").trim();
      if (withoutEmail) name = withoutEmail;
    }
    out.push(name ? { email, name } : { email });
  }
  // De-dupe by email
  const seen = new Set<string>();
  return out.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });
}
