import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'src/content')
const supportedContentExtensions = new Set(['.md', '.mdx'])

type ContentFormat = 'md' | 'mdx'

interface BaseContentEntry {
  slug: string
  title: string
  date: string
  summary: string
  featuredImage?: string
  tags: string[]
  draft: boolean
  canonicalUrl?: string
  content: string
  format: ContentFormat
  url: string
}

export interface BlogPost extends BaseContentEntry {
  type: 'blog'
}

export interface CaseStudy extends BaseContentEntry {
  type: 'case-study'
  company?: string
  role?: string
  year?: string
  status?: string
  previewImage?: string
  accentColor?: string
  systemLayers: string[]
  artifacts: string[]
  outcomes: string[]
}

function readCollectionFiles(collection: 'blog' | 'case-studies') {
  const directory = path.join(contentDirectory, collection)

  return fs
    .readdirSync(directory)
    .filter((file) => supportedContentExtensions.has(path.extname(file)))
    .map((file) => ({
      extension: path.extname(file) as `.${ContentFormat}`,
      filePath: path.join(directory, file),
      fileName: file,
    }))
}

function assertStringField(
  data: Record<string, unknown>,
  key: 'title' | 'slug' | 'date' | 'summary',
  filePath: string
) {
  const value = data[key]

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required frontmatter field "${key}" in ${filePath}`)
  }

  return value.trim()
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
}

function ensureValidDate(date: string, filePath: string) {
  if (Number.isNaN(new Date(date).getTime())) {
    throw new Error(`Invalid date "${date}" in ${filePath}`)
  }

  return date
}

function getPublishedEntries<T extends BaseContentEntry>(entries: T[]) {
  if (process.env.NODE_ENV === 'production') {
    return entries.filter((entry) => !entry.draft)
  }

  return entries
}

function getBlogPostsInternal(): BlogPost[] {
  const posts = readCollectionFiles('blog')
    .map(({ filePath, fileName, extension }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      const title = assertStringField(data, 'title', filePath)
      const slug = assertStringField(data, 'slug', filePath)
      const date = ensureValidDate(assertStringField(data, 'date', filePath), filePath)
      const summary = assertStringField(data, 'summary', filePath)
      const format = extension.replace('.', '') as ContentFormat

      if (!fileName.startsWith(slug)) {
        throw new Error(`Frontmatter slug "${slug}" does not match file name ${fileName}`)
      }

      return {
        type: 'blog' as const,
        slug,
        title,
        date,
        summary,
        featuredImage: asOptionalString(data.featuredImage),
        tags: asStringArray(data.tags),
        draft: Boolean(data.draft),
        canonicalUrl: asOptionalString(data.canonicalUrl),
        content,
        format,
        url: `/blog/${slug}`,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

function getCaseStudiesInternal(): CaseStudy[] {
  const caseStudies = readCollectionFiles('case-studies')
    .map(({ filePath, fileName, extension }) => {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      const title = assertStringField(data, 'title', filePath)
      const slug = assertStringField(data, 'slug', filePath)
      const date = ensureValidDate(assertStringField(data, 'date', filePath), filePath)
      const summary = assertStringField(data, 'summary', filePath)
      const format = extension.replace('.', '') as ContentFormat

      if (!fileName.startsWith(slug)) {
        throw new Error(`Frontmatter slug "${slug}" does not match file name ${fileName}`)
      }

      return {
        type: 'case-study' as const,
        slug,
        title,
        date,
        summary,
        featuredImage: asOptionalString(data.featuredImage),
        tags: asStringArray(data.tags),
        draft: Boolean(data.draft),
        canonicalUrl: asOptionalString(data.canonicalUrl),
        company: asOptionalString(data.company),
        role: asOptionalString(data.role),
        year: asOptionalString(data.year),
        status: asOptionalString(data.status),
        previewImage: asOptionalString(data.previewImage),
        accentColor: asOptionalString(data.accentColor),
        systemLayers: asStringArray(data.systemLayers),
        artifacts: asStringArray(data.artifacts),
        outcomes: asStringArray(data.outcomes),
        content,
        format,
        url: `/case-studies/${slug}`,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return caseStudies
}

export function getBlogPosts(): BlogPost[] {
  return getPublishedEntries(getBlogPostsInternal())
}

export function getBlogPost(slug: string): BlogPost | null {
  return getPublishedEntries(getBlogPostsInternal()).find((post) => post.slug === slug) ?? null
}

export function getCaseStudies(): CaseStudy[] {
  return getPublishedEntries(getCaseStudiesInternal())
}

export function getCaseStudy(slug: string): CaseStudy | null {
  return getPublishedEntries(getCaseStudiesInternal()).find((caseStudy) => caseStudy.slug === slug) ?? null
}
