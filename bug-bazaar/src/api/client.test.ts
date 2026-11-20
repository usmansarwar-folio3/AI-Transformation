import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiClientError,
  createOrder,
  getAuthToken,
  getMe,
  getOrder,
  getProduct,
  getProducts,
  login,
  logout,
  setAuthToken,
} from './client'
import { mockMeta } from '../mocks/handlers'
import { PRODUCT_COUNT } from '../mocks/seed'

afterEach(() => {
  logout()
  vi.restoreAllMocks()
})

describe('api contract mock (D1-2 / D1-4)', () => {
  it('seeds 5,000 products and returns a paged list with prices in cents', async () => {
    expect(PRODUCT_COUNT).toBe(5000)
    expect(mockMeta.productCount).toBe(5000)

    const result = await getProducts({ page: 1 })
    expect(result.total).toBe(PRODUCT_COUNT)
    expect(result.items).toHaveLength(mockMeta.pageSize)
    expect(result.items[0]?.id).toBe('p-0001')
    expect(Number.isInteger(result.items[0]?.price)).toBe(true)
  })

  it('fetches a single product by id', async () => {
    const product = await getProduct('p-0001')
    expect(product.id).toBe('p-0001')
    expect(product.category).toBe('keyboards')
  })

  it('triggers GET /products 500 with forceError', async () => {
    await expect(getProducts({ forceError: 500 })).rejects.toMatchObject({
      status: 500,
      body: { error: { code: 'INTERNAL' } },
    } satisfies Partial<ApiClientError>)
  })

  it('triggers GET /products/:id 404 for unknown ids', async () => {
    await expect(getProduct('missing')).rejects.toMatchObject({
      status: 404,
      body: { error: { code: 'NOT_FOUND' } },
    })
  })

  it('triggers POST /login 400 when fields are missing', async () => {
    await expect(login({ email: '', password: '' })).rejects.toMatchObject({
      status: 400,
      body: { error: { code: 'VALIDATION' } },
    })
  })

  it('triggers POST /login 401 for bad credentials', async () => {
    await expect(login({ email: 'dev@example.com', password: 'wrong' })).rejects.toMatchObject({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    })
  })

  it('logs in and stores the token in memory only', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const response = await login({
      email: 'dev@example.com',
      password: mockMeta.demoPassword,
    })
    expect(response.token).toBe(mockMeta.validToken)
    expect(getAuthToken()).toBe(mockMeta.validToken)
    expect(setItem).not.toHaveBeenCalled()
  })

  it('clears the in-memory token on logout without touching storage', async () => {
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })
    logout()
    expect(getAuthToken()).toBeNull()
    expect(removeItem).not.toHaveBeenCalled()
  })

  it('triggers GET /me 401 without a session', async () => {
    await expect(getMe()).rejects.toMatchObject({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    })
  })

  it('returns the current user when authenticated', async () => {
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })
    const me = await getMe()
    expect(me.id).toBe('u-1')
  })

  it('triggers POST /orders 401 without a session', async () => {
    await expect(
      createOrder({
        items: [{ productId: 'p-0001', quantity: 1 }],
        idempotencyKey: 'key-401',
      }),
    ).rejects.toMatchObject({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    })
  })

  it('triggers POST /orders 400 for an empty cart', async () => {
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })
    await expect(
      createOrder({ items: [], idempotencyKey: 'key-400' }),
    ).rejects.toMatchObject({
      status: 400,
      body: { error: { code: 'VALIDATION' } },
    })
  })

  it('triggers POST /orders 409 when stock is insufficient', async () => {
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })
    await expect(
      createOrder({
        items: [{ productId: mockMeta.outOfStockProductId, quantity: 1 }],
        idempotencyKey: 'key-409',
      }),
    ).rejects.toMatchObject({
      status: 409,
      body: {
        error: {
          code: 'OUT_OF_STOCK',
          details: { productId: mockMeta.outOfStockProductId },
        },
      },
    })
  })

  it('creates an order and fetches it by id', async () => {
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })
    const created = await createOrder({
      items: [{ productId: 'p-0001', quantity: 1 }],
      idempotencyKey: 'key-ok',
    })
    expect(created.status).toBe('queued')

    const fetched = await getOrder(created.id)
    expect(fetched.id).toBe(created.id)
    expect(fetched.status).toBe('queued')
  })

  it('triggers GET /orders/:id 404 for unknown orders', async () => {
    setAuthToken(mockMeta.validToken)
    await expect(getOrder('missing')).rejects.toMatchObject({
      status: 404,
      body: { error: { code: 'NOT_FOUND' } },
    })
  })

  it('triggers GET /orders/:id 401 without a session', async () => {
    await expect(getOrder('o-1')).rejects.toMatchObject({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    })
  })

  it('rejects getProducts when the AbortSignal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(getProducts({ page: 1 }, controller.signal)).rejects.toSatisfy(
      (error: unknown) => error instanceof DOMException || error instanceof Error,
    )
  })

  it('rejects getProduct when the AbortSignal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(getProduct('p-0001', controller.signal)).rejects.toSatisfy(
      (error: unknown) => error instanceof DOMException || error instanceof Error,
    )
  })

  it('maps ApiClientError into RequestError for RequestStatus consumers', async () => {
    try {
      await getProduct('missing')
      expect.unreachable('expected 404')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.toRequestError()).toEqual({
          httpStatus: 404,
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }
    }
  })
})
