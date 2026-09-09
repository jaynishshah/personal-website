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

test('Work identity and section links share the text-width close-button hover surface', async () => {
  const workStyles = await readFile(
    path.join(process.cwd(), 'src', 'app', 'case-studies', 'page.module.css'),
    'utf8',
  )

  assert.match(
    workStyles,
    /\.close,\s*\.sectionNavigation a\s*\{[^}]*isolation:\s*isolate[^}]*width:\s*fit-content/,
  )
  assert.match(workStyles, /\.close::after,\s*\.sectionNavigation a::after/)
  assert.match(
    workStyles,
    /@media \(hover: hover\) and \(pointer: fine\)\s*\{[\s\S]*\.close:hover::after,[\s\S]*\.sectionNavigation a:hover::after/,
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
  assert.match(html, /data-testid="work-identity-rail"/)
  assert.match(html, /Hi\. I’m Jaynish\./)
  assert.match(html, /<nav[^>]*aria-label="Portfolio sections"/)
  assert.match(html, /data-testid="work-contents-rail"/)
  assert.match(html, />Contents</)
  assert.match(html, /Repairing design systems at Ticketmaster/)
  assert.match(html, /Making Design System at Ticketmaster AI-ready/)
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
    new RegExp(`\\.${closeClass}\\s*\\{[^}]*background:\\s*transparent[^}]*color:\\s*var\\(--work-foreground\\)[^}]*text-decoration:\\s*none`),
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
  assert.match(detailHtml, /aria-label="Close case study"[^>]*data-ui-action="true"[^>]*data-action-variant="icon"/)
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
    /<a(?=[^>]*href="\/case-studies")(?=[^>]*aria-label="Close case study")[^>]*>/,
  )
  assert.match(html, /Case study/)
  assert.match(html, /<h1[^>]*>Swatch<\/h1>/)
  assert.match(html, /2021-2022/)
  assert.match(html, /Design Systems/)
  assert.doesNotMatch(html, /№ 003 · CASE/)
  assert.doesNotMatch(html, /Case study system brief/)
  assert.doesNotMatch(html, /#design system/)
  assert.match(html, /<header[^>]*data-site-header="true"[^>]*>/)
  assert.match(html, /Jaynish Shah/)
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
  const caseStudyH2Rule = css.match(
    /\[data-variant='case-study'\]\s*>\s*h2\s*\{([^}]*)\}/,
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
  assert.ok(caseStudyH2Rule)
  assert.match(caseStudyH2Rule, /--heading-size:\s*var\(--type-case-study-section\)/)
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
