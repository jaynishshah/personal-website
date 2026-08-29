# Reference interaction audit

Captured on 13 August 2026 at a 1280 × 720 desktop viewport.

Figma board: https://www.figma.com/design/0A1H16M5et1IOaicyJx2qs

Verified board render: `figma-board.png`

## Overall reading

The shared references are not distinctive because they add many decorative effects. They are distinctive because each site has a quiet visual base and gives a small number of behaviours real presence:

- Zeh Fernandes uses scale, spatial tension, and a scroll-triggered marker highlight inside long-form reading.
- PJ Onori keeps the homepage extremely compact, then lets Work take over the viewport as a focused project index. Hover isolates the active title by muting the rest.
- Noé Chagué turns personal photography into a found-object interaction: a physical-looking fan of images that lifts on hover and opens into a focused detail view.

## Captured steps

1. **Zeh — compact front door. Health: strong.** Large authored statement and three oversized routes do almost all the work. Route hover is intentionally quiet; the structure carries the page.
2. **Zeh — work index and long-form article. Health: strong.** Project links remain plain and editorial. Article imagery breaks the text axis and behaves like visual evidence or a footnote rather than a hero banner.
3. **Zeh — scroll emphasis. Health: strong.** One sentence gains a grey marker-like background as it reaches the reading position. The effect takes roughly 1.5 seconds and makes the scroll position feel authored.
4. **PJ Onori — compact profile. Health: strong.** A narrow column, restrained header, and serif prose produce a calm, direct introduction.
5. **PJ Onori — Work layer. Health: strong.** Work opens a viewport-covering project index. The layer uses a short opacity/transform transition; hovering a project preserves it in white while siblings recede.
6. **Noé — personal photo stack. Health: strong.** Seven overlapping photographs are given small rotations and z-order, resembling physical prints rather than a conventional gallery.
7. **Noé — photo hover and detail. Health: strong.** Hover lifts the chosen photograph, scales it by about 5%, and moves it to the top of the stack. Activation opens a full-screen dialog with the photograph and its caption.

## Interaction grammar for Jaynish's site

Use the references as direct behavioural templates, adapted to Jaynish's content:

### 1. Compact front door

- Start with PJ Onori's density: name, positioning, a short authored introduction, and only the routes required to continue.
- Use ManvsOffice for name, navigation, route titles, and interface moments.
- Use a restrained contemporary serif for the introduction and reading text.
- Avoid a conventional portfolio hero, card grid, or preview feed.

### 2. Work as a focused index

- Borrow PJ Onori's viewport-level Work layer rather than placing project cards on the homepage.
- Show project titles as a simple typographic index.
- On hover or keyboard focus, keep the active project fully legible while the other titles recede.
- A small photograph, photographed sketch, or diagram may appear for the active project if it adds recognition; it should not become a generic thumbnail card.
- Close and return should preserve context.

### 3. Reading that responds to scroll

- Borrow Zeh's marker-like reveal for one key line, argument, or takeaway in a case study or essay.
- Let photographs and diagrams occasionally sit outside the reading column like evidence pinned beside the text.
- Do not animate every paragraph. One or two authored moments per page are enough.

### 4. Photography as a discovered object

- Borrow Noé's overlapping-print behaviour for a small evergreen group of Jaynish's architecture, texture, space, and photographed-sketch images.
- Keep photographs in natural colour.
- Hover or focus should lift and straighten the selected print; tap or activation should open it with a brief human caption.
- This is a finite personal artifact, not a live Instagram feed or a content obligation.

### 5. Circadian theme as ambient behaviour

- Theme changes should crossfade quietly between the agreed time states.
- Keep the feature unannounced and self-discovered.
- The motion should never interrupt reading or compete with the photo interactions.

## Boundaries

- Copy interaction grammar, pacing, and restraint—not the references' names, words, assets, or exact visual identity.
- No generic section fade-ups, custom-cursor spectacle, scroll-jacking, ornamental grids, or animation added merely to signal “craft.”
- Every hover state needs an equivalent keyboard-focus state and a sensible tap behaviour.
- Scroll-triggered emphasis and theme transitions must respect `prefers-reduced-motion`.
- Photo detail views need labelled controls, focus management, Escape-to-close, and useful image descriptions.

## Evidence limits

The captures document the visible desktop interactions and accessible structure exposed by the pages. They do not establish full browser, mobile, performance, or assistive-technology compliance.
