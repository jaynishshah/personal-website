import Link from 'next/link'
import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import Newsletter from '@/components/Newsletter'
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

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.lockCard}>
            <span className={styles.corner}>№ 001 · GLA</span>
            <span className={styles.crosshair} aria-hidden="true" />
            <p className={styles.eyebrow}>Jaynish Shah / Designer</p>
            <h1 className={styles.heading}>
              Designing systems that <em>quietly</em> hold everything together.
            </h1>
            <p className={styles.lede}>
              Jaynish Shah is a product designer specialising in design systems, currently in Glasgow.
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
          <aside className={styles.summaryPanel} aria-label="Current focus">
            <h2>Current signal</h2>
            <div className={styles.summaryRow}>
              <span>Current</span>
              <span>Ticketmaster, UK</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Focus</span>
              <span>Tokens, component quality, governance</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Practice</span>
              <span>Design systems, product design, design operations</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Base</span>
              <span>Glasgow, UK</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.focus}>
        <div className={styles.container}>
          <h2 className={styles.sectionLabel}>System focus</h2>
          <div className={styles.focusGrid}>
            <div>
              <span>01</span>
              <h3>System foundations</h3>
              <p>Design tokens, theming, component models, accessibility baselines, and the structure behind scalable UI decisions.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Adoption and governance</h3>
              <p>Contribution models, decision records, documentation, release habits, and the loops that make a system trusted.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Design and engineering alignment</h3>
              <p>Helping teams translate design intent into reusable interfaces without losing craft, clarity, or delivery speed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.columns}>
            <div className={styles.mainColumn}>
              <h2 className={styles.sectionLabel}>About</h2>
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Writing</h2>
            <p>Notes on design systems, component architecture, and product design practice.</p>
          </div>
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
            <hr className={styles.separator} />
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
