import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.pipelineDeal.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ deals });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brandName, category, tier, status, value, contactName, contactEmail, notes, venues, nextAction, nextActionDate } = body;

  if (!brandName || !category) {
    return NextResponse.json({ error: "Brand name and category required" }, { status: 400 });
  }

  const deal = await prisma.pipelineDeal.create({
    data: {
      brandName,
      category,
      tier: tier || "supporting",
      status: status || "prospect",
      value: value ? parseFloat(value) : null,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      notes: notes || null,
      venues: venues ? JSON.stringify(venues) : null,
      nextAction: nextAction || null,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
    },
  });

  return NextResponse.json({ deal }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "Deal ID required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (data.brandName !== undefined) updateData.brandName = data.brandName;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tier !== undefined) updateData.tier = data.tier;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.value !== undefined) updateData.value = data.value ? parseFloat(data.value) : null;
  if (data.contactName !== undefined) updateData.contactName = data.contactName || null;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.venues !== undefined) updateData.venues = data.venues ? JSON.stringify(data.venues) : null;
  if (data.nextAction !== undefined) updateData.nextAction = data.nextAction || null;
  if (data.nextActionDate !== undefined) updateData.nextActionDate = data.nextActionDate ? new Date(data.nextActionDate) : null;

  const deal = await prisma.pipelineDeal.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ deal });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Deal ID required" }, { status: 400 });
  }

  await prisma.pipelineDeal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
