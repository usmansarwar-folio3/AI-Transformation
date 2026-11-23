import { describe, expect, it } from 'vitest'
import { addItem } from './cartSlice'
import {
  CART_STORAGE_KEY,
  clearPersistedCart,
  loadCartState,
  saveCartState,
} from './cartPersistence'
import { createAppStore } from './store'

describe('cart persistence', () => {
  it('hydrates cart items from localStorage on store create', () => {
    saveCartState({
      items: [
        {
          productId: 'p-0001',
          name: 'Keyboard #1',
          price: 500,
          quantity: 2,
          stock: 5,
        },
      ],
    })

    const store = createAppStore()
    expect(store.getState().cart.items).toHaveLength(1)
    expect(store.getState().cart.items[0]?.productId).toBe('p-0001')
  })

  it('writes cart updates to localStorage', () => {
    clearPersistedCart()
    const store = createAppStore({ cart: { items: [] } })

    store.dispatch(
      addItem({
        productId: 'p-0003',
        name: 'Coffee #3',
        price: 250,
        stock: 4,
        quantity: 1,
      }),
    )

    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(loadCartState()?.items[0]?.productId).toBe('p-0003')
  })
})
