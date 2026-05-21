import { NextResponse } from "next/server";
import type { AssignmentsMap } from "@/lib/oddyssey-food/assignments";
import {
  loadStoredAssignments,
  saveStoredAssignments,
} from "@/lib/oddyssey-food/assignments-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadStoredAssignments());
}

interface PostBody {
  map?: AssignmentsMap;
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body.map || typeof body.map !== "object") {
    return NextResponse.json(
      { status: "error", message: "Missing or invalid 'map'" },
      { status: 400 },
    );
  }

  const result = saveStoredAssignments(body.map);
  return NextResponse.json({ status: "ok", updated_at: result.updated_at });
}
