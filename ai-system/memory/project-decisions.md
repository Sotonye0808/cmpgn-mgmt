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
