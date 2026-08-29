# Homepage kinetic overlay design QA

## Comparison target

- Source visual truth: `docs/design-sources/homepage-figma-reference-overlay.png`
- Browser-rendered implementation:
  - `docs/audits/2026-08-15-homepage-qa/overlay-active-desktop.png`
  - `docs/audits/2026-08-15-homepage-qa/overlay-idle-desktop.png`
  - `docs/audits/2026-08-15-homepage-qa/overlay-active-mobile-390x844.png`
- Full-view comparison evidence: `docs/audits/2026-08-15-homepage-qa/comparison-overlay-active-desktop-stacked.png`
- Focused quote-region comparison: `docs/audits/2026-08-15-homepage-qa/comparison-overlay-focus-stacked.png`
- Desktop viewport: 1440 × 900 CSS px at device scale factor 1.
- Source pixels: 1440 × 900. Implementation pixels: 1440 × 900. No density normalization was required.
- Mobile viewport: 390 × 844 CSS px at device scale factor 1.
- Compared state: the source shows the active card with its centre quote at rest inside the reel; the implementation uses a direct-manipulation picker state so the clip, subtly faded neighbours, and centre-line snap can all be assessed.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: MV Office Regular remains fixed for the title, reel, and navigation; Source Serif 4 Regular remains fixed for supporting copy. The resting display type is intentionally 6.6% smaller than the original desktop scale: at 1440px it measures 59.76px with 62.742px title rows. The black and resting purple rows share that rhythm with zero adjacent gap. During wheel/touch movement, only the purple content grows from a top-left origin—1.07× on desktop and a contained 1.125× on mobile—then returns to the resting size.
- Spacing and layout rhythm: the quote track remains exactly 1291px wide at `x=64` on desktop while the card extends 24px around it, giving the text visual breathing room without changing its measure. The card keeps an approximately 80px single-line height, 8px radius, and 1px stroke. At 390px the track remains 348px wide at `x=21`; the mobile picker reserves an approximately 82px two-line slot, with the card extending 8px around it. This preserves the black-to-blue title gap while containing both lines of every quote.
- Colors and tokens: the homepage palette remains `#f7f5ef`, `#1c1c1b`, `#66635c`, and `#3158de`; the active surface is white with a softly varied near-black gradient stroke and restrained inner/outer shadows.
- Image quality and asset fidelity: the reference contains no photographic or illustrative assets. The quote remains live text so it stays sharp and accessible at every density.
- Copy and content: all 17 supplied quote endings remain present. The implementation comparison uses the adjacent quote because it captures the transition rather than a static Figma instant; this is an expected temporal-state difference.
- Interaction fidelity: the viewport clips the previous/current/next lines to the card on every breakpoint. Wheel and touch input move the text track directly, then use a restrained momentum tail and a short centre-line snap. There is no queued step transition or track remount. The card enters on movement with a 90ms opacity fade and 115ms minimal scale-up; the purple text uses a matching 115ms transform-only scale from top-left with an Out Quart curve (`cubic-bezier(0.165, 0.84, 0.44, 1)`), so both directions land gently without adding latency.
- Focused-region comparison confirms the full rounded card edge, gradient stroke, subtle inset depth, soft outer shadow, text scale, and clip boundary. The heading remains readable because the card sits behind the title glyphs without masking its own top edge.

## Interaction and accessibility evidence

