import type { ReactNode } from 'react'
import type { HeaderSection } from '@/components/Header'
import type { ArticleHeading } from '@/lib/articleHeadings'
import PortfolioRail from '@/components/navigation/PortfolioRail'
import ContentsRail from '@/components/navigation/ContentsRail'
import StickyBackControl from './StickyBackControl'

interface ArticlePageTemplateProps {
  activeSection: HeaderSection
  backControl: ReactNode
  body: ReactNode
  className?: string
  featured?: ReactNode
  header: ReactNode
  headings: ArticleHeading[]
}

export default function ArticlePageTemplate({ activeSection, backControl, body, className, featured, header, headings }: ArticlePageTemplateProps) {
  return (
    <main className={`article-page-template ${className ?? ''}`} data-testid="article-page-template">
      <PortfolioRail activeSection={activeSection} />
      <article className="article-page-template__frame">
        <StickyBackControl>{backControl}</StickyBackControl>
        {featured && <div className="article-page-template__featured">{featured}</div>}
        {header}
        {body}
      </article>
      {headings.length > 0 && <ContentsRail className="article-page-template__contents" headings={headings} />}
    </main>
  )
}
