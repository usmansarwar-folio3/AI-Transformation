import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createOrder, login } from '../../api'
import { mockMeta } from '../../mocks/handlers'
import { TestQueryProvider } from '../../query/testUtils'
import { addItem, createAppStore, setUser } from '../../store'
import { CartPage } from './CartPage'

function renderCart(store = createAppStore()) {
  const router = createMemoryRouter(
    [
      { path: '/cart', element: <CartPage /> },
      { path: '/orders/:orderId', element: <div>Order placed</div> },
    ],
    { initialEntries: ['/cart'] },
  )

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

describe('cart checkout (D3-2)', () => {
  it('caps quantity at stock when the user types above max', async () => {
    const user = userEvent.setup()
    const store = createAppStore({
      cart: {
        items: [
          {
            productId: 'p-0001',
            name: 'Keyboards #1',
            price: 500,
            quantity: 1,
            stock: 2,
          },
        ],
      },
    })

    renderCart(store)

    const qty = screen.getByLabelText('Quantity for Keyboards #1')
    await user.clear(qty)
    await user.type(qty, '9')
    await user.tab()

    await waitFor(() => {
      expect(store.getState().cart.items[0]?.quantity).toBeLessThanOrEqual(2)
    })
  })

  it('names the out-of-stock item when checkout returns 409', async () => {
    const user = userEvent.setup()
    const store = createAppStore({
      cart: {
        items: [
          {
            productId: mockMeta.outOfStockProductId,
            name: 'Ducks #2',
            price: 200,
            quantity: 1,
            stock: 1,
          },
        ],
      },
    })

    const session = await login({
      email: 'dev@example.com',
      password: mockMeta.demoPassword,
    })
    store.dispatch(setUser(session.user))

    renderCart(store)

    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(await screen.findByText(/Ducks #2 is out of stock/i)).toBeInTheDocument()
  })

  it('does not create a duplicate order when the same idempotency key is retried', async () => {
    await login({ email: 'dev@example.com', password: mockMeta.demoPassword })

    const idempotencyKey = 'checkout-retry-same-key'
    const first = await createOrder({
      items: [{ productId: 'p-0001', quantity: 1 }],
      idempotencyKey,
    })
    const second = await createOrder({
      items: [{ productId: 'p-0001', quantity: 1 }],
      idempotencyKey,
    })

    expect(second.id).toBe(first.id)
  })

  it('adds items through the cart reducer without exceeding stock', () => {
    const store = createAppStore({ cart: { items: [] } })
    store.dispatch(
      addItem({
        productId: 'p-0001',
        name: 'Keyboards #1',
        price: 500,
        stock: 2,
        quantity: 5,
      }),
    )
    expect(store.getState().cart.items[0]?.quantity).toBe(2)
  })
})
