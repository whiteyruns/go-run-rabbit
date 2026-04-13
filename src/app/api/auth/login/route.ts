import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "cbm2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  if (password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createToken({
    userId: "cbm-admin",
    email: "admin@gorunrabbit.com",
    role: "admin",
  });

  const response = NextResponse.json({
    user: { id: "cbm-admin", name: "CBM Admin", email: "admin@gorunrabbit.com", role: "admin" },
  });

  response.cookies.set("grr-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
