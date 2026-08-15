'use client'

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import styles from '@/app/page.module.css'
import {
  advancePickerWheel,
  getPickerTextScale,
  getQuoteWindow,
  wrapQuoteIndex,
} from './kineticQuoteModel'

const HOME_QUOTES = [
  'give teams a shared way to move forward.',
  'help teams work through ambiguity together.',
  'grow with the organisation around them.',
  'gives teams clearer choices.',
  'make room for different product needs.',
  'make contributions part of everyday work.',
  'connect design intent with shipped products.',
  'let products retain their character.',
  'make invisible decisions easier to see.',
  'work across products, brands, and teams.',
  'turn repeated decisions into shared tools.',
  'make quality easier to maintain.',
  'stay useful as products change.',
  'help good decisions travel between teams.',
  'improve through the people who use them.',
  'make complex products easier to navigate.',
  'become part of how the organisation works.',
] as const

const INITIAL_QUOTE_INDEX = 7
const KEYBOARD_STEP_DELTA = 1
const INPUT_GAIN = 0.42
const MOMENTUM_DELAY_MS = 36
const MOMENTUM_FRICTION = 0.84
const MAX_MOMENTUM_VELOCITY = 0.32
const STOP_VELOCITY = 0.012
const SNAP_DURATION_MS = 84
const SNAP_EPSILON = 0.25

