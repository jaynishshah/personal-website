# Portfolio Route Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an accessible, bidirectional Home ↔ Work transition whose timing, motion, focus, and compact rail surfaces are controlled by semantic tokens and tuneable locally with DialKit.

**Architecture:** A reusable client `RouteTransitionLink` reads CSS route tokens and owns the `to-work`/`to-home` lifecycle. It uses browser View Transitions where available and falls back to direction-specific CSS transforms. Work rail markup separates row spacing from inner-label feedback surfaces; only the inner label has a hover overlay.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, CSS Modules, CSS custom properties, View Transitions API, Node test runner, DialKit development dependency.

**Spec:** `docs/superpowers/specs/2026-09-09-portfolio-route-motion-design.md`

## Global Constraints

- Preserve `KineticQuote` and its wheel/touch behavior.
- The current Work item is `aria-current="page"` status, never a self-link.
- Hover is opacity-only and fine-pointer-only. The visible surface must fit the label, not the left-rail row.
- Keyboard focus stays visible with `--action-focus-color`; the Work rail must not use a blue accent outline.
- Browser View Transitions are additive; CSS fallback supports both directions and reduced motion.
- CSS is the source of truth for duration; JavaScript reads `--motion-route-duration` rather than owning a timeout constant.
- DialKit is enabled only when `NODE_ENV === 'development'` and `NEXT_PUBLIC_ENABLE_MOTION_TUNER === 'true'`.
- Do not reset, discard, stage, or commit unrelated dirty worktree changes.

## File map

- Modify `src/app/globals.css`: semantic route/entry/feedback/action/focus tokens and View Transition rules.
- Modify `src/app/page.tsx`, `src/app/page.module.css`: Home markers and tokenised `to-work` fallback.
- Modify `src/app/case-studies/page.tsx`, `src/app/case-studies/page.module.css`: status item, label wrappers, tokenised `to-home` fallback.
- Create `src/lib/motion/routeTransition.ts` and `.test.ts`: pure duration/lifecycle functions.
- Create `src/components/navigation/RouteTransitionLink.tsx`; delete `src/components/home/WorkNavigationLink.tsx` after wiring.
- Create `src/components/motion/MotionTuner.tsx`, `MotionTunerGate.tsx`, and `MotionTuner.test.ts`; modify `src/app/layout.tsx`.
- Modify `src/app/case-studies/workPage.integration.test.ts`, `package.json`, `package-lock.json`, and `tsconfig.json`.

---

### Task 1: Correct Work rail semantics and compact hover targets

**Files:**
- Modify: `src/app/case-studies/page.tsx`
- Modify: `src/app/case-studies/page.module.css`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:** Produces `styles.railActionLabel`; consumes existing rail text, link destinations, and interactive-surface tokens.

- [ ] **Step 1: Add failing server and CSS assertions**

```ts
test('Work rail has a status item and text-width action surfaces', async () => {
  const [response, styles] = await Promise.all([
    fetch(url),
    readFile(path.join(process.cwd(), 'src', 'app', 'case-studies', 'page.module.css'), 'utf8'),
  ])
  const html = await response.text()

  assert.match(html, /<span[^>]*aria-current="page"[^>]*>\s*<span[^>]*>Work<\/span>/)
  assert.doesNotMatch(html, /<a[^>]*href="\/case-studies"[^>]*>\s*<span[^>]*>Work<\/span>/)
  assert.match(html, /<a[^>]*href="\/blog"[^>]*>\s*<span[^>]*>Writing<\/span>/)
  assert.match(styles, /\.railActionLabel::after/)
  assert.match(styles, /inset:\s*var\(--action-surface-inset-block\)\s+var\(--action-surface-inset-inline\)/)
  assert.match(styles, /\.sectionNavigation a:hover \.railActionLabel::after/)
})
```

- [ ] **Step 2: Run it in red**

Run: `npm test`  
Expected: FAIL because Work is a link and the pseudo-element belongs to the padded link row.

- [ ] **Step 3: Replace the current Work link with status markup**

Use this exact structure in `src/app/case-studies/page.tsx`:

```tsx
<nav className={styles.sectionNavigation} aria-label="Portfolio sections">
  <span className={styles.activeSection} aria-current="page" data-motion-shared="nav-work">
    <span className={styles.railActionLabel}>Work</span>
  </span>
  <Link href="/blog" data-motion-shared="nav-writing"><span className={styles.railActionLabel}>Writing</span></Link>
  <Link href="/about" data-motion-shared="nav-about"><span className={styles.railActionLabel}>About</span></Link>
</nav>
```

