import styles from './Newsletter.module.css'

export default function Newsletter() {
  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        <h2 className={styles.title}>Subscribe to my newsletter</h2>
        <p className={styles.description}>
          Occasionally I share musings and fresh finds from the internet
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
