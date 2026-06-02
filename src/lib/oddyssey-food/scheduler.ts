import { Cron } from "croner";

// Runs inside the Next.js server process (see src/instrumentation.ts).
// Croner holds its own timers; no extra process management needed.
// Hide Node built-ins from webpack's static analysis so this module
// doesn't fail the Edge-runtime bundle (instrumentation.ts is included
// in both runtimes).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeRequire: NodeRequire = typeof window === "undefined"
  ? (eval("require") as NodeRequire)
  : (null as unknown as NodeRequire);

function getChildProcess() {
  return nodeRequire("child_process") as typeof import("child_process");
}
function getPath() {
  return nodeRequire("path") as typeof import("path");
}

const REPO = typeof process !== "undefined" ? process.cwd() : "";
const WRAPPER = typeof process !== "undefined"
  ? getPath().join(REPO, "scripts/oddyssey-food-pull.sh")
  : "";

// State is persisted to disk because Next.js gives instrumentation.ts
// and API routes isolated module contexts — globalThis isn't shared.
// Crons fire in the instrumentation context; the API route just
// reports what's on disk.
interface SchedulerState {
  started: boolean;
  startedAt: string | null;
  jobs: { name: string; pattern: string; next: string | null }[];
  crons: Cron[];
}
const STATE: SchedulerState = {
  started: false,
  startedAt: null,
  jobs: [],
  crons: [],
};

function statusFilePath(): string {
  const pathMod = nodeRequire("path") as typeof import("path");
  return pathMod.join(process.cwd(), "data/oddyssey-food/scheduler-status.json");
}

function persistStatus() {
  try {
    const fs = nodeRequire("fs") as typeof import("fs");
    const pathMod = nodeRequire("path") as typeof import("path");
    const file = statusFilePath();
    fs.mkdirSync(pathMod.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          started: STATE.started,
          started_at: STATE.startedAt,
          jobs: STATE.jobs,
          pid: process.pid,
        },
        null,
        2
      )
    );
  } catch { /* non-fatal */ }
}

export function getSchedulerStatus() {
  // Read what's on disk so callers outside the instrumentation context
  // still see the real state.
  try {
    const fs = nodeRequire("fs") as typeof import("fs");
    const raw = fs.readFileSync(statusFilePath(), "utf-8");
    const onDisk = JSON.parse(raw);
    return {
      ...onDisk,
      env_ok: Boolean(process.env.TICKETURE_EMAIL && process.env.TICKETURE_PASSWORD),
    };
  } catch {
    return {
      started: STATE.started,
      started_at: STATE.startedAt,
      env_ok: Boolean(process.env.TICKETURE_EMAIL && process.env.TICKETURE_PASSWORD),
      jobs: STATE.jobs,
    };
  }
}

function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function runPull(label: string, venue: "manor" | "noir", dateArg?: string) {
  const args: string[] = [`--venue=${venue}`];
  if (dateArg) args.push(`--date=${dateArg}`);
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: ${label}${dateArg ? ` (${dateArg})` : ""}`);
  const { spawn } = getChildProcess();
  const proc = spawn(WRAPPER, args, { cwd: REPO });
  proc.stdout.on("data", (d: Buffer) =>
    process.stdout.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.stderr.on("data", (d: Buffer) =>
    process.stderr.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.on("close", (code: number | null) => {
    console.log(`[oddyssey-scheduler] ${label} exited ${code}`);
    // After the attendees pull lands, kick a session summary scrape
    // so we have the authoritative revenue/paid-vs-free numbers too.
    if (code === 0 && !label.includes("sessions")) runSessionsScrape(label, venue, dateArg);
  });
}

function runSessionsScrape(parentLabel: string, venue: "manor" | "noir", dateArg?: string) {
  const args: string[] = ["tsx", "scripts/oddyssey-sessions-pull.ts", `--venue=${venue}`];
  if (dateArg) args.push(`--date=${dateArg}`);
  const label = `${parentLabel}+sessions`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: ${label}${dateArg ? ` (${dateArg})` : ""}`);
  const { spawn } = getChildProcess();
  const path = nodeRequire("path") as typeof import("path");
  // Invoke via npx using bash to pick up .env.local via the wrapper's env-loading
  // (we can reuse the same wrapper script since it just runs the tsx binary).
  // Simpler: spawn the wrapper but swap the script arg — we need a separate
  // wrapper for sessions. Use an inline sh -c that sources .env.local.
  const shCmd = `source ${path.join(REPO, ".env.local")} 2>/dev/null; export PATH=/Users/white/.nvm/versions/node/v22.22.0/bin:$PATH; cd ${REPO}; set -a; source .env.local; set +a; npx ${args.join(" ")}`;
  const proc = spawn("/bin/bash", ["-c", shCmd], { cwd: REPO });
  proc.stdout.on("data", (d: Buffer) =>
    process.stdout.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.stderr.on("data", (d: Buffer) =>
    process.stderr.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.on("close", (code: number | null) =>
    console.log(`[oddyssey-scheduler] ${label} exited ${code}`)
  );
}

async function sendEmail(
  kind: "recap" | "briefing",
  venue: "manor" | "noir",
  dateArg: string
) {
  const port = process.env.PORT ?? "3102";
  const apiPath = venue === "manor" ? "oddyssey-food" : "oddyssey-noir";
  const url = `http://localhost:${port}/api/${apiPath}/${kind}`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: ${kind}-${venue} (${dateArg})`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: dateArg }),
    });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] ${kind}-${venue} → ${data.status} ${data.subject ?? ""} → ${(data.recipients ?? []).join(", ")} ${data.resend_id ? `(${data.resend_id})` : data.message ?? ""}`
    );
  } catch (e) {
    console.log(`[oddyssey-scheduler] ${kind}-${venue} failed: ${String(e)}`);
  }
}