Wrap the identity text in `<span className={styles.railActionLabel}>Hi. I’m Jaynish.</span>`. Do not add a pointer action to the Work status.

- [ ] **Step 4: Apply label-only surface CSS**

Keep the existing `padding-block: 16px` on `.sectionNavigation a`; it controls row rhythm, not surface size. Remove `.sectionNavigation a::after` and replace it with:

```css
.railActionLabel {
  display: inline-flex;
  isolation: isolate;
  position: relative;
  width: fit-content;
}

.railActionLabel::after {
  background: var(--interactive-surface-background);
  border: 1px solid var(--interactive-surface-outline);
  border-radius: var(--interactive-surface-radius);
  box-shadow: var(--interactive-surface-shadow);
  content: "";
  inset: var(--action-surface-inset-block) var(--action-surface-inset-inline);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--motion-feedback-duration) var(--motion-feedback-ease);
  z-index: -1;
}

@media (hover: hover) and (pointer: fine) {
  .close:hover .railActionLabel::after,
  .sectionNavigation a:hover .railActionLabel::after { opacity: 1; }
}
```

Set `.activeSection` to the Work accent and give actual rail links `:focus-visible { outline-color: var(--action-focus-color); }`.

- [ ] **Step 5: Verify and review**

Run: `npm test && git diff --check`  
Expected: PASS. Browser check: Writing/About surfaces match the compact close-label height; Work is non-clickable; keyboard outline is foreground-coloured.

---

### Task 2: Add semantic motion tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/case-studies/page.module.css`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:** Produces semantic values consumed by Tasks 3–6. Existing `--motion-shared-layout`, `--motion-content-enter`, and `--motion-fast` remain compatibility aliases during migration.

- [ ] **Step 1: Add the failing token contract**

```ts
test('global tokens separate route, entry, feedback, surface, and focus motion', async () => {
  const css = await readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')
  for (const token of [
    '--motion-route-duration', '--motion-route-ease', '--motion-enter-duration',
    '--motion-enter-ease', '--motion-enter-offset-block', '--motion-enter-offset-inline',
    '--motion-feedback-duration', '--motion-feedback-ease', '--action-surface-inset-inline',
    '--action-surface-inset-block', '--action-focus-color',
  ]) assert.match(css, new RegExp(`${token}:`))
  assert.match(css, /--motion-shared-layout:\s*var\(--motion-route-duration\)\s+var\(--motion-route-ease\)/)
})
```

- [ ] **Step 2: Run it in red**

Run: `npm test`  
Expected: FAIL because the semantic tokens do not exist.

- [ ] **Step 3: Define values and aliases in `src/app/globals.css`**

```css
--motion-route-duration: 260ms;
--motion-route-ease: cubic-bezier(0.77, 0, 0.175, 1);
--motion-enter-duration: 240ms;
--motion-enter-ease: cubic-bezier(0.33, 1, 0.68, 1);
--motion-enter-offset-block: 10px;
--motion-enter-offset-inline: 7%;
--motion-feedback-duration: 160ms;
--motion-feedback-ease: ease;
--action-surface-inset-inline: -10px;
--action-surface-inset-block: -8px;
--action-focus-color: var(--color-contrast);
--motion-shared-layout: var(--motion-route-duration) var(--motion-route-ease);
--motion-content-enter: var(--motion-enter-duration) var(--motion-enter-ease);
--motion-fast: var(--motion-feedback-duration) var(--motion-feedback-ease);
```

Change `[data-ui-action]:focus-visible` to use `outline-color: var(--action-focus-color)`. In Work CSS, replace literal `7%` and `10px` entry transforms with their new offset tokens.

- [ ] **Step 4: Verify green**

Run: `npm test && git diff --check`  
Expected: PASS with unchanged 260ms route and 240ms entry defaults.

---

### Task 3: Build the direction-aware transition utility

**Files:**
- Create: `src/lib/motion/routeTransition.ts`
- Create: `src/lib/motion/routeTransition.test.ts`
- Modify: `package.json`

**Interfaces:** Exports `RouteTransitionDirection`, `isUnmodifiedPrimaryClick`, `readMotionDurationMs`, and `runRouteTransition`.

- [ ] **Step 1: Add failing pure-unit tests**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { isUnmodifiedPrimaryClick, readMotionDurationMs, runRouteTransition } from './routeTransition.ts'

