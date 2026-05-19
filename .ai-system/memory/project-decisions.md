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
