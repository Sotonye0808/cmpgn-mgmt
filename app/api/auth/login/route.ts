import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/schemas/authSchemas";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/utils/jwt";
import {
    successResponse,
    badRequestResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthUser>>> {
    try {
        const body = await request.json();
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return badRequestResponse(result.error.errors[0].message);
        }

        const { email, password, rememberMe } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return unauthorizedResponse("Invalid email or password");
        }

        if (!user.isActive) {
            return unauthorizedResponse("Account is deactivated");
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return unauthorizedResponse("Invalid email or password");
        }

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            profilePicture: user.profilePicture ?? undefined,
            whatsappNumber: user.whatsappNumber ?? undefined,
        };

        const tokenPayload = { sub: user.id, email: user.email, role: user.role as string, rem: rememberMe };
        const accessToken = signAccessToken(tokenPayload);
        const refreshToken = signRefreshToken(tokenPayload);
        await setAuthCookies(accessToken, refreshToken, rememberMe);

        return successResponse(authUser);
    } catch (error) {
        return handleApiError(error) as NextResponse<ApiResponse<AuthUser>>;
    }
}