test('route duration parses CSS milliseconds and seconds', () => {
  assert.equal(readMotionDurationMs('260ms'), 260)
  assert.equal(readMotionDurationMs('0.24s'), 240)
  assert.equal(readMotionDurationMs('invalid'), 0)
})

test('fallback transition clears its direction after navigation and cancellation', async () => {
  const dataset: Record<string, string | undefined> = {}
  const complete = runRouteTransition({ direction: 'to-home', durationMs: 0, root: { dataset } as HTMLElement, navigate: () => {} })
  await complete.finished
  assert.equal(dataset.pageTransition, undefined)
  const cancelled = runRouteTransition({ direction: 'to-work', durationMs: 50, root: { dataset } as HTMLElement, navigate: () => assert.fail() })
  cancelled.cancel()
  await cancelled.finished
  assert.equal(dataset.pageTransition, undefined)
})

test('modified and keyboard activations remain native', () => {
  assert.equal(isUnmodifiedPrimaryClick({ button: 0, detail: 1 }), true)
  assert.equal(isUnmodifiedPrimaryClick({ button: 0, detail: 0 }), false)
  assert.equal(isUnmodifiedPrimaryClick({ button: 0, detail: 1, metaKey: true }), false)
})
```

- [ ] **Step 2: Register and run the test in red**

Set `package.json` test script to include `src/lib/motion/routeTransition.test.ts`, then run: `npm test`  
Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Implement the pure lifecycle**

```ts
export type RouteTransitionDirection = 'to-work' | 'to-home'

export function readMotionDurationMs(value: string): number {
  const match = value.trim().match(/^(\d*\.?\d+)(ms|s)$/)
  if (!match) return 0
  return Number(match[1]) * (match[2] === 's' ? 1000 : 1)
}

export function isUnmodifiedPrimaryClick(event: { button?: number; detail?: number; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) {
  return event.button === 0 && event.detail !== 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}

export function runRouteTransition({ direction, durationMs, root, navigate }: { direction: RouteTransitionDirection; durationMs: number; root: HTMLElement; navigate: () => void }) {
  let resolveFinished!: () => void
  let cancelled = false
  const finished = new Promise<void>((resolve) => { resolveFinished = resolve })
  root.dataset.pageTransition = direction
  const timer = setTimeout(() => {
    if (!cancelled) navigate()
    delete root.dataset.pageTransition
    resolveFinished()
  }, durationMs)
  return { finished, cancel: () => { cancelled = true; clearTimeout(timer); delete root.dataset.pageTransition; resolveFinished() } }
}
```

- [ ] **Step 4: Verify green**

Run: `npm test`  
Expected: PASS. The helper contains no route paths or page-specific transforms.

---

### Task 4: Wire both directions through the CSS fallback

**Files:**
- Create: `src/components/navigation/RouteTransitionLink.tsx`
- Delete: `src/components/home/WorkNavigationLink.tsx`
- Modify: `src/app/page.tsx`, `src/app/page.module.css`
- Modify: `src/app/case-studies/page.tsx`, `src/app/case-studies/page.module.css`
- Test: `src/app/case-studies/workPage.integration.test.ts`

**Interfaces:** Consumes the Task 3 helper and `--motion-route-duration`; produces `data-route-transition-direction`, `data-motion-shared`, and both fallback datasets.

- [ ] **Step 1: Add failing directional marker tests**

```ts
test('Home and Work expose matching route-motion markers in both directions', async () => {
  const [homeResponse, workResponse] = await Promise.all([fetch(baseUrl), fetch(url)])
  const [homeHtml, workHtml] = await Promise.all([homeResponse.text(), workResponse.text()])
  for (const marker of ['identity', 'nav-work', 'nav-writing', 'nav-about']) {
    assert.match(homeHtml, new RegExp(`data-motion-shared="${marker}"`))
    assert.match(workHtml, new RegExp(`data-motion-shared="${marker}"`))
  }
  assert.match(workHtml, /data-route-transition-direction="to-home"/)
})

test('fallback CSS includes the reverse Work to Home handoff', async () => {
  const css = await readFile(path.join(process.cwd(), 'src', 'app', 'case-studies', 'page.module.css'), 'utf8')
  assert.match(css, /data-page-transition='to-home'/)
})
```

- [ ] **Step 2: Run in red**

Run: `npm test`  
Expected: FAIL because the existing component only sets `to-work`.

- [ ] **Step 3: Create and wire `RouteTransitionLink`**

Create this client component:

```tsx
'use client'

import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isUnmodifiedPrimaryClick, readMotionDurationMs, runRouteTransition, type RouteTransitionDirection } from '@/lib/motion/routeTransition'

