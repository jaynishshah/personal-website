import type { Metadata } from 'next'
import Link from 'next/link'

import KineticQuote from '@/components/home/KineticQuote'
import WorkNavigationLink from '@/components/home/WorkNavigationLink'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Jaynish Shah',
  summary: 'Lead product designer working on design systems, thoughtful interactions, and shared ways of working.',
  path: '/',
  image: '/images/site/profile.png',
})

const navigation: readonly {
  href: string
  label: string
}[] = [
  {
    href: '/case-studies',
    label: 'Work',
  },
  {
    href: '/blog',
    label: 'Writing',
  },
  {
    href: '/about',
    label: 'About',
  },
] as const

export default function HomePage() {
  return (
    <main>
      <section className={`${styles.home} home-viewport`} data-testid="home-viewport">
        <div className={styles.canvas}>
          <div className={styles.intro}>
            <h1 className={styles.heading}>
              <span
                className={`${styles.stableTitleLine} ${styles.identityTitle}`}
                data-transition-role="identity"
              >
                Hi. I’m Jaynish.
              </span>
              <span
                className={`${styles.stableTitleLine} ${styles.introCopy}`}
                data-transition-role="intro-copy"
              >
                I help organisations build design systems that
              </span>
              <span className={styles.quoteTransitionCopy}>
                <KineticQuote />
              </span>
            </h1>

            <p className={`${styles.bio} ${styles.introCopy}`}>
              I’m a lead product designer at Ticketmaster, working on design systems. I’m drawn to ambiguous problems, thoughtful interactions and the initiatives that help the whole system move forward.
            </p>
          </div>

          <nav className={styles.navigation} aria-label="Primary navigation" data-transition-role="navigation">
            {navigation.map((item) => {
              const content = (
                <>
                  <span className={styles.navigationLabel}>{item.label}</span>
                  <span
                    className={`material-symbols-outlined ${styles.navigationArrow}`}
                    aria-hidden="true"
                  >
                    arrow_right_alt
                  </span>
                </>
              )

              return item.href === '/case-studies' ? (
                <WorkNavigationLink key={item.href} className={styles.navigationRow}>
                  {content}
                </WorkNavigationLink>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.navigationRow}
                  data-ui-action
                  data-action-variant="row"
                >
                  {content}
                </Link>
              )
            })}
          </nav>
        </div>
      </section>
    </main>
  )
}
