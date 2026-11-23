import type { CartItem, CartState } from './cartSlice'

/** localStorage key for cart only — never used for auth/session tokens. */
export const CART_STORAGE_KEY = 'bug-bazaar.cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.stock === 'number'
  )
}

/** Read persisted cart. Returns undefined when missing or invalid. */
export function loadCartState(): CartState | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) {
      return undefined
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || !('items' in parsed)) {
      return undefined
    }
    const { items: itemsUnknown } = parsed
    if (!Array.isArray(itemsUnknown) || !itemsUnknown.every(isCartItem)) {
      return undefined
    }
    return { items: itemsUnknown }
  } catch {
    return undefined
  }
}

export function saveCartState(cart: CartState): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function clearPersistedCart(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(CART_STORAGE_KEY)
}
