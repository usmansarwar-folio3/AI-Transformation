import { describe, expect, it } from 'vitest'
import { outOfStockProduct } from '../../mocks/seed'
import type { CartItem } from '../../store'
import { formatCheckoutErrorMessage } from './checkoutErrorMessage'

const cartItems: CartItem[] = [
  {
    productId: outOfStockProduct.id,
    name: outOfStockProduct.name,
    price: 100,
    quantity: 1,
    stock: 0,
  },
]

describe('formatCheckoutErrorMessage', () => {
  it('names the out-of-stock product without exposing raw API codes', () => {
    const ui = formatCheckoutErrorMessage(
      {
        httpStatus: 409,
        code: 'OUT_OF_STOCK',
        message: 'One or more items are out of stock',
        details: {
          productId: outOfStockProduct.id,
          productName: outOfStockProduct.name,
          available: '0',
        },
      },
      cartItems,
    )

    expect(ui.title).toBe('Out of stock')
    expect(ui.description).toContain(outOfStockProduct.name)
    expect(ui.description).not.toContain('OUT_OF_STOCK')
    expect(ui.showRetry).toBe(true)
  })

  it('falls back to the cart line name when API omits productName', () => {
    const ui = formatCheckoutErrorMessage(
      {
        httpStatus: 409,
        code: 'OUT_OF_STOCK',
        message: 'One or more items are out of stock',
        details: { productId: outOfStockProduct.id, available: '0' },
      },
      cartItems,
    )

    expect(ui.description).toContain(outOfStockProduct.name)
  })
})

