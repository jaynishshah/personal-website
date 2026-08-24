# Swatch Case-Study Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Swatch detail page as a responsive editorial case study that shares the homepage and Work page content rail while rendering pictograms and section icons in their intended image/text arrangements.

**Architecture:** Introduce semantic site and reading-width tokens, replace the generic case-study detail chrome with a dedicated local shell, and convert Swatch from Markdown to MDX. Reusable typed MDX layout components will express pictogram rows, section leads, and editorial media explicitly; generic blog Markdown behavior remains unchanged.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, CSS Modules, `@mdx-js/mdx`, Node's built-in test runner, in-app Browser visual verification.

**Spec:** `docs/superpowers/specs/2026-08-25-swatch-case-study-layout-design.md`

## Global Constraints

- Primary site content rail: `--site-content-max: 1280px`.
- Narrative reading rail: `--reading-content-max: 720px`.
- Page gutters continue to use `--page-gutter: clamp(20px, 4.4vw, 64px)`.
- Case-study palette: background `#f7f5ef`, text `#1c1c1b`, muted text `#66635c`, accent `#3158de`.
- Display headings use MV Office; narrative copy uses Source Serif 4.
- Large images preserve intrinsic aspect ratio, render without cropping or decorative borders, and use `4px` corners.
- Problem pictograms are side by side with copy on desktop and stack above copy on mobile.
- Token architecture, Component library, and Governance icons remain above their headings at all widths.
- The global header, footer, corner badge, crosshair, system brief, and hashtag metadata treatment do not render on the detail page.
- `/case-studies/swatch` remains canonical; `/case-study/swatch` remains a redirect.
- Do not change blog article rendering.
- Preserve all pre-existing user changes in the dirty worktree. Before each commit, inspect `git diff` and stage only task-owned hunks; never reset or discard overlapping work.

---

## File map

- Modify `src/app/globals.css`: define semantic width tokens and case-study theme/header/footer visibility.
- Modify `src/app/page.module.css`: move homepage outer rails to `--site-content-max`.
- Modify `src/app/case-studies/page.module.css`: move Work outer rail to `--site-content-max`.
- Modify `src/app/case-studies/[slug]/page.tsx`: render the local detail shell and pass the case-study renderer variant.
- Modify `src/components/content/ArticlePage.module.css`: style the new case-study shell, hero, local header, and reading rail.
- Modify `src/components/content/ArticleRenderer.tsx`: register typed MDX primitives and add an opt-in case-study variant.
- Modify `src/components/content/ArticleBody.module.css`: scope case-study reading-width and editorial rhythm without altering the default/blog variant.
- Create `src/components/content/CaseStudyLayouts.tsx`: reusable pictogram-row, section-lead, and media components.
- Create `src/components/content/CaseStudyLayouts.module.css`: component-specific responsive layouts.
- Rename `src/content/case-studies/swatch.md` to `src/content/case-studies/swatch.mdx`: declare explicit visual groupings.
- Modify `src/app/case-studies/workPage.integration.test.ts`: cover shared tokens, detail shell, MDX layouts, redirect, and emitted responsive CSS.
- Modify `design-qa.md`: record the final Product Design comparison result only during the visual QA task, preserving unrelated existing material until that gate is run.

---

