import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseStudy, getCaseStudies } from '@/lib/content'
import Image from 'next/image'
import { format } from 'date-fns'
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

  const formattedDate = format(new Date(caseStudy.date), 'MMMM d, yyyy')

  return (
    <article className={pageStyles.container}>
      {caseStudy.featuredImage && (
        <div className={pageStyles.featuredImage}>
          <Image
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            width={2400}
            height={1200}
            priority
            className={pageStyles.image}
          />
        </div>
      )}
      <div className={pageStyles.content}>
        <div className={pageStyles.header}>
          <time dateTime={caseStudy.date} className={pageStyles.date}>
            {formattedDate}
          </time>
          <h1 className={pageStyles.title}>{caseStudy.title}</h1>
          <p className={pageStyles.summary}>{caseStudy.summary}</p>
          {(caseStudy.company || caseStudy.role || caseStudy.year || caseStudy.status) && (
            <div className={pageStyles.metaList}>
              {caseStudy.company ? <span className={pageStyles.metaItem}>{caseStudy.company}</span> : null}
              {caseStudy.role ? <span className={pageStyles.metaItem}>{caseStudy.role}</span> : null}
              {caseStudy.year ? <span className={pageStyles.metaItem}>{caseStudy.year}</span> : null}
              {caseStudy.status ? <span className={pageStyles.metaItem}>{caseStudy.status}</span> : null}
            </div>
          )}
          {caseStudy.tags && caseStudy.tags.length > 0 && (
            <div className={pageStyles.tags}>
              {caseStudy.tags.map((tag) => (
                <span key={tag} className={pageStyles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArticleRenderer content={caseStudy.content} format={caseStudy.format} />
      </div>
    </article>
  )
}

