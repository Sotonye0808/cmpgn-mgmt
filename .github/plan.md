# DMHicc — Development Plan

> **Digital Mobilization & Harvest Impact Campaign Center**  
> Status: **Active Development** · Last updated: February 2026
>
> **Progress:** Phases 1–14 ✅ complete · Phase 15 pending · `npx tsc --noEmit` passing clean (0 errors)

---

## Overview

The plan is organized into **15 phases** mapped to the PRD's MVP scope. Phases 1–11 deliver the full MVP. Phases 12–15 cover the public-facing layer, production data layer, and deployment. Each phase is designed to be completed in one focused agent session.

### Phase Sequence

```
Phase 1  ✅ Foundation & Project Scaffold
Phase 2  ✅ Type System, Shared Lib, Config Layer
Phase 3  ✅ Auth Module
Phase 4  ✅ Campaign Module (extended from relics)
Phase 5  ✅ Smart Link Engine
Phase 6  ✅ Engagement Tracking
Phase 7  ✅ Referral Engine
Phase 8  ✅ Points / Gamification Engine
Phase 9  ✅ Leaderboard Engine
Phase 10 ✅ Donation Module
Phase 11 ✅ Trust & Fraud Detection
Phase 12 ✅ Analytics Dashboard
Phase 13 ✅ Admin Module + Landing Page
Phase 14 ✅ Prisma + Real Database Migration
Phase 15 → Stabilization, QA, Deploy Readiness
```

---

## Phase 1 — Foundation & Project Scaffold ✅

### Goals

Initialize the Next.js 15+ project with all tooling, design system tokens, and folder structure in place before writing any feature code.

### Tasks

- [x] `npx create-next-app@latest` with TypeScript, App Router, Tailwind v4, ESLint
- [x] Configure `tsconfig.json` with strict mode, `baseUrl: "."`, path alias `@/*`
- [x] Install dependencies:
  - `antd`, `@ant-design/icons`, `antd-dayjs-plugin`
  - `next-themes`
  - `framer-motion`
  - `zod`
  - `react-hook-form`, `@hookform/resolvers`
  - `date-fns`
  - `jose` (JWT)
  - `bcryptjs`, `@types/bcryptjs`
  - `cloudinary` (SDK, for later)
  - `ioredis` (Redis client, for later)
  - `@prisma/client`, `prisma` (for later)
- [x] Create folder structure: `/modules`, `/components/ui`, `/components/layout`, `/components/glass`, `/config`, `/lib/data`, `/lib/utils`, `/lib/middleware`, `/providers`, `/hooks`, `/types`
- [x] Create `types/global.d.ts` — empty scaffold with `declare global {}` block; referenced in `tsconfig.json` `include` array so all types inside are globally available project-wide without imports
- [x] Create mock DB files (empty scaffold, populated in Phase 2):
  - `/lib/data/mockDb.ts` — global singleton class
  - `/lib/data/mockCache.ts` — TTL cache singleton
  - `/lib/data/seed.ts` — deterministic fixture data
- [x] Implement design system in `app/globals.css`:
  - Palette tokens (`--palette-*`)
  - Semantic tokens (`--ds-*`) with light + dark values
  - `@theme inline` Tailwind v4 exposure block
  - `.glass-surface`, `.glow-border`, `.glow-border-strong` utility classes
- [x] Create `providers/AntdProvider.tsx` reading CSS vars via `getComputedStyle` — no hardcoded values
- [x] Create `providers/ThemeProvider.tsx` wrapping `next-themes`
- [x] Create root layout wiring all providers
- [x] Create `/config/icons.ts` — centralized Ant Design icon map
- [x] Create `/config/routes.ts` — typed route constants
- [x] Create `/config/content.ts` — all static copy (landing page, labels, metadata), empty structure to be filled each phase
- [x] ESLint + Prettier config (no-any rule enforced)
- [x] Create shared UI primitives: `Button`, `Card`, `Modal`, `Tag`, `Badge`, `Spinner`, `Empty`, `Skeleton`
- [x] Create `ApiResponse<T>` and `PaginatedResponse<T>` types in `/types/api.ts`
- [x] Create `hooks/useMockDbSubscription.ts` — subscribes to `mockDb` EventEmitter for a given table; triggers re-render on data changes (simulates real-time DB updates)
- [x] Create `hooks/useRole.ts` — returns current user's role + helper `hasRole(roles[])`, `canAccess(feature)` from AuthContext
- [x] Create `lib/utils/roleGuard.ts` — `filterByRole(items[], userRole)` utility consuming `allowedRoles` arrays on config objects

---

## Phase 2 — Type System & Shared Library ✅

### Goals