### Task 1: Share one semantic outer content rail

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.module.css`
- Modify: `src/app/case-studies/page.module.css`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:**
- Consumes: existing `--wide-size: 1280px` and `--page-gutter` tokens.
- Produces: `--site-content-max: 1280px` and `--reading-content-max: 720px`; `--wide-size` becomes a compatibility alias.

- [ ] **Step 1: Add a failing shared-token integration test**

Append this test to `src/app/case-studies/workPage.integration.test.ts`:

```ts
test('Home, Work, and case-study detail share the semantic site content rail', async () => {
  const [homeResponse, workResponse, detailResponse] = await Promise.all([
    fetch(baseUrl),
    fetch(url),
    fetch(`${url}/swatch`),
  ])
  const [homeCss, workCss, detailCss] = await Promise.all([
    getEmittedCss(baseUrl),
    getEmittedCss(url),
    getEmittedCss(`${url}/swatch`),
  ])

  assert.equal(homeResponse.status, 200)
  assert.equal(workResponse.status, 200)
  assert.equal(detailResponse.status, 200)

  for (const css of [homeCss, workCss, detailCss]) {
    assert.match(css, /--site-content-max:\s*1280px/)
    assert.match(css, /--reading-content-max:\s*720px/)
  }

  assert.match(homeCss, /max-width:\s*var\(--site-content-max\)/)
  assert.match(workCss, /max-width:\s*var\(--site-content-max\)/)
})
```

- [ ] **Step 2: Run the integration test and verify it fails**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: FAIL because `--site-content-max` and `--reading-content-max` are not emitted.

- [ ] **Step 3: Define and adopt the shared tokens**

Update the layout token block in `src/app/globals.css`:

```css
/* Layout */
--site-content-max: 1280px;
--reading-content-max: 720px;
--content-size: var(--reading-content-max);
--wide-size: var(--site-content-max);
--page-gutter: clamp(20px, 4.4vw, 64px);
```

Replace the homepage rail declarations in `src/app/page.module.css`:

```css
.intro,
.navigation {
  max-width: var(--site-content-max);
}
```

Keep those selectors' existing declarations in their original rule blocks; change only the `max-width` values. Replace the Work rail declaration in `src/app/case-studies/page.module.css`:

```css
.content {
  max-width: var(--site-content-max);
}
```

- [ ] **Step 4: Run the integration test and verify it passes**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: PASS, including existing homepage and Work assertions.

- [ ] **Step 5: Review and commit only the shared-rail changes**

Run:

```bash
git diff -- src/app/globals.css src/app/page.module.css src/app/case-studies/page.module.css src/app/case-studies/workPage.integration.test.ts
git diff --check
git add -p src/app/globals.css src/app/page.module.css src/app/case-studies/page.module.css src/app/case-studies/workPage.integration.test.ts
git commit -m "refactor: share the site content rail"
```

Expected: the commit contains only semantic-token adoption and its test; pre-existing unrelated hunks remain unstaged.

---

### Task 2: Replace the generic case-study chrome with a dedicated detail shell

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/case-studies/[slug]/page.tsx`
- Modify: `src/components/content/ArticlePage.module.css`
- Modify: `src/components/content/ArticleRenderer.tsx`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:**
- Consumes: `--site-content-max`, `--reading-content-max`, case-study frontmatter, and `ArticleRenderer`.
- Produces: `.case-study-page` root marker; `ArticleRendererProps.variant?: 'default' | 'case-study'`; local close link to `/case-studies`.

- [ ] **Step 1: Add a failing detail-shell integration test**

Append:

```ts
test('Swatch renders the new local case-study shell without legacy chrome', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()
  const css = await getEmittedCss(`${url}/swatch`)

  assert.equal(response.status, 200)
  assert.match(html, /class="[^"]*case-study-page[^"]*"/)
  assert.match(html, /href="\/case-studies"[^>]*aria-label="Close case study"/)
  assert.match(html, /Case study/)
  assert.match(html, /<h1[^>]*>Swatch<\/h1>/)
  assert.match(html, /2021-2022/)
  assert.match(html, /Design Systems/)
  assert.doesNotMatch(html, /№ 003 · CASE/)
  assert.doesNotMatch(html, /Case study system brief/)
  assert.doesNotMatch(html, /#design system/)
  assert.match(css, /body:has\(\.case-study-page\)\s*>\s*header[^}]*display:\s*none/)
  assert.match(css, /body:has\(\.case-study-page\)\s*>\s*footer[^}]*display:\s*none/)
})

test('Legacy singular case-study route redirects to the canonical detail route', async () => {
  const response = await fetch(`${baseUrl}/case-study/swatch`, { redirect: 'manual' })

  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), '/case-studies/swatch')
})
```

- [ ] **Step 2: Run the test and verify the new assertions fail**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: FAIL because the route still renders the corner badge, system brief, and global chrome.

- [ ] **Step 3: Add the opt-in renderer variant**

Update `ArticleRendererProps` in `src/components/content/ArticleRenderer.tsx`:

```ts
export interface ArticleRendererProps {
  content: string
  format: 'md' | 'mdx'
  variant?: 'default' | 'case-study'
}
```

Update the component signature and wrapper:

```tsx
export default async function ArticleRenderer({
  content,
  format,
  variant = 'default',
}: ArticleRendererProps) {
  return (
    <div className={styles.body} data-variant={variant}>
      {format === 'mdx' ? (
        await renderMdx(content)
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Render the local shell**

In `src/app/case-studies/[slug]/page.tsx`, remove `CornerBadge`, `Crosshair`, `CSSProperties`, `AccentStyle`, the `date-fns` `format` import, the formatted-date calculation, the accent-style calculation, and all legacy metadata/system-brief markup. Keep metadata generation unchanged. Render this structure:

```tsx
return (
  <article className={`${pageStyles.container} case-study-page`} data-kind="case-study">
    <div className={pageStyles.shell}>
      <header className={pageStyles.localHeader}>
        <span className={pageStyles.eyebrow}>Case study</span>
        <Link href="/case-studies" className={pageStyles.close} aria-label="Close case study">
          <span className={`material-symbols-outlined ${pageStyles.closeIcon}`} aria-hidden="true">
            close
          </span>
        </Link>
      </header>

      {caseStudy.featuredImage ? (
        <div className={pageStyles.featuredImage}>
          <Image
            src={caseStudy.featuredImage}
            alt=""
            width={1600}
            height={900}
            priority
            className={pageStyles.image}
            sizes="(min-width: 1400px) 1280px, calc(100vw - (2 * var(--page-gutter)))"
          />
        </div>
      ) : null}

      <div className={pageStyles.intro}>
        <p className={pageStyles.meta}>
          {[caseStudy.year, caseStudy.role].filter(Boolean).join(' · ')}
        </p>
        <h1 className={pageStyles.title}>{caseStudy.title}</h1>
        <p className={pageStyles.summary}>{caseStudy.summary}</p>
      </div>

      <ArticleRenderer
        content={caseStudy.content}
        format={caseStudy.format}
        variant="case-study"
      />
    </div>
  </article>
)
```

Add `Link` from `next/link`. Keep the original ISO date in `generateMetadata()` through `publishedTime`; do not render a formatted publication date in the new shell.

- [ ] **Step 5: Style the case-study shell and hide global chrome**

Add to `src/app/globals.css`:

```css
body:has(.case-study-page) {
  --color-base: #f7f5ef;
  --color-base-2: #f7f5ef;
  --color-surface: #f7f5ef;
  --color-contrast: #1c1c1b;
  --color-contrast-2: #66635c;
  --color-accent: #3158de;
  background-color: #f7f5ef;
  color-scheme: light;
}

body:has(.case-study-page) > header,
body:has(.case-study-page) > footer {
  display: none;
}
```

Replace the case-study shell rules in `ArticlePage.module.css` with focused styles that implement:

```css
.container {
  background: #f7f5ef;
  color: #1c1c1b;
  min-height: 100dvh;
  padding: 0 var(--page-gutter) var(--spacing-60);
}

.shell {
  margin: 0 auto;
  max-width: var(--site-content-max);
}

.localHeader {
  align-items: center;
  border-top: 1px solid currentColor;
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(32px, 5vw, 72px);
  padding-top: 24px;
}

.eyebrow,
.meta {
  color: #66635c;
  font-family: var(--font-family-pt-serif);
}

.close {
  align-items: center;
  color: currentColor;
  display: inline-flex;
  height: 48px;
  isolation: isolate;
  justify-content: center;
  position: relative;
  text-decoration: none;
  width: 48px;
}

.close::after {
  background: var(--interactive-surface-background);
  border: 1px solid var(--interactive-surface-outline);
  border-radius: var(--interactive-surface-radius);
  box-shadow: var(--interactive-surface-shadow);
  content: "";
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--interactive-surface-transition);
}

.closeIcon {
  font-size: 48px;
  font-weight: 200;
  position: relative;
  transition: transform var(--interactive-surface-transition);
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) {
  .close:hover::after {
    opacity: 1;
  }

  .close:hover .closeIcon {
    transform: scale(var(--interactive-surface-content-scale));
  }
}

.featuredImage,
.image {
  width: 100%;
}

.image {
  border: 0;
  border-radius: 4px;
  display: block;
  height: auto;
}

.intro {
  margin: clamp(40px, 6vw, 80px) auto clamp(64px, 8vw, 112px);
  max-width: var(--reading-content-max);
}

.title {
  font-family: var(--font-family-display);
  font-size: clamp(4rem, 8vw, 8.5rem);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.82;
  margin: 0;
}

