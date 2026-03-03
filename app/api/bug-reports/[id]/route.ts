import { NextRequest } from "next/server";
import { z } from "zod";
import { getBugReport, updateBugReport } from "@/lib/services/bugReportService";
import { requireRole } from "@/lib/middleware/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api";

const updateSchema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    adminNotes: z.string().max(5000).optional(),
});

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/bug-reports/[id]
 * SUPER_ADMIN only — get a single bug report.
 */
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { error } = await requireRole(["SUPER_ADMIN"]);
        if (error) return error;

        const { id } = await params;
        const report = await getBugReport(id);
        if (!report) return errorResponse("Bug report not found", 404);

        return successResponse(report);
    } catch (err) {
        return handleApiError(err);
    }
}

/**
 * PATCH /api/bug-reports/[id]
 * SUPER_ADMIN only — update status or admin notes.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { error } = await requireRole(["SUPER_ADMIN"]);
        if (error) return error;

        const { id } = await params;
        const existing = await getBugReport(id);
        if (!existing) return errorResponse("Bug report not found", 404);

        const body = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse(parsed.error.issues[0]?.message ?? "Validation error", 400);
        }

        const updated = await updateBugReport(id, parsed.data);
        return successResponse(updated);
    } catch (err) {
        return handleApiError(err);
    }
}