const sendRecap = (venue: "manor" | "noir", date: string) => sendEmail("recap", venue, date);
const sendBriefing = (venue: "manor" | "noir", date: string) => sendEmail("briefing", venue, date);

// Manor food roster PDF — runs after the 2 PM regular pull (45-min
// offset gives the CSV write room to settle, same pattern as the
// 17:05 briefing offset from the 17:00 pull).
async function sendRosterPdf(date: string) {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/oddyssey-food/roster-pdf`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: roster-pdf-manor (${date})`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date }),
    });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] roster-pdf-manor → ${data.status} ${data.subject ?? ""} → ${(data.recipients ?? []).join(", ")}${data.cc?.length ? ` cc:${data.cc.join(",")}` : ""} ${data.resend_id ? `(${data.resend_id})` : data.message ?? ""}`
    );
  } catch (e) {
    console.log(`[oddyssey-scheduler] roster-pdf-manor failed: ${String(e)}`);
  }
}

// Monday 8 AM PT weekend-recap upload reminder. Posts to a Node-runtime
// API route instead of importing reminder.ts directly — mirrors the
// sendEmail() pattern above and keeps fs-using code out of the
// instrumentation module graph (Edge runtime rejects fs/path specifiers).
async function runXlsxUpdateEmail() {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/oddyssey-update-email`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: xlsx-update-email`);
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] xlsx-update-email → ${data.status} ${data.subject ?? ""} → ${(data.recipients ?? []).join(", ")} ${data.resend_id ? `(${data.resend_id})` : data.message ?? ""}`,
    );
  } catch (err) {
    console.log(`[oddyssey-scheduler] xlsx-update-email failed: ${String(err)}`);
  }
}

async function runWeekendRecapReminder() {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/cron/weekend-recap-reminder`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: weekend-recap-reminder`);
  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] weekend-recap-reminder → sent=${data.sent ?? false} friday=${data.fridayAnchor ?? "?"} ${data.skippedReason ?? data.error ?? ""}`,
    );
  } catch (err) {
    console.log(`[oddyssey-scheduler] weekend-recap-reminder failed: ${String(err)}`);
  }
}

// Noir Redemption Report auto-pull. The API route spawns the Playwright
// script, parses the xlsx, and persists data/oddyssey-noir/audit/latest.json
// — the same path the manual upload writes to, so the email job downstream
// reads one source of truth.
async function runNoirAuditPull() {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/oddyssey-noir/audit/pull`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: noir-audit-pull`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] noir-audit-pull → ${data.status} weekend=${data.snapshot?.result?.weekendLabel ?? "?"} owed=$${data.snapshot?.result?.totals?.promoterOwed ?? "?"} ${data.message ?? data.stage ?? ""}`,
    );
  } catch (err) {
    console.log(`[oddyssey-scheduler] noir-audit-pull failed: ${String(err)}`);
  }
}

