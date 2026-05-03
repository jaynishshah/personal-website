import styles from './Newsletter.module.css'

export default function Newsletter() {
  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        <p className={styles.kicker}>Signal / occasional</p>
        <h2 className={styles.title}>Notes on systems work, craft, and useful references.</h2>
        <p className={styles.description}>
          A quiet mailing list for essays, links, and observations that do not need a full article.
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
