import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/app/lib/auth";

/**
 * Optimistic gate for the staff area. The cookie is only a hint — a real build
 * would verify a signed session here and re-check it in the page itself. The
 * dashboard also guards on the client, so a stale cookie cannot show data.
 */
export function proxy(request: NextRequest) {
  const signedIn = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/dashboard") && !signedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Already signed in? Skip the login screen.
  if (pathname === "/admin/login" && signedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/admin") {
    return NextResponse.redirect(
      new URL(signedIn ? "/admin/dashboard" : "/admin/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
