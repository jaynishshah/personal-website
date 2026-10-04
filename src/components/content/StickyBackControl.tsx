'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export default function StickyBackControl({ children }: { children: ReactNode }) {
  const controlRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const updateStickyState = () => {
      const control = controlRef.current
      if (!control) return
      setIsStuck(control.getBoundingClientRect().top <= 16)
    }

    window.addEventListener('scroll', updateStickyState, { passive: true })
    window.addEventListener('resize', updateStickyState)
    updateStickyState()

    return () => {
      window.removeEventListener('scroll', updateStickyState)
      window.removeEventListener('resize', updateStickyState)
    }
  }, [])

  return (
    <>
      <div className="article-page-template__gradient" data-stuck={isStuck || undefined} aria-hidden="true" />
      <div className="article-page-template__back-control" data-stuck={isStuck || undefined} ref={controlRef}>{children}</div>
    </>
  )
}
