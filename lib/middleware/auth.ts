import { cookies } from "next/headers";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../prisma";
import { JWT_ACCESS_COOKIE } from "../constants";
import { errorResponse, forbiddenResponse, unauthorizedResponse } from "../utils/api";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(JWT_ACCESS_COOKIE)?.value;
        if (!token) return null;

        const payload = verifyAccessToken(token);
        if (!payload) return null;

        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.isActive) return null;

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            profilePicture: user.profilePicture ?? undefined,
            whatsappNumber: user.whatsappNumber ?? undefined,
        };
    } catch {
        return null;
    }
}

export async function requireAuth(): Promise<
    { user: AuthUser; error: null } | { user: null; error: NextResponse }
> {
    const user = await getAuthenticatedUser();
    if (!user) return { user: null, error: unauthorizedResponse() };
    return { user, error: null };
}

export async function requireRole(
    allowedRoles: string[]
): Promise<{ user: AuthUser; error: null } | { user: null; error: NextResponse }> {
    const user = await getAuthenticatedUser();
    if (!user) return { user: null, error: unauthorizedResponse() };
    if (!allowedRoles.includes(user.role as string)) {
        return { user: null, error: forbiddenResponse() };
    }
    return { user, error: null };
}

export { errorResponse };
