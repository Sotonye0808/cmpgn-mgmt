import { NextResponse } from "next/server";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse<never>> {
    return NextResponse.json({ success: false, error }, { status });
}

export function badRequestResponse(error: string): NextResponse<ApiResponse<never>> {
    return errorResponse(error, 400);
}

export function unauthorizedResponse(error = "Unauthorized"): NextResponse<ApiResponse<never>> {
    return errorResponse(error, 401);
}

export function forbiddenResponse(error = "Forbidden"): NextResponse<ApiResponse<never>> {
    return errorResponse(error, 403);
}

export function notFoundResponse(error = "Not found"): NextResponse<ApiResponse<never>> {
    return errorResponse(error, 404);
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / pageSize);
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    });
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
    if (error instanceof Error) {
        console.error("[API Error]", error.message);
        return errorResponse(error.message, 500);
    }
    console.error("[API Error]", error);
    return errorResponse("Internal server error", 500);
}

export function parsePagination(searchParams: URLSearchParams): { page: number; pageSize: number } {
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)));
    return { page, pageSize };
}
