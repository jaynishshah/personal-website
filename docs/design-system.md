# Website theme

The source of truth for the site's theme is `src/app/globals.css`. Use its tokens in page and component styles instead of repeating color values, type sizes, or frame widths.

## Color

The light theme uses a paper canvas (`--color-portfolio-canvas`), dark ink (`--color-portfolio-ink`), muted copy (`--color-portfolio-muted`), and a blue accent (`--color-portfolio-accent`). Rule, accent tint, and media placeholder colors have their own tokens. The site's semantic aliases (`--color-base`, `--color-contrast`, `--color-accent`, and related roles) consume this palette. The optional dark theme overrides those semantic aliases for pages that support it. Home, Work, Writing, and article pages use the light editorial palette consistently.

Use semantic aliases for general components. Use the portfolio tokens when a surface intentionally keeps the editorial light treatment regardless of the user's theme setting.

## Typography

`--font-family-display` is MV Office for headings and navigation. `--font-family-editorial` is Source Serif 4 for summaries and long form copy. `--font-family-mono` is JetBrains Mono for small metadata and utility text. The global `--type-*` tokens define heading, portfolio label, navigation, summary, and article body sizes. Article layout variables can adjust spacing and line height locally, but their core sizes come from these tokens.

## Layout

`--portfolio-frame-max` is the 1140px outer frame shared by the homepage intro and navigation, Work, Writing, and their detail pages. `--portfolio-content-max` is their 720px main reading measure. The left navigation, right article contents rail, column gap, and vertical inset use the `--portfolio-*` layout tokens. Index pages leave the right grid track empty to keep cards aligned with article content. Case study articles use that track for contents navigation. Below 900px, the right track disappears; below 620px, the layout stacks.

`--site-content-max` remains a wider 1280px option for layouts that deliberately span more of the page. `--reading-content-max` is the general reading measure. The homepage background remains full viewport; its text and navigation use the shared portfolio frame.

## Adding a page

Choose the existing frame and type role that fits its content, then consume its tokens. Add a new token only when a distinct value has a repeatable role across the site. Keep one-off composition details local to the component.
