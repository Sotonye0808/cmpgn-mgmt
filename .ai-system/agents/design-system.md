# Design System

> **Overview:** DMHicc uses a token-driven design system. The canonical spec lives in `.github/design-system.md`; this file captures non-negotiable rules and conventions for AI changes.

---

## Non-Negotiables

- All color, spacing, radius, and shadow values come from CSS tokens prefixed `--ds-*`.
- Do not use raw Tailwind palette classes (`blue-600`, `gray-800`) for semantic color.
- Glassmorphism applies only to KPI stat cards, analytics overview blocks, modal headers, and campaign story rings.
- Glow borders apply only to active nav items, selected cards, hover on interactive cards, and focused inputs.
- Dashboard KPI sections use a bento grid layout; tables and forms are full-width.

---

## Component Expectations

- Ant Design v5 is the primary UI library; extend with Tailwind only where needed.
- Shared UI primitives live in `components/ui` and should be reused before introducing new styles.
- Buttons, inputs, and cards must inherit tokenized colors from the design system.

---

## Responsive Guidance

- Mobile-first layouts; ensure 320px width remains usable.
- Use Tailwind v4 breakpoints (`sm`, `md`, `lg`, `xl`) consistently.

---

## Accessibility Minimums

- All interactive elements must have visible focus states.
- Color contrast must meet WCAG AA for text.
- Images must have `alt` text.
- Form inputs must have associated labels.
