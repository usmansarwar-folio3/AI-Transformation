import { describe, expect, it } from 'vitest'
import { addItem, cartReducer, clearCart, removeItem, setQuantity } from './cartSlice'
import { selectCartItemCount, selectCartTotalCents } from './selectors'
import { createAppStore } from './store'

describe('cartSlice', () => {
  it('adds items and merges quantities for the same product', () => {
    let state = cartReducer(
      undefined,
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 5,
        quantity: 2,
      }),
    )

    state = cartReducer(
      state,
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 5,
        quantity: 1,
      }),
    )

    expect(state.items).toEqual([
      {
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 5,
        quantity: 3,
      },
    ])
  })

  it('caps quantity at stock and removes when set to zero', () => {
    let state = cartReducer(
      undefined,
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 2,
        quantity: 5,
      }),
    )
    expect(state.items[0]?.quantity).toBe(2)

    state = cartReducer(state, setQuantity({ productId: 'p-0001', quantity: 0 }))
    expect(state.items).toEqual([])
  })

  it('removes and clears through defined actions', () => {
    let state = cartReducer(
      undefined,
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 3,
      }),
    )
    state = cartReducer(
      state,
      addItem({
        productId: 'p-0002',
        name: 'Duck #2',
        price: 200,
        stock: 1,
      }),
    )

    state = cartReducer(state, removeItem({ productId: 'p-0001' }))
    expect(state.items).toHaveLength(1)
    expect(state.items[0]?.productId).toBe('p-0002')

    state = cartReducer(state, clearCart())
    expect(state.items).toEqual([])
  })
})

describe('cart selectors', () => {
  it('derives item count and total cents', () => {
    const store = createAppStore()
    store.dispatch(
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 10,
        quantity: 2,
      }),
    )
    store.dispatch(
      addItem({
        productId: 'p-0003',
        name: 'Coffee #3',
        price: 250,
        stock: 10,
        quantity: 1,
      }),
    )

    const state = store.getState()
    expect(selectCartItemCount(state)).toBe(3)
    expect(selectCartTotalCents(state)).toBe(1250)
  })
})
