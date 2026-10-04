import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/content'
import Image from 'next/image'
import { format } from 'date-fns'
import Link from 'next/link'
import ArticleRenderer from '@/components/content/ArticleRenderer'
import ArticlePageTemplate from '@/components/content/ArticlePageTemplate'
import { extractArticleHeadings } from '@/lib/articleHeadings'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)

  if (!post) {
    return {}
  }

  return buildPageMetadata({
    title: post.title,
    summary: post.summary,
    path: post.url,
    image: post.featuredImage,
    type: 'article',
    publishedTime: post.date,
    tags: post.tags,
    canonicalUrl: post.canonicalUrl,
  })
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const formattedDate = format(new Date(post.date), 'MMM d, yyyy')
  const headings = extractArticleHeadings(post.content)

  return (
    <ArticlePageTemplate
      activeSection="writing"
      className={`${styles.container} blog-post-page`}
      headings={headings}
      backControl={<Link href="/blog" className={styles.backLink} aria-label="Back to Writing">
          <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          Back to Writing
        </Link>}
      featured={post.featuredImage ? (
          <div className={styles.featuredImage}>
            <Image
              src={post.featuredImage}
              alt={post.title}
              width={2400}
              height={1200}
              priority
              className={styles.image}
            />
          </div>
      ) : undefined}
      header={<header id="article-overview" className={styles.postHeader}>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <p className={styles.summary}>{post.summary}</p>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formattedDate}</time>
            {post.tags?.map((tag) => (
              <span key={tag}>
                <span className={styles.metaSeparator} aria-hidden="true"> • </span>
                {tag}
              </span>
            ))}
          </div>
        </header>}
      body={<ArticleRenderer content={post.content} format={post.format} className={styles.articleBody} />}
    />
  )
}
