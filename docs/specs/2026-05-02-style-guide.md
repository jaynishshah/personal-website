# Style Guide · jaynishshah.com

**Version:** 1.1
**Date:** 2026-05-02
**Status:** Reference document — pairs with the visual redesign spec.

A living reference for the visual system. If something on the site doesn't match this document, fix the site.

---

## 01 / Color

Two surfaces, one global chromatic accent, and tightly scoped artifact accents. Cobalt is the global UI accent; case-study accent colors may appear only inside Work previews and case-study detail metadata.

### Light mode (default)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FAF6EC` | Surface — the page itself |
| `ink` | `#1A1208` | All headings, body, default text |
| `accent` | `#2647CC` | Cobalt — all construction marks, all symbol bullets, link arrows, focus states |
| `body` | `#4A3A2C` | Italic body, captions, secondary text |
| `rule` | `rgba(26,18,8,0.18)` | Hairline dividers (axis dividers, etc.) |
| `rule-soft` | `rgba(26,18,8,0.10)` | Row separators inside lists |

### Dark mode

| Token | Hex | Use |
|---|---|---|
| `paper` | `#181410` | Warm inky surface (not pure black) |
| `ink` | `#EFE8D9` | Soft cream off-white (not pure white) |
| `accent` | `#7B95EE` | Cobalt lifted — same identity, more luminous against dark |
| `body` | `#B5AB99` | Italic body, captions |
| `rule` | `rgba(239,232,217,0.18)` | Hairline dividers |
| `rule-soft` | `rgba(239,232,217,0.10)` | Row separators |

**Theme switching:** respect `prefers-color-scheme` by default; manual toggle in the header, persisted in `localStorage`.

---

## 02 / Typography

Three families. MV Office for display + UI, Source Serif 4 for long-form/editorial copy and selective italic emphasis, JetBrains Mono for labels and metadata.

| Role | Family | Weight | Size | Line-height | Letter-spacing | Notes |
|---|---|---|---|---|---|---|
| H1 / Hero | MV Office | 300–400 | 52–112px | 0.88–0.94 | -0.045em to -0.06em | Italic emphasis may use Source Serif 4 italic in cobalt |
| H2 / Section | MV Office | 300–400 | 32–66px | 0.95–1.0 | -0.055em | |
| H3 / Sub | MV Office | 500 | 18–22px | normal | -0.04em | |
| Body / editorial | Source Serif 4 | 400 | 15–16px | 1.65–1.72 | normal | Ledes, summaries, long-form copy |
| Body / upright | Source Serif 4 | 400 | 14.5–15px | 1.7 | normal | Long-form blog body |
| Mono / label | JetBrains Mono | 400–500 | 10–11px | normal | 1.4–1.6px | UPPERCASE — section labels, metadata, dates |
| Mono / list | JetBrains Mono | 400 | 11.5px | 1.85 | normal | `+` bullet pattern |

Italic emphasis is used sparingly. Inline links in body text are cobalt with no underline; underline appears on hover.

### Case-study artifact accents

Case studies may define a local `accentColor` in frontmatter. It can be used for Work preview media outlines, local metadata labels, and case-study brief chips. It must not replace cobalt in global navigation, buttons, focus states, construction marks outside the case-study surface, or body links.

---

## 03 / Visual hook · Construction Marks

The unifying graphic device. Three primitives recur across every page. **Always sparingly.**

### Crosshair

A 1px registration mark with ~12px arms. Cobalt.

```
     │
─────┼─────
     │
```

**Use:** at most once near the top corner of a major section. Reads as a lock-up point — "this is the start."

### Axis divider

A 1px hairline rule with a 6px vertical tick at each end. A `§ Section` mono label sits inset on the left, with `paper` background to break the line.

```
│  § Practice ──────────────────────────  │
```

**Use:** between top-level sections only. Never between sub-blocks within a section.

### Corner mono badge

Mono label in cobalt, top-right of every page header. Format: `№ NNN · LOC` (e.g. `№ 001 · GLA`).

**Use:** once per page, top-right.

### Placement rules (must follow)

