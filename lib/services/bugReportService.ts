import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { serialize } from "@/lib/utils/serialize";

const CACHE_KEY_ALL = "bug-reports:all";

// ─── Create Bug Report ───────────────────────────────────────────────────────

interface CreateInput {
    category: string;
    description: string;
    email: string;
    userId?: string;
    userAgent?: string;
    pageUrl?: string;
}

export async function createBugReport(input: CreateInput): Promise<BugReport> {
    const report = await prisma.bugReport.create({
        data: {
            category: input.category as never,
            description: input.description,
            email: input.email,
            userId: input.userId,
            userAgent: input.userAgent,
            pageUrl: input.pageUrl,
        },
    });

    await redis.del(CACHE_KEY_ALL);
    return serialize<BugReport>(report);
}

// ─── Get All Bug Reports (Admin) ─────────────────────────────────────────────

interface ListOptions {
    status?: string;
    category?: string;
    page?: number;
    pageSize?: number;
}

export async function getBugReports(options: ListOptions = {}) {
    const { status, category, page = 1, pageSize = 20 } = options;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [reports, total] = await Promise.all([
        prisma.bugReport.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.bugReport.count({ where }),
    ]);

    return {
        data: reports.map((r) => serialize<BugReport>(r)),
        meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
}

// ─── Get Single Bug Report ───────────────────────────────────────────────────

export async function getBugReport(id: string): Promise<BugReport | null> {
    const report = await prisma.bugReport.findUnique({ where: { id } });
    if (!report) return null;
    return serialize<BugReport>(report);
}

// ─── Update Bug Report (Admin) ───────────────────────────────────────────────

interface UpdateInput {
    status?: string;
    adminNotes?: string;
}

export async function updateBugReport(
    id: string,
    input: UpdateInput
): Promise<BugReport> {
    const data: Record<string, unknown> = {};
    if (input.status) data.status = input.status;
    if (input.adminNotes !== undefined) data.adminNotes = input.adminNotes;
    if (input.status === "RESOLVED" || input.status === "CLOSED") {
        data.resolvedAt = new Date();
    }

    const updated = await prisma.bugReport.update({
        where: { id },
        data,
    });

    await redis.del(CACHE_KEY_ALL);
    return serialize<BugReport>(updated);
}
