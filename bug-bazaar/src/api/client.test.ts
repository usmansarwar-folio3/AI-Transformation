import { afterEach, describe, expect, it } from 'vitest'
import {
  ApiClientError,
  getProduct,
  getProducts,
  login,
  logout,
  setAuthToken,
} from './client'

afterEach(() => {
  logout()
})

describe('api client', () => {
  it('fetches and validates a product list', async () => {
    const result = await getProducts()
    expect(result.total).toBe(1)
    expect(result.items[0]?.name).toBe('Rubber Duck')
    expect(result.items[0]?.price).toBe(999)
  })

  it('fetches a single product by id', async () => {
    const product = await getProduct('p-1')
    expect(product.id).toBe('p-1')
    expect(product.category).toBe('ducks')
  })

  it('maps a 404 into ApiClientError', async () => {
    await expect(getProduct('missing')).rejects.toBeInstanceOf(ApiClientError)
    try {
      await getProduct('missing')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.status).toBe(404)
        expect(error.body?.error.code).toBe('NOT_FOUND')
      }
    }
  })

  it('stores the auth token in memory after login', async () => {
    const response = await login({ email: 'dev@example.com', password: 'secret' })
    expect(response.token).toBe('test-token')
    setAuthToken(response.token)
    expect(response.user.email).toBe('dev@example.com')
  })
})
