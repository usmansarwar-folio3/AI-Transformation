import { useEffect, useState } from 'react'
import { Button, Col, Input, Row, Select, Space, Switch, Typography } from 'antd'
import type { ProductCategory, ProductSort } from '../../api'
import { useDebouncedValue } from '../../hooks'
import {
  formatProductResultRange,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCTS_PAGE_SIZE,
  PRODUCT_SORT_OPTIONS,
  type ProductListFilters,
} from './productFilters'
import './product-filters.scss'

const { Text } = Typography

/** Delay before typing commits search to the URL (D2-5). Enter/Search still commits immediately. */
const SEARCH_DEBOUNCE_MS = 300

type ProductFiltersProps = {
  filters: ProductListFilters
  total: number | null
  onSearchCommit: (search: string) => void
  onCategoryChange: (category: ProductCategory | undefined) => void
  onSortChange: (sort: ProductSort | undefined) => void
  onInStockChange: (inStock: boolean) => void
  onClear: () => void
  canClear: boolean
  /** Stack controls for the left sider; default is the wide list toolbar. */
  layout?: 'horizontal' | 'vertical'
  /** Hide the result-count line (sidebar leaves count to the list page). */
  hideCount?: boolean
}

export function ProductFilters({
  filters,
  total,
  onSearchCommit,
  onCategoryChange,
  onSortChange,
  onInStockChange,
  onClear,
  canClear,
  layout = 'horizontal',
  hideCount = false,
}: ProductFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search)
  const [syncedSearch, setSyncedSearch] = useState(filters.search)
  const isVertical = layout === 'vertical'
  const fieldSpan = isVertical
    ? { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 }
    : undefined

  // Keep the draft aligned when the URL search changes externally (clear, Back/Forward).
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search)
    setSearchDraft(filters.search)
  }

  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    // Only commit after the draft has settled. Otherwise a stale debounced value
    // (e.g. "") can overwrite a newer URL search from Back/Forward or a fast commit.
    if (debouncedSearch !== searchDraft) {
      return
    }
    const next = debouncedSearch.trim()
    if (next === filters.search) {
      return
    }
    onSearchCommit(next)
  }, [debouncedSearch, searchDraft, filters.search, onSearchCommit])

  return (
    <Row
      className={
        isVertical ? 'product-filters product-filters--vertical' : 'product-filters'
      }
      gutter={[16, 16]}
    >
      <Col
        xs={fieldSpan?.xs ?? 24}
        sm={fieldSpan?.sm ?? 24}
        md={fieldSpan?.md ?? 12}
        lg={fieldSpan?.lg ?? 8}
        xl={fieldSpan?.xl ?? 8}
        xxl={fieldSpan?.xxl ?? 6}
      >
        <Input.Search
          className="product-filters__search"
          placeholder="Search products"
          allowClear
          enterButton="Search"
          value={searchDraft}
          aria-label="Search products"
          onChange={(event) => {
            setSearchDraft(event.target.value)
          }}
          onSearch={(value) => {
            const next = value.trim()
            setSearchDraft(next)
            onSearchCommit(next)
          }}
        />
      </Col>

      <Col
        xs={fieldSpan?.xs ?? 24}
        sm={fieldSpan?.sm ?? 12}
        md={fieldSpan?.md ?? 6}
        lg={fieldSpan?.lg ?? 4}
        xl={fieldSpan?.xl ?? 4}
        xxl={fieldSpan?.xxl ?? 4}
      >
        <Select
          className="product-filters__select"
          placeholder="Category"
          allowClear
          value={filters.category}
          options={PRODUCT_CATEGORY_OPTIONS}
          aria-label="Filter by category"
          onChange={(value) => {
            onCategoryChange(value)
          }}
        />
      </Col>

      <Col
        xs={fieldSpan?.xs ?? 24}
        sm={fieldSpan?.sm ?? 12}
        md={fieldSpan?.md ?? 6}
        lg={fieldSpan?.lg ?? 5}
        xl={fieldSpan?.xl ?? 5}
        xxl={fieldSpan?.xxl ?? 4}
      >
        <Select
          className="product-filters__select"
          placeholder="Sort by"
          allowClear
          value={filters.sort}
          options={PRODUCT_SORT_OPTIONS}
          aria-label="Sort products"
          onChange={(value) => {
            onSortChange(value)
          }}
        />
      </Col>

      <Col
        xs={fieldSpan?.xs ?? 24}
        sm={fieldSpan?.sm ?? 12}
        md={fieldSpan?.md ?? 8}
        lg={fieldSpan?.lg ?? 4}
        xl={fieldSpan?.xl ?? 4}
        xxl={fieldSpan?.xxl ?? 4}
      >
        <Space className="product-filters__stock" align="center">
          <Switch
            checked={filters.inStock}
            aria-label="Show in-stock products only"
            onChange={onInStockChange}
          />
          <Text className="product-filters__stock-label">In stock only</Text>
        </Space>
      </Col>

      <Col
        xs={fieldSpan?.xs ?? 24}
        sm={fieldSpan?.sm ?? 12}
        md={fieldSpan?.md ?? 8}
        lg={fieldSpan?.lg ?? 3}
        xl={fieldSpan?.xl ?? 3}
        xxl={fieldSpan?.xxl ?? 3}
      >
        <Button className="product-filters__clear" disabled={!canClear} onClick={onClear}>
          Clear filters
        </Button>
      </Col>

      {hideCount ? null : (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Text className="product-filters__count">
            {total === null
              ? 'Loading results…'
              : formatProductResultRange(filters.page, PRODUCTS_PAGE_SIZE, total)}
          </Text>
        </Col>
      )}
    </Row>
  )
}
