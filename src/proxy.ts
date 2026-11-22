import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, pickLocale } from "@/lib/i18n";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin: optimistic check here, every page and action checks again on the server.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public site: every page lives under /en or /fr.
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const locale = pickLocale(request.headers.get("accept-language"), request.cookies.get(LOCALE_COOKIE)?.value);
  const url = new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
