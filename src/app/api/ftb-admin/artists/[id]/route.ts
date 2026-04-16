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
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ artist });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const data: Record<string, unknown> = {};

  for (const key of [
    "stageName",
    "realName",
    "born",
    "nationality",
    "yearsActive",
    "signature",
    "bio",
  ]) {
    if (typeof body[key] === "string") data[key] = body[key];
  }
  for (const key of [
    "genres",
    "hits",
    "albums",
    "collaborations",
    "milestones",
    "reach",
    "outreachExamples",
  ]) {
    if (Array.isArray(body[key])) data[key] = JSON.stringify(body[key]);
  }

  try {
    const artist = await prisma.artist.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ artist });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.artist.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
