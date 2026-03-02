import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
    DEFAULT_TRUST_SCORE,
    TRUST_SCORE_MIN,
    CACHE_TTL_TRUST,
    LINK_EVENT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";
import { FRAUD_RULES } from "@/modules/trust/config";
import { serialize } from "@/lib/utils/serialize";

// ─── Evaluate Event ───────────────────────────────────────────────────────────

export async function evaluateEvent(event: LinkEvent): Promise<void> {
    if (!event.userId) return;

    const cutoff = new Date(Date.now() - LINK_EVENT_RATE_LIMIT_WINDOW_MS * 60);
    const history = await prisma.linkEvent.findMany({
        where: {
            userId: event.userId,
            createdAt: { gt: cutoff },
        },
    });

    // Convert Prisma results to match LinkEvent interface for fraud rules
    const historyEvents = history.map((e) => serialize<LinkEvent>(e));

    const triggered = FRAUD_RULES.filter((rule) => rule.check(event, historyEvents));
    if (triggered.length === 0) return;

    const existing = await prisma.trustScore.findUnique({
        where: { userId: event.userId },
    });

    if (existing) {
        const existingFlags = existing.flags as string[];
        const newFlags = [
            ...new Set([
                ...existingFlags,
                ...triggered.map((r) => r.flag as string),
            ]),
        ];

        const totalPenalty = triggered.reduce((s, r) => s + r.penalty, 0);
        const newScore = Math.max(TRUST_SCORE_MIN, existing.score - totalPenalty);

        await prisma.trustScore.update({
            where: { id: existing.id },
            data: {
                score: newScore,
                flags: newFlags as never,
            },
        });
    } else {
        const totalPenalty = triggered.reduce((s, r) => s + r.penalty, 0);
        const flags = triggered.map((r) => r.flag);

        await prisma.trustScore.create({
            data: {
                userId: event.userId,
                score: Math.max(TRUST_SCORE_MIN, DEFAULT_TRUST_SCORE - totalPenalty),
                flags: flags as never,
            },
        });
    }

    await redis.del(`trust:user:${event.userId}`);
}

// ─── Get User Trust Score ─────────────────────────────────────────────────────

export async function getUserTrustScore(userId: string): Promise<TrustScore> {
    const cacheKey = `trust:user:${userId}`;
    const cached = await redis.get<TrustScore>(cacheKey);
    if (cached) return cached;

    let score = await prisma.trustScore.findUnique({ where: { userId } });

    if (!score) {
        score = await prisma.trustScore.create({
            data: {
                userId,
                score: DEFAULT_TRUST_SCORE,
                flags: [],
            },
        });
    }

    const serialized = serialize<TrustScore>(score);
    await redis.set(cacheKey, serialized, CACHE_TTL_TRUST);
    return serialized;
}

// ─── Get Flagged Users (Admin) ────────────────────────────────────────────────

export async function getFlaggedUsers(): Promise<TrustFlagRecord[]> {
    const cacheKey = "trust:flagged";
    const cached = await redis.get<TrustFlagRecord[]>(cacheKey);
    if (cached) return cached;

    // Prisma doesn't support "array not empty" natively for enum arrays,
    // so we fetch all and filter client-side.
    const allScores = await prisma.trustScore.findMany({
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });

    const records: TrustFlagRecord[] = allScores
        .filter((ts) => (ts.flags as string[]).length > 0)
        .map((ts) => ({
            userId: ts.userId,
            firstName: ts.user.firstName,
            lastName: ts.user.lastName,
            email: ts.user.email,
            score: ts.score,
            flags: ts.flags as unknown as TrustFlag[],
            lastReviewedAt: ts.lastReviewedAt?.toISOString(),
        }));

    await redis.set(cacheKey, records, CACHE_TTL_TRUST);
    return records;
}

// ─── Review Flag ──────────────────────────────────────────────────────────────

export async function reviewFlag(
    userId: string,
    resolution: "CLEAR" | "PENALIZE" | "ESCALATE",
    _adminId: string
): Promise<TrustScore> {
    const existing = await prisma.trustScore.findUnique({ where: { userId } });
    if (!existing) throw new Error("Trust score not found");

    const updates: Record<string, unknown> = {
        lastReviewedAt: new Date(),
    };

    if (resolution === "CLEAR") {
        updates.flags = [];
        updates.score = DEFAULT_TRUST_SCORE;
    } else if (resolution === "PENALIZE") {
        updates.score = Math.max(TRUST_SCORE_MIN, existing.score - 20);
    }

    const updated = await prisma.trustScore.update({
        where: { id: existing.id },
        data: updates as never,
    });

    await redis.del(`trust:user:${userId}`);
    await redis.del("trust:flagged");

    return serialize<TrustScore>(updated);
}
