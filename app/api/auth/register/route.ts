import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "@/lib/constants";
import { registerSchema } from "@/lib/schemas/authSchemas";
import { mockDb } from "@/lib/data/mockDb";
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

        const { email, password, firstName, lastName } = result.data;

        // Check if email already exists
        const existing = mockDb.users.findUnique({ where: { email } });
        if (existing) {
            return badRequestResponse("An account with this email already exists");
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const user = await mockDb.transaction(async (tx) => {
            const newUser = tx.users.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    role: "USER" as unknown as UserRole,
                    trustScore: 100,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            });

            tx.trustScores.create({
                data: {
                    userId: newUser.id,
                    score: 100,
                    flags: [],
                    updatedAt: new Date().toISOString(),
                },
            });

            return newUser;
        });

        mockDb.emit("users:changed");

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
        await setAuthCookies(accessToken, refreshToken, true); // new signups stay logged in

        return successResponse(authUser, 201);
    } catch (error) {
        return handleApiError(error) as NextResponse<ApiResponse<AuthUser>>;
    }
}
