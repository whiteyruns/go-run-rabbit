import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const STATUS_FILE = path.resolve(process.cwd(), "data/oddyssey-food/scheduler-status.json");

export async function GET() {
  let onDisk: Record<string, unknown> = {};
  try {
    onDisk = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
  } catch {
    onDisk = { started: false, started_at: null, jobs: [] };
  }
  return NextResponse.json({
    ...onDisk,
    env_ok: Boolean(process.env.TICKETURE_EMAIL && process.env.TICKETURE_PASSWORD),
  });
}
