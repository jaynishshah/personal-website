import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/content'
import Image from 'next/image'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './page.module.css'

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy')

  return (
    <article className={styles.container}>
      {post.featuredImage && (
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
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <time dateTime={post.date} className={styles.date}>
            {formattedDate}
          </time>
          <h1 className={styles.title}>{post.title}</h1>
          {post.tags && post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.body}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  )
}

