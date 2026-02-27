import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/utils/jwt";
import { JWT_ACCESS_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = ["/", "/login", "/register", "/c/"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/c/"))) {
        return NextResponse.next();
    }

    // Allow API auth routes without auth
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Check auth for dashboard and API routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/campaigns") || pathname.startsWith("/api")) {
        const token = request.cookies.get(JWT_ACCESS_COOKIE)?.value;
        if (!token) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
