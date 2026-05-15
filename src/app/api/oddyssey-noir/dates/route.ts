// Lists every date with a Noir session-summary JSON on disk.
// Drives the compare-date picker on the Noir summary page.
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const SUMMARIES_DIR = path.resolve(process.cwd(), "data/oddyssey-noir/summaries");
const DATE_RE = /^(\d{4}-\d{2}-\d{2})\.json$/;

export async function GET() {
  let entries: string[];
  try {
    entries = fs.readdirSync(SUMMARIES_DIR);
  } catch {
    return NextResponse.json({ status: "ok", dates: [] });
  }
  const dates = entries
    .map((f) => f.match(DATE_RE)?.[1])
    .filter((d): d is string => Boolean(d))
    .sort();
  return NextResponse.json({ status: "ok", dates });
}
