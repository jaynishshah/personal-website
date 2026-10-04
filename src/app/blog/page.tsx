import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import PortfolioRail from '@/components/navigation/PortfolioRail'
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
    <main className={`${styles.container} writing-page`}>
      <PortfolioRail activeSection="writing" />
      <section className={styles.content} aria-labelledby="writing-title">
        <h1 id="writing-title" className={styles.title}>Writing</h1>
        <div className={styles.posts}>
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              summary={post.summary}
              tags={post.tags}
              type="blog"
            />
          ))}
        </div>
      </section>
    </main>
  )
}
