# Personal website visual redesign

**Date:** 2026-05-02
**Status:** Approved · ready for implementation plan
**Owner:** Jaynish Shah

## 1. Intent

Revamp the visual design of jaynishshah.com so it reads as the website of a **design system leader** — minimal, editorial, product-craft, full of finer details. Replace the current "WordPress-mirror" look (PT Serif body, mixed accents, generic warm tones) with a single cohesive visual language: warm editorial paper, an ownable cobalt accent, and a restrained "construction marks" graphic device that recurs across every page.

## 2. Personality

- **Minimal** — generous space, hairline rules, restrained chromatic accent.
- **Editorial** — italic serif emphasis, mono labels, paper-feel surface.
- **Product-craft** — every detail considered: token mapping, symbol-as-bullet, axis dividers.
- **Slight brutalist edge** — `+` and `§` symbols, monospace metadata, but never oversized or aggressive.
- **Reflects a design system leader** — the visual hook (construction marks) embodies what design systems are: drafted, measured, intentional.

## 3. Locked design decisions

### 3.1 Color tokens

| Token | Light | Dark | Notes |
|---|---|---|---|
| `paper` | `#FAF6EC` | `#181410` | Lifted cream / warm inky surface. Both feel like the same paper at different times of day. |
| `ink` | `#1A1208` | `#EFE8D9` | Warm-black / cream off-white. Never pure black or pure white. |
| `accent` (cobalt) | `#2647CC` | `#7B95EE` | Saturated true-blue, lifted in dark mode so it stays luminous. |
| `body` (muted) | `#4A3A2C` | `#B5AB99` | Used for italic body copy, captions, secondary text. |
| `rule` | `rgba(26,18,8,0.18)` | `rgba(239,232,217,0.18)` | Hairline dividers. |
| `rule-soft` | `rgba(26,18,8,0.10)` | `rgba(239,232,217,0.10)` | Section row separators. |

### 3.2 Typography

The mockups used Helvetica + Georgia italic + SF Mono (system stack). For production we use named families with system fallbacks:

| Role | Family | Fallback | Use |
|---|---|---|---|
| Display sans | **Inter** | `Helvetica Neue, sans-serif` | All headlines, names, link text, post titles. Weights 400, 500. Letter-spacing tight (-0.7px on headlines). |
| Italic serif | **Source Serif 4** *italic* | `Georgia, serif` | Italic emphasis inside headlines, body intro paragraph, captions. Weight 400. |
| Mono | **JetBrains Mono** | `SF Mono, monospace` | Section labels (§), metadata, symbol bullets, dimension labels. Weight 400, 500. Letter-spacing 1.4–1.6px, often uppercase. |

The current MV Office (custom OTF) and PT Serif fonts are removed.

> **Decision needed:** Inter / Source Serif / JetBrains Mono are all free and on Google Fonts. If you'd rather use commercial fonts (Söhne, Iowan Old Style, IBM Plex Mono), note that during the implementation step.

### 3.3 Visual hook: Restrained Construction Marks

The unifying graphic device across the website. Same family of marks recurs on every page.

**Components:**
- **Crosshair** — small `+`-shaped registration mark (1px hairlines, ~12px arms). Used at most once per major section, near the top corner.
- **Axis divider** — 1px horizontal hairline rule with a 6px vertical tick at each end. A `§ Section name` mono label sits inset on the left, with `paper` background to break the line.
- **Corner mono badge** — `№ 001 · GLA`-style monospace label in `accent` color, top-right of hero / page header.
- **Symbol bullets** — `+` for list items, `→` for "view all" links, `§` for section labels. Always in `accent` color, mono family.

**Placement rules (must follow):**
- One crosshair maximum per major page region.
- Axis dividers separate top-level sections, never sub-blocks within a section.
- Corner mono badge appears once per page, top-right.
- No oversized symbols. No graphic appears more than necessary.
- `accent` color reserved for: italic emphasis inside headlines, all construction marks, all symbol bullets, link arrows. Never used for body copy or large background fills.

### 3.4 Layout & spacing

- Existing spacing tokens (`--spacing-10` through `--spacing-80`) remain.
- Existing `--content-size: 720px` and `--wide-size: 1280px` remain.
- The hero video on the homepage is **kept** (per existing layout) — it sits above the new hero block.

### 3.5 Theme switching

- Both light and dark modes implemented as CSS custom properties.
- Theme toggle: respect `prefers-color-scheme` by default. Add a manual toggle in the header, persisted in `localStorage`.

## 4. What changes in code

### 4.1 Files modified

- `src/app/globals.css` — replace color tokens, font-face definitions, base typography, button/link styles.
- `src/app/layout.tsx` — load new fonts (Google Fonts via `next/font`), add theme provider.
- `src/app/page.tsx` + `page.module.css` — update homepage hero with construction marks, axis dividers, corner badge.
- `src/components/Header.tsx` + `Header.module.css` — new typographic style, add theme toggle.
- `src/components/Footer.tsx` + `Footer.module.css` — restrained construction marks, mono metadata.
- `src/components/PostCard.tsx` + `PostCard.module.css` — `+` bullet treatment, mono dates.
- `src/components/Newsletter.tsx` + `Newsletter.module.css` — match new aesthetic.
- `src/app/about/`, `src/app/blog/`, `src/app/case-studies/`, `src/app/case-study/[slug]/` — apply tokens, ensure construction marks recur on each page header.

### 4.2 Files removed

- `public/fonts/MVOffice-*.otf` (5 files) — replaced by Google Fonts.

### 4.3 New components

- `src/components/CrossHair.tsx` — small SVG crosshair mark, props for position.
- `src/components/AxisDivider.tsx` — 1px rule with end ticks and inset mono label.
- `src/components/CornerBadge.tsx` — mono `№ 001 · GLA`-style label.
- `src/components/ThemeToggle.tsx` — light/dark switch in the header.

### 4.4 Risks / gotchas

- Existing blog posts and case studies may have hardcoded styles in their MDX/HTML. Audit during implementation.
- Header / nav currently uses Radix navigation menu — restyle without changing structure.
- Newsletter component: keep functional, just restyle.

## 5. Acceptance criteria

- [ ] Every page (`/`, `/about`, `/blog`, `/blog/[slug]`, `/case-studies`, `/case-study/[slug]`, 404) uses the new tokens — no hardcoded colors remain.
- [ ] Each page has at most one crosshair, one corner badge, axis dividers between top-level sections.
- [ ] Light + dark modes both render cleanly, with theme toggle in the header.
- [ ] Cobalt accent reads clearly in both modes; no color reads as near-black.
- [ ] Inter / Source Serif italic / JetBrains Mono load via `next/font`. MV Office files deleted.
- [ ] All `+` bullet, `→` link arrow, `§` section label uses are consistent.
- [ ] Lighthouse / build runs cleanly. No regressions to existing routes.

## 6. Out of scope

- Content rewrites — copy, blog posts, case studies stay as-is.
- New pages or features.
- Newsletter backend changes.
- Animation beyond simple CSS hover/focus transitions.
