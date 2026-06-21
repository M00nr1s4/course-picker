import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (req.nextUrl.pathname.startsWith("/admin") && (token as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) return true;
        return (token as any)?.role === "ADMIN";
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
