import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { logout } from '../api/client'
import { resetMockOrders } from '../mocks/handlers'
import { server } from '../mocks/node'
import { clearPersistedCart } from '../store/cartPersistence'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * Default stub so React trees that call `useLiveStock` do not open a real
 * socket under MSW. Live-stock unit tests replace this with a FakeWebSocket.
 */
class SilentWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3
  readyState = SilentWebSocket.CLOSED
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

vi.stubGlobal('WebSocket', SilentWebSocket)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetMockOrders()
  logout()
  clearPersistedCart()
})

afterAll(() => {
  server.close()
})
