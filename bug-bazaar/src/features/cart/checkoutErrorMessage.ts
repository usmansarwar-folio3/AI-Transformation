import type { RequestError } from '../../api'
import type { CartItem } from '../../store'

/**
 * Human-readable checkout error. For 409, names the out-of-stock product from
 * API `details` (and cart name when present).
 */
export function formatCheckoutErrorMessage(
  error: RequestError,
  cartItems: CartItem[],
): string {
  if (error.httpStatus === 409) {
    const productId = error.details?.productId
    const apiName = error.details?.productName ?? error.details?.name
    const cartName = productId
      ? cartItems.find((item) => item.productId === productId)?.name
      : undefined
    const labeled = apiName ?? cartName ?? productId

    if (labeled) {
      const available = error.details?.available
      if (available !== undefined) {
        return `${labeled} is out of stock (${available} available).`
      }
      return `${labeled} is out of stock.`
    }
  }

  if (error.httpStatus === 401) {
    return 'Sign in to complete checkout.'
  }

  return error.message
}
