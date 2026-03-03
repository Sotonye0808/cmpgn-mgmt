// GET /api/public/stats — Unauthenticated; returns cached platform-wide stats.
// Response is safe to serve publicly (no user PII, no sensitive counts).
// Cache-Control header aligns with the in-process mockCache TTL (5 min).
// Phase 14: swap getPublicStats() for a Prisma-backed implementation —
//           no changes needed here.

import { successResponse, handleApiError } from "@/lib/utils/api";
import { getPublicStats } from "@/lib/services/publicStatsService";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
        const stats = getPublicStats();
        const response = successResponse(stats);
        response.headers.set(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=60",
        );
        return response;
    } catch (err) {
        return handleApiError(err);
    }
}
