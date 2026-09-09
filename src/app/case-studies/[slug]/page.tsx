import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseStudy, getCaseStudies } from '@/lib/content'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import ArticleRenderer from '@/components/content/ArticleRenderer'
import pageStyles from '@/components/content/ArticlePage.module.css'
import { buildPageMetadata } from '@/lib/metadata'

export async function generateStaticParams() {
  const caseStudies = getCaseStudies()
  return caseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const caseStudy = getCaseStudy(params.slug)

  if (!caseStudy) {
    return {}
  }

  return buildPageMetadata({
    title: caseStudy.title,
    summary: caseStudy.summary,
    path: caseStudy.url,
    image: caseStudy.featuredImage,
    type: 'article',
    publishedTime: caseStudy.date,
    tags: caseStudy.tags,
    canonicalUrl: caseStudy.canonicalUrl,
  })
}

export default async function CaseStudiesDetailPage({ params }: { params: { slug: string } }) {
  const caseStudy = getCaseStudy(params.slug)

  if (!caseStudy) {
    notFound()
  }

  return (
    <>
      <Header currentSection="work" currentTitle={caseStudy.title} mutedTitle />
      <main>
        <article className={`${pageStyles.container} case-study-page`} data-kind="case-study">
          <div className={pageStyles.shell}>
        <header className={pageStyles.localHeader}>
          <span className={pageStyles.eyebrow}>Case study</span>
          <Link href="/case-studies" className={pageStyles.close} aria-label="Close case study" data-ui-action data-action-variant="icon">
            <span className={`material-symbols-outlined ${pageStyles.closeIcon}`} aria-hidden="true" data-action-content>
              close
            </span>
          </Link>
        </header>

        {caseStudy.featuredImage ? (
          <div className={pageStyles.featuredImage}>
            <Image
              src={caseStudy.featuredImage}
              alt=""
              width={1600}
              height={900}
              priority
              className={pageStyles.image}
              sizes="(min-width: 1408px) 1280px, 100vw"
            />
          </div>
        ) : null}

        <div className={pageStyles.intro}>
          <p className={pageStyles.meta}>
            {[caseStudy.year, caseStudy.role].filter(Boolean).join(' · ')}
          </p>
          <h1 className={pageStyles.title}>{caseStudy.title}</h1>
          <p className={pageStyles.summary}>{caseStudy.summary}</p>
        </div>

        <ArticleRenderer content={caseStudy.content} format={caseStudy.format} variant="case-study" />
          </div>
        </article>
      </main>
    </>
  )
}
