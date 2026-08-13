# Project Decisions

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: each entry has its own staleness — check supersedes links

> **Overview:** Log of significant architectural, technical, and product decisions. Agents consult this before proposing changes to avoid contradicting prior reasoning. Uses supersedes/superseded-by links so contradictory entries are explicitly resolved rather than both appearing equally valid.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Role / Agent / Developer]
**Supersedes:** [link to any prior decision this replaces, or None]
**Superseded by:** [link to any newer decision that replaces this, or None]

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
**Supersedes:** None
**Superseded by:** None

**Reason:** The webhook surface is already present and provides low-latency identity propagation without polling.

**Alternatives Considered:** Pull model (periodic polling). Rejected because it adds polling overhead and delays sync.

**Implications:** DMHicc must keep webhook verification strict and idempotent. Optional reconciliation can be added later.

## CIS Identity Persistence (Additive)

**Decision:** Persist CIS identity mappings in `CisIdentity` and event history in `CisWebhookEvent` without mutating local user records.
**Date:** 2026-05-13
**Made by:** AI assistant
**Supersedes:** None
**Superseded by:** None

**Reason:** This keeps the integration low-risk and avoids schema coupling while still providing traceability for sync events.

**Alternatives Considered:** Direct user upsert/mutation. Rejected until the payload contract is finalized and migration scope is approved.

**Implications:** Future identity linking work can attach to the mapping table without refactoring the webhook contract.

## Cross-Platform Account Detection via Pre-Signup Email Check

**Decision:** When a user enters their email on the register form, check the CIS backend's `GET /api/v1/users/check-email/:email` endpoint to detect existing accounts on other platforms. If matches are found, display a prompt offering "Sign In Instead" or "Continue with Signup".
**Date:** 2026-05-26
**Made by:** AI implementation session
**Supersedes:** None
**Superseded by:** None

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

## Multi-Screenshot Proofs (Additive)

**Decision:** Add `screenshotUrls String[] @default([])` to `ViewProof` for up to `MAX_PROOF_SCREENSHOTS` (5) screenshots, while keeping `screenshotUrl` as the primary (first) URL for backward compatibility. The API accepts either the legacy single `screenshotUrl` or the new `screenshotUrls` array.
**Date:** 2026-08-05
**Made by:** AI implementation session
**Supersedes:** None
**Superseded by:** None

**Reason:**
The feature requires multiple screenshots per proof, but existing rows and clients only send one URL. Keeping `screenshotUrl` populated avoids a data migration and keeps old consumers working.

**Alternatives Considered:**
- Migrate to `screenshotUrls` only and drop `screenshotUrl` (rejected: breaking change, requires backfill + client updates).
- Store screenshots as a joined table (rejected: over-engineered for a bounded 5-image cap).

**Implications:**
- `ProofCard` falls back to `[screenshotUrl]` when `screenshotUrls` is empty so legacy rows render unchanged.
- Server normalizes/dedupes/caps the array defensively before persisting.
- Upload cap and copy live in `modules/proofs/config.ts` (`MAX_PROOF_SCREENSHOTS`).

## Team-Lead Verification Scope (Tightened)

**Decision:** A team lead may review a proof only when the submitter is a member of the lead's team AND the proof's campaign is in the lead's assigned `Campaign.teamLeadIds`. A lead with no campaign assignments keeps the legacy team-scoped access (no campaign restriction) so existing setups don't lose coverage. Access logic is centralized in `modules/proofs/services/proofReviewAccess.ts` and applied to list, single-review, and batch-review endpoints.
**Date:** 2026-08-05
**Made by:** AI implementation session
**Supersedes:** None
**Superseded by:** None

**Reason:**
Previously any team lead could review any proof (team leads were assigned to teams only, and the review endpoints were not scoped). Issue #33 requires leads to verify a *specific campaign's* screenshots, so verification must be bounded by campaign assignment.

**Alternatives Considered:**
- Restrict by team only (rejected: does not satisfy the campaign-assignment requirement).
- Add a dedicated campaign-reviewer join table (rejected: additive `String[]` on Campaign matches the existing `targetAudience` pattern and avoids a new table).

**Implications:**
- `GET /api/engagement/proofs?scope=team` filters by managed campaigns and returns `[]` when a requested campaign is outside scope.
- Single and batch review endpoints enforce `canReviewProof` and drop/forbid out-of-scope proofs.
- CampaignForm (admin-only) exposes a `teamLeadIds` multi-select.

## PDF Extraction Backend for the Design-Asset Viewer

**Decision:** Use the single multi-format converter (`markitdown`) if the project is Python-heavy; use the PDF classify-then-extract library (`pdf-inspector`) if the project is Rust/WASM-friendly. Reaffirm at implementation time of the design-asset viewer.
**Date:** 2026-08-13
**Made by:** bootstrap-project (seeds the v3 decision)
**Supersedes:** None
**Superseded by:** None

**Reason:**
The viewer needs PDF text/structure extraction in one thin wrapper. `tools/registry.md` evaluates both candidates as "adopt (approach)." Picking one is a stack-fit decision (see `tools/integrations/markitdown.md` and `tools/integrations/pdf-inspector.md`), not a fixed default.

**Alternatives Considered:**
- A PDF-only Rust extractor as a hard dependency — rejected as over-coupling where the stack is not Rust/WASM.
- No extraction at all (render-only viewer) — rejected because agents must be able to read a PDF spec as Markdown.

**Implications:**
- The design-asset viewer's extraction utility is a thin wrapper around whichever backend the stack favors.
- Do not add both backends unless measurements justify it.

## Update-ai-system.md Triggers: Conditional, Not Unconditional

**Decision:** `update-ai-system.md` fires only on the conditional triggers defined in each command's `Chains to` row (architecture-affecting work in `execute-feature.md`, an emptied sprint table in `dev-cycle.md`, always in `refactor-codebase.md`, major drift in `resume-session.md`, and always in `cloud-session.md`) — not after every task unconditionally.
**Date:** 2026-08-13
**Made by:** v3 upgrade (opencode session)
**Supersedes:** None
**Superseded by:** None

**Reason:**
The v3 spec explicitly flagged this as a judgment call. `update-ai-system.md` is the *heavier* sibling of `sync-context.md` by design; running the full deep sync after every trivial `[XS]`/`[S]` task would burn tokens on work that only `sync-context.md`'s lightweight check needs. The conditional set is the point where skipping the deep sync is actually risky.

**Alternatives Considered:**
- Unconditional invocation on the four named commands — rejected: predicts many trivial-task deep syncs per day, violating the token/context-economy goal. It remains a one-line override per command if the operator prefers it.

**Implications:**
- Five commands now carry mandatory `Chains to` triggers that invoke `update-ai-system.md` automatically under their conditions — its own `Does NOT` contract is worded accordingly (invoked explicitly or via a command's mandated chain trigger, never on a schedule).
- `verification-rules.md` and `audit-drift.md` check chain order mechanically from `session-log.md`, so a skipped trigger is caught, not trusted.
