import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    verifyRefreshToken,
    signAccessToken,
    signRefreshToken,
    setAuthCookies,
} from "@/lib/utils/jwt";
import { prisma } from "@/lib/prisma";
import { JWT_REFRESH_COOKIE } from "@/lib/constants";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import type { ApiResponse } from "@/types/api";

/**
 * POST /api/auth/refresh
 *
 * Silently rotates the access + refresh token pair using the httpOnly refresh
 * cookie.  Client calls this when /api/auth/me returns 401 while the browser
 * session is still alive (i.e. the access cookie expired but the refresh cookie
 * hasn't yet been cleared).
 *
 * The `rem` claim embedded in the refresh JWT is used to decide whether the new
 * cookies should be persistent (rememberMe) or session-scoped.
 */
export async function POST(_req: NextRequest): Promise<NextResponse<ApiResponse<AuthUser>>> {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get(JWT_REFRESH_COOKIE)?.value;
        if (!refreshToken) return unauthorizedResponse("No refresh token");

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) return unauthorizedResponse("Refresh token invalid or expired");

        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.isActive) return unauthorizedResponse("User not found or inactive");

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            profilePicture: user.profilePicture ?? undefined,
        };

        const rememberMe = payload.rem ?? false;
        const tokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role as string,
            rem: rememberMe,
        };

        const newAccess = signAccessToken(tokenPayload);
        const newRefresh = signRefreshToken(tokenPayload);
        await setAuthCookies(newAccess, newRefresh, rememberMe);

        return successResponse(authUser);
    } catch (error) {
        return handleApiError(error) as NextResponse<ApiResponse<AuthUser>>;
    }
}