Define all domain types, enums, constants, and shared utilities before building any module. Types are the contract that all modules reference.

### Tasks

- [x] **Global ambient type declarations** (`/types/global.d.ts`) — declare all core types inside `declare global {}` so they are available in every file without an import:
  - **Enums:** `UserRole`, `CampaignStatus`, `CampaignMediaType`, `LinkEventType`, `PointType`, `GoalType`, `DonationStatus`, `TrustFlag`
    - `UserRole`: `USER`, `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN`
    - `CampaignStatus`: `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED`
    - `CampaignMediaType`: `IMAGE`, `VIDEO`, `LINK`, `TEXT`
    - `LinkEventType`: `CLICK`, `VIEW`, `CONVERSION`, `SHARE`
    - `PointType`: `IMPACT`, `CONSISTENCY`, `LEADERSHIP`, `RELIABILITY`
    - `GoalType`: `SHARES`, `CLICKS`, `REFERRALS`, `DONATIONS`, `CONVERSIONS`
    - `DonationStatus`: `PENDING`, `CONFIRMED`, `FAILED`
    - `TrustFlag`: `DUPLICATE_ACTIVITY`, `ABNORMAL_CLICKS`, `SUSPICIOUS_DEVICE`
  - **Interfaces:** `User`, `UserProfile`, `AuthUser`
  - **Interfaces:** `Campaign`, `CampaignMedia`, `CampaignWithStats`, `CreateCampaignInput`, `UpdateCampaignInput`
  - **Interfaces:** `CampaignParticipation`, `ParticipationStats`
  - **Interfaces:** `SmartLink`, `CreateSmartLinkInput`, `SmartLinkWithStats`
  - **Interfaces:** `LinkEvent`, `CreateLinkEventInput`
  - **Interfaces:** `Referral`, `ReferralStats`
  - **Interfaces:** `PointsLedger`, `PointsSummary`, `AwardPointsInput`
  - **Interfaces:** `LeaderboardEntry`, `LeaderboardSnapshot`, `LeaderboardFilter`
  - **Interfaces:** `Donation`, `CreateDonationInput`, `DonationStats`
  - **Interfaces:** `TrustScore`, `TrustReview`
  - **Shared:** `RoleGuarded<T>` — `T & { allowedRoles: UserRole[] }` — applied to all nav, section, and feature config items
  - **Shared:** `KpiCardConfig`, `NavItem`, `PageSection` — universal config shapes used across modules

  > Note: Module `index.ts` files re-export only service functions and components — they do NOT re-declare types already in `global.d.ts`.

