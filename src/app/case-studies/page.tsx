import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PortfolioRail from '@/components/navigation/PortfolioRail'
import { getCaseStudies } from '@/lib/content'
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
    <main className={`${styles.container} work-page`} data-testid="work-layout">
      <PortfolioRail activeSection="work" />

      <section className={styles.content} aria-labelledby="work-title" data-transition-role="work-content">
        <h1 id="work-title" className={styles.title}>Work</h1>
        <div className={styles.caseStudies}>
          {caseStudies.map((caseStudy) => {
            const image = caseStudy.previewImage ?? caseStudy.featuredImage

            return (
              <article className={styles.caseStudy} key={caseStudy.slug}>
                {image ? (
                  <Link
                    href={caseStudy.url}
                    className={styles.imageFrame}
                    aria-label={`View ${caseStudy.title} case study`}
                    data-ui-action
                    data-action-variant="media"
                  >
                    <Image
                      src={image}
                      alt=""
                      width={1600}
                      height={900}
                      className={styles.image}
                      data-action-content
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </Link>
                ) : null}
                <h2 className={styles.caseStudyTitle}>
                  <Link href={caseStudy.url} data-ui-action>{caseStudy.title}</Link>
                </h2>
                <p className={styles.caseStudySummary}>
                  {caseStudy.slug === 'swatch'
                    ? 'Building Design system at Nykaa, India’s leading lifestyle and ecommerce brand.'
                    : caseStudy.summary}
                </p>
              </article>
            )
          })}
        </div>
      </section>

    </main>
  )
}
