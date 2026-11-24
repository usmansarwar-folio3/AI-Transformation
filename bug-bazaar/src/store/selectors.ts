import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

export function selectCartItems(state: RootState) {
  return state.cart.items
}

/** Quantity of a product already in the cart (0 if absent). */
export function selectCartQuantityByProductId(productId: string) {
  return (state: RootState): number => {
    const item = state.cart.items.find((entry) => entry.productId === productId)
    return item?.quantity ?? 0
  }
}

export function selectSessionUser(state: RootState) {
  return state.session.user
}

export function selectIsLoggedIn(state: RootState) {
  return state.session.user !== null
}

/** Sum of line quantities — drives the header cart badge. */
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
)

/** Cart total in cents — format only at the display layer. */
export const selectCartTotalCents = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0),
)
