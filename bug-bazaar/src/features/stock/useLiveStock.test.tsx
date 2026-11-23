import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyStockUpdate, productCatalog } from '../../mocks/seed'
import { productKeys } from '../../query'
import { createTestQueryClient } from '../../query/createTestQueryClient'
import { TestQueryProvider } from '../../query/testUtils'
import { useLiveStock } from './useLiveStock'

type Listener = (event: Event) => void

class FakeWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3
  static instances: FakeWebSocket[] = []

  readyState = FakeWebSocket.CONNECTING
  readonly url: string
  private listeners = new Map<string, Set<Listener>>()

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
    queueMicrotask(() => {
      this.readyState = FakeWebSocket.OPEN
      this.emit('open', new Event('open'))
    })
  }

  addEventListener(type: string, listener: Listener) {
    const set = this.listeners.get(type) ?? new Set()
    set.add(listener)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener)
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED
    this.emit('close', new CloseEvent('close'))
  }

  emit(type: string, event: Event) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event)
    }
  }

  pushTick(productId: string, stock: number) {
    this.emit(
      'message',
      new MessageEvent('message', {
        data: JSON.stringify({ productId, stock }),
      }),
    )
  }
}

describe('useLiveStock', () => {
  const originalWebSocket = globalThis.WebSocket
  let client = createTestQueryClient()

  beforeEach(() => {
    FakeWebSocket.instances = []
    client = createTestQueryClient()
    vi.stubGlobal('WebSocket', FakeWebSocket)
    applyStockUpdate('p-0001', productCatalog[0]!.stock)
  })

  afterEach(() => {
    cleanup()
    vi.stubGlobal('WebSocket', originalWebSocket)
  })

  it('applies a stock tick to the query cache and closes the socket on unmount', async () => {
    client.setQueryData(productKeys.detail('p-0001'), {
      ...productCatalog[0]!,
      stock: 5,
    })

    const { result, unmount } = renderHook(() => useLiveStock(['p-0001']), {
      wrapper: ({ children }) => (
        <TestQueryProvider client={client}>{children}</TestQueryProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current).toBe('open')
    })

    const socket = FakeWebSocket.instances[0]
    expect(socket).toBeDefined()

    act(() => {
      socket!.pushTick('p-0001', 22)
    })

    expect(client.getQueryData(productKeys.detail('p-0001'))).toMatchObject({ stock: 22 })
    expect(productCatalog[0]?.stock).toBe(22)

    unmount()
    expect(socket!.readyState).toBe(FakeWebSocket.CLOSED)
  })
})
