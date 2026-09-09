'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface WorkNavigationLinkProps {
  children: ReactNode
  className: string
}

export default function WorkNavigationLink({ children, className }: WorkNavigationLinkProps) {
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.detail === 0
    ) {
      return
    }

    event.preventDefault()
    document.documentElement.dataset.pageTransition = 'to-work'

    window.setTimeout(() => {
      router.push('/case-studies')
    }, 260)
  }

  return (
    <Link
      href="/case-studies"
      className={className}
      data-ui-action
      data-action-variant="row"
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
