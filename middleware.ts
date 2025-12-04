import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Contoh: Mengarahkan pengguna yang terautentikasi dari halaman login/register ke dashboard
    if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
      if (req.nextauth.token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Contoh: Melindungi rute dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
