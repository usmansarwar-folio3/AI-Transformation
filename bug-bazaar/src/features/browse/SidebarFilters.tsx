import { useCallback } from 'react'
import { Typography } from 'antd'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ProductFilters } from './ProductFilters'
import {
  clearProductFilters,
  hasActiveProductFilters,
  parseProductFilters,
  productFiltersToSearchParams,
  type ProductListFilters,
} from './productFilters'
import './sidebar-filters.scss'

const { Title } = Typography

/**
 * Sidebar filter chrome. URL search params remain the source of truth.
 * Changing filters from any route navigates to `/` with those params.
 */
export function SidebarFilters() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const filters = parseProductFilters(searchParams)

  const applyFilters = useCallback(
    (next: ProductListFilters) => {
      const params = productFiltersToSearchParams(next)
      const search = params.toString()
      const target = search ? `/?${search}` : '/'

      if (location.pathname === '/') {
        void navigate(target, { replace: false })
        return
      }

      void navigate(target)
    },
    [location.pathname, navigate],
  )

  function patchFilters(patch: Partial<ProductListFilters>) {
    applyFilters({
      ...filters,
      ...patch,
      page: 1,
    })
  }

  return (
    <aside className="sidebar-filters">
      <Title level={5} className="sidebar-filters__title">
        Filters
      </Title>
      <ProductFilters
        layout="vertical"
        hideCount
        filters={filters}
        total={null}
        canClear={hasActiveProductFilters(filters)}
        onSearchCommit={(search) => {
          patchFilters({ search })
        }}
        onCategoryChange={(category) => {
          patchFilters({ category })
        }}
        onSortChange={(sort) => {
          patchFilters({ sort })
        }}
        onInStockChange={(inStock) => {
          patchFilters({ inStock })
        }}
        onClear={() => {
          applyFilters(clearProductFilters())
        }}
      />
    </aside>
  )
}
