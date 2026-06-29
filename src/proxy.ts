import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth gate. Personal + write surfaces (dashboard, profile, upload) and the
 * rest of the catalog browse experience require a signed-in session. Public:
 * the landing, sign-in/OAuth callback, public profiles (/u/*), the live badge
 * SVG, and — so a Codon badge can "travel" into any README or paper — method
 * detail and verification reports (/methods/*). This is an optimistic
 * cookie-presence check (the cookie is only set by a real sign-in); the actual
 * token is validated server-side wherever it matters, and license/run actions
 * still require a real session.
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
    "/labs/:path*",
    "/institutions/:path*",
    "/dashboard/:path*",
    "/profile",
    "/upload",
  ],
};
