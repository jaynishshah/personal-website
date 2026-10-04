import assert from 'node:assert/strict'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { once } from 'node:events'
import { readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'

const port = 44000 + (process.pid % 1000)
const baseUrl = `http://127.0.0.1:${port}`
const url = `${baseUrl}/case-studies`
const testDistDir = '.next-test'
const testDistPath = path.join(process.cwd(), testDistDir)
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')

let server: ChildProcessWithoutNullStreams
let serverOutput = ''
let tsconfigBefore = ''

before(async () => {
  tsconfigBefore = await readFile(tsconfigPath, 'utf8')
  server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_DIST_DIR: testDistDir,
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
  )

  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString()
  })

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The development server is still starting.
    }
    await delay(250)
  }

  throw new Error(`Next.js did not start in time.\n${serverOutput}`)
})

after(async () => {
  if (server && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit')
    server.kill('SIGTERM')
    await exited
  }

  await rm(testDistPath, { force: true, recursive: true })
})

async function getEmittedCss(pageUrl = url) {
  const response = await fetch(pageUrl)
  const html = await response.text()
  const stylesheetPaths = [...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"[^>]*>/g)].map(
    ([, href]) => href,
  )

  assert.ok(stylesheetPaths.length > 0)

  const stylesheets = await Promise.all(
    stylesheetPaths.map(async (href) => {
      const stylesheetResponse = await fetch(new URL(href, pageUrl))
      assert.equal(stylesheetResponse.status, 200)
      return stylesheetResponse.text()
    }),
  )

  return stylesheets.join('\n')
}

test('integration server keeps its generated manifests out of the live .next directory', async () => {
  const clientManifestPath = path.join(
    testDistPath,
    'server',
    'app',
    'case-studies',
    'page_client-reference-manifest.js',
  )
  const clientManifestExists = await stat(clientManifestPath).then(
    () => true,
    () => false,
  )

  assert.equal(clientManifestExists, true)
})

test('integration server leaves the project TypeScript config unchanged', async () => {
  assert.equal(await readFile(tsconfigPath, 'utf8'), tsconfigBefore)
})

test('content entrances retain their duration while using a gradual ease-out', async () => {
  const globalCss = await readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')

  assert.match(
    globalCss,
    /--motion-content-enter:\s*240ms\s+cubic-bezier\(0\.33,\s*1,\s*0\.68,\s*1\)/,
  )
})

test('interactive hover surfaces respond on a dedicated quick ease-out token', async () => {
  const [globalCss, railStyles, contentsStyles] = await Promise.all([
    readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'ContentsRail.module.css'), 'utf8'),
  ])

  assert.match(globalCss, /--motion-hover:\s*100ms\s+cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/)
  assert.match(railStyles, /transition:\s*opacity\s+var\(--motion-hover\)/)
  assert.match(contentsStyles, /transition:\s*opacity\s+var\(--motion-hover\)/)
})

test('Work identity and section links share the text-width close-button hover surface', async () => {
  const railStyles = await readFile(
    path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'),
    'utf8',
  )

  assert.match(
    railStyles,
    /\.identity,\s*\.navigation a\s*\{[^}]*isolation:\s*isolate[^}]*width:\s*fit-content/,
  )
  assert.match(railStyles, /\.identity::after,\s*\.navigation a::after/)
  assert.match(
    railStyles,
    /@media \(hover: hover\) and \(pointer: fine\)\s*\{[\s\S]*\.identity:hover::after,[\s\S]*\.navigation a:hover::after/,
  )
})

