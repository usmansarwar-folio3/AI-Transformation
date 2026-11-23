import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Cart line kept in client state. Prices stay in cents until the display layer. */
export type CartItem = {
  productId: string
  name: string
  /** Unit price in cents. */
  price: number
  quantity: number
  /** Stock snapshot used later (D3-2) to cap quantities. */
  stock: number
}

export type CartState = {
  items: CartItem[]
}

export type AddCartItemPayload = {
  productId: string
  name: string
  price: number
  stock: number
  quantity?: number
}

const initialState: CartState = {
  items: [],
}

function clampQuantity(quantity: number, stock: number): number {
  const safeStock = Math.max(0, stock)
  const safeQuantity = Math.max(0, Math.floor(quantity))
  return Math.min(safeQuantity, safeStock)
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<AddCartItemPayload>) {
      const { productId, name, price, stock } = action.payload
      const addBy = clampQuantity(action.payload.quantity ?? 1, stock)
      if (addBy === 0) {
        return
      }

      const existing = state.items.find((item) => item.productId === productId)
      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + addBy, stock)
        existing.name = name
        existing.price = price
        existing.stock = stock
        return
      }

      state.items.push({
        productId,
        name,
        price,
        stock,
        quantity: addBy,
      })
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      state.items = state.items.filter((item) => item.productId !== action.payload.productId)
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((entry) => entry.productId === action.payload.productId)
      if (!item) {
        return
      }

      const next = clampQuantity(action.payload.quantity, item.stock)
      if (next === 0) {
        state.items = state.items.filter((entry) => entry.productId !== item.productId)
        return
      }

      item.quantity = next
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, setQuantity, clearCart } = cartSlice.actions
export const cartReducer = cartSlice.reducer
