// Mock Redis Cache — simulates TTL key-value store
// Method names mirror ioredis API for mechanical swap at Phase 14

interface CacheEntry {
    value: unknown;
    expiresAt: number | null;
}

class MockCache {
    private store: Map<string, CacheEntry> = new Map();

    set(key: string, value: unknown, ttlMs?: number): void {
        this.store.set(key, {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : null,
        });
    }

    get<T = unknown>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value as T;
    }

    del(key: string): void {
        this.store.delete(key);
    }

    exists(key: string): boolean {
        return this.get(key) !== null;
    }

    invalidatePattern(prefix: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    // Simulate Redis INCR
    incr(key: string, ttlMs?: number): number {
        const current = this.get<number>(key) ?? 0;
        const next = current + 1;
        this.set(key, next, ttlMs);
        return next;
    }

    flush(): void {
        this.store.clear();
    }
}

export const mockCache = new MockCache();