export default function KineticQuote() {
  const [activeIndex, setActiveIndex] = useState(INITIAL_QUOTE_INDEX)
  const [isMoving, setIsMoving] = useState(false)
  const [pickerOffset, setPickerOffset] = useState(0)

  const activeIndexRef = useRef(INITIAL_QUOTE_INDEX)
  const offsetRef = useRef(0)
  const velocityRef = useRef(0)
  const lastInputAtRef = useRef(0)
  const lastFrameAtRef = useRef<number | null>(null)
  const pickerFrameRef = useRef<number | null>(null)
  const advanceFrameRef = useRef<(now: number) => void>(() => {})
  const reelRef = useRef<HTMLSpanElement | null>(null)
  const touchYRef = useRef<number | null>(null)

  const getStepSize = useCallback(() => (
    reelRef.current?.getBoundingClientRect().height ?? 64
  ), [])

  const setWheelPosition = useCallback((movement: number) => {
    const next = advancePickerWheel(
      activeIndexRef.current,
      offsetRef.current,
      movement,
      getStepSize(),
      HOME_QUOTES.length,
    )

    activeIndexRef.current = next.index
    offsetRef.current = next.offset
    setActiveIndex(next.index)
    setPickerOffset(next.offset)
  }, [getStepSize])

  const settlePicker = useCallback(() => {
    velocityRef.current = 0
    offsetRef.current = 0
    setPickerOffset(0)
    setIsMoving(false)
    pickerFrameRef.current = null
    lastFrameAtRef.current = null
  }, [])

  const advanceFrame = useCallback((now: number) => {
    const previousFrameAt = lastFrameAtRef.current ?? now
    const elapsed = Math.min(32, now - previousFrameAt)
    lastFrameAtRef.current = now

    if (now - lastInputAtRef.current > MOMENTUM_DELAY_MS) {
      if (Math.abs(velocityRef.current) > STOP_VELOCITY) {
        setWheelPosition(velocityRef.current * elapsed)
        velocityRef.current *= Math.pow(MOMENTUM_FRICTION, elapsed / 16.67)
      } else if (Math.abs(offsetRef.current) > SNAP_EPSILON) {
        setWheelPosition(
          offsetRef.current * Math.min(1, elapsed / SNAP_DURATION_MS),
        )
      } else {
        settlePicker()
        return
      }
    }

    pickerFrameRef.current = requestAnimationFrame(advanceFrameRef.current)
  }, [settlePicker, setWheelPosition])

  useEffect(() => {
    advanceFrameRef.current = advanceFrame
  }, [advanceFrame])

  const startPickerFrame = useCallback(() => {
    if (pickerFrameRef.current !== null) return

    lastFrameAtRef.current = null
    pickerFrameRef.current = requestAnimationFrame(advanceFrameRef.current)
  }, [])

  const applyPickerInput = useCallback((rawDelta: number) => {
    if (!Number.isFinite(rawDelta) || rawDelta === 0) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      const nextIndex = wrapQuoteIndex(
        activeIndexRef.current + (rawDelta > 0 ? 1 : -1),
        HOME_QUOTES.length,
      )

      activeIndexRef.current = nextIndex
      offsetRef.current = 0
      velocityRef.current = 0
      setActiveIndex(nextIndex)
      setPickerOffset(0)
      setIsMoving(false)
      return
    }

    const stepSize = getStepSize()
    const movement = Math.max(
      -stepSize * 0.84,
      Math.min(stepSize * 0.84, rawDelta * INPUT_GAIN),
    )
    const now = performance.now()
    const elapsed = Math.max(8, now - lastInputAtRef.current)

    const inputVelocity = movement / elapsed
    velocityRef.current = Math.max(
      -MAX_MOMENTUM_VELOCITY,
      Math.min(
        MAX_MOMENTUM_VELOCITY,
        velocityRef.current * 0.35 + inputVelocity * 0.65,
      ),
    )
    lastInputAtRef.current = now
    setIsMoving(true)
    setWheelPosition(movement)
    startPickerFrame()
  }, [getStepSize, setWheelPosition, startPickerFrame])

  const applyKeyboardStep = useCallback((step: number) => {
    if (pickerFrameRef.current !== null) {
      cancelAnimationFrame(pickerFrameRef.current)
      pickerFrameRef.current = null
    }

    const nextIndex = wrapQuoteIndex(
      activeIndexRef.current + step,
      HOME_QUOTES.length,
    )

    activeIndexRef.current = nextIndex
    offsetRef.current = 0
    velocityRef.current = 0
    setActiveIndex(nextIndex)
    setPickerOffset(0)
    setIsMoving(false)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('homepage-lock')

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()

      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1

      applyPickerInput(event.deltaY * unit)
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null
    }

    const handleTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY

      if (nextY === undefined || touchYRef.current === null) return

      event.preventDefault()
      const delta = touchYRef.current - nextY
      touchYRef.current = nextY
      applyPickerInput(delta)
    }

    const handleTouchEnd = () => {
      touchYRef.current = null
      lastInputAtRef.current = performance.now() - MOMENTUM_DELAY_MS
      startPickerFrame()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (target?.closest('a, button, input, select, textarea')) return

      const moveNext = event.key === 'ArrowDown'
        || event.key === 'PageDown'
        || (event.key === ' ' && !event.shiftKey)
      const movePrevious = event.key === 'ArrowUp'
        || event.key === 'PageUp'
        || (event.key === ' ' && event.shiftKey)

      if (!moveNext && !movePrevious) return

      event.preventDefault()
      applyKeyboardStep(moveNext ? KEYBOARD_STEP_DELTA : -KEYBOARD_STEP_DELTA)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.documentElement.classList.remove('homepage-lock')
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)

      if (pickerFrameRef.current !== null) {
        cancelAnimationFrame(pickerFrameRef.current)
      }
    }
  }, [applyKeyboardStep, applyPickerInput, startPickerFrame])

  const quoteWindow = getQuoteWindow(activeIndex, HOME_QUOTES.length)
  const isMobilePicker = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 600px)').matches
  const pickerTextScale = getPickerTextScale(isMoving, isMobilePicker)

  return (
    <>
      <span
        ref={reelRef}
        className={styles.quoteReel}
        data-active-index={activeIndex}
        data-moving={isMoving}
        data-testid="kinetic-quote"
        aria-hidden="true"
        style={{ '--picker-text-scale': pickerTextScale } as CSSProperties}
      >
        <span
          className={styles.quoteSurface}
          data-testid="kinetic-quote-card"
          aria-hidden="true"
        />
        <span className={styles.quoteViewport}>
          <span
            className={styles.quoteTrack}
            style={{ transform: `translate3d(0, ${pickerOffset}px, 0)` }}
          >
            <span className={`${styles.quoteLine} ${styles.quotePrevious}`}>
              <span className={styles.quoteLineContent}>
                {HOME_QUOTES[quoteWindow.previous]}
              </span>
            </span>
            <span className={`${styles.quoteLine} ${styles.quoteCurrent}`}>
              <span className={styles.quoteLineContent}>
                {HOME_QUOTES[quoteWindow.current]}
              </span>
            </span>
            <span className={`${styles.quoteLine} ${styles.quoteNext}`}>
              <span className={styles.quoteLineContent}>
                {HOME_QUOTES[quoteWindow.next]}
              </span>
            </span>
          </span>
        </span>
      </span>
      <span className="screen-reader-text" aria-live="polite" aria-atomic="true">
        {isMoving ? '' : HOME_QUOTES[quoteWindow.current]}
      </span>
    </>
  )
}
