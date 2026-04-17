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

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    // Hourly 9 AM – 2 PM, Thu–Sun (Manor cutoff is 2:30 PM for kitchen)
    ["manor-regular", "0 9-14 * * 4,5,6,0", () => runPull("manor-regular", "manor")],
    // 5 PM PT GM briefing email — talking points for the evening
    ["manor-briefing", "0 17 * * 4,5,6,0", () => sendBriefing("manor", todayLocal())],
    ["manor-postshow", "15 0 * * 5,6,0,1", () => runPull("manor-postshow", "manor", yesterdayLocal())],
    ["manor-recap", "30 0 * * 5,6,0,1", () => sendRecap("manor", yesterdayLocal())],

    // --- NOIR ---
    // Hourly 9 AM – 10 PM, Fri/Sat (captures last-minute sales as doors open)
    ["noir-regular", "0 9-22 * * 5,6", () => runPull("noir-regular", "noir")],
    // 5 PM PT GM briefing email
    ["noir-briefing", "0 17 * * 5,6", () => sendBriefing("noir", todayLocal())],
    // Post-show pull at 03:00 Sat/Sun (after 2 AM close), recap at 03:15
    ["noir-postshow", "0 3 * * 6,0", () => runPull("noir-postshow", "noir", yesterdayLocal())],
    ["noir-recap", "15 3 * * 6,0", () => sendRecap("noir", yesterdayLocal())],
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
