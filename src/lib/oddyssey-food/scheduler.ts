import { Cron } from "croner";
import { spawn } from "child_process";
import path from "path";

// Runs inside the Next.js server process (see src/instrumentation.ts).
// Croner holds its own timers; no extra process management needed.

const REPO = process.cwd();
const WRAPPER = path.join(REPO, "scripts/oddyssey-food-pull.sh");

let started = false;

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
  const proc = spawn(WRAPPER, args, { cwd: REPO });
  proc.stdout.on("data", (d) =>
    process.stdout.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.stderr.on("data", (d) =>
    process.stderr.write(`[oddyssey-scheduler/${label}] ${d}`)
  );
  proc.on("close", (code) =>
    console.log(`[oddyssey-scheduler] ${label} exited ${code}`)
  );
}

export function startScheduler(): void {
  if (started) return;
  started = true;

  // Only schedule when the Ticketure env is present — otherwise there's
  // nothing to pull and we avoid noisy failures in dev.
  if (!process.env.TICKETURE_EMAIL || !process.env.TICKETURE_PASSWORD) {
    console.log(
      "[oddyssey-scheduler] skipping — TICKETURE_* env vars not set"
    );
    return;
  }

  // Every 30 min, 9 AM – 2:30 PM PT, Thu/Fri/Sat/Sun
  new Cron(
    "0,30 9-14 * * 4,5,6,0",
    { timezone: "America/Los_Angeles", name: "oddyssey-regular" },
    () => runPull("regular")
  );

  // 00:15 AM Fri/Sat/Sun/Mon — post-show pull with yesterday's date
  new Cron(
    "15 0 * * 5,6,0,1",
    { timezone: "America/Los_Angeles", name: "oddyssey-postshow" },
    () => runPull("postshow", yesterdayLocal())
  );

  console.log(
    "[oddyssey-scheduler] started " +
      "| regular: every 30 min 9am–2:30pm PT Thu–Sun " +
      "| postshow: 00:15 PT Fri/Sat/Sun/Mon"
  );
}
