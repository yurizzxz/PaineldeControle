import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/home", "/gyms", "/articles", "/admins", "/notifications"];

export function middleware(request: NextRequest) {
  console.log("Request URL:", request.url);
  console.log("Request Pathname:", request.nextUrl.pathname);
  
  const token = request.cookies.get("authToken")?.value;
  console.log("Token:", token);

  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/home/:path*", "/admins/:path*", "/gyms/:path*", "/articles/:path*", "/notifications/:path*"],
};
