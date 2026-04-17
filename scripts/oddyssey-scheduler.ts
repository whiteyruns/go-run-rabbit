/**
 * Oddyssey Manor auto-pull scheduler.
 *
 * Long-running Node process that schedules Ticketure CSV pulls via croner.
 * Start on the Mac Mini via nohup; it will stay alive and trigger the
 * wrapper script on the configured cadence.
 *
 * Usage:
 *   nohup npx tsx scripts/oddyssey-scheduler.ts \
 *     > logs/oddyssey-scheduler.log 2>&1 &
 *
 * Logs every fire to stdout. Missed intervals are not backfilled — if the
 * Mac Mini is rebooted, the next scheduled slot runs as normal.
 */
import { Cron } from "croner";
import { spawn } from "child_process";
import path from "path";

const REPO = path.resolve(__dirname, "..");
const WRAPPER = path.join(REPO, "scripts/oddyssey-food-pull.sh");

function runPull(label: string, dateArg?: string) {
  const args: string[] = [];
  if (dateArg) args.push(`--date=${dateArg}`);
  console.log(`[scheduler] [${new Date().toISOString()}] fire: ${label}${dateArg ? ` (${dateArg})` : ""}`);
  const proc = spawn(WRAPPER, args, { cwd: REPO });
  proc.stdout.on("data", (d) => process.stdout.write(d));
  proc.stderr.on("data", (d) => process.stderr.write(d));
  proc.on("close", (code) =>
    console.log(`[scheduler] [${new Date().toISOString()}] ${label} exited ${code}`)
  );
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

// Every 30 min, 9 AM - 2:30 PM, Thursday through Sunday (local time).
// Cron: "0,30 9-14 * * 4,5,6,0"
new Cron(
  "0,30 9-14 * * 4,5,6,0",
  { timezone: "America/Los_Angeles", name: "regular" },
  () => runPull("regular")
);

// Post-show final pull at 00:15 AM Fri/Sat/Sun/Mon, with yesterday's date
// (to capture ticket_state updates after service).
new Cron(
  "15 0 * * 5,6,0,1",
  { timezone: "America/Los_Angeles", name: "postshow" },
  () => runPull("postshow", yesterdayLocal())
);

console.log(
  `[scheduler] started at ${new Date().toISOString()} — schedules:` +
    `\n  regular   = 0,30 9-14 * * Thu,Fri,Sat,Sun (America/Los_Angeles)` +
    `\n  postshow  = 15 0 * * Fri,Sat,Sun,Mon (yesterday's date)`
);

// Keep the process alive (Cron holds its own handles, but belt+suspenders)
setInterval(() => {}, 1 << 30);
