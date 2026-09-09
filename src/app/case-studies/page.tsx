import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
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
  const contents = [
    ...caseStudies.map((caseStudy) => caseStudy.title),
    'Repairing design systems at Ticketmaster',
    'Making Design System at Ticketmaster AI-ready',
  ]

  return (
    <main className={`${styles.container} work-page`} data-testid="work-layout">
      <header className={styles.identityRail} data-testid="work-identity-rail">
        <Link href="/" className={styles.close} aria-label="Close Work" data-ui-action data-action-variant="row">
          Hi. I’m Jaynish.
        </Link>
        <nav className={styles.sectionNavigation} aria-label="Portfolio sections">
          <Link href="/case-studies" className={styles.activeSection}>Work</Link>
          <Link href="/blog">Writing</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

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

      <aside className={styles.contentsRail} data-testid="work-contents-rail" data-transition-role="contents" aria-label="Case study contents">
        <p className={styles.contentsTitle}>Contents</p>
        <ol className={styles.contentsList}>
          {contents.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </aside>
    </main>
  )
}
