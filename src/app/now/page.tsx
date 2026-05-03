import type { Metadata } from 'next'
import AxisDivider from '@/components/visual/AxisDivider'
import CornerBadge from '@/components/visual/CornerBadge'
import Crosshair from '@/components/visual/Crosshair'
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
        <header className={styles.header}>
          <CornerBadge className={styles.badge}>№ 007 · NOW</CornerBadge>
          <Crosshair className={styles.crosshair} />
          <p className={styles.eyebrow}>Now</p>
          <h1 className={styles.title}>A low-maintenance snapshot of what Jaynish is focused on.</h1>
          <p className={styles.updated}>Last updated May 2026.</p>
        </header>

        <div className={styles.sections}>
          <section className={styles.section}>
            <AxisDivider label="Work" index="01" />
            <p>
              Working full-time on design systems at Ticketmaster UK, with attention on scalable foundations, component quality, governance, and the cross-functional habits that keep a system healthy.
            </p>
          </section>

          <section className={styles.section}>
            <AxisDivider label="Exploring" index="02" />
            <p>
              How design tokens, component APIs, documentation, and contribution models can make design systems easier to understand, adopt, and maintain across product teams.
            </p>
          </section>

          <section className={styles.section}>
            <AxisDivider label="Writing" index="03" />
            <p>
              Turning practical design systems work into essays and notes that are useful to designers, engineers, and teams trying to improve their UI infrastructure.
            </p>
          </section>

          <section className={styles.section}>
            <AxisDivider label="Outside work" index="04" />
            <p>
              Living in Glasgow, walking often, visiting museums and galleries, and collecting references from design, architecture, music, and everyday systems.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
