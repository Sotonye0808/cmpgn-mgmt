import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import {
    DEFAULT_TRUST_SCORE,
    TRUST_SCORE_MIN,
    CACHE_TTL_TRUST,
    LINK_EVENT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";
import { FRAUD_RULES } from "@/modules/trust/config";
import { nanoid } from "nanoid";

// ─── Evaluate Event ───────────────────────────────────────────────────────────

export async function evaluateEvent(event: LinkEvent): Promise<void> {
    if (!event.userId) return;

    const cutoff = Date.now() - LINK_EVENT_RATE_LIMIT_WINDOW_MS * 60; // 1-hour window
    const history = mockDb.linkEvents._data.filter(
        (e) =>
            e.userId === event.userId &&
            new Date(e.createdAt).getTime() > cutoff
    );

    const triggered = FRAUD_RULES.filter((rule) => rule.check(event, history));
    if (triggered.length === 0) return;

    const existing = mockDb.trustScores.findUnique({
        where: { userId: event.userId },
    });

    if (existing) {
        const existingFlags = existing.flags as unknown as string[];
        const newFlags = [
            ...new Set([
                ...existingFlags,
                ...triggered.map((r) => r.flag as unknown as string),
            ]),
        ] as unknown as TrustFlag[];

        const totalPenalty = triggered.reduce((s, r) => s + r.penalty, 0);
        const newScore = Math.max(
            TRUST_SCORE_MIN,
            existing.score - totalPenalty
        );

        mockDb.trustScores.update({
            where: { id: existing.id },
            data: {
                score: newScore,
                flags: newFlags,
                updatedAt: new Date().toISOString(),
            },
        });
    } else {
        const totalPenalty = triggered.reduce((s, r) => s + r.penalty, 0);
        const flags = triggered.map((r) => r.flag);

        mockDb.trustScores.create({
            data: {
                id: nanoid(),
                userId: event.userId,
                score: Math.max(TRUST_SCORE_MIN, DEFAULT_TRUST_SCORE - totalPenalty),
                flags: flags as unknown as TrustFlag[],
                updatedAt: new Date().toISOString(),
            },
        });
    }

    mockCache.del(`trust:user:${event.userId}`);
    mockDb.emit("trustScores:changed");
}

// ─── Get User Trust Score ─────────────────────────────────────────────────────

export async function getUserTrustScore(userId: string): Promise<TrustScore> {
    const cacheKey = `trust:user:${userId}`;
    const cached = mockCache.get<TrustScore>(cacheKey);
    if (cached) return cached;

    let score = mockDb.trustScores.findUnique({ where: { userId } });

    if (!score) {
        // Create a default score on first lookup
        score = mockDb.trustScores.create({
            data: {
                id: nanoid(),
                userId,
                score: DEFAULT_TRUST_SCORE,
                flags: [] as unknown as TrustFlag[],
                updatedAt: new Date().toISOString(),
            },
        });
    }

    mockCache.set(cacheKey, score, CACHE_TTL_TRUST);
    return score;
}

// ─── Get Flagged Users (Admin) ────────────────────────────────────────────────

export async function getFlaggedUsers(): Promise<TrustFlagRecord[]> {
    const cacheKey = "trust:flagged";
    const cached = mockCache.get<TrustFlagRecord[]>(cacheKey);
    if (cached) return cached;

    const flaggedScores = mockDb.trustScores._data.filter(
        (ts) => (ts.flags as unknown as string[]).length > 0
    );

    const records: TrustFlagRecord[] = flaggedScores.map((ts) => {
        const user = mockDb.users._data.find((u) => u.id === ts.userId);
        return {
            userId: ts.userId,
            firstName: user?.firstName ?? "Unknown",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
            score: ts.score,
            flags: ts.flags,
            lastReviewedAt: ts.lastReviewedAt,
        };
    });

    mockCache.set(cacheKey, records, CACHE_TTL_TRUST);
    return records;
}

// ─── Review Flag ──────────────────────────────────────────────────────────────

export async function reviewFlag(
    userId: string,
    resolution: "CLEAR" | "PENALIZE" | "ESCALATE",
    _adminId: string
): Promise<TrustScore> {
    const existing = mockDb.trustScores.findUnique({ where: { userId } });
    if (!existing) throw new Error("Trust score not found");

    const updates: Partial<TrustScore> = {
        lastReviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (resolution === "CLEAR") {
        updates.flags = [] as unknown as TrustFlag[];
        updates.score = DEFAULT_TRUST_SCORE;
    } else if (resolution === "PENALIZE") {
        updates.score = Math.max(TRUST_SCORE_MIN, existing.score - 20);
    }
    // ESCALATE: just log the review time, no score change in mock

    const updated = mockDb.trustScores.update({
        where: { id: existing.id },
        data: updates,
    });
    if (!updated) throw new Error("Failed to update trust score");

    mockCache.del(`trust:user:${userId}`);
    mockCache.del("trust:flagged");
    mockDb.emit("trustScores:changed");

    return updated;
}