test('Work route renders a dedicated image-led case-study index', async () => {
  const response = await fetch(url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /class="[^"]*work-page[^"]*"/)
  assert.match(html, /<h1[^>]*>Work<\/h1>/)
  assert.match(html, /aria-label="Close Work"/)
  assert.match(html, /aria-label="View Swatch case study"/)
  assert.match(html, /<h2[^>]*>.*Swatch.*<\/h2>/)
  assert.doesNotMatch(html, /Case-study index/)
  assert.doesNotMatch(html, /SWATCH is Nykaa&#x27;s multi-brand design system/)
  assert.doesNotMatch(html, /Selected design systems work across foundations, governance, and adoption\./)
})

test('Work route renders the compact identity rail and case-study contents rail from the homepage transition', async () => {
  const response = await fetch(url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /data-testid="work-layout"/)
  assert.match(html, /data-testid="portfolio-rail"/)
  assert.match(html, /Hi\. I’m Jaynish\./)
  assert.match(html, /<nav[^>]*aria-label="Portfolio sections"/)
  assert.match(html, /data-testid="work-contents-rail"/)
  assert.match(html, />Contents</)
})

test('Work, Writing, and blog articles render the one shared portfolio rail', async () => {
  const [work, writing, article] = await Promise.all([
    fetch(`${baseUrl}/case-studies`).then((response) => response.text()),
    fetch(`${baseUrl}/blog`).then((response) => response.text()),
    fetch(`${baseUrl}/blog/component-api-for-designers`).then((response) => response.text()),
  ])
  const railSource = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.tsx'), 'utf8')
  const railStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'), 'utf8')

  for (const html of [work, writing, article]) {
    assert.match(html, /data-testid="portfolio-rail"/)
    assert.match(html, /Hi\. I’m Jaynish\./)
  }
  assert.match(railSource, /activeSection: HeaderSection/)
  assert.match(railStyles, /margin-top:\s*37px/)
  assert.match(railStyles, /position:\s*sticky/)
})

test('Blog posts and case-study details share the reusable scroll-aware contents rail', async () => {
  const [blog, caseStudy] = await Promise.all([
    fetch(`${baseUrl}/blog/component-api-for-designers`).then((response) => response.text()),
    fetch(`${baseUrl}/case-studies/swatch`).then((response) => response.text()),
  ])
  const contentsRail = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'ContentsRail.tsx'), 'utf8')

  assert.match(blog, /aria-label="Article contents"/)
  assert.match(caseStudy, /aria-label="Article contents"/)
  assert.match(contentsRail, /IntersectionObserver/)
  assert.match(contentsRail, /activeIndicator/)
})

test('Blog posts and case-study details render through the shared article-page template', async () => {
  const [blog, caseStudy] = await Promise.all([
    fetch(`${baseUrl}/blog/component-api-for-designers`).then((response) => response.text()),
    fetch(`${baseUrl}/case-studies/swatch`).then((response) => response.text()),
  ])
  const template = await readFile(path.join(process.cwd(), 'src', 'components', 'content', 'ArticlePageTemplate.tsx'), 'utf8')

  assert.match(blog, /data-testid="article-page-template"/)
  assert.match(caseStudy, /data-testid="article-page-template"/)
  assert.match(caseStudy, /aria-label="Back to Work"/)
  assert.match(caseStudy, /data-testid="portfolio-rail"/)
  assert.match(template, /PortfolioRail/)
  assert.match(template, /ContentsRail/)
})

test('Case-study Markdown inherits the shared article typography and frame width', async () => {
  const [templateStyles, bodyStyles, caseLayouts] = await Promise.all([
    readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'content', 'ArticleBody.module.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'content', 'CaseStudyLayouts.module.css'), 'utf8'),
  ])

  assert.match(templateStyles, /--article-body-size:\s*18px/)
  assert.match(templateStyles, /--article-h1-size:\s*40px/)
  assert.match(templateStyles, /--article-h2-size:\s*28px/)
  assert.match(templateStyles, /--article-h3-size:\s*24px/)
  assert.doesNotMatch(bodyStyles, /\.body\[data-variant='case-study'\]\s*>\s*:global\(p\)[\s\S]*max-width/)
  assert.doesNotMatch(bodyStyles, /\.body\[data-variant='case-study'\]\s*>\s*:global\(h4\)\s*\{/)
  assert.doesNotMatch(caseLayouts, /max-width:\s*var\(--reading-content-max\)/)
})

test('Shared article shell centers fixed rails around a flexible 720px reading measure', async () => {
  const [globalCss, caseLayouts] = await Promise.all([
    readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'content', 'CaseStudyLayouts.module.css'), 'utf8'),
  ])

  assert.match(globalCss, /grid-template-columns:\s*199px\s+minmax\(0,\s*1fr\)\s+166px/)
  assert.match(globalCss, /width:\s*min\(1140px,\s*calc\(100%\s*-\s*\(2\s*\*\s*var\(--page-gutter\)\)\)\)/)
  assert.match(globalCss, /\.article-page-template__frame\s*\{[^}]*max-width:\s*720px/)
  assert.match(globalCss, /\.article-page-template__featured\s*\{[^}]*max-width:\s*720px/)
  assert.match(globalCss, /\.article-page-template__back-control\s*\{[^}]*position:\s*sticky/)
  assert.match(globalCss, /\.article-page-template__gradient\s*\{[^}]*height:\s*48px/)
  assert.match(caseLayouts, /\.pictogramCopy h3\s*\{[^}]*margin:\s*0\s+0\s+8px/)
})

