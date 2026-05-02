import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import styles from './page.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'Now',
  summary: 'Current focus, work themes, and active interests for Jaynish Shah.',
  path: '/now',
})

export default function NowPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Now</p>
        <h1 className={styles.title}>A low-maintenance snapshot of what Jaynish is focused on.</h1>
        <p className={styles.updated}>Last updated May 2026.</p>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h2>Work</h2>
            <p>
              Working full-time on design systems at Ticketmaster UK, with attention on scalable foundations, component quality, governance, and the cross-functional habits that keep a system healthy.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Exploring</h2>
            <p>
              How design tokens, component APIs, documentation, and contribution models can make design systems easier to understand, adopt, and maintain across product teams.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Writing</h2>
            <p>
              Turning practical design systems work into essays and notes that are useful to designers, engineers, and teams trying to improve their UI infrastructure.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Outside work</h2>
            <p>
              Living in Glasgow, walking often, visiting museums and galleries, and collecting references from design, architecture, music, and everyday systems.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
