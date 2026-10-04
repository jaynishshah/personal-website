import type { ReactNode } from 'react'
import Link from 'next/link'

interface WorkNavigationLinkProps {
  children: ReactNode
  className: string
}

export default function WorkNavigationLink({ children, className }: WorkNavigationLinkProps) {
  return (
    <Link
      href="/case-studies"
      className={className}
      data-ui-action
      data-action-variant="row"
    >
      {children}
    </Link>
  )
}
