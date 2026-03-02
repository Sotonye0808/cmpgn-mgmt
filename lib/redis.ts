// ─── Upstash Redis Adapter ───────────────────────────────────────────────────
// Drop-in replacement for mockCache — same method surface, same call sites.
// Uses Upstash HTTP-based Redis client (works in serverless / edge).
// All keys are namespaced with "dmhicc:v1:" for future CRM coexistence.

import { Redis } from "@upstash/redis";

// ─── Client Singleton ────────────────────────────────────────────────────────

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function buildRedis(): Redis {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error(
            "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars"
        );
    }

    return new Redis({ url, token });
}

const client: Redis = globalForRedis.redis ?? buildRedis();
if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = client;
}

// ─── Key Namespace ───────────────────────────────────────────────────────────

const PREFIX = "dmhicc:v1:";
function ns(key: string): string {
    return `${PREFIX}${key}`;
}

// ─── Public API (mirrors mockCache exactly) ──────────────────────────────────

/**
 * Set a value with optional TTL (in **milliseconds** — matches mockCache API).
 * Stored as JSON so any serialisable value works.
 */
async function set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const serialised = JSON.stringify(value);
    if (ttlMs && ttlMs > 0) {
        // Upstash px = milliseconds expiry
        await client.set(ns(key), serialised, { px: ttlMs });
    } else {
        await client.set(ns(key), serialised);
    }
}

/**
 * Get a cached value. Returns null on miss or expiry.
 */
async function get<T = unknown>(key: string): Promise<T | null> {
    const raw = await client.get<string>(ns(key));
    if (raw === null || raw === undefined) return null;
    try {
        // Upstash auto-deserialises JSON — if it returned an object already,
        // pass through; otherwise parse the string.
        if (typeof raw === "string") return JSON.parse(raw) as T;
        return raw as unknown as T;
    } catch {
        return null;
    }
}

/**
 * Delete a single key.
 */
async function del(key: string): Promise<void> {
    await client.del(ns(key));
}

/**
 * Check if a key exists (not expired).
 */
async function exists(key: string): Promise<boolean> {
    const result = await client.exists(ns(key));
    return result === 1;
}

/**
 * Delete all keys matching a prefix. Uses SCAN for safety on large keyspaces.
 */
async function invalidatePattern(prefix: string): Promise<void> {
    const pattern = `${ns(prefix)}*`;
    let cursor = 0;

    do {
        const [nextCursor, keys] = await client.scan(cursor, {
            match: pattern,
            count: 100,
        });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
            const pipeline = client.pipeline();
            for (const k of keys) {
                pipeline.del(k);
            }
            await pipeline.exec();
        }
    } while (cursor !== 0);
}

/**
 * Atomic increment. Returns the new value.
 */
async function incr(key: string, ttlMs?: number): Promise<number> {
    const val = await client.incr(ns(key));
    if (ttlMs && val === 1) {
        // Set TTL only on first increment (key creation)
        await client.pexpire(ns(key), ttlMs);
    }
    return val;
}

/**
 * Flush all dmhicc-namespaced keys. Use with care.
 */
async function flush(): Promise<void> {
    await invalidatePattern("");
}

// ─── Backwards-compatible alias ──────────────────────────────────────────────
// `invalidate` was used in some services — synonym for `del`.
const invalidate = del;

export const redis = {
    set,
    get,
    del,
    exists,
    invalidatePattern,
    invalidate,
    incr,
    flush,
    /** Expose raw Upstash client for advanced operations (pub/sub, streams). */
    raw: client,
} as const;