.summary {
  font-family: var(--font-family-pt-serif);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  line-height: 1.4;
  margin-top: 24px;
}
```

Retain accessible focus styling for `.close`. Add mobile adjustments only where the desktop values would overflow; do not change the shared rail.

- [ ] **Step 6: Run the detail-shell and existing integration tests**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: PASS; Swatch no longer contains legacy detail chrome, and Home/Work tests remain green.

- [ ] **Step 7: Review and commit the shell**

Run:

```bash
git diff -- src/app/globals.css 'src/app/case-studies/[slug]/page.tsx' src/components/content/ArticlePage.module.css src/components/content/ArticleRenderer.tsx src/app/case-studies/workPage.integration.test.ts
git diff --check
git add -p src/app/globals.css 'src/app/case-studies/[slug]/page.tsx' src/components/content/ArticlePage.module.css src/components/content/ArticleRenderer.tsx src/app/case-studies/workPage.integration.test.ts
git commit -m "feat: redesign the case study detail shell"
```

Expected: only the shell, renderer variant, theme visibility, and tests are committed.

---

### Task 3: Express Swatch image/text arrangements with reusable MDX components

**Files:**
- Create: `src/components/content/CaseStudyLayouts.tsx`
- Create: `src/components/content/CaseStudyLayouts.module.css`
- Modify: `src/components/content/ArticleRenderer.tsx`
- Modify: `src/components/content/ArticleBody.module.css`
- Rename: `src/content/case-studies/swatch.md` to `src/content/case-studies/swatch.mdx`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:**
- Consumes: case-study renderer variant and MDX component map.
- Produces:
  - `CaseStudyPictogramRow(props: { src: string; alt?: string; title: string; children: ReactNode }): JSX.Element`
  - `CaseStudySectionLead(props: { src: string; alt?: string; title: string; children: ReactNode }): JSX.Element`
  - `CaseStudyMedia(props: { src: string; alt: string; caption?: string }): JSX.Element`

- [ ] **Step 1: Add failing MDX-layout integration assertions**

Append:

```ts
test('Swatch renders explicit responsive pictogram, section-lead, and media layouts', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()
  const css = await getEmittedCss(`${url}/swatch`)
  const mediaClass = html.match(
    /data-case-study-layout="media"[\s\S]*?<img class="([^"]+)"/,
  )?.[1]

  assert.equal(response.status, 200)
  assert.equal((html.match(/data-case-study-layout="pictogram-row"/g) ?? []).length, 3)
  assert.equal((html.match(/data-case-study-layout="section-lead"/g) ?? []).length, 3)
  assert.ok((html.match(/data-case-study-layout="media"/g) ?? []).length >= 6)
  assert.match(html, /data-case-study-layout="pictogram-row"[\s\S]*Flexibility/)
  assert.match(html, /data-case-study-layout="pictogram-row"[\s\S]*Scalability/)
  assert.match(html, /data-case-study-layout="pictogram-row"[\s\S]*Promote contribution/)
  assert.match(html, /data-case-study-layout="section-lead"[\s\S]*Token architecture/)
  assert.match(html, /data-case-study-layout="section-lead"[\s\S]*Component Library/)
  assert.match(html, /data-case-study-layout="section-lead"[\s\S]*Governance/)
  assert.match(css, /grid-template-columns:\s*96px\s+minmax\(0,\s*1fr\)/)
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*grid-template-columns:\s*1fr/)
  assert.ok(mediaClass)
  assert.match(css, new RegExp(`\\.${mediaClass}\\s*\\{[^}]*border:\\s*0`))
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: FAIL because the semantic MDX components and layout attributes do not exist.

- [ ] **Step 3: Create the typed layout primitives**

Create `src/components/content/CaseStudyLayouts.tsx`:

```tsx
import type { ReactNode } from 'react'
import styles from './CaseStudyLayouts.module.css'

type IllustratedContentProps = {
  src: string
  alt?: string
  title: string
  children: ReactNode
}

export function CaseStudyPictogramRow({
  src,
  alt = '',
  title,
  children,
}: IllustratedContentProps) {
  return (
    <section className={styles.pictogramRow} data-case-study-layout="pictogram-row">
      <img className={styles.pictogram} src={src} alt={alt} loading="lazy" />
      <div className={styles.pictogramCopy}>
        <h3>{title}</h3>
        {children}
      </div>
    </section>
  )
}

export function CaseStudySectionLead({
  src,
  alt = '',
  title,
  children,
}: IllustratedContentProps) {
  return (
    <section className={styles.sectionLead} data-case-study-layout="section-lead">
      <img className={styles.sectionIcon} src={src} alt={alt} loading="lazy" />
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

export function CaseStudyMedia({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  return (
    <figure className={styles.mediaFigure} data-case-study-layout="media">
      <img className={styles.media} src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
```

