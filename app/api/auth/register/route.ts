import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "@/lib/constants";
import { registerSchema } from "@/lib/schemas/authSchemas";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/utils/jwt";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/utils/api";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthUser>>> {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return badRequestResponse(result.error.errors[0].message);
        }

        const { email, password, firstName, lastName, whatsappNumber } = result.data;

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return badRequestResponse("An account with this email already exists");
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    role: "USER" as never,
                    trustScore: 100,
                    isActive: true,
                    ...(whatsappNumber && { whatsappNumber }),
                },
            });

            await tx.trustScore.create({
                data: {
                    userId: newUser.id,
                    score: 100,
                    flags: [],
                },
            });

            return newUser;
        });

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            profilePicture: user.profilePicture ?? undefined,
            whatsappNumber: user.whatsappNumber ?? undefined,
        };

        const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role as string });
        const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role as string });
        await setAuthCookies(accessToken, refreshToken, true); // new signups stay logged in

        return successResponse(authUser, 201);
    } catch (error) {
        return handleApiError(error) as NextResponse<ApiResponse<AuthUser>>;
    }
}
