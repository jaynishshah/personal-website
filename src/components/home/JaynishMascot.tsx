'use client'

import { Mascot } from 'page-mascot'

type JaynishMascotProps = {
  className?: string
  size?: number
}

export default function JaynishMascot({
  className,
  size = 152,
}: JaynishMascotProps) {
  return (
    <Mascot
      directions="/mascots/jaynish-directions.webp"
      reactions="/mascots/jaynish-reactions.webp"
      size={size}
      label="Jaynish mascot"
      className={className}
    />
  )
}