- [x] **Constants** (`/lib/constants.ts`):
  - `CAMPAIGN_DURATION_MS`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`
  - `POINTS_CONFIG`: IP/CP/LP/RP per action (object-driven, not hardcoded per-action)
  - `RANK_LEVELS`: array of `{ name, minScore, badge, color }` — config-driven
  - `SMART_LINK_PREFIX`, `SMART_LINK_EXPIRY_DAYS`

- [x] **Global Mock DB Singleton** (`/lib/data/mockDb.ts`):
  - Single exported `mockDb` instance wrapping all tables
  - Extends Node.js `EventEmitter` — emits `'<table>:changed'` on every write
  - Each table: typed in-memory array with full CRUD methods matching the Prisma model API:
    - `findUnique`, `findMany`, `create`, `update`, `delete`, `count`
  - Writes always emit the corresponding change event after mutating
  - Tables: `users`, `campaigns`, `participations`, `smartLinks`, `linkEvents`, `referrals`, `donations`, `pointsLedger`, `leaderboardSnapshots`, `trustScores`
  - **`transaction<T>(callback: (tx) => Promise<T>): Promise<T>`** — ACID boundary marker:
    - In Phase 1–13 (mock): runs the callback sequentially on the same `mockDb` instance; re-throws on error; **no rollback** (in-memory limitation), but marks the structural boundary clearly
    - In Phase 14 (Prisma): the single swap is `return prisma.$transaction(callback)` — zero service-layer restructuring needed
    - **All service functions that write to more than one table MUST be wrapped in `mockDb.transaction()`** — no bare multi-step writes across tables

- [x] **ACID compliance approach** (applies Phase 1 through production):
  - **Atomicity** — enforced structurally: every multi-table operation lives inside a `mockDb.transaction()` call. Single-table writes are atomic by default (array mutation is synchronous). Dev has no rollback but the boundary is preserved for Phase 14.
  - **Consistency** — enforced at two layers: (1) Zod schema validation at every API route boundary before any write; (2) business rule guards inside service functions (e.g. reject join if campaign is `ARCHIVED`, reject duplicate participation, reject negative point award). Neither layer allows a write that would violate domain invariants.
  - **Isolation** — read-then-write operations (e.g. check-then-create participation) perform both the read and the write inside the same `transaction()` callback to minimise the race window. Node.js single-threaded event loop softens concurrent risk in dev but the pattern is correct for production.
  - **Durability** — intentionally absent in dev (in-memory, reseeds on restart). In production, PostgreSQL Write-Ahead Log (WAL) provides full durability. No dev code should assume persistence across restarts.

- [x] **Mock Cache Singleton** (`/lib/data/mockCache.ts`):
  - Simulates Redis key-value with TTL: `set(key, value, ttlMs?)`, `get(key)`, `del(key)`, `exists(key)`, `invalidatePattern(prefix)`
  - Auto-expires entries after TTL
  - Used by services for: click counters, leaderboard snapshots, engagement aggregates
  - Same method names as `ioredis` where practical so the swap in Phase 14 is mechanical

- [x] **Seed Data** (`/lib/data/seed.ts`):
  - Deterministic fixture data for all tables
  - Includes users across all 4 roles, 8 campaigns, participations, links, events, referrals, donations, points
  - `seedMockDb()` function called once on `mockDb` initialisation
  - Data matches the shape of the Prisma schema exactly

- [x] **Shared utilities** (`/lib/utils/`):
  - `api.ts`: `successResponse`, `errorResponse`, `paginatedResponse`, `handleApiError`, `badRequestResponse`, `unauthorizedResponse`
  - `slug.ts`: `generateSlug(username, campaignId)`, `parseSlug(slug)`
  - `points.ts`: `calculatePoints(action, metadata)`
  - `pagination.ts`: `paginate(arr, page, size)`
  - `format.ts`: date, number, currency formatters (wrapping `date-fns`)
  - `cn.ts`: classname utility (tailwind-merge + clsx)

- [x] **Zod schemas** (`/lib/schemas/`):
  - `authSchemas.ts`: register, login
  - `campaignSchemas.ts`: create, update, filter
  - `smartLinkSchemas.ts`: generate, expire
  - `donationSchemas.ts`: create donation

---

## Phase 3 — Auth Module ✅

### Goals

Full authentication and authorization system. All subsequent phases depend on this.

### Files

`/modules/auth/` — types, services, hooks, components  
`/app/api/auth/` — API routes  
`/app/(auth)/` — login and register pages  
`/lib/middleware/auth.ts` — getAuthenticatedUser, requireRole

### Tasks

- [x] **JWT utilities** (`/lib/utils/jwt.ts`):
  - `signAccessToken(payload)`, `signRefreshToken(payload)`
  - `verifyAccessToken(token)`, `verifyRefreshToken(token)`
  - httpOnly cookie helpers: `setAuthCookies`, `clearAuthCookies`

- [x] **Mock DB user table** — ensure `mockDb.users` table is seeded from `seed.ts` with 5 users across all 4 roles. Auth services read/write exclusively through `mockDb.users` — no standalone module-local arrays.

- [x] **API routes:**
  - `POST /api/auth/register` — create user, hash password, issue tokens
  - `POST /api/auth/login` — validate credentials, issue tokens
  - `POST /api/auth/logout` — clear cookies
  - `POST /api/auth/refresh` — rotate access token
  - `GET /api/auth/me` — return auth user from cookie

- [x] **Middleware** (`/lib/middleware/auth.ts`):
  - `getAuthenticatedUser()` — reads JWT from cookie, returns `AuthUser | null`
  - `requireRole(roles[])` — wraps getAuthenticatedUser + role check

- [x] **AuthProvider** (`/providers/AuthProvider.tsx`):
  - `AuthContext` with `user`, `login`, `logout`, `isLoading`, `hasRole`
  - Auto-refresh on mount

- [x] **`useAuth` hook** — consumes AuthContext

- [x] **Auth pages** (config-driven copy from `/config/content.ts`):
  - `/app/(auth)/login/page.tsx`
  - `/app/(auth)/register/page.tsx`
  - `AuthLayout` component

- [x] **Route protection**: Next.js middleware (`/middleware.ts`) redirecting unauthenticated users

---

## Phase 4 — Campaign Module ✅

### Goals

Full campaign CRUD + participation system. Extends and adapts relic campaign components.

### Files

`/modules/campaign/` — types, services, components, hooks  
`/app/api/campaigns/` — API routes  
`/app/(dashboard)/campaigns/` — campaign pages

### Tasks

- [x] **Mock DB campaign table** — `mockDb.campaigns` is the single source of truth. No local campaign array. Campaign service reads/writes via `mockDb.campaigns` and invalidates `mockCache` entries on writes. The `expireStale()` operation updates records in `mockDb.campaigns` and emits `campaigns:changed`.

- [x] **Campaign service** (`/modules/campaign/services/campaignService.ts`):
  - `listCampaigns(filters, pagination, user)` — role-filtered
  - `getCampaign(id, user)`
  - `createCampaign(input, user)` — admin/super only
  - `updateCampaign(id, input, user)`
  - `deleteCampaign(id, user)`
  - `joinCampaign(campaignId, userId)`
  - `getCampaignStats(campaignId)`

- [x] **API routes:**
  - `GET /api/campaigns` — list, paginated, filterable
  - `POST /api/campaigns` — create (admin+)
  - `GET /api/campaigns/[id]` — single campaign with stats
  - `PUT /api/campaigns/[id]` — update
  - `DELETE /api/campaigns/[id]` — delete (admin+)
  - `POST /api/campaigns/[id]/join` — join campaign
  - `GET /api/campaigns/[id]/participants` — list participants

- [x] **Campaign components** (adapted from relics):
  - `CampaignCard` — adds smart link CTA, participation count, goal progress bar
  - `CampaignList` — retained story + grid toggle; config-driven view switcher
  - `CampaignModal` — retained keyboard nav + progress dots
  - `CampaignBanner` — adds goal progress, join button, participation stats
  - `CampaignStory` — retained gradient ring pattern
  - `CampaignStatusBadge` — config-driven badge map by status
  - `CampaignForm` — create/edit form with Zod validation
  - `CampaignFilters` — filter bar (status, date, search) — config-driven filter options

- [x] **`useCampaigns` hook** — fetches campaign list with filters/pagination
- [x] **`useCampaign(id)` hook** — fetches single campaign

- [x] **Pages (role-aware, not role-split):**
  - `/app/(dashboard)/campaigns/page.tsx` — single campaign list page; renders user stats strip for all roles + admin toolbar (`CampaignAdminActions`) only when `user.role` is ADMIN/SUPER_ADMIN; campaign grid/story view for all
  - `/app/(dashboard)/campaigns/[id]/page.tsx` — single campaign detail page; shows join/share panel for users; shows edit/manage panel for admins — sections filtered by `allowedRoles` from config
  - `/app/(dashboard)/campaigns/new/page.tsx` — create campaign; route itself is protected by `requireRole(['ADMIN','SUPER_ADMIN'])` in middleware, but the form component is reused on the detail page edit flow

---

## Phase 5 — Smart Link Engine ✅

### Goals

Generate, store, retrieve, and serve unique trackable links per user–campaign pair. Core link event logging.

### Files

`/modules/links/`  
`/app/api/smart-links/`  
`/app/c/[slug]/` — public link redirect handler (slug is the immutable SmartLink primary lookup key)

### Tasks

- [x] **Mock DB link tables** — `mockDb.smartLinks` and `mockDb.linkEvents` are the single source of truth for the link engine. No standalone local arrays. `incrementClick` writes to `mockDb.smartLinks`, emits `smartLinks:changed`, and increments the `mockCache` counter key for that slug (simulating Redis INCR).

- [x] **Smart link service** (`/modules/links/services/linkService.ts`):
  - `generateLink(userId, campaignId)` — idempotent; returns existing or creates new
  - `getLinkStats(linkId)`
  - `expireLink(linkId)`
  - `logLinkEvent(slug, eventType, requestMeta)`

- [x] **Slug generation** (`/lib/utils/slug.ts`):
  - Format: short random alphanumeric string (e.g. `x4k9mq`) — URL-safe, lowercase, 6–8 chars
  - **Must be opaque and immutable** — never derived from username or any mutable user field
  - Collision detection against `mockDb.smartLinks` before persisting
  - `userId` and `campaignId` are stored on the SmartLink record — not encoded into the slug

- [x] **API routes:**
  - `POST /api/smart-links/generate` — body: `{ campaignId }` — returns link
  - `GET /api/smart-links` — list user's links (authed)
  - `GET /api/smart-links/[id]` — single link with stats
  - `DELETE /api/smart-links/[id]` — expire link (admin+)

- [x] **Public redirect route** (`/app/c/[slug]/route.ts`):
  - Looks up `mockDb.smartLinks.findUnique({ where: { slug } })` — single param, no username dependency
  - Logs `CLICK` event with device/referrer from request headers
  - Redirects to campaign CTA URL
  - Returns 404 if slug not found or link is expired

- [x] **`useSmartLink(campaignId)` hook** — fetches or generates user's link for a campaign
- [x] **`SmartLinkCard` component** — displays link, copy button, click count, expiry
- [x] **`SmartLinkStats` component** — mini stat strip (clicks, conversions, referrals)

---

## Phase 6 — Engagement Tracking ✅

### Goals

Aggregate and surface engagement metrics. Backs the user-facing analytics panel and admin overview.

### Files

`/modules/engagement/`  
`/app/api/engagement/`

### Tasks

- [x] **Engagement service** (`/modules/engagement/services/engagementService.ts`):
  - `getUserEngagement(userId, campaignId?)` → `{ shares, clicks, views, conversions, referrals, uniqueVisitors }`
  - `getCampaignEngagement(campaignId)` → aggregate stats across all participants
  - `getEngagementTimeline(userId, campaignId, interval)` → time-series array

- [x] **API routes:**
  - `GET /api/engagement/me` — personal stats (optionally filtered by campaign)
  - `GET /api/engagement/campaigns/[id]` — campaign-level aggregate (admin/leader)
  - `GET /api/engagement/timeline` — time-series data for charts

- [x] **`EngagementStatStrip` component** — horizontal row of stat pills with icons (from `/config/icons.ts`)
- [x] **`EngagementChart` component** — line chart (Ant Design Charts or recharts)
- [x] **`useEngagement(campaignId?)` hook**

---

## Phase 7 — Referral Engine ✅

### Goals

Track who invited whom, attribute referrals to campaigns and inviters, surface referral network stats.

### Files

`/modules/referral/`  
`/app/api/referrals/`

### Tasks

- [x] **Mock DB referral table** — `mockDb.referrals` is the single source. Service methods call `mockDb.referrals.create / findMany`. On create, emit `referrals:changed`.

- [x] **Referral service** (`/modules/referral/services/referralService.ts`):
  - `attributeReferral(slug, registeredUserId)` — idempotent
  - `getReferralStats(userId, campaignId?)` → `{ totalReferrals, activeReferrals, conversionRate }`
  - `getTopReferrers(campaignId, limit)` → leaderboard input

- [x] **URL flow**: registration page reads `?ref={slug}` query param → `attributeReferral` called post-register

- [x] **API routes:**
  - `GET /api/referrals/me` — user's referral stats
  - `GET /api/referrals/campaigns/[id]` — campaign referral aggregate (admin)

- [x] **`ReferralLinkPanel` component** — shows referral link, tree count, direct invite button
- [x] **`ReferralStats` component** — stat cards for referrals earned

---

## Phase 8 — Points / Gamification Engine ✅

### Goals

Award, record, and summarize points. Determine rank level. Display progress toward next rank.

### Files

`/modules/points/`  
`/app/api/points/`

### Tasks

- [x] **Mock DB points table** — `mockDb.pointsLedger` is the single source. The `getSummary` result is cached in `mockCache` with key `points:summary:{userId}:{campaignId?}` and invalidated on each `award` write.

- [x] **Points configuration** (`/lib/constants.ts` — `POINTS_CONFIG`):
  - Object-driven: `{ CLICK_RECEIVED: { type: 'IMPACT', value: 1 }, REFERRAL_JOINED: { type: 'LEADERSHIP', value: 25 }, ... }`
  - Never hardcode point values inside service logic — always read from config

- [x] **Rank levels config** (`/config/ranks.ts`):
  - Array of `{ level, name, minScore, badge, color, perks[] }` — fully config-driven
  - Components loop this array — never switch-case on level names

- [x] **Points service** (`/modules/points/services/pointsService.ts`):
  - `award(userId, campaignId, action)` — looks up POINTS_CONFIG, writes to ledger
  - `getTotal(userId, campaignId?)` — sum of all point types
  - `getRank(userId)` — finds current rank from total vs RANK_LEVELS config
  - `getProgress(userId)` → `{ currentRank, nextRank, pointsToNext, progressPercent }`

- [x] **API routes:**
  - `GET /api/points/me` — personal point summary + rank
  - `GET /api/points/ledger` — full ledger (paginated)
  - `GET /api/points/leaderboard-input/[campaignId]` — internal (consumed by leaderboard module, not user-facing)

- [x] **`PointsSummaryCard` component** — glass card with IP/CP/LP/RP breakdown + total
- [x] **`RankBadge` component** — displays current rank name, icon, color from config
- [x] **`RankProgress` component** — progress bar toward next rank
- [x] **`usePoints(campaignId?)` hook**

---

## Phase 9 — Leaderboard Engine ✅

### Goals

Rank users by score per campaign and globally. Display real-time and snapshotted leaderboards.

### Files

`/modules/leaderboard/`  
`/app/api/leaderboard/`

### Tasks

- [x] **Mock DB leaderboard table** — `mockDb.leaderboardSnapshots` stores snapshots. `getLatestSnapshot(campaignId)` checks `mockCache` first (key: `leaderboard:{campaignId}`); on miss, queries `mockDb.leaderboardSnapshots`, caches result with 60s TTL, returns data.

- [x] **Leaderboard service** (`/modules/leaderboard/services/leaderboardService.ts`):
  - `computeRankings(campaignId)` — reads points summaries, sorts, assigns rank positions
  - `getLeaderboard(filter)` — supports `individual | team | group | global`
  - `getUserRank(userId, campaignId)` → `{ position, score, percentile }`
  - `refreshSnapshot(campaignId)` — computes + stores snapshot (called by scheduler/event)

- [x] **API routes:**
  - `GET /api/leaderboard/campaigns/[id]` — campaign leaderboard (paginated)
  - `GET /api/leaderboard/global` — global rankings
  - `GET /api/leaderboard/me` — current user's rank across active campaigns

- [x] **`LeaderboardTable` component** — ranked rows with avatar, name, score, points breakdown, rank badge; config-driven columns
- [x] **`LeaderboardPodium` component** — top 3 visual showcase (bento glass cards)
- [x] **`MyRankCard` component** — user's personal rank card in leaderboard section
- [x] **`LeaderboardFilters` component** — toggle individual/team/global views

---

## Phase 10 — Donation Module ✅

### Goals

Track donations linked to campaigns and users. Surface fundraising progress.

### Files

`/modules/donation/`  
`/app/api/donations/`

### Tasks

- [x] **Mock DB donation table** — `mockDb.donations` is the single source. On `create`, emit `donations:changed` and invalidate `mockCache` key `donations:stats:{campaignId}`.

- [x] **Donation service** (`/modules/donation/services/donationService.ts`):
  - `recordDonation(input)` — validates, stores, awards LP
  - `getCampaignFundraisingStats(campaignId)` → `{ totalRaised, donorCount, conversionRate, topDonors[] }`
  - `getUserDonations(userId)` → paginated history

- [x] **API routes:**
  - `POST /api/donations` — record donation (authenticated)
  - `GET /api/donations/me` — user donation history
  - `GET /api/donations/campaigns/[id]` — campaign fundraising stats (admin/leader)

- [x] **`DonationForm` component** — amount + message + campaign select; Zod validated
- [x] **`FundraisingProgress` component** — goal vs raised progress bar (glass card)
- [x] **`DonationHistory` component** — paginated list of past donations
- [x] **`TopDonors` component** — leaderboard-style donor ranking

---

## Phase 11 — Trust & Fraud Detection ✅

### Goals

Detect and flag suspicious behavior. Score users. Give admins review tools.

### Files

`/modules/trust/`  
`/app/api/trust/`

### Tasks

- [x] **Mock DB trust table** — `mockDb.trustScores` is the single source. `updateScore` writes to the table and emits `trustScores:changed`. Hooks subscribed via `useMockDbSubscription('trustScores', ...)` will re-render affected components automatically.

- [x] **Fraud detection rules** (`/modules/trust/config.ts`):
  - Config-driven rule objects: `{ id, name, check(event, history), penalty, flag }`
  - Rules: duplicate events within window, click velocity threshold, device fingerprint repeat
  - Never hardcode thresholds in service — read from rule config

- [x] **Trust service** (`/modules/trust/services/trustService.ts`):
  - `evaluateEvent(linkEvent)` — runs all fraud rules, flags/penalizes as needed
  - `getUserTrustScore(userId)` → score + active flags
  - `reviewFlag(flagId, resolution, adminId)` — admin review action

- [x] **API routes:**
  - `GET /api/trust/me` — own trust score (users see behavioral score, not internal flags)
  - `GET /api/trust/users` — flagged users list (super admin)
  - `POST /api/trust/users/[id]/review` — admin reviews a flag

- [x] **`TrustScoreIndicator` component** — compact badge shown on user profile
- [x] **`FlaggedUsersTable` component** — admin table with flag details, review actions
- [x] **`TrustReviewModal` component** — admin modal for resolving a flag

---

## Phase 12 — Analytics Dashboard ✅

### Goals

User personal analytics page. Admin campaign analytics page. Both fully populated from services, zero hardcoded data.

### Files

`/modules/analytics/`  
`/app/(dashboard)/analytics/`  
`/app/(admin)/analytics/`

### Tasks

- [x] **Analytics service** (`/modules/analytics/services/analyticsService.ts`):
  - `getUserAnalytics(userId)` → `{ engagement, points, rank, referrals, donations, streaks }`
  - `getCampaignAnalytics(campaignId)` → `{ participants, growth, topPerformers, engagementTrend, fundraising }`
  - `getOverviewAnalytics()` → admin global overview

- [x] **KPI config** (`/modules/analytics/config.ts`):
  - `KPI_CARDS: KpiCardConfig[]` — single array; each entry includes `allowedRoles: UserRole[]`
  - `ANALYTICS_SECTIONS: PageSection[]` — all analytics sections with `allowedRoles`; the page filters this array by current user's role and renders only permitted sections
  - All stat cards rendered via `.map()` over the role-filtered config

- [x] **Components:**
  - `KpiStatCard` — glass bento card; receives `KpiCardConfig + value`
  - `KpiBentoGrid` — role-filtered bento layout; accepts full `KPI_CARDS` array + user role; renders only permitted cards
  - `EngagementTimelineChart` — line chart of activity over time
  - `TopPerformersTable` — ranked table with config-driven columns (shown to all roles; column set varies by role)
  - `CampaignGrowthChart` — participant growth over campaign duration (admin + team lead)
  - `AnalyticsSectionRenderer` — iterates `ANALYTICS_SECTIONS`, filters by role, renders each permitted section

- [x] **Pages (single route, role-aware rendering):**
  - `/app/(dashboard)/analytics/page.tsx` — one analytics page for all roles; renders personal KPIs always; renders campaign-aggregate and global sections only when role permits; subscribes to `mockDb` via `useMockDbSubscription` for live updates

---

## Phase 13 — Admin Module + Landing Page ✅

### Goals

Admin control panel for campaign/user management. Public landing page for DMHicc.

### Tasks

**Admin Panels (role-aware sections, not separate routes):**

- [x] No `/app/(admin)/` route group — admin capabilities are **sections within shared pages**, revealed when `user.role` is ADMIN or SUPER_ADMIN
- [x] Admin-only page sections are declared in each module's `config.ts` with `allowedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]`
- [x] The following admin-only section components are added to existing shared pages:
  - `CampaignAdminPanel` — injected into `/campaigns/page.tsx` — create/edit/archive tools
  - `UserManagementPanel` — injected into `/settings/page.tsx` — user list, role assignment
  - `TrustReviewPanel` — injected into `/settings/page.tsx` — flagged users, trust review
  - `GlobalLeaderboardAdminView` — injected into `/leaderboard/page.tsx` — snapshot refresh, manual adjustments
  - `RewardConfigPanel` — injected into `/settings/page.tsx` — reward type configuration
- [x] Sidebar nav items for admin sections are in `/config/navigation.ts` with `allowedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]`; the `Sidebar` component filters nav items by user role
- [x] Route-level protection via Next.js `middleware.ts` for create/delete/manage actions — role check at API route level, not page level

**Landing Page:**

- [x] `/app/(public)/page.tsx` — fully driven by `/config/content.ts`
- [x] Sections (all content from config):
  - Hero: headline, subhead, CTA
  - Feature tiles: loop `FEATURES_LIST` config
  - How it works: loop `HOW_IT_WORKS_STEPS` config
  - Stats: loop `PLATFORM_STATS` config
  - FAQ: loop `FAQ_ITEMS` config
  - CTA footer
- [x] `LandingHero`, `FeatureTile`, `HowItWorksStep`, `StatTicker`, `FaqItem` components
- [x] All literal strings extracted to `/config/content.ts` — zero hardcoded copy in JSX

---

## Phase 14 — Prisma + Real Database ✅

### Goals

Swap the in-memory mock layer for real PostgreSQL via Prisma Accelerate, Upstash Redis for caching, and Cloudinary for media uploads. Service layer + API routes migrated — no component layout changes.

### Tasks

- [x] Full Prisma schema in `/prisma/schema.prisma`:
  - 16 models: User, Campaign, CampaignParticipation, SmartLink, LinkEvent, Referral, Donation (Decimal(12,2)), PointsLedgerEntry, LeaderboardSnapshot, TrustScore, AppNotification, ViewProof, Group, Team, TeamInviteLink, CampaignAuditEvent
  - 15 enums matching global.d.ts
  - All relations, @@unique constraints, @@index on high-query fields
  - Team.memberIds → User.teamId FK relation; Group.teamIds → Team.groupId FK relation
- [x] Prisma client singleton (`/lib/prisma.ts`) with `withAccelerate()` extension for Prisma Accelerate URLs
- [x] Upstash Redis adapter (`/lib/redis.ts`) — REST-based, `dmhicc:v1:` key namespace, mirrors mockCache API
- [x] Cloudinary server-side helper (`/lib/cloudinary.ts`) — `uploadAsset()` / `deleteAsset()`, folder mapping per AssetCategory, no avatars (DiceBear)
- [x] Polling hook (`/hooks/useAutoRefresh.ts`) replacing `useMockDbSubscription` — tab-visibility-aware, configurable intervals
- [x] Per-table refresh intervals config (`/config/realtime.ts`)
- [x] Date/Decimal serialiser (`/lib/utils/serialize.ts`) for Prisma→JSON round-trips
- [x] All 12 service files migrated from mockDb to Prisma queries with `$transaction` for multi-table writes:
  - userService, campaignService, linkService, engagementService, referralService, pointsService, donationService, leaderboardService, analyticsService, teamService, trustService, publicStatsService
- [x] All 13 API routes migrated from mockDb to Prisma:
  - auth/login, auth/register, auth/refresh, users/me, users/weapons, smart-links/[id], campaigns/me, campaigns/joined, notifications, notifications/[id], notifications/read-all, engagement/proofs, engagement/proofs/[id]/review
- [x] Public landing page converted to async server component with Prisma queries
- [x] Upload API route migrated to Cloudinary (`uploadAsset()` integration)
- [x] All hooks/components swapped from `useMockDbSubscription` to `useAutoRefresh` (14 files)
- [x] Seed script: `prisma/seed.ts` — deterministic seed data matching original mockDb fixtures, Prisma-native `createMany`
- [x] `package.json` updated with `db:generate`, `db:push`, `db:seed`, `db:migrate`, `db:studio` scripts + `prisma.seed` config
- [x] Redis caching: campaigns list, leaderboard, user trust scores, public stats, points summaries
- [x] Validate all TypeScript types align with generated Prisma types

---

## Phase 15 — Stabilization, QA & Deploy Readiness

### Tasks

- [ ] `npx tsc --noEmit` — zero errors
- [ ] ESLint clean pass — zero warnings
- [ ] Full manual QA pass against PRD functional requirements (FR1–FR30)
- [ ] Performance audit: dashboard load < 3s, link generation < 1s
- [ ] Responsive check: all pages usable on 375px mobile, 768px tablet
- [ ] Dark mode pass: all pages correct in dark theme
- [ ] Error boundaries on all major sections
- [ ] 404 and error pages (config-driven copy)
- [ ] Environment variables documented in `.env.example`
- [ ] `README.md` with setup instructions
- [ ] Deployment config (Vercel-ready: `vercel.json` or default detection)

---

## Module Dependency Graph

```
Auth
  ↓
