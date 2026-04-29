import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret",
);

export const FH_ADMIN_COOKIE = "fh-admin-token";
export const FH_ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const SCOPE = "forest-house-admin";
const ROS_SCOPE = "forest-house-ros";

interface FhAdminPayload {
  scope: typeof SCOPE;
}

interface FhRosPayload {
  scope: typeof ROS_SCOPE;
}

export const FH_ROS_COOKIE = "fh-ros-token";
export const FH_ROS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

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

export async function createFhRosToken(): Promise<string> {
  const payload: FhRosPayload = { scope: ROS_SCOPE };
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

async function verifyFhRosToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as unknown as FhRosPayload).scope === ROS_SCOPE;
  } catch {
    return false;
  }
}

// Admin cookie also satisfies ROS — admins shouldn't get gated on a public
// view of their own data.
export async function isFhRosFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  if (await isFhAdminFromCookies()) return true;
  const token = cookieStore.get(FH_ROS_COOKIE)?.value;
  if (!token) return false;
  return verifyFhRosToken(token);
}
