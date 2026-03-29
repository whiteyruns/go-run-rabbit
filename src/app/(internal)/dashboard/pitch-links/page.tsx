"use client";

import { useState, useEffect, useCallback } from "react";

interface PitchLink {
  id: string;
  token: string;
  title: string;
  brandName: string | null;
  category: string | null;
  venueIds: string | null;
  expiresAt: string;
  viewCount: number;
  lastViewed: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "", "tequila", "vodka", "whiskey", "rum", "beer",
  "energy", "nonalc", "tech",
];

const CATEGORY_LABELS: Record<string, string> = {
  "": "All Categories",
  tequila: "Tequila / Mezcal",
  vodka: "Vodka",
  whiskey: "Whiskey / Bourbon",
  rum: "Rum",
  beer: "Beer / Hard Seltzer",
  energy: "Energy Drinks",
  nonalc: "Non-Alcoholic / Lifestyle",
  tech: "Tech / POS / Payments",
};

const VENUE_OPTIONS = [
  { id: "commonwealth", name: "Commonwealth" },
  { id: "laundry-room", name: "Laundry Room" },
  { id: "we-all-scream", name: "We All Scream" },
  { id: "discopussy", name: "Discopussy" },
  { id: "lucky-day", name: "Lucky Day" },
  { id: "park-on-fremont", name: "Park On Fremont" },
  { id: "cheapshot", name: "Cheapshot" },
  { id: "la-mona-rosa", name: "La Mona Rosa" },
  { id: "doberman", name: "Doberman" },
];

export default function PitchLinksPage() {
  const [links, setLinks] = useState<PitchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(30);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/pitch");
    const data = await res.json();
    setLinks(data.links || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/pitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || `${brandName || "General"} Pitch`,
        brandName: brandName || null,
        category: category || null,
        venueIds: selectedVenues.length > 0 ? selectedVenues : null,
        expiresInDays,
      }),
    });
    setCreating(false);
    setShowForm(false);
    setTitle(""); setBrandName(""); setCategory(""); setSelectedVenues([]); setExpiresInDays(30);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/pitch", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLinks();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/pitch/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">PITCH LINKS</h1>
          <p className="text-on-surface-variant">Generate shareable brand-specific pitch pages</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] px-6 py-2.5 rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
          + Create Pitch Link
        </button>
      </div>

      {/* Links list */}
      {loading ? (
        <div className="bg-surface-container-high rounded-xl p-12 text-center text-on-surface-variant">Loading...</div>
      ) : links.length === 0 ? (
        <div className="bg-surface-container-high rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-lg mb-2">No pitch links yet</p>
          <p className="text-on-surface-variant/50 text-sm">Create a link to share filtered sponsorship data with brand reps — no login required.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => {
            const expired = new Date() > new Date(link.expiresAt);
            const daysLeft = Math.ceil((new Date(link.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={link.id} className="bg-surface-container-high rounded-xl p-5 hover:bg-surface-bright transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-on-surface font-bold text-lg">{link.title}</h3>
                      {expired ? (
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant/50">Expired</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan">{daysLeft}d left</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      {link.brandName && <span>{link.brandName}</span>}
                      {link.category && <span className="text-neon-violet">{CATEGORY_LABELS[link.category] || link.category}</span>}
                      <span>{link.viewCount} view{link.viewCount !== 1 ? "s" : ""}</span>
                      {link.lastViewed && <span className="text-on-surface-variant/50">Last: {new Date(link.lastViewed).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyLink(link.token)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                        copied === link.token ? "bg-neon-cyan/20 text-neon-cyan" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}>
                      {copied === link.token ? "Copied!" : "Copy Link"}
                    </button>
                    <a href={`/pitch/${link.token}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-on-surface-variant hover:text-neon-violet transition-colors px-2 py-1.5">
                      Preview
                    </a>
                    <button onClick={() => handleDelete(link.id)}
                      className="text-xs text-on-surface-variant/40 hover:text-neon-pink transition-colors px-2 py-1.5 opacity-0 group-hover:opacity-100">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-surface-container-highest rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold tracking-tight mb-6">Create Pitch Link</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                  placeholder="e.g., Casamigos Tequila Opportunity" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Brand Name (optional)</label>
                  <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-neon-violet focus:border-b-2 transition-all"
                    placeholder="Casamigos" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Category Filter</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">Filter to Venues (optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  {VENUE_OPTIONS.map(v => (
                    <button key={v.id} type="button" onClick={() => {
                      setSelectedVenues(prev => prev.includes(v.id) ? prev.filter(id => id !== v.id) : [...prev, v.id]);
                    }} className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full transition-all ${
                      selectedVenues.includes(v.id) ? "bg-neon-violet/20 text-neon-violet" : "bg-surface-container text-on-surface-variant/50 hover:text-on-surface-variant"
                    }`}>
                      {v.name}
                    </button>
                  ))}
                </div>
                {selectedVenues.length === 0 && <p className="text-on-surface-variant/40 text-xs mt-1">All venues shown if none selected</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-1">Expires In</label>
                <select value={expiresInDays} onChange={e => setExpiresInDays(Number(e.target.value))}
                  className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-neon-violet">
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating}
                  className="flex-1 bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] py-3 rounded-md font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all">
                  {creating ? "Creating..." : "Create Link"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-outline-variant/20 rounded-md text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
