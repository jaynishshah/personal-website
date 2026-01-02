import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" aria-label="Jaynish Shah Home">
            <Image
              src="/images/site/logo.png"
              alt="Jaynish Shah"
              width={60}
              height={60}
              priority
            />
          </Link>
        </div>
        <nav className={styles.nav} aria-label="Navigation">
          <ul className={styles.navList}>
            <li>
              <Link href="/about">About me</Link>
            </li>
            <li>
              <Link href="/case-study">Case Studies</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <a href="https://read.cv/jaynishshah" target="_blank" rel="noopener noreferrer">
                CV ↗
              </a>
            </li>
            <li>
              <a href="https://hyperlink.substack.com" target="_blank" rel="noopener noreferrer">
                Newsletter ↗
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

