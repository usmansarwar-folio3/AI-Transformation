import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from './cartSlice'
import { sessionReducer } from './sessionSlice'

export function createAppStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      session: sessionReducer,
    },
  })
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
