# GitHub Copilot Instructions — DMHicc Campaign Management System

## Project Identity

**DMHicc** (Digital Mobilization & Harvest Impact Campaign Center) is a standalone Next.js 15+ campaign management platform enabling structured digital mobilization, smart link distribution, referral tracking, gamification, and fundraising. It is designed to integrate into the Harvesters CRM later but is fully self-contained for the MVP.

---

## Core Coding Philosophy

### 1. Dynamic Over Static — No Hardcoding

Every piece of user-visible content must come from a data source, config object, or typed variable — never a literal string embedded directly in JSX. Static copy (headings, descriptions, CTAs, footer text, FAQ, feature lists) must live in a content config file and be rendered by looping or interpolation.

```ts
// ✅ Correct
import { LANDING_CONTENT } from "@/config/content";
<h1>{LANDING_CONTENT.hero.headline}</h1>

// ❌ Wrong
<h1>Transform Your Digital Outreach</h1>
```

### 2. Object-Driven & Config-Driven Rendering

UI sections that repeat (stat cards, nav items, feature tiles, leaderboard rows, campaign cards, reward badges) **must** be built as typed config arrays rendered via `.map()`. No copy-pasting of JSX blocks.

```ts
// ✅ Correct
{NAV_ITEMS.map((item) => <NavItem key={item.key} {...item} />)}

// ❌ Wrong — repeated JSX blocks for each nav item
```

### 3. Modular OOP Architecture

Each domain lives in `/modules/<domain>/`. No cross-module imports other than shared `/lib`, `/config`, and `/components`. Modules export their own types, services, hooks, and components via `index.ts`.

### 4. TypeScript Strict Mode — No `any`

All data shapes must be fully typed. Use `satisfies`, discriminated unions, and `unknown` over `any`. Use `zod` for runtime validation at API boundaries.

### 5. Role-Aware Rendering — No Role-Based Page Duplication

Pages are **role-agnostic routes**. There is never a separate `/admin/campaigns` and `/user/campaigns`. One page route serves all roles — the components and sections it renders adapt based on the authenticated user's role, read from `AuthContext`.

```tsx
// ✅ Correct — one page, role-aware rendering
const { user } = useAuth();
{user.role === UserRole.ADMIN && <CampaignAdminActions />}
{CAMPAIGN_SECTIONS.filter(s => s.allowedRoles.includes(user.role)).map(s => ...)}

// ❌ Wrong — duplicate pages per role
// /app/(admin)/campaigns/page.tsx
// /app/(user)/campaigns/page.tsx
```

All page section configs include an `allowedRoles` array. Components filter by role at render time — they never gate by URL.

### 6. Global Type Declarations — No Repetitive Imports

All core domain types and enums are declared as **global ambient types** in `types/global.d.ts`. This file is referenced in `tsconfig.json` via `include`, making every type available in every `.ts` and `.tsx` file without an import statement.

```ts
// ✅ Correct — type used directly, no import needed
const campaign: Campaign = { ... };
const role: UserRole = UserRole.ADMIN;

// ❌ Wrong — per-file import for core types
import { Campaign, UserRole } from "@/modules/campaign/types";
```

Only module-specific types not declared globally (e.g. internal service inputs) are imported from module barrels.

### 7. Mock DB Mirrors Production — Real-Time Simulation

The mock database is a **globally instantiated singleton** at `/lib/data/mockDb.ts`. It exposes the same interface that the Prisma service layer will use in production — so the swap at Phase 14 is a one-file change per domain, not a refactor.

The mock DB:

- Holds all tables as typed in-memory arrays
- Emits change events via a lightweight `EventEmitter` so subscribed hooks re-render on data mutations (simulating real-time DB updates)
- Has a cache layer (`/lib/data/mockCache.ts`) that simulates Redis — TTL-based key-value store with `get`, `set`, `invalidate`
- Is seeded from deterministic fixture data in `/lib/data/seed.ts`
- Is accessible from both API routes and hooks — single source of state truth during development
- Exposes `mockDb.transaction(callback)` for ACID boundary marking — swaps to `prisma.$transaction(callback)` at Phase 14 with no service restructuring