export default function RouteTransitionLink({ children, className, direction, href, ...props }: {
  children: ReactNode
  className?: string
  direction: RouteTransitionDirection
  href: string
} & Omit<ComponentProps<typeof Link>, 'children' | 'className' | 'href' | 'onClick'>) {
  const router = useRouter()
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || !isUnmodifiedPrimaryClick(event)) return
    event.preventDefault()
    const root = document.documentElement
    runRouteTransition({
      direction,
      root,
      durationMs: readMotionDurationMs(getComputedStyle(root).getPropertyValue('--motion-route-duration')),
      navigate: () => router.push(href),
    })
  }
  return <Link {...props} href={href} className={className} data-route-transition-direction={direction} onClick={onClick}>{children}</Link>
}
```

Use it for the Home Work link with `direction="to-work"` and the Work identity link with `direction="to-home"`. Delete `WorkNavigationLink.tsx` only after no imports remain.

- [ ] **Step 4: Add marker attributes and reverse CSS**

Apply these attributes:

```tsx
// Home identity and rows
data-motion-shared="identity"
data-motion-shared="nav-work"
data-motion-shared="nav-writing"
data-motion-shared="nav-about"
```

Use the same values in Work markup, including the non-link Work status. In Work CSS add `html[data-page-transition='to-home']` rules for the identity and three rail items. Use only `opacity` and `transform`, `--motion-shared-layout` for shared elements, and entry tokens for outgoing content/Contents. In Home CSS retain `to-work`, but remove any duration/easing literals in favor of Task 2 tokens.

- [ ] **Step 5: Verify green and fallback behavior**

Run: `npm test && git diff --check`  
Expected: PASS. Manually verify Home → Work and identity → Home, then Cmd/Ctrl-click, middle-click, Shift-click, Enter, Back, and Forward all preserve native browser behavior. In reduced motion, both directions use opacity without spatial travel.

---

### Task 5: Make browser View Transitions the geometry-aware primary path

**Files:**
- Modify: `src/lib/motion/routeTransition.ts`, `src/lib/motion/routeTransition.test.ts`
- Modify: `src/components/navigation/RouteTransitionLink.tsx`
- Modify: `src/app/globals.css`, `src/app/page.module.css`, `src/app/case-studies/page.module.css`

**Interfaces:** Consumes `data-motion-shared` and Task 2 tokens; produces `view-transition-name` mappings and a guarded primary path without removing the fallback.

- [ ] **Step 1: Add a failing adapter test**

```ts
test('route transition uses the View Transition adapter when provided', async () => {
  const calls: string[] = []
  const result = runRouteTransition({
    direction: 'to-work', durationMs: 260, root: { dataset: {} } as HTMLElement,
    navigate: () => calls.push('navigate'),
    viewTransitions: { startViewTransition(callback) { calls.push('start'); callback(); return { finished: Promise.resolve() } } },
  })
  await result.finished
  assert.deepEqual(calls, ['start', 'navigate'])
})
```

- [ ] **Step 2: Run in red**

Run: `npm test`  
Expected: FAIL because `runRouteTransition` has no `viewTransitions` adapter.

- [ ] **Step 3: Extend the helper without changing fallback behavior**

Add this structural type and optional function input:

```ts
type ViewTransitionAdapter = {
  startViewTransition(callback: () => void): { finished: Promise<void>
  }
}
```

When the adapter exists and reduced motion is false, call `startViewTransition(navigate)`, return its `finished` promise, and do not write `data-page-transition`. Otherwise call the unchanged CSS fallback. In `RouteTransitionLink`, pass the adapter only when `'startViewTransition' in document`.

- [ ] **Step 4: Map shared elements globally**

Add these selectors to `src/app/globals.css`:

```css
[data-motion-shared='identity'] { view-transition-name: portfolio-identity; }
[data-motion-shared='nav-work'] { view-transition-name: portfolio-nav-work; }
[data-motion-shared='nav-writing'] { view-transition-name: portfolio-nav-writing; }
[data-motion-shared='nav-about'] { view-transition-name: portfolio-nav-about; }
[data-transition-role='work-content'] { view-transition-name: portfolio-work-title; }
[data-transition-role='contents'] { view-transition-name: portfolio-work-contents; }
```

Set the old/new identity and nav pseudo-elements to `animation-duration: var(--motion-route-duration)` and `animation-timing-function: var(--motion-route-ease)`. Set Work title and Contents old/new pseudo-elements to entry duration/ease. In `prefers-reduced-motion`, set named View Transition animation duration to `1ms`.

- [ ] **Step 5: Verify both implementations**

Run: `npm test && npm run dev`  
Expected: PASS. In Chromium, alter a label width in DevTools and confirm the shared geometry follows it without editing offsets. Temporarily disable `document.startViewTransition` and repeat the Task 4 fallback checks.

---

### Task 6: Add the development-only DialKit tuner

**Files:**
- Modify: `tsconfig.json`, `package.json`, `package-lock.json`, `src/app/layout.tsx`
- Create: `src/components/motion/MotionTuner.tsx`, `src/components/motion/MotionTunerGate.tsx`, `src/components/motion/MotionTuner.test.ts`

**Interfaces:** Consumes Task 2 variables and Task 4 direction datasets; produces local CSS variable overrides, replay actions, and persisted local presets only.

- [ ] **Step 1: Write the production-gate test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldEnableMotionTuner } from './MotionTunerGate.tsx'

test('MotionTuner is explicit-development-only', () => {
  assert.equal(shouldEnableMotionTuner('development', 'true'), true)
  assert.equal(shouldEnableMotionTuner('development', undefined), false)
  assert.equal(shouldEnableMotionTuner('production', 'true'), false)
})
```

