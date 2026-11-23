import { useCallback } from 'react'
import { Col, Row } from 'antd'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ProductFilters } from './ProductFilters'
import {
  clearProductFilters,
  hasActiveProductFilters,
  parseProductFilters,
  productFiltersToSearchParams,
  type ProductListFilters,
} from './productFilters'
import './sticky-product-filters.scss'

/**
 * Sticky filter bar on the shop page. URL search params remain the source of truth.
 */
export function StickyProductFilters() {
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
    <Row className="sticky-product-filters" gutter={[0, 0]} aria-label="Product filters">
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <ProductFilters
          layout="horizontal"
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
      </Col>
    </Row>
  )
}
