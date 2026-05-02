import type { Metadata } from 'next'
import { getCaseStudies } from '@/lib/content'
import PostCard from '@/components/PostCard'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Work',
  summary: 'Selected case studies from full-time design systems work across product teams.',
  path: '/case-studies',
})

export default function CaseStudiesPage() {
  const caseStudies = getCaseStudies()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Work</p>
        <h1 className={styles.title}>Selected design systems work across foundations, governance, and adoption.</h1>
        <p className={styles.summary}>
          Case studies from full-time product design systems work, focused on the mechanics that help teams ship coherent experiences at scale.
        </p>
        <div className={styles.caseStudies}>
          {caseStudies.map((caseStudy) => (
            <PostCard
              key={caseStudy.slug}
              title={caseStudy.title}
              slug={caseStudy.slug}
              date={caseStudy.date}
              summary={caseStudy.summary}
              type="case-study"
              company={caseStudy.company}
              role={caseStudy.role}
              year={caseStudy.year}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
