import { NextRequest, NextResponse } from "next/server";
import {
  createFhAdminToken,
  FH_ADMIN_COOKIE,
  FH_ADMIN_COOKIE_MAX_AGE,
} from "@/lib/forest-house/fh-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expected = process.env.FH_ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "FH_ADMIN_PASSWORD not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? (body as { password: unknown }).password
      : undefined;

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Password required" },
      { status: 400 },
    );
  }

  if (password !== expected) {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 },
    );
  }

  const token = await createFhAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(FH_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: FH_ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
