import { useEffect, useState } from 'react'
import { Col, Pagination, Row, Typography } from 'antd'
import { useSearchParams } from 'react-router-dom'
import {
  ApiClientError,
  failure,
  getProducts,
  isSuccess,
  loading,
  success,
  type ProductList,
  type RequestStatus,
} from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { ProductCard } from './ProductCard'
import { ProductFilters } from './ProductFilters'
import {
  clearProductFilters,
  hasActiveProductFilters,
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

type ProductListBodyProps = {
  filterKey: string
  filters: ProductListFilters
  forceError: 500 | undefined
  canClear: boolean
  onSearchCommit: (search: string) => void
  onCategoryChange: (category: ProductListFilters['category']) => void
  onSortChange: (sort: ProductListFilters['sort']) => void
  onInStockChange: (inStock: boolean) => void
  onPageChange: (page: number) => void
  onClear: () => void
}

function ProductListBody({
  filterKey,
  filters,
  forceError,
  canClear,
  onSearchCommit,
  onCategoryChange,
  onSortChange,
  onInStockChange,
  onPageChange,
  onClear,
}: ProductListBodyProps) {
  const [status, setStatus] = useState<RequestStatus<ProductList>>(loading())
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    void getProducts(
      {
        ...toProductQuery(filters),
        ...(forceError ? { forceError } : {}),
      },
      controller.signal,
    )
      .then((result) => {
        setStatus(success(result))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        if (error instanceof ApiClientError) {
          setStatus(failure(error.toRequestError()))
          return
        }
        setStatus(
          failure({
            httpStatus: 0,
            code: 'UNKNOWN',
            message: 'Could not load products.',
          }),
        )
      })

    return () => {
      controller.abort()
    }
  }, [filterKey, filters, forceError, retryCount])

  function handleRetry() {
    setStatus(loading())
    setRetryCount((count) => count + 1)
  }

  const total = isSuccess(status) ? status.data.total : null

  return (
    <>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <ProductFilters
          filters={filters}
          total={total}
          canClear={canClear}
          onSearchCommit={onSearchCommit}
          onCategoryChange={onCategoryChange}
          onSortChange={onSortChange}
          onInStockChange={onInStockChange}
          onClear={onClear}
        />
      </Col>

      <AsyncStatusView
        status={status}
        loadingDescription="Loading products"
        emptyTitle="No products found"
        emptyDescription="Try clearing filters or searching for something else."
        isEmpty={(data) => data.items.length === 0}
        onRetry={handleRetry}
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
                  current={filters.page}
                  pageSize={PRODUCTS_PAGE_SIZE}
                  total={data.total}
                  showSizeChanger={false}
                  hideOnSinglePage={false}
                  disabled={data.total === 0}
                  aria-label="Product list pages"
                  onChange={(page) => {
                    onPageChange(page)
                  }}
                />
              </Col>
            ) : null}
          </>
        )}
      </AsyncStatusView>
    </>
  )
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterKey = searchParams.toString()
  const filters = parseProductFilters(searchParams)
  const forceError = readForceError(searchParams)

  function replaceFilters(next: ProductListFilters) {
    const params = productFiltersToSearchParams(next)
    if (forceError) {
      params.set('forceError', String(forceError))
    }
    setSearchParams(params, { replace: false })
  }

  function patchFilters(patch: Partial<ProductListFilters>) {
    replaceFilters({
      ...filters,
      ...patch,
      page: 1,
    })
  }

  function handlePageChange(page: number) {
    replaceFilters({
      ...filters,
      page,
    })
  }

  function handleClear() {
    setSearchParams(productFiltersToSearchParams(clearProductFilters()), { replace: false })
  }

  return (
    <Row className="product-list-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="product-list-page__title">
          Products
        </Title>
        <Paragraph className="product-list-page__hint">
          Browse developer gear. Filters sync to the URL so refresh, copy-link, and Back work.
        </Paragraph>
        <Paragraph className="product-list-page__hint">
          Trigger states: <Text code>search=__none__</Text> (empty),{' '}
          <Text code>forceError=500</Text> (list error), <Text code>/products/missing</Text>{' '}
          (details error).
        </Paragraph>
      </Col>

      <ProductListBody
        key={`${filterKey}::${forceError ?? ''}`}
        filterKey={filterKey}
        filters={filters}
        forceError={forceError}
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
        onPageChange={handlePageChange}
        onClear={handleClear}
      />
    </Row>
  )
}
