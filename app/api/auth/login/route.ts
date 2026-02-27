import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/schemas/authSchemas";
import { mockDb } from "@/lib/data/mockDb";
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

        const { email, password } = result.data;

        const user = mockDb.users.findUnique({ where: { email } });
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
            role: user.role,
            profilePicture: user.profilePicture,
        };

        const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role as string });
        const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role as string });
        await setAuthCookies(accessToken, refreshToken);

        return successResponse(authUser);
    } catch (error) {
        return handleApiError(error) as NextResponse<ApiResponse<AuthUser>>;
    }
}
