# Lessons Learned

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: each entry has its own staleness — check supersedes links

> **Overview:** Practical knowledge accumulated during development — things that worked well, things that didn't, and patterns worth repeating. Different from `repair-system.md` (tracks errors); this file tracks development process insights and architectural wisdom. Uses supersedes/superseded-by links for evolving practices.

---

## Entry Format

```
## [Lesson Title]

**Context:**
[What situation this came from]

**What We Learned:**
[The insight or pattern discovered]

**Apply When:**
[When future agents/developers should use this knowledge]

**Supersedes:** [link to any prior lesson this replaces, or None]
**Superseded by:** [link to any newer lesson that replaces this, or None]
```

---

## Lessons

## Prefer Additive Schema Evolution with a Primary-Column Fallback

**Context:**
Issue #33 needed multiple screenshots per proof while existing rows and API clients only sent a single `screenshotUrl`.

**What We Learned:**
Adding `screenshotUrls String[] @default([])` and keeping the old column populated (server normalizes `urls[0]` into `screenshotUrl`) lets new and old consumers coexist with zero data migration. Consumers must still defensively fall back (`proof.screenshotUrls?.length ? proof.screenshotUrls : [proof.screenshotUrl]`).

**Apply When:**
Extending a persisted field where legacy rows/clients exist. Keep the old shape working and derive the primary value server-side rather than rewriting history.

**Supersedes:** None
**Superseded by:** None

## Centralize Authorization Scope in One Module

**Context:**
Team-lead review was previously enforced per-route (or not at all). Issue #33 required campaign-scoped verification across list, single-review, and batch-review endpoints.

**What We Learned:**
Putting the scope rules in `modules/proofs/services/proofReviewAccess.ts` (`buildProofReviewAccess` builds the context once per request; `canReviewProof` is a pure predicate reused across routes) avoided duplicated, drifting logic and made the batch-review path a simple `filter`. The context is built once and reused to avoid N+1 lookups.

**Apply When:**
Adding or tightening authorization in multiple endpoints. Build a shared context once per request and reuse a pure predicate per entity.

**Supersedes:** None
**Superseded by:** None

## Env Vars Required Even for Offline Tooling

**Context:**
`prisma generate` fails without `DATABASE_URL` (prisma.config.ts calls `env('DATABASE_URL')`), and `next build` fails without `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`.

**What We Learned:**
Dummy values work for generation/build (a non-empty string satisfies the validator). Keep `.env.example` in sync and document these as known offline prerequisites.

**Apply When:**
Running Prisma generate, migrations, or production builds in CI or fresh checkouts.

**Supersedes:** None
**Superseded by:** None