test('The back-control adds its lower gradient buffer only after it becomes sticky', async () => {
  const [template, globalCss] = await Promise.all([
    readFile(path.join(process.cwd(), 'src', 'components', 'content', 'StickyBackControl.tsx'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8'),
  ])

  assert.match(template, /getBoundingClientRect\(\)\.top\s*<=\s*16/)
  assert.match(template, /data-stuck/)
  assert.match(globalCss, /\.article-page-template__back-control\[data-stuck='true'\]\s*\{[^}]*padding-bottom:\s*16px/)
  assert.match(globalCss, /\.article-page-template__gradient\[data-stuck='true'\]\s*\{[^}]*height:\s*72px/)
})

test('Work contents rail is derived only from published case studies', async () => {
  const response = await fetch(url)
  const html = await response.text()

  assert.match(html, /href="\/case-studies\/swatch"[^>]*>Swatch<\/a>/)
  assert.doesNotMatch(html, /Repairing design systems at Ticketmaster/)
  assert.doesNotMatch(html, /Making Design System at Ticketmaster AI-ready/)
})

test('Work section links use the same compact hover target as the identity link', async () => {
  const railStyles = await readFile(
    path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'),
    'utf8',
  )

  assert.match(railStyles, /\.navigation\s*\{[^}]*gap:\s*16px/)
  assert.doesNotMatch(railStyles, /padding-block/)
})

test('Writing uses the Work rail layout and keeps list metadata out of mono typography', async () => {
  const response = await fetch(`${baseUrl}/blog`)
  const html = await response.text()
  const writingStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'blog', 'page.module.css'), 'utf8')
  const postCardStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'PostCard.module.css'), 'utf8')

  assert.match(html, /class="[^"]*writing-page[^"]*"/)
  assert.match(html, /aria-label="Close Writing"/)
  assert.doesNotMatch(html, />Contents</)
  assert.match(writingStyles, /grid-template-columns:\s*199px\s+minmax\(0,\s*866px\)\s+166px/)
  assert.doesNotMatch(postCardStyles, /font-family:\s*var\(--font-family-mono\)/)
})

test('Blog posts use the Writing shell with a Back to Writing control and one shared content width', async () => {
  const response = await fetch(`${baseUrl}/blog/component-api-for-designers`)
  const html = await response.text()
  const postStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'page.module.css'), 'utf8')

  assert.match(html, /class="[^"]*blog-post-page[^"]*"/)
  assert.match(html, /aria-label="Back to Writing"/)
  assert.match(html, /material-symbols-outlined[^>]*>chevron_left<\/span>\s*Back to Writing/)
  assert.doesNotMatch(html, /Header_header/)
  assert.match(postStyles, /grid-template-columns:\s*199px\s+minmax\(0,\s*866px\)\s+166px/)
  assert.match(postStyles, /\.articleFrame\s*\{[^}]*max-width:\s*866px/)
  assert.match(postStyles, /\.postTitle\s*\{[^}]*font-family:\s*var\(--font-family-display\)[^}]*font-size:\s*var\(--article-title-size,\s*20px\)/)
})

