import { describe, expect, it } from 'vitest'
import { selectIsLoggedIn, selectSessionUser } from './selectors'
import { clearSession, sessionReducer, setUser } from './sessionSlice'
import { createAppStore } from './store'

describe('sessionSlice', () => {
  it('sets and clears the user through defined actions', () => {
    let state = sessionReducer(
      undefined,
      setUser({
        id: 'u-1',
        email: 'dev@example.com',
        name: 'Dev',
      }),
    )
    expect(state.user?.email).toBe('dev@example.com')

    state = sessionReducer(state, clearSession())
    expect(state.user).toBeNull()
  })

  it('exposes logged-in derived selectors without storing a token', () => {
    const store = createAppStore()
    expect(selectIsLoggedIn(store.getState())).toBe(false)

    store.dispatch(
      setUser({
        id: 'u-1',
        email: 'dev@example.com',
        name: 'Dev',
      }),
    )

    expect(selectIsLoggedIn(store.getState())).toBe(true)
    expect(selectSessionUser(store.getState())?.name).toBe('Dev')
    expect(store.getState().session).not.toHaveProperty('token')
  })
})