**ACID rules — apply from day one:**

- **Atomicity:** any service function writing to more than one table MUST use `mockDb.transaction()`. No bare multi-step sequential writes across tables.
- **Consistency:** run Zod validation at the API route boundary AND enforce business rule guards in the service function before any write (e.g. reject join on ARCHIVED campaign).
- **Isolation:** read-then-write operations (check-then-create) perform both steps inside the same `transaction()` callback.
- **Durability:** in-memory in dev — intentional; do not write code that assumes persistence across restarts.

```ts
// ✅ Correct — multi-table write uses transaction boundary
await mockDb.transaction(async (tx) => {
  const participation = await tx.participations.create(input);
  await tx.pointsLedger.create({
    userId,
    campaignId,
    type: PointType.IMPACT,
    value: 10,
  });
  mockCache.invalidate(`points:summary:${userId}`);
  mockDb.emit("participations:changed");
});

// ✅ Correct — single-table write (no transaction wrapper needed)
await mockDb.campaigns.create(input);
mockCache.invalidate("campaigns:list");
mockDb.emit("campaigns:changed");

// ❌ Wrong — multi-table write with no transaction boundary
await mockDb.participations.create(input);
await mockDb.pointsLedger.create(pointsInput); // unguarded — partial state if this throws

// ❌ Wrong — isolated in-memory array per module with no cross-app visibility
const campaigns: Campaign[] = []; // local to file
```

---

## Tech Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Framework     | Next.js 15+ (App Router)                   |
| Language      | TypeScript (strict)                        |
| UI Library    | Ant Design v5                              |
| Styling       | Tailwind CSS v4                            |
| ORM           | Prisma                                     |
| Database      | PostgreSQL                                 |
| Cache / Queue | Redis                                      |
| Media         | Cloudinary                                 |
| Auth          | JWT (httpOnly cookies) + custom middleware |
| Validation    | Zod                                        |
| State         | React Context + Server Components          |
| Animation     | Framer Motion (selective)                  |

---

## File & Folder Conventions

```
/app                      Next.js App Router pages and layouts
  /(auth)                 Login, register (public, unauthenticated)
  /(dashboard)            All authenticated app pages — role-aware, not role-split
  /(public)               Landing page, public campaign views
  /api                    API route handlers
  /c/[slug]              Public smart link redirect handler (slug is immutable primary key on SmartLink record)
/modules
  /<domain>
    /components           Domain-specific UI components
    /hooks                Domain hooks
    /services             Business logic + API calls
    /config.ts            Domain config/constants + allowedRoles definitions
    /index.ts             Barrel export (types re-exported from global.d.ts, not redeclared)
/components
  /ui                     Shared primitive components (Button, Card, Modal, etc.)
  /layout                 App shell (Sidebar, Header, Footer)
  /glass                  Glassmorphism component variants
/config
  content.ts              ALL static copy — landing page, labels, metadata
  routes.ts               Typed route constants
  navigation.ts           Nav items config — each item includes allowedRoles[]
  icons.ts                Centralized Ant Design icon map
/lib
  /data
    mockDb.ts             Global mock DB singleton — all tables, CRUD, EventEmitter
    mockCache.ts          Mock Redis cache — TTL key-value store, get/set/invalidate
    seed.ts               Deterministic seed data for all tables
  /utils                  Shared utilities (api, slug, points, format, cn, pagination)
  /middleware             Auth middleware (getAuthenticatedUser, requireRole)
/providers                AntdProvider, ThemeProvider, AuthProvider
/hooks                    Global hooks (useAuth, useRole, useMockDbSubscription)
/types
  global.d.ts             ALL core types declared as global ambient — no import needed
/prisma                   Schema + migrations (Phase 14)
```

---

## Design System Rules

