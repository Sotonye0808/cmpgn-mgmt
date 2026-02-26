# DMHicc — Design System

> **Status:** Design Specification — Ready for Implementation  
> Last reviewed: February 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette & Token Architecture](#2-color-palette--token-architecture)
3. [Token Reference (CSS)](#3-token-reference-css)
4. [Tailwind v4 Exposure](#4-tailwind-v4-exposure)
5. [Typography System](#5-typography-system)
6. [Layout System](#6-layout-system)
7. [Glassmorphism Rules](#7-glassmorphism-rules)
8. [Glow Border Strategy](#8-glow-border-strategy)
9. [Component Guidelines](#9-component-guidelines)
10. [Motion System](#10-motion-system)
11. [Anti-Patterns](#11-anti-patterns)

---

## 1. Design Philosophy

### Brand Direction

DMHicc is a **digital mobilization platform** — the visual language must project energy, momentum, and accountability. The design is built around a **deep-space dark base** with **electric violet** as the single active accent. Harvesters emerald is retained as success/positive feedback only.

**Design keywords:** Energy · Impact · Momentum · Precision · Depth · Glow · Bento · Glass

### Principles

1. **Deep-space anchor.** The base tone is near-black (`#080910`) — a richer, more saturated dark than pure black. All surfaces are built outward from this.
2. **Single active accent.** Electric violet (`#7C3AED`) is the only interactive/CTA color. It carries all hover states, focused inputs, active nav items, and primary buttons. It never shares the stage.
3. **Emerald for success.** Harvesters emerald (`#10B981`) is used exclusively for positive metrics, success states, confirmations, and streak indicators. It is not a primary accent.
4. **Single source of truth.** All design values live once in `app/globals.css`. Ant Design tokens, Tailwind utilities, and component classes are all derived references.
5. **Glassmorphism with restraint.** Glass surfaces appear only on KPI bento cards, analytics overview blocks, and modal headers. Campaign story rings use gradient rings only. All data tables and dense screens use opaque surfaces.
6. **Glow with intention.** Glow borders are applied only at interaction boundaries — active state, hover, focus, selected. They are never decorative at rest.
7. **Dark-first, light-complete.** Dark mode is the primary design context. Light mode is a clean, minimal inversion — not an afterthought.

---

## 2. Color Palette & Token Architecture

### Token Tiers

```
Tier 1: Palette  (raw hex, never used in components)
  --palette-violet-500: #7C3AED

Tier 2: Semantic  (reference palette, describe purpose)
  --ds-brand-accent: var(--palette-violet-500)

Tier 3: Component  (optional scoped overrides)
  --ds-sidebar-bg: var(--ds-surface-base)
```

### New Color Palette vs Previous

| Role           | Previous (CRM)                   | DMHicc                              |
| -------------- | -------------------------------- | ----------------------------------- |
| Primary Accent | `#10B981` Harvesters Emerald     | `#7C3AED` Electric Violet           |
| Accent Hover   | `#059669`                        | `#6D28D9`                           |
| Accent Subtle  | `#ecfdf5`                        | `#f5f3ff`                           |
| Success        | `#10B981`                        | `#10B981` (emerald retained)        |
| Base Surface   | `#f8f9fb` light / `#0A0A0B` dark | `#f8f9fb` light / `#080910` dark    |
| Glass Tint     | white-rgba                       | violet-rgba dark / white-rgba light |

---

## 3. Token Reference (CSS)

Paste this in full into `app/globals.css`.

### `:root` (Light Mode)

```css
:root {
  /* ─── Palette ─────────────────────────────────────── */
  /* Violet Scale */
  --palette-violet-900: #2e1065;
  --palette-violet-700: #6d28d9;
  --palette-violet-600: #7c3aed;
  --palette-violet-500: #8b5cf6;
  --palette-violet-400: #a78bfa;
  --palette-violet-200: #ddd6fe;
  --palette-violet-50: #f5f3ff;

  /* Emerald Scale (success / positive metrics) */
  --palette-emerald-600: #059669;
  --palette-emerald-500: #10b981;
  --palette-emerald-400: #34d399;
  --palette-emerald-50: #ecfdf5;

  /* Neutral Scale */
  --palette-neutral-950: #080910;
  --palette-neutral-900: #0f172a;
  --palette-neutral-800: #1e293b;
  --palette-neutral-700: #374151;
  --palette-neutral-600: #4b5563;
  --palette-neutral-500: #64748b;
  --palette-neutral-400: #94a3b8;
  --palette-neutral-300: #cbd5e1;
  --palette-neutral-200: #e5e7eb;
  --palette-neutral-100: #f1f5f9;
  --palette-neutral-50: #f8f9fb;
  --palette-neutral-0: #ffffff;

  /* ─── Brand / Accent ─────────────────────────────── */
  --ds-brand-accent: var(--palette-violet-600);
  --ds-brand-accent-hover: var(--palette-violet-700);
  --ds-brand-accent-subtle: var(--palette-violet-50);
  --ds-brand-success: var(--palette-emerald-500);
  --ds-brand-success-subtle: var(--palette-emerald-50);

  /* ─── Status ─────────────────────────────────────── */
  --ds-status-success: #15803d;
  --ds-status-warning: #b45309;
  --ds-status-error: #dc2626;
  --ds-status-info: var(--palette-violet-600);

  /* ─── Surfaces ───────────────────────────────────── */
  --ds-surface-base: var(--palette-neutral-50);
  --ds-surface-elevated: var(--palette-neutral-0);
  --ds-surface-sunken: var(--palette-neutral-100);
  --ds-surface-overlay: var(--palette-neutral-0);
  --ds-surface-sidebar: var(--palette-neutral-0);
  --ds-surface-header: var(--palette-neutral-0);
  --ds-surface-glass: rgba(255, 255, 255, 0.7);

  /* ─── Text ───────────────────────────────────────── */
  --ds-text-primary: var(--palette-neutral-900);
  --ds-text-secondary: var(--palette-neutral-500);
  --ds-text-subtle: var(--palette-neutral-400);
  --ds-text-inverse: var(--palette-neutral-0);
  --ds-text-link: var(--palette-violet-600);

  /* ─── Borders ────────────────────────────────────── */
  --ds-border-base: var(--palette-neutral-200);
  --ds-border-strong: var(--palette-neutral-300);
  --ds-border-subtle: var(--palette-neutral-100);
  --ds-border-glass: rgba(255, 255, 255, 0.6);

  /* ─── Glow ───────────────────────────────────────── */
  --ds-glow-accent-soft:
    0 0 0 1px rgba(124, 58, 237, 0.2), 0 0 12px rgba(124, 58, 237, 0.1);
  --ds-glow-accent-strong:
    0 0 0 1px rgba(124, 58, 237, 0.4), 0 0 24px rgba(124, 58, 237, 0.25);

  /* ─── Charts ─────────────────────────────────────── */
  --ds-chart-1: #7c3aed;
  --ds-chart-2: #10b981;
  --ds-chart-3: #2563eb;
  --ds-chart-4: #ea580c;
  --ds-chart-5: #0891b2;
  --ds-chart-6: #be185d;

  /* ─── Shape ──────────────────────────────────────── */
  --ds-radius-sm: 4px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 20px;
  --ds-radius-2xl: 24px;
  --ds-radius-full: 9999px;

  /* ─── Shadows ────────────────────────────────────── */
  --ds-shadow-sm:
    0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --ds-shadow-md:
    0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --ds-shadow-lg:
    0 12px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06);
  --ds-shadow-xl:
    0 24px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.07);

  /* ─── Typography ─────────────────────────────────── */
  --ds-font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}
```

### `.dark` (Dark Mode Overrides Only)

```css
.dark {
  /* ─── Surfaces ───────────────────────────────────── */
  --ds-surface-base: #080910;
  --ds-surface-elevated: #0e0f17;
  --ds-surface-sunken: #080910;
  --ds-surface-overlay: #0e0f17;
  --ds-surface-sidebar: #080910;
  --ds-surface-header: #0e0f17;
  --ds-surface-glass: rgba(124, 58, 237, 0.06);

  /* ─── Brand accent — theme-invariant ────────────── */
  --ds-brand-accent: #8b5cf6;
  --ds-brand-accent-hover: #7c3aed;
  --ds-brand-accent-subtle: rgba(124, 58, 237, 0.12);
  --ds-brand-success: var(--palette-emerald-400);

  /* ─── Status ─────────────────────────────────────── */
  --ds-status-success: #4ade80;
  --ds-status-warning: #fbbf24;
  --ds-status-error: #f87171;
  --ds-status-info: var(--palette-violet-400);

  /* ─── Text ───────────────────────────────────────── */
  --ds-text-primary: #f0f0fa;
  --ds-text-secondary: var(--palette-neutral-400);
  --ds-text-subtle: #475569;
  --ds-text-inverse: var(--palette-neutral-900);
  --ds-text-link: var(--palette-violet-400);

  /* ─── Borders ────────────────────────────────────── */
  --ds-border-base: rgba(255, 255, 255, 0.07);
  --ds-border-strong: rgba(255, 255, 255, 0.13);
  --ds-border-subtle: rgba(255, 255, 255, 0.04);
  --ds-border-glass: rgba(124, 58, 237, 0.18);

  /* ─── Glow ───────────────────────────────────────── */
  --ds-glow-accent-soft:
    0 0 0 1px rgba(139, 92, 246, 0.25), 0 0 16px rgba(139, 92, 246, 0.15);
  --ds-glow-accent-strong:
    0 0 0 1px rgba(139, 92, 246, 0.45), 0 0 28px rgba(139, 92, 246, 0.3);

  /* ─── Charts ─────────────────────────────────────── */
  --ds-chart-1: #a78bfa;
  --ds-chart-2: #34d399;
  --ds-chart-3: #60a5fa;
  --ds-chart-4: #fb923c;
  --ds-chart-5: #22d3ee;
  --ds-chart-6: #f472b6;

  /* ─── Shadows ────────────────────────────────────── */
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.35);
  --ds-shadow-md:
    0 4px 8px -2px rgb(0 0 0 / 0.55), 0 2px 4px -2px rgb(0 0 0 / 0.35);
  --ds-shadow-lg:
    0 12px 20px -4px rgb(0 0 0 / 0.65), 0 4px 8px -4px rgb(0 0 0 / 0.45);
  --ds-shadow-xl:
    0 24px 32px -8px rgb(0 0 0 / 0.75), 0 8px 16px -6px rgb(0 0 0 / 0.55);
}
```

### Utility Classes (`@layer utilities`)

```css
@layer utilities {
  .glass-surface {
    background: var(--ds-surface-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--ds-border-glass);
  }

  .glow-border {
    box-shadow: var(--ds-glow-accent-soft);
  }

  .glow-border-strong {
    box-shadow: var(--ds-glow-accent-strong);
  }

  .transition-base {
    transition: all 200ms ease-in-out;
  }
}
```

---

## 4. Tailwind v4 Exposure

In `app/globals.css`, inside `@theme inline {}`:

```css
@theme inline {
  --color-ds-brand-accent: var(--ds-brand-accent);
  --color-ds-brand-accent-hover: var(--ds-brand-accent-hover);
  --color-ds-brand-accent-subtle: var(--ds-brand-accent-subtle);
  --color-ds-brand-success: var(--ds-brand-success);
  --color-ds-brand-success-subtle: var(--ds-brand-success-subtle);

  --color-ds-status-success: var(--ds-status-success);
  --color-ds-status-warning: var(--ds-status-warning);
  --color-ds-status-error: var(--ds-status-error);
  --color-ds-status-info: var(--ds-status-info);

  --color-ds-surface-base: var(--ds-surface-base);
  --color-ds-surface-elevated: var(--ds-surface-elevated);
  --color-ds-surface-sunken: var(--ds-surface-sunken);
  --color-ds-surface-overlay: var(--ds-surface-overlay);
  --color-ds-surface-sidebar: var(--ds-surface-sidebar);
  --color-ds-surface-header: var(--ds-surface-header);
  --color-ds-surface-glass: var(--ds-surface-glass);

  --color-ds-text-primary: var(--ds-text-primary);
  --color-ds-text-secondary: var(--ds-text-secondary);
  --color-ds-text-subtle: var(--ds-text-subtle);
  --color-ds-text-inverse: var(--ds-text-inverse);
  --color-ds-text-link: var(--ds-text-link);

  --color-ds-border-base: var(--ds-border-base);
  --color-ds-border-strong: var(--ds-border-strong);
  --color-ds-border-subtle: var(--ds-border-subtle);
  --color-ds-border-glass: var(--ds-border-glass);

  --color-ds-chart-1: var(--ds-chart-1);
  --color-ds-chart-2: var(--ds-chart-2);
  --color-ds-chart-3: var(--ds-chart-3);
  --color-ds-chart-4: var(--ds-chart-4);
  --color-ds-chart-5: var(--ds-chart-5);
  --color-ds-chart-6: var(--ds-chart-6);

  --radius-ds-sm: var(--ds-radius-sm);
  --radius-ds-md: var(--ds-radius-md);
  --radius-ds-lg: var(--ds-radius-lg);
  --radius-ds-xl: var(--ds-radius-xl);
  --radius-ds-2xl: var(--ds-radius-2xl);
  --radius-ds-full: var(--ds-radius-full);

  --shadow-ds-sm: var(--ds-shadow-sm);
  --shadow-ds-md: var(--ds-shadow-md);
  --shadow-ds-lg: var(--ds-shadow-lg);
  --shadow-ds-xl: var(--ds-shadow-xl);

  --font-ds-sans: var(--ds-font-sans);
  --font-ds-mono: var(--ds-font-mono);
}
```

Usage in components:

```tsx
// ✅ Correct — semantic token
<div className="bg-ds-surface-elevated border border-ds-border-base">

// ❌ Wrong — raw Tailwind palette
<div className="bg-slate-800 border border-gray-700">
```

---

## 5. Typography System

### Fonts

| Role           | Stack          | Load via           |
| -------------- | -------------- | ------------------ |
| Sans (primary) | Inter          | `next/font/google` |
| Mono           | JetBrains Mono | `next/font/google` |

Both fonts must be assigned as CSS variables and forwarded to the Ant Design `ConfigProvider`.

### Scale

| Level   | Size              | Weight  | Letter-spacing | Usage                                |
| ------- | ----------------- | ------- | -------------- | ------------------------------------ |
| Display | 40–48px           | 800     | `-0.04em`      | Hero numbers, campaign impact counts |
| H1      | 32px / `text-3xl` | 700     | `-0.025em`     | Page titles                          |
| H2      | 24px / `text-2xl` | 600     | `-0.02em`      | Section headers                      |
| H3      | 20px / `text-xl`  | 600     | `-0.01em`      | Card headers, panel titles           |
| Body    | 15px              | 400     | `0`            | Standard prose                       |
| Small   | 13px              | 400     | `0`            | Labels, form hints                   |
| Meta    | 12px              | 400–500 | `+0.01em`      | Timestamps, secondary metadata       |

### Rules

- Mono font for **all** numeric/stat values in tables and leaderboard scores
- Never pure white (`#fff`) for text in dark mode — use `--ds-text-primary` (`#f0f0fa`)
- Headings use tight negative letter-spacing; never positive
- Line height: `1.5` body · `1.2` headings · `1.8` dense tables

---

## 6. Layout System

### App Shell

```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px / collapsed 64px)  │  Main Area │
│                                    ├────────────│
│  - Brand wordmark + icon           │ Top Header │
│  - Nav items (config array)        ├────────────│
│  - Role badge                      │  Content   │
│  - Collapse toggle                 │  (scrolls) │
└────────────────────────────────────┴────────────┘
```

| Zone              | Desktop     | Tablet          | Mobile          |
| ----------------- | ----------- | --------------- | --------------- |
| Sidebar           | 240px fixed | Hidden → Drawer | Hidden → Drawer |
| Sidebar collapsed | 64px        | —               | —               |
| Content padding   | 24px        | 16px            | 12px            |
| Content max-width | none (full) | —               | —               |

### Bento Grid (KPI / Analytics Sections)

Used only for KPI stat cards and analytics overview blocks. Never for tables, forms, or dense data.

```
Desktop 12-col:
┌──────────────┬──────────────┬──────┬──────┐
│  Large (6)   │  Large (6)   │ SM(3)│ SM(3)│
├──────┬───────┴──────────────┴──────┴──────┤
│ SM(3)│  Wide Analytics Block (span-9)     │
└──────┴─────────────────────────────────────┘
```

**Bento rules:**

- Corner radius: `--ds-radius-xl` (20px) on all bento cells
- KPI blocks: min-height `120px`; analytics blocks: min-height `240px`
- Gap: `gap-4` (16px) consistently
- Tablet: 6-col · Mobile: single column stack

### Page Anatomy (Dashboard Pages)

Every authenticated page follows this exact vertical order:

```
1. Page Header     Title (H1) + breadcrumb + primary CTA
2. KPI Bento Row   3–5 glass stat cards
3. Primary Data    Main table / list (opaque, no glass)
4. Analytics Row   Charts + trends (glass card wrapper)
5. Secondary       Activity feed, quick links, related panels
```

---

## 7. Glassmorphism Rules

### Apply To

- KPI/stat bento cards
- Analytics overview blocks
- Modal headers
- Campaign Story ring gradient (gradient-only, not blur)

### Never Apply To

- Data tables
- Form inputs and fields
- Sidebar navigation
- Dense list screens (leaderboard rows, donation history)

### Dark Mode Implementation

```css
background: rgba(124, 58, 237, 0.06);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(124, 58, 237, 0.18);
```

### Light Mode Implementation

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.6);
```

**Use the `.glass-surface` utility class** — do not copy these properties inline.

Glass requires a non-flat parent background to produce meaningful blur. Ensure parent containers have a gradient or textured background.

---

## 8. Glow Border Strategy

### Apply To

| Context                      | Token                          |
| ---------------------------- | ------------------------------ |
| Active sidebar nav item      | `--ds-glow-accent-soft`        |
| Selected / active card       | `--ds-glow-accent-strong`      |
| Hovered interactive card     | `--ds-glow-accent-soft`        |
| Focused input/select         | `--ds-glow-accent-soft`        |
| Primary CTA button hover     | `--ds-glow-accent-soft`        |
| Campaign story ring (active) | gradient ring — not box-shadow |

### Never Apply To

- Static resting cards with no interaction
- Table rows
- Read-only stat displays
- Any element at rest (not hovered/focused/selected)

**Use the `.glow-border` and `.glow-border-strong` utility classes** — not inline `box-shadow`.

---

## 9. Component Guidelines

### Ant Design Token Bridge

In `providers/AntdProvider.tsx` — reads from CSS vars at runtime. No hardcoded values:

```tsx
const getCSSVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ConfigProvider theme.token:
{
  colorPrimary:    getCSSVar('--ds-brand-accent'),
  colorSuccess:    getCSSVar('--ds-brand-success'),
  colorWarning:    getCSSVar('--ds-status-warning'),
  colorError:      getCSSVar('--ds-status-error'),
  colorBgBase:     getCSSVar('--ds-surface-base'),
  colorTextBase:   getCSSVar('--ds-text-primary'),
  borderRadius:    8,
  fontFamily:      getCSSVar('--ds-font-sans'),
}
```

### Cards

Four variants — all with `--ds-radius-xl` corners:

| Variant     | When                 | Style                                                       |
| ----------- | -------------------- | ----------------------------------------------------------- |
| Standard    | Tables, data, forms  | `bg-ds-surface-elevated border-ds-border-base shadow-ds-md` |
| Glass       | KPI stats, analytics | `glass-surface`                                             |
| Elevated    | Featured content     | `bg-ds-surface-elevated shadow-ds-lg`                       |
| Glow-active | Selected / focused   | Standard + `glow-border-strong`                             |

### Buttons

| Variant   | Style                                                                      |
| --------- | -------------------------------------------------------------------------- |
| Primary   | `bg-ds-brand-accent` · white text · `rounded-ds-lg` · hover: `glow-border` |
| Secondary | transparent · `border-ds-border-base` · hover: `glow-border`               |
| Ghost     | text only · `text-ds-text-secondary` · hover: `text-ds-brand-accent`       |
| Danger    | `bg-ds-status-error` · white text                                          |
| Success   | `bg-ds-brand-success` · white text                                         |

### Sidebar Nav Items

| State   | Style                                                        |
| ------- | ------------------------------------------------------------ |
| Default | `text-ds-text-secondary bg-transparent`                      |
| Hover   | `bg-ds-surface-sunken text-ds-text-primary`                  |
| Active  | `bg-ds-brand-accent-subtle text-ds-brand-accent glow-border` |

### Inputs / Forms

- Height: 44px (WCAG min touch target)
- Border radius: `--ds-radius-lg` (12px)
- Background: `--ds-surface-sunken`
- Focus: `border-ds-brand-accent glow-border`
- Labels always above — never placeholder-only

### Tables

Clear, opaque surfaces only. Never apply glass to tables.

- Row hover: `bg-ds-brand-accent-subtle`
- Header: sticky, `bg-ds-surface-elevated`
- Border: `--ds-border-base`
- Numeric columns: `font-ds-mono`
- Wrapper: `rounded-ds-lg overflow-hidden border-ds-border-base`

### Modals

- Border radius: `--ds-radius-2xl` (24px)
- Header: `glass-surface`
- Enter animation: `opacity(0→1) + scale(0.97→1)`, 200ms ease-in-out

### Campaign Story Rings

Gradient ring pattern from relics is retained:

- Active: `from-ds-brand-accent via-purple-500 to-pink-500`
- Expired: `from-gray-300 to-gray-400` (light) / `from-gray-600 to-gray-700` (dark)
- Draft/Paused: `from-yellow-400 to-orange-500`

---

## 10. Motion System

| Element                 | Motion                                                 |
| ----------------------- | ------------------------------------------------------ |
| Modal open/close        | `opacity(0↔1) + scale(0.97↔1)`, 200ms ease-in-out      |
| Card hover lift         | `translateY(-2px)`, 150ms ease                         |
| Sidebar item transition | `background-color + box-shadow`, 150ms ease            |
| Campaign story hover    | `scale(1.08)`, 200ms ease                              |
| Page transitions        | `opacity(0→1)`, 200ms, Framer Motion `AnimatePresence` |
| Stat number count-up    | Framer Motion `useMotionValue`, 800ms ease-out         |
| Leaderboard rank change | `translateY` slide, 300ms ease-in-out                  |

**Always respect `prefers-reduced-motion`:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Anti-Patterns

These are **forbidden** in this codebase:

| Anti-Pattern                                                             | Correct Alternative                              |
| ------------------------------------------------------------------------ | ------------------------------------------------ |
| `<h1>Join the Campaign</h1>` (literal string in JSX)                     | `<h1>{CONTENT.hero.headline}</h1>`               |
| `bg-indigo-600`, `text-blue-600` (raw Tailwind palette for semantic use) | `bg-ds-brand-accent`, `text-ds-chart-1`          |
| `box-shadow: 0 0 20px #7c3aed` (inline style with hardcoded hex)         | `className="glow-border"`                        |
| Separate JSX blocks per nav item                                         | `{NAV_ITEMS.map(item => <NavItem {...item} />)}` |
| `colorPrimary: "#7C3AED"` in AntdProvider (hardcoded)                    | `getCSSVar('--ds-brand-accent')`                 |
| `switch(rank) { case 'Gold': return ...` (hardcoded rank logic)          | Loop over `RANK_LEVELS` config array             |
| `import { StarOutlined } from '@ant-design/icons'` inline                | Import from `/config/icons.ts` map               |
| `type Props = { data: any }`                                             | `type Props = { data: SpecificType }`            |
| Raw `fetch()` in component body                                          | Delegate to service or use custom hook           |
| Cross-module internal imports                                            | Only import from module's `index.ts`             |
