/**
 * Next.js server-lifecycle hook — runs once when the server boots.
 * Used to start background schedulers that share the Next.js process.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Start the Oddyssey food auto-pull scheduler
  await import("@/lib/oddyssey-food/scheduler").then((m) => m.startScheduler());
}