test('Blog posts expose linked section hierarchy and the approved Markdown reading scale', async () => {
  const response = await fetch(`${baseUrl}/blog/component-api-for-designers`)
  const html = await response.text()
  const postStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'page.module.css'), 'utf8')
  const contentsStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'ContentsRail.module.css'), 'utf8')
  const articleBodyStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'content', 'ArticleBody.module.css'), 'utf8')

  assert.match(html, /aria-label="Article contents"/)
  assert.match(html, /href="#api-property-buckets"[^>]*>API Property Buckets<\/a>/)
  assert.match(html, /href="#event-handlers"[^>]*>Event Handlers<\/a>/)
  assert.match(html, /<h2 id="api-property-buckets">API Property Buckets<\/h2>/)
  assert.match(html, /<h3 id="event-handlers">Event Handlers<\/h3>/)
  assert.match(html, /<figcaption[^>]*>Designer&#x27;s Role: Identify key trigger points\./)
  assert.match(contentsStyles, /\.contents a:hover\s*\{[^}]*text-decoration:\s*none/)
  assert.match(postStyles, /\.articleBody :global\(figure\)\s*\{[^}]*margin:\s*24px\s+0/)
  assert.match(postStyles, /\.articleFrame\s*\{[^}]*--article-title-size:\s*20px[^}]*--article-subtitle-size:\s*16px[^}]*--article-meta-size:\s*13px/)
  assert.match(postStyles, /\.articleBody\s*\{[^}]*--article-body-size:\s*18px[^}]*--article-h1-size:\s*40px[^}]*--article-h2-size:\s*28px[^}]*--article-h3-size:\s*24px/)
  assert.match(postStyles, /\.summary\s*\{[^}]*font-style:\s*italic/)
  assert.match(postStyles, /--article-h2-top-space:\s*32px[^}]*--article-h2-bottom-space:\s*12px/)
  assert.match(postStyles, /--article-code-size:\s*14px[^}]*--article-caption-size:\s*14px/)
  assert.match(articleBodyStyles, /font-size:\s*var\(--article-h2-size,\s*clamp\(2rem,\s*4vw,\s*3\.1rem\)\)/)
  assert.match(articleBodyStyles, /margin-top:\s*var\(--article-h2-top-space,/)
})

test('Blog contents use one scroll-aware active surface and the article rails settle into a shared sticky top edge', async () => {
  const response = await fetch(`${baseUrl}/blog/component-api-for-designers`)
  const html = await response.text()
  const postStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'page.module.css'), 'utf8')
  const contentsComponent = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'ContentsRail.tsx'), 'utf8')
  const contentsStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'ContentsRail.module.css'), 'utf8')
  const templateStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')
  const railStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'), 'utf8')

  assert.match(html, /aria-current="location"/)
  assert.match(contentsComponent, /IntersectionObserver/)
  assert.match(contentsComponent, /activeIndicator/)
  assert.match(railStyles, /\.rail\s*\{[^}]*position:\s*sticky[^}]*top:\s*16px/)
  assert.match(postStyles, /\.backLink\s*\{[^}]*position:\s*sticky[^}]*top:\s*16px/)
  assert.match(contentsStyles, /\.contents\s*\{[^}]*top:\s*16px/)
  assert.match(templateStyles, /\.article-page-template__contents\s*\{[^}]*margin-top:\s*19px/)
  assert.match(railStyles, /\.navigation\s*\{[^}]*margin-top:\s*37px/)
  assert.match(contentsStyles, /\.contents p\s*\{[^}]*font-size:\s*20px/)
  assert.match(templateStyles, /\.article-page-template__featured\s*\{[^}]*margin-top:\s*26px/)
  assert.match(contentsStyles, /\.activeIndicator\s*\{[^}]*transition:\s*transform\s+220ms\s+cubic-bezier\(\.77,\s*0,\s*\.175,\s*1\)/)
  assert.match(templateStyles, /\.article-page-template__gradient\s*\{[^}]*linear-gradient/)
})

test('Blog posts place the feature before their overview and expose it in contents', async () => {
  const response = await fetch(`${baseUrl}/blog/component-api-for-designers`)
  const html = await response.text()
  const postStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'page.module.css'), 'utf8')

  assert.match(html, /href="#article-overview"[^>]*>Overview<\/a>/)
  assert.match(html, /<header id="article-overview" class="[^"]*postHeader[^"]*">/)
  assert.ok(html.indexOf('page_featuredImage') < html.indexOf('page_postHeader'))
  assert.match(postStyles, /\.backLink:hover\s*\{[^}]*text-decoration:\s*none\s*!important/)
})

test('Typography specimen exposes the full Markdown and article-header tuning system', async () => {
  const response = await fetch(`${baseUrl}/type-specimen`)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /Markdown Typography/)
  assert.match(html, /Body copy/)
  assert.match(html, /Markdown H1/)
  assert.match(html, /Heading 2/)
  assert.match(html, /Heading 3/)
  assert.match(html, /Heading 4/)
  assert.match(html, /Links/)
  assert.match(html, /Bold &amp; italic/)
  assert.match(html, /Tables/)
  assert.match(html, /Blockquote/)
  assert.match(html, /Code block/)
  assert.match(html, /Callout label/)
  assert.match(html, /Article header/)
  assert.match(html, /Article title/)
  assert.match(html, /Subtitle/)
  assert.match(html, /Metadata/)
  assert.match(html, /Copy CSS values/)
  assert.doesNotMatch(html, /aria-label="Portfolio sections"/)
})

