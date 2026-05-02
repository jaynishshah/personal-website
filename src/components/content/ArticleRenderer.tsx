import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { compile, run } from '@mdx-js/mdx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import * as runtime from 'react/jsx-runtime'
import styles from './ArticleBody.module.css'

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|ogg)$/i
const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)$/i

export interface ArticleRendererProps {
  content: string
  format: 'md' | 'mdx'
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

function isVideoAsset(src?: string) {
  return Boolean(src && VIDEO_EXTENSIONS.test(src))
}

function isImageAsset(src?: string) {
  return Boolean(src && IMAGE_EXTENSIONS.test(src))
}

function Figure({
  src,
  alt,
  caption,
}: {
  src: string
  alt?: string
  caption?: string
}) {
  return (
    <figure className={styles.figure}>
      <img src={src} alt={alt ?? ''} className={styles.media} loading="lazy" />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}

function Video({
  src,
  caption,
  poster,
}: {
  src: string
  caption?: string
  poster?: string
}) {
  return (
    <figure className={styles.figure}>
      <video className={styles.media} controls playsInline preload="metadata" poster={poster}>
        <source src={src} />
      </video>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}

function Callout({
  title,
  children,
  tone = 'note',
}: {
  title?: string
  children: ReactNode
  tone?: 'note' | 'warning'
}) {
  return (
    <aside className={styles.callout} data-tone={tone}>
      {title ? <p className={styles.calloutTitle}>{title}</p> : null}
      <div>{children}</div>
    </aside>
  )
}

function LinkRenderer({
  href,
  children,
  node: _node,
  ...props
}: ComponentPropsWithoutRef<'a'> & { node?: unknown }) {
  const resolvedHref = href ?? ''
  const external = isExternalHref(resolvedHref)

  return (
    <a
      href={resolvedHref}
      {...props}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

const markdownComponents = {
  a: LinkRenderer,
  img: ({ src, alt, title }: ComponentPropsWithoutRef<'img'>) => {
    const resolvedSrc = src ?? ''

    if (isVideoAsset(resolvedSrc)) {
      return <Video src={resolvedSrc} caption={title} />
    }

    if (isImageAsset(resolvedSrc)) {
      return <Figure src={resolvedSrc} alt={alt} caption={title} />
    }

    return <img src={resolvedSrc} alt={alt} title={title} loading="lazy" />
  },
  p: ({ node, children }: { node?: any; children?: ReactNode }) => {
    const child = node?.children?.[0]

    if (node?.children?.length === 1 && child?.type === 'element') {
      if (child.tagName === 'img') {
        return <>{children}</>
      }

      if (child.tagName === 'a') {
        const href = String(child.properties?.href ?? '')
        const textChild = child.children?.find((item: any) => item.type === 'text')
        const caption = textChild?.value && textChild.value !== href ? textChild.value : undefined

        if (isVideoAsset(href)) {
          return <Video src={href} caption={caption} />
        }
      }
    }

    return <p>{children}</p>
  },
}

const mdxComponents = {
  ...markdownComponents,
  Figure,
  Video,
  Callout,
}

async function renderMdx(content: string) {
  const compiled = await compile(content, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  })

  const evaluated = await run(compiled, {
    ...runtime,
    baseUrl: import.meta.url,
  })

  const MDXContent = evaluated.default

  return <MDXContent components={mdxComponents} />
}

export default async function ArticleRenderer({ content, format }: ArticleRendererProps) {
  return (
    <div className={styles.body}>
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
