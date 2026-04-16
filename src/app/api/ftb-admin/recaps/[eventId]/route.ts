import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
    include: { artist: true, recipients: true },
  });
  if (!recap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ recap });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const data: Record<string, unknown> = {};

  for (const k of ["headliner", "eventDate", "eventDay"]) {
    if (typeof body[k] === "string") data[k] = body[k];
  }
  if ("artistId" in body) data.artistId = body.artistId || null;
  for (const k of ["placerData", "coverage", "photos", "sponsors"]) {
    if (body[k] !== undefined) data[k] = JSON.stringify(body[k]);
  }
  if ("execSummary" in body) {
    data.execSummary = body.execSummary ? JSON.stringify(body.execSummary) : null;
  }

  try {
    const recap = await prisma.ftbRecap.update({
      where: { eventId: params.eventId },
      data,
    });
    return NextResponse.json({ recap });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.ftbRecap.delete({ where: { eventId: params.eventId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