- One crosshair maximum per major page region.
- Axis dividers separate top-level sections only.
- Corner badge appears once per page, top-right.
- Cobalt color is reserved for: global construction marks, all symbol bullets, link arrows, focus states, and axis ticks. **Never** used for body copy, large background fills, or decorative purposes.

---

## 04 / Symbol vocabulary

Mono symbols replace standard UI conventions. Always functional, never decorative.

| Glyph | Name | Use |
|---|---|---|
| `+` | Bullet | List items, post card row markers |
| `→` | Link arrow | "View all" links, "next" links, outbound |
| `§` | Section | Section labels in axis dividers |
| `№` | Number | Page numbers, index, corner badge |

Always rendered in JetBrains Mono, cobalt color, with appropriate letter-spacing. `+` bullets sit in a 14px-wide column to align list contents.

---

## 05 / Components

### Button — Primary

- **Background:** cobalt accent
- **Text:** paper color, MV Office 500, 13px
- **Padding:** 10×18
- **Border-radius:** 2px
- **Hover:** slightly darker cobalt (or 90% opacity)

### Button — Secondary

- **Background:** transparent
- **Border:** 1px cobalt
- **Text:** cobalt, MV Office 500, 13px
- **Padding:** 9×17
- **Hover:** cobalt fill, paper text

### Link — Mono

- **Family:** JetBrains Mono
- **Size:** 11px
- **Letter-spacing:** 1.6px
- **Transform:** UPPERCASE
- **Color:** cobalt
- **Format:** `→ View all writing` or `Read on →`

### Post card row

- `+` bullet · sans title · mono meta · mono date
- 1px hairline divider top and bottom
- Hover: title shifts to cobalt; no underline

### Input — Newsletter

- No box, only baseline rule
- MV Office 13px
- Italic-serif placeholder
- Cobalt focus rule (1px → 2px on focus)
- Submit button: primary button or single `→` arrow

### Nav link

- MV Office 500, 12px
- Active: 1px cobalt underline below text + cobalt color
- Default: ink color
- Hover: cobalt underline appears with 0.2s transition

---

## 06 / Spacing

Base unit 4px. Use named tokens, never raw values.

| Token | Value | Pixel |
|---|---|---|
| `--s-10` | 1rem | 16px |
| `--s-20` | 1.5rem | 24px |
| `--s-30` | 2.5rem | 40px |
| `--s-40` | 4rem | 64px |
| `--s-50` | 6.5rem | 104px |
| `--s-60` | 10.5rem | 168px |
| `--s-70` | 3.38rem | 54px |
| `--s-80` | 5.06rem | 81px |

Existing tokens from the current site are kept.

---

## 07 / Layout primitives

Two container widths.

| Token | Value | Use |
|---|---|---|
| `--content-size` | 720px | Reading width — blog posts, case studies, long-form. Optimised for 65–75 characters per line. |
| `--wide-size` | 1280px | Wide frame — homepage, indexes, two-column splits, heroes. |

---

## 08 / Don'ts

Boundaries that keep the system coherent.

- **Don't add a second global accent color.** Cobalt is the only site-wide accent. Case-study artifact accents are local to Work previews and case-study details only.
- **Don't use pure black or pure white.** Always `paper` / `ink` tokens.
- **Don't oversize construction marks.** Crosshair stays at ~12px arms; axis ticks at 6px. Restraint is the look.
- **Don't stack construction marks.** One crosshair per region, one corner badge per page, axis dividers between top-level sections only.
- **Don't use any other bullet or arrow.** `+ → § №` only. Replacing them with `• ›` or `⟶` erodes the signature.
- **Don't reach for box-shadows.** Use hairline rules and axis dividers. Shadows belong to a different aesthetic.
- **Don't italicise long-form body text.** Italic is reserved for rare emphasis. Long-form body, summaries, and most ledes are upright Source Serif.
- **Don't break the symbol-as-bullet pattern.** Lists are `+ item`, links are `→ Read more`, sections are `§ Title`. Always.

---

## Versioning

Bump version when:
- A token value changes (color, size, spacing).
- The visual hook gains or loses a primitive.
- The symbol vocabulary changes.
- A new component is added or a major style of an existing one changes.

Changelog lives in this file under a `## Changelog` section once v1.0 ships.
