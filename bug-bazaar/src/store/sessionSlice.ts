import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../api'

/**
 * Session holds the logged-in user only.
 * Auth token stays in the API client memory helpers — never in this slice or localStorage.
 */
export type SessionState = {
  user: User | null
}

const initialState: SessionState = {
  user: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearSession(state) {
      state.user = null
    },
  },
})

export const { setUser, clearSession } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
