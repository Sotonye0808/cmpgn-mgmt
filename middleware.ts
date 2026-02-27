import { NextRequest, NextResponse } from "next/server";
import { JWT_ACCESS_COOKIE } from "@/lib/constants";

// Edge runtime does NOT support `jsonwebtoken` (Node.js-only).
// Middleware is a routing guard only — actual cryptographic signature
// verification happens in lib/middleware/auth.ts on the Node.js side.
// Here we just decode the payload and check `exp` to catch obvious
// expired/malformed tokens while routing. Forgery is caught by the API layer.
function isTokenStructurallyValid(token: string): boolean {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
        ) as { exp?: number };
        if (payload.exp && payload.exp * 1000 < Date.now()) return false;
        return true;
    } catch {
        return false;
    }
}

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

    // Protect API routes — return JSON 401, do NOT redirect (clients expect JSON)
    if (pathname.startsWith("/api")) {
        const token = request.cookies.get(JWT_ACCESS_COOKIE)?.value;
        if (!token || !isTokenStructurallyValid(token)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
    }

    // Protect dashboard page routes — redirect to login
    const PROTECTED_PAGES = [
        "/dashboard", "/campaigns", "/analytics", "/users",
        "/donations", "/leaderboard", "/settings", "/trust-review",
        "/links", "/team",
    ];
    if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        const token = request.cookies.get(JWT_ACCESS_COOKIE)?.value;
        if (!token || !isTokenStructurallyValid(token)) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
