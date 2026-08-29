import Link from 'next/link'
import styles from './Header.module.css'

export type HeaderSection = 'work' | 'writing' | 'about'

const navigation: readonly {
  href: string
  label: string
  section: HeaderSection
}[] = [
  { href: '/case-studies', label: 'Work', section: 'work' },
  { href: '/blog', label: 'Writing', section: 'writing' },
  { href: '/about', label: 'About', section: 'about' },
]

interface HeaderProps {
  currentSection?: HeaderSection
  currentTitle: string
  mutedTitle?: boolean
}

export default function Header({ currentSection, currentTitle, mutedTitle = false }: HeaderProps) {
  const remainingNavigation = navigation.filter((item) => item.section !== currentSection)

  return (
    <header className={styles.header} data-site-header="true">
      <div className={styles.container}>
        <div className={styles.identity}>
          <Link href="/" className={styles.wordmark}>Jaynish Shah</Link>
          <span className={styles.divider} aria-hidden="true">/</span>
          <span
            className={styles.contextTitle}
            data-muted={mutedTitle ? 'true' : undefined}
            aria-current={mutedTitle ? undefined : 'page'}
            title={currentTitle}
          >
            {currentTitle}
          </span>
        </div>
        <nav className={styles.nav} aria-label="Primary navigation">
          <ul className={styles.navList}>
            {remainingNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
