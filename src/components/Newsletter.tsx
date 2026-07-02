import Image from 'next/image'
import AxisDivider from './visual/AxisDivider'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  return (
    <section className={styles.newsletter}>
      <div className={styles.inner}>
        <AxisDivider label="Newsletter" index="04" />
      </div>
      <div className={styles.container}>
        <div className={styles.heading}>
          <Image
            src="/images/site/profile.png"
            alt=""
            width={64}
            height={64}
            className={styles.icon}
          />
          <h2 className={styles.title}>
            <a href="https://hyperlink.substack.com" target="_blank" rel="noopener noreferrer">
              Hyperlink
            </a>
          </h2>
        </div>
        <p className={styles.description}>
          Occasionally I share musings and fresh finds from the internet.
        </p>
        <div className={styles.actions}>
          <a
            href="https://hyperlink.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            Sign up
          </a>
        </div>
      </div>
    </section>
  )
}
