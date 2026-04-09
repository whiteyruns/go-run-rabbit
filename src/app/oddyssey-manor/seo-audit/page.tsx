"use client";

import { useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "oddyssey2026";

export default function SeoAuditPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (typeof window !== "undefined" && !authenticated) {
    const stored = sessionStorage.getItem("od-auth");
    if (stored === "true") setAuthenticated(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem("od-auth", "true");
      setAuthenticated(true);
    } else { setError(true); }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#060606", color: "#e8e4dd" }}>
        <div className="w-full max-w-md text-center" style={{ animation: "odFadeIn 1s ease-out" }}>
          <style>{`@keyframes odFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="mx-auto mb-6" style={{ height: 48 }} />
          <p className="uppercase text-xs mb-12" style={{ color: "#5a5650", letterSpacing: "3px" }}>SEO Audit</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access code" autoFocus
              className="w-full px-6 py-4 text-center text-sm uppercase tracking-widest"
              style={{ background: "#0d0d0d", border: "none", borderBottom: `1px solid ${error ? "#c0392b" : "rgba(201,168,76,0.2)"}`, color: "#e8e4dd", outline: "none", fontSize: 12, letterSpacing: "3px" }} />
            {error && <p className="text-xs uppercase" style={{ color: "#c0392b", letterSpacing: "2px" }}>Invalid access code</p>}
            <button type="submit" className="w-full py-4 text-xs uppercase font-medium" style={{ background: "#c9a84c", color: "#060606", letterSpacing: "3px" }}>Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#060606", color: "#e8e4dd" }}>
      <style>{seoStyles}</style>
      <div className="seo-page">
        <Link href="/oddyssey-manor" className="seo-back">&larr; All Documents</Link>

        <div className="seo-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oddyssey/oddyssey-logo.svg" alt="Oddyssey" className="seo-logo" />
          <div className="seo-label">Technical Analysis</div>
          <h1>SEO Audit</h1>
          <p className="seo-subtitle">oddysseylv.com &bull; Next.js + Vercel + Ticketure</p>
          <div className="seo-meta">April 2026 &bull; Go Run Rabbit</div>
        </div>

        {/* Key Insight */}
        <div className="seo-insight">
          <p><strong>The site has a solid technical foundation</strong> (Next.js SSR, clean URLs, robots.txt, sitemap) <strong>but is leaving massive search visibility on the table.</strong> No Event schema means Oddyssey doesn&rsquo;t appear in Google&rsquo;s &ldquo;Events near me&rdquo; results. No OG tags means every social share looks broken. The homepage meta description describes Noir only. And <code>/manor</code> &mdash; a primary revenue page &mdash; is missing from the sitemap entirely.</p>
        </div>

        {/* Scorecard */}
        <div className="seo-section">
          <div className="seo-section-title">Audit Scorecard</div>
          <div className="seo-scores">
            {[
              { area: "Structured Data", score: "D+", color: "#c0392b", note: "LocalBusiness + FAQ exists, but no Event schema, no Offer schema, no BreadcrumbList" },
              { area: "Meta Tags", score: "C-", color: "#f39c12", note: "Titles decent, descriptions mixed. No OG tags or Twitter cards on main pages" },
              { area: "Technical SEO", score: "B", color: "#27ae60", note: "Clean URLs, robots.txt, SSR. Sitemap has errors. No canonicals on main pages" },
              { area: "Content SEO", score: "D", color: "#c0392b", note: "Thin content, no target keywords, generic alt text, dual H1 on Noir" },
              { area: "Local SEO", score: "C", color: "#f39c12", note: "Address in schema, but no phone number, name inconsistency, no GBP link" },
              { area: "Ticketure Integration", score: "F", color: "#c0392b", note: "Backend only — zero SEO output. Event data exists but generates no schema" },
            ].map(s => (
              <div key={s.area} className="seo-score-card">
                <div className="seo-score-grade" style={{ color: s.color }}>{s.score}</div>
                <div className="seo-score-info">
                  <h4>{s.area}</h4>
                  <p>{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Data */}
        <div className="seo-section">
          <div className="seo-section-title">Structured Data / Schema Markup</div>

          <h3 className="seo-sub-title">What Exists</h3>
          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead><tr><th>Page</th><th>Schema</th><th>Assessment</th></tr></thead>
              <tbody>
                <tr><td><code>/</code></td><td>Organization</td><td>Name says &ldquo;Oddyssey Manor&rdquo; — should be &ldquo;Oddyssey.&rdquo; Hours only reflect Manor, not Noir.</td></tr>
                <tr><td><code>/manor</code></td><td>LocalBusiness + FAQPage (14 Q&amp;A)</td><td>Good foundation. FAQ schema is a strong feature for featured snippets.</td></tr>
                <tr><td><code>/noir</code></td><td>LocalBusiness/NightClub + FAQPage (12 Q&amp;A)</td><td>Good. Hours: Sat 22:30-04:00 only — missing Friday.</td></tr>
                <tr><td><code>/gallery</code></td><td>CollectionPage + ImageObject</td><td>Present but images have generic alt text.</td></tr>
                <tr><td><code>/blog/*</code></td><td>Article</td><td>Proper headline, author, publisher. Only pages with OG tags.</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="seo-sub-title" style={{ marginTop: 32, color: "#c0392b" }}>What&rsquo;s Missing (Critical)</h3>
          <div className="seo-missing-grid">
            {[
              { schema: "Event", impact: "Critical", desc: "Every Noir night and Manor show should have Event schema with startDate, endDate, location, offers (pricing), and performer. This powers Google's \"Events near me\" results." },
              { schema: "Offer / Product", impact: "High", desc: "Ticket pages have no pricing schema. Google can't show ticket prices in search results." },
              { schema: "BreadcrumbList", impact: "Medium", desc: "No breadcrumb schema on any page. Should exist on all sub-pages (Home > Manor, Home > Blog > Post)." },
              { schema: "VideoObject", impact: "Medium", desc: "If video exists on the site, it has no schema. Video rich results drive high CTR." },
              { schema: "Review / AggregateRating", impact: "Low-Med", desc: "No review markup. Google reviews should be referenced if they exist." },
            ].map(m => (
              <div key={m.schema} className="seo-missing-card">
                <div className="seo-missing-header">
                  <span className="seo-schema-name">{m.schema}</span>
                  <span className={`seo-impact seo-impact-${m.impact.toLowerCase().replace(/[-\s]/g, '')}`}>{m.impact}</span>
                </div>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Tags */}
        <div className="seo-section">
          <div className="seo-section-title">Meta Tags &mdash; Page by Page</div>

          <h3 className="seo-sub-title">Title Tags</h3>
          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead><tr><th>Page</th><th>Title</th><th>Grade</th></tr></thead>
              <tbody>
                {[
                  { page: "/", title: "Oddyssey Las Vegas | Immersive Theatre & Club at AREA15", grade: "Good", color: "#27ae60" },
                  { page: "/manor", title: "Oddyssey Manor | Immersive Cocktail Theatre in Las Vegas", grade: "Good", color: "#27ae60" },
                  { page: "/noir", title: "Oddyssey Noir | Warehouse Rave & Nightlife Experience", grade: "Fair", color: "#f39c12" },
                  { page: "/gallery", title: "Oddyssey Gallery | Vegas Performance Art, Shows & Nightlife", grade: "Good", color: "#27ae60" },
                  { page: "/private-events", title: "MISSING", grade: "Critical", color: "#c0392b" },
                  { page: "/calendar", title: "MISSING", grade: "Critical", color: "#c0392b" },
                ].map(r => (
                  <tr key={r.page}><td><code>{r.page}</code></td><td>{r.title}</td><td style={{ color: r.color, fontWeight: 600, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{r.grade}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="seo-sub-title" style={{ marginTop: 32 }}>Open Graph &amp; Twitter Cards</h3>
          <div className="seo-insight" style={{ borderLeftColor: "#c0392b" }}>
            <p><strong>OG tags exist ONLY on individual blog posts.</strong> All primary pages (homepage, Manor, Noir, Gallery) are completely missing OG tags. Sharing these pages on iMessage, Slack, Facebook, or LinkedIn produces a generic preview with no image or description. Same pattern for Twitter cards.</p>
          </div>

          <h3 className="seo-sub-title" style={{ marginTop: 32 }}>Meta Description Issues</h3>
          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead><tr><th>Page</th><th>Issue</th></tr></thead>
              <tbody>
                <tr><td><code>/</code></td><td><span style={{ color: "#c0392b" }}>Homepage description describes Noir only</span> — should describe the full Oddyssey brand (Manor + Noir).</td></tr>
                <tr><td><code>/noir</code></td><td>Missing &ldquo;Las Vegas&rdquo; in title tag. Description is adequate.</td></tr>
                <tr><td><code>/private-events</code></td><td><span style={{ color: "#c0392b" }}>No title or description at all.</span></td></tr>
                <tr><td><code>/calendar</code></td><td><span style={{ color: "#c0392b" }}>No title or description at all.</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical */}
        <div className="seo-section">
          <div className="seo-section-title">Technical SEO</div>
          <div className="seo-two-col">
            <div className="seo-col">
              <h4 style={{ color: "#27ae60" }}>Working</h4>
              <ul>
                <li>robots.txt properly configured</li>
                <li>Sitemap.xml present (17 URLs)</li>
                <li>Clean, keyword-friendly URLs</li>
                <li>Next.js SSR handles rendering</li>
                <li>Mobile viewport meta tag set</li>
                <li>CSS bundled, JS code-split</li>
              </ul>
            </div>
            <div className="seo-col">
              <h4 style={{ color: "#c0392b" }}>Broken</h4>
              <ul>
                <li><code>/admin</code> is in sitemap but blocked by robots.txt</li>
                <li><code>/manor</code> is MISSING from sitemap</li>
                <li>No canonical tags on main pages (only blog posts)</li>
                <li>Convert Experiments script is render-blocking</li>
                <li>No preconnect hints for external resources</li>
                <li><code>/private-events</code>, <code>/calendar</code>, <code>/book-a-table</code> have no nav links</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="seo-section">
          <div className="seo-section-title">Content SEO</div>

          <h3 className="seo-sub-title">Page Content Depth</h3>
          <div className="seo-content-bars">
            {[
              { page: "/", words: 150, target: 500, status: "Thin" },
              { page: "/manor", words: 450, target: 500, status: "OK (FAQ helps)" },
              { page: "/noir", words: 200, target: 500, status: "Thin" },
              { page: "/gallery", words: 50, target: 300, status: "Very thin" },
              { page: "/blog posts", words: 320, target: 1000, status: "Thin" },
            ].map(p => (
              <div key={p.page} className="seo-content-bar">
                <div className="seo-bar-label"><code>{p.page}</code> <span>{p.words} words</span></div>
                <div className="seo-bar-track">
                  <div className="seo-bar-fill" style={{ width: `${Math.min((p.words / p.target) * 100, 100)}%`, background: p.words >= p.target ? "#27ae60" : p.words >= p.target * 0.6 ? "#f39c12" : "#c0392b" }} />
                  <div className="seo-bar-target" style={{ left: `${100}%` }} />
                </div>
                <div className="seo-bar-status" style={{ color: p.words >= p.target ? "#27ae60" : "#c0392b" }}>{p.status}</div>
              </div>
            ))}
          </div>

          <h3 className="seo-sub-title" style={{ marginTop: 32 }}>Keyword Presence</h3>
          <div className="seo-table-wrap">
            <table className="seo-table">
              <thead><tr><th>Target Keyword</th><th>Homepage</th><th>Manor</th><th>Noir</th><th>Blog</th></tr></thead>
              <tbody>
                {[
                  { kw: "Las Vegas house music", h: false, m: false, n: false, b: false },
                  { kw: "AREA15 nightlife", h: "Partial", m: "Partial", n: "Partial", b: true },
                  { kw: "immersive nightclub Las Vegas", h: "Partial", m: "Partial", n: "Partial", b: true },
                  { kw: "Las Vegas techno club", h: false, m: false, n: false, b: false },
                  { kw: "Liquid Gold Las Vegas", h: false, m: false, n: false, b: false },
                ].map(r => (
                  <tr key={r.kw}>
                    <td><strong>{r.kw}</strong></td>
                    {[r.h, r.m, r.n, r.b].map((v, i) => (
                      <td key={i} style={{ color: v === true ? "#27ae60" : v === false ? "#c0392b" : "#f39c12", textAlign: "center" }}>
                        {v === true ? "Yes" : v === false ? "No" : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="seo-note">&ldquo;Las Vegas house music&rdquo; and &ldquo;Las Vegas techno club&rdquo; appear nowhere on any page. &ldquo;Liquid Gold&rdquo; — their named Friday night — has zero search presence on the website.</p>
        </div>

        {/* Ticketure */}
        <div className="seo-section">
          <div className="seo-section-title">Ticketure Integration</div>
          <div className="seo-two-col">
            <div className="seo-col">
              <h4>What Ticketure Provides</h4>
              <ul>
                <li>Ticket pricing &amp; availability API</li>
                <li>Calendar/date selection widget</li>
                <li>Embedded checkout flow (not external redirect)</li>
                <li>Capacity &amp; inventory management</li>
                <li>Event session data with dates &amp; times</li>
              </ul>
            </div>
            <div className="seo-col">
              <h4 style={{ color: "#c0392b" }}>What Ticketure Does NOT Provide</h4>
              <ul>
                <li>Event schema (dates, performers, offers)</li>
                <li>OG tags for social sharing</li>
                <li>Meta descriptions per event</li>
                <li>Performer/DJ structured data</li>
                <li>Any SEO benefit whatsoever</li>
              </ul>
            </div>
          </div>
          <div className="seo-insight" style={{ marginTop: 20, borderLeftColor: "#f39c12" }}>
            <p>Ticketure has all the event data (dates, prices, availability) that <strong>should be feeding Event schema automatically</strong>, but it&rsquo;s not wired up. The site team needs to either pull from Ticketure&rsquo;s API to generate Event schema, or add it manually per event.</p>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="seo-section">
          <div className="seo-section-title">Priority Action Items</div>
          <div className="seo-actions">
            {[
              { priority: "P0", label: "Critical", color: "#c0392b", items: [
                "Add Event schema to all Noir nights and Manor shows (dates, performers, ticket pricing)",
                "Add OG tags + Twitter cards to ALL main pages (homepage, Manor, Noir, Gallery)",
                "Add canonical tags to all pages",
                "Fix homepage meta description — describes Noir only, should describe full brand",
                "Remove /admin from sitemap. Add /manor to sitemap.",
              ]},
              { priority: "P1", label: "High", color: "#f39c12", items: [
                "Add title tags + meta descriptions to /private-events and /calendar",
                "Fix dual H1 on /noir page",
                "Add phone number to all LocalBusiness schema and visibly on site",
                "Add BreadcrumbList schema to all sub-pages",
                "Replace gallery image alt text with descriptive, keyword-rich text",
              ]},
              { priority: "P2", label: "Medium", color: "#27ae60", items: [
                "Expand blog posts from ~320 words to 800-1500 targeting specific keywords",
                "Add Offer schema to ticket pages with pricing",
                "Defer Convert Experiments script (currently render-blocking)",
                "Add preconnect hints for GTM, Convert, Ticketure API",
                "Add /private-events, /calendar, /book-a-table to site navigation",
                "Increase homepage crawlable text with target keywords",
              ]},
            ].map(group => (
              <div key={group.priority} className="seo-action-group">
                <div className="seo-action-header">
                  <span className="seo-action-priority" style={{ color: group.color, borderColor: group.color }}>{group.priority}</span>
                  <span className="seo-action-label" style={{ color: group.color }}>{group.label}</span>
                </div>
                <ul>
                  {group.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="seo-footer">
          <Link href="/oddyssey-manor" className="seo-back">&larr; All Documents</Link>
          <span>Go Run Rabbit &bull; April 2026</span>
        </div>
      </div>
    </div>
  );
}

const seoStyles = `
.seo-page { max-width: 1000px; margin: 0 auto; padding: 40px 40px 80px; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.7; }
.seo-back { display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-decoration: none; margin-bottom: 40px; transition: color 0.3s; }
.seo-back:hover { color: #c9a84c; }
.seo-header { text-align: center; padding-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 50px; }
.seo-logo { height: 40px; width: auto; margin: 0 auto 20px; display: block; }
.seo-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; font-weight: 500; margin-bottom: 16px; }
.seo-header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px,5vw,48px); font-weight: 300; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.seo-subtitle { font-size: 14px; letter-spacing: 2px; color: #9a958d; margin-bottom: 8px; }
.seo-meta { font-size: 11px; color: #5a5650; letter-spacing: 1.5px; }
.seo-section { margin-bottom: 56px; }
.seo-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.seo-sub-title { font-size: 13px; font-weight: 500; letter-spacing: 1px; color: #e8e4dd; margin-bottom: 16px; }
.seo-insight { background: #0d0d0d; border: 1px solid rgba(201,168,76,0.15); border-left: 3px solid #c9a84c; padding: 24px 28px; margin-bottom: 32px; }
.seo-insight p { font-size: 14px; color: #9a958d; line-height: 1.7; }
.seo-insight strong { color: #e8e4dd; font-weight: 500; }
.seo-insight code { color: #c9a84c; font-size: 12px; }
.seo-note { font-size: 12px; color: #5a5650; margin-top: 12px; font-style: italic; }

.seo-scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); }
.seo-score-card { background: #060606; padding: 24px; display: flex; gap: 16px; align-items: flex-start; }
.seo-score-grade { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; line-height: 1; min-width: 50px; }
.seo-score-info h4 { font-size: 12px; letter-spacing: 1px; margin-bottom: 6px; }
.seo-score-info p { font-size: 11px; color: #5a5650; line-height: 1.5; }

.seo-table-wrap { overflow-x: auto; }
.seo-table { width: 100%; border-collapse: collapse; }
.seo-table th { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5a5650; text-align: left; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 500; }
.seo-table td { padding: 12px 14px; font-size: 12px; color: #9a958d; border-bottom: 1px solid rgba(255,255,255,0.04); }
.seo-table strong { color: #e8e4dd; font-weight: 400; }
.seo-table code { color: #c9a84c; font-size: 11px; }

.seo-missing-grid { display: flex; flex-direction: column; gap: 12px; }
.seo-missing-card { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 20px; }
.seo-missing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.seo-schema-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; }
.seo-impact { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; padding: 4px 12px; border: 1px solid; }
.seo-impact-critical { color: #c0392b; border-color: rgba(192,57,43,0.3); }
.seo-impact-high { color: #f39c12; border-color: rgba(243,156,18,0.3); }
.seo-impact-medium { color: #27ae60; border-color: rgba(39,174,96,0.3); }
.seo-impact-lowmed { color: #27ae60; border-color: rgba(39,174,96,0.3); }
.seo-missing-card p { font-size: 13px; color: #9a958d; line-height: 1.6; }

.seo-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.06); }
.seo-col { background: #060606; padding: 24px; }
.seo-col h4 { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; margin-bottom: 16px; color: #9a958d; }
.seo-col ul { list-style: none; }
.seo-col li { font-size: 12px; color: #9a958d; padding: 6px 0 6px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; }
.seo-col li::before { content: ''; position: absolute; left: 0; top: 12px; width: 4px; height: 4px; border: 1px solid #c9a84c; transform: rotate(45deg); }
.seo-col li code { color: #c9a84c; font-size: 11px; }

.seo-content-bars { display: flex; flex-direction: column; gap: 16px; }
.seo-content-bar { display: grid; grid-template-columns: 140px 1fr 80px; gap: 12px; align-items: center; }
.seo-bar-label { font-size: 12px; color: #9a958d; }
.seo-bar-label code { color: #c9a84c; font-size: 11px; }
.seo-bar-label span { display: block; font-size: 10px; color: #5a5650; }
.seo-bar-track { height: 6px; background: rgba(255,255,255,0.06); position: relative; }
.seo-bar-fill { position: absolute; top: 0; left: 0; height: 100%; transition: width 0.6s; }
.seo-bar-status { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 500; text-align: right; }

.seo-actions { display: flex; flex-direction: column; gap: 20px; }
.seo-action-group { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); padding: 24px; }
.seo-action-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.seo-action-priority { font-size: 10px; letter-spacing: 2px; font-weight: 600; padding: 4px 12px; border: 1px solid; }
.seo-action-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }
.seo-action-group ul { list-style: none; }
.seo-action-group li { font-size: 13px; color: #9a958d; padding: 8px 0 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); position: relative; }
.seo-action-group li::before { content: ''; position: absolute; left: 0; top: 14px; width: 5px; height: 5px; border: 1px solid #c9a84c; transform: rotate(45deg); }
.seo-action-group li:last-child { border-bottom: none; }

.seo-footer { margin-top: 60px; padding-top: 30px; padding-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #5a5650; letter-spacing: 1.5px; }

@media (max-width: 700px) {
  .seo-page { padding: 24px 20px 60px; }
  .seo-scores { grid-template-columns: 1fr; }
  .seo-two-col { grid-template-columns: 1fr; }
  .seo-content-bar { grid-template-columns: 1fr; gap: 4px; }
  .seo-bar-status { text-align: left; }
  .seo-footer { flex-direction: column; gap: 12px; text-align: center; }
}
`;
