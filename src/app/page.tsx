import type { Metadata } from 'next'
import Link from 'next/link'

import KineticQuote from '@/components/home/KineticQuote'
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
  description?: string
}[] = [
  {
    href: '/case-studies',
    label: 'Work',
  },
  {
    href: '/blog',
    label: 'Writing',
    description: 'Things I’m learning',
  },
  {
    href: '/about',
    label: 'About',
    description: 'The path behind the work',
  },
] as const

export default function HomePage() {
  return (
    <section className={`${styles.home} home-viewport`} data-testid="home-viewport">
      <div className={styles.canvas}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>
            <span className={styles.stableTitleLine}>Hi. I’m Jaynish.</span>
            <span className={styles.stableTitleLine}>
              I help organisations build design systems that
            </span>
            <KineticQuote />
          </h1>

          <p className={styles.bio}>
            I’m a lead product designer at Ticketmaster, working on design systems. I’m drawn to ambiguous problems, thoughtful interactions and the initiatives that help the whole system move forward.
          </p>
        </div>

        <nav className={styles.navigation} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navigationRow}>
              <span className={styles.navigationLabel}>{item.label}</span>
              {item.description ? (
                <span className={styles.navigationDescription}>{item.description}</span>
              ) : null}
              <span className={styles.navigationArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
