import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { aggregateTicketsCSV } from "@/lib/tickets-aggregator";

export const runtime = "nodejs";

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

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
  });
  if (!recap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return NextResponse.json({ error: "Couldn't read CSV" }, { status: 400 });
  }

  const aggregate = aggregateTicketsCSV(csvText);
  if (aggregate.totalOrders === 0) {
    return NextResponse.json(
      {
        error:
          "No order rows found — confirm the CSV header includes 'Order#' on row 6.",
      },
      { status: 400 },
    );
  }

  await prisma.ftbRecap.update({
    where: { eventId: params.eventId },
    data: { tickets: JSON.stringify(aggregate) },
  });

  return NextResponse.json({ tickets: aggregate });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.ftbRecap.update({
    where: { eventId: params.eventId },
    data: { tickets: null },
  });
  return NextResponse.json({ ok: true });
}
