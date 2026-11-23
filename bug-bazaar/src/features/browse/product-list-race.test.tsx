import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, ProductList, ProductQuery } from '../../api'
import { TestQueryProvider } from '../../query/testUtils'
import { ProductListPage } from './ProductListPage'

const getProducts = vi.hoisted(() => vi.fn())

vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api')>()
  return {
    ...actual,
    getProducts: (query?: ProductQuery, signal?: AbortSignal): Promise<ProductList> =>
      getProducts(query, signal) as Promise<ProductList>,
  }
})

function makeProduct(id: string, name: string): Product {
  return {
    id,
    name,
    price: 1000,
    category: 'keyboard',
    stock: 3,
    rating: 4,
    imageUrl: 'https://placehold.co/400x300/png?text=test',
  }
}

function listOf(products: Product[]): ProductList {
  return { items: products, total: products.length }
}

type PendingCall = {
  query: ProductQuery
  signal: AbortSignal | undefined
  resolve: (value: ProductList) => void
}

describe('product list search races (D2-6)', () => {
  const pending: PendingCall[] = []

  beforeEach(() => {
    pending.length = 0
    getProducts.mockReset()
    getProducts.mockImplementation((query: ProductQuery = {}, signal?: AbortSignal) => {
      return new Promise<ProductList>((resolve) => {
        pending.push({ query, signal, resolve })
      })
    })
  })

  afterEach(() => {
    cleanup()
  })

  function lastCallFor(search: string): PendingCall {
    const match = [...pending].reverse().find((call) => (call.query.search ?? '') === search)
    if (!match) {
      throw new Error(
        `No pending getProducts call for search="${search}". Pending: ${JSON.stringify(
          pending.map((call) => call.query.search ?? ''),
        )}`,
      )
    }
    return match
  }

  function renderList(initialUrl = '/') {
    const router = createMemoryRouter(
      [{ path: '/', element: <ProductListPage /> }],
      { initialEntries: [initialUrl] },
    )

    render(
      <TestQueryProvider>
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </TestQueryProvider>,
    )

    return router
  }

  it('keeps the latest search results when an older response finishes later', async () => {
    const router = renderList('/')

    await waitFor(() => expect(pending.length).toBeGreaterThan(0))
    lastCallFor('').resolve(listOf([makeProduct('p-0001', 'Initial Widget')]))
    expect(await screen.findByText('Initial Widget')).toBeInTheDocument()

    // Simulate debounced URL commits from live search (D2-5 → D2-6).
    await act(async () => {
      await router.navigate('/?search=a')
    })
    await waitFor(() => expect(lastCallFor('a')).toBeTruthy())

    await act(async () => {
      await router.navigate('/?search=ab')
    })
    await waitFor(() => expect(lastCallFor('ab')).toBeTruthy())

    const older = lastCallFor('a')
    const newer = lastCallFor('ab')
    expect(older.signal?.aborted).toBe(true)

    newer.resolve(listOf([makeProduct('p-new', 'Latest Widget')]))
    expect(await screen.findByText('Latest Widget')).toBeInTheDocument()

    // Late stale completion must not replace the latest UI (abort + request-id guards).
    older.resolve(listOf([makeProduct('p-old', 'Stale Widget')]))

    await waitFor(() => {
      expect(screen.getByText('Latest Widget')).toBeInTheDocument()
    })
    expect(screen.queryByText('Stale Widget')).not.toBeInTheDocument()
  })

  it('aborts the in-flight list request when search changes', async () => {
    const router = renderList('/')

    await waitFor(() => expect(pending.length).toBeGreaterThan(0))
    const firstSignal = pending[0]?.signal
    expect(firstSignal).toBeDefined()
    expect(firstSignal?.aborted).toBe(false)

    await act(async () => {
      await router.navigate('/?search=cable')
    })
    await waitFor(() => expect(lastCallFor('cable')).toBeTruthy())

    expect(firstSignal?.aborted).toBe(true)

    lastCallFor('cable').resolve(listOf([makeProduct('p-cable', 'Result cable')]))
    expect(await screen.findByText('Result cable')).toBeInTheDocument()
  })
})
