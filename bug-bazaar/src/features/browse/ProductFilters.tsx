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
}: ProductFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search)
  const [syncedSearch, setSyncedSearch] = useState(filters.search)

  // Keep the draft aligned when the URL search changes externally (clear, Back/Forward).
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search)
    setSearchDraft(filters.search)
  }

  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    const next = debouncedSearch.trim()
    if (next === filters.search) {
      return
    }
    onSearchCommit(next)
  }, [debouncedSearch, filters.search, onSearchCommit])

  return (
    <Row className="product-filters" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
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

      <Col xs={24} sm={12} md={6} lg={4} xl={4} xxl={4}>
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

      <Col xs={24} sm={12} md={6} lg={5} xl={5} xxl={4}>
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

      <Col xs={24} sm={12} md={8} lg={4} xl={4} xxl={4}>
        <Space className="product-filters__stock" align="center">
          <Switch
            checked={filters.inStock}
            aria-label="Show in-stock products only"
            onChange={onInStockChange}
          />
          <Text className="product-filters__stock-label">In stock only</Text>
        </Space>
      </Col>

      <Col xs={24} sm={12} md={8} lg={3} xl={3} xxl={3}>
        <Button
          className="product-filters__clear"
          disabled={!canClear}
          onClick={onClear}
        >
          Clear filters
        </Button>
      </Col>

      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Text className="product-filters__count">
          {total === null
            ? 'Loading results…'
            : formatProductResultRange(filters.page, PRODUCTS_PAGE_SIZE, total)}
        </Text>
      </Col>
    </Row>
  )
}
