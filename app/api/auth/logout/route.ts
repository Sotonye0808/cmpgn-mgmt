import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/utils/jwt";
import { successResponse } from "@/lib/utils/api";
import type { ApiResponse } from "@/types/api";

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
    await clearAuthCookies();
    return successResponse(null);
}
