import { QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../api'
import { productKeys } from '../../query'
import { createTestQueryClient } from '../../query/createTestQueryClient'
import { MOCK_STOCK_TICK_INTERVAL_MS } from './mockStockTick'
import { useLiveStock } from './useLiveStock'

vi.mock('./liveStockTransport', () => ({
  resolveLiveStockTransport: () => 'poll' as const,
  resolveStockSocketUrl: () => 'ws://localhost/stock',
  areMocksEnabled: () => true,
}))

vi.mock('./mockStockTick', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./mockStockTick')>()
  return {
    ...actual,
    nextMockStockTick: () => ({ productId: 'p-0001', stock: 22 }),
  }
})

vi.mock('../../mocks/seed', () => ({
  applyStockUpdate: vi.fn(),
}))

const product: Product = {
  id: 'p-0001',
  name: 'Harbor Tactile Keyboard',
  price: 1999,
  category: 'keyboards',
  stock: 5,
  rating: 4,
  imageUrl: '/products/keyboard-1.svg',
}

describe('useLiveStock poll transport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('applies ticks to the Query cache and stops after unmount', () => {
    const client = createTestQueryClient()
    client.setQueryData(productKeys.detail(product.id), product)

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result, unmount } = renderHook(() => useLiveStock(['p-0001']), { wrapper })
    expect(result.current).toBe('open')

    act(() => {
      vi.advanceTimersByTime(MOCK_STOCK_TICK_INTERVAL_MS)
    })

    expect(client.getQueryData<Product>(productKeys.detail('p-0001'))?.stock).toBe(22)

    unmount()

    client.setQueryData(productKeys.detail(product.id), { ...product, stock: 5 })

    act(() => {
      vi.advanceTimersByTime(MOCK_STOCK_TICK_INTERVAL_MS * 2)
    })

    expect(client.getQueryData<Product>(productKeys.detail('p-0001'))?.stock).toBe(5)
  })
})
