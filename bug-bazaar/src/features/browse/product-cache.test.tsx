import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, ProductList, ProductQuery } from '../../api'
import { productKeys } from '../../query'
import { createTestQueryClient } from '../../query/createTestQueryClient'
import { TestQueryProvider } from '../../query/testUtils'
import { addItem, createAppStore, setUser } from '../../store'
import { CartPage } from '../cart/CartPage'

const getProducts = vi.hoisted(() => vi.fn())
const createOrder = vi.hoisted(() => vi.fn())

vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api')>()
  return {
    ...actual,
    getProducts: (query?: ProductQuery, signal?: AbortSignal): Promise<ProductList> =>
      getProducts(query, signal) as Promise<ProductList>,
    createOrder: (...args: unknown[]) => createOrder(...args) as Promise<unknown>,
    getAuthToken: () => 'test-token',
  }
})

function makeProduct(id: string, name: string, stock = 5): Product {
  return {
    id,
    name,
    price: 1000,
    category: 'keyboards',
    stock,
    rating: 4,
    imageUrl: '/products/keyboard-1.svg',
  }
}

function listOf(products: Product[]): ProductList {
  return { items: products, total: products.length }
}

describe('product caching (D3-5)', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    getProducts.mockReset()
    createOrder.mockReset()
    getProducts.mockResolvedValue(listOf([makeProduct('p-0001', 'Cached Widget')]))
    createOrder.mockResolvedValue({
      id: 'ord-1',
      status: 'queued',
    })
  })

  it('reuses cached list data when the same query is read again within staleTime', async () => {
    const queryClient = createTestQueryClient()
    const query: ProductQuery = { page: 1 }

    async function fetchList(): Promise<ProductList> {
      return queryClient.fetchQuery({
        queryKey: productKeys.list(query),
        queryFn: ({ signal }) => getProducts(query, signal) as Promise<ProductList>,
      })
    }

    await fetchList()
    expect(getProducts).toHaveBeenCalledTimes(1)

    await fetchList()
    expect(getProducts).toHaveBeenCalledTimes(1)
  })

  it('refetches product queries after a successful order invalidates the catalog', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    const query: ProductQuery = { page: 1 }

    async function fetchList(): Promise<ProductList> {
      return queryClient.fetchQuery({
        queryKey: productKeys.list(query),
        queryFn: ({ signal }) => getProducts(query, signal) as Promise<ProductList>,
      })
    }

    await fetchList()
    expect(getProducts).toHaveBeenCalledTimes(1)

    const store = createAppStore()
    store.dispatch(
      setUser({
        id: 'u-1',
        name: 'Shopper',
        email: 'shopper@example.com',
      }),
    )
    store.dispatch(
      addItem({
        productId: 'p-0001',
        name: 'Cached Widget',
        price: 1000,
        stock: 5,
        quantity: 1,
      }),
    )

    const router = createMemoryRouter(
      [
        { path: '/cart', element: <CartPage /> },
        { path: '/orders/:orderId', element: <div>Order placed</div> },
      ],
      { initialEntries: ['/cart'] },
    )

    render(
      <Provider store={store}>
        <TestQueryProvider client={queryClient}>
          <ConfigProvider>
            <RouterProvider router={router} />
          </ConfigProvider>
        </TestQueryProvider>
      </Provider>,
    )

    await user.click(screen.getByRole('button', { name: /^checkout$/i }))
    expect(await screen.findByText('Order placed')).toBeInTheDocument()
    expect(createOrder).toHaveBeenCalled()

    await waitFor(() => {
      expect(queryClient.getQueryState(productKeys.list(query))?.isInvalidated).toBe(true)
    })

    await fetchList()
    expect(getProducts.mock.calls.length).toBeGreaterThan(1)
  })
})
