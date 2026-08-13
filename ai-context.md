# Project AI Context

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - installed-ai-system-version: 3.0.0 (baseline for pull-template-update.md)
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

Two catalogs worth knowing exist (read on demand, not up front):
- Skills catalog: `ai-system/skills/README.md` (Tier 3 — load a skill's `SKILL.md` when its trigger matches)
- Tool/resource registry: `ai-system/tools/registry.md` (Tier 3 — check before doing by hand what a registered tool does)

---

## Active Development Focus

CIS federation rollout — status endpoint, webhook intake, and identity persistence. Readiness for later Harvesters CRM integration.
