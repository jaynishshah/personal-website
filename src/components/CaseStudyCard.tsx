import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { CaseStudy } from '@/lib/content'
import styles from './CaseStudyCard.module.css'

interface CaseStudyCardProps {
  caseStudy: CaseStudy
  featured?: boolean
}

type AccentStyle = CSSProperties & {
  '--case-accent'?: string
}

export default function CaseStudyCard({ caseStudy, featured = false }: CaseStudyCardProps) {
  const image = caseStudy.previewImage ?? caseStudy.featuredImage
  const meta = [caseStudy.company, caseStudy.role, caseStudy.year].filter(Boolean).join(' / ')
  const accentStyle: AccentStyle = caseStudy.accentColor
    ? { '--case-accent': caseStudy.accentColor }
    : {}

  return (
    <article className={styles.card} data-featured={featured ? 'true' : undefined} style={accentStyle}>
      <Link href={caseStudy.url} className={styles.mediaLink} aria-label={`Read ${caseStudy.title}`}>
        {image ? (
          <Image
            src={image}
            alt=""
            width={1440}
            height={760}
            className={styles.image}
            sizes={featured ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 38vw, 100vw'}
          />
        ) : (
          <span className={styles.imageFallback} aria-hidden="true" />
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.kicker}>
          <span>Case study</span>
          {meta ? <span>{meta}</span> : null}
        </div>
        <h2 className={styles.title}>
          <Link href={caseStudy.url}>{caseStudy.title}</Link>
        </h2>
        <p className={styles.summary}>{caseStudy.summary}</p>

        {caseStudy.systemLayers.length > 0 ? (
          <ul className={styles.layers} aria-label={`${caseStudy.title} system layers`}>
            {caseStudy.systemLayers.map((layer) => (
              <li key={layer}>{layer}</li>
            ))}
          </ul>
        ) : null}

        <div className={styles.reveal}>
          {caseStudy.artifacts.length > 0 ? (
            <div>
              <p className={styles.revealLabel}>Artifacts</p>
              <p>{caseStudy.artifacts.join(' / ')}</p>
            </div>
          ) : null}
          {caseStudy.outcomes.length > 0 ? (
            <div>
              <p className={styles.revealLabel}>Outcomes</p>
              <p>{caseStudy.outcomes.join(' / ')}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
