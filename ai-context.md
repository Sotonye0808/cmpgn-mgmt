# Project AI Context

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-04
> - staleness-policy: re-verify before trusting if project structure has changed

> **Overview:** DMHicc (Digital Mobilization & Harvest Impact Campaign Center) is a standalone Next.js 15 campaign management platform for digital mobilization, smart links, referral tracking, gamification, and fundraising. Designed for the Harvesters ecosystem but self-contained for MVP.

---

## Quick Reference

| Field | Value |
|-------|-------|
| Project Name | DMHicc |
| Type | Web App |
| Primary Language | TypeScript |
| Frontend | Next.js 15 |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS 4 + Ant Design 5 |
| Deployment | [TBD] |

---

## Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Campaigns | `modules/campaign` | Campaign CRUD and configuration |
| Users | `modules/users` | User management, roles, profiles |
| Links | `modules/links` | Smart link generation and tracking |
| Engagement | `modules/engagement` | Proofs, participation, timeline |
| CIS | `lib/config/cis.ts` | CIS federation identity sync |

---

## Entry Point

The AI system documentation lives in `ai-system/`.

Start with: `ai-system/protocols/entry-protocol.md`

---

## Active Development Focus

CIS federation rollout — status endpoint, webhook intake, and identity persistence. Readiness for later Harvesters CRM integration.
