import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/home", "/gyms", "/articles", "/admins", "/notifications"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/gyms/:path*", "/articles/:path*"], 
};