Campaign ← SmartLink
  ↓             ↓
Engagement ← LinkEvents
  ↓
Referral
  ↓
Points
  ↓
Leaderboard
  ↑
Donation → Points
  ↑
Trust ← LinkEvents
  ↑
Analytics ← (all modules)
```

---

## Key Files Reference

| File                             | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `app/globals.css`                | Single source of truth for all design tokens              |
| `config/content.ts`              | Every string visible to users (no hardcoded JSX copy)     |
| `config/navigation.ts`           | All nav item arrays — each item has `allowedRoles[]`      |
| `config/routes.ts`               | All route strings as typed constants                      |
| `config/icons.ts`                | All Ant Design icon imports                               |
| `lib/constants.ts`               | POINTS_CONFIG, RANK_LEVELS, limits, durations             |
| `lib/data/mockDb.ts`             | Global mock DB singleton (legacy — replaced by Prisma in Phase 14) |
| `lib/data/mockCache.ts`          | Mock Redis TTL cache (legacy — replaced by Upstash in Phase 14) |
| `lib/data/seed.ts`               | Legacy mock seed data (replaced by prisma/seed.ts)        |
| `lib/prisma.ts`                  | PrismaClient singleton with Accelerate extension          |
| `lib/redis.ts`                   | Upstash Redis adapter with dmhicc:v1: namespace           |
| `lib/cloudinary.ts`              | Cloudinary upload/delete helpers per asset category        |
| `lib/utils/serialize.ts`         | Date/Decimal→primitive serialiser for API responses        |
| `prisma/schema.prisma`           | 16 models, 15 enums, all relations + indexes              |
| `prisma/seed.ts`                 | Prisma-native deterministic seed script                   |
| `config/realtime.ts`             | Per-table polling intervals for useAutoRefresh             |
| `hooks/useAutoRefresh.ts`        | Tab-visibility-aware polling hook (replaced useMockDbSubscription) |
| `providers/AntdProvider.tsx`     | Ant Design token bridge (CSS vars → antd)                 |
| `lib/middleware/auth.ts`         | getAuthenticatedUser, requireRole                         |
| `types/global.d.ts`              | ALL core types declared globally — no imports needed      |
| `lib/utils/api.ts`               | Typed API response helpers                                |
| `lib/utils/roleGuard.ts`         | filterByRole utility for allowedRoles config filtering    |
| `hooks/useRole.ts`               | hasRole, canAccess helpers from AuthContext               |
