import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseStudy, getCaseStudies } from '@/lib/content'
import Image from 'next/image'
import Link from 'next/link'
import ArticleRenderer from '@/components/content/ArticleRenderer'
import ArticlePageTemplate from '@/components/content/ArticlePageTemplate'
import pageStyles from '@/components/content/ArticlePage.module.css'
import { buildPageMetadata } from '@/lib/metadata'
import { extractArticleHeadings } from '@/lib/articleHeadings'

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
  const headings = extractArticleHeadings(caseStudy.content)

  return (
    <ArticlePageTemplate
      activeSection="work"
      className={`${pageStyles.template} case-study-page`}
      headings={headings}
      backControl={<Link href="/case-studies" className={pageStyles.backLink} aria-label="Back to Work">
        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        Back to Work
      </Link>}
      featured={caseStudy.featuredImage ? (
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
      ) : undefined}

      header={<div id="article-overview" className={pageStyles.intro}>
          <p className={pageStyles.meta}>
            {[caseStudy.year, caseStudy.role].filter(Boolean).join(' · ')}
          </p>
          <h1 className={pageStyles.title}>{caseStudy.title}</h1>
          <p className={pageStyles.summary}>{caseStudy.summary}</p>
        </div>}
      body={<ArticleRenderer content={caseStudy.content} format={caseStudy.format} variant="case-study" />}
    />
  )
}