- Before input, the card reports opacity `0`, scale `0.988`, and only the centre quote reports opacity `1`.
- During movement, the card reports white fill, a 1px gradient stroke, 8px radius, inset highlight/depth, a soft outer shadow, increasing opacity, and scale approaching `1`.
- After the motion settles and the short centre snap completes, the card returns to opacity `0`; only the centre quote remains visible.
- The desktop quote “let products retain their character.” remains at `x=64` and one line at rest. Its top edge stays anchored when the active-state scale begins.
- At 390px the text track remains at `x=21` and 348px wide. Every supplied quote fits within two visual lines in the fixed two-line slot, with no horizontal page overflow.
- All 17 supplied quote endings were exercised at 390px. No quote exceeded the two-line slot; the small 2px scroll-height difference observed on some entries is sub-pixel line-box rounding, not a third line.
- At 390 × 844, the final navigation row ends at `y=805.02`, inside the fixed viewport; the heading, supporting copy, and all three navigation rows remain visible.
- `window.scrollY` remains `0`; the interaction changes the quote rather than moving the fixed viewport.
- Keyboard moves one selection at a time; wheel/trackpad and touch use direct picker movement. The existing polite settled-state announcement remains unchanged.
- Reduced-motion input picks an adjacent quote instantly; it does not move the track or expose neighbouring quotes.

## Comparison history

- P1 quote layout jump: the first card implementation applied animated horizontal padding directly to each quote line. The desktop text moved 24px when the card appeared; the mobile text moved 8px and could adopt different line breaks. Fixed by moving the spacing to the card and clip frame while pinning the text track to its original width and origin. The later type-scale pass keeps that origin at the top-left of the purple text, so scale changes never create a gap above the blue row.
- P2 active mobile wrap: the prior responsive card used one text line and either clipped long quotes or reserved an inconsistent multi-line area. The final treatment gives mobile a fixed two-line slot, allows normal wrapping, and keeps every supplied quote within those two lines. Post-fix evidence: the track stays 348px wide at 390px, the page has zero horizontal overflow, and all 17 quotes remained within their two-line boxes.
- P2 development preview asset loss: running the production build while the development server was active replaced Next.js’s generated cache, causing temporary CSS and script 404s. Restarting the preview regenerated the development assets. Post-fix evidence: the homepage background, MV Office font, fixed 900px viewport, and active card computed styles are present in the final browser capture.
- P2 inconsistent title rhythm: responsive `margin-top` values on the quote reel added 24px before the purple title row on desktop and smaller one-off gaps at narrower widths. Removed those offsets so the reel participates in the heading’s shared line-height. The subsequent top-left scale anchor preserves that decision: desktop row boxes are now 62.742px, and adjacent block gaps are 0px at 1440px and 390px.
- P1 continuous-scroll restart: the prior step-transition approach could restart or build a visibly mechanical queue under fast wheel/touch input. Replaced with a persistent three-line picker track that follows input directly, rebases only after a line crosses centre, then uses capped momentum and a short snap back to the centre. Browser verification confirms the card is visible during input and returns to `opacity: 0` with a `translate3d` offset of `0px` after settlement.
- P2 clipped card edge: the opaque stable-title backgrounds sat above the card and masked its top 6.5px overlap. Removed only that masking fill while retaining the title’s higher stacking order, so the rounded edge is whole and black title glyphs remain readable. Shared title block gaps remain 0px.

## Implementation checklist

- [x] White active card with a subtle gradient stroke, 8px radius, inset depth, and softened drop shadow.
- [x] Subtle fade/scale entrance and fade/scale exit driven by the existing moving state.
- [x] Reel content clipped within the card without changing the text track or title geometry.
- [x] Resting display type is subtly reduced; active purple type scales from a top-left origin without changing layout.
- [x] Identical quote position, width, and line breaks before and during the card transition.
- [x] Direct, picker-like wheel/touch movement with restrained momentum and a centred snap.
- [x] Natural outgoing/incoming opacity curve rather than fixed Figma ghost opacity.
- [x] Centre-only settled state after the short idle delay.
- [x] No queued reel motion or line remounts during rapid wheel and touch input.
- [x] Responsive desktop and mobile card geometry; mobile quotes always wrap within a fixed two-line window.
- [x] Consistent heading rhythm before the purple reel at every breakpoint.
- [x] Full rounded card edge visible behind the title text.
- [x] Keyboard, wheel, touch, reduced-motion, and fixed-viewport behavior preserved.
- [x] Browser-rendered desktop/mobile evidence and visual comparison completed.

## Follow-up polish

