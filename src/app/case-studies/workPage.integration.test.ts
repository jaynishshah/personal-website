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

async function getEmittedCss() {
  const response = await fetch(url)
  const html = await response.text()
  const stylesheetPaths = [...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"[^>]*>/g)].map(
    ([, href]) => href,
  )

  assert.ok(stylesheetPaths.length > 0)

  const stylesheets = await Promise.all(
    stylesheetPaths.map(async (href) => {
      const stylesheetResponse = await fetch(new URL(href, url))
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

test('Work route renders a dedicated image-led case-study index', async () => {
  const response = await fetch(url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /class="[^"]*work-page[^"]*"/)
  assert.match(html, /<h1[^>]*>Work<\/h1>/)
  assert.match(html, /aria-label="Close Work"/)
  assert.match(html, /aria-label="View SWATCH case study"/)
  assert.match(html, /<h2[^>]*>.*SWATCH.*<\/h2>/)
  assert.doesNotMatch(html, /Case-study index/)
  assert.doesNotMatch(html, /SWATCH is Nykaa&#x27;s multi-brand design system/)
  assert.doesNotMatch(html, /Selected design systems work across foundations, governance, and adoption\./)
})

test('Systems in practice moves from Home navigation into the Work heading', async () => {
  const [workResponse, homeResponse] = await Promise.all([fetch(url), fetch(baseUrl)])
  const [workHtml, homeHtml] = await Promise.all([workResponse.text(), homeResponse.text()])

  assert.equal(workResponse.status, 200)
  assert.equal(homeResponse.status, 200)
  assert.match(workHtml, /Systems in practice/)
  assert.doesNotMatch(homeHtml, /Systems in practice/)
})

test('Work media keeps its surface while the transparent close control reveals one on hover', async () => {
  const response = await fetch(url)
  const html = await response.text()
  const emittedCss = await getEmittedCss()
  const closeClass = html.match(/class="([^"]+)" aria-label="Close Work"/)?.[1]
  const imageFrameClass = html.match(/class="([^"]+)" aria-label="View SWATCH case study"/)?.[1]

  assert.ok(closeClass)
  assert.ok(imageFrameClass)
  assert.match(emittedCss, /--interactive-surface-background:\s*rgba\(0,\s*0,\s*0,\s*0\.04\)/)
  assert.match(emittedCss, /--interactive-surface-content-scale:\s*0\.992/)
  assert.match(
    emittedCss,
    new RegExp(`\\.${imageFrameClass}\\s*\\{[^}]*background:\\s*var\\(--interactive-surface-background\\)`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${closeClass}\\s*\\{[^}]*background:\\s*transparent[^}]*color:\\s*var\\(--work-foreground\\)[^}]*text-decoration:\\s*none`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${closeClass}:hover\\s*\\{[^}]*color:\\s*var\\(--work-foreground\\)[^}]*text-decoration:\\s*none`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${closeClass}::after\\s*\\{[^}]*background:\\s*var\\(--interactive-surface-background\\)`),
  )
  assert.match(
    emittedCss,
    new RegExp(`\\.${closeClass}:hover::after[^\\{]*\\{[^}]*opacity:\\s*1`),
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
