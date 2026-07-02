import styles from './VisualMarks.module.css'

export interface CrosshairProps {
  className?: string
}

export default function Crosshair({ className }: CrosshairProps) {
  const classNames = [styles.crosshair, className].filter(Boolean).join(' ')

  return <span className={classNames} aria-hidden="true" />
}
