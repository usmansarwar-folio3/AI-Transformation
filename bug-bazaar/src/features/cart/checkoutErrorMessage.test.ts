import { describe, expect, it } from 'vitest'
import type { CartItem } from '../../store'
import { formatCheckoutErrorMessage } from './checkoutErrorMessage'

const cartItems: CartItem[] = [
  {
    productId: 'p-0002',
    name: 'Ducks #2',
    price: 100,
    quantity: 1,
    stock: 0,
  },
]

describe('formatCheckoutErrorMessage', () => {
  it('names the out-of-stock product from API details', () => {
    const message = formatCheckoutErrorMessage(
      {
        httpStatus: 409,
        code: 'OUT_OF_STOCK',
        message: 'One or more items are out of stock',
        details: {
          productId: 'p-0002',
          productName: 'Ducks #2',
          available: '0',
        },
      },
      cartItems,
    )

    expect(message).toBe('Ducks #2 is out of stock (0 available).')
  })

  it('falls back to the cart line name when API omits productName', () => {
    const message = formatCheckoutErrorMessage(
      {
        httpStatus: 409,
        code: 'OUT_OF_STOCK',
        message: 'One or more items are out of stock',
        details: { productId: 'p-0002', available: '0' },
      },
      cartItems,
    )

    expect(message).toBe('Ducks #2 is out of stock (0 available).')
  })
})
