import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/middleware/auth";
import { successResponse, unauthorizedResponse } from "@/lib/utils/api";
import type { ApiResponse } from "@/types/api";

export async function GET(): Promise<NextResponse<ApiResponse<AuthUser>>> {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    return successResponse(user);
}
