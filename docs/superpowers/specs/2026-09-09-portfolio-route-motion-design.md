# Portfolio Route Motion System

## Goal

Make the Home ↔ Work transition bidirectional, geometry-aware, and controllable from one motion system. Changing a rail label, heading size, or column width must not require recalculating animation offsets by hand.

The system also standardises the left-rail interaction treatment:

- The active section is informational text, not a self-link.
- The active section receives `aria-current="page"`.
- “Hi. I’m Jaynish.”, Work, Writing, and About share a compact, text-width hover surface.
- Keyboard focus remains visible but uses the local foreground token rather than the global blue accent outline.

## Interaction contract

### Home → Work

1. The identity and the three primary navigation labels visually travel to their matching left-rail positions.
2. The remaining Home copy, including the purple kinetic quote, fades and moves upward.
3. Work content enters upward and Contents enters from the right.

### Work → Home

1. Selecting “Hi. I’m Jaynish.” performs the same sequence in reverse.
2. The compact identity and left rail expand and travel to their Home positions.
3. Work content and Contents leave along their entry paths.
4. Home copy and the purple kinetic quote return after the shared elements settle.

### Left rail

1. Work is non-interactive while the Work route is current.
2. Writing and About remain links.
3. Each interactive label has a fine-pointer hover surface around the label only, not its row.
4. Hover has no spatial movement. It is an opacity-only feedback surface.
5. Keyboard navigation gets a foreground-coloured focus indicator. Pointer activation does not leave a blue accent ring.

## Chosen architecture

Use browser View Transitions as the primary implementation, with the current CSS direction-class handoff as a fallback.

View Transitions are the source of geometry: matching elements receive stable semantic `view-transition-name` values. The browser captures the source and destination bounds, so typography and layout changes directly affect the animation without hard-coded pixel offsets.

The fallback keeps the existing Home → Work rules and adds equivalent Work → Home rules. It is intentionally limited to the Home/Work pair; new route pairs use View Transitions first and opt into a fallback only where needed.

Do not use a clone-overlay/FLIP system. It duplicates live content, complicates accessibility and input handling, and makes size changes fragile.

## Transition names

| Element | View transition name |
|---|---|
| Identity | `portfolio-identity` |
| Work navigation | `portfolio-nav-work` |
| Writing navigation | `portfolio-nav-writing` |
| About navigation | `portfolio-nav-about` |
| Work title | `portfolio-work-title` |
| Contents title/list | `portfolio-work-contents` |

Only one instance of a given name is rendered per page state. Decorative arrows and the purple kinetic quote do not receive shared names.

## Motion tokens

Tokens live in the global token layer and are consumed by all route-transition CSS. No component owns duration or curve constants.

| Token | Default responsibility |
|---|---|
| `--motion-route-duration` | Shared-element route handoff duration |
| `--motion-route-ease` | Shared-element position/scale curve |
| `--motion-enter-duration` | Content and rail entrance duration |
| `--motion-enter-ease` | Content entrance/exit curve |
| `--motion-enter-offset-block` | Work-content vertical offset |
| `--motion-enter-offset-inline` | Contents horizontal offset |
| `--motion-stagger` | Difference between content layers, if used |
| `--motion-feedback-duration` | Hover-surface opacity duration |
| `--motion-feedback-ease` | Hover-surface opacity curve |
| `--action-surface-inset-inline` | Text-width hover surface horizontal inset |
| `--action-surface-inset-block` | Text-width hover surface vertical inset |
| `--action-focus-color` | Keyboard focus indicator colour |

The existing `--motion-*` tokens are migrated to these semantic names. Temporary aliases may remain during migration so unrelated pages do not regress.

## Runtime API

Introduce a small client-only transition helper and two semantic links:

- `RouteTransitionLink` starts a direction-aware route transition for navigation links.
- `RouteReturnLink` is the Home-return variant used by “Hi. I’m Jaynish.”
- `beginRouteTransition(direction, navigate)` uses `document.startViewTransition` when available, otherwise sets `data-page-transition` and waits for the computed route-duration token before navigation.

The helper reads the duration from CSS at runtime. CSS stays the source of truth, so a tuned token cannot drift from the navigation delay.

The root document records one of `to-work` or `to-home` only during the fallback handoff and clears it after navigation or cancellation.

## Accessibility and interruption

- Current-route items are plain text with `aria-current="page"`; they cannot receive link focus or self-navigate.
- `:focus-visible` remains available for keyboard users. Its token defaults to the local foreground colour on the Work rail.
- Hover surfaces are inside `@media (hover: hover) and (pointer: fine)`.
- Reduced motion keeps opacity changes but removes route translation and scale in both the primary and fallback paths.
- Modified clicks, keyboard link activation, and browser history preserve normal navigation semantics. The transition may be skipped when the platform does not expose a safe animated navigation path.

## Development-only DialKit tuning

DialKit is a local development tool only. It is loaded and mounted only when an explicit development environment flag is enabled; no controls, code path, or dependency is included in production output.

The panel exposes a “Portfolio route motion” preset with:

- route duration and Bézier curve;
- content entrance duration, curve, and offsets;
- hover-surface block/inline insets;
- replay controls for Home → Work and Work → Home;
- named presets stored locally.

Tuned values write CSS custom properties for live preview. The accepted preset is copied into the global token defaults, then the tuning panel is disabled again. DialKit is not the production animation runtime.

## Verification

1. Add tests for the non-link `aria-current` Work item and the compact label-level surface.
2. Add tests for route direction, token-derived fallback delay, and cleanup on cancelled navigation.
3. Test both transition directions with reduced motion enabled and disabled.
4. Run visual checks at the Figma desktop width and mobile breakpoints.
5. Verify keyboard focus, browser back/forward, modified clicks, and touch navigation.
6. Keep the existing purple kinetic quote mounted and interactive on Home.

## Migration order

1. Correct the active-item semantics and move the rail hover surface to label wrappers.
2. Introduce semantic motion and interaction tokens with compatibility aliases.
3. Implement the shared transition helper and the Work → Home fallback.
4. Add View Transition names and primary path.
5. Add the development-only DialKit tuner and capture an approved preset.
6. Remove obsolete per-page hard-coded transition constants after parity checks.

## Out of scope

- Changing the visual Figma layout, portfolio content, or the purple quote’s scroll behaviour.
- Shipping DialKit or a motion editor to visitors.
- Applying route-transition animation to every existing page before the Home/Work pair has passed visual and accessibility checks.
