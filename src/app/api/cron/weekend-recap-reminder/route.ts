import { NextResponse } from "next/server";
import { runMondayReminder } from "@/app/oddyssey-manor/admin/weekend-recap/reminder";

// Forced Node runtime — the reminder uses fs/path and only makes sense
// server-side. Invoked from the in-process scheduler (see
// src/lib/oddyssey-food/scheduler.ts) at Monday 8 AM PT, mirroring the
// same POST-to-self pattern used by the food / noir recap jobs so
// instrumentation.ts never has to statically import fs-using code.
export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await runMondayReminder();
    return NextResponse.json({ status: "ok", ...result });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// GET — lets you trigger manually from a browser for smoke-testing.
// Same behavior, same idempotency guards.
export async function GET() {
  return POST();
}
