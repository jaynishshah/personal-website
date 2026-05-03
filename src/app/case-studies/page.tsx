import type { Metadata } from 'next'
import { getCaseStudies } from '@/lib/content'
import CaseStudyCard from '@/components/CaseStudyCard'
import AxisDivider from '@/components/visual/AxisDivider'
import CornerBadge from '@/components/visual/CornerBadge'
import Crosshair from '@/components/visual/Crosshair'
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
        <header className={styles.header}>
          <CornerBadge className={styles.badge}>№ 002 · WORK</CornerBadge>
          <Crosshair className={styles.crosshair} />
          <p className={styles.eyebrow}>Work</p>
          <h1 className={styles.title}>Selected design systems work across foundations, governance, and adoption.</h1>
          <p className={styles.summary}>
            Case studies from full-time product design systems work, focused on the mechanics that help teams ship coherent experiences at scale.
          </p>
        </header>
        <AxisDivider label="Case-study index" index="01" />
        <div className={styles.caseStudies}>
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} featured={caseStudies.length === 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
