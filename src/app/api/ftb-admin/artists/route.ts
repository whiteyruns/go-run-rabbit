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
  const artists = await prisma.artist.findMany({
    orderBy: { stageName: "asc" },
  });
  return NextResponse.json({ artists });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    stageName,
    realName,
    born = "",
    nationality,
    yearsActive,
    signature = "",
    bio,
    genres = [],
    hits = [],
    albums = [],
    collaborations = [],
    milestones = [],
    reach = [],
    outreachExamples = [],
  } = body ?? {};

  if (!stageName || !realName || !nationality || !yearsActive || !bio) {
    return NextResponse.json(
      { error: "stageName, realName, nationality, yearsActive, bio are required" },
      { status: 400 },
    );
  }

  const artist = await prisma.artist.create({
    data: {
      stageName,
      realName,
      born,
      nationality,
      yearsActive,
      signature,
      bio,
      genres: JSON.stringify(genres),
      hits: JSON.stringify(hits),
      albums: JSON.stringify(albums),
      collaborations: JSON.stringify(collaborations),
      milestones: JSON.stringify(milestones),
      reach: JSON.stringify(reach),
      outreachExamples: JSON.stringify(outreachExamples),
    },
  });

  return NextResponse.json({ artist }, { status: 201 });
}
