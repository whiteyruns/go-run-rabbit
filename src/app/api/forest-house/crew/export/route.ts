import { NextRequest, NextResponse } from "next/server";
import { readAllCrew } from "@/lib/forest-house/storage";
import { isFhAdminFromRequest } from "@/lib/forest-house/fh-auth";
import { crewToCsv } from "@/lib/forest-house/csv";

export const runtime = "nodejs";

function filenameDate(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export async function GET(request: NextRequest) {
  if (!(await isFhAdminFromRequest(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const crew = await readAllCrew();
    const csv = crewToCsv(crew);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="foresthouse-crew-${filenameDate()}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}
