import { NextRequest } from "next/server";
import { requireRole, requireAuth } from "@/lib/middleware/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { listGroups, createGroup } from "@/modules/teams";
import { z } from "zod";

const createGroupSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
});

export async function GET() {
    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;

        const groups = await listGroups();
        return successResponse(groups);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireRole(["ADMIN", "SUPER_ADMIN"]);
        if (auth.error) return auth.error;

        const body = await request.json();
        const parsed = createGroupSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(parsed.error.errors[0].message);
        }

        const group = await createGroup(
            parsed.data,
            auth.user.role as unknown as string
        );
        return successResponse(group, 201);
    } catch (err) {
        return handleApiError(err);
    }
}
