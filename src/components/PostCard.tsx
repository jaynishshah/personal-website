import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import styles from './PostCard.module.css'

export interface PostCardProps {
  title: string
  slug: string
  date: string
  featuredImage?: string
  excerpt?: string
  tags?: string[]
  type?: 'blog' | 'case-study'
}

export default function PostCard({
  title,
  slug,
  date,
  featuredImage,
  excerpt,
  tags,
  type = 'blog',
}: PostCardProps) {
  const href = type === 'blog' ? `/blog/${slug}` : `/case-study/${slug}`
  const formattedDate = format(new Date(date), 'MMM d, yyyy')

  return (
    <article className={styles.postCard}>
      <hr className={styles.separator} />
      <div className={styles.content}>
        <div className={styles.main}>
          <h2 className={styles.title}>
            <Link href={href}>{title}</Link>
          </h2>
          {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
          {tags && tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <time dateTime={date} className={styles.date}>
            {formattedDate}
          </time>
        </div>
      </div>
    </article>
  )
}