test('Writing titles match the rail-label type treatment without underlines', async () => {
  const postCardStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'PostCard.module.css'), 'utf8')

  assert.match(
    postCardStyles,
    /\.title\s*\{[^}]*font-family:\s*var\(--font-family-display\)[^}]*font-size:\s*16px[^}]*font-weight:\s*400[^}]*line-height:\s*1[^}]*text-decoration:\s*none/,
  )
})

test('Writing cards place the excerpt below a two-arrow handoff title and combine date with plain tags', async () => {
  const response = await fetch(`${baseUrl}/blog`)
  const html = await response.text()

  assert.match(html, /Component API : For Designers<\/span><span class="[^"]*titleArrow[^"]*" aria-hidden="true"><span class="[^"]*titleArrowTrack[^"]*"><span class="material-symbols-outlined">arrow_right_alt<\/span><span class="material-symbols-outlined">arrow_right_alt<\/span><\/span><\/span><\/h2><p[^>]*>Building components/)
  assert.match(html, /<time[^>]*>Jun 22, 2025<\/time><span[^>]*> • <\/span><span[^>]*>design system<\/span>/)
  assert.doesNotMatch(html, /#design system/)
})

test('Writing title arrows use an 8px gap and a reduced-motion-safe hover handoff', async () => {
  const postCardStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'PostCard.module.css'), 'utf8')

  assert.match(postCardStyles, /\.title\s*\{[^}]*gap:\s*8px/)
  assert.match(postCardStyles, /\.titleArrow\s*\{[^}]*overflow:\s*hidden/)
  assert.match(postCardStyles, /\.titleArrowTrack > span\s*\{[^}]*font-size:\s*inherit/)
  assert.match(postCardStyles, /\.titleArrowTrack\s*\{[^}]*transform:\s*translateX\(-50%\)[^}]*transition:\s*transform\s+var\(--motion-fast\)/)
  assert.match(postCardStyles, /@media \(hover: hover\) and \(pointer: fine\)\s*\{[\s\S]*?\.postCard:hover \.titleArrowTrack[\s\S]*?transform:\s*translateX\(0\)/)
  assert.match(postCardStyles, /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.postCard:hover \.titleArrowTrack[\s\S]*?transform:\s*translateX\(-50%\)/)
})

test('Writing uses an optically title-weight arrow and does not render the global footer', async () => {
  const [layout, writingStyles, postCardStyles] = await Promise.all([
    readFile(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'app', 'blog', 'page.module.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'src', 'components', 'PostCard.module.css'), 'utf8'),
  ])

  assert.match(layout, /@material-symbols\/font-500\/outlined\.css/)
  assert.match(postCardStyles, /\.titleArrow\s*\{[^}]*font-size:\s*24px[^}]*font-weight:\s*500/)
  assert.match(writingStyles, /:global\(body\):has\(\.container\) :global\(footer\)\s*\{[^}]*display:\s*none/)
})

test('Writing list aligns with its title and uses evenly spaced label-style hover surfaces', async () => {
  const postCardStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'PostCard.module.css'), 'utf8')

  assert.doesNotMatch(postCardStyles, /content:\s*"\+"/)
  assert.doesNotMatch(postCardStyles, /border-(top|bottom):/)
  assert.match(postCardStyles, /\.postCard\[data-type='blog'\] \.content\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[^}]*padding-block:\s*0/)
  assert.match(postCardStyles, /\.postCard\[data-type='blog'\] \.content::after\s*\{[^}]*inset:\s*-20px/)
  assert.match(postCardStyles, /\.postCard\[data-type='blog'\]\s*\+\s*\.postCard\[data-type='blog'\]\s*\{[^}]*margin-top:\s*40px/)
})

test('Work and Writing rail labels have no underlines', async () => {
  const railStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'), 'utf8')

  assert.match(railStyles, /\.navigation a\s*\{[^}]*text-decoration:\s*none/)
})

