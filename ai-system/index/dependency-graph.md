# Dependency Graph

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-04
> - staleness-policy: auto-regenerable — can be derived from import analysis tools. Manual content only for conventions and rules that cannot be inferred from code.

> **Overview:** Maps how modules depend on each other. Agents use this to understand the impact of changes. This file is **auto-regenerable** — prefer tool-based import analysis for ground truth, and treat manual entries as supplementary.

---

## Module Dependency Map

```
Auth Service
  → lib/data/mockDb.ts (user lookup)
  → lib/utils/jwt.ts (token generation)
  → bcryptjs (password hashing)

CIS Identity Service
  → Prisma Client (CisIdentity, CisWebhookEvent)
  → lib/config/cis.ts (webhook verification)
  → node:crypto (HMAC verification)

Campaign Service
  → lib/data/mockDb.ts
  → modules/users (role checks)

Analytics Service
  → lib/data/mockDb.ts
  → modules/campaign (campaign data)
  → modules/engagement (engagement metrics)

Donation Service
  → lib/data/mockDb.ts
  → modules/campaign (campaign association)

Referral Service
  → lib/data/mockDb.ts
  → modules/links (smart link association)

Leaderboard Service
  → modules/points (scoring data)
  → modules/users (user display info)

All Modules
  → lib/schemas/* (validation at API boundaries)
  → providers/AuthProvider (client-side auth state)
```

---

## External Dependencies

| Package | Purpose | Used In |
|---------|---------|---------|
| next | Framework (App Router) | `app/` |
| antd | UI component library | `components/`, `modules/*/components/` |
| @ant-design/icons | Icon set | `components/`, `modules/*/components/` |
| tailwind-merge | Class merging | `components/ui/` |
| clsx | Conditional classnames | `components/` |
| framer-motion | Animations | `components/`, `modules/*/components/` |
| recharts | Charting library | `modules/analytics/`, `app/(dashboard)/analytics/` |
| react-hook-form | Form management | Auth forms, campaign forms |
| @hookform/resolvers | Form validation resolvers | Forms |
| @prisma/client | Database ORM | `lib/data/`, `modules/*/services/` |
| @prisma/extension-accelerate | Prisma Accelerate | `lib/data/` |
| zod | Runtime validation | API routes, `lib/schemas/`, config |
| jsonwebtoken | JWT auth | `lib/utils/jwt` |
| bcryptjs | Password hashing | `lib/services/` |
| date-fns | Date utilities | `modules/*/services/` |
| dayjs | Date formatting (Ant Design peer) | `components/` |
| xlsx | Excel export | `modules/users/` |
| cloudinary | Media storage | `lib/config/`, `app/api/upload/` |
| @upstash/redis | Redis cache | `lib/data/` |
| next-themes | Theme switching | `providers/` |
| node:crypto | Webhook HMAC verification | `lib/config/cis.ts` |

---

## Circular Dependency Warnings

[None detected]

---

## Dependency Rules

- Controllers may depend on Services — not the other way around
- Services may depend on Models — not the other way around
- Utils must have no dependencies on application modules
- Config module must not depend on any application code
