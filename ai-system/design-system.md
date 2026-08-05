# Design System

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-04
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
