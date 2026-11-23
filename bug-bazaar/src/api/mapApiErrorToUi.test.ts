import { describe, expect, it } from 'vitest'
import { mapApiErrorToUi, toRequestError } from './mapApiErrorToUi'
import { ApiClientError } from './client'

describe('mapApiErrorToUi', () => {
  it('maps 400 to field errors without exposing the raw API message', () => {
    const ui = mapApiErrorToUi({
      httpStatus: 400,
      code: 'VALIDATION',
      message: 'Invalid login payload',
      details: { email: 'Email is required', password: 'Password is required' },
    })

    expect(ui.kind).toBe('validation')
    expect(ui.title).toBe('Check your input')
    expect(ui.description).not.toContain('Invalid login payload')
    expect(ui.fieldErrors).toEqual({
      email: 'Enter a valid email.',
      password: 'Enter your password.',
    })
    expect(ui.showRetry).toBe(false)
  })

  it('maps 401 to sign-in copy without raw codes', () => {
    const ui = mapApiErrorToUi({
      httpStatus: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    })
    expect(ui.kind).toBe('unauthorized')
    expect(ui.description).not.toContain('UNAUTHORIZED')
    expect(ui.description).not.toContain('Invalid credentials')
    expect(ui.showRetry).toBe(false)
  })

  it('maps 404 to Not found', () => {
    const ui = mapApiErrorToUi({
      httpStatus: 404,
      code: 'NOT_FOUND',
      message: 'Product not found',
    })
    expect(ui.title).toBe('Not found')
    expect(ui.description).not.toContain('Product not found')
  })

  it('maps 409 with a named out-of-stock item', () => {
    const ui = mapApiErrorToUi(
      {
        httpStatus: 409,
        code: 'OUT_OF_STOCK',
        message: 'One or more items are out of stock',
        details: { productId: 'p-0002', productName: 'Ducks #2', available: '0' },
      },
      { resolveItemName: () => 'ignored' },
    )
    expect(ui.kind).toBe('outOfStock')
    expect(ui.description).toContain('Ducks #2')
    expect(ui.description).not.toContain('OUT_OF_STOCK')
  })

  it('maps 500 with retry affordance', () => {
    const ui = mapApiErrorToUi({
      httpStatus: 500,
      code: 'INTERNAL',
      message: 'Forced product list failure',
    })
    expect(ui.kind).toBe('server')
    expect(ui.showRetry).toBe(true)
    expect(ui.description).not.toContain('Forced product list failure')
  })
})

describe('toRequestError', () => {
  it('unwraps ApiClientError', () => {
    const error = new ApiClientError(404, {
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    })
    expect(toRequestError(error)).toMatchObject({
      httpStatus: 404,
      code: 'NOT_FOUND',
    })
  })
})
