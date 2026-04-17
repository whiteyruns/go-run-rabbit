import { NextResponse } from "next/server";
import { getSchedulerStatus } from "@/lib/oddyssey-food/scheduler";

export async function GET() {
  return NextResponse.json(getSchedulerStatus());
}
