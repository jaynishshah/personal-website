import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/content'
import PostCard from '@/components/PostCard'
import Newsletter from '@/components/Newsletter'
import styles from './page.module.css'

export default function HomePage() {
  const recentPosts = getBlogPosts().slice(0, 2)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.videoContainer}>
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/site/component-mosaic.jpg"
              className={styles.video}
            >
              <source src="/images/site/Website-Animation-4K60-310524.mp4" type="video/mp4" />
            </video>
          </div>
          <div className={styles.intro}>
            <h1 className={styles.heading}>
              Hi! I am Jaynish Shah.<br />
              I help organisations build scalable design systems.
            </h1>
            <div className={styles.spacer} aria-hidden="true" />
            <h1 className={styles.subheading}>Talk tokens to me.</h1>
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.columns}>
            <div className={styles.mainColumn}>
              <p className={styles.description}>
                I'm a product designer specialising in design systems, currently based in Glasgow, UK.
              </p>
              <div className={styles.spacer} aria-hidden="true" />
              <div className={styles.actions}>
                <Link href="/about" className="button outline">
                  Read more
                </Link>
              </div>
            </div>
            <div className={styles.sideColumn}>
              <div className={styles.infoBlock}>
                <p className={styles.label}>
                  <strong>CURRENT</strong>
                </p>
                <p className={styles.info}>
                  Ticketmaster, UK<br />
                  Nov '22 – Present
                </p>
              </div>
              <div className={styles.spacer} aria-hidden="true" />
              <div className={styles.infoBlock}>
                <p className={styles.label}>
                  <strong>PAST</strong>
                </p>
                <p className={styles.info}>
                  Nykaa, Mumbai, India<br />
                  Jan '21 – Nov '22
                </p>
                <div className={styles.spacer} aria-hidden="true" />
                <p className={styles.info}>
                  Animal, New Delhi, India<br />
                  Dec '17 – Jan '21
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.blog}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Blog</h2>
          <div className={styles.posts}>
            {recentPosts.map((post) => (
              <PostCard
                key={post.slug}
                title={post.title}
                slug={post.slug}
                date={post.date}
                featuredImage={post.featuredImage}
                excerpt={post.description}
                tags={post.tags}
                type="blog"
              />
            ))}
          </div>
          <div className={styles.viewAll}>
            <hr className={styles.separator} />
            <Link href="/blog" className={styles.viewAllLink}>
              View all →
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}

