import { NextRequest, NextResponse } from "next/server";
import { isFhAdminFromRequest } from "@/lib/forest-house/fh-auth";
import {
  readRunOfShow,
  writeRunOfShow,
} from "@/lib/forest-house/run-of-show-storage";
import { isKnownEventSlug } from "@/lib/forest-house/run-of-show-seed";
import { RunOfShowDataSchema } from "@/lib/forest-house/run-of-show-data";

export const runtime = "nodejs";

function stampNow(): string {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  if (!(await isFhAdminFromRequest(request))) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (!isKnownEventSlug(params.slug)) {
    return NextResponse.json(
      { ok: false, error: "Unknown event" },
      { status: 404 },
    );
  }
  try {
    const data = await readRunOfShow(params.slug);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Read failed" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  if (!(await isFhAdminFromRequest(request))) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  if (!isKnownEventSlug(params.slug)) {
    return NextResponse.json(
      { ok: false, error: "Unknown event" },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = RunOfShowDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const stamped = { ...parsed.data, lastUpdated: stampNow() };

  try {
    await writeRunOfShow(params.slug, stamped);
    return NextResponse.json({ ok: true, data: stamped });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Write failed" },
      { status: 500 },
    );
  }
}
