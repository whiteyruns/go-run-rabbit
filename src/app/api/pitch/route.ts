import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Public access by token (for pitch pages)
  if (token) {
    const link = await prisma.pitchLink.findUnique({ where: { token } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (new Date() > new Date(link.expiresAt)) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 });
    }
    // Increment view count
    await prisma.pitchLink.update({
      where: { token },
      data: { viewCount: { increment: 1 }, lastViewed: new Date() },
    });
    return NextResponse.json({ link });
  }

  // Admin list all links
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const links = await prisma.pitchLink.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, brandName, category, venueIds, expiresInDays } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

  const link = await prisma.pitchLink.create({
    data: {
      title,
      brandName: brandName || null,
      category: category || null,
      venueIds: venueIds ? JSON.stringify(venueIds) : null,
      expiresAt,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.pitchLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