- [ ] **Step 4: Implement responsive component styles**

Create `src/components/content/CaseStudyLayouts.module.css`:

```css
.pictogramRow,
.sectionLead {
  margin-inline: auto;
  max-width: var(--reading-content-max);
}

.pictogramRow {
  align-items: start;
  display: grid;
  gap: clamp(32px, 5vw, 72px);
  grid-template-columns: 96px minmax(0, 1fr);
  margin-block: clamp(48px, 7vw, 88px);
}

.pictogram,
.sectionIcon {
  display: block;
  height: auto;
  object-fit: contain;
}

.pictogram {
  width: 96px;
}

.pictogramCopy h3,
.sectionLead h3 {
  font-family: var(--font-family-display);
  font-size: clamp(1.75rem, 3vw, 2.75rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1;
  margin: 0 0 16px;
}

.pictogramCopy p,
.sectionLead p {
  margin-bottom: 20px;
}

.sectionLead {
  margin-block: clamp(64px, 9vw, 120px) clamp(40px, 6vw, 72px);
}

.sectionIcon {
  margin-bottom: 24px;
  max-width: 160px;
  width: clamp(112px, 15vw, 160px);
}

.mediaFigure {
  margin: clamp(48px, 7vw, 96px) 0;
  width: 100%;
}

.media {
  border: 0;
  border-radius: 4px;
  display: block;
  height: auto;
  width: 100%;
}

.caption {
  color: #66635c;
  font-family: var(--font-family-pt-serif);
  font-size: 1rem;
  font-style: italic;
  line-height: 1.4;
  margin: 12px auto 0;
  max-width: var(--reading-content-max);
  text-transform: none;
}

@media (max-width: 767px) {
  .pictogramRow {
    gap: 24px;
    grid-template-columns: 1fr;
  }

  .pictogram {
    width: 88px;
  }

  .sectionIcon {
    width: 112px;
  }
}
```

- [ ] **Step 5: Register the primitives in the MDX component map**

Import all three exports into `ArticleRenderer.tsx` and extend `mdxComponents`:

```tsx
import {
  CaseStudyMedia,
  CaseStudyPictogramRow,
  CaseStudySectionLead,
} from './CaseStudyLayouts'

const mdxComponents = {
  ...markdownComponents,
  Figure,
  Video,
  Callout,
  CaseStudyMedia,
  CaseStudyPictogramRow,
  CaseStudySectionLead,
}
```

- [ ] **Step 6: Scope the editorial reading rail to the case-study variant**

In `ArticleBody.module.css`, retain all default selectors for blog compatibility. Add case-study-only layout rules:

```css
.body[data-variant='case-study'] {
  font-size: clamp(1.125rem, 1.6vw, 1.375rem);
  line-height: 1.55;
}

.body[data-variant='case-study'] > :global(p),
.body[data-variant='case-study'] > :global(h2),
.body[data-variant='case-study'] > :global(h3),
.body[data-variant='case-study'] > :global(h4),
.body[data-variant='case-study'] > :global(ul),
.body[data-variant='case-study'] > :global(ol),
.body[data-variant='case-study'] > :global(blockquote) {
  margin-left: auto;
  margin-right: auto;
  max-width: var(--reading-content-max);
}

.body[data-variant='case-study'] > :global(h2) {
  font-size: clamp(2.75rem, 5vw, 5rem);
  font-weight: 400;
  line-height: 0.95;
  margin-top: clamp(96px, 12vw, 168px);
}
```

Remove the case-study need for the generic negative-margin `.figure` breakout. Do not change the default `.figure`, `.media`, or caption behavior used by Markdown/blog posts.

- [ ] **Step 7: Rename Swatch to MDX and declare explicit layouts**

Rename `src/content/case-studies/swatch.md` to `src/content/case-studies/swatch.mdx`, preserving the frontmatter and narrative wording. Replace the three problem blocks with:

