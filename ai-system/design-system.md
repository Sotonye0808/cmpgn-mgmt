# Design System

> **Metadata**
> - last-updated-by: update-ai-system.md
> - last-verified-against-code: 2026-08-05
> - staleness-policy: re-verify if UI components or styling dependencies change

> **Overview:** DMHicc uses a token-driven design system. The canonical spec lives in `.github/design-system.md`; this file captures non-negotiable rules and conventions for AI changes.

---

## Visual Language

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-*` tokens | [see `.github/design-system.md`] | All color, spacing, radius, shadow values |

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Body | [system font stack] | [standard] | [regular] |

### Spacing Scale

Token-driven via `--ds-*` variables.

---

## Component Patterns

- Ant Design v5 is the primary UI library; extend with Tailwind only where needed.
- Shared UI primitives live in `components/ui` and should be reused before introducing new styles.
- Buttons, inputs, and cards must inherit tokenized colors from the design system.
- Glassmorphism applies only to KPI stat cards, analytics overview blocks, modal headers, and campaign story rings.
- Glow borders apply only to active nav items, selected cards, hover on interactive cards, and focused inputs.
- Dashboard KPI sections use a bento grid layout; tables and forms are full-width.

---

## UX Principles

1. Do not use raw Tailwind palette classes (`blue-600`, `gray-800`) for semantic color.
2. All interactive elements must have visible focus states.
3. Mobile-first layouts; ensure 320px width remains usable.

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide screens |

---

## Accessibility Requirements

- All interactive elements must have keyboard focus states
- Color contrast must meet WCAG AA (4.5:1 for text)
- Images must have alt text
- Forms must have associated labels

---

## Reference Library

External design languages — competitor, inspiration, or reference sites — pulled into `design-references/<name>/DESIGN.md` (Tier 4, read when explicitly relevant). The `generate-design-md` command creates them.

These are **inputs to be reconciled**, never the project's source of truth. The token tables in this file remain the single source of truth per engineering principles §5. Promotion from a reference into the project's real tokens is a human decision, not an agent write.

See `design-references/README.md` for the folder contract.

---

## Design Asset Viewer (dev-only entry point)

A human-facing route to browse design assets — HTML mocks, images, PDFs — without those assets touching the app's real route table when deployed. This is a dev tool, not an agent workflow, and it is itself governed by the engineering principles like any other page.

**Hard rules (not conventions):**
- Mounted at a distinct, configurable base path (e.g. `/__design/*`) on its own router/middleware branch — never nested under app routes.
- **Gated:** only mountable when the env flag is set (e.g. `ENABLE_DESIGN_VIEWER=true`), defaulting off. **Never enabled in a production build regardless of the flag** — this is a hard rule, not a convention.
- Reads a config manifest (engineering principles §1) listing which local folders/paths it is allowed to serve — never an open filesystem browser.
- No hardcoded asset lists in code.

**Rendering by type:**
- HTML → sandboxed iframe
- Images → `<img>`
- PDF → render pages; where text/structure extraction is needed, use the classify-then-extract approach from the `pdf-html-asset-inspection` skill (detect text vs scanned, extract with position awareness, convert to Markdown) via a small internal utility or thin wrapper.

**Extraction backend decision:** chooses between the two registered extraction candidates (see `tools/registry.md` → PDF-extraction-tooling rows; approach documented in `tools/integrations/`) based on the project stack; the choice is documented in `memory/project-decisions.md`.

**Where it lives:** see also the `system-architecture.md` configuration points template (the `ENABLE_DESIGN_VIEWER` flag) and the viewer's security isolation note for the deployment platform.
