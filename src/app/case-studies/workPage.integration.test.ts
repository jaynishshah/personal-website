import assert from 'node:assert/strict'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
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
  server?.kill('SIGTERM')
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

function getSiteHeader(html: string) {
  const header = html.match(/<header[^>]*data-site-header="true"[^>]*>[\s\S]*?<\/header>/)?.[0]

  assert.ok(header, 'Expected the page to render the shared site header')
  return header
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

test('Work route renders a dedicated image-led case-study index', async () => {
  const response = await fetch(url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /class="[^"]*work-page[^"]*"/)
  assert.match(html, /<h1[^>]*>Work<\/h1>/)
  assert.doesNotMatch(html, /aria-label="Close Work"/)
  assert.match(html, /aria-label="View Swatch case study"/)
  assert.match(html, /<h2[^>]*>.*Swatch.*<\/h2>/)
  assert.doesNotMatch(html, /Systems in practice/)
  assert.doesNotMatch(html, /Case-study index/)
  assert.doesNotMatch(html, /SWATCH is Nykaa&#x27;s multi-brand design system/)
  assert.doesNotMatch(html, /Selected design systems work across foundations, governance, and adoption\./)
})

test('Home omits the site header while section pages show their current context and remaining links', async () => {
  const [homeResponse, workResponse, writingResponse, aboutResponse] = await Promise.all([
    fetch(baseUrl),
    fetch(url),
    fetch(`${baseUrl}/blog`),
    fetch(`${baseUrl}/about`),
  ])
  const [homeHtml, workHtml, writingHtml, aboutHtml] = await Promise.all([
    homeResponse.text(),
    workResponse.text(),
    writingResponse.text(),
    aboutResponse.text(),
  ])

  assert.doesNotMatch(homeHtml, /data-site-header="true"/)

  const workHeader = getSiteHeader(workHtml)
  assert.ok(workHtml.indexOf(workHeader) < workHtml.indexOf('<main>'))
  assert.match(workHeader, /<a[^>]*href="\/"[^>]*>Jaynish Shah<\/a>/)
  assert.match(workHeader, /<span[^>]*aria-current="page"[^>]*>Work<\/span>/)
  assert.doesNotMatch(workHeader, /<a href="\/case-studies">Work<\/a>/)
  assert.match(workHeader, /<a href="\/blog">Writing<\/a>/)
  assert.match(workHeader, /<a href="\/about">About<\/a>/)
  assert.doesNotMatch(workHeader, /Switch to (?:light|dark) mode/)

  const writingHeader = getSiteHeader(writingHtml)
  assert.match(writingHeader, /<span[^>]*aria-current="page"[^>]*>Writing<\/span>/)
  assert.match(writingHeader, /<a href="\/case-studies">Work<\/a>/)
  assert.doesNotMatch(writingHeader, /<a href="\/blog">Writing<\/a>/)
  assert.match(writingHeader, /<a href="\/about">About<\/a>/)

  const aboutHeader = getSiteHeader(aboutHtml)
  assert.match(aboutHeader, /<span[^>]*aria-current="page"[^>]*>About<\/span>/)
  assert.match(aboutHeader, /<a href="\/case-studies">Work<\/a>/)
  assert.match(aboutHeader, /<a href="\/blog">Writing<\/a>/)
  assert.doesNotMatch(aboutHeader, /<a href="\/about">About<\/a>/)
})

test('Now keeps site navigation without marking a portfolio section as selected', async () => {
  const response = await fetch(`${baseUrl}/now`)
  const html = await response.text()
  const header = getSiteHeader(html)

  assert.equal(response.status, 200)
  assert.ok(html.indexOf(header) < html.indexOf('<main>'))
  assert.match(header, /<span[^>]*aria-current="page"[^>]*>Now<\/span>/)
  assert.match(header, /<a href="\/case-studies">Work<\/a>/)
  assert.match(header, /<a href="\/blog">Writing<\/a>/)
  assert.match(header, /<a href="\/about">About<\/a>/)
})

test('Detail pages replace the section label with a muted non-link title', async () => {
  const [caseStudyResponse, blogPostResponse] = await Promise.all([
    fetch(`${url}/swatch`),
    fetch(`${baseUrl}/blog/component-api-for-designers`),
  ])
  const [caseStudyHtml, blogPostHtml] = await Promise.all([
    caseStudyResponse.text(),
    blogPostResponse.text(),
  ])

  const caseStudyHeader = getSiteHeader(caseStudyHtml)
  assert.match(caseStudyHeader, /<span[^>]*data-muted="true"[^>]*>Swatch<\/span>/)
  assert.doesNotMatch(caseStudyHeader, /<a[^>]*>Swatch<\/a>/)
  assert.doesNotMatch(caseStudyHeader, /<a href="\/case-studies">Work<\/a>/)
  assert.match(caseStudyHeader, /<a href="\/blog">Writing<\/a>/)
  assert.match(caseStudyHeader, /<a href="\/about">About<\/a>/)

  const blogPostHeader = getSiteHeader(blogPostHtml)
  assert.match(blogPostHeader, /<span[^>]*data-muted="true"[^>]*>Component API : For Designers<\/span>/)
  assert.doesNotMatch(blogPostHeader, /<a[^>]*>Component API : For Designers<\/a>/)
  assert.match(blogPostHeader, /<a href="\/case-studies">Work<\/a>/)
  assert.doesNotMatch(blogPostHeader, /<a href="\/blog">Writing<\/a>/)
  assert.match(blogPostHeader, /<a href="\/about">About<\/a>/)
})

test('Long detail titles truncate without shrinking navigation and cannot be selected', async () => {
  const pageUrl = `${baseUrl}/blog/component-api-for-designers`
  const response = await fetch(pageUrl)
  const html = await response.text()
  const header = getSiteHeader(html)
  const emittedCss = await getEmittedCss(pageUrl)
  const identityClass = header.match(/<div class="([^"]+)"><a[^>]*href="\/"/)?.[1]
  const titleClass = header.match(/<span class="([^"]+)" data-muted="true"/)?.[1]
  const navClass = header.match(/<nav class="([^"]+)" aria-label="Primary navigation"/)?.[1]

  assert.ok(identityClass)
  assert.ok(titleClass)
  assert.ok(navClass)
  assert.match(emittedCss, new RegExp(`\\.${identityClass}\\s*\\{[^}]*min-width:\\s*0`))
  assert.match(emittedCss, new RegExp(`\\.${navClass}\\s*\\{[^}]*flex:\\s*0 0 auto`))
  assert.match(
    emittedCss,
    new RegExp(`\\.${titleClass}\\s*\\{[^}]*overflow:\\s*hidden[^}]*text-overflow:\\s*ellipsis[^}]*white-space:\\s*nowrap`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${titleClass}\\[data-muted=['"]?true['"]?\\]\\s*\\{[^}]*user-select:\\s*none`),
  )
})

test('Case-study titles use title case without changing acronym styling in body copy', async () => {
  const response = await fetch(`${url}/swatch`)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /<title>Swatch \| Jaynish Shah<\/title>/)
  assert.match(html, /<h1[^>]*>Swatch<\/h1>/)
  assert.match(html, /SWATCH is Nykaa/)
})

test('Systems in practice is removed from Home navigation and the simplified Work heading', async () => {
  const [workResponse, homeResponse] = await Promise.all([fetch(url), fetch(baseUrl)])
  const [workHtml, homeHtml] = await Promise.all([workResponse.text(), homeResponse.text()])

  assert.equal(workResponse.status, 200)
  assert.equal(homeResponse.status, 200)
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

test('Work media keeps its interactive surface treatment', async () => {
  const response = await fetch(url)
  const html = await response.text()
  const emittedCss = await getEmittedCss()
  const imageFrameClass = html.match(/class="([^"]+)" aria-label="View Swatch case study"/)?.[1]

  assert.ok(imageFrameClass)
  assert.match(emittedCss, /--interactive-surface-background:\s*rgba\(0,\s*0,\s*0,\s*0\.04\)/)
  assert.match(emittedCss, /--interactive-surface-content-scale:\s*0\.992/)
  assert.match(
    emittedCss,
    new RegExp(`\\.${imageFrameClass}\\s*\\{[^}]*background:\\s*var\\(--interactive-surface-background\\)`),
  )
  assert.match(emittedCss, /border-radius:\s*4px/)
  assert.match(emittedCss, /inset 0 0 10px/)
  assert.match(
    emittedCss,
    /transform:\s*scale\(var\(--interactive-surface-content-scale\)\)/,
  )
  assert.match(emittedCss, /\(hover:\s*hover\)[^{]*\(pointer:\s*fine\)/)
  assert.match(emittedCss, /prefers-reduced-motion:\s*reduce/)
})

test('Site serves the outlined Material Symbols font unfilled', async () => {
  const emittedCss = await getEmittedCss()

  assert.match(emittedCss, /font-family:\s*["']Material Symbols Outlined["']/)
  assert.match(emittedCss, /\.material-symbols-outlined\s*\{[^}]*font-weight:\s*200/)
  assert.match(emittedCss, /font-variation-settings:\s*["']FILL["'] 0/)
})
