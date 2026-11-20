import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Typography } from 'antd'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Product } from '../../api'
import { ProductCard } from './ProductCard'

const sampleProduct: Product = {
  id: 'p-0001',
  name: 'Keyboards #1',
  price: 1999,
  category: 'keyboards',
  stock: 5,
  rating: 4.2,
  imageUrl: '/images/keyboards-1.png',
}

function LocationProbe() {
  const location = useLocation()
  return <Typography.Text data-testid="path">{location.pathname}</Typography.Text>
}

describe('ProductCard', () => {
  it('shows dollars from cents and opens details with Enter', async () => {
    const user = userEvent.setup()

    render(
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
          <Route path="/products/:productId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('$19.99')).toBeInTheDocument()
    expect(screen.getByText('5 in stock')).toBeInTheDocument()

    const card = screen.getByRole('link', { name: /Keyboards #1/i })
    card.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByTestId('path')).toHaveTextContent('/products/p-0001')
  })
})
