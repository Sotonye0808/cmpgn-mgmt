# Project Plan

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: re-verify if project scope or phase changes

> **Overview:** High-level feature checklist organized by development phase. See `planning/task-queue.md` for granular, sprint-level tasks.

---

## Cross-Platform Account Detection (2026-05-26)

**Feature Objective:**
When a user enters their email during registration, check CIS to see if that email already has accounts on other platforms (MyHarvestHub, Reporting System, Faith Hub, etc.). If matches are found, display a prompt offering to sign in instead.

**Implementation:**
- `lib/services/cisCheck.ts` — service calling CIS check-email endpoint
- `components/ui/CrossPlatformAccountPrompt.tsx` — inline prompt in register form
- Check fires on email blur (800ms debounce)

---

## CIS Federation Rollout (2026-05-13)

**Feature Objective:**
Enable CIS to discover DMHicc readiness and push signed identity sync events without forcing a schema rewrite or user mutation.

**Acceptance Criteria:**
- `lib/config/cis.ts` normalizes CIS env vars and verifies webhook signatures.
- `GET /api/cis/status` reports platform slug, readiness, and webhook configuration.
- `POST /api/cis/webhook` validates signatures and persists events to `CisIdentity` + `CisWebhookEvent`.
- CIS sync uses a push model (webhooks) and remains additive to local user data.

---

## Phase 1 — Foundation

- [x] Repository structure and folder conventions established
- [x] Configuration system implemented (env vars, config files)
- [ ] Logging framework in place
- [x] Error handling middleware / global error boundaries
- [ ] CI/CD pipeline (if applicable)

---

## Phase 2 — Core Features

- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

---

## Phase 3 — Secondary Features

- [ ] [Feature 4]
- [ ] [Feature 5]

---

## Phase 4 — Quality & Polish

- [ ] Unit test coverage for core modules
- [ ] Integration tests for critical paths
- [ ] Performance audit and optimisation
- [ ] Accessibility audit
- [ ] Error states and loading states complete

---

## Phase 5 — Launch Preparation

- [ ] Production environment configured
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete
- [ ] Deployment pipeline tested

---

## Multi-Screenshot Proofs + Campaign-Assigned Team Leads (2026-08-05)

**Feature Objective (issue #33):**
(1) Allow uploading up to 5 screenshots per proof submission; (2) allow assigning team leads to a campaign and give them rights to verify that campaign's screenshots — tightening the previously too-broad team-lead review rights; (3) make the screenshot views responsive with pagination.

**Implementation:**
- `ViewProof.screenshotUrls String[] @default([])` (additive; `screenshotUrl` stays as primary for backward compat), `Campaign.teamLeadIds String[] @default([])`.
- `modules/proofs/services/proofReviewAccess.ts` centralizes review scoping: admins unrestricted; team leads scoped to team members + assigned campaigns (legacy team scope as fallback).
- `components/ui/MultiImageUpload.tsx` handles multi-file Cloudinary uploads; `SubmitProofModal`, `ProofCard` (responsive grid + legacy fallback), `ProofReviewPanel` and proofs page pagination updated.

---

## Completed

- [x] CIS Federation Rollout — status + webhook + persistence
- [x] Cross-Platform Account Detection — pre-signup CIS email check
- [x] Multi-Screenshot Proofs + Campaign-Assigned Team Leads — additive schema, scoped review, responsive pagination