```mdx
<CaseStudyPictogramRow
  src="/images/case-studies/swatch/002-flexibility.jpg"
  alt=""
  title="Flexibility"
>
  <p>Make SWATCH a breathing system that gives designers and developers flexibility to experiment but not at the cost of usability.</p>
</CaseStudyPictogramRow>

<CaseStudyPictogramRow
  src="/images/case-studies/swatch/002-scalability.jpg"
  alt=""
  title="Scalability"
>
  <p>Enable teams to build for newer business verticals easily and ensure consistency across the portfolio.</p>
</CaseStudyPictogramRow>

<CaseStudyPictogramRow
  src="/images/case-studies/swatch/002-promote-contribution.jpg"
  alt=""
  title="Promote contribution"
>
  <p>By putting the right protocols in place, encourage others to contribute towards the design system.</p>
</CaseStudyPictogramRow>
```

Replace the three section icon/intro blocks with `CaseStudySectionLead`. Example for Token architecture:

```mdx
<CaseStudySectionLead
  src="/images/case-studies/swatch/003-token-architecture.png"
  alt=""
  title="Token architecture"
>
  <p>We followed global industry standards in defining our token architecture, and created a structure that can be consumed easily by designers as well as developers. This meant coming up with correct naming conventions, and defining guidelines towards usage of tokens.</p>
  <p>Why was this important? Glad you asked.</p>
  <p>Theming.</p>
  <p>Having abstraction layers allowed for theming that was relevant for any given business.</p>
</CaseStudySectionLead>
```

Use these exact blocks for Component Library and Governance:

```mdx
<CaseStudySectionLead
  src="/images/case-studies/swatch/003-component-library.png"
  alt=""
  title="Component Library"
>
  <p>Component library became a shared asset collection between designers and developers. The developed version of the library was hosted on Storybook. In most cases, we made sure that there was parity in component naming and properties between Figma and code.</p>
</CaseStudySectionLead>

<CaseStudySectionLead
  src="/images/case-studies/swatch/003-governance.png"
  alt=""
  title="Governance"
>
  <p>What started off as a pet project quickly became one of the most discussed projects in the org. Designers and developers became excited to leverage the design system due to the promise of time saved and consistency it could bring not just to the UI but also to their workflows. However, just like handing over the best ingredients doesn't make one a great cook, we needed to create governance protocols to ensure the audience used the design system as intended and also helped in growing it.</p>
</CaseStudySectionLead>
```

Replace every remaining Markdown image with these explicit media blocks at the same narrative positions:

```mdx
<CaseStudyMedia
  src="/images/case-studies/swatch/001-guidelines.png"
  alt="Life before SWATCH"
  caption="Life before SWATCH"
/>

<CaseStudyMedia
  src="/images/case-studies/swatch/005-theming-tokens-scaled.jpg"
  alt="Theming tokens"
/>

<CaseStudyMedia
  src="/images/case-studies/swatch/006-token-architecture-output.jpg"
  alt="Token architecture output"
/>

<CaseStudyMedia
  src="/images/case-studies/swatch/007-component-library.jpg"
  alt="Component library"
/>

<CaseStudyMedia
  src="/images/case-studies/swatch/008-contribution-model.jpg"
  alt="Contribution model"
/>

<CaseStudyMedia
  src="/images/case-studies/swatch/009-other-activities-governance.png"
  alt="Other governance activities"
/>
```

Remove the standalone italic caption paragraph after `001-guidelines.png` because `CaseStudyMedia` owns the caption. Keep every heading and paragraph not shown in these replacement blocks in its existing order and wording.

- [ ] **Step 8: Run the MDX-layout and existing integration tests**

