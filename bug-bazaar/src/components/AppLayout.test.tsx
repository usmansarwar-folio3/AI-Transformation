import { render, screen } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { addItem, createAppStore } from '../store'
import { AppLayout } from './AppLayout'

function renderLayout(store = createAppStore()) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ index: true, element: null }],
      },
    ],
    { initialEntries: ['/'] },
  )

  return render(
    <Provider store={store}>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </Provider>,
  )
}

describe('AppLayout cart badge', () => {
  it('shows a derived cart item count from the Redux selector', () => {
    const store = createAppStore()
    store.dispatch(
      addItem({
        productId: 'p-0001',
        name: 'Keyboard #1',
        price: 500,
        stock: 5,
        quantity: 2,
      }),
    )
    store.dispatch(
      addItem({
        productId: 'p-0003',
        name: 'Coffee #3',
        price: 250,
        stock: 5,
        quantity: 1,
      }),
    )

    renderLayout(store)

    expect(screen.getAllByLabelText('Cart, 3 items').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })

  it('hides the badge count when the cart is empty', () => {
    renderLayout()

    expect(screen.getAllByLabelText('Cart, empty').length).toBeGreaterThan(0)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