- All color, spacing, radius, shadow values come from CSS tokens prefixed `--ds-*`. **Never use raw Tailwind palette classes** (`blue-600`, `gray-800`) for semantic purposes.
- Glassmorphism applies only to: KPI stat cards, analytics overview blocks, modal headers, campaign story rings.
- Glow borders apply only to: active nav items, selected cards, hover on interactive cards, focused inputs.
- Bento grid layout for dashboard KPI sections; standard full-width for data tables and forms.
- The design system is fully documented in `.github/design-system.md`.

---

## API & Data Patterns

- Mock DB (`/lib/data/mockDb.ts`) is a global singleton throughout Phase 1–13. Prisma replaces it at Phase 14 — service layer swap only, no component or hook changes.
- The mock DB emits change events; hooks subscribe via `useMockDbSubscription(table, callback)` to receive live updates — simulating real-time DB subscriptions.
- Mock cache (`/lib/data/mockCache.ts`) simulates Redis. All service functions that would use Redis in production must use `mockCache` in development.
- API routes at `/app/api/<domain>/route.ts` and `/app/api/<domain>/[id]/route.ts`.
- Always return typed responses using the shared `ApiResponse<T>`, `PaginatedResponse<T>` wrappers.
- Auth enforced via `getAuthenticatedUser()` and `requireRole([...])` middleware utilities.
- Page sections and admin-only UI panels use `allowedRoles` config arrays checked at render time — never gated by separate route paths.

---

## Component Rules

- Every component has a typed `Props` interface at the top of the file.
- No component defines data inline — data is passed via props or fetched via a hook/service.
- Export components as default, types as named.
- Client components: `"use client"` directive + minimal — delegate data fetching to server where possible.
- Never import Ant Design icons inline — use the centralized `/config/icons.ts` icon map.
- Role-conditional rendering uses `allowedRoles` from the section/component config — never a bare `if (user.role === 'ADMIN')` scattered in JSX. Centralise role logic in config objects.
- Core domain types (`Campaign`, `UserRole`, `SmartLink`, etc.) do not need to be imported — they are globally available via `types/global.d.ts`.

---

## State Management

- Auth state: `AuthContext` (`/providers/AuthProvider.tsx`)
- Theme state: `ThemeProvider` (next-themes)
- Server state: React Server Components + `revalidatePath` / `revalidateTag`
- Form state: `react-hook-form` + Zod resolvers
- No Redux. No Zustand. Keep it framework-native.

---

## Naming Conventions

| Thing                        | Convention      | Example                       |
| ---------------------------- | --------------- | ----------------------------- |
| Files (components)           | PascalCase      | `CampaignCard.tsx`            |
| Files (utils/hooks/services) | camelCase       | `useCampaigns.ts`             |
| Config files                 | camelCase       | `content.ts`, `navigation.ts` |
| CSS token classes            | `ds-` prefix    | `bg-ds-surface-glass`         |
| Types / interfaces           | PascalCase      | `Campaign`, `SmartLink`       |
| Enums                        | SCREAMING_SNAKE | `CampaignStatus.ACTIVE`       |
| API routes                   | kebab-case      | `/api/smart-links`            |
| Constants                    | SCREAMING_SNAKE | `CAMPAIGN_DURATION_MS`        |

---

## Code Quality

- Run `npx tsc --noEmit` after every set of changes — zero errors before committing.
- ESLint must pass with no warnings on new code.
- Commit message format: `<scope>: <description>` (e.g., `campaign: add smart link generation`)
- Never introduce `any` — use `unknown` and narrow.
- Prefer explicit returns in service functions; prefer implicit returns only in single-expression arrow functions.

---

## Inter-Module Integration Contract

When modules need to reference each other, only import from the target module's `index.ts`. Never reach into another module's internals.

```ts
// ✅ Correct
import { type SmartLink } from "@/modules/links";

// ❌ Wrong
import { SmartLink } from "@/modules/links/types/smartLink";
```
