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

let started = false;
let startedAt: string | null = null;
const scheduled: { name: string; pattern: string; next: string | null }[] = [];

export function getSchedulerStatus() {
  return {
    started,
    started_at: startedAt,
    env_ok: Boolean(process.env.TICKETURE_EMAIL && process.env.TICKETURE_PASSWORD),
    jobs: scheduled,
  };
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

export function startScheduler(): void {
  if (started) return;
  started = true;
  startedAt = new Date().toISOString();

  if (!process.env.TICKETURE_EMAIL || !process.env.TICKETURE_PASSWORD) {
    console.log(
      "[oddyssey-scheduler] skipping — TICKETURE_* env vars not set"
    );
    return;
  }

  const regular = new Cron(
    "0,30 9-14 * * 4,5,6,0",
    { timezone: "America/Los_Angeles", name: "oddyssey-regular" },
    () => runPull("regular")
  );
  scheduled.push({
    name: "regular",
    pattern: "0,30 9-14 * * 4,5,6,0",
    next: regular.nextRun()?.toISOString() ?? null,
  });

  const postshow = new Cron(
    "15 0 * * 5,6,0,1",
    { timezone: "America/Los_Angeles", name: "oddyssey-postshow" },
    () => runPull("postshow", yesterdayLocal())
  );
  scheduled.push({
    name: "postshow",
    pattern: "15 0 * * 5,6,0,1",
    next: postshow.nextRun()?.toISOString() ?? null,
  });

  console.log(
    "[oddyssey-scheduler] started " +
      "| regular: every 30 min 9am–2:30pm PT Thu–Sun " +
      "| postshow: 00:15 PT Fri/Sat/Sun/Mon"
  );
}