- [ ] **Step 2: Register the test and run in red**

Add `src/components/motion/MotionTuner.test.ts` to the package test command, then run: `npm test`  
Expected: FAIL because the gate does not exist.

- [ ] **Step 3: Build and install DialKit as a development dependency**

First add `"dialkit"` to `tsconfig.json` `exclude`, then run:

```bash
npm --prefix dialkit run build
npm install --save-dev ./dialkit motion
```

Expected: root dependencies record both packages under `devDependencies`; the local checkout is not included by Next typechecking.

- [ ] **Step 4: Implement the gate and mount it once**

```tsx
import dynamic from 'next/dynamic'

export function shouldEnableMotionTuner(nodeEnv: string | undefined, enabled: string | undefined) {
  return nodeEnv === 'development' && enabled === 'true'
}

const MotionTuner = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('./MotionTuner'), { ssr: false })
  : null

export default function MotionTunerGate() {
  if (!MotionTuner || !shouldEnableMotionTuner(process.env.NODE_ENV, process.env.NEXT_PUBLIC_ENABLE_MOTION_TUNER)) return null
  return <MotionTuner />
}
```

Mount `<MotionTunerGate />` after `{children}` in `src/app/layout.tsx`; never mount it from a page.

- [ ] **Step 5: Implement token controls and replay**

Use this client-component shape in `MotionTuner.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { DialRoot, useDialKitController } from 'dialkit'
import 'dialkit/styles.css'
import { readMotionDurationMs } from '@/lib/motion/routeTransition'

export default function MotionTuner() {
  const dial = useDialKitController('Portfolio route motion', {
    route: { type: 'easing', duration: 0.26, ease: [0.77, 0, 0.175, 1] },
    enter: {
      transition: { type: 'easing', duration: 0.24, ease: [0.33, 1, 0.68, 1] },
      blockOffset: [10, 0, 32, 1],
      inlineOffset: [7, 0, 16, 1],
    },
    surface: { inlineInset: [-10, -20, 0, 1], blockInset: [-8, -16, 0, 1] },
    replay: { type: 'action' },
  }, {
    id: 'portfolio-route-motion',
    persist: true,
    onAction: () => {
      const root = document.documentElement
      root.dataset.pageTransition = window.location.pathname === '/case-studies' ? 'to-home' : 'to-work'
      window.setTimeout(() => { delete root.dataset.pageTransition }, readMotionDurationMs(getComputedStyle(root).getPropertyValue('--motion-route-duration')))
    },
  })

  useEffect(() => {
    const root = document.documentElement
    const { route, enter, surface } = dial.values
    root.style.setProperty('--motion-route-duration', `${route.duration}s`)
    root.style.setProperty('--motion-route-ease', `cubic-bezier(${route.ease.join(', ')})`)
    root.style.setProperty('--motion-enter-duration', `${enter.transition.duration}s`)
    root.style.setProperty('--motion-enter-ease', `cubic-bezier(${enter.transition.ease.join(', ')})`)
    root.style.setProperty('--motion-enter-offset-block', `${enter.blockOffset}px`)
    root.style.setProperty('--motion-enter-offset-inline', `${enter.inlineOffset}%`)
    root.style.setProperty('--action-surface-inset-inline', `${surface.inlineInset}px`)
    root.style.setProperty('--action-surface-inset-block', `${surface.blockInset}px`)
    return () => {
      for (const token of ['--motion-route-duration', '--motion-route-ease', '--motion-enter-duration', '--motion-enter-ease', '--motion-enter-offset-block', '--motion-enter-offset-inline', '--action-surface-inset-inline', '--action-surface-inset-block']) root.style.removeProperty(token)
    }
  }, [dial.values])

  return <DialRoot position="bottom-right" theme="light" />
}
```

