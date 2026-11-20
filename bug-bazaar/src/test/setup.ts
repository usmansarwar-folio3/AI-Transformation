import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockOrders } from '../mocks/handlers'
import { server } from '../mocks/node'
import { logout } from '../api/client'

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
