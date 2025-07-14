// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode("supersecretKey");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/tai-khoan/admin-login", request.url)
      );
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);

      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/quan-ly")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
      return NextResponse.redirect(
        new URL(
          `/tai-khoan/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          request.url
        )
      );
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch {
      const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
      return NextResponse.redirect(
        new URL(
          `/tai-khoan/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

// 👇 Đây là phần config
export const config = {
  matcher: ["/admin/:path*", "/quan-ly/:path*"],
};