The panel values are the eight Task 2 root properties. The replay action always clears its dataset after the computed route duration.

- [ ] **Step 6: Verify isolation and capture an approved preset**

Run: `NEXT_PUBLIC_ENABLE_MOTION_TUNER=true npm run dev`  
Expected: local panel appears, changes live CSS variables, retains local presets, and replay cleans its dataset.

Then run: `npm test && npm run build`  
Expected: tests pass; with the flag absent, no tuner appears in production. If the build is blocked by unrelated user files, record the exact failure and inspect the app manifest rather than changing unrelated code.

After approval, use DialKit Copy and place only the selected values in `src/app/globals.css`; update token assertions with those values and disable the local flag.

---

### Task 7: Execute visual and accessibility acceptance

**Files:**
- Modify: `src/app/case-studies/workPage.integration.test.ts` only if a marker assertion is missing.
- Modify: `docs/superpowers/specs/2026-09-09-portfolio-route-motion-design.md` only to record the accepted preset and browser scope.

**Interfaces:** Consumes Tasks 1–6; produces accepted desktop/mobile visual and input behavior.

- [ ] **Step 1: Add a complete server-rendered marker assertion if absent**

```ts
test('Home and Work expose the complete route-motion contract', async () => {
  const [homeResponse, workResponse] = await Promise.all([fetch(baseUrl), fetch(url)])
  const [homeHtml, workHtml] = await Promise.all([homeResponse.text(), workResponse.text()])
  for (const marker of ['identity', 'nav-work', 'nav-writing', 'nav-about']) {
    assert.match(homeHtml, new RegExp(`data-motion-shared="${marker}"`))
    assert.match(workHtml, new RegExp(`data-motion-shared="${marker}"`))
  }
  assert.match(workHtml, /aria-current="page"/)
})
```

- [ ] **Step 2: Run final automated checks**

Run: `npm test && git diff --check`  
Expected: zero failures and no whitespace errors.

- [ ] **Step 3: Run the manual acceptance checklist**

At Figma desktop size verify Home → Work and identity → Home: shared identity/nav positions map cleanly, normal Home copy and quote leave/return, Work content/Contents enter/exit, and no pre-destination jump occurs. Verify Writing/About and identity use compact surfaces, Work has no hover status surface, keyboard focus is neutral, and the purple quote still scrolls.

Repeat with `document.startViewTransition` disabled, `prefers-reduced-motion: reduce`, Cmd/Ctrl-click, Shift-click, middle-click, keyboard Enter, Back/Forward, and the mobile breakpoint.

- [ ] **Step 4: Commit only after user work is isolated**

Run the following only in a clean task-owned index:

```bash
git add docs/superpowers/specs/2026-09-09-portfolio-route-motion-design.md docs/superpowers/plans/2026-09-09-portfolio-route-motion.md src/app/globals.css src/app/page.tsx src/app/page.module.css src/app/case-studies/page.tsx src/app/case-studies/page.module.css src/app/case-studies/workPage.integration.test.ts src/lib/motion/routeTransition.ts src/lib/motion/routeTransition.test.ts src/components/navigation/RouteTransitionLink.tsx src/components/motion/MotionTuner.tsx src/components/motion/MotionTunerGate.tsx src/components/motion/MotionTuner.test.ts src/app/layout.tsx package.json package-lock.json tsconfig.json
git commit -m "feat: unify portfolio route motion"
```

Expected: the commit contains only this motion system and its documentation. If unrelated work remains staged, do not commit.
