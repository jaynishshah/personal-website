import assert from 'node:assert/strict'
import test from 'node:test'

import * as kineticQuoteModel from './kineticQuoteModel.ts'
import {
  advancePickerWheel,
  consumeScrollDelta,
  getQuoteWindow,
  wrapQuoteIndex,
} from './kineticQuoteModel.ts'

test('wrapQuoteIndex keeps quote navigation inside a looping collection', () => {
  assert.equal(wrapQuoteIndex(-1, 17), 16)
  assert.equal(wrapQuoteIndex(17, 17), 0)
  assert.equal(wrapQuoteIndex(35, 17), 1)
})

test('getQuoteWindow returns the centred quote and its wrapped neighbours', () => {
  assert.deepEqual(getQuoteWindow(0, 17), {
    previous: 16,
    current: 0,
    next: 1,
  })
})

test('consumeScrollDelta carries small trackpad deltas until they cross the threshold', () => {
  assert.deepEqual(consumeScrollDelta(4, 0, 20, 17), {
    index: 4,
    remainder: 20,
    direction: null,
    steps: 0,
  })

  assert.deepEqual(consumeScrollDelta(4, 20, 16, 17), {
    index: 5,
    remainder: 0,
    direction: 'next',
    steps: 1,
  })
})

test('consumeScrollDelta moves in either direction and wraps at the quote-list edges', () => {
  assert.deepEqual(consumeScrollDelta(16, 0, 72, 17), {
    index: 1,
    remainder: 0,
    direction: 'next',
    steps: 2,
  })

  assert.deepEqual(consumeScrollDelta(0, 0, -36, 17), {
    index: 16,
    remainder: 0,
    direction: 'previous',
    steps: 1,
  })
})

test('consumeScrollDelta caps a single update so mouse-wheel input stays readable', () => {
  assert.deepEqual(consumeScrollDelta(0, 0, 200, 17), {
    index: 3,
    remainder: 92,
    direction: 'next',
    steps: 3,
  })
})

test('advancePickerWheel rebases moving content around the active quote without a jump', () => {
  assert.deepEqual(advancePickerWheel(7, 0, 40, 64, 17), {
    index: 8,
    offset: 24,
  })

  assert.deepEqual(advancePickerWheel(0, 0, -40, 64, 17), {
    index: 16,
    offset: -24,
  })

  assert.deepEqual(advancePickerWheel(7, 0, 130, 64, 17), {
    index: 9,
    offset: -2,
  })
})

test('advancePickerWheel can return a residual position toward the centre line', () => {
  assert.deepEqual(advancePickerWheel(8, 24, 6, 64, 17), {
    index: 8,
    offset: 18,
  })

  assert.deepEqual(advancePickerWheel(8, -24, -6, 64, 17), {
    index: 8,
    offset: -18,
  })
})

test('getPickerTextScale grows the blue picker to the viewport-specific display size', () => {
  const { getPickerTextScale } = kineticQuoteModel as unknown as {
    getPickerTextScale: (isMoving: boolean, isMobile: boolean) => number
  }

  assert.equal(getPickerTextScale(false, false), 1)
  assert.equal(getPickerTextScale(false, true), 1)
  assert.equal(getPickerTextScale(true, false), 1.07)
  assert.equal(getPickerTextScale(true, true), 9 / 8)
})
