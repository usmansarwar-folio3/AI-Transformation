import { describe, expect, it } from 'vitest'
import { nextMockStockTick } from './mockStockTick'
import { stockTickSchema } from './stockTick'

describe('nextMockStockTick', () => {
  it('returns ticks that match the stock tick schema and first-twenty catalog ids', () => {
    for (let i = 0; i < 30; i += 1) {
      const tick = nextMockStockTick()
      expect(stockTickSchema.safeParse(tick).success).toBe(true)
      expect(tick.productId).toMatch(/^p-00(0[1-9]|1\d|20)$/)
      expect(tick.stock).toBeGreaterThanOrEqual(1)
      expect(tick.stock).toBeLessThanOrEqual(40)
    }
  })
})
