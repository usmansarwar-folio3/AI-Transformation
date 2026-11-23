import type { QueryClient } from '@tanstack/react-query'
import type { Product, ProductList } from '../../api'
import { productKeys } from '../../query'
import type { StockTick } from './stockTick'

/** Patch detail + every cached product list that contains the product. */
export function applyStockTickToCache(queryClient: QueryClient, tick: StockTick): void {
  queryClient.setQueryData<Product>(productKeys.detail(tick.productId), (current) => {
    if (!current) {
      return current
    }
    return { ...current, stock: tick.stock }
  })

  queryClient.setQueriesData<ProductList>({ queryKey: productKeys.lists() }, (current) => {
    if (!current) {
      return current
    }

    let changed = false
    const items = current.items.map((product) => {
      if (product.id !== tick.productId) {
        return product
      }
      changed = true
      return { ...product, stock: tick.stock }
    })

    return changed ? { ...current, items } : current
  })
}
