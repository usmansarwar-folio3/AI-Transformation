import { mapApiErrorToUi, type RequestError } from '../../api'
import type { CartItem } from '../../store'

/**
 * Checkout-facing description from the shared API error mapper (D3-4).
 * Prefers cart line names when API details omit productName.
 */
export function formatCheckoutErrorMessage(
  error: RequestError,
  cartItems: CartItem[],
): { title: string; description: string; showRetry: boolean } {
  const ui = mapApiErrorToUi(error, {
    resolveItemName: (productId) =>
      cartItems.find((item) => item.productId === productId)?.name,
  })

  return {
    title: ui.title,
    description: ui.description,
    showRetry: ui.showRetry || ui.kind === 'outOfStock' || ui.kind === 'server' || ui.kind === 'unknown',
  }
}
