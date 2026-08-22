export type ReelDirection = 'next' | 'previous'

export type QuoteWindow = {
  previous: number
  current: number
  next: number
}

export type ScrollResult = {
  index: number
  remainder: number
  direction: ReelDirection | null
  steps: number
}

const SCROLL_STEP_PX = 36
const MAX_STEPS_PER_UPDATE = 3
const DESKTOP_ACTIVE_PICKER_TEXT_SCALE = 1.07
const MOBILE_ACTIVE_PICKER_TEXT_SCALE = 9 / 8

export function getPickerTextScale(isMoving: boolean, isMobile: boolean): number {
  if (!isMoving) return 1

  return isMobile
    ? MOBILE_ACTIVE_PICKER_TEXT_SCALE
    : DESKTOP_ACTIVE_PICKER_TEXT_SCALE
}

export function wrapQuoteIndex(index: number, count: number): number {
  return ((index % count) + count) % count
}

export function getQuoteWindow(index: number, count: number): QuoteWindow {
  const current = wrapQuoteIndex(index, count)

  return {
    previous: wrapQuoteIndex(current - 1, count),
    current,
    next: wrapQuoteIndex(current + 1, count),
  }
}

export function consumeScrollDelta(
  index: number,
  accumulatedDelta: number,
  incomingDelta: number,
  count: number,
): ScrollResult {
  const totalDelta = accumulatedDelta + incomingDelta
  const uncappedSteps = Math.trunc(totalDelta / SCROLL_STEP_PX)
  const signedSteps = Math.max(
    -MAX_STEPS_PER_UPDATE,
    Math.min(MAX_STEPS_PER_UPDATE, uncappedSteps),
  )

  if (signedSteps === 0) {
    return {
      index,
      remainder: totalDelta,
      direction: null,
      steps: 0,
    }
  }

  return {
    index: wrapQuoteIndex(index + signedSteps, count),
    remainder: totalDelta - signedSteps * SCROLL_STEP_PX,
    direction: signedSteps > 0 ? 'next' : 'previous',
    steps: Math.abs(signedSteps),
  }
}

export function advancePickerWheel(
  index: number,
  offset: number,
  delta: number,
  stepSize: number,
  count: number,
): { index: number; offset: number } {
  if (!Number.isFinite(delta) || stepSize <= 0) {
    return { index: wrapQuoteIndex(index, count), offset }
  }

  let nextIndex = wrapQuoteIndex(index, count)
  let nextOffset = offset - delta
  const halfStep = stepSize / 2

  while (nextOffset <= -halfStep) {
    nextOffset += stepSize
    nextIndex = wrapQuoteIndex(nextIndex + 1, count)
  }

  while (nextOffset >= halfStep) {
    nextOffset -= stepSize
    nextIndex = wrapQuoteIndex(nextIndex - 1, count)
  }

  return { index: nextIndex, offset: nextOffset }
}
