# DMHicc — Project Context

> **Digital Mobilization & Harvest Impact Campaign Center**
> Standalone Campaign Management Platform · Built for Harvesters International Christian Centre

---

## 1. Product Vision

DMHicc transforms fragmented, manual faith-based digital campaigns into a structured, measurable, scalable platform. The system converts:

> **Digital participation → measurable campaign impact**

Faith communities generate enormous digital reach — but without structure, tracking, or accountability, that reach produces no quantifiable outcome. DMHicc solves this by giving every mobilizer a personal smart link, every campaign a lifecycle, every action a point value, and every leader a live dashboard.

---

## 2. Positioning

| Property               | Value                                                      |
| ---------------------- | ---------------------------------------------------------- |
| **System type**        | Standalone campaign management platform                    |
| **Organization**       | Harvesters International Christian Centre                  |
| **Future integration** | Harvesters CRM (integration-ready, not integrated in MVP)  |
| **Audience**           | Internal mobilizers, campaign admins, team leaders, donors |
| **Access**             | Web (desktop-first, mobile-responsive)                     |

---

## 3. Stakeholder Map

| Stakeholder                 | Role in System                                        |
| --------------------------- | ----------------------------------------------------- |
| **Campaign Admin**          | Creates, configures, and manages campaigns            |
| **Mobilizer (User)**        | Participates, shares links, earns points              |
| **Team Leader**             | Monitors group performance, coaches mobilizers        |
| **Organization Leadership** | Views aggregate impact across campaigns               |
| **Donor**                   | Contributes to campaigns; tracked via donation engine |
| **System Admin**            | Platform governance, user management, fraud review    |

---

## 4. Core Capabilities

### 4.1 Campaign Engine

- Campaign lifecycle: Draft → Active → Paused → Completed → Archived
- Admin creates campaigns with title, description, media, duration, goals, targets
- Users join campaigns and receive a unique participation record

### 4.2 Smart Link Engine

- Every user–campaign combination generates a unique trackable slug: `dmhicc.org/c/{username}/{campaignId}`
- Links track: clicks, devices, locations, referrers, session duration
- Links support expiration dates

### 4.3 Engagement & Sharing Tracking

- Total shares, clicks, unique visitors, views, conversions tracked per link
- Activity attributed to both user and campaign
- Redis-backed counters for real-time updates

### 4.4 Referral Engine

- Users invite others via referral codes embedded in smart links
- Referrals attributed to inviter and campaign
- Referral growth factors into performance score

### 4.5 Gamification & Points Engine

- **Impact Points (IP):** Awarded for clicks, conversions, engagement on shared content
- **Consistency Points (CP):** Awarded for regular daily/weekly activity streaks
- **Leadership Points (LP):** Awarded for successful referrals and team growth
- **Reliability Points (RP):** Awarded for accurate reporting, meeting goals
- Total score drives rank level and leaderboard position

### 4.6 Leaderboard Engine

- Rankings: Individual, Team, Group, Global
- Snapshots cached via Redis; updated on scoring events
- Viewable per campaign and globally

### 4.7 Donation Module

- Users donate and share donation links
- System tracks funds raised, conversion rate, donation source per campaign
- Donor-side view: contribution history

### 4.8 Trust & Fraud Detection

- Detects duplicate activity, abnormal click patterns, suspicious devices
- Trust score per user; flagged accounts reviewed by admin
- Automatic rate limiting on link events

### 4.9 Analytics Dashboard

- **User view:** Shares, clicks, conversions, donations, streaks, rank
- **Admin view:** Campaign growth, engagement trends, top performers, global stats
- Data fed by Redis cache + PostgreSQL persistent store

---

## 5. Data Architecture Overview

### Core Entities

| Entity                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `User`                  | Account, role, trust score                  |
| `Campaign`              | Campaign record with lifecycle state        |
| `CampaignParticipation` | User–campaign linkage, join date            |
| `SmartLink`             | Unique per user–campaign, slug, expiry      |
| `LinkEvent`             | Click/view/conversion event on a smart link |
| `Referral`              | Inviter → invited user attribution          |
| `Donation`              | Contribution record per campaign/user       |
| `PointsLedger`          | Per-user points log with type and campaign  |
| `LeaderboardSnapshot`   | Scored rank snapshot per campaign/period    |
| `TrustScore`            | Behavioral score + fraud flags per user     |

### Phase 1 Data Layer

The mock data layer is a **globally instantiated singleton** that mirrors the production Prisma + Redis architecture exactly — it is not a collection of isolated per-module arrays.

**`/lib/data/mockDb.ts` — Global Mock DB Singleton**

- Single exported `mockDb` instance, imported wherever data access is needed (API routes, service files, hooks)
- Extends Node.js `EventEmitter` — emits a namespaced change event (`'<table>:changed'`) after every write operation (create, update, delete)
- Holds all domain tables as typed in-memory arrays: `users`, `campaigns`, `participations`, `smartLinks`, `linkEvents`, `referrals`, `donations`, `pointsLedger`, `leaderboardSnapshots`, `trustScores`
- Each table exposes the same method surface as Prisma model delegates: `findUnique`, `findMany`, `create`, `update`, `delete`, `count` — so the service layer swap at Phase 14 is mechanical
- Hydrated once on module load by `seedMockDb()` from `seed.ts`

**`/lib/data/mockCache.ts` — Mock Redis Cache**

