import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth gate. Only personal + write surfaces require a signed-in session:
 * the dashboard, profile editor, and upload. Everything public-facing is open
 * so a Codon badge can "travel" into any README or paper and anyone — a
 * journal, reviewer, or reader — can follow it without an account: the landing,
 * sign-in/OAuth callback, the catalog (/browse), method detail + verification
 * reports (/methods/*), lab and institution pages (/labs/*, /institutions/*),
 * public profiles (/u/*), and the live badge SVG. This is an optimistic
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
    "/dashboard/:path*",
    "/profile",
    "/upload",
  ],
};
