import type { Product } from '../api/schemas'
import { productCategorySchema } from '../api/schemas'

export const PRODUCT_COUNT = 5000
export const PRODUCTS_PAGE_SIZE = 20

const CATEGORIES = productCategorySchema.options

/**
 * Deterministic catalog of 5,000 products.
 * `p-0002` always has stock 0 so checkout can trigger 409 on purpose.
 */
export function createProductCatalog(): Product[] {
  const products: Product[] = Array.from({ length: PRODUCT_COUNT }, (_, index) => {
    const n = index + 1
    const category = CATEGORIES[index % CATEGORIES.length]!
    const isOutOfStock = n === 2

    return {
      id: `p-${String(n).padStart(4, '0')}`,
      name: `${titleCase(category)} #${n}`,
      price: 199 + (n % 400) * 25,
      category,
      stock: isOutOfStock ? 0 : (n % 40) + 1,
      rating: Number(((n % 50) / 10).toFixed(1)),
      imageUrl: `/images/${category}-${(n % 10) + 1}.png`,
    }
  })

  return products
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const productCatalog = createProductCatalog()
