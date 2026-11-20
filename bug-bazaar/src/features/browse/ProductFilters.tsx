import { Button, Col, Input, Row, Select, Space, Switch, Typography } from 'antd'
import type { ProductCategory, ProductSort } from '../../api'
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  type ProductListFilters,
} from './productFilters'
import './product-filters.scss'

const { Text } = Typography

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
  return (
    <Row className="product-filters" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
        <Input.Search
          key={filters.search}
          className="product-filters__search"
          placeholder="Search products"
          allowClear
          enterButton="Search"
          defaultValue={filters.search}
          aria-label="Search products"
          onSearch={(value) => {
            onSearchCommit(value.trim())
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
          {total === null ? 'Loading results…' : `${total} result${total === 1 ? '' : 's'}`}
        </Text>
      </Col>
    </Row>
  )
}
