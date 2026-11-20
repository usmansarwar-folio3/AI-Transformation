import { describe, expect, it } from 'vitest'
import { formatPriceFromCents } from './formatPrice'

describe('formatPriceFromCents', () => {
  it('converts cents to a USD display string', () => {
    expect(formatPriceFromCents(1999)).toBe('$19.99')
    expect(formatPriceFromCents(199)).toBe('$1.99')
    expect(formatPriceFromCents(0)).toBe('$0.00')
  })
})
