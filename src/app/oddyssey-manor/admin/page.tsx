/**
 * Oddyssey Admin hub — the "Internal Tools" home.
 *
 * Lists every admin tool with a brief purpose + primary destination.
 * When a new tool ships under /oddyssey-manor/admin/* add a tile here
 * so it's discoverable from the ← Admin link on every sub-page.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin · Oddyssey',
  description: 'Internal tools for Oddyssey Manor + Noir operations.',
};

export const dynamic = 'force-dynamic';

interface Tool {
  slug: string;
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
  accent: 'gold' | 'purple' | 'tan' | 'green';
  meta?: string;
}

const TOOLS: Tool[] = [
  {
    slug: 'weekend-recap',
    eyebrow: 'Monday scrum',
    title: 'Weekend Recap',
    blurb:
      "Fri+Sat per venue, YTD Actual vs Budget, Golden Hour open bar, and the week-over-week bar. Brandon's dashboard for the Monday meeting.",
    href: '/oddyssey-manor/admin/weekend-recap',
    accent: 'gold',
    meta: 'Manor · Noir · YTD',
  },
  {
    slug: 'food',
    eyebrow: 'Manor',
    title: 'Food Inclusions Dashboard',
    blurb:
      "Upload → Validation → Roster → Kitchen → Summary. The roster is the printable sheet the kitchen runs off of; replaces the old SharePoint flow.",
    href: '/oddyssey-manor/admin/food/summary',
    accent: 'gold',
    meta: 'Ticketure attendees CSV · Square bar',
  },
  {
    slug: 'noir',
    eyebrow: 'Noir',
    title: 'Noir Ticket Sales',
    blurb:
      "Nightly Noir snapshot — headline stats from Ticketure's session report, per-group breakdown, Channel Mix (direct vs third-party), WoW.",
    href: '/oddyssey-manor/admin/noir/summary',
    accent: 'purple',
    meta: 'Liber Gigante · Fri + Sat',
  },
  {
    slug: 'pour-log',
    eyebrow: 'Golden Hour',
    title: 'Pour Log',
    blurb:
      "GM files bottle counts (tequila + champagne, opened/closed) per Golden Hour night. Feeds attach-rate math + sponsor recap totals.",
    href: '/oddyssey-manor/admin/pour-log',
    accent: 'tan',
    meta: 'Weekly · after each night',
  },
  {
    slug: 'sponsor-recap',
    eyebrow: 'Weekly',
    title: 'Sponsor Recap',
    blurb:
      "Pick a brand and a week — drafts a partner-facing email with activations, pours, and attach rate. Sends via Resend to GM + Tim for review.",
    href: '/oddyssey-manor/admin/sponsor-recap',
    accent: 'green',
    meta: 'El Bandido · Telsen · KU',
  },
];

const ACCENT_MAP: Record<Tool['accent'], { line: string; eyebrow: string; hover: string }> = {
  gold:   { line: '#c9a84c', eyebrow: '#c9a84c', hover: 'rgba(201,168,76,0.06)' },
  purple: { line: '#b46ec8', eyebrow: '#b46ec8', hover: 'rgba(180,110,200,0.06)' },
  tan:    { line: '#d4a574', eyebrow: '#d4a574', hover: 'rgba(212,165,116,0.06)' },
  green:  { line: '#27ae60', eyebrow: '#27ae60', hover: 'rgba(39,174,96,0.06)' },
};

export default function AdminHome() {
  return (
    <main
      style={{
        background: '#060606',
        color: '#e8e4dd',
        minHeight: '100vh',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        padding: '48px 24px 96px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href="/oddyssey-manor"
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9a958d',
              textDecoration: 'none',
            }}
          >
            ← Oddyssey home
          </Link>
        </div>

        <header style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              marginBottom: 12,
            }}
          >
            Admin · Internal Tools
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 44,
              fontWeight: 300,
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: 1,
            }}
          >
            Oddyssey <em style={{ color: '#c9a84c' }}>control room.</em>
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17,
              color: '#9a958d',
              fontStyle: 'italic',
              marginTop: 14,
              maxWidth: 640,
              lineHeight: 1.5,
            }}
          >
            Every tool that drives Manor + Noir operations, in one place.
            Most land here from a ← Admin link on their own sub-page.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {TOOLS.map((t) => {
            const c = ACCENT_MAP[t.accent];
            return (
              <Link
                key={t.slug}
                href={t.href}
                style={{
                  display: 'block',
                  background: '#0d0d0d',
                  padding: '26px 26px 24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: `2px solid ${c.line}`,
                  transition: 'background 0.2s',
                }}
                className="admin-tile"
              >
                <div
                  style={{
                    fontFamily: 'Consolas, monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: c.eyebrow,
                    marginBottom: 10,
                  }}
                >
                  {t.eyebrow}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 26,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    marginBottom: 10,
                    color: '#e8e4dd',
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: '#9a958d',
                    marginBottom: 14,
                  }}
                >
                  {t.blurb}
                </div>
                {t.meta && (
                  <div
                    style={{
                      fontFamily: 'Consolas, monospace',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#5a5650',
                    }}
                  >
                    {t.meta}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 18,
                    fontFamily: 'Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: c.line,
                  }}
                >
                  Open →
                </div>
              </Link>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 36,
            padding: 18,
            border: '1px solid rgba(106,123,138,0.2)',
            borderLeft: '2px solid #6a7b8a',
            background: 'rgba(106,123,138,0.04)',
            fontSize: 12.5,
            color: '#9a958d',
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6a7b8a',
              marginBottom: 6,
            }}
          >
            New tools
          </div>
          When a new admin tool ships under <code style={{ color: '#c9a84c' }}>/oddyssey-manor/admin/*</code>, add
          a tile in <code style={{ color: '#c9a84c' }}>src/app/oddyssey-manor/admin/page.tsx</code> so the {'← Admin'} link
          anywhere in the product routes discover it.
        </div>
      </div>

      <style>{`
        .admin-tile:hover {
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
    </main>
  );
}