- Simulates a Redis key-value store with TTL: `set(key, value, ttlMs?)`, `get(key)`, `del(key)`, `exists(key)`, `invalidatePattern(prefix)`
- Entries auto-expire after their TTL
- Used by services wherever production code would use Redis: click counters (incremented per smart link slug), leaderboard snapshots (60s TTL), donation/point aggregate stats
- Method names mirror `ioredis` API — the production swap in Phase 14 is a one-line import change per service

**`/lib/data/seed.ts` — Deterministic Fixtures**

- Provides `seedMockDb()` called by `mockDb` on initialisation
- Fixtures are deterministic (same data every cold start) — includes users for all 4 roles, 8 campaigns, participations, smart links, events, referrals, donations, points ledger entries
- All fixture shapes match the Prisma schema field names and types exactly

**`/hooks/useMockDbSubscription.ts` — Live Update Hook**

- `useMockDbSubscription(tableName, onChange)` — subscribes to `mockDb` EventEmitter for `'<tableName>:changed'` events
- Calls `onChange` (typically a state setter or `router.refresh()`) whenever the table is mutated anywhere in the app
- Simulates real-time DB subscriptions — components that use this hook re-render immediately after any service writes to `mockDb`

**Phase 14 Production Swap:** The Prisma client replaces `mockDb` and Redis replaces `mockCache`. Only the service layer (`/modules/<domain>/services/`) changes — no components, hooks, or API routes require modification.

---

## 6. Role & Permission Matrix

| Feature               | User | Team Lead | Admin | Super Admin |
| --------------------- | ---- | --------- | ----- | ----------- |
| Join Campaign         | ✓    | ✓         | ✓     | ✓           |
| Share Links           | ✓    | ✓         | ✓     | ✓           |
| Invite Users          | ✓    | ✓         | ✓     | ✓           |
| View Personal Stats   | ✓    | ✓         | ✓     | ✓           |
| View Team Stats       | —    | ✓         | ✓     | ✓           |
| Create Campaign       | —    | —         | ✓     | ✓           |
| Edit Campaign         | —    | —         | ✓     | ✓           |
| End Campaign          | —    | —         | ✓     | ✓           |
| Manage Rewards        | —    | —         | ✓     | ✓           |
| View Global Analytics | —    | —         | ✓     | ✓           |
| Manage Users          | —    | —         | —     | ✓           |
| Trust Review / Flags  | —    | —         | —     | ✓           |

## 6.1 Role-Aware Rendering Architecture

DMHicc has **no role-split page routes**. There is no `/app/(admin)/` or `/app/(user)/` route group. Every authenticated page lives under a single `/(dashboard)` route group and is accessible at one URL.

Role-conditional behaviour is entirely in the **render layer**:

- Every nav item config, page section config, KPI card config, and feature panel config carries an `allowedRoles: UserRole[]` field
- The `Sidebar` and page layout components call `filterByRole(items, user.role)` at render time to show only permitted items — never via URL structure
- Admin-only panels (`CampaignAdminActions`, `TrustReviewPanel`, `UserManagementPanel`, etc.) are sections within shared pages, not separate routes
- Route-level access is enforced only at **API routes** via `requireRole([...])` middleware — the page itself is never gated
- The result: a user and an admin visit the same URL (`/campaigns`) but see different sections; the admin sees additional management panels that the user does not

---

## 7. Integration Readiness

DMHicc is built as a **standalone monolith** but is structured for future CRM integration:

- Auth module uses JWT + httpOnly cookies — portable to any SSO layer
- All user data references `userId` (UUID) — maps cleanly to CRM user records
- Module barrel exports (`/modules/<domain>/index.ts`) provide clean API surface for future federation
- API routes follow REST conventions — wrappable behind a future API gateway
- No hardcoded org IDs — `organizationId` field scaffolded on Campaign for multi-tenancy

---

## 8. Reused From Previous Iteration

The following patterns and code from the Harvesters CRM campaign sub-module are carried forward:

| Relic                                  | Status in DMHicc                                                        |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `CampaignCard.tsx`                     | Extended — adds participation stats, smart link CTA                     |
| `CampaignList.tsx`                     | Retained — story + grid view pattern kept                               |
| `CampaignModal.tsx`                    | Retained — keyboard navigation, progress dots kept                      |
| `CampaignBanner.tsx`                   | Extended — adds progress toward campaign goal                           |
| `CampaignStory.tsx`                    | Retained — gradient ring, avatar story style kept                       |
| `Campaign` type + enums                | Extended — adds `startDate`, `endDate`, `goalType`, participation stats |
| `CampaignStatus` enum                  | Extended — adds `PAUSED`                                                |
| `CampaignInteractionType`              | Retained as base for `LinkEventType`                                    |
| Route patterns (GET/POST `/campaigns`) | Extended + role-adapted for new role matrix                             |
| Design token system (ds-\*)            | Retained architecture, new palette for DMHicc                           |
| Glassmorphism / bento layout rules     | Fully retained                                                          |

---

## 9. Non-Functional Requirements

| Concern               | Target                                                   |
| --------------------- | -------------------------------------------------------- |
| Dashboard load        | < 3 seconds                                              |
| Link generation       | < 1 second                                               |
| Analytics refresh     | < 5 seconds                                              |
| Link event throughput | 100M+ links supportable via Redis + shardable slug model |
| Availability          | 24/7                                                     |
| Security              | RBAC + JWT + audit logs + encrypted link slugs           |
| Privacy               | No personal data in link slugs; GDPR-aware event storage |

---

## 10. Out of Scope (MVP)

- Social media posting automation
- Direct content publishing APIs
- External CRM integration (integration-ready, not connected)
- Offline engagement tracking
- Mobile native app
- Payment gateway (donations tracked, but payment processing via external link in MVP)