// Noir promo report email — sends Brandon the per-promoter tally read
// from the persisted snapshot. Send route falls back to disk if no body.
async function runNoirPromoEmail() {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/oddyssey-noir/promo-report/send`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: noir-promo-email`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ test: false }),
    });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] noir-promo-email → ${data.status} subject="${data.subject ?? ""}" recipients=${(data.recipients ?? []).join(",")} ${data.message ?? ""}`,
    );
  } catch (err) {
    console.log(`[oddyssey-scheduler] noir-promo-email failed: ${String(err)}`);
  }
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Enumerate show dates for the next N days, grouped by venue. Manor
// runs Thu-Sun, Noir runs Fri-Sat.
function upcomingShowDates(daysAhead: number): Array<{ venue: "manor" | "noir"; date: string }> {
  const out: Array<{ venue: "manor" | "noir"; date: string }> = [];
  const base = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dow = d.getDay(); // 0=Sun..6=Sat
    if ([0, 4, 5, 6].includes(dow)) out.push({ venue: "manor", date: iso });
    if ([5, 6].includes(dow)) out.push({ venue: "noir", date: iso });
  }
  return out;
}

/**
 * Pre-sale pull — refresh advance pacing for every show date in the
 * next 7 days so the Monday scrum view + venue dashboards always show
 * what's on the books for the week ahead. Runs attendees CSV then
 * sessions summary for each date, sequentially, with small delays to
 * be polite to Ticketure. Idempotent — re-pulling just overwrites the
 * latest JSON + adds a new timestamped CSV (our dashboards always read
 * the latest-for-date).
 */
/**
 * Square bar-net scrape — pulls yesterday's Net Sales from the Square
 * dashboard (app.squareup.com) for both venues. Square's reporting day
 * runs 8 AM → 8 AM, so "yesterday" captures the full previous show
 * night. Auth state lives at data/.square-auth.json — refresh via
 * scripts/oddyssey-square-bootstrap.ts if sessions expire (~30–90 days).
 */
async function runSquarePulls() {
  const stamp = new Date().toISOString();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  console.log(`[oddyssey-scheduler] ${stamp} fire: square (${yesterday})`);
  const path = nodeRequire("path") as typeof import("path");
  const { spawnSync } = getChildProcess();
  for (const venue of ["manor", "noir"] as const) {
    try {
      const shCmd = `set -a; source .env.local 2>/dev/null; set +a; export PATH=/Users/white/.nvm/versions/node/v22.22.0/bin:$PATH; cd ${REPO}; npx tsx scripts/oddyssey-square-pull.ts --venue=${venue} --date=${yesterday}`;
      spawnSync("/bin/bash", ["-c", shCmd], { cwd: REPO, timeout: 120_000 });
      console.log(`[oddyssey-scheduler] square ✓ ${venue} ${yesterday}`);
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.log(`[oddyssey-scheduler] square ✗ ${venue} ${yesterday}: ${String(err)}`);
    }
  }
  void path;
}

async function runPreSalePulls() {
  const stamp = new Date().toISOString();
  const dates = upcomingShowDates(7);
  console.log(`[oddyssey-scheduler] ${stamp} fire: pre-sale (${dates.length} show dates)`);
  for (const { venue, date } of dates) {
    try {
      // Reuse the attendees wrapper script (handles env + tsx invocation).
      const { spawnSync } = getChildProcess();
      spawnSync(WRAPPER, [`--venue=${venue}`, `--date=${date}`], { cwd: REPO, timeout: 120_000 });
      // Then the sessions scrape — same shell-with-env pattern as
      // runSessionsScrape above.
      const path = nodeRequire("path") as typeof import("path");
      const shCmd = `set -a; source .env.local; set +a; export PATH=/Users/white/.nvm/versions/node/v22.22.0/bin:$PATH; cd ${REPO}; npx tsx scripts/oddyssey-sessions-pull.ts --venue=${venue} --date=${date}`;
      spawnSync("/bin/bash", ["-c", shCmd], { cwd: REPO, timeout: 120_000 });
      console.log(`[oddyssey-scheduler] pre-sale ✓ ${venue} ${date}`);
      // Light rate-limit between pulls.
      await new Promise((r) => setTimeout(r, 3000));
      void path;
    } catch (err) {
      console.log(`[oddyssey-scheduler] pre-sale ✗ ${venue} ${date}: ${String(err)}`);
    }
  }
}

export function startScheduler(): void {
  // Diagnostic: prove startScheduler() was invoked
  try {
    const fs = nodeRequire("fs") as typeof import("fs");
    const path = nodeRequire("path") as typeof import("path");
    fs.appendFileSync(
      path.join(process.cwd(), "logs/scheduler-fired.log"),
      `${new Date().toISOString()} startScheduler() pid=${process.pid} STATE.started=${STATE.started} globalThis=${typeof globalThis}\n`
    );
  } catch { /* non-fatal */ }

  if (STATE.started) return;
  STATE.started = true;
  STATE.startedAt = new Date().toISOString();

  if (!process.env.TICKETURE_EMAIL || !process.env.TICKETURE_PASSWORD) {
    console.log("[oddyssey-scheduler] skipping — TICKETURE_* env vars not set");
    return;
  }

  // Two venues, each with its own show days:
  // MANOR — Thu/Fri/Sat/Sun shows (weekdays 4,5,6,0)
  // NOIR — Fri/Sat shows (weekdays 5,6)
  //
  // Regular pulls go HOURLY during the day (was every 30 min; Keith
  // asked for hourly).
  const jobs: Array<[string, string, () => void]> = [
    // --- MANOR ---
    // Hourly 9 AM – 5 PM, Thu–Sun. Kitchen cutoff is 2:30 PM but ticket
    // sales keep coming through the afternoon, so we pull through 5 PM
    // to make the 5 PM GM briefing email up-to-date.
    ["manor-regular", "0 9-17 * * 4,5,6,0", () => runPull("manor-regular", "manor")],
    // 2:45 PM PT — kitchen-prep roster PDF, sent 45 min after the 2 PM
    // pull writes latest.csv. To: LV_EventsManagement@area15.com,
    // CC: Brandon + Keith (configured in roster-pdf/route.ts defaults).
    ["manor-roster-pdf", "45 14 * * 4,5,6,0", () => sendRosterPdf(todayLocal())],
    // 5 PM PT GM briefing email — talking points for the evening
    // Brief fires 5 min after the regular 17:00 pull so latest.csv has
    // finished writing. Same-minute race produced a 0-admission briefing
    // for Sun 4/19 (pull overwrote CSV while briefing was reading it).
    ["manor-briefing", "5 17 * * 4,5,6,0", () => sendBriefing("manor", todayLocal())],
    ["manor-postshow", "15 0 * * 5,6,0,1", () => runPull("manor-postshow", "manor", yesterdayLocal())],
    ["manor-recap", "30 0 * * 5,6,0,1", () => sendRecap("manor", yesterdayLocal())],

    // --- NOIR ---
    // Hourly 9 AM – 10 PM, Fri/Sat (captures last-minute sales as doors open)
    ["noir-regular", "0 9-22 * * 5,6", () => runPull("noir-regular", "noir")],
    // 9 PM PT GM briefing email (one hour before doors at 10 PM)
    // Same offset rationale as manor-briefing — avoid same-minute race
    // with the 21:00 regular pull.
    ["noir-briefing", "5 21 * * 5,6", () => sendBriefing("noir", todayLocal())],
    // Post-show pull at 03:00 Sat/Sun (after 2 AM close), recap at 03:15
    ["noir-postshow", "0 3 * * 6,0", () => runPull("noir-postshow", "noir", yesterdayLocal())],
    ["noir-recap", "15 3 * * 6,0", () => sendRecap("noir", yesterdayLocal())],

    // --- NOIR PROMO REPORT ---
    // Sunday 04:00 PT — pull the Redemption Report (Thu→Mon) from Ticketure
    // after Saturday's 3 AM close. Parses + persists the tally.
    ["noir-audit-pull", "0 4 * * 0", () => void runNoirAuditPull()],
    // Monday 07:45 PT — email Brandon the per-promoter tally + invoice text,
    // 15 min before the existing 08:00 weekend-recap-reminder.
    ["noir-promo-email", "45 7 * * 1", () => void runNoirPromoEmail()],

    // --- WEEKEND RECAP ---
    // Monday 8 AM PT — nudge Keith to upload MANOR P&L + NOIR Budgets workbooks.
    // Idempotent: skips once the weekend file lands on disk.
    ["weekend-recap-reminder", "0 8 * * 1", () => void runWeekendRecapReminder()],

    // --- PRE-SALE PACING ---
    // Daily 6 AM PT — scrape attendees + sessions for every show date in
    // the next 7 days so the scrum view + dashboards always show pacing
    // for the week ahead. Runs BEFORE anyone's in the office looking at
    // the board; same-day hourly pulls take over once the show arrives.
    ["pre-sale", "0 6 * * *", () => void runPreSalePulls()],

    // --- SQUARE BAR NET ---
    // Daily 8 AM PT — scrape yesterday's Square Sales Summary (8 AM PT
    // reporting day) for both venues. Auto-fills Bar NET on the scrum
    // view + detaches the GM from manually entering Square totals.
    ["square-daily", "0 8 * * *", () => void runSquarePulls()],

    // --- WEEKLY xlsx-UPDATE EMAIL ---
    // Monday 7 AM PT — Brandon gets a paste-ready "update the xlsx with
    // X and Y" email. Saves him the weekly Ticketure-Square-to-xlsx
    // scavenger hunt. Fires before the 8 AM weekend-recap reminder so
    // the numbers are already waiting when he logs in.
    ["xlsx-update-email", "0 7 * * 1", () => void runXlsxUpdateEmail()],
  ];

  for (const [name, pattern, handler] of jobs) {
    const cron = new Cron(
      pattern,
      { timezone: "America/Los_Angeles", name: `oddyssey-${name}` },
      handler
    );
    STATE.crons.push(cron);
    STATE.jobs.push({
      name,
      pattern,
      next: cron.nextRun()?.toISOString() ?? null,
    });
  }

  persistStatus();
  console.log(
    "[oddyssey-scheduler] started | manor: hourly 9-2 + postshow + recap | noir: hourly 9-9 + postshow 3am + recap"
  );
}
