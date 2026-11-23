import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthToken, getMe, setAuthToken } from '../../api'
import { RequireAuth } from '../../auth/RequireAuth'
import { subscribeUnauthorized } from '../../auth/unauthorized'
import { TestQueryProvider } from '../../query/testUtils'
import { clearSession, createAppStore, selectIsLoggedIn, setUser } from '../../store'
import { AccountPage } from './AccountPage'
import { LoginPage } from './LoginPage'

const loginMock = vi.hoisted(() => vi.fn())

vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api')>()
  return {
    ...actual,
    login: ((...args: Parameters<typeof actual.login>) =>
      loginMock(...args) as ReturnType<typeof actual.login>) satisfies typeof actual.login,
  }
})

beforeEach(async () => {
  const actual = await vi.importActual<typeof import('../../api')>('../../api')
  loginMock.mockReset()
  loginMock.mockImplementation(actual.login)
})

afterEach(() => {
  cleanup()
})

function renderWithStore(
  store: ReturnType<typeof createAppStore>,
  routes: Parameters<typeof createMemoryRouter>[0],
  initialEntries: string[],
) {
  const router = createMemoryRouter(routes, { initialEntries })
  return render(
    <Provider store={store}>
      <TestQueryProvider>
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </TestQueryProvider>
    </Provider>,
  )
}

describe('auth (D3-3)', () => {
  it(
    'redirects unauthenticated account visits to login and returns after sign-in',
    async () => {
      const user = userEvent.setup()
      const store = createAppStore()

      renderWithStore(
        store,
        [
          { path: '/login', element: <LoginPage /> },
          {
            path: '/account',
            element: (
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            ),
          },
        ],
        ['/account'],
      )

      expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()

      await user.clear(screen.getByLabelText('Email'))
      await user.click(screen.getByLabelText('Email'))
      await user.paste('return@bugbazaar.dev')
      await user.click(screen.getByLabelText('Password'))
      await user.paste('password')
      await user.click(document.querySelector('.login-page__submit') as HTMLButtonElement)

      expect(await screen.findByRole('heading', { name: 'Account' })).toBeInTheDocument()
      // /api/me returns the mock shopper profile after a successful login session.
      expect(await screen.findByText('shopper@bugbazaar.dev')).toBeInTheDocument()
    },
    10_000,
  )

  it('disables the login submit control while the request is pending', async () => {
    const user = userEvent.setup()
    const store = createAppStore()
    let resolveLogin: (value: unknown) => void = () => undefined

    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )

    renderWithStore(store, [{ path: '/login', element: <LoginPage /> }], ['/login'])

    const submit = document.querySelector('.login-page__submit')
    expect(submit).toBeInstanceOf(HTMLButtonElement)
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(submit as HTMLButtonElement)

    await waitFor(() => {
      expect(submit).toBeDisabled()
    })

    act(() => {
      resolveLogin({
        token: 'demo-token',
        user: { id: 'u-1', email: 'shopper@bugbazaar.dev', name: 'Shopper' },
      })
    })

    await waitFor(() => {
      expect(selectIsLoggedIn(store.getState())).toBe(true)
    })
  })

  it('clears the Redux session when an authenticated request returns 401', async () => {
    const store = createAppStore()
    store.dispatch(
      setUser({
        id: 'u-1',
        email: 'dev@example.com',
        name: 'Dev',
      }),
    )
    setAuthToken('not-the-demo-token')

    const unsubscribe = subscribeUnauthorized(() => {
      store.dispatch(clearSession())
    })

    await expect(getMe()).rejects.toMatchObject({ status: 401 })
    expect(getAuthToken()).toBeNull()
    expect(selectIsLoggedIn(store.getState())).toBe(false)

    unsubscribe()
  })
})
