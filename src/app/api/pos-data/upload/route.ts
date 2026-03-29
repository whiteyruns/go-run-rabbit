import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseCSV } from "@/lib/csv-parser";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "pmix" or "reservations"

  if (!file || !type) {
    return NextResponse.json({ error: "File and type required" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No data found in CSV" }, { status: 400 });
  }

  let imported = 0;

  if (type === "pmix") {
    // Map venue names to IDs
    const venues = await prisma.venue.findMany();
    const venueMap = new Map(venues.map(v => [v.name.toLowerCase(), v.id]));

    const records = rows.map(row => {
      const venueName = (row["Location"] || "").toLowerCase().trim();
      const venueId = venueMap.get(venueName);
      if (!venueId) return null;

      return {
        venueId,
        businessDate: new Date(row["Business Date"]),
        menuGroup: row["Menu Group"] || "Unknown",
        menuItem: row["Menu Item"] || "Unknown",
        spiritCategory: row["Spirit Category"] || null,
        qtySold: parseInt(row["Qty Sold"]) || 0,
        grossSales: parseFloat(row["Gross Sales"]) || 0,
        itemCost: parseFloat(row["Item Cost"]) || 0,
        netSales: parseFloat(row["Net Sales"]) || 0,
        voidQty: parseInt(row["Void Qty"]) || 0,
        compQty: parseInt(row["Comp Qty"]) || 0,
        source: "csv_upload",
      };
    }).filter(Boolean);

    if (records.length > 0) {
      await prisma.pOSRecord.createMany({ data: records as NonNullable<typeof records[0]>[] });
      imported = records.length;
    }
  } else if (type === "reservations") {
    const venues = await prisma.venue.findMany();
    const venueMap = new Map(venues.map(v => [v.name.toLowerCase(), v.id]));

    const records = rows.map(row => {
      const venueName = (row["Venue"] || "").toLowerCase().trim();
      const venueId = venueMap.get(venueName);
      if (!venueId) return null;

      return {
        venueId,
        date: new Date(row["Date"]),
        time: row["Time"] || "",
        partySize: parseInt(row["Party Size"]) || 0,
        status: row["Status"] || "Unknown",
        source: row["Source"] || "Unknown",
        guestName: row["Guest Name"] || null,
        visitCount: parseInt(row["Visit Count"]) || 1,
        lifetimeSpend: parseFloat(row["Lifetime Spend"]) || 0,
        tags: row["Tags"] || null,
        noShow: row["No Show"] === "Yes",
        dataSource: "csv_upload",
      };
    }).filter(Boolean);

    if (records.length > 0) {
      await prisma.reservationRecord.createMany({ data: records as NonNullable<typeof records[0]>[] });
      imported = records.length;
    }
  }

  return NextResponse.json({ imported, total: rows.length });
}
