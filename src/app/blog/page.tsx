import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import AxisDivider from '@/components/visual/AxisDivider'
import CornerBadge from '@/components/visual/CornerBadge'
import Crosshair from '@/components/visual/Crosshair'
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
        <header className={styles.header}>
          <CornerBadge className={styles.badge}>№ 006 · NOTES</CornerBadge>
          <Crosshair className={styles.crosshair} />
          <p className={styles.eyebrow}>Writing</p>
          <h1 className={styles.title}>Notes on systems, components, and design practice.</h1>
          <p className={styles.summary}>
            Essays and working notes about the details that make design systems useful: component APIs, contribution models, documentation, and craft at scale.
          </p>
        </header>
        <AxisDivider label="Writing index" index="01" />
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
