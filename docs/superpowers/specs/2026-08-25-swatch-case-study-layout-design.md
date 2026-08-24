# Swatch case-study layout redesign

## Summary

Redesign the Swatch detail page as a new case-study reading experience derived from the current homepage and Work page. The page will use the same warm light palette, MV Office display type, Source Serif body type, shared outer content rail, and restrained interaction language. It will not preserve the existing global header or the current case-study metadata panel.

The visual reference at `https://jaynishshah.com/case-study/swatch/` defines the content arrangements: full-width editorial media, compact section pictograms, desktop image/text pairings, and mobile stacking. The new implementation will preserve the current site's design language rather than copying the reference page's chrome, typography, or colors.

## Goals

- Use one semantic maximum-width token for the homepage, Work page, and case-study outer shell.
- Replace the current generic case-study header and metadata treatment with a simpler editorial introduction.
- Render the three problem pictograms beside their corresponding text on desktop and above the text on mobile.
- Render the foundation, component-library, and governance icons as section markers above their headings.
- Preserve every supplied image's aspect ratio and prevent small pictograms from being enlarged as full-width figures.
- Make the special layouts explicit and reusable for future case studies.
- Keep `/case-studies/swatch` as the canonical route and retain the singular legacy redirect.

## Non-goals

- Recreating the old site's global header, footer, typography, colors, or metadata design.
- Redesigning the Work index beyond adopting the shared content-width token.
- Rewriting the Swatch narrative or producing new image assets.
- Inferring special layouts from filenames, image dimensions, heading text, or Markdown adjacency.
- Applying the new case-study presentation to blog posts.

## Visual system

### Shared page rail

Add `--site-content-max: 1280px` as the semantic maximum width for the site's primary content rail. The homepage intro and navigation, the Work page content, and the case-study shell will use this token. Set the existing `--wide-size` token to `var(--site-content-max)` as a compatibility alias for unrelated layouts; new and updated page-shell rules will use the semantic token directly.

All three pages retain the existing responsive `--page-gutter`. The case-study layout therefore aligns to the same left and right desktop edges as the homepage and Work page.

### Case-study hierarchy

The case-study page will force the homepage and Work page's light visual system:

- background: `#f7f5ef`
- primary text: `#1c1c1b`
- muted text: `#66635c`
- accent: `#3158de`
- display headings: MV Office
- narrative copy: Source Serif 4

The global site header and footer will be hidden when the case-study detail shell is present. A local top bar will replace them, using the Work page's thin rule and close-button language. It will identify the view as a case study and provide a close control back to `/case-studies`.

The hero sequence will be:

1. local top bar
2. featured image
3. compact year and discipline line
4. large case-study title
5. summary and introductory paragraph

The existing corner badge, crosshair, three-column system brief, artifact list, outcomes list, and hashtag treatment will be removed from the rendered page. Content frontmatter may remain for indexing and metadata generation.

### Reading and media widths

The outer shell uses `--site-content-max`. Add `--reading-content-max: 720px` for narrative paragraphs, text-led headings, and reference-style pictogram groups. The featured image and large screenshots or diagrams use the full outer rail; text and compact arrangements remain centered on the reading rail.

This two-level layout satisfies both constraints: the page aligns with the homepage's maximum width, while the text remains readable and the source arrangements remain intentional.

Large editorial images will:

- use their intrinsic aspect ratio
- render at the available width without cropping
- use a consistent `4px` corner radius
- render without decorative borders
- use normal document flow, with responsive margins rather than negative-width breakout rules

Captions will use quiet Source Serif styling and will not receive the generic uppercase, prefixed caption treatment.

### Content arrangements

#### Problem pictogram rows

The Flexibility, Scalability, and Promote contribution items will use a reusable two-column row:

- desktop: fixed pictogram column plus flexible text column
- pictogram rendered close to its intended display size and never stretched to the text-column width
- heading and paragraph grouped together in the text column
- consistent vertical rhythm between rows
- mobile: pictogram first, followed by heading and paragraph in one column

#### Section-icon blocks

Token architecture, Component library, and Governance will use a separate reusable section-lead pattern. The icon sits above the heading and introduction, matching the reference page's hierarchy rather than the side-by-side problem rows.

#### Editorial media

All remaining diagrams and screenshots render as ordinary responsive media blocks. Their order and captions remain content-driven. Small pictogram assets are never passed through this full-width media treatment.

## Architecture

### MDX content

Rename `src/content/case-studies/swatch.md` to `swatch.mdx`. The content loader already supports `.mdx` and derives the renderer format from the file extension, so no content-loading interface change is required.

