import { useMemo } from 'react'
import { Col, Pagination, Row, Tag, Typography } from 'antd'
import { useSearchParams } from 'react-router-dom'
import type { ProductList, ProductQuery, RequestStatus } from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { useLiveStock } from '../stock'
import { requestStatusFromQuery, useProductsQuery } from '../../query'
import { ProductCard } from './ProductCard'
import {
  formatProductResultRange,
  parseProductFilters,
  PRODUCTS_PAGE_SIZE,
  productFiltersToSearchParams,
  toProductQuery,
  type ProductListFilters,
} from './productFilters'
import './product-list-page.scss'

const { Title, Paragraph, Text } = Typography

function readForceError(params: URLSearchParams): 500 | undefined {
  return params.get('forceError') === '500' ? 500 : undefined
}

function readSlow(params: URLSearchParams): boolean {
  return params.get('slow') === '1'
}

type ProductListResultsProps = {
  status: RequestStatus<ProductList>
  page: number
  onPageChange: (page: number) => void
  onRetry: () => void
}

function ProductListResults({
  status,
  page,
  onPageChange,
  onRetry,
}: ProductListResultsProps) {
  return (
    <AsyncStatusView
      status={status}
      loadingDescription="Loading products"
      emptyTitle="No products found"
      emptyDescription="Try clearing filters or searching for something else."
      isEmpty={(data) => data.items.length === 0}
      onRetry={onRetry}
    >
      {(data) => (
        <>
          {data.items.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={4}>
              <ProductCard product={product} />
            </Col>
          ))}
          {data.total > 0 ? (
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <Pagination
                className="product-list-page__pagination"
                current={page}
                pageSize={PRODUCTS_PAGE_SIZE}
                total={data.total}
                showSizeChanger={false}
                hideOnSinglePage={false}
                disabled={data.total === 0}
                aria-label="Product list pages"
                onChange={(nextPage) => {
                  onPageChange(nextPage)
                }}
              />
            </Col>
          ) : null}
        </>
      )}
    </AsyncStatusView>
  )
}

type ProductListBodyProps = {
  filters: ProductListFilters
  forceError: 500 | undefined
  slow: boolean
  onPageChange: (page: number) => void
}

function ProductListBody({ filters, forceError, slow, onPageChange }: ProductListBodyProps) {
  const query: ProductQuery = {
    ...toProductQuery(filters),
    ...(forceError ? { forceError } : {}),
    ...(slow ? { slow: true } : {}),
  }
  const productsQuery = useProductsQuery(query)
  const status = requestStatusFromQuery(productsQuery)
  const total = productsQuery.data?.total ?? null
  const liveIds = useMemo(
    () => productsQuery.data?.items.map((product) => product.id) ?? [],
    [productsQuery.data?.items],
  )
  const liveStatus = useLiveStock(liveIds)

  return (
    <>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Text className="product-list-page__count">
          {total === null
            ? 'Loading results…'
            : formatProductResultRange(filters.page, PRODUCTS_PAGE_SIZE, total)}
        </Text>
        <Tag
          className="product-list-page__live"
          color={liveStatus === 'open' ? 'success' : liveStatus === 'reconnecting' ? 'warning' : 'default'}
        >
          Live stock: {liveStatus}
        </Tag>
      </Col>

      <ProductListResults
        status={status}
        page={filters.page}
        onPageChange={onPageChange}
        onRetry={() => {
          void productsQuery.refetch()
        }}
      />
    </>
  )
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseProductFilters(searchParams)
  const forceError = readForceError(searchParams)
  const slow = readSlow(searchParams)

  function replaceFilters(next: ProductListFilters) {
    const params = productFiltersToSearchParams(next)
    if (forceError) {
      params.set('forceError', String(forceError))
    }
    if (slow) {
      params.set('slow', '1')
    }
    setSearchParams(params, { replace: false })
  }

  function handlePageChange(page: number) {
    replaceFilters({
      ...filters,
      page,
    })
  }

  return (
    <Row className="product-list-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="product-list-page__title">
          Products
        </Title>
        <Paragraph className="product-list-page__hint">
          Browse developer gear. Search and filters stay sticky at the top and sync to the URL.
          Demo error states live under Demo triggers in the left sidebar.
        </Paragraph>
      </Col>

      <ProductListBody
        filters={filters}
        forceError={forceError}
        slow={slow}
        onPageChange={handlePageChange}
      />
    </Row>
  )
}
