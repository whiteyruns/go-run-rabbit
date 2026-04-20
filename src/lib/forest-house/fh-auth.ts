import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret",
);

export const FH_ADMIN_COOKIE = "fh-admin-token";
export const FH_ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const SCOPE = "forest-house-admin";

interface FhAdminPayload {
  scope: typeof SCOPE;
}

export async function createFhAdminToken(): Promise<string> {
  const payload: FhAdminPayload = { scope: SCOPE };
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyFhAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as unknown as FhAdminPayload).scope === SCOPE;
  } catch {
    return false;
  }
}

export async function isFhAdminFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FH_ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyFhAdminToken(token);
}

export async function isFhAdminFromRequest(
  request: NextRequest,
): Promise<boolean> {
  const token = request.cookies.get(FH_ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyFhAdminToken(token);
}
