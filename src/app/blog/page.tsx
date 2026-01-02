import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import styles from './page.module.css'

export default function BlogPage() {
  const posts = getBlogPosts()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Blog</h1>
        <div className={styles.posts}>
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              featuredImage={post.featuredImage}
              excerpt={post.description}
              tags={post.tags}
              type="blog"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

