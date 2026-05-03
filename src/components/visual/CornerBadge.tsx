import styles from './VisualMarks.module.css'

export interface CornerBadgeProps {
  children: string
  className?: string
}

export default function CornerBadge({ children, className }: CornerBadgeProps) {
  const classNames = [styles.cornerBadge, className].filter(Boolean).join(' ')

  return <span className={classNames}>{children}</span>
}
