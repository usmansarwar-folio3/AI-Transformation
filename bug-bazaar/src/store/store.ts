import { configureStore } from '@reduxjs/toolkit'
import { cartReducer, type CartState } from './cartSlice'
import { loadCartState, saveCartState } from './cartPersistence'
import { sessionReducer, type SessionState } from './sessionSlice'

export type PreloadedAppState = {
  cart?: CartState
  session?: SessionState
}

export function createAppStore(preloadedState?: PreloadedAppState) {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      session: sessionReducer,
    },
    preloadedState: {
      cart: preloadedState?.cart ?? loadCartState() ?? { items: [] },
      session: preloadedState?.session ?? { user: null },
    },
  })

  store.subscribe(() => {
    saveCartState(store.getState().cart)
  })

  return store
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
