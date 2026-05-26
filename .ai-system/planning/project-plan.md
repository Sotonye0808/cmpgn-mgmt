# Project Plan

> **Overview:** High-level feature checklist for the project. Agents update checkboxes as work is completed. Sections represent major development phases. See task-queue.md for granular, sprint-level tasks.

---

## Cross-Platform Account Detection (2026-05-26)

> **Section summary:** Pre-signup email check against CIS backend to detect existing accounts on other platforms.

**Feature Objective:**
When a user enters their email during registration, check CIS to see if that email already has accounts on other platforms (MyHarvestHub, Reporting System, Faith Hub, etc.). If matches are found, display a prompt offering to sign in instead.

**Implementation:**
- `lib/services/cisCheck.ts` — service calling CIS check-email endpoint
- `components/ui/CrossPlatformAccountPrompt.tsx` — inline prompt in register form
- Check fires on email blur (800ms debounce)

## CIS Federation Rollout (2026-05-13)

> **Section summary:** Add CIS readiness and signed webhook intake plus a non-destructive persistence layer.

**Feature Objective:**
Enable CIS to discover DMHicc readiness and push signed identity sync events without forcing a schema rewrite or user mutation.

**Acceptance Criteria:**

- `lib/config/cis.ts` normalizes CIS env vars and verifies webhook signatures.
- `GET /api/cis/status` reports platform slug, readiness, and webhook configuration.
- `POST /api/cis/webhook` validates signatures and persists events to `CisIdentity` + `CisWebhookEvent`.
- CIS sync uses a push model (webhooks) and remains additive to local user data.

---

## Phase 1 — Foundation

> **Section summary:** Core infrastructure that everything else depends on.

- [ ] Repository structure and folder conventions established
- [ ] Configuration system implemented (env vars, config files)
- [ ] Logging framework in place
- [ ] Error handling middleware / global error boundaries
- [ ] CI/CD pipeline (if applicable)

---

## Phase 2 — Core Features

> **Section summary:** The primary features that define the product's value.

- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

---

## Phase 3 — Secondary Features

> **Section summary:** Supporting features that enhance the core experience.

- [ ] [Feature 4]
- [ ] [Feature 5]

---

## Phase 4 — Quality & Polish

> **Section summary:** Reliability, performance, and user experience improvements.

- [ ] Unit test coverage for core modules
- [ ] Integration tests for critical paths
- [ ] Performance audit and optimisation
- [ ] Accessibility audit
- [ ] Error states and loading states complete

---

## Phase 5 — Launch Preparation

> **Section summary:** Final steps before production deployment.

- [ ] Production environment configured
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete
- [ ] Deployment pipeline tested

---

## Completed

> **Section summary:** Features fully shipped. Archived here for reference.

- [x] [Completed item]