Use explicit MDX components for layouts that Markdown cannot express safely:

- `CaseStudyPictogramRow`
- `CaseStudySectionLead`
- `CaseStudyMedia`

Each component receives asset paths, accessible alt text, and rendered child content. The Swatch document declares the intended grouping directly. No renderer logic will inspect filenames or surrounding headings to decide layout.

### Renderer boundary

Extend `ArticleRenderer`'s MDX component map with the case-study layout primitives. Keep generic Markdown behavior unchanged for blog posts and existing Markdown content.

The new components and their styles belong under `src/components/content/` so they can be reused by later case studies without coupling them to the Swatch route. Each component will have one responsibility:

- `CaseStudyPictogramRow`: responsive icon-and-copy grouping
- `CaseStudySectionLead`: section icon with heading/content stack
- `Figure`/`CaseStudyMedia`: responsive editorial media and optional caption

### Page shell

Refactor `src/app/case-studies/[slug]/page.tsx` and `ArticlePage.module.css` to provide the new local detail shell. The route continues to own frontmatter, metadata generation, featured media, title, summary, and navigation back to Work. The article renderer continues to own the narrative body.

The case-study shell will expose a distinctive root class so global layout CSS can hide the regular site header and footer only on detail pages. The Work index behavior remains unchanged.

## Data flow

1. `getCaseStudy(slug)` reads frontmatter and MDX content.
2. The route renders the case-study shell from frontmatter and passes `content` plus `format` to `ArticleRenderer`.
3. `ArticleRenderer` compiles MDX and resolves the approved component map.
4. The Swatch MDX document selects semantic layout components for pictogram and section-icon groups.
5. Generic headings, paragraphs, links, and media continue through the shared article styles.

## Responsive behavior

- Desktop shell aligns with homepage and Work page through `--site-content-max` and `--page-gutter`.
- Narrative copy remains constrained to the reading measure.
- Problem pictogram rows show image and text side by side on desktop.
- At the existing mobile breakpoint, pictogram rows stack with the image above the copy.
- Section-lead icons remain above their headings at all sizes.
- Large media scales fluidly and never produces horizontal overflow.
- The local close control remains at least `48px` square and keyboard accessible.

## Accessibility and failure behavior

- Decorative images use empty alt text; meaningful diagrams retain descriptive alt text from the document.
- The local close control has an explicit accessible label and visible keyboard focus.
- External links retain safe new-tab attributes through the shared renderer.
- Missing case studies continue to call `notFound()`.
- The implementation will not silently substitute layouts when MDX props are missing. Required component props will be typed, so invalid authoring fails during build rather than producing a distorted page.

## Testing and verification

### Automated checks

- Add component tests for the pictogram row and section-lead markup.
- Verify the MDX renderer exposes the new components without changing Markdown blog rendering.
- Update the case-study integration test to confirm `/case-studies/swatch` returns successfully and the legacy `/case-study/swatch` redirect remains valid.
- Run the existing test suite, lint checks, and production build.

### Visual checks

Use the in-app browser for desktop and mobile verification:

- compare the reference and local page at equivalent viewport widths
- verify shared outer alignment with the homepage and Work page
- inspect every image for aspect ratio, cropping, border radius, and unintended enlargement
- confirm all three problem pictograms align beside text on desktop and stack on mobile
- confirm section icons sit above their headings
- check the full page for horizontal overflow and broken lazy-loaded media

The Product Design visual QA gate must pass before handoff, using side-by-side reference and implementation comparisons rather than independent screenshots.

## Files expected to change

- `src/app/globals.css`
- `src/app/page.module.css`
- `src/app/case-studies/page.module.css`
- `src/app/case-studies/[slug]/page.tsx`
- `src/components/content/ArticleRenderer.tsx`
- `src/components/content/ArticlePage.module.css`
- `src/components/content/ArticleBody.module.css`
- new reusable case-study layout component and style files under `src/components/content/`
- `src/content/case-studies/swatch.md` renamed to `swatch.mdx`
- relevant component and integration tests

## Acceptance criteria

- Homepage, Work, and case-study detail shells use the same semantic outer maximum-width token.
- The Swatch detail page no longer renders the regular site header, footer, corner badge, crosshair, or system brief.
- The visual styling clearly belongs to the current homepage and Work page.
- The three problem pictograms are paired with their text on desktop and stack correctly on mobile.
- Foundation section icons render above their respective headings.
- All supplied images display at appropriate sizes without cropping, stretching, or horizontal overflow.
- The page passes automated checks, production build, desktop/mobile browser verification, and Product Design visual QA.
