"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

const SCREENSHOTS = {
  campaignList: "https://cbm.gorunrabbit.com/dashboard/efd-outbound",
  campaignDetail: "https://cbm.gorunrabbit.com/dashboard/efd-outbound/[campaign]",
  pipeline: "https://cbm.gorunrabbit.com/dashboard/efd-pipeline",
  outreachHero: "https://eastfremontdistrict.com/outreach/[token]",
};

const STATS = [
  { val: "8", label: "Targets Seeded" },
  { val: "1", label: "Viewed" },
  { val: "1", label: "Clicked" },
  { val: "0", label: "Inquired" },
];

const FLOW_STEPS = [
  { num: "01", label: "Create Campaign" },
  { num: "02", label: "Import Targets" },
  { num: "03", label: "Generate Links" },
  { num: "04", label: "Send Outreach" },
  { num: "05", label: "Track Engagement" },
  { num: "06", label: "Convert to Lead" },
];

const PIPELINE_STAGES = [
  { label: "Pending", past: true },
  { label: "Sent", past: true },
  { label: "Viewed", active: true },
  { label: "Clicked", active: false },
  { label: "Inquired", active: false },
  { label: "Converted", active: false },
];

export default function OutboundOverviewPage() {
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Screenshots are captured and served as static files
    // For now we use placeholder text - screenshots will be added
    setLoaded(true);
  }, []);

  return (
    <div style={styles.body}>
      <div style={styles.page}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={styles.tag}>East Fremont District</p>
          <h1 style={styles.h1}>Outbound Engine</h1>
          <p style={styles.sub}>
            A personalized outreach system that identifies targets, generates unique landing pages,
            and tracks engagement from first view to closed deal.
          </p>
        </div>

        {/* Flow */}
        <div style={styles.flow}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={styles.flowStep}>
                <div style={styles.flowNum}>{step.num}</div>
                <div style={styles.flowLabel}>{step.label}</div>
              </div>
              {i < FLOW_STEPS.length - 1 && <span style={{ color: "#48474b", fontSize: 18 }}>&rarr;</span>}
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        {/* 01 — Campaign Manager */}
        <Section num="01" title="Campaign Manager" sub="Create targeted outreach campaigns organized by audience type">
          <ScreenshotFrame src="/screenshots/01-campaign-list.png" alt="Campaign list dashboard" />
          <p style={styles.caption}>
            Each campaign targets a specific audience: <Hl>DMCs</Hl>,{" "}
            <Hl>corporate event teams</Hl>, or <Hl>convention exhibitors</Hl>.
            Campaigns track status from draft through active to completed.
          </p>
          <div style={styles.features}>
            <Feature title="Audience Segmentation" desc="Organize campaigns by target type — DMCs, corporate planners, convention exhibitors, or agencies." />
            <Feature title="Campaign Lifecycle" desc="Draft → Active → Paused → Completed. Full visibility into what's running and what's converting." />
          </div>
        </Section>

        {/* 02 — Import Targets */}
        <Section num="02" title="Import Targets" sub="Add targets manually or bulk import via CSV">
          <ScreenshotFrame src="/screenshots/02-campaign-detail.png" alt="Campaign detail with target list" />
          <p style={styles.caption}>
            Add targets one at a time or import a CSV with columns:{" "}
            <strong style={{ color: "#f3f0f4" }}>company_name</strong>,{" "}
            <strong style={{ color: "#f3f0f4" }}>contact_name</strong>,{" "}
            <strong style={{ color: "#f3f0f4" }}>email</strong>.
            Each target automatically gets a unique magic link generated.
          </p>
          <Callout title="CSV Format">
            Simple 3-column CSV. Headers: <strong style={{ color: "#f3f0f4" }}>company_name, contact_name, email</strong><br />
            Drop it into the import tool and all targets are created with magic links instantly.
          </Callout>
        </Section>

        {/* 03 — Magic Links */}
        <Section num="03" title="Personalized Magic Links" sub="Each target gets a unique URL to a personalized landing page">
          <p style={{ ...styles.caption, marginBottom: 16 }}>
            Every target receives a unique URL that loads a personalized experience:
          </p>
          <div style={styles.urlDisplay}>
            eastfremontdistrict.com/outreach/68b695345f870205216eed1ffceda5e5
          </div>
          <ScreenshotFrame src="/screenshots/04-outreach-hero.png" alt="Personalized outreach page" />
          <p style={styles.caption}>
            The landing page greets the target by name:{" "}
            <strong style={{ color: "#f3f0f4" }}>&ldquo;Kenji, here&apos;s what your activation could look like at East Fremont.&rdquo;</strong>{" "}
            It includes the full venue portfolio, Feed the Block proof stats, case study data, and a pre-filled inquiry CTA.
          </p>
          <div style={styles.features}>
            <Feature title="Company-Personalized Hero" desc={`"Prepared for [Company Name]" — immediately signals this isn't a generic blast.`} />
            <Feature title="Pre-Filled Inquiry" desc="The CTA pre-fills the inquiry form with the target's company, contact name, and email. Zero friction." />
            <Feature title="Proof Points" desc="32K+ attendees, 296.6M impressions, 125% social growth, 65% stayed 45+ min — real Year 1 data." />
            <Feature title="Instant Deck Access" desc="Secondary CTA lets them download the full sponsorship deck immediately." />
          </div>
        </Section>

        {/* 04 — Send Outreach */}
        <Section num="04" title="Send Outreach" sub="Copy the magic link and send via email, LinkedIn, or DM">
          <p style={styles.caption}>
            Click <strong style={{ color: "#f3f0f4" }}>&ldquo;Copy Link&rdquo;</strong> next to any target in the campaign dashboard.
            Paste it into your outreach email, LinkedIn message, or DM.
            Mark the target as &ldquo;Sent&rdquo; to start tracking engagement.
          </p>
          <Callout title="Example Outreach">
            <em>&ldquo;Hi Jennifer — we put together a quick look at what a Samsung activation could look like
            at East Fremont during CES week. 8 venues, one block, 32K+ attendees proven in Year 1.
            Take a look: [magic link]&rdquo;</em>
          </Callout>
        </Section>

        {/* 05 — Engagement Tracking */}
        <Section num="05" title="Track Engagement" sub="Every page view, click, and inquiry is tracked automatically">
          {/* Pipeline visual */}
          <div style={styles.pipeline}>
            {PIPELINE_STAGES.map((s) => (
              <div key={s.label} style={{
                ...styles.pipelineStage,
                ...(s.active ? { background: "rgba(0,238,252,0.08)", color: "#00eefc" } : {}),
                ...(s.past ? { background: "#1f1f23", color: "#acaaae" } : {}),
              }}>
                {s.label}
              </div>
            ))}
          </div>
          <ScreenshotFrame src="/screenshots/02-campaign-detail.png" alt="Campaign engagement stats" />
          <p style={styles.caption}>
            When a target <Hl>opens the magic link</Hl>, their status advances to &ldquo;Viewed&rdquo; with a timestamp.
            When they <Hl>click the inquiry CTA or download the deck</Hl>, status advances to &ldquo;Clicked.&rdquo;
            When they <Hl>submit an inquiry</Hl>, it advances to &ldquo;Inquired&rdquo; and creates a lead in the pipeline automatically.
          </p>
          <div style={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label} style={styles.stat}>
                <div style={styles.statVal}>{s.val}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 06 — Convert */}
        <Section num="06" title="Convert to Lead" sub="Inquiry flows directly into the EFD lead pipeline">
          <ScreenshotFrame src="/screenshots/03-pipeline-kanban.png" alt="EFD Pipeline kanban" />
          <p style={styles.caption}>
            When a target submits an inquiry through their personalized page, a new lead is automatically created
            in the <strong style={{ color: "#f3f0f4" }}>EFD Lead Pipeline</strong> with source tagged as <Hl>&ldquo;outbound&rdquo;</Hl>.
            The lead enters the kanban board at &ldquo;New&rdquo; and flows through the standard pipeline:
            Qualified → Proposal → Contract → Confirmed.
          </p>
          <Callout title="Full Circle">
            The outbound engine and the lead pipeline share the same Supabase database.
            Every touchpoint — from first page view to signed contract — is tracked in one system.
            No spreadsheets, no lost emails, no leads going cold.
          </Callout>
        </Section>

        <div style={styles.divider} />

        {/* Architecture */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 16 }}>
            System Architecture
          </h2>
          <div style={styles.features}>
            <Feature title="Campaign Manager" desc="cbm.gorunrabbit.com/dashboard/efd-outbound — create campaigns, import targets, generate magic links, track engagement." accent="cyan" />
            <Feature title="Magic Link Pages" desc="eastfremontdistrict.com/outreach/[token] — personalized landing per target with automatic view/click tracking." accent="cyan" />
            <Feature title="Lead Pipeline" desc="cbm.gorunrabbit.com/dashboard/efd-pipeline — kanban CRM tracking every lead from inquiry to close." accent="violet" />
            <Feature title="Supabase Database" desc="Shared database powering both the EFD site and the CBM dashboard. 12 tables, real-time data." accent="violet" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 64, paddingTop: 32, borderTop: "1px solid #1a1a1f" }}>
          <p style={{ color: "#48474b", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" as const }}>
            Corner Bar Management &bull; East Fremont District &bull; Las Vegas
          </p>
          <p style={{ color: "#2a2d33", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8 }}>
            Built by Go Run Rabbit
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function Section({ num, title, sub, children }: { num: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ color: "rgba(174,162,255,0.3)", fontSize: 48, fontWeight: 200, lineHeight: 1, marginBottom: 8 }}>{num}</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 }}>{title}</h2>
      <p style={{ color: "#48474b", fontSize: 13, letterSpacing: 0.5, marginBottom: 24 }}>{sub}</p>
      {children}
    </div>
  );
}

function ScreenshotFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ background: "#1a1a1f", border: "1px solid #2a2d33", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
    </div>
  );
}

function Feature({ title, desc, accent }: { title: string; desc: string; accent?: string }) {
  const borderColor = accent === "cyan" ? "rgba(0,238,252,0.3)" : "rgba(174,162,255,0.2)";
  return (
    <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 20, borderLeft: `2px solid ${borderColor}` }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</h4>
      <p style={{ color: "#acaaae", fontSize: 12, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a1a1f", borderRadius: 12, padding: 24, borderLeft: "3px solid #00eefc", marginBottom: 24 }}>
      <h4 style={{ color: "#00eefc", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>{title}</h4>
      <p style={{ color: "#acaaae", fontSize: 13, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#00eefc", fontWeight: 600 }}>{children}</span>;
}

/* ── Styles ────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  body: { background: "#0e0e11", color: "#f3f0f4", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" },
  page: { maxWidth: 900, margin: "0 auto", padding: "60px 40px" },
  tag: { color: "#00eefc", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 },
  h1: { fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 },
  sub: { color: "#acaaae", fontSize: 15, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" },
  flow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 48, flexWrap: "wrap" },
  flowStep: { background: "#1a1a1f", borderRadius: 8, padding: "12px 16px", textAlign: "center", minWidth: 100 },
  flowNum: { color: "#00eefc", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 4 },
  flowLabel: { fontSize: 11, fontWeight: 600 },
  divider: { height: 1, background: "#1a1a1f", margin: "48px 0" },
  caption: { color: "#acaaae", fontSize: 13, lineHeight: 1.6, marginBottom: 24 },
  features: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  urlDisplay: { background: "#131316", border: "1px solid #2a2d33", borderRadius: 8, padding: "14px 20px", fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13, color: "#00eefc", marginBottom: 16, wordBreak: "break-all" },
  pipeline: { display: "flex", gap: 2, marginBottom: 24 },
  pipelineStage: { flex: 1, padding: "10px 8px", textAlign: "center", background: "#1a1a1f", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#48474b" },
  stats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 },
  stat: { background: "#1a1a1f", borderRadius: 10, padding: 16, textAlign: "center" },
  statVal: { color: "#00eefc", fontSize: 22, fontWeight: 800, fontFamily: "'SF Mono', monospace" },
  statLabel: { color: "#acaaae", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 },
};