Run:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
```

Expected: PASS; the output contains exactly three pictogram rows, exactly three section leads, at least six editorial media blocks, and the legacy redirect still resolves.

- [ ] **Step 9: Run type and production compilation checks**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: both commands exit 0; MDX compilation reports no missing component or prop errors.

- [ ] **Step 10: Review and commit the content-layout system**

Run:

```bash
git diff -- src/components/content/CaseStudyLayouts.tsx src/components/content/CaseStudyLayouts.module.css src/components/content/ArticleRenderer.tsx src/components/content/ArticleBody.module.css src/content/case-studies/swatch.md src/content/case-studies/swatch.mdx src/app/case-studies/workPage.integration.test.ts
git diff --check
git add -p src/components/content/CaseStudyLayouts.tsx src/components/content/CaseStudyLayouts.module.css src/components/content/ArticleRenderer.tsx src/components/content/ArticleBody.module.css src/content/case-studies/swatch.md src/content/case-studies/swatch.mdx src/app/case-studies/workPage.integration.test.ts
git commit -m "feat: add semantic case study media layouts"
```

Expected: the commit contains the reusable components, scoped styles, MDX registration, Swatch content migration, and tests only.

---

### Task 4: Verify the full experience and pass Product Design QA

**Files:**
- Modify: `src/components/content/ArticlePage.module.css` to apply measured shell corrections from QA.
- Modify: `src/components/content/ArticleBody.module.css` to apply measured reading-rhythm corrections from QA.
- Modify: `src/components/content/CaseStudyLayouts.module.css` to apply measured arrangement corrections from QA.
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: completed case-study shell and MDX layout system.
- Produces: verified desktop/mobile page and a passing Product Design QA report.

- [ ] **Step 1: Run the complete automated verification suite**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit 0. If `next lint` reports the known Next.js deprecation notice, the command must still exit 0 and contain no lint errors.

- [ ] **Step 2: Open the implementation in the user's in-app browser**

Navigate to:

```text
http://127.0.0.1:4173/case-studies/swatch
```

If the existing preview process is unavailable, start the repository's development server with `npm run dev -- --hostname 127.0.0.1 --port 4173` and wait for a 200 response before continuing.

- [ ] **Step 3: Compare desktop states against the captured reference**

At `1280 × 720`, capture equivalent top, problem-pictogram, foundation, governance, and conclusion states from both:

```text
Reference: https://jaynishshah.com/case-study/swatch/
Local:     http://127.0.0.1:4173/case-studies/swatch
```

Use combined side-by-side comparisons. Verify:

- local shell aligns with homepage/Work rail edges
- reading copy stays on the `720px` rail
- hero and editorial media never exceed the `1280px` rail
- all three problem rows pair image and text
- section icons sit above their headings
- no image is cropped, stretched, bordered, or unintentionally enlarged
- `4px` media corners are consistent
- no horizontal overflow exists

- [ ] **Step 4: Compare mobile states against the captured reference**

At `390 × 844`, capture equivalent states and verify:

- page gutter alignment matches the responsive site gutter
- pictogram rows stack image first, then heading and copy
- section icons remain above their headings
- title, copy, captions, and images do not overflow
- close control remains visible, focusable, and at least `48px` square

Reset the in-app browser viewport capability after the mobile comparison.

- [ ] **Step 5: Fix only measured visual mismatches and rerun focused checks**

For each mismatch, adjust the narrowest relevant CSS rule in `ArticlePage.module.css`, `ArticleBody.module.css`, or `CaseStudyLayouts.module.css`. After every adjustment:

```bash
node --no-warnings --experimental-strip-types --test src/app/case-studies/workPage.integration.test.ts
npx tsc --noEmit
```

Expected: both commands pass. Re-capture the affected desktop and mobile states and compare them again before moving on.

- [ ] **Step 6: Run the Product Design visual QA gate**

Read and follow the Product Design `design-qa` skill referenced by the URL-to-code workflow. Provide the reference and local comparison captures in the same QA input. Update `design-qa.md` with the final evidence and a passing result only after every blocking issue is resolved.

Expected: `design-qa.md` records a final `passed` result with no unresolved blocking visual issue.

- [ ] **Step 7: Run final verification after QA fixes**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Expected: all commands exit 0 and `git diff --check` prints no output.

- [ ] **Step 8: Commit the verified visual polish and QA record**

Run:

```bash
git diff -- src/components/content/ArticlePage.module.css src/components/content/ArticleBody.module.css src/components/content/CaseStudyLayouts.module.css design-qa.md
git add -p src/components/content/ArticlePage.module.css src/components/content/ArticleBody.module.css src/components/content/CaseStudyLayouts.module.css design-qa.md
git commit -m "fix: align the Swatch case study layout"
```

Expected: the final commit contains only measured polish changes and the completed QA record.

- [ ] **Step 9: Confirm the working tree state without disturbing user files**

Run:

```bash
git status --short
git log -4 --oneline
```

Expected: any remaining changes are pre-existing user-owned files intentionally left outside this implementation; the new implementation commits are visible in the log.
