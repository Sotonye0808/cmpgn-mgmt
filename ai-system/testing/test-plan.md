# Test Plan

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: re-verify if new features are added

> **Overview:** Defines what needs to be tested and at what level. Referenced by `verify-work.md` during the quality gate. Updated as new features are added.

---

## Unit Tests

- [ ] `canReviewProof` / `buildProofReviewAccess` — admin unrestricted; team lead blocked outside team; team lead blocked outside assigned campaigns; team lead with no campaign assignments falls back to team scope
- [ ] Proof POST normalization — legacy `screenshotUrl` wrapped, `screenshotUrls` wins, dedupe + cap at `MAX_PROOF_SCREENSHOTS`, empty rejected
- [ ] Service layer functions
- [ ] Utility functions
- [ ] Data transformation logic

## Integration Tests

- [ ] `POST /api/engagement/proofs` with `screenshotUrls` array (1..5) and with legacy `screenshotUrl`
- [ ] `GET /api/engagement/proofs?scope=team` — team lead sees only team members + assigned campaigns; out-of-scope campaign filter returns `[]`
- [ ] `PATCH /api/engagement/proofs/[id]/review` — 403 for out-of-scope proof
- [ ] `PATCH /api/engagement/proofs/batch-review` — out-of-scope proofs skipped (not updated)
- [ ] API route responses (happy path)
- [ ] API route error handling
- [ ] Database CRUD operations
- [ ] Authentication flow

---

## End-to-End Tests

- [ ] [Critical user flow 1]
- [ ] [Critical user flow 2]

---

## Performance Tests

- [ ] API response time under normal load
- [ ] Database query performance
- [ ] Page load times (frontend)
