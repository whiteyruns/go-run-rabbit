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

function runPull(label: string, dateArg?: string) {
  const args: string[] = [];
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
  proc.on("close", (code: number | null) =>
    console.log(`[oddyssey-scheduler] ${label} exited ${code}`)
  );
}

async function sendRecap(dateArg: string) {
  const port = process.env.PORT ?? "3102";
  const url = `http://localhost:${port}/api/oddyssey-food/recap`;
  const stamp = new Date().toISOString();
  console.log(`[oddyssey-scheduler] ${stamp} fire: recap (${dateArg})`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: dateArg }),
    });
    const data = await res.json();
    console.log(
      `[oddyssey-scheduler] recap → ${data.status} ${data.subject ?? ""} → ${(data.recipients ?? []).join(", ")} ${data.resend_id ? `(${data.resend_id})` : data.message ?? ""}`
    );
  } catch (e) {
    console.log(`[oddyssey-scheduler] recap failed: ${String(e)}`);
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

  const regular = new Cron(
    "0,30 9-14 * * 4,5,6,0",
    { timezone: "America/Los_Angeles", name: "oddyssey-regular" },
    () => runPull("regular")
  );
  STATE.crons.push(regular);
  STATE.jobs.push({
    name: "regular",
    pattern: "0,30 9-14 * * 4,5,6,0",
    next: regular.nextRun()?.toISOString() ?? null,
  });

  const postshow = new Cron(
    "15 0 * * 5,6,0,1",
    { timezone: "America/Los_Angeles", name: "oddyssey-postshow" },
    () => runPull("postshow", yesterdayLocal())
  );
  STATE.crons.push(postshow);
  STATE.jobs.push({
    name: "postshow",
    pattern: "15 0 * * 5,6,0,1",
    next: postshow.nextRun()?.toISOString() ?? null,
  });

  // Recap email at 00:30 PT — 15 min after the post-show pull lands,
  // so we send the full-night final numbers to Keith + Brandon.
  const recap = new Cron(
    "30 0 * * 5,6,0,1",
    { timezone: "America/Los_Angeles", name: "oddyssey-recap" },
    () => sendRecap(yesterdayLocal())
  );
  STATE.crons.push(recap);
  STATE.jobs.push({
    name: "recap",
    pattern: "30 0 * * 5,6,0,1",
    next: recap.nextRun()?.toISOString() ?? null,
  });

  persistStatus();
  console.log(
    "[oddyssey-scheduler] started | regular 9am-2:30pm PT Thu-Sun | postshow 00:15 PT | recap 00:30 PT Fri-Mon"
  );
}
