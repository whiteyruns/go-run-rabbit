import { NextResponse } from "next/server";
import { loadNotes, saveNotes } from "@/lib/oddyssey-sessions/notes-store";

export const runtime = "nodejs";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? todayLocal();
  return NextResponse.json(loadNotes("noir", date));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { date?: string; notes?: string };
  const date = body.date ?? todayLocal();
  const notes = body.notes ?? "";
  return NextResponse.json(saveNotes("noir", date, notes));
}
