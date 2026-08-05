# Project Context

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** DMHicc (Digital Mobilization & Harvest Impact Campaign Center) is a standalone Next.js 15 campaign management platform enabling structured digital mobilization, smart links, referral tracking, gamification, and fundraising. It is designed to integrate into the Harvesters CRM later but is fully self-contained for the MVP.

---

## Project Purpose

DMHicc centralizes campaign creation, smart link distribution, referral tracking, and engagement scoring so teams can run measurable outreach without fragmented spreadsheets or ad hoc tools. The platform focuses on role-aware coordination across teams and leaders while keeping the MVP self-contained.

---

## Target Users

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| Super Admin / Admin | Configure campaigns, manage teams and users, review engagement | Campaign CRUD, role management, analytics dashboards |
| Team Lead | Coordinate team participation, track referral impact | Campaign participation, smart link monitoring, leaderboards |
| Participant / User | Join campaigns, share smart links, earn points | Smart links, referrals, points ledger |

---

## Business Constraints

- All user-visible copy is config-driven (`config/content.ts`); no hardcoded UI strings.
- Role-aware rendering only; do not create role-split page routes.
- Modules live under `/modules/<domain>`; cross-module imports go through `index.ts` only.
- TypeScript strict mode; no `any`.
- Core domain types are global in `types/global.d.ts`.
- Mock DB (`lib/data/mockDb.ts`) and mock cache (`lib/data/mockCache.ts`) are the source of truth in Phase 1-13; multi-table writes must use `mockDb.transaction()`.
- Design tokens (`--ds-*`) are mandatory; no raw Tailwind palette classes for semantic color.

---

## Current Project Phase

Phase: Active Development (MVP)

Active sprint focus: CIS federation rollout (status + webhook + persistence) and readiness for later Harvesters CRM integration.

---

## Tech Decisions Already Made

| Decision | Reason |
|----------|--------|
| Next.js 15 App Router | Modern routing + server components |
| TypeScript strict mode | Safer refactors and runtime correctness |
| Ant Design v5 + Tailwind v4 | Rapid UI with token-driven theming |
| Prisma + PostgreSQL | Production persistence contract |
| JWT httpOnly cookies | Secure session handling |
| Zod validation | Runtime API safety |

---

## Out of Scope

- Deep Harvesters CRM integration (deferred until post-MVP)
- Native mobile apps (React Native) for this phase
- Production payment-provider hardening beyond MVP donation flows

---

## External Integrations

| Service | Purpose | Auth Method |
|---------|---------|------------|
| Prisma/PostgreSQL | Persistent storage | Connection string |
| Redis (Upstash) | Cache + rate limiting (future) | REST token |
| Cloudinary | Media storage | API key/secret |
| CIS | Canonical identity sync | Client secret + webhook secret |
