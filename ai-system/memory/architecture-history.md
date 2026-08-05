# Architecture History

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-04
> - staleness-policy: historical entries do not go stale — only the current architecture (in system-architecture.md) needs re-verification

> **Overview:** Chronological record of how the system architecture has evolved. Useful for understanding why things are structured the way they are, and for identifying patterns in how the codebase has grown.

---

## History

### 2026-05-13 — Initial Architecture

**State:**
Next.js 15 App Router with domain modules under `modules/`, shared utilities under `lib/`, and data layer using mock DB (`lib/data/mockDb.ts`) with planned migration to Prisma/PostgreSQL.

**Rationale:**
Modular architecture enables independent feature development. Mock DB defers database setup complexity while allowing service boundaries to be validated early.

---

### 2026-05-13 — CIS Federation Bootstrap

**State:**
Added CIS configuration, status/webhook routes, and persistence models (`CisIdentity`, `CisWebhookEvent`) with additive persistence pattern.

**Rationale:**
Webhook-based sync provides low-latency identity propagation without polling overhead. Additive persistence keeps the integration low-risk and avoids schema coupling.

---

### 2026-05-26 — Cross-Platform Account Detection

**State:**
Added `lib/services/cisCheck.ts` for pre-signup email check against CIS backend. Added `components/ui/CrossPlatformAccountPrompt.tsx` for UI prompt.

**Rationale:**
Prevents silent duplicate identity creation across platforms. CIS check fires on email blur with debounce; silent fallback when CIS is unavailable.

---

### 2026-07-01 — Documentation Audit and Sync

**State:**
Ran `update-ai-system.md` post-migration. Discovered the repo had evolved to 12 domain modules (analytics, campaign, donation, engagement, leaderboard, links, points, proofs, referral, teams, trust, users), 19 API endpoint groups, 21 external dependencies, and supporting directories (providers, hooks, config, lib/schemas) that were not documented.

**Rationale:**
The v1 `ai-system` docs were frozen at initial bootstrap. The v2 migration was an opportunity to synchronize docs with actual codebase state.

---

[New entries added here as architecture evolves]
