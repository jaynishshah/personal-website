import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
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
    <>
      <Header currentSection="work" currentTitle="Work" />
      <main>
        <div className={`${styles.container} work-page`}>
          <div className={styles.content}>
            <header className={styles.header}>
              <h1 className={styles.title}>Work</h1>
            </header>
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
                      >
                        <Image
                          src={image}
                          alt=""
                          width={1600}
                          height={900}
                          className={styles.image}
                          sizes="(min-width: 768px) 50vw, 100vw"
                        />
                      </Link>
                    ) : null}
                    <h2 className={styles.caseStudyTitle}>
                      <Link href={caseStudy.url}>{caseStudy.title}</Link>
                    </h2>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
