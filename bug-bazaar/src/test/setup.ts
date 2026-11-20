import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { resetMockOrders } from '../mocks/handlers'
import { server } from '../mocks/node'
import { logout } from '../api/client'

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

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetMockOrders()
  logout()
})

afterAll(() => {
  server.close()
})
