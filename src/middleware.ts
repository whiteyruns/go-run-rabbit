import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret"
);

const PUBLIC_PATHS = ["/", "/login", "/pitch", "/basin-and-range", "/apache-springs", "/canyon-expedition", "/corner-bar-management", "/efd-outbound-overview", "/doberman-outreach", "/feed-the-block", "/forest-house", "/tsp-trk", "/recap/ftb", "/recap/ftb-editorial", "/api/auth/login", "/api/webhooks"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Oddyssey engagement decommissioned (2026-06-03, Brandon offboarded).
  // Take the entire Go Run Rabbit-hosted Oddyssey tree offline — brand
  // wireframe, Manor/Noir flagship builds, pitch/audit decks, and the
  // now-defunct admin/ops tools. 404 the whole tree. Reversible: delete
  // this block. NOTE: the client's real venue site (oddysseylv.com) is a
  // separate property and is intentionally untouched. /api/oddyssey-*
  // backends are not matched (they start with /api).
  if (
    pathname === "/oddyssey" ||
    pathname.startsWith("/oddyssey/") ||
    pathname.startsWith("/oddyssey-manor") ||
    pathname.startsWith("/oddyssey-noir")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // Public routes — no auth needed
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // API routes that handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Static assets
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Everything else requires auth
  const token = request.cookies.get("grr-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Client users can only access /client routes
    if (pathname.startsWith("/dashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/client/overview", request.url));
    }

    // Admin users can access everything
    return NextResponse.next();
  } catch {
    // Invalid token — redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("grr-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo|hero|og-image|poster|apple-touch).*)"],
};