test('Work and Writing rail labels suppress the global hover underline', async () => {
  const railStyles = await readFile(path.join(process.cwd(), 'src', 'components', 'navigation', 'PortfolioRail.module.css'), 'utf8')

  assert.match(railStyles, /\.navigation a:hover\s*\{[^}]*text-decoration:\s*none/)
})

test('Pointer focus does not show the keyboard focus outline', async () => {
  const globalCss = await readFile(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')

  assert.match(globalCss, /\*:focus:not\(:focus-visible\)\s*\{[^}]*outline:\s*none/)
})

test('Home and Work expose independent transition regions for the shared layout handoff', async () => {
  const [homeResponse, workResponse] = await Promise.all([fetch(baseUrl), fetch(url)])
  const [homeHtml, workHtml] = await Promise.all([homeResponse.text(), workResponse.text()])

  assert.equal(homeResponse.status, 200)
  assert.equal(workResponse.status, 200)
  assert.match(homeHtml, /data-transition-role="identity"/)
  assert.match(homeHtml, /data-transition-role="intro-copy"/)
  assert.match(homeHtml, /data-transition-role="navigation"/)
  assert.match(workHtml, /data-transition-role="work-content"/)
  assert.match(workHtml, /data-transition-role="contents"/)
})

test('Home and Work navigation has no route-transition choreography', async () => {
  const workLink = await readFile(
    path.join(process.cwd(), 'src', 'components', 'home', 'WorkNavigationLink.tsx'),
    'utf8',
  )
  const homeStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'page.module.css'), 'utf8')
  const workStyles = await readFile(path.join(process.cwd(), 'src', 'app', 'case-studies', 'page.module.css'), 'utf8')

  assert.doesNotMatch(workLink, /setTimeout/)
  assert.doesNotMatch(workLink, /pageTransition/)
  assert.doesNotMatch(homeStyles, /data-page-transition/)
  assert.doesNotMatch(workStyles, /work-content-enter|contents-enter/)
})

test('Home retains the scroll-controlled purple quote inside its transition copy', async () => {
  const response = await fetch(baseUrl)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /data-testid="kinetic-quote"/)
})

test('Case-study titles use title case without changing acronym styling in body copy', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /<title>Swatch \| Jaynish Shah<\/title>/)
  assert.match(html, /<h1[^>]*>Swatch<\/h1>/)
  assert.match(html, /SWATCH is Nykaa/)
})

test('Work keeps its compact heading without a supplementary label', async () => {
  const [workResponse, homeResponse] = await Promise.all([fetch(url), fetch(baseUrl)])
  const [workHtml, homeHtml] = await Promise.all([workResponse.text(), homeResponse.text()])

  assert.equal(workResponse.status, 200)
  assert.equal(homeResponse.status, 200)
  assert.match(workHtml, /<h1[^>]*>Work<\/h1>/)
  assert.doesNotMatch(workHtml, /Systems in practice/)
  assert.doesNotMatch(homeHtml, /Systems in practice/)
})

test('Home navigation renders Material arrow icons at responsive display sizes', async () => {
  const response = await fetch(baseUrl)
  const html = await response.text()
  const emittedCss = await getEmittedCss(baseUrl)
  const arrowClass = html.match(
    /class="material-symbols-outlined ([^"]+)"[^>]*aria-hidden="true">arrow_right_alt<\/span>/,
  )?.[1]

  assert.equal(response.status, 200)
  assert.ok(arrowClass)
  assert.match(
    html,
    /class="[^"]*material-symbols-outlined[^"]*"[^>]*aria-hidden="true">arrow_right_alt<\/span>/,
  )
  assert.doesNotMatch(html, /aria-hidden="true">→<\/span>/)
  assert.match(
    emittedCss,
    new RegExp(`\\.${arrowClass}\\s*\\{[^}]*font-size:\\s*40px`),
  )
  assert.match(
    emittedCss,
    new RegExp(`@media\\s*\\(max-width:\\s*767px\\)[\\s\\S]*?\\.${arrowClass}\\s*\\{[^}]*font-size:\\s*28px`),
  )
})

