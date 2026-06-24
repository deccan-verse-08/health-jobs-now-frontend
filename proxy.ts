import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "hjn_token";

const PROTECTED_PREFIXES = ["/post-job", "/employer", "/profile"];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname + (search || ""));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Match all paths except static assets and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
