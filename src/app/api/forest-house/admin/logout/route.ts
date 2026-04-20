import { NextResponse } from "next/server";
import { FH_ADMIN_COOKIE } from "@/lib/forest-house/fh-auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(FH_ADMIN_COOKIE);
  return response;
}
