/**
 * Next.js server-lifecycle hook — runs once when the server boots.
 * Used to start background schedulers that share the Next.js process.
 */
export async function register() {
  // Write a diagnostic marker so we can tell register() actually fired,
  // even if console output is swallowed by nohup/ssh redirection quirks.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const req = eval("require") as NodeRequire;
    const fs = req("fs") as typeof import("fs");
    const path = req("path") as typeof import("path");
    const marker = path.join(process.cwd(), "logs/instrumentation-fired.log");
    fs.appendFileSync(
      marker,
      `${new Date().toISOString()} register() NEXT_RUNTIME=${process.env.NEXT_RUNTIME ?? "unset"} cwd=${process.cwd()}\n`
    );
  } catch { /* non-fatal */ }

  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  await import("@/lib/oddyssey-food/scheduler").then((m) => m.startScheduler());
}
