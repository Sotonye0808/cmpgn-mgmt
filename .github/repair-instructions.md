# DMHicc — Repair & Issue Resolution Instructions

## Role

Act as an **expert repairer** for the DMHicc codebase. Fix issues precisely without breaking existing functionality. Follow the project's coding standards at all times.

---

## Broad / General Repair Protocol

When instructed to perform a **broad repair** (e.g. "fix all TypeScript errors", "clean up ESLint"):

### Step 1 — Audit

1. Run `npx tsc --noEmit` — capture all TypeScript errors in full
2. Run `npx eslint . --ext .ts,.tsx` — capture all lint warnings and errors
3. Group errors by type and by root cause (not just by file)
4. Document findings in `.github/repairs-audit.md`:
   - Error groups with root cause analysis
   - Ordered checkbox-driven fix plan
   - Estimated scope (files affected)

### Step 2 — Await Approval

- Present the audit summary and plan to the user
- Do **not** implement until the user gives explicit approval
- If scope is trivial (< 5 files, < 10 errors), state so and ask for a combined go-ahead

### Step 3 — Implement

- Tick off each checkbox in `.github/repairs-audit.md` as completed
- Fix the root cause — never paper over errors with type assertions
- Keep diffs minimal and surgical — fix the issue only, preserve surrounding code
- After all fixes: run `npx tsc --noEmit` again and confirm zero errors
- Run `npx eslint . --ext .ts,.tsx` again and confirm zero warnings

---

## Targeted / Ad-Hoc Repair Protocol

When the user reports a **specific error or issue**:

1. Analyze the reported issue in full context — read all affected files
2. Search the entire codebase for **every instance** of the same root problem:
   - Same type error pattern → find all files with the same shape
   - Same missing import → find all files missing it
   - Same broken API call → find all callers
3. Implement fixes across **all** affected files in one pass — never fix one instance while leaving others broken
4. No approval step required for targeted repairs
5. Log the fix in `.github/repairs-audit.md` under the Ad-Hoc Log (see format below)

---

## Common Issue Patterns & Fixes

### TypeScript `any` Usage

**Rule:** Never introduce `any`. Use `unknown` and narrow, or define the correct type.

```ts
// ❌
const handler = (data: any) => { ... }

// ✅
const handler = (data: unknown) => {
  if (typeof data === 'object' && data !== null) { ... }
}
```

### Missing Type on API Response

Always use `ApiResponse<T>` or `PaginatedResponse<T>`. If a new shape is needed, define it in `/types/api.ts`.

### Untyped Event in Route Handler

```ts
// ❌
export async function GET(request: any) { ... }

// ✅
export async function GET(request: NextRequest): Promise<NextResponse> { ... }
```

### Hardcoded String in JSX

Any text visible to users must come from `/config/content.ts`. Move the string there.

### Raw Tailwind Palette in Class

Any `bg-{color}-{shade}` or `text-{color}-{shade}` used for semantic purpose must be replaced with `bg-ds-*` or `text-ds-*`.

### Inline Icon Import

```ts
// ❌
import { StarOutlined } from "@ant-design/icons";

// ✅
import { ICONS } from "@/config/icons";
// Use ICONS.star
```

### Cross-Module Internal Import

```ts
// ❌
import { linkDb } from "@/modules/links/services/linkDb";

// ✅
import { type SmartLink } from "@/modules/links";
```

### Missing Zod Validation on API Input

All POST / PUT route handlers must validate `request.json()` through the corresponding Zod schema before touching the database or service.

---

## Build Verification Checklist

Run after every repair session:

```bash
npx tsc --noEmit          # Must produce zero output (zero errors)
npx eslint . --ext .ts,.tsx --quiet  # Must produce zero warnings
```

Optionally run a dev build to catch runtime issues:

```bash
npm run build
```

---

## Audit File Format

All repair work is documented in `.github/repairs-audit.md`.

### Broad Repair Section Format

```markdown
## Broad Repair — [Date] — [Short description]

### Findings

| Group                | Root Cause                            | Files Affected | Error Count |
| -------------------- | ------------------------------------- | -------------- | ----------- |
| Missing return types | API routes lack explicit return types | 8 files        | 24 errors   |

### Fix Plan

- [ ] Add `Promise<NextResponse>` return types to all route handlers
- [ ] ...

### Verification

- [ ] `npx tsc --noEmit` — clean
- [ ] `npx eslint` — clean
```

### Ad-Hoc Repairs Log Format

```markdown
## Ad-Hoc Repairs Log

### [Date] — [Short description]

- **Files affected:** `path/to/file.ts`, `path/to/other.ts`
- **Root cause:** [Explanation]
- **Fix applied:** [What was changed]
- **Instances fixed:** N
```

---

## Output Locations

| Artifact                  | Path                                            |
| ------------------------- | ----------------------------------------------- |
| This instruction file     | `.github/repair-instructions.md`                |
| Broad repair audit & plan | `.github/repairs-audit.md`                      |
| Ad-hoc repairs log        | `.github/repairs-audit.md` → Ad-Hoc Repairs Log |
