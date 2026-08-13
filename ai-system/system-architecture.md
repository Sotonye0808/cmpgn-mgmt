# System Architecture

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: re-verify before trusting if any architecture-affecting commits have been made since last-verified-against-code

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

| Module | Responsibility | Key Files | Dependencies |
|--------|---------------|-----------|--------------|
| `app/` | UI routes, layouts, and API handlers | `app/(auth)/*`, `app/(dashboard)/*`, `app/(public)/*`, `app/api/*` | `modules/*`, `lib/*` |
| `modules/analytics` | Analytics and metrics dashboards | `modules/analytics/*` | `lib/data/*` |
| `modules/campaign` | Campaign CRUD and configuration | `modules/campaign/*` | `lib/data/*`, `prisma` |
| `modules/donation` | Donation processing and tracking | `modules/donation/*` | `lib/data/*` |
| `modules/engagement` | Proofs, participation, timeline | `modules/engagement/*` | `lib/data/*` |
| `modules/leaderboard` | Leaderboard and rankings | `modules/leaderboard/*` | `lib/data/*` |
| `modules/links` | Smart link generation and tracking | `modules/links/*` | `lib/utils/slug` |
| `modules/points` | Points and scoring system | `modules/points/*` | `lib/data/*` |
| `modules/proofs` | Proof of participation — submission, display, and role-scoped review | `modules/proofs/*` | `lib/prisma`, `lib/utils/serialize`, `modules/points`, `components/ui/MultiImageUpload`, `modules/proofs/services/proofReviewAccess` |
| `modules/referral` | Referral tracking | `modules/referral/*` | `lib/data/*` |
| `modules/teams` | Team management | `modules/teams/*` | `lib/data/*` |
| `modules/trust` | Trust/safety review | `modules/trust/*` | `lib/data/*` |
| `modules/users` | User management, roles, profiles | `modules/users/*` | `lib/prisma`, `lib/utils` |
| `lib/config/` | Environment config and feature flags | `lib/config/cis.ts`, `lib/config/*.ts` | `node:crypto`, `zod` |
| `lib/data/` | Mock DB + cache and seed fixtures | `lib/data/mockDb.ts`, `lib/data/mockCache.ts`, `lib/data/seed.ts` | `events` |
| `lib/schemas/` | Zod validation schemas | `lib/schemas/authSchemas.ts`, `lib/schemas/campaignSchemas.ts` | `zod` |
| `lib/services/` | Cross-cutting services and adapters | `lib/services/*` | `lib/prisma`, `lib/utils` |
| `lib/middleware/` | Auth + role guard helpers | `lib/middleware/auth.ts` | `lib/utils/jwt` |
| `prisma/` | Schema + generated client + migrations | `prisma/schema.prisma` | `@prisma/client` |
| `providers/` | React context providers | `providers/AuthProvider.tsx`, `providers/ThemeProvider.tsx` | `react` |
| `hooks/` | Shared React hooks | `hooks/useAuth.ts`, `hooks/useRole.ts` | `react` |
| `config/` | App-level config-driven copy | `config/content.ts`, `config/navigation.ts` | — |

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
1) Mock DB was the source of truth during early phases; proofs/engagement/campaign
   routes now use Prisma/PostgreSQL directly.
2) Some flows still read from lib/data/mockDb.ts — see the drift note below.
3) Multi-table writes use prisma.$transaction() where applicable.
```

---

## Configuration Points

| Config Key | Purpose | Location | Default |
|-----------|---------|----------|---------|
| `JWT_ACCESS_SECRET` | Access token signing | `.env*` | required |
| `JWT_REFRESH_SECRET` | Refresh token signing | `.env*` | required |
| `DATABASE_URL` | Prisma/Postgres connection | `.env*` | optional (Phase 14) |
| `REDIS_URL` | Redis cache connection | `.env*` | optional |
| `CIS_API_URL` | CIS base URL | `.env*` | optional |
| `CIS_WEBHOOK_SECRET` | CIS webhook HMAC secret | `.env*` | optional |
| `ENABLE_DESIGN_VIEWER` | Mounts the dev-only design-asset viewer at `/__design/*`; must be false in production builds | .env | false |

All config points listed here should follow the fallback discipline from `standards/engineering-principles.md` §1 and §3 — every config-driven value must have a documented, safe fallback so the system degrades gracefully if the value is missing or malformed.

---

## Verification CLI (agent-verifiable behavior)

If the project exposes a CLI for observing/verifying application behavior end-to-end (engineering principle §24), list its commands here so agents know it exists before reaching for a manual check:

| Command | What it proves | When to use |
|---------|---------------|-------------|
| [cli command] | [what real state it checks] | [e.g. before a quality-gate close] |

---

## Rollback & Undo (deployment level)

This is the "undo" instinct applied one layer up from data (§22 covers user-facing undo; this covers deployments). Document the project's actual rollback mechanism here so `commands/fix-build.md` knows it exists as an escalation option, not just "fix forward":

- **Previous-build promotion** — what gets re-deployed, and how.
- **DB migration reversibility** — are migrations down-migratable? What state is recoverable?
- **Feature-flag kill switch** — is there a flag that disables a bad feature without a deploy?

If the project has no documented rollback mechanism, say so explicitly here — that is itself a known constraint.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js App Router | 15.x |
| Language | TypeScript | 5.x |
| UI | Ant Design | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Prisma + PostgreSQL | 7.x |
| Auth | JWT cookies | — |
| Validation | Zod | 3.x |

---

## Known Constraints & Technical Debt

- All user-facing copy must be config-driven; no inline literals in JSX.
- Role-aware rendering must remain route-agnostic.
- Mock DB is canonical in early phases; migration must be additive.
- Design system tokens are mandatory (`--ds-*`).
- **Known drift (2026-08-05):** docs historically describe mock DB as canonical in early phases, but proof/campaign routes already talk to Prisma/PostgreSQL directly. `lib/constants.ts` exists but is not listed in the repo map. Team-lead review access is now centralized in `modules/proofs/services/proofReviewAccess.ts` and must stay the single source of truth for proof-review scoping.
- Team-lead verification scope rule: a lead may review a proof only if the submitter is in the lead's team AND the proof's campaign is in the lead's `Campaign.teamLeadIds`. Leads with no campaign assignments keep the legacy team-scoped behaviour (no campaign restriction) so existing setups don't lose access.

---

## Architecture History

See `memory/architecture-history.md` for full chronology.
