"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ACCESS_CODE = "oddyssey2026";

const TABS = [
  { href: "/oddyssey-manor/admin/noir/upload", label: "01 · Upload" },
  { href: "/oddyssey-manor/admin/noir/summary", label: "02 · Summary" },
];

export function NoirShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("od-auth") === "true") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed && pathname === "/oddyssey-manor/admin/noir") {
      router.replace("/oddyssey-manor/admin/noir/summary");
    }
  }, [authed, pathname, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("od-auth", "true");
      setAuthed(true);
      setError(false);
    } else setError(true);
  }

  if (!authed) {
    return (
      <div className="noir-root min-h-screen flex items-center justify-center px-6">
        <style>{noirStyles}</style>
        <div className="w-full max-w-md text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="text-xs uppercase mb-2" style={{ color: "#b46ec8", fontWeight: 500, letterSpacing: 4 }}>
            Admin · Noir
          </p>
          <p className="text-xs uppercase mb-12" style={{ color: "#5a5650", letterSpacing: 2 }}>
            Internal Tool
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Access code"
              autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(180,110,200,0.3)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: 3 }}
            />
            {error && <p className="text-xs uppercase" style={{ color: "#c0392b", letterSpacing: 2 }}>Invalid code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase font-medium"
              style={{ background: "#b46ec8", color: "#060606", letterSpacing: 3, border: "none", cursor: "pointer" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="noir-root min-h-screen">
      <style>{noirStyles}</style>
      <header className="noir-header">
        <div className="noir-header-inner">
          <Link href="/oddyssey-manor" className="noir-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
            <div>
              <div className="noir-brand-eyebrow">Admin · Noir</div>
              <div className="noir-brand-title">Ticket Sales</div>
            </div>
          </Link>
          <nav className="noir-tabs">
            <Link href="/oddyssey-manor/admin/food" className="noir-tab-switch">← Manor</Link>
            {TABS.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} className={`noir-tab ${active ? "active" : ""}`}>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="noir-main">{children}</main>
    </div>
  );
}

const noirStyles = `
.noir-root {
  background: #060606;
  color: #e8e4dd;
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 300;
  --bg: #060606;
  --bg-elevated: #0d0d0d;
  --bg-card: #131313;
  --border: rgba(180, 110, 200, 0.25);
  --border-subtle: rgba(255, 255, 255, 0.07);
  --accent: #b46ec8;
  --accent-hover: #c484d8;
  --accent-dim: rgba(180, 110, 200, 0.12);
  --danger: #c0392b;
  --warning: #d4a574;
  --text: #e8e4dd;
  --text-secondary: #9a958d;
  --text-muted: #5a5650;
  --serif: 'Cormorant Garamond', Georgia, serif;
}
.noir-root * { border-radius: 0 !important; }
.noir-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(6,6,6,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
}
.noir-header-inner {
  max-width: 1400px; margin: 0 auto;
  padding: 18px clamp(20px, 4vw, 48px);
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  flex-wrap: wrap;
}
.noir-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; }
.noir-brand img { height: 28px; width: auto; }
.noir-brand-eyebrow {
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500;
}
.noir-brand-title {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; line-height: 1;
  margin-top: 3px;
}
.noir-tabs { display: flex; gap: 0; border: 1px solid var(--border-subtle); align-items: stretch; }
.noir-tab-switch {
  padding: 10px 18px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); cursor: pointer; transition: all 0.3s; text-decoration: none;
  border-right: 1px solid var(--border-subtle);
  background: rgba(201,168,76,0.08);
}
.noir-tab-switch:hover { color: #c9a84c; }
.noir-tab {
  padding: 10px 18px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); cursor: pointer; transition: all 0.3s; text-decoration: none;
  border-right: 1px solid var(--border-subtle);
}
.noir-tab:last-child { border-right: none; }
.noir-tab:hover { color: var(--text); background: var(--bg-elevated); }
.noir-tab.active { background: var(--accent); color: var(--bg); font-weight: 500; }
.noir-main {
  max-width: 1400px; margin: 0 auto;
  padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px);
}
@media (max-width: 800px) {
  .noir-tabs { width: 100%; }
  .noir-tab, .noir-tab-switch { flex: 1; text-align: center; padding: 10px 8px; font-size: 9px; letter-spacing: 1px; }
}
`;
