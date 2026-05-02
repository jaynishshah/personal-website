import Link from 'next/link'
import { format } from 'date-fns'
import styles from './PostCard.module.css'

export interface PostCardProps {
  title: string
  slug: string
  date: string
  summary?: string
  tags?: string[]
  type?: 'blog' | 'case-study'
  company?: string
  role?: string
  year?: string
}

export default function PostCard({
  title,
  slug,
  date,
  summary,
  tags,
  type = 'blog',
  company,
  role,
  year,
}: PostCardProps) {
  const href = type === 'blog' ? `/blog/${slug}` : `/case-studies/${slug}`
  const formattedDate = format(new Date(date), 'MMM d, yyyy')
  const primaryMeta = type === 'case-study' ? [company, role, year].filter(Boolean).join(' / ') : formattedDate

  return (
    <article className={styles.postCard}>
      <div className={styles.content}>
        <div className={styles.main}>
          <h2 className={styles.title}>
            <Link href={href}>{title}</Link>
          </h2>
          {primaryMeta && <p className={styles.primaryMeta}>{primaryMeta}</p>}
          {summary && <p className={styles.excerpt}>{summary}</p>}
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
            {type === 'case-study' ? 'Case study' : formattedDate}
          </time>
        </div>
      </div>
    </article>
  )
}
