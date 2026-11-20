import type { ProductCategory, ProductQuery, ProductSort } from '../../api'
import { productCategorySchema, productSortSchema } from '../../api/schemas'

export type ProductListFilters = {
  search: string
  category?: ProductCategory
  sort?: ProductSort
  inStock: boolean
  page: number
}

const DEFAULT_FILTERS: ProductListFilters = {
  search: '',
  category: undefined,
  sort: undefined,
  inStock: false,
  page: 1,
}

export function parseProductFilters(params: URLSearchParams): ProductListFilters {
  const search = params.get('search')?.trim() ?? ''
  const categoryRaw = params.get('category')?.trim() ?? ''
  const sortRaw = params.get('sort')?.trim() ?? ''
  const inStock = params.get('inStock') === 'true'
  const pageRaw = Number(params.get('page') ?? '1')
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1

  const categoryParsed = productCategorySchema.safeParse(categoryRaw)
  const sortParsed = productSortSchema.safeParse(sortRaw)

  return {
    search,
    category: categoryParsed.success ? categoryParsed.data : undefined,
    sort: sortParsed.success ? sortParsed.data : undefined,
    inStock,
    page,
  }
}

/** Build URL search params. Omits defaults so copied links stay short. */
export function productFiltersToSearchParams(filters: ProductListFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search.trim()) {
    params.set('search', filters.search.trim())
  }
  if (filters.category) {
    params.set('category', filters.category)
  }
  if (filters.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.inStock) {
    params.set('inStock', 'true')
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page))
  }

  return params
}

export function toProductQuery(filters: ProductListFilters): ProductQuery {
  return {
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
    ...(filters.inStock ? { inStock: true } : {}),
    page: filters.page,
  }
}

export function clearProductFilters(): ProductListFilters {
  return { ...DEFAULT_FILTERS }
}

export function hasActiveProductFilters(filters: ProductListFilters): boolean {
  return Boolean(
    filters.search.trim() || filters.category || filters.sort || filters.inStock || filters.page > 1,
  )
}

export const PRODUCT_CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: 'keyboards', label: 'Keyboards' },
  { value: 'ducks', label: 'Ducks' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'stickers', label: 'Stickers' },
]

export const PRODUCT_SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'rating-desc', label: 'Rating: high to low' },
]
