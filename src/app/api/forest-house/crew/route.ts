import { NextRequest, NextResponse } from "next/server";
import { RegistrationInputSchema } from "@/lib/forest-house/schema";
import { readAllCrew, upsertCrew } from "@/lib/forest-house/storage";
import { isFhAdminFromRequest } from "@/lib/forest-house/fh-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isFhAdminFromRequest(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const crew = await readAllCrew();
    return NextResponse.json({ crew });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Read failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Honeypot: if the hidden 'website' field is populated, silently reject as a
  // validation failure without writing anything.
  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    typeof (body as { website: unknown }).website === "string" &&
    (body as { website: string }).website.trim().length > 0
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid submission" },
      { status: 400 },
    );
  }

  const parsed = RegistrationInputSchema.safeParse(body);
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

  try {
    const { record, created } = await upsertCrew(parsed.data);
    return NextResponse.json({ ok: true, record }, { status: created ? 201 : 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Write failed" },
      { status: 500 },
    );
  }
}
