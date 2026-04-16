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
  const groups = await prisma.ftbRecipientGroup.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, emails } = await req.json();
  if (!name || !Array.isArray(emails)) {
    return NextResponse.json(
      { error: "name + emails[] required" },
      { status: 400 },
    );
  }
  try {
    const group = await prisma.ftbRecipientGroup.create({
      data: { name, emails: JSON.stringify(emails) },
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Create failed — name may already exist" },
      { status: 400 },
    );
  }
}
