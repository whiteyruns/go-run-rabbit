import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const recaps = await prisma.ftbRecap.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      artist: { select: { id: true, stageName: true } },
      _count: { select: { recipients: true } },
    },
  });
  return NextResponse.json({ recaps });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    eventId,
    headliner,
    eventDate,
    eventDay,
    artistId,
    placerData,
    coverage,
    photos,
    sponsors,
    execSummary,
  } = body ?? {};

  if (!eventId || !headliner || !eventDate || !eventDay) {
    return NextResponse.json(
      { error: "eventId, headliner, eventDate, eventDay are required" },
      { status: 400 },
    );
  }

  try {
    const recap = await prisma.ftbRecap.create({
      data: {
        eventId,
        headliner,
        eventDate,
        eventDay,
        status: "draft",
        artistId: artistId || null,
        placerData: JSON.stringify(placerData ?? emptyPlacer()),
        coverage: JSON.stringify(coverage ?? defaultCoverage()),
        photos: JSON.stringify(photos ?? { gallery: [] }),
        sponsors: JSON.stringify(sponsors ?? []),
        execSummary: execSummary ? JSON.stringify(execSummary) : null,
      },
    });
    return NextResponse.json({ recap }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Create failed — eventId may already exist" },
      { status: 400 },
    );
  }
}

function emptyPlacer() {
  return {
    metrics: [],
    hourly: [],
    duration: [],
    demographics: [],
    destinations: [],
    hotels: [],
    originStates: [],
    originDMAs: [],
  };
}

function defaultCoverage() {
  return {
    hourly: false,
    duration: false,
    demographics: false,
    destinations: false,
    hotels: false,
    originStates: false,
    originDMAs: false,
  };
}
