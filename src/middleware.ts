import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret"
);

const PUBLIC_PATHS = ["/", "/login", "/pitch", "/basin-and-range", "/apache-springs", "/canyon-expedition", "/oddyssey-manor", "/corner-bar-management", "/efd-outbound-overview", "/doberman-outreach", "/feed-the-block", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
