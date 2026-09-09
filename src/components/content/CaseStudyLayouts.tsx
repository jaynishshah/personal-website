import type { ReactNode } from 'react'
import styles from './CaseStudyLayouts.module.css'
import {
  validateCaseStudyMediaProps,
  validateCaseStudyPictogramRowProps,
  validateCaseStudySectionLeadProps,
} from './CaseStudyLayoutValidation'

type IllustratedContentProps = {
  src: string
  alt?: string
  title: string
  children: ReactNode
}

export function CaseStudyPictogramRow({
  src,
  alt = '',
  title,
  children,
}: IllustratedContentProps) {
  validateCaseStudyPictogramRowProps({ src, title, children })

  return (
    <section className={styles.pictogramRow} data-case-study-layout="pictogram-row">
      <img className={styles.pictogram} src={src} alt={alt} loading="lazy" />
      <div className={styles.pictogramCopy}>
        <h3>{title}</h3>
        {children}
      </div>
    </section>
  )
}

export function CaseStudySectionLead({
  src,
  alt = '',
  title,
  children,
}: IllustratedContentProps) {
  validateCaseStudySectionLeadProps({ src, title, children })

  return (
    <section className={styles.sectionLead} data-case-study-layout="section-lead">
      <img className={styles.sectionIcon} src={src} alt={alt} loading="lazy" />
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

export function CaseStudyMedia({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  validateCaseStudyMediaProps({ src, alt })

  return (
    <figure className={styles.mediaFigure} data-case-study-layout="media">
      <img className={styles.media} src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
