import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth gate. The catalog and app surfaces require a signed-in session; the
 * landing, sign-in, and OAuth callback stay public. This is an optimistic
 * cookie-presence check (the cookie is only set by a real sign-in) — the actual
 * token is validated server-side wherever it matters.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/browse",
    "/browse/:path*",
    "/methods/:path*",
    "/labs/:path*",
    "/institutions/:path*",
    "/dashboard/:path*",
    "/profile",
    "/upload",
  ],
};
