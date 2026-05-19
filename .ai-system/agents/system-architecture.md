# System Architecture

> **Overview:** DMHicc is a Next.js 15 App Router platform that combines role-aware UI routes with API handlers, domain modules, and a Prisma-backed data layer. Feature modules live under `modules/`, while shared utilities, config, and middleware live under `lib/`. The data layer runs on a mock DB in early phases and swaps to Prisma/PostgreSQL without refactoring service boundaries.

---

## Architecture Diagram

```
Client (Browser)
    ↓
Next.js App Router (app/)
    ↓
API Layer (app/api/*)
    ↓
Service Layer (modules/* + lib/services/*)
    ↓
Data Layer (lib/data/mockDb.ts → Prisma)
    ↓
PostgreSQL / Redis / Cloudinary / CIS
```

---

## Module Breakdown

| Module               | Responsibility                         | Key Files                                                         | Dependencies              |
| -------------------- | -------------------------------------- | ----------------------------------------------------------------- | ------------------------- |
| `app/`               | UI routes, layouts, and API handlers   | `app/(auth)/*`, `app/(dashboard)/*`, `app/api/*`                  | `modules/*`, `lib/*`      |
| `modules/campaign`   | Campaign CRUD and configuration        | `modules/campaign/*`                                              | `lib/data/*`              |
| `modules/users`      | User management, roles, profiles       | `modules/users/*`                                                 | `lib/prisma`, `lib/utils` |
| `modules/links`      | Smart link generation and tracking     | `modules/links/*`                                                 | `lib/utils/slug`          |
| `modules/engagement` | Proofs, participation, timeline        | `modules/engagement/*`                                            | `lib/data/*`              |
| `lib/data/`          | Mock DB + cache and seed fixtures      | `lib/data/mockDb.ts`, `lib/data/mockCache.ts`, `lib/data/seed.ts` | `events`                  |
| `lib/services/`      | Cross-cutting services and adapters    | `lib/services/*`                                                  | `lib/prisma`, `lib/utils` |
| `lib/config/cis.ts`  | CIS env + webhook verification         | `lib/config/cis.ts`                                               | `node:crypto`, `zod`      |
| `lib/middleware/`    | Auth + role guard helpers              | `lib/middleware/auth.ts`                                          | `lib/utils/jwt`           |
| `prisma/`            | Schema + generated client + migrations | `prisma/schema.prisma`                                            | `@prisma/client`          |

---

## Data Flow

### Standard Request Flow

```
1) User hits a page in app/(dashboard).
2) Client calls a route handler under app/api/*.
3) Route validates input (Zod) and calls a module/service function.
4) Service reads/writes via mockDb or Prisma.
5) Response is serialized through shared API helpers.
```

### Authentication Flow

```
1) User logs in via /api/auth/login.
2) JWT tokens are issued in httpOnly cookies.
3) requireAuth/requireRole guards enforce access in API routes.
```

### CIS Status + Webhook Flow

```
1) Operators call GET /api/cis/status for readiness.
2) CIS posts signed webhook payloads to POST /api/cis/webhook.
3) Signature is verified with CIS_WEBHOOK_SECRET.
4) Payload is persisted to CisIdentity + CisWebhookEvent tables.
```

### Data Persistence Flow

```
1) Mock DB is the source of truth during early phases.
2) Prisma/PostgreSQL becomes canonical in Phase 14 with the same service interfaces.
3) Multi-table writes use mockDb.transaction() to preserve ACID boundaries.
```

---

## Configuration Points

| Config Key           | Purpose                    | Location | Default             |
| -------------------- | -------------------------- | -------- | ------------------- |
| `JWT_ACCESS_SECRET`  | Access token signing       | `.env*`  | required            |
| `JWT_REFRESH_SECRET` | Refresh token signing      | `.env*`  | required            |
| `DATABASE_URL`       | Prisma/Postgres connection | `.env*`  | optional (Phase 14) |
| `REDIS_URL`          | Redis cache connection     | `.env*`  | optional            |
| `CIS_API_URL`        | CIS base URL               | `.env*`  | optional            |
| `CIS_WEBHOOK_SECRET` | CIS webhook HMAC secret    | `.env*`  | optional            |

---

## Tech Stack

| Layer      | Technology          | Version |
| ---------- | ------------------- | ------- |
| Frontend   | Next.js App Router  | 15.x    |
| Language   | TypeScript          | 5.x     |
| UI         | Ant Design          | 5.x     |
| Styling    | Tailwind CSS        | 4.x     |
| Database   | Prisma + PostgreSQL | 7.x     |
| Auth       | JWT cookies         | —       |
| Validation | Zod                 | 3.x     |

---

## Known Constraints & Technical Debt

- All user-facing copy must be config-driven; no inline literals in JSX.
- Role-aware rendering must remain route-agnostic.
- Mock DB is canonical in early phases; migration must be additive.
- Design system tokens are mandatory (`--ds-*`).

---

## Architecture History

| Date       | Change                                                        | Reason                                             |
| ---------- | ------------------------------------------------------------- | -------------------------------------------------- |
| 2026-05-13 | Bootstrapped .ai-system and added CIS persistence scaffolding | Enable identity federation without schema coupling |
