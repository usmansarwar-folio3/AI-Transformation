import { useEffect, useState } from 'react'
import { Col, Row, Spin, Typography } from 'antd'
import { getProducts, type Product } from '../../api'
import { ProductCard } from './ProductCard'
import './product-list-page.scss'

const { Title, Paragraph } = Typography

export function ProductListPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    void getProducts({ page: 1 }, controller.signal)
      .then((result) => {
        setProducts(result.items)
        setErrorMessage(null)
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }
        setProducts([])
        setErrorMessage('Could not load products.')
      })

    return () => {
      controller.abort()
    }
  }, [])

  const isLoading = products === null && errorMessage === null

  return (
    <Row className="product-list-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="product-list-page__title">
          Products
        </Title>
        <Paragraph className="product-list-page__hint">
          Browse developer gear. Use Tab to move between products, then Enter or Space to open
          details.
        </Paragraph>
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

      {products
        ? products.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={4}>
              <ProductCard product={product} />
            </Col>
          ))
        : null}
    </Row>
  )
}
