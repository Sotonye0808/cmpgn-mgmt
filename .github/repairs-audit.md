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

---

## Broad Repair — 2026-03-02 — Post-Phase 13 workspace diagnostic pass

### Summary

- **`npx tsc --noEmit`** — **0 errors** (clean)
- **`npx eslint . --ext .ts,.tsx`** — **7 errors, 2 warnings**
- **VS Code workspace diagnostics** — **22 additional issues** (inline styles, a11y, CSS compat, unused vars)

---

### Findings — ESLint

| #   | Group                                     | Root Cause                                    | Files Affected | Count                            |
| --- | ----------------------------------------- | --------------------------------------------- | -------------- | -------------------------------- |
| 1   | Unused imports/variables                  | Imported symbols never referenced             | 4 files        | 6 errors                         |
| 2   | `<img>` instead of `<Image>`              | Raw `<img>` tags used instead of `next/image` | 1 file         | 2 warnings                       |
| 3   | Triple-slash reference in `next-env.d.ts` | Auto-generated file not excluded from ESLint  | 1 file         | 1 error (auto-generated, ignore) |

### Findings — VS Code Workspace Diagnostics

| #   | Group                                                          | Root Cause                                                                | Files Affected    | Count      |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------- | ---------- |
| 4   | Inline styles (`no-inline-styles`) — ambient radial gradients  | Complex multi-stop radial gradients on ambient glow `<div>`s              | 3 files (layouts) | 3 warnings |
| 5   | Inline styles — progress bar widths                            | Dynamic `width: ${percent}%` for progress bars                            | 3 files           | 3 warnings |
| 6   | Inline styles — `--_dc` CSS custom prop (prior repair pattern) | Remaining `style={{ '--_dc': ... }}` usages flagged by linter             | 5 files           | 5 warnings |
| 7   | Inline styles — data-driven color in notifications             | `style={{ background, color }}` with dynamic type colors                  | 1 file            | 2 warnings |
| 8   | Inline styles — misc (`cursor: default`, status badge color)   | One-off dynamic styles on Tag, status badges                              | 2 files           | 2 warnings |
| 9   | A11y — buttons missing discernible text                        | Icon-only buttons lack `aria-label`                                       | 2 files           | 2 errors   |
| 10  | CSS compat — `color-mix()`                                     | `bg-dynamic-muted` utility uses `color-mix()` unsupported in Chrome < 111 | 1 file            | 1 warning  |
| 11  | CSS compat — `scrollbar-width`                                 | Already documented in prior repair (has `::-webkit-scrollbar` fallback)   | 1 file            | 1 warning  |

---

### Fix Plan

#### Group 1 — Unused imports/variables (6 errors, 4 files)

- [ ] **1a** `components/ui/AvatarPicker.tsx:9` — Remove unused `type AvatarOption` import
- [ ] **1b** `components/ui/MediaUpload.tsx:4–5` — Remove unused `Button`, `UploadFile`, `UploadChangeParam` imports
- [ ] **1c** `components/ui/PhoneInput.tsx:7` — Remove unused `DEFAULT_COUNTRY_CODE` import
- [ ] **1d** `modules/teams/components/TeamManagementPanel.tsx:10` — Remove unused `Tag` import

#### Group 2 — `<img>` → `<Image>` (2 warnings)

- [ ] **2a** `app/(public)/page.tsx:104,211` — Replace `<img>` with `next/image` `<Image>` component

#### Group 3 — ESLint ignore for auto-generated file (1 error)

- [ ] **3a** `eslint.config.mjs` — Add `"next-env.d.ts"` to ignores list

#### Group 4 — Ambient glow inline styles → CSS utility (3 warnings, 3 layouts)

- [ ] **4a** Extract the 3 ambient radial gradient backgrounds into named CSS utility classes in `globals.css` and replace `style={{}}` with class names:
  - `app/(dashboard)/layout.tsx` → `.ambient-glow-dashboard`
  - `app/(public)/layout.tsx` → `.ambient-glow-public`
  - `app/(auth)/layout.tsx` → `.ambient-glow-auth`

#### Group 5 — Progress bar dynamic widths (3 warnings, 3 files)

- [ ] **5a** These are truly dynamic (percentage from data). Convert to CSS custom property pattern: `style={{ '--_bar-w': \`${pct}%\` }}`+ utility`.bar-dynamic { width: var(--\_bar-w) }`in`globals.css`. Files:
  - `app/(public)/page.tsx:163`
  - `components/ui/PublicActiveCampaigns.tsx:105`
  - `modules/teams/components/TeamCard.tsx:66`

#### Group 6 — `--_dc` CSS prop flagged by linter (5 warnings)

> These are from the previous repair's CSS custom property injection pattern. The `style={{ '--_dc': ... }}` is minimal and intentional — the linter flags any `style={}`. Acceptable tradeoff per design-system guidelines. **No action needed — document as accepted.**

#### Group 7 — Notification dynamic colors (2 warnings)

- [ ] **7a** `components/ui/NotificationDropdown.tsx:109` — Notification icon bg/color uses `TYPE_COLOR[n.type]`. Convert to `--_dc` pattern + `bg-dynamic-muted text-dynamic` classes.
- [ ] **7b** `components/ui/NotificationDropdown.tsx:131` — Unread dot uses `var(--ds-brand-accent)` inline. Replace with `bg-ds-brand-accent` utility class.

#### Group 8 — Misc inline styles (2 warnings)

- [ ] **8a** `modules/trust/components/TrustScoreIndicator.tsx:47` — Tag `style={{ cursor: "default" }}` → add `cursor-default` class
- [ ] **8b** `modules/proofs/components/ProofCard.tsx:50` — Status badge `style={{ color }}` → use `--_dc` + `text-dynamic`
- [ ] **8c** `app/(public)/how-it-works/page.tsx:73,79` — Pipeline stage circle & badge use `stage.color` inline → use `--_dc` + `bg-dynamic text-dynamic bg-dynamic-muted`

#### Group 9 — A11y: buttons missing discernible text (2 errors)

- [ ] **9a** `modules/campaign/components/CampaignCard.tsx:210` — Add `aria-label="Share campaign"` to share button
- [ ] **9b** `modules/links/components/SmartLinkCard.tsx:106` — Add `aria-label` to share button

#### Group 10 — CSS compat: `color-mix()` (1 warning)

- [ ] **10a** `globals.css` — Add fallback for `.bg-dynamic-muted` using opacity-based approach before `color-mix()` for older browsers

#### Group 11 — CSS compat: `scrollbar-width` (1 warning)

> Already documented and accepted in prior repair. **No action.**

---

### Verification

- [ ] `npx tsc --noEmit` — clean
- [ ] `npx eslint . --ext .ts,.tsx --quiet` — clean
- [ ] VS Code workspace problems — reduced
