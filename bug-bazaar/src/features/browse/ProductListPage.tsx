import { useEffect, useState } from 'react'
import { Col, Row, Spin, Typography } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { getProducts, type Product } from '../../api'
import { ProductCard } from './ProductCard'
import { ProductFilters } from './ProductFilters'
import {
  clearProductFilters,
  hasActiveProductFilters,
  parseProductFilters,
  productFiltersToSearchParams,
  toProductQuery,
  type ProductListFilters,
} from './productFilters'
import './product-list-page.scss'

const { Title, Paragraph } = Typography

type ListSnapshot = {
  key: string
  items: Product[]
  total: number
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterKey = searchParams.toString()
  const filters = parseProductFilters(searchParams)

  const [snapshot, setSnapshot] = useState<ListSnapshot | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const requestKey = filterKey
    const query = toProductQuery(parseProductFilters(new URLSearchParams(requestKey)))

    void getProducts(query, controller.signal)
      .then((result) => {
        setSnapshot({
          key: requestKey,
          items: result.items,
          total: result.total,
        })
        setErrorMessage(null)
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }
        setSnapshot({ key: requestKey, items: [], total: 0 })
        setErrorMessage('Could not load products.')
      })

    return () => {
      controller.abort()
    }
  }, [filterKey])

  const isLoading = snapshot === null || snapshot.key !== filterKey
  const products = snapshot !== null && snapshot.key === filterKey ? snapshot.items : null
  const total = snapshot !== null && snapshot.key === filterKey ? snapshot.total : null

  function replaceFilters(next: ProductListFilters) {
    setSearchParams(productFiltersToSearchParams(next), { replace: false })
  }

  function patchFilters(patch: Partial<ProductListFilters>) {
    replaceFilters({
      ...filters,
      ...patch,
      page: 1,
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
      </Col>

      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <ProductFilters
          filters={filters}
          total={total}
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
          onClear={handleClear}
        />
      </Col>

      {isLoading ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Spin className="product-list-page__spin" description="Loading products" size="large" />
        </Col>
      ) : null}

      {errorMessage ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Paragraph type="danger">{errorMessage}</Paragraph>
        </Col>
      ) : null}

      {!isLoading && products && products.length === 0 && !errorMessage ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Paragraph className="product-list-page__empty">No products match these filters.</Paragraph>
        </Col>
      ) : null}

      {!isLoading && products
        ? products.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={4}>
              <ProductCard product={product} />
            </Col>
          ))
        : null}
    </Row>
  )
}
