import Link from 'next/link'
import type { HeaderSection } from '@/components/Header'
import styles from './PortfolioRail.module.css'

const navigation: readonly { href: string; label: string; section: HeaderSection }[] = [
  { href: '/case-studies', label: 'Work', section: 'work' },
  { href: '/blog', label: 'Writing', section: 'writing' },
  { href: '/about', label: 'About', section: 'about' },
]

export default function PortfolioRail({ activeSection }: { activeSection: HeaderSection }) {
  return (
    <header className={styles.rail} data-testid="portfolio-rail">
      <Link href="/" className={styles.identity} aria-label={`Close ${activeSection === 'work' ? 'Work' : 'Writing'}`} data-ui-action data-action-variant="row">
        Hi. I’m Jaynish.
      </Link>
      <nav className={styles.navigation} aria-label="Portfolio sections">
        {navigation.map((item) => (
          <Link
            href={item.href}
            key={item.section}
            className={item.section === activeSection ? styles.activeSection : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
