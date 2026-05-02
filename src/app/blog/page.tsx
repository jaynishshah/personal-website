import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Writing',
  summary: 'Writing on design systems, component architecture, and product design.',
  path: '/blog',
})

export default function BlogPage() {
  const posts = getBlogPosts()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Writing</p>
        <h1 className={styles.title}>Notes on systems, components, and design practice.</h1>
        <p className={styles.summary}>
          Essays and working notes about the details that make design systems useful: component APIs, contribution models, documentation, and craft at scale.
        </p>
        <div className={styles.posts}>
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              summary={post.summary}
              type="blog"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
