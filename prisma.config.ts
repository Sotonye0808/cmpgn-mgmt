// ─── Prisma v7 Config ─────────────────────────────────────────────────────────
// Connection URL for Prisma Migrate (CLI tooling).
// Runtime URL is passed directly to PrismaClient in lib/prisma.ts.
// See: https://pris.ly/d/config-datasource

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx ./prisma/seed.ts',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
})