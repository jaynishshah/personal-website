import Link from 'next/link'
import type { Metadata } from 'next'
import { getBlogPosts, getCaseStudies } from '@/lib/content'
import PostCard from '@/components/PostCard'
import CaseStudyCard from '@/components/CaseStudyCard'
import Newsletter from '@/components/Newsletter'
import AxisDivider from '@/components/visual/AxisDivider'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Jaynish Shah',
  summary: 'Design systems leadership, case studies, and writing by Jaynish Shah.',
  path: '/',
  image: '/images/site/profile.png',
})

export default function HomePage() {
  const recentPosts = getBlogPosts().slice(0, 2)
  const featuredCaseStudy = getCaseStudies()[0]

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroCard}>
            <h1 className={styles.heading}>
              I help organisations build <em>scalable design systems.</em><br />
              Talk tokens to me.
            </h1>
            <p className={styles.lede}>
              I shape the foundations, component decisions, and governance loops that help product teams move with more clarity.
            </p>
            <div className={styles.actions}>
              <Link href="/case-studies" className="button">
                View work
              </Link>
              <Link href="/blog" className="button outline">
                Read writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredCaseStudy ? (
        <section className={styles.work}>
          <div className={styles.container}>
            <AxisDivider label="Selected work" index="01" />
            <CaseStudyCard caseStudy={featuredCaseStudy} featured className={styles.workCard} />
          </div>
        </section>
      ) : null}

      <section className={styles.about}>
        <div className={styles.container}>
          <AxisDivider label="About" index="02" />
          <div className={styles.columns}>
            <div className={styles.mainColumn}>
              <p className={styles.description}>
                Jaynish's path runs from architecture and spatial design to digital products, where structure, constraints, and craft meet at scale.
              </p>
              <div className={styles.actions}>
                <Link href="/about" className="button outline">
                  More context
                </Link>
              </div>
            </div>
            <div className={styles.sideColumn}>
              <div className={styles.infoBlock}>
                <p className={styles.label}>
                  Current
                </p>
                <p className={styles.info}>
                  Ticketmaster, UK<br />
                  Nov '22 – Present
                </p>
              </div>
              <div className={styles.spacer} aria-hidden="true" />
              <div className={styles.infoBlock}>
                <p className={styles.label}>
                  Previously
                </p>
                <p className={styles.info}>
                  Nykaa, Mumbai, India<br />
                  Jan '21 – Nov '22
                </p>
                <div className={styles.spacer} aria-hidden="true" />
                <p className={styles.info}>
                  Animal, New Delhi, India<br />
                  Dec '17 – Jan '21
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.blog}>
        <div className={styles.container}>
          <AxisDivider label="Writing" index="03" />
          <div className={styles.posts}>
            {recentPosts.map((post) => (
              <PostCard
                key={post.slug}
                title={post.title}
                slug={post.slug}
                date={post.date}
                summary={post.summary}
                type="blog"
              />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/blog" className={styles.viewAllLink}>
              View all writing
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
