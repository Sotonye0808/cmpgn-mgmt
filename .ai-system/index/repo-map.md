# Repository Map

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-01
> - staleness-policy: auto-regenerable — can be derived from `Get-ChildItem -Recurse` or `tree` command. Manual content only where intent cannot be derived from structure.

> **Overview:** Visual map of the project folder structure with purpose descriptions. Updated when the folder structure changes. This file is **auto-regenerable** — use tool-based discovery (filesystem MCP, git ls-tree) for ground truth, and treat manual entries here as supplementary context, not primary navigation.

---

## Folder Structure

```
cmpgn-mgmt/
│
├── app/                    → Next.js App Router pages and API routes
│   ├── (auth)/             → Auth pages (login, register)
│   ├── (dashboard)/        → Main dashboard pages (analytics, campaigns, referrals, etc.)
│   ├── (public)/           → Public pages (about, contact, privacy, terms, etc.)
│   ├── api/                → API route handlers (auth, campaigns, cis, users, etc.)
│   └── c/[slug]/           → Short-link redirect routes
│
├── components/             → Reusable UI components
│   ├── ui/                → Shared UI primitives
│   └── layout/            → Layout components (nav, footer, etc.)
│
├── config/                 → App-level configuration files
│   ├── content.ts          → Config-driven user-facing copy
│   ├── navigation.ts       → Navigation structure
│   ├── routes.ts           → Route definitions
│   └── seo.ts              → SEO configuration
│
├── hooks/                  → Shared React hooks
│   ├── useAuth.ts          → Auth state hook
│   ├── useRole.ts          → Role checking hook
│   └── useNotifications.ts → Notification polling hook
│
├── lib/                    → Shared utilities, config, and services
│   ├── config/            → Configuration (env vars, feature flags)
│   ├── data/              → Mock DB + cache (source of truth in early phases)
│   ├── middleware/        → Auth guards and middleware
│   ├── schemas/           → Zod validation schemas (auth, campaign, donation)
│   ├── services/          → Cross-cutting service adapters
│   └── utils/             → Utility functions
│
├── modules/                → Domain modules (feature-specific logic)
│   ├── analytics/         → Analytics and metrics
│   ├── campaign/          → Campaign CRUD and configuration
│   ├── donation/          → Donation processing
│   ├── engagement/        → Proofs, participation, timeline
│   ├── leaderboard/       → Leaderboard and rankings
│   ├── links/             → Smart link generation and tracking
│   ├── points/            → Points and scoring
│   ├── proofs/            → Proof of participation
│   ├── referral/          → Referral tracking
│   ├── teams/             → Team management
│   ├── trust/             → Trust/safety review
│   └── users/             → User management, roles, profiles
│
├── prisma/                 → Schema, migrations, generated client
│
├── providers/              → React context providers
│   ├── AuthProvider.tsx    → Auth context provider
│   ├── ThemeProvider.tsx   → Theme context provider
│   └── AntdProvider.tsx    → Ant Design config provider
│
├── public/                 → Static assets
├── types/                  → Global type definitions
├── .data/                  → Local data persistence (db-persist.json)
├── .github/                → GitHub metadata, design system, PRD
├── relics/                 → Archived/migrated code
└── .ai-system/             → AI development system
```

---

## Directory Descriptions

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/` | Next.js App Router pages and API handlers | `app/api/cis/*`, `app/(auth)/register/*` |
| `components/` | Reusable UI components | `components/ui/CrossPlatformAccountPrompt.tsx` |
| `config/` | App-level config-driven copy | `config/content.ts`, `config/navigation.ts` |
| `hooks/` | Shared React hooks | `hooks/useAuth.ts`, `hooks/useRole.ts` |
| `lib/` | Shared utilities, config, services | `lib/config/cis.ts`, `lib/data/mockDb.ts`, `lib/schemas/*` |
| `modules/` | Domain feature modules (12 modules) | `modules/campaign/`, `modules/analytics/`, etc. |
| `prisma/` | Database schema and migrations | `prisma/schema.prisma` |
| `providers/` | React context providers | `providers/AuthProvider.tsx`, `providers/ThemeProvider.tsx` |
| `types/` | Global TypeScript type definitions | `types/global.d.ts` |

---

## Entry Points

| Purpose | File |
|---------|------|
| Frontend dev server | `npm run dev` (Next.js) |
| API routes | `app/api/*/route.ts` |
| Config loading | `lib/config/*.ts`, `config/*.ts` |
| Environment validation | `.env.example` |
