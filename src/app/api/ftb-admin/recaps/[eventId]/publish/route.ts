import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = body?.action === "unpublish" ? "unpublish" : "publish";

  try {
    const recap = await prisma.ftbRecap.update({
      where: { eventId: params.eventId },
      data:
        action === "publish"
          ? { status: "published", publishedAt: new Date() }
          : { status: "draft" },
    });
    return NextResponse.json({ recap });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
