import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBugReport, getBugReports } from "@/lib/services/bugReportService";
import { getAuthenticatedUser, requireRole } from "@/lib/middleware/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

const createSchema = z.object({
    category: z.enum(["UI_ISSUE", "DATA_ISSUE", "PERFORMANCE", "FEATURE_REQUEST", "ACCESS_AUTH", "OTHER"]),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000),
    email: z.string().email("Invalid email address"),
    pageUrl: z.string().optional(),
});

/**
 * POST /api/bug-reports
 * Public — anyone can submit a bug report. Captures userId if authenticated.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Validation error" },
                { status: 400 }
            );
        }

        // Try to get authenticated user (optional — not required)
        const user = await getAuthenticatedUser();
        const userAgent = request.headers.get("user-agent") ?? undefined;

        const report = await createBugReport({
            ...parsed.data,
            userId: user?.id,
            userAgent,
            pageUrl: parsed.data.pageUrl,
        });

        return successResponse(report, 201);
    } catch (err) {
        return handleApiError(err);
    }
}

/**
 * GET /api/bug-reports
 * SUPER_ADMIN only — list all bug reports with optional filters.
 */
export async function GET(request: NextRequest) {
    try {
        const { error } = await requireRole(["SUPER_ADMIN"]);
        if (error) return error;

        const url = new URL(request.url);
        const status = url.searchParams.get("status") ?? undefined;
        const category = url.searchParams.get("category") ?? undefined;
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("pageSize") ?? "20");

        const result = await getBugReports({ status, category, page, pageSize });
        return successResponse(result);
    } catch (err) {
        return handleApiError(err);
    }
}