test('Work media uses the Figma card proportion while retaining the shared action treatment', async () => {
  const response = await fetch(url)
  const html = await response.text()
  const emittedCss = await getEmittedCss()
  const closeClass = html.match(/class="([^"]+)" aria-label="Close Work"/)?.[1]
  const imageFrameClass = html.match(/class="([^"]+)" aria-label="View Swatch case study"/)?.[1]

  assert.ok(closeClass)
  assert.ok(imageFrameClass)
  assert.match(emittedCss, /--interactive-surface-background:\s*rgba\(0,\s*0,\s*0,\s*0\.04\)/)
  assert.match(emittedCss, /--interactive-surface-content-scale:\s*0\.992/)
  assert.match(
    emittedCss,
    /\[data-ui-action\]\s*\{[^}]*--action-surface-background:\s*var\(--interactive-surface-background\)/,
  )
  assert.match(
    emittedCss,
    /\[data-ui-action\]\[data-action-variant=['"]media['"]\]\s*\{[^}]*background:\s*var\(--action-media-background,\s*var\(--action-surface-background\)\)/,
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${imageFrameClass}\\s*\\{[^}]*aspect-ratio:\\s*1\\.827\\s*\\/\\s*1[^}]*display:\\s*block`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${closeClass}\\s*\\{[^}]*color:\\s*var\\(--portfolio-foreground[^}]*text-decoration:\\s*none`),
  )
  assert.match(
    emittedCss,
    /\[data-ui-action\]\[data-action-variant=['"]icon['"]\]::after\s*\{[^}]*background:\s*var\(--action-surface-background\)/,
  )
  assert.match(emittedCss, /border-radius:\s*4px/)
  assert.match(emittedCss, /inset 0 0 10px/)
  assert.match(emittedCss, /transform:\s*scale\(var\(--action-content-scale\)\)/)
  assert.match(emittedCss, /\(hover:\s*hover\)[^{]*\(pointer:\s*fine\)/)
  assert.match(emittedCss, /prefers-reduced-motion:\s*reduce/)
})

test('Site serves the outlined Material Symbols font unfilled', async () => {
  const emittedCss = await getEmittedCss()

  assert.match(emittedCss, /font-family:\s*["']Material Symbols Outlined["']/)
  assert.match(emittedCss, /\.material-symbols-outlined\s*\{[^}]*font-weight:\s*200/)
  assert.match(emittedCss, /font-variation-settings:\s*["']FILL["'] 0/)
})

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
  assert.match(workCss, /grid-template-columns:\s*199px\s+minmax\(0,\s*866px\)\s+166px/)
})

test('site exposes reusable display type and action primitives', async () => {
  const [homeResponse, workResponse, detailResponse, aboutResponse] = await Promise.all([
    fetch(baseUrl),
    fetch(url),
    fetch(`${url}/swatch`),
    fetch(`${baseUrl}/about`),
  ])
  const [homeHtml, workHtml, detailHtml, aboutHtml] = await Promise.all([
    homeResponse.text(),
    workResponse.text(),
    detailResponse.text(),
    aboutResponse.text(),
  ])
  const [homeCss, workCss, detailCss] = await Promise.all([
    getEmittedCss(baseUrl),
    getEmittedCss(url),
    getEmittedCss(`${url}/swatch`),
  ])

  for (const css of [homeCss, workCss, detailCss]) {
    assert.match(css, /--type-h1:\s*clamp\([^;]*4\.5rem\)/)
    assert.match(css, /--type-h2:\s*clamp\([^;]*3\.5rem\)/)
    assert.match(css, /--type-h3:\s*clamp\([^;]*2\.4375rem\)/)
    assert.match(css, /\[data-ui-action\]/)
    assert.match(css, /\[data-action-variant=['"]icon['"]\]/)
    assert.match(css, /\[data-action-variant=['"]media['"]\]/)
    assert.match(css, /\[data-action-variant=['"]row['"]\]/)
  }

  assert.match(homeHtml, /data-ui-action="true" data-action-variant="row"/)
  assert.match(workHtml, /aria-label="Close Work"[^>]*data-ui-action="true"[^>]*data-action-variant="row"/)
  assert.match(workHtml, /aria-label="View Swatch case study"[^>]*data-ui-action="true"[^>]*data-action-variant="media"/)
  assert.match(detailHtml, /aria-label="Back to Work"/)
  assert.match(homeHtml, /<a(?=[^>]*data-ui-action="true")(?=[^>]*href="\/about")[^>]*>/)
  assert.match(aboutHtml, /<a(?=[^>]*data-ui-action="true")(?=[^>]*href="https:\/\/www\.instagram\.com\/p\/CtOn5DFoLPw\/\?img_index=1")[^>]*>/)
})

test('Swatch renders the new local case-study shell without legacy chrome', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()
  const css = await getEmittedCss(`${url}/swatch`)
  const metaClass = html.match(/<p class="([^"]+)">2021-2022/)?.[1]
  const titleClass = html.match(/<h1 class="([^"]+)">Swatch<\/h1>/)?.[1]

  assert.equal(response.status, 200)
  assert.match(html, /class="[^"]*case-study-page[^"]*"/)
  assert.match(
    html,
    /<a(?=[^>]*href="\/case-studies")(?=[^>]*aria-label="Back to Work")[^>]*>/,
  )
  assert.match(html, /data-testid="portfolio-rail"/)
  assert.match(html, /<h1[^>]*>Swatch<\/h1>/)
  assert.match(html, /2021-2022/)
  assert.match(html, /Design Systems/)
  assert.doesNotMatch(html, /№ 003 · CASE/)
  assert.doesNotMatch(html, /Case study system brief/)
  assert.doesNotMatch(html, /#design system/)
  assert.doesNotMatch(html, /<header[^>]*data-site-header="true"[^>]*>/)
  assert.match(css, /body:has\(\.case-study-page\)\s*>\s*footer[^}]*display:\s*none/)
  assert.match(css, /--type-h1:\s*clamp\(3rem,\s*8vw,\s*4\.5rem\)/)
  assert.match(css, /--type-case-study-title:\s*clamp\(2\.25rem,\s*3\.125vw,\s*2\.5rem\)/)
  assert.ok(metaClass)
  assert.match(css, new RegExp(`\\.${metaClass}\\s*\\{[^}]*margin-bottom:\\s*24px`))
  assert.ok(titleClass)
  const caseStudyTitleRule = css.match(
    new RegExp(`\\.case-study-page\\s+\\.${titleClass}\\s*\\{([^}]*)\\}`),
  )?.[1]
  assert.ok(caseStudyTitleRule)
  assert.match(caseStudyTitleRule, /--heading-size:\s*var\(--type-case-study-title\)/)
  assert.match(css, /letter-spacing:\s*var\(--heading-tracking,\s*var\(--type-display-tracking\)\)/)
})

test('Swatch renders explicit responsive pictogram, section-lead, and media layouts', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()
  const css = await getEmittedCss(`${url}/swatch`)
  const caseStudyLayoutStyles = await readFile(
    path.join(process.cwd(), 'src/components/content/CaseStudyLayouts.module.css'),
    'utf8',
  )
  const mediaClass = html.match(
    /data-case-study-layout="media"[\s\S]*?<img class="([^"]+)"/,
  )?.[1]
  const featuredImageClass = html.match(
    /<div class="[^"]*featuredImage[^"]*"><img[^>]*class="([^"]*image[^"]*)"/,
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
  assert.match(css, /--type-h3:\s*clamp\(1\.75rem,\s*3vw,\s*2\.4375rem\)/)
  assert.doesNotMatch(css, /\[data-variant='case-study'\]\s*>\s*h2/)
  assert.match(css, /--type-case-study-section:\s*clamp\(2rem,\s*3\.1vw,\s*2\.5rem\)/)
  assert.match(css, /--type-h2:\s*clamp\(2\.75rem,\s*5vw,\s*3\.5rem\)/)
  assert.ok(mediaClass)
  assert.match(css, new RegExp(`\\.${mediaClass}\\s*\\{[^}]*border:\\s*0`))
  assert.ok(featuredImageClass)
  assert.match(
    css,
    new RegExp(`\\.${featuredImageClass}\\s*\\{[^}]*border:\\s*0`),
  )
  assert.match(css, /--case-study-content-max:\s*960px/)
  assert.match(css, /\.case-study-page\s+\.[^{]*shell[^}]*max-width:\s*var\(--case-study-content-max\)/)
  assert.match(caseStudyLayoutStyles, /\.mediaFigure\s*\{[^}]*width:\s*100%/)
})

test('Legacy singular case-study route redirects to the canonical detail route', async () => {
  const response = await fetch(`${baseUrl}/case-study/swatch`, { redirect: 'manual' })
  const location = response.headers.get('location')

  assert.equal(response.status, 308)
  assert.ok(location)
  assert.equal(new URL(location, baseUrl).pathname, '/case-studies/swatch')
})
