// ─── Prisma Client Singleton ─────────────────────────────────────────────────
// Global singleton prevents connection pool exhaustion during Next.js HMR.
//
// DATABASE_URL is a Prisma Accelerate URL (prisma+postgres://). The
// withAccelerate() extension MUST be applied — it is the Accelerate HTTP proxy
// transport layer. Without it, the client cannot communicate with Accelerate.
//
// We do NOT use Accelerate's cacheStrategy — caching is handled by our own
// Upstash Redis layer. withAccelerate() is purely for connection proxying.
//
// TypeScript note: $extends() produces an intersection type that breaks
// downstream inference. We cast back to PrismaClient so all query results
// remain fully typed throughout the codebase. The cast is safe because the
// extended client is a strict superset — all PrismaClient methods are present.

import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function buildPrismaClient(): PrismaClient {
    return new PrismaClient({
        datasourceUrl: (process.env.DATABASE_URL || "fallback-url") as string,
        log:
            process.env.NODE_ENV === "development"
                ? (["query", "error", "warn"] as const)
                : (["error"] as const),
    }).$extends(withAccelerate()) as unknown as PrismaClient;
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? buildPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
