# Project Decisions

> **Overview:** Log of significant architectural, technical, and product decisions made during development. Agents consult this before proposing changes to avoid contradicting prior reasoning. Each entry records what was decided, why, and what the alternatives were.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Developer / AI agent / team]

**Reason:**
[Why this choice was made]

**Alternatives Considered:**
[What else was evaluated and why it was rejected]

**Implications:**
[What this decision affects going forward]
```

---

## Decisions

## CIS Sync Model (Push)

**Decision:** CIS pushes signed identity events to DMHicc via webhooks.
**Date:** 2026-05-13
**Made by:** AI assistant

**Reason:** The webhook surface is already present and provides low-latency identity propagation without polling.

**Alternatives Considered:** Pull model (periodic polling). Rejected because it adds polling overhead and delays sync.

**Implications:** DMHicc must keep webhook verification strict and idempotent. Optional reconciliation can be added later.

## CIS Identity Persistence (Additive)

**Decision:** Persist CIS identity mappings in `CisIdentity` and event history in `CisWebhookEvent` without mutating local user records.
**Date:** 2026-05-13
**Made by:** AI assistant

**Reason:** This keeps the integration low-risk and avoids schema coupling while still providing traceability for sync events.

**Alternatives Considered:** Direct user upsert/mutation. Rejected until the payload contract is finalized and migration scope is approved.

**Implications:** Future identity linking work can attach to the mapping table without refactoring the webhook contract.

## Cross-Platform Account Detection via Pre-Signup Email Check

**Decision:** When a user enters their email on the register form, check the CIS backend's `GET /api/v1/users/check-email/:email` endpoint to detect existing accounts on other platforms. If matches are found, display a prompt offering "Sign In Instead" or "Continue with Signup".
**Date:** 2026-05-26
**Made by:** AI implementation session

**Reason:**
Users could silently create duplicate, unlinked identities across platforms because signup only checked local email uniqueness. CIS already tracks platform-user mappings but had no pre-signup query surface.

**Alternatives Considered:**
- Only check on form submission (rejected: slower feedback, would need to abort submission which is poor UX)
- Always allow signup and link accounts post-hoc via webhook reconciliation (rejected: creates orphan identities that need later cleanup)
- Embed the check in the register API route (rejected: ties CIS availability to registration success/failure and creates coupling)

**Implications:**
- Check fires on email blur with 800ms debounce
- Signup submission is blocked while cross-platform prompt is visible
- When CIS is not configured, check silently returns null and signup proceeds normally
- The "Sign In Instead" button navigates to /login
