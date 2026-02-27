# DMHicc — Repairs Audit

## Broad Repair — 2026-02-27 — Full workspace diagnostic pass

### Summary

- **`npx tsc --noEmit`** — **0 errors** (clean)
- **`npx eslint . --ext .ts,.tsx`** — **17 errors, 1 warning** (all fixable below)
- **VS Code workspace diagnostics** — **14 additional issues** (inline styles, a11y, CSS compat, tsconfig)

---

### Findings — ESLint

| #   | Group                           | Root Cause                                                                  | Files Affected | Error Count |
| --- | ------------------------------- | --------------------------------------------------------------------------- | -------------- | ----------- |
| 1   | Unused imports / variables      | Imported symbols never referenced in the file                               | 7 files        | 10 errors   |
| 2   | Empty interface extends         | `interface X extends Y {}` with no added members — use `type X = Y` instead | 5 files        | 5 errors    |
| 3   | Unused eslint-disable directive | Stale suppression comment that no longer matches any diagnostic             | 1 file         | 1 warning   |

### Findings — VS Code Workspace Diagnostics

| #   | Group                                                       | Root Cause                                                         | Files Affected                           | Issue Count |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | ----------- |
| 4   | Inline styles (`no-inline-styles`)                          | Dynamic `style={{}}` props used for data-driven colors / gradients | 6 files (8 instances across active code) | 8 warnings  |
| 5   | Accessibility — button missing text (`axe/name-role-value`) | Notification bell button has no `aria-label` or `title`            | 1 file                                   | 1 error     |
| 6   | CSS property ordering (`css-prefix-order`)                  | `backdrop-filter` listed before `-webkit-backdrop-filter`          | 1 file (`globals.css`)                   | 1 warning   |
| 7   | CSS compat (`compat-api/css`)                               | `scrollbar-width` unsupported in older browsers                    | 1 file (`globals.css`)                   | 1 warning   |
| 8   | tsconfig `forceConsistentCasingInFileNames`                 | Not enabled — can cause cross-OS issues                            | 1 file (`tsconfig.json`)                 | 1 warning   |

---

### Fix Plan

#### Group 1 — Unused imports / variables (10 errors)

- [x] **1a** `settings/page.tsx:214` — Remove unused `user` destructure (only `hasRole` is needed)
- [x] **1b** `api/smart-links/[id]/route.ts:3` — Remove unused `requireRole` import
- [x] **1c** `api/smart-links/route.ts:4,9` — Remove unused `notFoundResponse` and `deactivateLink` imports
- [x] **1d** `modules/campaign/components/CampaignFilters.tsx:3` — Remove unused `Divider` import from antd
- [x] **1e** `modules/campaign/components/CampaignModal.tsx:4,9` — Remove unused `Tooltip` and `CampaignBanner` imports
- [x] **1f** `modules/leaderboard/components/LeaderboardTable.tsx:5` — Remove unused `ICONS` import
- [x] **1g** `modules/links/components/SmartLinkCard.tsx:19` — Rename destructure `onGenerate: _onGenerate`

#### Group 2 — Empty interface extends (5 errors)

- [x] **2a** `components/ui/Badge.tsx:6` — Change `interface BadgeProps extends AntBadgeProps {}` → `type BadgeProps = AntBadgeProps`
- [x] **2b** `components/ui/Modal.tsx:7` — Same pattern → `type ModalProps = AntModalProps`
- [x] **2c** `components/ui/Skeleton.tsx:6` — Same → `type SkeletonProps = AntSkeletonProps`
- [x] **2d** `components/ui/Tag.tsx:7` — Same → `type TagProps = AntTagProps`
- [x] **2e** `relics/types.ts:25` — Excluded folder, **skipped** + added `relics/**` to ESLint ignores

#### Group 3 — Stale eslint-disable (1 warning)

- [x] **3a** `hooks/useMockDbSubscription.ts:24` — Removed unused `// eslint-disable-next-line` comment

#### Group 4 — Inline styles (8 warnings, 6 active files)

- [x] **4a** Added CSS custom property utility classes to `globals.css`: `text-dynamic`, `bg-dynamic`, `bg-dynamic-muted`, `border-l-dynamic`, `border-l-3`, `ring-dynamic` — all powered by `--_dc` / `--_dc-ring` CSS vars
- [x] **4b** Refactored components to use `style={{ '--_dc': color } as React.CSSProperties}` + utility classes:
  - `KpiStatCard.tsx` — 2 inline styles → `bg-dynamic-muted` + `text-dynamic`
  - `TrustScoreIndicator.tsx` — 3 inline styles → `text-dynamic` (icon, score, label)
  - `PointsSummaryCard.tsx` — 2 inline styles → `border-l-dynamic` + `text-dynamic`
  - `RankBadge.tsx` — 1 inline style → `text-dynamic`
  - `CampaignStory.tsx` — 1 inline style → `ring-dynamic`

#### Group 5 — Accessibility (1 error)

- [x] **5a** `components/layout/Header.tsx:54` — Added `aria-label="Notifications"` to bell icon button

#### Group 6 — CSS prefix order (1 warning)

- [x] **6a** `globals.css` `.glass-surface` — Swapped: `-webkit-backdrop-filter` now before `backdrop-filter`

#### Group 7 — CSS compat (1 warning)

- [x] **7a** `globals.css` `.scrollbar-hide` — Added compat comment; `::-webkit-scrollbar` fallback covers gap

#### Group 8 — tsconfig (1 warning)

- [x] **8a** `tsconfig.json` — Added `"forceConsistentCasingInFileNames": true`

---

### Verification

- [x] `npx tsc --noEmit` — **0 errors**
- [x] `npx eslint . --ext .ts,.tsx` — **0 errors, 0 warnings**
- [ ] VS Code workspace problems — reduced to acceptable level

---

## Ad-Hoc Repairs Log

_(none yet)_
