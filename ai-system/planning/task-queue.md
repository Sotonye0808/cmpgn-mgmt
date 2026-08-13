# Development Task Queue

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - last-synced: 2026-08-13 — updated during v3 upgrade (ai-system-template pull-template-update)
> - staleness-policy: re-verify before each session

> **Overview:** Sprint-level task queue with complexity tagging. Agents execute tasks top to bottom within the current sprint. Each task is sized so it can be completed in a single session.

---

## Complexity Tags

Tags help agents self-select whether a task needs the full `execute-feature.md` pipeline or a lighter `dev-cycle.md`:

| Tag | Meaning | Recommended Command |
|-----|---------|-------------------|
| `[XS]` | Trivial — single file, known pattern | dev-cycle.md |
| `[S]` | Small — 1-3 files, well-understood | dev-cycle.md |
| `[M]` | Medium — 3-8 files, some planning needed | dev-cycle.md with plan-feature pre-read |
| `[L]` | Large — feature spanning modules | execute-feature.md |
| `[XL]` | Very large — architecture-affecting | execute-feature.md, requires architect role |
| `[BUG]` | Bug fix | fix-build.md |

---

## Current Sprint

| Size | Task | Status |
|------|------|--------|
| [S] | Wire CIS identity events into optional user-link workflows once payload contract is finalized | [ ] |
| [S] | Add admin diagnostics surface for CIS mappings (optional) | [ ] |

---

## Up Next

| Size | Task |
|------|------|
| [M] | Add reconciliation endpoint to re-sync CIS identities on demand |
| [S] | Harden webhook idempotency metrics and retry visibility |

---

## Backlog

| Size | Task |
|------|------|
| [M] | Pull-to-refresh or polling for dashboard metrics |
| [XL] | Package the `ai-system` kit for versioned install (npm / GitHub Releases) for distribution beyond "clone the template repo" — deferred stretch goal from template v3 |
| [XL] | Optional `integrations/opencode/` adapter mapping `ai-system` commands to opencode-specific slash-commands (multi-manifest pattern, `AGENTS.md` + `opencode.json`), clearly labeled so the core kit stays vendor-neutral — deferred stretch goal from template v3 |

---

## Completed This Sprint

| Task | Completed |
|------|-----------|
| Bootstrap `ai-system` for DMHicc and align with repo constraints | 2026-05-13 |
| Add CIS env/config plumbing plus status + webhook routes | 2026-05-13 |
| Add CIS persistence tables (`CisIdentity`, `CisWebhookEvent`) and record events | 2026-05-13 |
| Record CIS push-model decision and update architecture docs | 2026-05-13 |
| Add `lib/services/cisCheck.ts` — service calling `GET /api/v1/users/check-email/:email` | 2026-05-26 |
| Add `components/ui/CrossPlatformAccountPrompt.tsx` — UI prompt for detected cross-platform accounts | 2026-05-26 |
| Wire email blur check in `app/(auth)/register/RegisterForm.tsx` | 2026-05-26 |
| Block signup submission until cross-platform prompt is dismissed | 2026-05-26 |
| Update `ai-system` docs with feature decisions | 2026-05-26 |
| Issue #33: multi-screenshot proof uploads (max 5) + additive `ViewProof.screenshotUrls` schema/migration | 2026-08-05 |
| Issue #33: campaign-assigned team leads (`Campaign.teamLeadIds`) + tightened, centralized review scoping (`proofReviewAccess.ts`, all proof routes) | 2026-08-05 |
| Issue #33: responsive screenshot views + pagination (ProofCard grid, ProofReviewPanel, "My Status Views") | 2026-08-05 |
| Issue #33: QA (typecheck, lint, production build) + `update-ai-system.md` sync | 2026-08-05 |

---

## Notes

None.
