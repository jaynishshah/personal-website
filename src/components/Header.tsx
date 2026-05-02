import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.wordmark}>
          <Link href="/">
            Jaynish Shah
          </Link>
        </div>
        <div className={styles.right}>
          <nav className={styles.nav} aria-label="Navigation">
            <ul className={styles.navList}>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/case-studies">Work</Link>
              </li>
              <li>
                <Link href="/blog">Writing</Link>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
