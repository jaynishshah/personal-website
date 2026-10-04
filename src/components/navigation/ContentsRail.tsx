'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ArticleHeading } from '@/lib/articleHeadings'
import styles from './ContentsRail.module.css'

type ContentsTarget = ArticleHeading | { id: 'article-overview'; level: 2; title: 'Overview' }

const overview: ContentsTarget = { id: 'article-overview', level: 2, title: 'Overview' }

export default function ContentsRail({ className, headings }: { className?: string; headings: ArticleHeading[] }) {
  const targets = [overview, ...headings]
  const listRef = useRef<HTMLOListElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [activeId, setActiveId] = useState(overview.id)
  const [indicatorY, setIndicatorY] = useState(0)
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false)

  useEffect(() => {
    const elements = targets.map((target) => document.getElementById(target.id)).filter((element): element is HTMLElement => element !== null)
    const updateActiveTarget = () => {
      const readingLine = window.innerHeight * 0.3
      const current = elements.reduce<HTMLElement | null>((closest, element) => element.getBoundingClientRect().top <= readingLine ? element : closest, null)
      setActiveId(current?.id ?? overview.id)
    }
    const observer = new IntersectionObserver(updateActiveTarget, { rootMargin: '-15% 0px -65% 0px', threshold: 0 })
    elements.forEach((element) => observer.observe(element))
    window.addEventListener('resize', updateActiveTarget)
    updateActiveTarget()
    return () => { observer.disconnect(); window.removeEventListener('resize', updateActiveTarget) }
  }, [headings])

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const list = listRef.current
      const activeLink = linkRefs.current.get(activeId)
      if (!list || !activeLink) return
      setIndicatorY(activeLink.getBoundingClientRect().top - list.getBoundingClientRect().top)
      setIsIndicatorVisible(true)
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeId, headings])

  return (
    <nav className={`${styles.contents} ${className ?? ''}`} aria-label="Article contents">
      <p>Contents</p>
      <ol ref={listRef}>
        <span aria-hidden="true" className={styles.activeIndicator} style={{ opacity: isIndicatorVisible ? 1 : 0, transform: `translate3d(0, ${indicatorY}px, 0)` }} />
        {targets.map((target) => (
          <li key={target.id} data-level={target.level}>
            <a aria-current={activeId === target.id ? 'location' : undefined} data-active={activeId === target.id || undefined} href={`#${target.id}`} ref={(element) => {
              if (element) linkRefs.current.set(target.id, element)
              else linkRefs.current.delete(target.id)
            }} onClick={() => setActiveId(target.id)}>{target.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
