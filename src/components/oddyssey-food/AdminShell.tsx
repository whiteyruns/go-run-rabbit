"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ACCESS_CODE = "oddyssey2026";

const TABS = [
  { href: "/oddyssey-manor/admin/food/upload", label: "01 · Upload" },
  { href: "/oddyssey-manor/admin/food/validation", label: "02 · Validation" },
  { href: "/oddyssey-manor/admin/food/roster", label: "03 · Roster" },
  { href: "/oddyssey-manor/admin/food/kitchen", label: "04 · Kitchen" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("od-auth") === "true") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed && pathname === "/oddyssey-manor/admin/food") {
      router.replace("/oddyssey-manor/admin/food/upload");
    }
  }, [authed, pathname, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("od-auth", "true");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!authed) {
    return (
      <div className="admin-root min-h-screen flex items-center justify-center px-6">
        <style>{adminStyles}</style>
        <div className="w-full max-w-md text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48, width: "auto" }} />
          <p className="text-xs uppercase mb-2" style={{ color: "#c9a84c", fontWeight: 500, letterSpacing: 4 }}>
            Admin · Food Inclusions
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
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: 3 }}
            />
            {error && <p className="text-xs uppercase" style={{ color: "#c0392b", letterSpacing: 2 }}>Invalid code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase font-medium"
              style={{ background: "#c9a84c", color: "#060606", letterSpacing: 3, border: "none", cursor: "pointer" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root min-h-screen">
      <style>{adminStyles}</style>
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/oddyssey-manor" className="admin-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" />
            <div>
              <div className="admin-brand-eyebrow">Admin</div>
              <div className="admin-brand-title">Food Inclusions</div>
            </div>
          </Link>
          <nav className="admin-tabs">
            {TABS.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} className={`admin-tab ${active ? "active" : ""}`}>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}

const adminStyles = `
.admin-root {
  background: #060606;
  color: #e8e4dd;
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 300;
  --bg: #060606;
  --bg-elevated: #0d0d0d;
  --bg-card: #131313;
  --border: rgba(201, 168, 76, 0.18);
  --border-subtle: rgba(255, 255, 255, 0.07);
  --accent: #c9a84c;
  --accent-hover: #d4b85e;
  --accent-dim: rgba(201, 168, 76, 0.1);
  --danger: #c0392b;
  --danger-dim: rgba(192,57,43,0.12);
  --warning: #d4a574;
  --info: #6c8fb3;
  --text: #e8e4dd;
  --text-secondary: #9a958d;
  --text-muted: #5a5650;
  --serif: 'Cormorant Garamond', Georgia, serif;
}
.admin-root * { border-radius: 0 !important; }
.admin-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(6,6,6,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
}
.admin-header-inner {
  max-width: 1400px; margin: 0 auto;
  padding: 18px clamp(20px, 4vw, 48px);
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  flex-wrap: wrap;
}
.admin-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; }
.admin-brand img { height: 28px; width: auto; }
.admin-brand-eyebrow {
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); font-weight: 500;
}
.admin-brand-title {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  letter-spacing: 2px; text-transform: uppercase; line-height: 1;
  margin-top: 3px;
}
.admin-tabs { display: flex; gap: 0; border: 1px solid var(--border-subtle); }
.admin-tab {
  padding: 10px 18px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted); cursor: pointer; transition: all 0.3s; text-decoration: none;
  border-right: 1px solid var(--border-subtle);
}
.admin-tab:last-child { border-right: none; }
.admin-tab:hover { color: var(--text); background: var(--bg-elevated); }
.admin-tab.active { background: var(--accent); color: var(--bg); font-weight: 500; }
.admin-main {
  max-width: 1400px; margin: 0 auto;
  padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px);
}
@media (max-width: 700px) {
  .admin-tabs { width: 100%; }
  .admin-tab { flex: 1; text-align: center; padding: 10px 8px; font-size: 9px; letter-spacing: 1px; }
}

/* Print: hide all chrome */
@media print {
  .admin-header, .admin-tabs { display: none !important; }
  .admin-main { padding: 0; max-width: none; }
  .admin-root { background: #fff !important; color: #000 !important; }
}
`;
