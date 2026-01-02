import Image from 'next/image'
import styles from './page.module.css'

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.spacer} aria-hidden="true" />
      <h1 className={styles.title}>About me</h1>
      <div className={styles.spacer} aria-hidden="true" />
      
      <div className={styles.content}>
        <div className={styles.textColumn}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle} id="what-i-do">
              THEN AND NOW
            </h3>
            <p className={styles.text}>
              I've worked across disciplines, but the common thread has always been systems thinking.
            </p>
            <p className={styles.text}>
              I started my career in architecture and interior design—solving spatial problems within constraints. That foundation in structure and clarity still shapes how I approach digital design today.
            </p>
            <p className={styles.text}>
              I transitioned into product design through hands-on experience—working on everything from augmented reality experiments to building websites and launching digital products from scratch. Over time, I gravitated towards design systems: the intersection of design, code, and collaboration.
            </p>
            <p className={styles.text}>
              Since then, I've focused on creating systems that help teams work more efficiently and consistently. Whether it's establishing design tokens, evolving component libraries, or improving governance, I find energy in the details that make scale possible.
            </p>
            <p className={styles.text}>
              Today, I work full-time on design systems at Ticketmaster, UK.
            </p>

            <h3 className={styles.sectionTitle} id="whereabouts">
              WHEREABOUTS
            </h3>
            <p className={styles.text}>
              Born and raised in Mumbai, India, I currently live with my son and wife in a{' '}
              <a
                href="https://www.instagram.com/p/CtOn5DFoLPw/?img_index=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                lovely leafy neighbourhood
              </a>{' '}
              of Glasgow, UK.
            </p>

            <h3 className={styles.sectionTitle} id="other-than-work">
              OTHER THAN WORK
            </h3>
            <p className={styles.text}>
              I enjoy long walks, exploring museums and galleries, writing, and falling into odd corners of Spotify.
            </p>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <Image
            src="/images/site/jaynish-shah.jpg"
            alt="Jaynish Shah"
            width={674}
            height={602}
            priority
            className={styles.image}
          />
        </div>
      </div>
      <div className={styles.spacer} aria-hidden="true" />
    </div>
  )
}

