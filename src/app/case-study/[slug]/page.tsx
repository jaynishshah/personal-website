import { notFound } from 'next/navigation'
import { getCaseStudy, getCaseStudies } from '@/lib/content'
import Image from 'next/image'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './page.module.css'

export async function generateStaticParams() {
  const caseStudies = getCaseStudies()
  return caseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
  }))
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const caseStudy = getCaseStudy(params.slug)

  if (!caseStudy) {
    notFound()
  }

  const formattedDate = format(new Date(caseStudy.date), 'MMMM d, yyyy')

  return (
    <article className={styles.container}>
      {caseStudy.featuredImage && (
        <div className={styles.featuredImage}>
          <Image
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            width={2400}
            height={1200}
            priority
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <time dateTime={caseStudy.date} className={styles.date}>
            {formattedDate}
          </time>
          <h1 className={styles.title}>{caseStudy.title}</h1>
          {caseStudy.tags && caseStudy.tags.length > 0 && (
            <div className={styles.tags}>
              {caseStudy.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.body}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{caseStudy.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  )
}

