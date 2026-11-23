import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Typography } from 'antd'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../api'
import { createAppStore, selectCartItemCount } from '../../store'
import { ProductCard } from './ProductCard'

const sampleProduct: Product = {
  id: 'p-0001',
  name: 'Harbor Tactile Keyboard',
  price: 1999,
  category: 'keyboards',
  stock: 5,
  rating: 4.2,
  imageUrl: '/products/keyboard-1.svg',
}

const navigateMock = vi.fn()
const messageSuccessMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

// Ant Design `message` schedules work that can run after jsdom teardown → "window is not defined".
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>()
  return {
    ...actual,
    message: {
      ...actual.message,
      success: messageSuccessMock,
    },
  }
})

function LocationProbe() {
  const location = useLocation()
  return <Typography.Text data-testid="path">{location.pathname}</Typography.Text>
}

afterEach(() => {
  cleanup()
  navigateMock.mockReset()
  messageSuccessMock.mockReset()
})

describe('ProductCard', () => {
  it('shows dollars from cents and opens details with Enter', async () => {
    const user = userEvent.setup()
    const store = createAppStore()

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <ProductCard product={sampleProduct} />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('$19.99')).toBeInTheDocument()
    expect(screen.getByText('5 in stock')).toBeInTheDocument()

    const details = screen.getByRole('link', { name: /Harbor Tactile Keyboard/i })
    details.focus()
    await user.keyboard('{Enter}')

    expect(navigateMock).toHaveBeenCalledWith('/products/p-0001')
  })

  it('adds the product to the cart without navigating', async () => {
    const user = userEvent.setup()
    const store = createAppStore()

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <ProductCard product={sampleProduct} />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(selectCartItemCount(store.getState())).toBe(1)
    expect(navigateMock).not.toHaveBeenCalled()
    expect(messageSuccessMock).toHaveBeenCalled()
  })
})
