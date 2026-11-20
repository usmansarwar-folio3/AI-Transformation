import { describe, expect, it } from 'vitest'
import {
  failure,
  idle,
  isError,
  isIdle,
  isLoading,
  isSuccess,
  loading,
  requestErrorFromApi,
  success,
} from './requestStatus'
import type { Product } from './schemas'

const sampleProduct: Product = {
  id: 'p-0001',
  name: 'Keyboards #1',
  price: 199,
  category: 'keyboards',
  stock: 3,
  rating: 4.2,
  imageUrl: '/images/keyboards-1.png',
}

describe('RequestStatus helpers', () => {
  it('builds only valid discriminated variants', () => {
    expect(idle()).toEqual({ status: 'idle' })
    expect(loading()).toEqual({ status: 'loading' })
    expect(success(sampleProduct)).toEqual({ status: 'success', data: sampleProduct })
    expect(
      failure({
        httpStatus: 404,
        code: 'NOT_FOUND',
        message: 'Product not found',
      }),
    ).toEqual({
      status: 'error',
      error: {
        httpStatus: 404,
        code: 'NOT_FOUND',
        message: 'Product not found',
      },
    })
  })

  it('narrows data and error through type guards', () => {
    const ok = success(sampleProduct)
    const err = failure(
      requestErrorFromApi(500, {
        error: { code: 'INTERNAL', message: 'Forced failure' },
      }),
    )

    expect(isIdle(idle())).toBe(true)
    expect(isLoading(loading())).toBe(true)
    expect(isSuccess(ok)).toBe(true)
    expect(isError(err)).toBe(true)

    if (isSuccess(ok)) {
      expect(ok.data.id).toBe('p-0001')
    }

    if (isError(err)) {
      expect(err.error.httpStatus).toBe(500)
      expect(err.error.code).toBe('INTERNAL')
    }
  })
})
