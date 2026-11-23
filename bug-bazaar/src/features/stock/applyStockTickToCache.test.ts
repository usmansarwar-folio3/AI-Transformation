import { describe, expect, it } from 'vitest'
import type { Product, ProductList } from '../../api'
import { productKeys } from '../../query'
import { createTestQueryClient } from '../../query/createTestQueryClient'
import { applyStockTickToCache } from './applyStockTickToCache'

const product: Product = {
  id: 'p-0001',
  name: 'Harbor Tactile Keyboard',
  price: 1999,
  category: 'keyboards',
  stock: 5,
  rating: 4,
  imageUrl: '/products/keyboard-1.svg',
}

describe('applyStockTickToCache', () => {
  it('patches detail and list cache entries for the product', () => {
    const client = createTestQueryClient()
    client.setQueryData(productKeys.detail(product.id), product)
    client.setQueryData<ProductList>(productKeys.list({ page: 1 }), {
      items: [product, { ...product, id: 'p-0003', stock: 9 }],
      total: 2,
    })

    applyStockTickToCache(client, { productId: 'p-0001', stock: 17 })

    expect(client.getQueryData<Product>(productKeys.detail('p-0001'))?.stock).toBe(17)
    const list = client.getQueryData<ProductList>(productKeys.list({ page: 1 }))
    expect(list?.items[0]?.stock).toBe(17)
    expect(list?.items[1]?.stock).toBe(9)
  })
})
