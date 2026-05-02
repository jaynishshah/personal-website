import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/content'
import Image from 'next/image'
import { format } from 'date-fns'
import ArticleRenderer from '@/components/content/ArticleRenderer'
import pageStyles from '@/components/content/ArticlePage.module.css'
import { buildPageMetadata } from '@/lib/metadata'

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

  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy')

  return (
    <article className={pageStyles.container}>
      {post.featuredImage && (
        <div className={pageStyles.featuredImage}>
          <Image
            src={post.featuredImage}
            alt={post.title}
            width={2400}
            height={1200}
            priority
            className={pageStyles.image}
          />
        </div>
      )}
      <div className={pageStyles.content}>
        <div className={pageStyles.header}>
          <time dateTime={post.date} className={pageStyles.date}>
            {formattedDate}
          </time>
          <h1 className={pageStyles.title}>{post.title}</h1>
          <p className={pageStyles.summary}>{post.summary}</p>
          {post.tags && post.tags.length > 0 && (
            <div className={pageStyles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={pageStyles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArticleRenderer content={post.content} format={post.format} />
      </div>
    </article>
  )
}