- P3: the static Figma frame uses a slightly stronger black stroke and 0.15 shadow opacity. The implementation intentionally softens both during its fade-in, as requested.

final result: passed

---

# Work case-study grid design QA

## Comparison target

- Source visual truth: `/var/folders/n1/63mzpp9s08q10sdly1tp8wdc0000gn/T/codex-clipboard-127f6908-3aff-404b-b32b-96b4c5578bec.png`.
- Browser-rendered implementation:
  - `docs/audits/2026-08-23-work-grid/implementation-desktop-final-1440x1000.png`
  - `docs/audits/2026-08-23-work-grid/implementation-desktop-tile-view-1440x1000.png`
  - `docs/audits/2026-08-23-work-grid/implementation-mobile-pass1-390x844.png`
- Full-view comparison evidence: `docs/audits/2026-08-23-work-grid/comparison-full-side-by-side.png`.
- Focused tile comparison evidence: `docs/audits/2026-08-23-work-grid/comparison-tile-focused-side-by-side.png`.
- Source pixels: 2926 × 1376. Desktop implementation pixels and CSS viewport: 1440 × 1000 at device scale factor 1. Mobile implementation pixels and CSS viewport: 390 × 844 at device scale factor 1.
- Density normalization: the source and desktop implementation were independently scaled to fit equal-width comparison cells without cropping. The focused comparison isolates the reference backing treatment and the implemented tile at equal display widths.
- Compared state: Work route in light mode, first case-study tile at rest. The reference defines the image-backing treatment rather than a complete Work-page composition; the oversized Work title and responsive grid follow the previously approved page direction.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the oversized Work heading remains MV Office Regular. The case-study title uses the same display family at 44px desktop and 28px mobile, with no metadata or summary competing with it. The close control uses the Radix Cross 2 icon at 32px desktop and 26px mobile.
- Spacing and layout rhythm: the desktop index uses two equal 620px columns inside the existing 1280px centered grid, with a 40px column gap. The image sits inside a 620px backing surface with 40px inset space. Mobile collapses to one 350px column with a 20px image inset. The title sits 14.4px below the backing surface.
- Colors and visual tokens: the Work route retains the approved cream, black, and blue landing-page palette. The requested subtle image surface computes to `rgba(0, 0, 0, 0.04)` with no border, shadow, gradient, or decorative treatment.
- Image quality and asset fidelity: the existing 1600 × 900 SWATCH feature image is rendered in its native 16:9 ratio without cropping, distortion, or placeholder art. Next Image supplies responsive image sizes for the two-column and mobile states.
- Copy and content: the index now contains only the case-study feature image and title “SWATCH.” The prior index label, kicker, company/role/year metadata, summary, system layers, artifacts, and outcomes are absent.
- Interaction and accessibility: the image and title remain keyboard-accessible links to the case study. The close control is labelled “Close Work,” returns to Home, and has a visible focus outline. The global site header and footer are removed from the Work route's visual and accessibility trees.
- Responsiveness: desktop computed grid tracks are `620px 620px`; mobile computes one `350px` track. Document width equals viewport width at both 1440px and 390px.

## Comparison history

- P2 residual global layout: the first pass removed the global header but retained the global footer, which reintroduced “Jaynish Shah” and unrelated social/navigation content after the minimal case-study grid. The Work-scoped footer is now hidden. Post-fix evidence: computed header and footer display are both `none`, and the final tile view contains only Work, close, feature image, and title.

## Implementation checklist

- [x] Two-column desktop case-study grid with one-column mobile collapse.
- [x] Existing feature image inset on a 4% black backing surface.
- [x] Case-study title directly below the image treatment.
- [x] Prior card metadata, summary, divider, tags, and reveal content removed.
- [x] Global site header and footer hidden only on the Work route.
- [x] Accessible close control returns to Home.
- [x] Desktop and mobile captures checked with no horizontal overflow.
- [x] Clean-preview close navigation completed with zero console errors.

## Follow-up polish

- None required for this pass.

final result: passed
