import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|static|.*\\..*|_next/static|auth_callback|_next/image|favicon.ico).*)",
  ],
};

export function middleware(request: NextRequest) {
  // Password-protect the dashboard via HTTP Basic Auth
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const authHeader = request.headers.get("authorization");
    const password = process.env.DASHBOARD_PASSWORD;

    const isAuthorized = !!password && (() => {
      if (!authHeader?.startsWith("Basic ")) return false;
      const decoded = atob(authHeader.slice(6));
      const providedPassword = decoded.split(":").slice(1).join(":");
      return providedPassword === password;
    })();

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
      });
    }
  }

  // Check if locale is present in request URL and matches the one in the NEXT_LOCALE cookie
  const urlLocale = request.nextUrl.locale;
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  // Redirect to the cookie locale if the URL locale doesn't match it
  if (urlLocale && cookieLocale && urlLocale !== cookieLocale) {
    const newUrl = request.url.replace(`/${urlLocale}`, `/${cookieLocale}`);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}
