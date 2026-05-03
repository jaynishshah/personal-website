import styles from './VisualMarks.module.css'

export interface AxisDividerProps {
  label: string
  index?: string
  className?: string
}

export default function AxisDivider({ label, index, className }: AxisDividerProps) {
  const classNames = [styles.axis, className].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      <span className={styles.axisLabel}>
        {index ? `${index} / ` : null}
        {label}
      </span>
    </div>
  )
}
