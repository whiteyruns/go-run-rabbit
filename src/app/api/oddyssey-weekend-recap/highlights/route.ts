import { NextResponse } from "next/server";
import { isValidDate, saveWeekendHighlights } from "@/app/oddyssey-manor/admin/weekend-recap/lib";

export const runtime = "nodejs";

interface Body {
  weekendOf?: string;      // Friday anchor, YYYY-MM-DD
  highlights?: string;     // freeform text; empty string clears
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const fri = body.weekendOf ?? "";
  const text = typeof body.highlights === "string" ? body.highlights : "";
  if (!isValidDate(fri)) {
    return NextResponse.json(
      { status: "error", message: "weekendOf must be YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (text.length > 4000) {
    return NextResponse.json(
      { status: "error", message: "highlights must be ≤ 4000 characters" },
      { status: 400 },
    );
  }
  try {
    await saveWeekendHighlights(fri, text);
    return NextResponse.json({ status: "ok", weekendOf: fri });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
