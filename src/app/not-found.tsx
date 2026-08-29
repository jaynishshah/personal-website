import Link from 'next/link'
import CornerBadge from '@/components/visual/CornerBadge'
import Crosshair from '@/components/visual/Crosshair'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main>
      <div className={styles.container}>
        <CornerBadge className={styles.badge}>№ 000 · LOST</CornerBadge>
        <Crosshair className={styles.crosshair} />
        <p className={styles.eyebrow}>404</p>
        <h1>Page not found.</h1>
        <p>The page you're looking for does not exist, or has moved out of the current system.</p>
        <Link href="/" className="button">
          Go back home
        </Link>
      </div>
    </main>
  )
}
